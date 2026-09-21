// Il disegno. Ogni misura viene dai documenti di Claude Design e porta scritto da dove:
// L1 - Sistema (le leggi), L1 - Bubble (la primitiva), L2 (le aree), L3 (le posizioni).
// Qui non si decide niente di grafico: si trascrive. Se una riga di qui contraddice un
// documento, è di qui l'errore.

import type { Motore, Mossa, Scambio } from '../modello/motore.ts';
import { orario } from '../modello/motore.ts';
import { colore, dentroSiVede, type Gruppo, type Task, type Tipo } from '../modello/tipi.ts';
import { contesto, nomeDiChiParla } from '../conoscenza/contesto.ts';
import { profilo } from '../conoscenza/profilo.ts';
import type { Orologio } from '../modello/tempo.ts';
import { dove, type Pedana } from '../prova/pedana.ts';
import type { Passo } from '../prova/flussi.ts';
import { dilla } from '../prova/alfabeto.ts';
import { CHIAVI, CONDIZIONI, mancano } from '../prova/stato.ts';
import { raccolta, type Riferimento } from './raccolta.ts';
import { timeline } from './timeline.ts';
import { staPensando } from '../ai-engine/ai-engine.ts';
import { esc } from './testo.ts';
import { legge, modo, sente } from '../conoscenza/canali.ts';
import { Scrivania, LARGA_RIPOSO, LARGA_DENTRO, LARGA_FUOCO, misuraPalco, palco } from './scrivania.ts';

/** Dove stanno le bolle. Vive fra un disegno e l'altro: il movimento ha bisogno di
 *  memoria, e le bolle di TABLE non si ridisegnano da capo ogni volta. */
const scrivania = new Scrivania();
let fuocoPrecedente: string | undefined;
let dentroPrecedente: string | undefined;
let assestamento = 0;

/**
 * Il campo di forze gira finché qualcosa si muove, e poi si ferma: a riposo la
 * scrivania è immobile (L1 - Soap Bubbles · nessun movimento senza causa).
 */
function assesta(area: HTMLElement, fuoco?: string): void {
  cancelAnimationFrame(assestamento);
  // Un tetto: se in tre secondi non ha trovato pace, si ferma comunque. Erano un
  // secondo e mezzo, e col movimento sul ghiaccio tagliavano la coda proprio dove si
  // vede — una scrivania che continua a muoversi resta peggio di una imperfetta.
  const fine = performance.now() + 3000;
  const passo = () => {
    // L'ingombro vero cambia mentre il contenuto cambia — la bolla a fuoco cresce di
    // due righe. Si rimisura a ogni passo, o il campo lavorerebbe su una taglia vecchia.
    for (const nodo of [...area.children] as HTMLElement[]) {
      if (!nodo.dataset.uscita) scrivania.misura(nodo.dataset.task!, nodo.offsetHeight || 170);
    }
    // Un tetto: se in un secondo e mezzo non ha trovato pace, si ferma comunque.
    // Una scrivania che continua a muoversi è peggio di una imperfetta.
    const vivo = scrivania.passo(performance.now(), fuoco) && performance.now() < fine;
    for (const nodo of [...area.children] as HTMLElement[]) {
      const id = nodo.dataset.task!;
      if (nodo.dataset.uscita) continue;
      const posto = scrivania.posto(id);
      if (!posto) continue;
      nodo.style.left = `${posto.x.toFixed(1)}px`;
      nodo.style.top = `${posto.y.toFixed(1)}px`;
      // dove si toccano si comprimono leggermente: non si attraversano mai
      const c = scrivania.compressione(id);
      nodo.style.transform = c > 0.01 ? `scale(${(1 - c * 0.03).toFixed(4)})` : '';
    }
    if (vivo) assestamento = requestAnimationFrame(passo);
  };
  assestamento = requestAnimationFrame(passo);
}

/**
 * La finestra ha cambiato misura. I confini della scrivania si rifanno sui bordi nuovi,
 * e il campo riparte: una bolla rimasta fuori dall'area rientra da sola, spinta dal
 * bordo come da qualsiasi altro evento. Ridimensionare è una causa come un'altra.
 */
export function ridimensiona(radice: HTMLElement): void {
  misuraPalco(radice.clientWidth, radice.clientHeight);
  scrivania.rientra();
  const area = radice.querySelector<HTMLElement>('#table');
  if (area) assesta(area, fuocoPrecedente);
}

/**
 * L1 - Sistema, legge 06 · sette icone in tutto il sistema, mai il logo di un'app.
 * La famiglia è **Lucide** (deciso il 16 settembre 2026, vedi «L1 - Icone»): tratto
 * uniforme e terminazioni arrotondate. I nomi sono classi, non legature.
 */
const ICONE: Record<Tipo, string> = {
  posta: 'icon-mail',
  cartella: 'icon-folder',
  documento: 'icon-file-text',
  persone: 'icon-users',
  conversazione: 'icon-message-circle',
  immagine: 'icon-image',
  sveglia: 'icon-alarm-clock',
};

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

export function disegna(radice: HTMLElement, m: Motore, o: Orologio, p: Pedana): void {
  const scritto = radice.querySelector<HTMLInputElement>('#scrittura');
  const testoInCorso = scritto?.value ?? '';
  const avevaFuoco = document.activeElement === scritto;
  const cursore = scritto?.selectionStart ?? null;

  // La cornice si ridisegna da capo: è terra ferma, non si muove mai (L1 - Soap Bubbles).
  let cornice = radice.querySelector<HTMLElement>('#cornice');
  if (!cornice) {
    cornice = document.createElement('div');
    cornice.id = 'cornice';
    radice.appendChild(cornice);
  }
  cornice.innerHTML = [
    guida(m, o),
    // La pila è tornata (17 settembre 2026). Era spenta perché il posto delle cose che
    // aspettano te andava ripensato — ma spenta voleva dire che **quello che arriva non
    // si vedeva affatto**: una carta nasce, nessuno la disegna, e lo schermo dice che non
    // è successo niente. Un componente da ripensare è meglio di un buco.
    //
    // Non litiga con la campanella: nella seconda versione gli arrivi non diventano
    // carte ma notifiche, quindi qui non c'è niente da disegnare e l'angolo resta suo.
    pila(m, o, p.frasi === 'sotto'),
    espansione(m),
    input(m, testoInCorso, p.frasi),
    // Il blocco copre tutto quello che sta sopra, e la pedana resta fuori: è il banco,
    // e da un banco si deve poter sbloccare.
    blocco(p, o),
    pedana(p, o, m),
  ].join('');

  // INPUT c'era, adesso: la bolla gioca l'entrata solo al disegno in cui nasce, e da
  // quello dopo sta ferma. Si scrive **dopo** aver costruito la cornice, perché
  // `input()` l'ha appena letto per decidere se mettere `nasce`.
  inputCera = cornice.querySelector('#input:not(.assente)') !== null;

  // TABLE invece si muove, quindi le sue bolle restano le stesse e cambiano posizione.
  table(radice, m, o, p.frasi === 'sotto');
  // E la NOTIFICATIONBAR, per la stessa ragione: un cassetto che scorre non può essere
  // ricostruito da capo a ogni disegno.
  notificationbar(radice, m, o);

  const nuovo = radice.querySelector<HTMLInputElement>('#scrittura');
  if (nuovo) {
    nuovo.value = testoInCorso;
    // In tastiera il campo prende il fuoco da sé: è l'ingresso, non un posto dove
    // andare. In voce lo riprende solo se ce l'aveva, come sempre.
    if (avevaFuoco || nuovo.dataset.tieni) {
      nuovo.focus();
      if (cursore !== null) nuovo.setSelectionRange(cursore, cursore);
    }
  }
}

// ─── LA GUIDA DI DESTRA · quattro cornici in colonna ───────────────────────
// Erano quattro quote fisse — 40, 187, 245 — misurate a mano una sull'altra. Dal 17
// settembre 2026 non possono più esserlo: **la Timeline cresce** con due nomi lunghi, e
// il design dice che chi le sta sotto la segue (`design/L2 - Profilebar` · «Si sposta
// con chi le sta sopra»). Una colonna lo fa da sé, e nessuno deve rifare la somma.
//
// L'ancoraggio orizzontale resta fisso al pixel: è la legge 08, e vale ancora. Quello
// che non vale più è la quota.

function guida(m: Motore, o: Orologio): string {
  return `
    <div id="guida">
      ${timeline(m, o)}
      ${profilebar(o)}
      ${systembar()}
      ${taskbar(m, o)}
    </div>`;
}

// ─── PROFILEBAR · sotto la Timeline, una riga sola ─────────────────────────
// Quando sono, dove sono, e chi sono — **piano**. Erano tre righe con l'ora a 68 px in
// cima; dal 17 settembre 2026 è una riga a 13 e il volto a 44 (`design/L2 - Profilebar`).
//
// L'ora non sparisce — serve sempre — ma non è più la cosa più grande dello schermo:
// sopra di lei c'è la Timeline, e la cosa più grande della guida è diventata una cosa
// che ti riguarda. Quello che resta qui è il **contesto**: cose vere che non chiedono
// niente, e che per questo non devono urlare.
//
// Senza contenitore: una bolla è una cosa che può finire, e chi sei tu non finisce mai
// (legge zero, eccezione dichiarata). Niente stato e niente colore — qui non c'è nulla
// che aspetti te, e il colore è stato.

function profilebar(o: Orologio): string {
  const d = o.adesso();
  const chi = profilo();
  // **Tutto dentro un velo solo** (17 settembre 2026). Prima erano tre cose affiancate
  // sulla stessa riga — l'ora, il luogo velato, il volto — e il velo vestiva il luogo
  // soltanto. Adesso il velo li tiene tutti e tre: quando e dove impilati a sinistra,
  // il volto a destra.
  //
  // Il senso non cambia ed è il motivo per cui si può fare: erano già **una cosa sola**
  // — il contesto, cioè quando sono, dove sono e chi sono — e stavano vicini fingendo
  // di non stare insieme. Quello che cambia è che adesso si vede che sono un gruppo.
  //
  // Resta vero quello che il velo non deve diventare: niente stato, niente colore, e
  // nessun bordo. È un velo che si allarga, non una bolla che nasce — una bolla è una
  // cosa che può finire, e chi sei tu non finisce mai (`design/L2 - Profilebar`).
  //
  // La riga è larga 392 e sfonda a sinistra oltre i 292 della guida: è una **deroga alla
  // legge 08** dichiarata nel documento di design, e l'unico posto del sistema dove la
  // guida ha due ancoraggi.
  return `
    <div id="profilebar">
      <div class="velo">
        <div class="contesto">
          <span class="quando">${orario(d)} · ${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}</span>
          <span class="luogo">${ilLuogo()}</span>
        </div>
        <img class="volto" src="${chi.macchina.volto ?? '/volto.png'}" alt="${esc(contesto.utilizzatore)}" />
      </div>
    </div>`;
}

/**
 * Il luogo, in due pezzi: **la città, e il posto con la sua icona**. Il profilo lo scrive
 * al contrario — «studio · Bologna» — perché lì conta prima dove sei; a schermo conta
 * prima dove sei *in generale*, e poi in che stanza.
 *
 * L'icona cambia col posto, e **questa è una domanda aperta**: la legge 06 dice sette
 * icone in tutto il sistema, e quelle sette sono i tipi di task. O il luogo ne ha una
 * fissa, o la legge diventa «sette più quelle del contesto» (design/prove).
 */
function ilLuogo(): string {
  const [posto = '', citta = ''] = contesto.dove.split('·').map((x) => x.trim());
  const icona =
    /cas[ae]/i.test(posto) ? 'icon-house'
    : /(studio|ufficio|lavoro)/i.test(posto) ? 'icon-briefcase'
    : 'icon-map-pin';
  const pezzi = [
    citta ? `<span>${esc(citta)}</span>` : '',
    citta && posto ? `<span class="punto">·</span>` : '',
    posto ? `<span class="icona ${icona}"></span><span>${esc(posto)}</span>` : '',
  ];
  return pezzi.filter(Boolean).join('');
}

// ─── SYSTEMBAR · subito sotto, più piccola ─────────────────────────────────
// La macchina: chi ascolta, volume, rete, batteria. **Più piccola perché conta meno** —
// sono le cose che guardi quando qualcosa non va, non mentre lavori. L'ordine è quello
// di prima e non cambia: uno stato che si sposta di posto non si legge più a colpo
// d'occhio.
//
// Chi ascolta sta qui e non nella Profilebar: non dice chi sei, dice **se il microfono
// ti sente** — è una proprietà della macchina, e quando è spento non c'è nessun
// ascoltatore da nominare (docs/07-memoria §2).
//
// **Si preme** (17 settembre 2026). È la stessa famiglia della campanella — un
// indicatore che si può anche premere — con una differenza che vale la pena sapere:
// la campanella ha anche una frase, questo no. Spegnere si dice («non ascoltare»);
// riaccendere è **solo** un gesto, perché col microfono spento non c'è niente che
// senta una frase, e perché non esiste una mossa dell'AI engine che apra il tuo microfono
// (src/conoscenza/canali.ts).
//
// Quando è spento la parola diventa «SCRIVI» invece di «SPENTO»: dice cosa fare, non
// cosa manca. Un sistema che dichiara un guasto al posto di un modo è un sistema che
// ti lascia lì.

function systembar(): string {
  const macchina = profilo().macchina;
  const a = contesto.ascoltatore;
  const acceso = sente();
  // La bocca, come l'orecchio: si preme. Ma **in tutti e due i versi** — spegnere la
  // voce non spegne l'orecchio, quindi una frase per riaccenderla arriva sempre, e non
  // serve l'eccezione che il microfono ha dovuto dichiarare (src/conoscenza/canali.ts).
  const parla = legge();
  const stato =
    // «SCRIVI» e non «MICROFONO SPENTO»: l'icona è già un microfono sbarrato, e la
    // parola lunga faceva uscire la riga dalla colonna. Icona più valore, legge 06.
    !acceso ? { classe: 'non-tu', parola: 'SCRIVI', icona: 'icon-mic-off' }
    : a.chi === 'tu' ? { classe: 'ascolto-chi', parola: 'SOLO TU', icona: 'icon-mic' }
    : a.chi === 'conosciuto' ? { classe: 'non-tu', parola: nomeDiChiParla(contesto).toUpperCase(), icona: 'icon-mic' }
    : { classe: 'non-tu', parola: 'NON TI CONOSCO', icona: 'icon-mic-off' };
  return `
    <div id="systembar">
      <div class="voce premibile ${stato.classe}" data-microfono="1"
        title="${acceso ? 'premi per scrivere' : 'premi per tornare a voce'}">
        <span class="icona ${stato.icona}"></span>
        <span class="mono">${esc(stato.parola)}</span>
      </div>
      <div class="voce premibile ${parla ? '' : 'non-tu'}" data-voce="1"
        title="${parla ? 'premi per farla tacere' : 'premi per farla leggere'}">
        <span class="icona ${parla ? 'icon-volume-2' : 'icon-volume-x'}"></span>
        <span class="mono">${parla ? macchina.volume : 'MUTA'}</span>
      </div>
      ${
        macchina.rete
          ? `<div class="voce"><span class="icona icon-wifi"></span><span class="mono">${esc(macchina.rete.toUpperCase())}</span></div>`
          : `<div class="voce"><span class="icona icon-wifi-off"></span><span class="mono">SENZA RETE</span></div>`
      }
      <div class="voce"><span class="icona icon-battery-full"></span><span class="mono">${macchina.batteria}%</span></div>
    </div>`;
}

// ─── TASKBAR · L2 - Taskbar ────────────────────────────────────────────────
// Chip alti 34, raggio 20, padding 14, gap 9, ancorati a destra 44 / top 132, max 4.
// Tre elementi sempre in quest'ordine: tipo, nome, dato.

function taskbar(m: Motore, o: Orologio): string {
  // Un gruppo occupa un posto solo: è il modo in cui la fila resta corta senza che
  // niente sparisca. Chi è dentro un gruppo non compare anche da solo (legge 03).
  const fila = m.elementi().slice(0, 4);
  if (fila.length === 0) return '<div id="taskbar"></div>';
  const altrove = m.aFuoco() ? 'attenuata' : '';
  const disegnati = fila.map((e) => ('gruppo' in e ? unGruppo(e.gruppo) : unChip(e.task, o)));
  return `<div id="taskbar" class="${altrove}">${disegnati.join('')}</div>`;
}

/**
 * Il gruppo indossa colore e icona del membro che ha più bisogno di te, e al posto del
 * dato porta quanti sono (docs/01-modello §6). Lo spessore dietro dice che dentro c'è
 * più di una cosa: è la stessa idea della pila della NOTIFICATIONBAR.
 */
function unGruppo(g: Gruppo): string {
  const c = tinta(g.parla);
  const lavora = g.parla.avanzamento === 'in corso' ? ' lavora' : '';
  return `
    <div class="chip gruppo bolla-base${lavora}">
      <span class="icona ${c} ${ICONE[g.parla.tipo]}"></span>
      <span class="nome">${esc(g.nome)}</span>
      <span class="dato ${c}">${g.membri.length}</span>
    </div>`;
}

function unChip(t: Task, o: Orologio): string {
  const c = tinta(t);
  const lavora = t.avanzamento === 'in corso' ? ' lavora' : '';
  void o;
  return `
    <div class="chip bolla-base${lavora}">
      <span class="icona ${c} ${ICONE[t.tipo]}"></span>
      <span class="nome">${esc(t.nome)}</span>
      ${t.dato ? `<span class="dato ${c}">${esc(t.dato)}</span>` : ''}
    </div>`;
}

// ─── TABLE · L1 - Bubble + L1 - Soap Bubbles ───────────────────────────────
// Le bolle non si ridisegnano: nascono, si spostano, si contraggono. Ogni movimento ha
// una causa dichiarabile, e nessuno parte da solo.

function table(radice: HTMLElement, m: Motore, o: Orologio, conFrasi: boolean): void {
  let area = radice.querySelector<HTMLElement>('#table');
  if (!area) {
    area = document.createElement('div');
    area.id = 'table';
    radice.appendChild(area);
  }
  const adesso = Date.now();
  const main = m.main();
  const tasks = main ? [main, ...m.in('APERTO')] : m.in('APERTO');
  const vivi = new Set(tasks.map((t) => t.id));

  // Chi non è più in TABLE se ne va: si contrae verso la Taskbar, o sfuma sul posto.
  for (const nodo of [...area.children] as HTMLElement[]) {
    const id = nodo.dataset.task!;
    if (vivi.has(id) || nodo.dataset.uscita) continue;
    nodo.dataset.uscita = '1';
    const t = m.task.find((x) => x.id === id);
    scrivania.togli(id, adesso);
    if (t?.luogo === 'CHIP') {
      // Contrazione: si stringe, poi migra all'ancoraggio della Taskbar lungo un arco.
      nodo.classList.add('si-contrae');
      requestAnimationFrame(() => {
        // L'ancoraggio della Taskbar si legge dal bordo destro, non da 1440.
        nodo.style.left = `${palco.larghezza - 290}px`;
        nodo.style.top = '132px';
        nodo.style.width = '246px';
      });
      setTimeout(() => nodo.remove(), 700);
    } else {
      // Chiusura: sfuma sul posto contraendosi del 6%. Non vola via, non implode.
      nodo.classList.add('si-chiude');
      setTimeout(() => nodo.remove(), 1500);
    }
  }

  // Chi è arrivato: nasce nel punto più libero, e la sua onda sposta le vicine.
  for (const t of tasks) {
    let nodo = area.querySelector<HTMLElement>(`[data-task="${t.id}"]`);
    if (!nodo) {
      nodo = document.createElement('div');
      nodo.dataset.task = t.id;
      nodo.className = 'bolla bolla-base nasce';
      area.appendChild(nodo);
      const posto = scrivania.accogli(t.id, adesso);
      nodo.style.left = `${posto.x}px`;
      nodo.style.top = `${posto.y}px`;
      nodo.style.width = `${posto.larghezza}px`;
      // entrando nella superficie, la nuova sposta le vicine: l'onda, con il suo
      // ritardo a cascata di 40 ms l'una dall'altra.
      scrivania.onda(t.id, performance.now());
      setTimeout(() => nodo?.classList.remove('nasce'), 520);
    }
    nodo.innerHTML = dentroLaBolla(m, t, o, conFrasi);
  }

  // Il fuoco: basta il riconoscimento, non il comando. È il modo in cui il sistema dice
  // «ti ho capito» — prima ancora di aprire bocca.
  const aFuoco = m.aFuoco();
  const suo = aFuoco && vivi.has(aFuoco.id) ? aFuoco.id : undefined;
  // Dentro è una vista, non uno stato: cambia la misura della bolla e la luce intorno,
  // e non tocca niente del task (docs/01-modello §7).
  const dentro = m.aperto()?.id;
  if (suo !== fuocoPrecedente || dentro !== dentroPrecedente) {
    fuocoPrecedente = suo;
    dentroPrecedente = dentro;
    if (suo) scrivania.fuoco(suo, dentro === suo ? LARGA_DENTRO : LARGA_FUOCO);
  }

  // Una bolla è alta quanto quello che contiene: l'ingombro vero lo sa solo il disegno,
  // e senza quello le bolle si respingerebbero a naso.
  for (const t of tasks) {
    const nodo = area.querySelector<HTMLElement>(`[data-task="${t.id}"]`);
    if (nodo) scrivania.misura(t.id, nodo.offsetHeight || 170);
  }

  for (const t of tasks) {
    const nodo = area.querySelector<HTMLElement>(`[data-task="${t.id}"]`);
    const posto = scrivania.posto(t.id);
    if (!nodo || !posto) continue;
    nodo.classList.toggle('attenuata', suo !== t.id);
    // Quando una è aperta, le altre non si attenuano: si scuriscono. È la differenza
    // fra «non ha il fuoco» e «adesso non c'entra».
    nodo.classList.toggle('spenta', dentro !== undefined && dentro !== t.id);
    nodo.style.width = `${suo === t.id ? posto.larghezza : LARGA_RIPOSO}px`;
  }

  // e poi si fanno spazio a vicenda, finché non sono ferme.
  assesta(area, suo);
}

/**
 * La bolla canonica: tre fasce, mai invertite — targa, contenuto, voce.
 * Qualunque bolla è questa con qualcosa in meno, mai con qualcosa in più.
 */
function dentroLaBolla(m: Motore, t: Task, o: Orologio, conFrasi: boolean): string {
  const c = tinta(t);
  const suo = m.aFuoco()?.id === t.id;
  // `conFrasi` è l'interruttore della pedana: **in prova**, e per questo passa di qui
  // invece di stare scritto nel disegno. Se le frasi vanno in INPUT, la bolla resta
  // solo targa, titolo e corpo — e il colore continua a dire che è lei che aspetta te.
  const frasi = suo && conFrasi ? m.frasiCorrenti() : [];
  // Aperta, la bolla mostra quello che tiene e la riga non dice. Di più, non di diverso.
  const intero = m.aperto()?.id === t.id ? dentroSiVede(t) : undefined;
  return `
      <div class="targa ${c}">
        <span class="icona ${ICONE[t.tipo]}"></span>
        <span>${esc(etichetta(t))}</span>
        <span class="eta">${esc(eta(t, o))}</span>
      </div>
      <div class="titolo">${esc(t.nome)}</div>
      <div class="corpo">${esc(t.testo)}</div>
      ${intero ? `<div class="incisione"></div><div class="intero">${esc(intero)}</div>` : ''}
      ${
        frasi.length
          ? `<div class="incisione"></div>
             <div class="puoi-dire">Puoi dire</div>
             <div class="frasi">${frasi
               .map((f, i) => `<span class="frase${i === 0 ? ' probabile' : ''}">«${esc(f.testo)}»</span>`)
               .join('')}</div>`
          : ''
      }`;
}

// ─── la pila · prima versione della NOTIFICATIONBAR · L2 - Sidebar ─────────
// Destra 44, bottom 44. Carta 496, raggio 22, padding 16/18. Pila: max tre visibili,
// offset 11 px in alto e per lato. La pila occupa sempre lo stesso spazio.
//
// È **spenta** dal 16 settembre e resta qui intatta: la seconda versione — la campanella
// col cassetto — si guarda accanto a questa, non al posto suo, finché non si decide.

export function pila(m: Motore, o: Orologio, conFrasi = true): string {
  const carte = m.in('CARTA');
  if (carte.length === 0) return '<div id="pila"></div>';

  const visibili = carte.slice(-3);
  const cima = visibili[visibili.length - 1]!;
  const dietro = visibili.slice(0, -1).reverse();

  const sotto = dietro
    .map((_, i) => {
      const s = (i + 1) * 11;
      return `<div class="carta bolla-base informa" style="right:${s}px; bottom:${s}px; width:${400 - s * 2}px; height:76px;"></div>`;
    })
    .join('');

  const c = tinta(cima);
  const sua = m.aFuoco()?.id === cima.id;
  const frasi = sua && conFrasi ? m.frasiCorrenti() : [];
  return `
    <div id="pila" style="height:${100 + (visibili.length - 1) * 11}px" class="${sua ? '' : 'attenuata'}">
      ${sotto}
      <div class="carta bolla-base">
        <div class="targa ${c}">
          <span class="icona ${ICONE[cima.tipo]}"></span>
          <span>${esc(etichetta(cima))}</span>
          <span class="eta">${esc(cima.fonte ?? eta(cima, o))}</span>
        </div>
        <div class="testo">${esc(cima.testo)}</div>
        ${
          frasi.length
            ? `<div class="frasi-riga">${frasi
                .map((f, i) => `<span class="frase${i === 0 ? ' probabile' : ''}">«${esc(f.testo)}»</span>`)
                .join(' · ')}</div>`
            : ''
        }
      </div>
    </div>`;
}

// ─── l'espansione · L2 - Sidebar, quarto stato ─────────────────────────────

function espansione(m: Motore): string {
  if (!m.espansa) return '';
  // Nella seconda versione il cassetto **è** l'espansione della NOTIFICATIONBAR: si apre
  // nell'angolo invece di prendersi lo schermo, e questa non si disegna affatto.
  if (m.conCassetto && m.espansa === 'NOTIFICATIONBAR') return '';
  const g = m.gruppoAperto();
  // Un gruppo aperto che nel frattempo si è svuotato non esiste più: non si disegna
  // il guscio di una cosa che non c'è (docs/01-modello §6).
  if (typeof m.espansa !== 'string' && !g) return '';

  const lista: readonly Task[] =
    g ? g.membri
    : m.espansa === 'NOTIFICATIONBAR' ? m.in('CARTA').slice().reverse()
    : m.in('CHIP');

  const titolo =
    g ? g.nome
    : m.espansa === 'NOTIFICATIONBAR' ? `${lista.length} ${lista.length === 1 ? 'cosa aspetta' : 'cose aspettano'} te`
    : 'ciò che hai in mano';

  return `
    <div id="velo"></div>
    <div id="elenco">
      <div class="intestazione"><span>${esc(titolo)}</span></div>
      ${lista
        .map((t) => {
          const c = tinta(t);
          return `
        <div class="voce">
          <div class="targa ${c}">
            <span class="icona ${ICONE[t.tipo]}"></span>
            <span>${esc(etichetta(t))}</span>
          </div>
          <div class="testo">${esc(t.testo)}</div>
        </div>`;
        })
        .join('')}
    </div>`;
}

// ─── NOTIFICATIONBAR · seconda versione, in prova ──────────────────────────
// La campanella sta nell'angolo in basso a destra — dove stava la pila — e porta il
// numero di quello che non hai ancora visto. Il cassetto esce da sotto di lei e sale.
//
// **Sta fuori dalla cornice**, come TABLE, per una ragione precisa: la cornice si
// ridisegna da capo a ogni cambiamento, e un nodo che rinasce non si può animare. Qui il
// nodo vive fra un disegno e l'altro e cambia solo classe — è la classe che apre e
// chiude, ed è per questo che l'apertura si vede.
//
// Non è un bottone, nemmeno la campanella: cliccarla dice «apri», come cliccare una
// frase (legge 01). È un indicatore che si può anche premere, non un comando che si può
// anche dire.

let notificheViste = 0;

function notificationbar(radice: HTMLElement, m: Motore, o: Orologio): void {
  const gia = radice.querySelector<HTMLElement>('#notificationbar');
  if (!m.conCassetto) {
    gia?.remove();
    radice.querySelector('#velo-notifiche')?.remove();
    notificheViste = 0;
    return;
  }
  const barra = gia ?? nuovaBarra(radice);
  const aperto = m.cassettoAperto();
  const quante = m.daVedere();

  // La campanella suona quando arriva qualcosa: un movimento corto, una volta sola.
  // Il suono vero è un'altra cosa e sta in `voce/suono.ts` — questo è il suo gesto.
  if (quante > notificheViste) {
    barra.classList.add('suona');
    setTimeout(() => barra.classList.remove('suona'), 700);
  }
  notificheViste = quante;

  const scelta = m.notificaAFuoco();
  // **Una lista sola, in ordine di tempo.** WHEN non è più un'area: quello che ha un'ora
  // sta qui, dopo quello che è arrivato, nella stessa fila (17 settembre 2026). Sopra il
  // passato prossimo, sotto quello che deve ancora succedere, e l'ora accanto a ognuna.
  const righe = [
    ...m.notifiche.map((n) => ({
      quando: n.quando,
      tipo: n.tipo,
      nome: n.nome,
      testo: n.testo,
      chi: n.fonte,
      muta: !n.chiede,
      scelta: scelta?.id === n.id,
      futura: false,
    })),
    ...m.in('ORARIO').map((t) => ({
      quando: t.ora ?? t.tocco,
      tipo: t.tipo,
      nome: t.nome,
      testo: t.testo,
      chi: undefined,
      muta: false,
      scelta: false,
      futura: true,
    })),
  ].sort((a, b) => a.quando.getTime() - b.quando.getTime());

  const cassetto = barra.querySelector<HTMLElement>('.cassetto')!;
  cassetto.innerHTML = righe.length
    ? righe
        .map(
          (r, i) => `
      <div class="riga${r.muta ? ' muta' : ''}${r.scelta ? ' scelta' : ''}${r.futura ? ' futura' : ''}" style="--i:${i}">
        <div class="targa">
          <span class="icona ${ICONE[r.tipo]}"></span>
          <span class="nome">${esc(r.nome)}</span>
          <span class="eta">${esc(r.chi ?? orario(r.quando))}</span>
        </div>
        <div class="testo">${esc(r.testo)}</div>
      </div>`,
        )
        .join('')
    : `<div class="riga vuota"><div class="testo">Non è arrivato niente, e non ti aspetta niente.</div></div>`;

  const campanella = barra.querySelector<HTMLElement>('.campanella')!;
  campanella.dataset.dillo = aperto ? 'chiudi' : 'apri';
  const badge = barra.querySelector<HTMLElement>('.badge')!;
  badge.textContent = String(quante);
  badge.classList.toggle('niente', quante === 0);

  barra.classList.toggle('aperto', aperto);
  // Aprire il cassetto spegne tutto il resto: quello che stai guardando è lì dentro.
  radice.querySelector('#velo-notifiche')?.classList.toggle('aperto', aperto);
  void o;
}

function nuovaBarra(radice: HTMLElement): HTMLElement {
  // Il velo è fratello della barra e non figlio: deve coprire tutto lo schermo, e un
  // figlio di un angolo non può. Vive qui fuori dalla cornice per la stessa ragione
  // della barra — una cosa che si ricostruisce non sfuma, lampeggia.
  const velo = document.createElement('div');
  velo.id = 'velo-notifiche';
  radice.appendChild(velo);
  const barra = document.createElement('div');
  barra.id = 'notificationbar';
  barra.innerHTML = `
    <div class="cassetto"></div>
    <div class="campanella bolla-base" data-dillo="apri">
      <span class="icona icon-bell"></span>
      <span class="badge niente">0</span>
    </div>`;
  radice.appendChild(barra);
  return barra;
}

// ─── INPUT · L2 - INPUT ────────────────────────────────────────────────────
// A riposo non esiste: nessun pallino in attesa, nessun invito, nessuna barra.
// Il punto sta fuori a sinistra e resta fermo; la bolla nasce accanto a lui.
// Dentro non entra mai niente di un task, e non ci sono virgolette: quelle marcano
// ciò che puoi dire, non ciò che hai detto.
//
// **Due modalità** (17 settembre 2026), e non sono due prodotti: sono la stessa cosa
// con un'altra porta d'ingresso (`docs/08-voce §4`).
//
//   - **voce** — il punto pulsa: ti sto sentendo. Il campo c'è perché l'orecchio non è
//     ancora costruito (`04-motore §5`: la trascrizione, nel prototipo, si scrive);
//   - **tastiera** — il microfono è spento. Il punto sta fermo e spento, e il campo
//     prende il fuoco da sé: l'invito diventa «scrivi», perché scrivere non è il
//     ripiego di niente.
//
// Il terzo argomento era «il campo ha il fuoco», che è una cosa del browser. Adesso è
// **il microfono sente**, che è una cosa vera: prima il punto pulsava perché avevi
// cliccato nel campo, e diceva una cosa che non era.

/**
 * Se INPUT c'era al disegno prima. Serve a una cosa sola, e importante: la bolla gioca
 * l'entrata **quando nasce**, non a ogni disegno. `disegna()` rifà la cornice a ogni
 * tasto, e senza questo la bolla rinasceva — e lampeggiava — mentre scrivevi.
 */
let inputCera = false;

/** Cosa la raccolta aveva già agganciato: le pastiglie nuove entrano, le altre stanno. */
let agganciate = new Set<string>();

function input(m: Motore, scritto: string, dove: Pedana['frasi']): string {
  // Il punto pulsa solo in voce: in tastiera non c'è niente che senta, e un pallino
  // che pulsa senza un orecchio dietro è l'unica bugia che l'interfaccia può dire.
  const tastiera = modo() === 'tastiera';
  const ascolta = !tastiera;
  /**
   * **Sta pensando** (17 settembre 2026). Era scritto che «INPUT pulsa» mentre l'AI
   * engine decide, e non era vero: il punto pulsa perché il microfono **sente**, non
   * perché qualcuno stia pensando — e in tastiera il punto non c'è affatto. Quindi
   * scrivevi, premevi invio, e per qualche secondo lo schermo non diceva niente.
   *
   * Il segno prende il posto del marcatore che c'è già — il punto in voce, l'icona
   * della tastiera in scrittura — invece di aggiungersi: il punto d'ingresso è uno, e
   * mentre pensa dice un'altra cosa (legge 03, un posto solo).
   */
  const pensa = staPensando();
  const stai = scritto.trim().length > 0;
  const aperta = m.conversazioneAperta();
  // **In prova** (docs/11-aperte): le frasi dentro INPUT invece che sotto il task.
  const frasi = dove === 'sotto' ? [] : m.frasiCorrenti();
  /**
   * In tastiera il pallino verde davanti alla più probabile sparisce, e a marcarla ci
   * pensa **↵** — il tasto con cui la diresti. Le altre prendono il loro numero
   * (`design/L2 - INPUT` · «Niente pallini, fuori niente»). Restano frasi fra «»: un
   * tasto è una scorciatoia per dirle, non l'etichetta di un bottone.
   */
  const suggerimenti = frasi.length
    ? `<div class="puoi-dire">Puoi dire</div>
       <div class="frasi">${frasi
         .map(
           (f, i) =>
             `<span class="frase${i === 0 ? ' probabile' : ''}">` +
             `${tastiera ? `<span class="tasto">${i === 0 ? '↵' : i + 1}</span>` : ''}` +
             `«${esc(f.testo)}»</span>`,
         )
         .join('')}</div>`
    : '';

  /** La bolla, con la sua entrata solo se prima non c'era. */
  const bolla = (dentro: string): string =>
    `<div class="bolla-voce bolla-base${inputCera ? '' : ' nasce'}">${dentro}</div>`;

  /**
   * La riga da cui entri, in fondo alla bolla: **l'icona della tastiera a 14 px e
   * accanto il campo**. L'icona identifica il punto di input e sta a sinistra di dove
   * scrivi (17 settembre 2026) — dentro la bolla, che è l'eccezione dichiarata: fuori
   * va solo ciò che viene da te *mentre lo dici*, e la tastiera è già scrittura.
   *
   * In tastiera il campo **si vede**, e non c'è nessun `.corrente` che gli faccia da
   * specchio. Lo specchio serve in voce, dove le parole vengono dalla bocca e il campo
   * è una stampella del prototipo: qui il campo *è* l'ingresso, e mostrarne una copia
   * sopra vorrebbe dire scrivere due volte la stessa frase.
   */
  const rigaScrivi = (invita: boolean): string =>
    `<div class="scrivi">
       ${pensa ? '<span class="gira"></span>' : '<span class="icona icon-keyboard"></span>'}
       ${campo(scritto, invita, true)}
     </div>`;

  // In tastiera INPUT non è mai del tutto assente: se sparisse, l'unica porta d'ingresso
  // sarebbe un campo invisibile, e non ci sarebbe niente a dire da dove si entra.
  //
  // Il punto **non c'è**: non spento, assente. Il punto è la voce, e qui la voce non c'è
  // — fuori dalla bolla non resta niente, ed è l'unico caso in tutto il sistema.
  // A riposo in tastiera: niente chat da mostrare, ma la riga da cui scrivi c'è già —
  // e la raccolta si aggancia **mentre** batti, che è l'unica cosa di INPUT che vive
  // durante la frase e non dopo (docs/05-interfaccia §1). Escluderla qui la faceva sparire
  // proprio nel momento in cui serve.
  if (!aperta && tastiera) {
    return `
    <div id="input" class="tastiera">
      ${bolla(`${laRaccolta(m, scritto, stai)}${suggerimenti}${rigaScrivi(!stai)}`)}
    </div>`;
  }

  if (!stai && !aperta) {
    // Il nodo dei 30 secondi, in due righe. Con `input` INPUT sparisce e si porta via
    // le frasi: la carta ambra resta lì e a schermo non c'è più niente che dica cosa
    // puoi dire. Con `input-fisso` INPUT non può essere assente finché una frase c'è —
    // e allora lo stato *assente* di `04-motore §1` quasi non esiste più. Le due cose
    // si guardano, non si discutono.
    if (dove === 'input-fisso' && frasi.length) {
      return `
    <div id="input" class="solo-frasi">
      ${pensa ? '<div class="gira fuori"></div>' : `<div class="punto ${ascolta ? 'sente' : ''}"></div>`}
      ${bolla(`${suggerimenti}${campo(scritto, false)}`)}
    </div>`;
    }
    return `<div id="input" class="assente">${campo(scritto)}</div>`;
  }

  const raccolta = laRaccolta(m, scritto, stai);

  // In tastiera: la chat sopra con gli orari, e in fondo la riga da cui scrivi. Non c'è
  // lo stato «scrittura» di `04-motore §1` come momento separato — il campo è sempre
  // lì, e quello che stai battendo si legge dentro di lui invece che in una copia.
  if (tastiera) {
    return `
    <div id="input" class="tastiera">
      ${bolla(
        `${m.scambioVisibile().map(unGiro).join('')}${raccolta}${suggerimenti}${rigaScrivi(false)}`,
      )}
    </div>`;
  }

  // In voce resta tutto com'era: il punto fuori, e mentre parli la frase si legge nel
  // `.corrente` perché il campo vero è una stampella e sta nascosto.
  const dentro = stai
    ? `<div class="corrente">${esc(scritto)}</div>`
    : `${m.scambioVisibile().map(unGiro).join('')}`;

  return `
    <div id="input">
      ${pensa ? '<div class="gira fuori"></div>' : `<div class="punto ${ascolta ? 'sente' : ''}"></div>`}
      ${bolla(`${dentro}${raccolta}${suggerimenti}${campo(scritto, false)}`)}
    </div>`;
}

/**
 * La raccolta: i file e i concetti agganciati allo scambio (`04-motore §1`). È la terza
 * cosa che sta dentro INPUT, ed è l'unica che compare **mentre** parli.
 *
 * Non la costruisce il disegno: la cerca `raccolta.ts`, che è una ricerca nell'elenco di
 * quello che c'è a schermo e non un pensiero. È l'unica cosa che il 17 settembre 2026 è
 * rimasta di qua dal confine, ed è rimasta perché è **disegno**: per vedere che hai
 * nominato Acme non serve un modello, serve lo stato, e lo stato è qui.
 *
 * Quello che non fa più: **non muove niente.** Prima il nome riconosciuto spostava il
 * fuoco in millisecondi; adesso lo sposta l'AI engine, quando ha deciso. Qui si vede solo
 * *che* l'hai nominata.
 *
 * Mentre scrivi si rilegge a ogni parola — ed è lì che si vede la cosa interessante:
 * il nome si aggancia **prima** che tu abbia finito la frase. A frase mandata, resta
 * quella dell'ultimo scambio: è agganciata a lui, non all'aria.
 */
/**
 * Una mossa dell'AI engine, in una riga. Non è dicibile e non si mostra mai a chi usa il
 * sistema: vive nel registro della pedana, come l'intesa prima di lei.
 */
function mossaInRiga(x: Mossa): string {
  const args = Object.entries(x.chiamata.argomenti)
    .filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('+') : String(v)}`)
    .join(' ');
  // Quello che l'AI engine ha letto in risposta può essere la vista intera: nel registro
  // ne sta una riga, e la prima riga di una fotografia dice già di quando è.
  const visto = x.visto.split('\n')[0] ?? '';
  const coda = visto && visto !== 'fatto' ? ` → ${visto.slice(0, 64)}` : '';
  return `${x.chiamata.nome}${args ? ` ${args}` : ''}${x.comando ? ` · ${x.comando}` : ''}${coda}`;
}

function laRaccolta(m: Motore, scritto: string, stai: boolean): string {
  // A frase mandata si rilegge l'ultima cosa detta: è agganciata a lei, non all'aria.
  const visibile = m.scambioVisibile();
  const frase = stai ? scritto : (visibile[visibile.length - 1]?.tua ?? '');
  const riferimenti: readonly Riferimento[] = frase ? raccolta(frase, m) : [];
  if (riferimenti.length === 0) {
    // Niente agganciato: il prossimo nome è nuovo davvero, e si vede entrare.
    agganciate = new Set();
    return '';
  }
  // Lo stesso nome detto due volte è una cosa sola: la raccolta è un insieme.
  const visti = new Set<string>();
  const chip = riferimenti
    .filter((r) => !visti.has(r.e) && visti.add(r.e))
    .map((r) => {
      const persa = r.ancorata === false ? ' senza-recapito' : '';
      // Si aggancia una volta: quella che c'era già non rientra da sotto a ogni tasto.
      // Senza questo, scrivere faceva rimbalzare tutta la raccolta a ogni carattere.
      const nuova = agganciate.has(r.e) ? '' : ' nuova';
      agganciate.add(r.e);
      // Un task porta la sua icona, una persona porta quella delle persone: la raccolta
      // usa le stesse sette di tutto il sistema, non un secondo alfabeto (legge 06).
      const t = m.task.find((x) => x.id === r.e);
      return `<span class="agganciata${persa}${nuova}">
          <span class="icona ${t ? ICONE[t.tipo] : 'icon-users'}"></span>
          ${esc(r.detto)}
        </span>`;
    })
    .join('');
  return `<div class="raccolta">${chip}</div>`;
}

/** Nessun bordo, nessun fondo, nessuna icona: il campo è la frase. */
function campo(scritto: string, invita = true, tastiera = false): string {
  // L'invito si scrive solo quando la bolla è vuota: dentro una conversazione già
  // aperta sarebbe una riga che non dice niente. In tastiera cambia parola — «dillo o
  // scrivilo» con il microfono spento offrirebbe una porta che non c'è.
  const placeholder = invita && scritto.length === 0 ? (tastiera ? 'scrivi' : 'dillo o scrivilo') : '';
  // `data-tieni` dice al disegno di ridargli il fuoco: in tastiera il campo **è**
  // l'ingresso, e non si deve cliccare per cominciare (src/main.ts).
  return `<input id="scrittura" class="campo" autocomplete="off" spellcheck="false"
    ${tastiera ? 'data-tieni="1"' : ''} placeholder="${placeholder}" />`;
}

/**
 * Un giro di botta e risposta, con l'ora accanto. L'ora è quella **del sistema** — non
 * l'ora vera — o accanto al messaggio si leggerebbe un orario diverso da quello che
 * PROFILEBAR mostra due righe più su (docs/05-interfaccia §1).
 *
 * Si scrive una volta per giro e non per messaggio: la domanda e la risposta sono lo
 * stesso momento, e ripetere l'ora due volte a tre pixel di distanza è rumore.
 */
function unGiro(g: Scambio): string {
  return `
    <div class="giro">
      <div class="ora-giro mono">${orario(g.ora)}</div>
      ${g.tua ? `<div class="tua">${esc(g.tua)}</div>` : ''}
      ${g.risposta ? `<div class="sua">${esc(g.risposta)}</div>` : ''}
    </div>`;
}

// ─── il blocco ─────────────────────────────────────────────────────────────
// Lo schermo bloccato: l'ora grande, il volto al centro, il nome sotto. Il sistema non
// si ferma dietro — il tempo scorre, la posta arriva, i task cambiano stato: un blocco
// **copre**, non spegne, e quando si sblocca si ritrova tutto dov'era e più avanti.
//
// Attenzione: di questa schermata **non esiste un documento di Claude Design**. Le
// misure qui sotto sono una prima proposta presa dal vocabolario che c'è già — lo
// stesso vetro, gli stessi inchiostri, lo stesso margine — e vanno portate di là prima
// di considerarle vere (CLAUDE.md · la separazione).
//
// Niente bottoni, nemmeno qui: si sblocca con una frase, come tutto il resto (legge 01).

function blocco(p: Pedana, o: Orologio): string {
  if (!p.bloccato) return '';
  const d = o.adesso();
  const chi = profilo();
  return `
    <div id="blocco">
      <div class="orologio">
        <div class="ora">${orario(d)}</div>
        <div class="data">${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}</div>
      </div>
      <img class="volto" src="${chi.macchina.volto ?? '/volto.png'}" alt="${esc(chi.utilizzatore)}" />
      <div class="nome">${esc(chi.utilizzatore)}</div>
      <div class="frase probabile" data-sblocca="1">«sblocca»</div>
    </div>`;
}

// ─── la pedana di prova — non fa parte del design ────────────────────────
// Un copione, non un elenco di bottoni: si sceglie un flusso e i passi si premono in
// fila. Ogni passo dice chi parla, cosa dice e cosa devi vedere quando è andato —
// perché una casistica senza un'attesa dichiarata non si può sbagliare, e quindi non si
// può nemmeno studiare. Accanto restano una frase libera e il registro delle mosse.

/**
 * Il vocabolario. Tre cose per riga, e la prima è quella che conta — **il token**, cioè
 * il `Comando` in cui la frase deve tradursi. Dal 17 settembre 2026 a tradurla è il
 * AI engine, da solo, chiamando una delle sue mosse: quello che qui si prova non è più che
 * un parser regga, è che la lingua arrivi dove deve. Sotto, la situazione in cui quella frase vuol dire qualcosa: se manca, la riga
 * è spenta, e premerla la costruisce prima di dire la frase (src/prova/stato.ts).
 *
 * Quando una riga è stata premuta, accanto compare il token uscito davvero — verde se
 * combacia, rosso se no — e sotto quello che ha risposto lei. È lì che si scopre se la
 * lingua regge: non a leggerla, a dirla.
 */
/**
 * La scia: le celle in cui il task a fuoco è passato, in fila, e sotto ognuna chi ce
 * l'ha portato. Il modello tiene solo l'ultima — un task è una posizione, non un diario
 * (docs/01-modello §2) — e questa se le ricorda il banco (src/prova/scia.ts).
 *
 * Serve a vedere una cosa **muoversi**: dici «manda» e la cella cambia sotto gli occhi,
 * e novanta secondi dopo ne compare un'altra che non hai chiesto tu. Senza, di ogni
 * parola si vede solo l'ultimo fotogramma.
 */
function laScia(p: Pedana): string {
  const id = p.scia.daGuardare();
  const passi = id ? p.scia.di(id) : [];
  if (!id || passi.length === 0) {
    return `<div class="scia vuota">niente si è ancora mosso</div>`;
  }
  const tappe = passi
    .map((x, i) => {
      const c = colore(x.avanzamento);
      const tinta = c === 'nessuno' ? 'riposo' : c;
      const adesso = i === passi.length - 1 ? ' adesso' : '';
      // «il mondo» e «nasce» non sono comandi: si scrivono in tondo, come in flussi.ts.
      const suo = x.perche === 'il mondo' || x.perche === 'nasce' ? ' suo' : '';
      return `${i ? '<span class="freccia">→</span>' : ''}
        <span class="tappa ${tinta}${adesso}" title="${orario(x.quando)}">
          <span class="cella">${esc(x.luogo)} · ${esc(x.avanzamento)}</span>
          <span class="perche${suo}">${esc(x.perche)}</span>
        </span>`;
    })
    .join('');
  return `<div class="scia">
      <div class="chi-e">${esc(p.scia.nome(id))}</div>
      <div class="tappe">${tappe}</div>
    </div>`;
}

function corsiaAlfabeto(p: Pedana, m: Motore): string {
  // Lo stato adesso: l'elenco chiuso delle situazioni che sappiamo nominare, accese o
  // spente. Premerne una porta il mondo lì, senza passare da una parola.
  const situazioni = CHIAVI.map((k) => {
    const c = CONDIZIONI[k];
    const ce = c.ce(m);
    const corso = p.provando === k ? ' in-corso' : '';
    // In due parole: qui stanno tutte insieme, e la frase intera si legge passandoci
    // sopra. Dentro una riga invece ci va per intero — lì è il motivo di una parola
    // spenta, e un motivo si scrive.
    return `<button class="situazione${ce ? ' ce' : ''}${corso}" data-prepara="${k}" title="${esc(c.nome)}">${esc(c.corto)}</button>`;
  }).join('');

  const famiglie = p.alfabeto
    .map((fam, fi) => {
      const righe = fam.azioni
        .map((az, ai) => {
          const manca = mancano(m, az.serve);
          // Spenta non vuol dire nascosta: un vocabolario si legge tutto, anche le
          // parole che adesso non si possono dire. Il filtro è un'altra cosa, e si chiede.
          if (p.soloAdesso && manca.length) return '';
          const posto = dove(fi, ai);
          const esito = p.esiti[posto];
          const classi = [
            'azione',
            manca.length ? 'spenta' : '',
            p.provando === posto ? 'in-corso' : '',
          ].filter(Boolean).join(' ');
          const uscito = az.comando && esito
            ? `<span class="token ${esito.uscito === az.comando ? 'regge' : 'rotto'}">${esc(esito.uscito)}</span>`
            : '';
          const serve = (az.serve ?? [])
            .map((k) => `<span class="situazione${manca.includes(k) ? ' manca' : ''}">${esc(CONDIZIONI[k].nome)}</span>`)
            .join('');
          return `
        <div class="${classi}" data-azione="${posto}">
          <div class="capo-azione">
            <span class="token">${esc(az.comando ?? 'mondo')}</span>
            <span class="detta">${az.comando ? `«${esc(dilla(az, m))}»` : esc(dilla(az, m))}</span>
            ${uscito}
          </div>
          <div class="cosa-azione">${esc(az.cosa)}</div>
          ${serve ? `<div class="serve">serve · ${serve}</div>` : ''}
          ${esito?.senzaStato ? `<div class="serve rotta">lo stato che serviva non si è potuto costruire</div>` : ''}
          ${esito?.risposta ? `<div class="detto">${esc(esito.risposta)}</div>` : ''}
        </div>`;
        })
        .join('');
      if (!righe.trim()) return '';
      return `<div class="famiglia"><div class="capo">${esc(fam.nome)} · ${esc(fam.perche)}</div>${righe}</div>`;
    })
    .join('');

  return `<div class="corsia copione vocabolario">
      <div class="capo">il task a fuoco · dove sta, e da dove viene</div>
      ${laScia(p)}
      <div class="capo">lo stato adesso · premine una e il banco ti ci porta</div>
      <div class="situazioni">${situazioni}</div>
      <div class="bottoni">
        <button class="prova${p.soloAdesso ? ' forte' : ''}" data-filtro="1">
          ${p.soloAdesso ? 'solo quello che si può dire adesso' : 'tutto il vocabolario'}
        </button>
        <button class="prova" data-svuota="1">svuota il mondo</button>
      </div>
      ${famiglie}
    </div>`;
}

/**
 * Il banco di chi inventa. Serve a una cosa sola: **provare un caso che ti viene in
 * mente adesso**, senza aprire un file. Quello che parte di qui entra dalla stessa
 * porta delle cose in scenario, quindi il filtro non sa che è nuova.
 *
 * I campi sono in due gruppi e si vede. Sopra i tre che **decidono dove va a finire** —
 * ti nomina, c’è qualcosa da fare, fra quanti minuti scade; sotto quello che si legge
 * e si sente. Non c’è un’anteprima di dove cadrà, ed è apposta: quella la sa il
 * filtro, e riscriverla qui vorrebbe dire tenerne due copie d’accordo (CLAUDE.md).
 */
function corsiaComponi(p: Pedana): string {
  const c = p.composto;
  const opzioni = (valori: readonly string[], scelto: string) =>
    valori.map((v) => `<option value="${esc(v)}"${v === scelto ? ' selected' : ''}>${esc(v)}</option>`).join('');

  const campo = (id: string, etichetta: string, valore: string, segnaposto = '') => `
    <label class="riga-componi"><span>${esc(etichetta)}</span>
      <input id="${id}" class="campo-prova" value="${esc(valore)}" placeholder="${esc(segnaposto)}" />
    </label>`;

  const spunta = (id: string, etichetta: string, acceso: boolean) => `
    <label class="riga-componi spunta"><span>${esc(etichetta)}</span>
      <input id="${id}" type="checkbox"${acceso ? ' checked' : ''} />
    </label>`;

  return `<div class="corsia componi">
    <div class="capo">chi la fa arrivare</div>
    <label class="riga-componi"><span>servizio</span>
      <select id="componi-fonte" class="campo-prova">${opzioni(['posta', 'calendario', 'promemoria'], c.fonte)}</select>
    </label>
    <label class="riga-componi"><span>tipo</span>
      <select id="componi-tipo" class="campo-prova">${opzioni(
        ['posta', 'cartella', 'documento', 'persone', 'conversazione', 'immagine', 'sveglia'],
        c.tipo,
      )}</select>
    </label>

    <div class="capo">quello che decide dove va a finire</div>
    ${spunta('componi-perte', 'ti nomina', c.perTe)}
    ${spunta('componi-azionabile', 'c’è qualcosa da fare', c.azionabile)}
    ${campo('componi-fra', 'scade fra (minuti)', c.fra, 'vuoto: nessuna scadenza')}

    <div class="capo">quello che si legge e si sente</div>
    ${campo('componi-nome', 'nome', c.nome, 'due parole')}
    ${campo('componi-testo', 'la riga', c.testo, 'dicibile ad alta voce')}
    ${campo('componi-dachi', 'da chi', c.daChi)}
    ${campo('componi-ingresso', 'il testo intero', c.ingresso, 'quello che l’AI engine apre')}
    ${campo('componi-esito', 'già pronto', c.esito, 'quello che il task porta con sé')}
    ${campo('componi-a', 'risponde a', c.a, 'vuoto: non ha un modo di uscire')}

    <div class="bottoni">
      <button class="prova forte" data-inventa="1">fai arrivare</button>
    </div>
    ${p.inventata ? `<div class="anteprima">è arrivata: ${esc(p.inventata)}</div>` : ''}
  </div>`;
}

function pedana(p: Pedana, o: Orologio, m: Motore): string {
  if (!p.aperta) return `<div id="pedana"><button id="pallino" title="prova"></button></div>`;

  const copione = p.vista === 'copione';
  const schede =
    p.flussi
      .map((f, i) => `<button class="scheda${copione && i === p.scelto ? ' scelta' : ''}" data-flusso="${i}">${esc(f.nome)}</button>`)
      .join('') +
    `<button class="scheda alfabeto${p.vista === 'alfabeto' ? ' scelta' : ''}" data-vocabolario="1">l’alfabeto</button>` +
    `<button class="scheda alfabeto${p.vista === 'componi' ? ' scelta' : ''}" data-componi="1">inventa</button>`;

  const flusso = p.flusso;
  const passi = flusso
    ? flusso.passi.map((x, i) => unPasso(x, i, p.passo)).join('')
    : '';

  const finito = flusso ? p.passo >= flusso.passi.length : true;

  // Il registro: le mosse che l'AI engine ha chiesto, e cosa gli hanno risposto. Prima
  // erano le intese del locale — il metalinguaggio fra due cervelli — e adesso sono il
  // verbale di uno solo. Si studia, non si mostra a chi usa il sistema.
  const registro = m.mosse
    .slice(-5)
    .reverse()
    .map(
      (x) =>
        `<div class="riga-registro${x.sbagliata ? ' storta' : ''}"><span class="ora-registro">${orarioVero(x.quando)}</span>${esc(mossaInRiga(x))}</div>`,
    )
    .join('') || '<div class="riga-registro vuoto">niente ancora</div>';

  return `
    <div id="pedana" class="aperta">
      <div class="prove">

        <div class="corsia larga schede">${schede}</div>

        ${
          copione
            ? `<div class="corsia copione">
          <div class="capo">${esc(flusso?.perche ?? '')}</div>
          ${passi}
          <div class="bottoni">
            <button class="prova forte" data-avanti="1"${finito ? ' disabled' : ''}>
              ${finito ? 'finito' : 'avanti →'}
            </button>
            <button class="prova" data-daccapo="1">da capo</button>
          </div>
        </div>`
            : p.vista === 'componi'
              ? corsiaComponi(p)
              : corsiaAlfabeto(p, m)
        }

        <div class="corsia">
          <div class="capo">fuori copione · la dice l’AI engine</div>
          <input id="pedana-frase" class="campo-prova" placeholder="mandala a Paolo" value="${esc(p.frase)}" />
          <div class="bottoni">
            <button class="prova" data-leggi="1">la vista</button>
            <button class="prova" data-applica-frase="1">dilla</button>
          </div>
          ${p.anteprima ? `<div class="anteprima">${esc(p.anteprima)}</div>` : ''}

          <div class="capo">in prova · la NOTIFICATIONBAR</div>
          <div class="bottoni">
            <button class="prova forte" data-cassetto="1">${
              m.conCassetto ? 'la campanella e il cassetto' : 'la pila delle carte'
            }</button>
          </div>

          <div class="capo">in prova · dove stanno le frasi</div>
          <div class="bottoni">
            <button class="prova forte" data-frasi="1">${
              p.frasi === 'sotto'
                ? 'sotto il task'
                : p.frasi === 'input'
                  ? 'in INPUT'
                  : 'in INPUT, e INPUT resta'
            }</button>
          </div>

          <div class="capo">la sessione · chi c'è davanti allo schermo</div>
          <div class="bottoni">
            <button class="prova" data-blocca="1">blocca utente</button>
          </div>

          <div class="capo registro">il registro delle mosse</div>
          ${registro}
        </div>

        <div class="quando mono">${orario(o.adesso())}</div>
      </div>
      <button id="pallino" title="prova"></button>
    </div>`;
}

/** Un passo del copione. Quelli di `lei` non si premono: sono quello che deve rispondere. */
function unPasso(x: Passo, i: number, adesso: number): string {
  const stato = i < adesso ? 'fatto' : i === adesso ? 'adesso' : 'dopo';
  const premibile = x.fai ? ` data-passo="${i}"` : '';
  return `
    <div class="passo ${stato} ${x.chi}"${premibile}>
      <span class="chi">${x.chi}</span>
      <span class="cosa">${esc(x.cosa)}</span>
      ${x.attesa ? `<span class="attesa">${esc(x.attesa)}</span>` : ''}
    </div>`;
}

/** L'ora vera, non quella del sistema: il registro vive nel nostro tempo. */
function orarioVero(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ─── minuzie ──────────────────────────────────────────────────────────────

/** L1 - Bubble · il colore vive nella targa, mai nelle lettere del titolo. */
function tinta(t: Task): string {
  const c = colore(t.avanzamento);
  return c === 'salvia' ? 'salvia' : c === 'ambra' ? 'ambra' : c === 'rosso' ? 'rosso' : 'riposo';
}

/** La targa porta lo stato con le parole del dominio, non con quelle del modello. */
function etichetta(t: Task): string {
  switch (t.avanzamento) {
    case 'in corso': return 'ci sto lavorando';
    case 'aspetta te': return 'aspetta te';
    case 'programmato': return t.ora ? orario(t.ora) : 'più tardi';
    case 'bloccato': return 'ferma';
    case 'concluso': return 'fatto';
    case 'consegnato': return 'mandata';
  }
}

/** L'età sta nella targa, a destra: da dove viene e dov'è arrivata. */
function eta(t: Task, o: Orologio): string {
  const minuti = Math.floor((o.adesso().getTime() - t.nascita.getTime()) / 60000);
  if (minuti < 1) return 'adesso';
  if (minuti < 60) return `${minuti} min`;
  return orario(t.nascita);
}


