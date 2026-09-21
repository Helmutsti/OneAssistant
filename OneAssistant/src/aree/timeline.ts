// TIMELINE — cosa stai facendo, cosa viene dopo, e dove sei dentro la giornata.
//
// Nata il 17 settembre 2026 nel posto che ha lasciato libero l'ora grande: la cima della
// guida di destra era un orologio da 68 px, cioè la cosa più grande dello schermo era
// l'unica che vuol dire sempre la stessa cosa. L'ora è scesa nella riga quieta della
// Profilebar, e qui c'è quello che ti riguarda (`design/L2 - Timeline`).
//
// Il suo mestiere in una riga: **situarti nel tempo**. E situarsi non vuol dire sapere
// che ore sono — vuol dire sapere **quanto tempo hai**.
//
// ─── cosa non è ─────────────────────────────────────────────────────────────
//
// Tre cose, e se una cade è un task in due posti (legge 03):
//
//   - **non offre frasi.** Un task che aspetta te ha già il suo posto;
//   - **non si preme**;
//   - **non migra.**
//
// Mostra il tempo, *etichettato* da cosa succede. Non è un elenco che scorre e non è un
// pannello che si apre: è la stessa struttura che cambia soggetto.
//
// ─── da dove vengono i dati ─────────────────────────────────────────────────
//
// Da nessun servizio nuovo: **tutto dal motore**. L'adesso è il task `in corso`, il dopo
// è il primo con un'ora davanti, il filo è la giornata di `contesto.oreDiLavoro`. È la
// nota del documento di design che conta più di tutte — la Timeline **è solo una
// visualizzazione**: non tiene niente, non decide niente, e il giorno che arriva un
// calendario vero cambia da dove leggono queste funzioni, non cosa disegnano.
//
// L'ordine di precedenza — chi vince quando i soggetti possibili sono più di due — è
// **logica**, e sta in `docs/01-modello §8`. Qui si applica, non si decide.

import { REGOLE, orario, type Motore } from '../modello/motore.ts';
import { MINUTO, type Orologio } from '../modello/tempo.ts';
import { contesto } from '../conoscenza/contesto.ts';
import type { Task } from '../modello/tipi.ts';
import { esc } from './testo.ts';

/** Quanto è larga la giornata a schermo. 242 come il documento di design. */
const FILO = 242;

/**
 * Quanto è largo il tratto di una cosa che ha solo un istante. Un appuntamento non ha
 * una durata nel modello — ce l'avrà quando ci sarà un calendario — e intanto un tratto
 * di zero pixel non si vede. Sei è il minimo che si distingue dal pallino da nove.
 */
const ISTANTE = 6;

// ─── l'adesso, e la sua durata ──────────────────────────────────────────────

/** Il task in corso. Ce n'è al massimo uno: è il modello a garantirlo, non noi. */
function inCorso(m: Motore): Task | undefined {
  return m.task.find((t) => t.avanzamento === 'in corso');
}

/**
 * Il prossimo con un'ora davanti, il più vicino. `ora` ce l'hanno solo i programmati e i
 * rimandati (`src/modello/tipi.ts`), che è esattamente l'insieme giusto.
 */
function ilDopo(m: Motore, adesso: Date): Task | undefined {
  return m.task
    .filter((t) => t.ora !== undefined && t.ora.getTime() > adesso.getTime())
    .sort((a, b) => a.ora!.getTime() - b.ora!.getTime())[0];
}

/** «da 25 min», «da un'ora e 10». Il tempo passato su una cosa, detto corto. */
function daQuanto(ms: number): string {
  const minuti = Math.floor(ms / MINUTO);
  if (minuti < 1) return 'appena cominciato';
  if (minuti < 60) return `da ${minuti} min`;
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  const quante = ore === 1 ? 'un’ora' : `${ore} ore`;
  return resto === 0 ? `da ${quante}` : `da ${quante} e ${resto}`;
}

/**
 * «fra 12 min», oppure l'ora secca. Sotto l'ora si dice quanto manca, perché è quello
 * che serve; sopra si dice quando, perché «fra tre ore» non ti fa spostare niente.
 */
function fraQuantoCorto(ms: number, quando: Date): string {
  const minuti = Math.round(ms / MINUTO);
  return minuti < 60 ? `fra ${minuti} min` : orario(quando);
}

/** «2 ore e 48», «48 min». Quanto tempo hai: la frase per cui esiste il componente. */
function quantoResta(ms: number): string {
  const minuti = Math.max(0, Math.floor(ms / MINUTO));
  if (minuti < 60) return `${minuti} min`;
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  const quante = ore === 1 ? 'un’ora' : `${ore} ore`;
  return resto === 0 ? quante : `${quante} e ${resto}`;
}

/** La fine della giornata di lavoro, oggi. Il capo dell'orizzonte del filo. */
function fineGiornata(adesso: Date): Date {
  const d = new Date(adesso);
  d.setHours(contesto.oreDiLavoro.a, 0, 0, 0);
  return d;
}

function inizioGiornata(adesso: Date): Date {
  const d = new Date(adesso);
  d.setHours(contesto.oreDiLavoro.da, 0, 0, 0);
  return d;
}

// ─── il filo ────────────────────────────────────────────────────────────────

interface Tratto {
  readonly da: number;
  readonly a: number;
  readonly classe: 'ora' | 'attende' | 'fermo';
}

/**
 * I tratti colorati della giornata. **Non è un grafico**: è la legge 04 applicata al
 * tempo — un tratto non ha un colore scelto, ha il colore dello stato di quello che
 * copre, esattamente come una bolla.
 *
 * Il `programmato` non compare: programmato non ha colore (legge 04), e qui non ne
 * prende uno — resta il fondo del filo.
 */
function tratti(m: Motore, adesso: Date): Tratto[] {
  const dentro: Tratto[] = [];
  const corrente = inCorso(m);
  if (corrente) {
    // Comincia dove è cominciato e arriva a adesso: la sua lunghezza **è** da quanto ci
    // stai. `tocco` è l'istante dell'ultimo cambio di avanzamento, cioè quando è
    // diventato in corso.
    dentro.push({ da: corrente.tocco.getTime(), a: adesso.getTime(), classe: 'ora' });
  }
  for (const t of m.task) {
    if (t.avanzamento === 'bloccato') {
      // Un fermo si vede dove è fermo: se ha un'ora là, altrimenti adesso — perché è
      // adesso che è bloccato, e un tratto rosso non vuol dire «la fine».
      const q = (t.ora ?? adesso).getTime();
      dentro.push({ da: q, a: q, classe: 'fermo' });
    } else if (t.avanzamento === 'aspetta te' && t.ora !== undefined) {
      // Ambra solo quando il modello l'ha già promosso, cioè dentro il preavviso.
      // Prima è grigio, e grigio qui vuol dire: c'è, ma non ancora per te.
      const q = t.ora.getTime();
      if (q - adesso.getTime() <= REGOLE.preavviso) dentro.push({ da: q, a: q, classe: 'attende' });
    }
  }
  return dentro;
}

/**
 * Il filo, in segmenti affiancati. Si disegna come una fila di tratti e non con delle
 * posizioni assolute perché è così che lo dice il design — e perché una fila si somma:
 * se i pezzi non fanno 242, si vede subito che il conto è sbagliato.
 */
function filo(m: Motore, adesso: Date): string {
  const da = inizioGiornata(adesso).getTime();
  const a = fineGiornata(adesso).getTime();
  const larghezza = a - da;
  if (larghezza <= 0) return '';

  const px = (ms: number) => Math.max(0, Math.min(FILO, ((ms - da) / larghezza) * FILO));

  // Ognuno clippato nell'orizzonte e con un minimo visibile, poi in ordine.
  const pezzi = tratti(m, adesso)
    .map((t) => ({ classe: t.classe, x: px(t.da), fine: Math.max(px(t.a), px(t.da) + ISTANTE) }))
    .filter((p) => p.fine > 0 && p.x < FILO)
    .sort((x, y) => x.x - y.x);

  const html: string[] = [];
  let cursore = 0;
  for (const p of pezzi) {
    // Due cose alla stessa ora non si sovrappongono: la seconda comincia dove finisce la
    // prima. Meglio spostata di un pixel che invisibile sotto l'altra.
    const x = Math.max(p.x, cursore);
    const fine = Math.min(FILO, Math.max(p.fine, x + ISTANTE));
    if (x > cursore) html.push(`<div class="tratto vuoto" style="width:${(x - cursore).toFixed(1)}px"></div>`);
    // Il capo è il pallino da 9: sta all'**inizio**, non alla fine. È lo stesso punto
    // della Notificationbar e di INPUT, e non serve un terzo segno.
    html.push(
      `<div class="tratto ${p.classe}" style="width:${(fine - x).toFixed(1)}px"><span class="capo"></span></div>`,
    );
    cursore = fine;
  }
  if (cursore < FILO) html.push(`<div class="tratto vuoto" style="width:${(FILO - cursore).toFixed(1)}px"></div>`);
  return `<div class="segmenti" style="width:${FILO}px">${html.join('')}</div>`;
}

// ─── il componente ──────────────────────────────────────────────────────────

/**
 * La Timeline. Una funzione pura dello stato, come ogni area: niente da montare, niente
 * da smontare, e due chiamate di fila con lo stesso motore danno la stessa stringa.
 */
export function timeline(m: Motore, o: Orologio): string {
  const adesso = o.adesso();
  const corrente = inCorso(m);
  const dopo = ilDopo(m, adesso);

  // ─── l'adesso, o il tempo libero ─────────────────────────────────────────
  // Quando non stai su niente il posto **non resta vuoto e non mente**: dice quanto
  // tempo hai. È la frase che un calendario non dice mai, ed è quella per cui questo
  // componente esiste.
  const ilPrimo = corrente
    ? `
      <div class="momento adesso">
        <div class="targa-tl">adesso · ${daQuanto(adesso.getTime() - corrente.tocco.getTime())}</div>
        <div class="soggetto">${esc(corrente.nome)}</div>
      </div>`
    : `
      <div class="momento libero">
        <div class="targa-tl">libero</div>
        <div class="soggetto">${quantoResta((dopo?.ora ?? fineGiornata(adesso)).getTime() - adesso.getTime())}</div>
      </div>`;

  // ─── il dopo ─────────────────────────────────────────────────────────────
  // Stessa taglia dell'adesso, peso 500 e inchiostro tenue: **la gerarchia si fa col
  // colore, non con la misura**. Due righe uguali si leggono come una coppia; due di
  // misura diversa si leggono come un titolo e una didascalia.
  //
  // Dentro il preavviso va in ambra e prende peso — e non compare niente di nuovo.
  const manca = dopo?.ora ? dopo.ora.getTime() - adesso.getTime() : undefined;
  const vicino = manca !== undefined && manca <= REGOLE.preavviso;
  const ilSecondo = dopo?.ora
    ? `
      <div class="momento dopo${vicino ? ' vicino' : ''}">
        <div class="targa-tl">dopo · ${fraQuantoCorto(manca!, dopo.ora)}</div>
        <div class="soggetto">${esc(dopo.nome)}</div>
      </div>`
    : `
      <div class="momento dopo">
        <div class="targa-tl">dopo</div>
        <div class="soggetto">niente in programma</div>
      </div>`;

  // Niente «prima»: il passato è l'unica informazione che riguarda una cosa che non si
  // può più cambiare. Fuori (design/L2 - Timeline · «Niente prima»).
  return `
    <div id="timeline">
      <div class="riepilogo">
        ${ilPrimo}
        ${ilSecondo}
        ${filo(m, adesso)}
      </div>
    </div>`;
}
