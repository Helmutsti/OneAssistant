// `guarda`: lo schermo, detto all'AI engine.
//
// È la mossa che tiene board e interfaccia sotto controllo, e l'AI engine **se la chiede**
// (17 settembre 2026). Non gli arriva addosso a ogni frase: la chiede lui, come prima
// mossa del turno, perché una fotografia che non ha chiesto è una fotografia che non sa
// di quando è.
//
// Tre regole su cosa ci sta dentro:
//
//   - **c'è tutto quello che si vede, e solo quello.** Se una cosa è a schermo, il
//     AI engine la legge qui; se non si vede, non è qui. La vista non è una scorciatoia
//     per guardare dentro il sistema — è lo stesso schermo, in parole;
//   - **gli id si dicono.** Sono l'unica cosa in questa vista che non è dicibile, e
//     servono a questo: una mossa ha bisogno di sapere su cosa;
//   - **niente percorsi.** L'archivio non si mostra (docs/07-memoria §9): quello che
//     l'AI engine può sapere della memoria passa da `ricorda`, e sono contenuti.

import type { Motore } from '../modello/motore.ts';
import type { Orologio } from '../modello/tempo.ts';
import { fraQuanto, orario } from '../modello/motore.ts';
import { colore, dentroSiVede, type Luogo, type Task } from '../modello/tipi.ts';
import { contesto } from '../conoscenza/contesto.ts';

/** Dove sta cosa, e come si chiama l'area che lo tiene (docs/01-modello §2). */
const AREE: ReadonlyArray<readonly [Luogo, string]> = [
  ['MAIN', 'MAIN — al centro, la cosa di cui si sta parlando'],
  ['APERTO', 'APERTO — la bolla allargata, che mostra quello che tiene'],
  ['CARTA', 'NOTIFICATIONBAR — le carte arrivate, in pila'],
  ['ORARIO', 'NOTIFICATIONBAR — quelle che hanno un\'ora, più tardi'],
  ['CHIP', 'TASKBAR — quello che ha in mano'],
  ['MEMORIA', 'MEMORIA — non si vede: cadute qui perché concluse o consegnate'],
];

function unTask(t: Task, o: Orologio, fuoco: string | undefined): string {
  const pezzi = [
    `  ${t.id}`,
    `«${t.nome}»`,
    `${t.avanzamento} (${colore(t.avanzamento)})`,
  ];
  if (t.id === fuoco) pezzi.push('· A FUOCO');
  if (t.gruppo) pezzi.push(`· gruppo ${t.gruppo}`);
  if (t.forma) pezzi.push(`· ${t.forma}`);
  if (t.ora) pezzi.push(`· ${orario(t.ora)}, fra ${fraQuanto(t.ora.getTime() - o.adesso().getTime())}`);
  if (t.dato) pezzi.push(`· ${t.dato}`);
  if (t.uscita) {
    pezzi.push(`· uscirebbe verso ${t.uscita.destinazione}, a ${t.uscita.a}`);
  }
  const righe = [pezzi.join(' ')];
  const dentro = dentroSiVede(t);
  if (dentro) righe.push(`      ${dentro}`);
  // Un ingresso lungo non si mette per intero: c'è, e si legge con `riassumi`.
  if (t.ingresso && t.ingresso !== dentro) {
    righe.push(`      (ha un ingresso da leggere, ${t.ingresso.length} caratteri)`);
  }
  if (t.alternative?.length) {
    righe.push(`      aspetta che tu dica quale: ${t.alternative.join(' o ')}`);
  }
  if (t.frasi.length) {
    righe.push(`      può dire: ${t.frasi.map((f) => `«${f.testo}»`).join(' · ')}`);
  }
  return righe.join('\n');
}

/**
 * La fotografia. Testo e non JSON: si legge con meno token, e quando qualcosa non torna
 * si guarda con gli occhi invece di aprire un visualizzatore.
 */
export function guarda(m: Motore, o: Orologio): string {
  const adesso = o.adesso();
  const fuoco = m.aFuoco()?.id;
  const righe: string[] = [];

  righe.push(`Adesso sono le ${orario(adesso)} di ${giorno(adesso)}.`);
  righe.push(`Chi lo usa: ${contesto.utilizzatore}${contesto.dove ? `, ${contesto.dove}` : ''}.`);
  if (contesto.ascoltatore.chi !== 'tu') {
    righe.push(`Attenzione: chi sta parlando non è lui (${contesto.ascoltatore.chi}).`);
  }
  righe.push('');

  // ─── lo schermo, area per area ─────────────────────────────────────────
  let vuoto = true;
  for (const [luogo, titolo] of AREE) {
    const dentro = m.in(luogo);
    if (!dentro.length) continue;
    vuoto = false;
    righe.push(titolo);
    for (const t of dentro) righe.push(unTask(t, o, fuoco));
    righe.push('');
  }
  if (vuoto) righe.push('Lo schermo è vuoto: non c\'è nessun task.', '');

  // ─── i gruppi ───────────────────────────────────────────────────────────
  const gruppi = m.gruppi();
  if (gruppi.length) {
    const aperto = m.gruppoAperto()?.nome;
    righe.push('GRUPPI');
    for (const g of gruppi) {
      righe.push(
        `  ${g.nome}${g.nome === aperto ? ' (aperto)' : ''} — ${g.membri.length}: ` +
          `${g.membri.map((t) => t.id).join(', ')} · parla ${g.parla.id} (${g.parla.avanzamento})`,
      );
    }
    righe.push('');
  }

  // ─── il cassetto ────────────────────────────────────────────────────────
  // Nella seconda versione della NOTIFICATIONBAR quello che arriva **non è un task**
  // finché lui non dice «me ne occupo» (docs/06-confini §3): sta qui, e non pesa.
  if (m.conCassetto) {
    righe.push(
      `CASSETTO ${m.cassettoAperto() ? '(aperto)' : '(chiuso)'} — ` +
        `${m.notifiche.length} dentro, ${m.daVedere()} da vedere`,
    );
    for (const n of m.notifiche) {
      righe.push(
        `  ${n.id} «${n.nome}» ${n.chiede ? 'chiede qualcosa' : 'muta'}` +
          `${n.nuova ? ' · nuova' : ''}${n.fonte ? ` · da ${n.fonte}` : ''}`,
      );
      righe.push(`      ${n.testo}`);
    }
    righe.push('');
  }

  // ─── lo scambio ─────────────────────────────────────────────────────────
  // Quello che è **a schermo**, non quello che lui si ricorda: la coda della
  // conversazione, che dopo trenta secondi non ha più niente da mostrare
  // (docs/05-interfaccia §1). La memoria della giornata gli arriva già come discorso
  // (src/ai-engine/ai-engine.ts), e ripeterla qui sarebbe dirla due volte — una come fatto
  // dello schermo e una come conversazione. Sono due cose diverse, ed è la regola:
  // **ricordare la conversazione non è ricordare lo schermo.**
  const visibile = m.scambioVisibile();
  if (visibile.length) {
    righe.push(`SCAMBIO A SCHERMO ${m.conversazioneAperta() ? '(aperto)' : '(chiuso)'}`);
    for (const s of visibile) {
      if (s.tua) righe.push(`  lui: ${s.tua}`);
      if (s.risposta) righe.push(`  tu:  ${s.risposta}`);
    }
    righe.push('');
  }

  const frasi = m.frasiCorrenti();
  if (frasi.length) {
    righe.push(`Le frasi offerte adesso: ${frasi.map((f) => `«${f.testo}»`).join(' · ')}`);
  }
  if (m.domandaInSospeso()) {
    righe.push('C\'è una domanda tua in sospeso: sta aspettando che dica quale.');
  }

  return righe.join('\n').trim();
}

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

function giorno(d: Date): string {
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
}
