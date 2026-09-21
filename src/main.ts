// Il cablaggio. Qui non si decide niente: si mettono in fila i pezzi.
//
//   servizi (finti) ──▶ filtro ──▶ MOTORE ──▶ disegno
//                                    ▲            │
//              scrittura ──▶ AI ENGINE ─┘            └──▶ voce (canale parallelo)
//
// Dal 17 settembre 2026 in mezzo non c'è più niente: la freccia che entrava nel motore
// partiva dal locale, e adesso parte dall'AI engine. Una frase non viene più *intesa* qui e
// *pensata* là — viene pensata, e basta (docs/04-metalinguaggio §2).

import './stile/base.css';
import '../docs/design/temi.css';
import { Orologio } from './modello/tempo.ts';
import { Motore } from './modello/motore.ts';
import { Posta } from './confini/posta.ts';
import type { Sorgente } from './confini/servizio.ts';
import type { Tipo } from './modello/tipi.ts';
import { Note } from './confini/note.ts';
import { Contatti } from './confini/contatti.ts';
import { Calendario } from './confini/calendario.ts';
import { Promemoria } from './confini/promemoria.ts';
import { Disco } from './confini/disco.ts';
import { Archivio } from './archivio/archivio.ts';
import { contesto } from './conoscenza/contesto.ts';
import { caricaProfilo, codiceLingua, utenteInCorso } from './conoscenza/profilo.ts';
import { applicaTema } from './stile/tema.ts';
import { comeIlProfilo, legge, modo } from './conoscenza/canali.ts';
import { AiEngineFinto } from './ai-engine/finto.ts';
import { Porta, turno, quandoPensa } from './ai-engine/ai-engine.ts';
import { SecondarioFinto, lavora } from './ai-engine/secondari.ts';
import { guarda } from './ai-engine/vista.ts';
import { Lettura } from './voce/lettura.ts';
import { Campanello } from './voce/suono.ts';
import { disegna, ridimensiona } from './aree/schermo.ts';
import { Pedana, type Fonte } from './prova/pedana.ts';
import { ALFABETO, prova } from './prova/alfabeto.ts';
import { CONDIZIONI, porta, type Chiave } from './prova/stato.ts';
import { Scia } from './prova/scia.ts';
import { flussi } from './prova/flussi.ts';

const radice = document.querySelector<HTMLElement>('#palco');
if (!radice) throw new Error('manca il palco');

// Il palco è la finestra (16 settembre 2026). Prima era il contrario — una tela di
// 1440 × 900 scalata dentro — e su uno schermo 16:9 restavano due fasce scure ai lati.
//
// Sopra la tela minima il palco prende la misura vera della finestra e le aree si
// ancorano ai bordi: su 1920 × 1080 è 1:1, niente fasce. Sotto, si rimpicciolisce
// invece di stringersi, perché le misure dei componenti non scendono con lei: le bolle
// restano larghe 388 e INPUT 620, e sotto una certa tela non ci starebbero più. In
// tutti e due i casi il palco riempie la finestra esatta: `larghezza × scala` è sempre
// `innerWidth`.
const TELA_MINIMA = { larghezza: 1440, altezza: 900 };

function misura(): void {
  const scala = Math.min(
    1,
    window.innerWidth / TELA_MINIMA.larghezza,
    window.innerHeight / TELA_MINIMA.altezza,
  );
  radice!.style.width = `${window.innerWidth / scala}px`;
  radice!.style.height = `${window.innerHeight / scala}px`;
  document.documentElement.style.setProperty('--scala', String(scala));
  ridimensiona(radice!);
}
misura();
window.addEventListener('resize', misura);

// Lunedì 15 settembre, 09:41. Il tempo scorre come il vero: niente parte da solo, e
// quando serve saltare avanti lo si fa a mano dalla pedana.
// **L'ora vera** (17 settembre 2026). Prima partiva dalle 09:41 del 15 settembre 2025
// — l'ora dei mockup — e stava ferma lì: un layer di sistema che dice sempre lo stesso
// orario. Senza argomenti l'orologio parte da adesso e cammina (src/modello/tempo.ts).
// Il banco continua a passargli un'ora di partenza, perché là il tempo si preme.
const orologio = new Orologio();

// ─── chi c'è, prima di tutto il resto ────────────────────────────────
//
// Profilo e stato simulato si leggono da `Archivio/users/<id>/preferences.txt` e
// `system.txt`: per provare una situazione si cambia una riga e si ricarica.
//
// **Sta qui, e non più in fondo** (17 settembre 2026). Prima si caricava dopo, e nel
// frattempo l'archivio era già stato costruito sul nome messo a mano in
// `src/conoscenza/contesto.ts`. Finché i due coincidevano non si vedeva; da quando la
// memoria sta in `Archivio/users/<id>/memory/` non coincidono più quasi mai, e il sistema
// avrebbe aperto la cartella di qualcun altro — o nessuna.
//
// È la prima delle due attese dell'avvio, e sono due richieste in tutto.
const chiSono = await caricaProfilo();
contesto.utilizzatore = chiSono.utilizzatore;
contesto.dove = chiSono.dove;

const posta = new Posta();
const note = new Note();
// La rubrica è un servizio come gli altri: senza, «scrivi a mia madre» non ha nessuno
// a cui scrivere (docs/06-confini §2).
const contatti = new Contatti();
// Calendario e promemoria, dal 17 settembre 2026. Prima erano nei sette del documento e
// dentro `Destinazione`, ma non c'era niente dietro: una consegna verso `calendario`
// trovava il registro vuoto e il task si bloccava con «non ho un modo per scrivere su
// calendario» — cioè il sistema si rompeva su una strada che lui stesso proponeva.
//
// Ricevono l'orologio perché le loro proposte hanno un'**ora**, e l'ora del banco non è
// quella del mondo: con l'orologio fermo, un servizio che leggesse `Date.now()` farebbe
// giudicare al filtro due orari diversi nella stessa frase.
const calendario = new Calendario(() => orologio.adesso());
const promemoria = new Promemoria(() => orologio.adesso());
/**
 * Le tre che sanno **far arrivare** qualcosa, per nome. Serve al banco di chi inventa:
 * il modulo dice «posta» e qui si trova chi la annuncia. Le altre quattro non ci sono
 * perché escono e basta — non hanno niente da portare dentro (docs/06-confini §1).
 */
const SORGENTI: Record<Fonte, Sorgente> = { posta, calendario, promemoria };
// Il disco è un servizio; l'archivio ci sta sopra, ed è dentro (docs/06-confini §5).
//
// **Un disco è di una persona sola**: sta in `Archivio/users/<id>/memory/`, e ci si arriva
// dalla porta `/archivio`. Per questo l'id gli va dato adesso — sopra, dove si è letto
// chi c'è — e non si può indovinare prima.
//
// La seconda attesa dell'avvio: l'archivio si rilegge dentro il proprio costruttore, e
// se si costruisse prima nascerebbe vuoto mentre la memoria di ieri resta su disco a
// guardare. Se la porta non c'è, `accendi` non lancia: si resta in memoria e lo dice.
const disco = new Disco(utenteInCorso());
await disco.accendi();
const archivio = new Archivio(disco, contesto.utilizzatore);
const motore = new Motore(orologio, { posta, note, contatti, calendario, promemoria }, archivio);
// Il pensiero. Si prova la porta vera; se non c'è la chiave, si ripiega sul finto **e
// si vede** — il nome cambia, e la pedana lo scrive (src/ai-engine/ai-engine.ts).
const aiEngine = new Porta(new AiEngineFinto(motore));
// I secondari: **un modo di lavorare, non un posto** (docs/02-parallelo §3). Si collegano
// come un servizio, e dietro può starci un modello o un pugno di regole — il motore non
// lo sa e non deve saperlo.
//
// Oggi dietro c'è il finto anche quando davanti c'è la porta vera: un secondario col
// modello vero è lo stesso giro con tre mosse invece di trentasette, e si accende
// cambiando questa riga.
motore.conSecondari((lavoro, dentro, quale) =>
  lavora(new SecondarioFinto(motore, () => dentro, quale), lavoro, motore, orologio, dentro),
);
const lettura = new Lettura();
const campanello = new Campanello();

// Il canale parallelo: lo stesso testo, letto. Non si genera mai due volte.
motore.inAscoltoDelleRisposte((testo) => lettura.leggi(testo));

// Il campanello suona solo per quello che il filtro ha lasciato passare: le cose che
// non ti riguardano non fanno rumore. E non suona mai sopra la voce: se lei sta
// parlando aspetta il silenzio, come tutto il resto (docs/08-voce §3.1).
motore.inAscoltoDegliArrivi(() => campanello.suona());
campanello.seguiLaVoce(() => lettura.staParlando());
lettura.quandoTace(() => campanello.appenaTace());
// E il verso opposto: non si comincia a parlare sopra un din-don.
lettura.aspetta(() => campanello.finitoDiSuonare());

// I servizi annunciano; il filtro decide; il motore accoglie. Nessun servizio crea task.
// Tutti e tre entrano dalla stessa porta: al motore non interessa chi ha parlato.
posta.osserva((p) => motore.accogli(p));
calendario.osserva((p) => motore.accogli(p));
promemoria.osserva((p) => motore.accogli(p));

// La pedana: il copione. Ogni cosa che in un sistema vero arriverebbe da sé qui si
// preme, e si preme **in fila** — perché quello che conta non è il singolo evento, è la
// catena (docs/09-catene).
const attrezzi = {
  posta,
  calendario,
  promemoria,
  orologio,
  motore,
  dillo: (f: string) => dillo(f),
  detta: (f: string) => detta(f),
};
// La scia guarda il motore e si segna dove passa ogni task: serve a vedere una cosa
// muoversi, che è l'unico modo di capire se la lingua la muove bene.
const scia = new Scia(motore, orologio);
const pedana = new Pedana(
  flussi(attrezzi),
  // L'alfabeto: non una catena, ma l'elenco delle parole che esistono. Non ha bisogno
  // degli attrezzi per esistere — li chiede solo quando una parola si prova davvero.
  ALFABETO,
  scia,
  // Pulire il mondo è più che svuotare il motore: anche il guasto della posta, chi sta
  // parlando e la scia dei task sono cose del mondo, e restano appese al flusso che le
  // ha accese.
  () => {
    motore.azzera();
    posta.guasta = false;
    calendario.guasto = false;
    promemoria.guasto = false;
    contesto.ascoltatore = { chi: 'tu' };
    // Anche il microfono è una cosa del mondo: se una parola l'ha spento, il banco
    // pulito lo rimette come lo vuole il profilo (src/conoscenza/canali.ts).
    comeIlProfilo();
    scia.azzera();
  },
);

// Quello che il profilo accende, e che ha bisogno di pezzi costruiti qui sopra: la
// bocca, il campanello, la tavolozza. Chi è e dove sta erano già stati presi all'avvio.
{
  const p = chiSono;
  if (p.macchina.sfondo) document.documentElement.style.setProperty('--sfondo', `url(${p.macchina.sfondo})`);
  if (p.temaNome) document.documentElement.dataset.colori = p.temaNome;
  // La voce si sceglie col profilo: genere, e accesa o spenta (docs/08-voce §3). Il
  // modello locale si carica in sottofondo, e finché non c'è parla la sintesi di sistema.
  lettura.secondoIlProfilo(p.assistente, codiceLingua(p.lingua), (come) =>
    console.info('la bocca adesso è', come),
  );
  // Il campanello suona al volume della macchina, quello che WHO dichiara a schermo —
  // e suona il file che dice il profilo, o niente se l'hai messo su `silent`.
  campanello.perVolume(p.macchina.volume);
  campanello.secondoIlProfilo(p.macchina.notifiche);
  // La tavolozza in prova. È design, e vive di là: qui si può solo **guardarla** sul
  // vetro vero prima di decidere (src/stile/tema.ts).
  const caduti = applicaTema(p.tema);
  if (caduti.length) console.warn('profilo · nomi del tema che non conosco:', caduti);
  // Due righe del profilo contraddicono due leggi di L1: si vedono, non si applicano.
  for (const c of p.contrasti) console.warn('profilo · contrasto con una legge:', c);
}

const ridisegna = () => disegna(radice, motore, orologio, pedana);

// Il segno d'attesa in INPUT si accende e si spegne dentro `turno()`, e quando cambia
// va ridisegnato: è l'unica cosa che si muove mentre lo schermo per il resto sta fermo.
quandoPensa(ridisegna);

// **Il battito.** Un orologio che cammina non se ne accorge da sé: qualcuno deve
// guardarlo. Ogni dieci secondi — non ogni secondo, perché niente a schermo conta i
// secondi: il minuto della Profilebar e i «da 25 min» della Timeline si muovono al
// minuto, e dieci secondi sono l'errore massimo che si può vedere.
//
// `batti()` fa maturare le scadenze passate, e poi si ridisegna. Non è un ciclo di
// animazione: è il minimo per non mentire sull'ora.
window.setInterval(() => {
  orologio.batti();
  ridisegna();
}, 10_000);

// L'unica cosa che passa da sola è la conversazione: dopo trenta secondi dall'ultimo
// scambio non c'è più niente da mostrare, e INPUT sparisce. Un risveglio, non un ciclo.
let chiusura: number | undefined;
motore.ascolta(() => {
  ridisegna();
  clearTimeout(chiusura);
  chiusura = window.setTimeout(ridisegna, motore.fraQuantoSiChiude() + 50);
});
ridisegna();

// INPUT non c'è finché non cominci: il primo tasto lo fa comparire.
radice.addEventListener('input', (e) => {
  const c = e.target;
  if (c instanceof HTMLSelectElement) return scegliComposto(c);
  if (!(c instanceof HTMLInputElement)) return;
  if (c.id === 'scrittura') ridisegna();
  if (c.id === 'pedana-frase') pedana.frase = c.value;
  scegliComposto(c);
});

/**
 * I campi del banco di chi inventa. Si scrivono e basta: **non si ridisegna a ogni
 * tasto**, o il campo perderebbe il cursore in mezzo a una parola. Lo schermo si rifà
 * quando la cosa parte, che è l'unico momento in cui è cambiato qualcosa di vero.
 */
function scegliComposto(c: HTMLInputElement | HTMLSelectElement): void {
  const k = c.id;
  if (!k.startsWith('componi-')) return;
  const v = c.value;
  const acceso = c instanceof HTMLInputElement && c.type === 'checkbox' ? c.checked : false;
  const x = pedana.composto;

  if (k === 'componi-fonte') x.fonte = v as Fonte;
  else if (k === 'componi-tipo') x.tipo = v as Tipo;
  else if (k === 'componi-perte') x.perTe = acceso;
  else if (k === 'componi-azionabile') x.azionabile = acceso;
  else if (k === 'componi-fra') x.fra = v;
  else if (k === 'componi-nome') x.nome = v;
  else if (k === 'componi-testo') x.testo = v;
  else if (k === 'componi-dachi') x.daChi = v;
  else if (k === 'componi-ingresso') x.ingresso = v;
  else if (k === 'componi-esito') x.esito = v;
  else if (k === 'componi-a') x.a = v;
}

radice.addEventListener('keydown', (e) => {
  const campo = e.target;
  if (!(campo instanceof HTMLInputElement) || campo.id !== 'scrittura') return;
  const battuto = campo.value.trim();

  // ─── i tasti sulle frasi ────────────────────────────────────────────────
  // In tastiera le frasi portano un tasto: **↵** la più probabile, il numero le altre
  // (`design/L2 - INPUT` · «Niente pallini, fuori niente»). Un tasto è una scorciatoia
  // per **dirle**, non l'etichetta di un bottone: passa da `dillo` come se l'avessi
  // pronunciata, e quello che parte è la frase, non un comando.
  //
  // Valgono **solo a campo vuoto**, e la ragione è ovvia appena la si scrive: se
  // valessero sempre, un «2» dentro una frase non si potrebbe battere.
  if (!battuto && modo() === 'tastiera') {
    const frasi = motore.frasiCorrenti();
    const quale = e.key === 'Enter' ? 1 : /^[2-9]$/.test(e.key) ? Number(e.key) : 0;
    const scelta = quale ? frasi[quale - 1] : undefined;
    if (scelta) {
      e.preventDefault();
      return dillo(scelta.testo);
    }
  }

  if (e.key !== 'Enter') return;
  campo.value = '';
  if (!battuto) return;
  if (/^aspetta$/i.test(battuto)) lettura.zittisci();
  dillo(battuto);
});

/**
 * Una frase entra da qui, e da nessun'altra parte. Non viene più letta: viene **data al
 * AI engine**, che guarda lo schermo e chiama le mosse che servono (src/ai-engine/ai-engine.ts).
 *
 * Non si aspetta. L'AI engine vero ci mette il tempo che ci mette, e mentre ci mette
 * quel tempo lo schermo **sta fermo**: INPUT pulsa, e niente si muove finché non ha
 * deciso. È la conseguenza di aver abolito il cervello piccolo, ed è voluta — un
 * riflesso che indovina sposta le cose sotto le mani di chi guarda (17 settembre 2026).
 */
function dillo(frase: string): void {
  void turno(aiEngine, frase, motore, orologio);
}

/**
 * Dettare una frase: entra in INPUT **una parola alla volta**, e non parte.
 *
 * Non è una scorciatoia per `dillo`: è la stessa frase, detta nel tempo in cui la si
 * dice. Serve a guardare la cosa che in INPUT succede solo mentre parli — la raccolta
 * che si aggancia da sé, prima che la frase sia finita (docs/05-interfaccia §1). Alla fine
 * il testo resta lì: mandarlo è un'altra decisione, e la prendi tu premendo invio.
 *
 * Il campo rinasce a ogni disegno, quindi si ricerca ogni volta invece di tenerselo.
 */
async function detta(frase: string): Promise<void> {
  const parole = frase.split(' ');
  for (let i = 1; i <= parole.length; i++) {
    const campo = radice?.querySelector<HTMLInputElement>('#scrittura');
    if (!campo) return;
    campo.value = parole.slice(0, i).join(' ');
    campo.focus();
    ridisegna();
    await new Promise((r) => setTimeout(r, 190));
  }
}

/**
 * Provare una parola dell'alfabeto. Il mondo si porta prima nella situazione in cui
 * quella frase vuol dire qualcosa, e solo dopo la frase si dice: una parola spenta si
 * prova come tutte le altre, invece di restare lì da leggere (src/prova/stato.ts).
 *
 * Ci vuole del tempo vero — una consegna finta è pur sempre una promessa — quindi si
 * ridisegna due volte: quando comincia, e quando è andata.
 */
async function provaParola(posto: string): Promise<void> {
  const [fam, i] = posto.split(':').map(Number);
  const az = pedana.alfabeto[fam ?? -1]?.azioni[i ?? -1];
  if (!az) return;
  pedana.provando = posto;
  ridisegna();
  const esito = await prova(attrezzi, az);
  pedana.provando = undefined;
  if (esito && az.comando) pedana.esiti[posto] = esito;
  ridisegna();
}

/** Andare in una situazione senza dire niente: lo stato non è una frase. */
async function portaci(k: Chiave): Promise<void> {
  pedana.provando = k;
  ridisegna();
  await porta(attrezzi, [k]);
  pedana.provando = undefined;
  ridisegna();
}

// Le frasi sono l'affordance, non i bottoni: cliccarle è una scorciatoia per provare.
radice.addEventListener('click', (e) => {
  const bersaglio = e.target;
  if (!(bersaglio instanceof HTMLElement)) return;

  // La voce in uscita. Anche questa si preme, e **in tutti e due i versi**: a differenza
  // del microfono non c'è niente di impossibile da dichiarare, perché spegnere la voce
  // non spegne l'orecchio. Passa dal motore come la mossa `voce`, quindi premere e dire
  // «non leggere» finiscono nello stesso posto e rispondono la stessa riga.
  if (bersaglio.closest('[data-voce]')) {
    motore.esegui({ tipo: 'voce', come: legge() ? 'spenta' : 'accesa' });
    return;
  }
  if (bersaglio.id === 'pallino') {
    pedana.aperta = !pedana.aperta;
    return ridisegna();
  }
  // il copione: si sceglie un flusso, si va avanti di un passo, o si rifa da un punto
  const flusso = bersaglio.dataset.flusso;
  if (flusso !== undefined) {
    pedana.scegli(Number(flusso));
    return ridisegna();
  }
  if (bersaglio.dataset.vocabolario) {
    pedana.vocabolario();
    return ridisegna();
  }
  if (bersaglio.dataset.componi) {
    pedana.compositore();
    return ridisegna();
  }
  // Far arrivare una cosa che non esiste da nessuna parte. Passa dal servizio, non dal
  // motore: quello che si prova è il sistema intero — filtro compreso — e non il pezzo
  // che si aveva in mente quando si è scritto il modulo (docs/06-confini §1).
  if (bersaglio.dataset.inventa) {
    const p = pedana.proposta(orologio.adesso());
    SORGENTI[pedana.composto.fonte].inventa(p);
    pedana.inventata = `${p.nome} · ${p.perTe ? 'ti nomina' : 'non ti nomina'}${p.ora ? ' · ha un’ora' : ''}`;
    return ridisegna();
  }
  // Una parola sola dell'alfabeto. Si preme la frase, non il comando: passa da `dillo`
  // come tutto il resto, e quello che si prova è la lingua, non il motore.
  const azione = bersaglio.closest<HTMLElement>('[data-azione]')?.dataset.azione;
  if (azione) {
    void provaParola(azione);
    return;
  }
  // Una situazione dello stato: ci si va senza dire niente, perché non è una frase.
  const situazione = bersaglio.dataset.prepara;
  if (situazione && situazione in CONDIZIONI) {
    void portaci(situazione as Chiave);
    return;
  }
  if (bersaglio.dataset.filtro) {
    pedana.soloAdesso = !pedana.soloAdesso;
    return ridisegna();
  }
  // Le due versioni della NOTIFICATIONBAR: la pila delle carte, o la campanella col
  // cassetto. Si escludono, e la differenza non è grafica — nella seconda quello che
  // arriva **non è un task** finché non lo estrai (docs/06-confini §3).
  if (bersaglio.dataset.cassetto) {
    motore.conCassetto = !motore.conCassetto;
    pedana.svuota();
    return ridisegna();
  }
  // L'interruttore in prova: dove stanno le frasi. Gira su tre posizioni, e si guarda
  // la stessa situazione in tutte e tre (docs/11-aperte).
  if (bersaglio.dataset.frasi) {
    pedana.giraLeFrasi();
    return ridisegna();
  }
  if (bersaglio.dataset.svuota) {
    pedana.svuota();
    return ridisegna();
  }
  if (bersaglio.dataset.avanti) {
    pedana.vai();
    return ridisegna();
  }
  if (bersaglio.dataset.daccapo) {
    pedana.daccapo();
    return ridisegna();
  }
  const passo = bersaglio.closest<HTMLElement>('[data-passo]')?.dataset.passo;
  if (passo !== undefined) {
    pedana.vai(Number(passo));
    return ridisegna();
  }
  // la seconda corsia: leggere una frase senza applicarla, e poi applicarla
  // La seconda corsia: non si legge più una frase senza applicarla — non c'è più niente
  // che la legga senza pensarci. Si guarda invece **quello che vedrebbe l'AI engine**: la
  // stessa fotografia che gli torna da `guarda`, e da cui decide tutto.
  if (bersaglio.dataset.leggi) {
    pedana.anteprima = pedana.anteprima ? undefined : guarda(motore, orologio);
    return ridisegna();
  }
  // la sessione: bloccare copre lo schermo, sbloccare lo scopre. Sotto non si ferma
  // niente — quando torni, il tempo è passato e le cose sono andate avanti.
  if (bersaglio.dataset.blocca) {
    pedana.bloccato = true;
    return ridisegna();
  }
  if (bersaglio.dataset.sblocca) {
    pedana.bloccato = false;
    return ridisegna();
  }
  if (bersaglio.dataset.applicaFrase) {
    if (pedana.frase) dillo(pedana.frase);
    pedana.anteprima = undefined;
    return ridisegna();
  }
  // Cliccare una cosa che porta una frase addosso è dirla: la campanella non è un
  // bottone, è un indicatore che si può anche premere (legge 01).
  const detta = bersaglio.closest<HTMLElement>('[data-dillo]')?.dataset.dillo;
  if (detta) {
    dillo(detta);
    return;
  }
  if (!bersaglio.classList.contains('frase')) return;
  const testo = bersaglio.textContent?.replace(/[«»]/g, '').trim() ?? '';
  if (testo) dillo(testo);
});
