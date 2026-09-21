// Le regole dell'AI engine finto: come decide quali mosse chiamare, finché non pensa.
//
// Era il locale — un parser, non un modello — e il 17 settembre 2026 non è stato
// buttato: è stato **spostato oltre il confine**. Non è più un cervello davanti al
// AI engine che gli filtra le frasi; è il modo in cui l'AI engine *finto* fa le veci di
// quello vero, esattamente come i servizi finti di `docs/06-confini §4` fanno le veci
// dei veri. Da dentro è indistinguibile: escono le stesse chiamate.
//
// La differenza è tutta qui, e vale la pena scriverla: prima queste righe **decidevano**
// — quali frasi meritavano l'AI engine e quali no. Adesso **simulano**: sono la forma di
// ciò che farà un modello, e servono a vedere le catene girare senza rete. Il giorno in
// cui la porta risponde, questo file non viene più chiamato e il motore non cambia di
// una riga.

import type { Motore } from '../modello/motore.ts';
import type { Comando } from '../modello/tipi.ts';

/**
 * Quello che le regole leggono in una frase. Non è un `Comando`: è un comando **più due
 * parole che il modello non ha** e che servono solo qui.
 *
 * `sequenza` era un comando, e non lo è più: più mosse in un turno sono più chiamate, e
 * srotolarle è un mestiere dell'AI engine, non del motore. `aperta` era il modo in cui il
 * locale diceva «questa non la capisco, serve l'AI engine» — e adesso chi legge la frase
 * *è* l'AI engine, quindi vuol dire soltanto «qui bisogna pensare».
 */
export type Lettura =
  | Comando
  | { readonly tipo: 'sequenza'; readonly comandi: readonly Lettura[] }
  | { readonly tipo: 'aperta'; readonly frase: string };

/** I cinque verbi di apertura. Dentro una conversazione aperta non serve ripeterli. */
export const VERBI = ['senti', 'trova', 'scrivi', 'dimmi', 'aspetta'] as const;
export type Verbo = (typeof VERBI)[number];

const ORDINALI: Record<string, number> = {
  prima: 1,
  seconda: 2,
  terza: 3,
  quarta: 4,
};

export function interpreta(frase: string, m: Motore): Lettura {
  const f = pulisci(frase);
  // La frase con il verbo ancora attaccato: «scrivi a mia madre» comincia con un verbo
  // di apertura, e senza di lui non si distingue da un'altra cosa.
  const grezza = frase.toLowerCase().replace(/[«»"'.!?]/g, '').replace(/\s+/g, ' ').trim();
  if (!f) return { tipo: 'aperta', frase };

  // Più comandi in una frase sola (docs/09-catene §5). Si spezza solo quando il secondo
  // pezzo è un mandare secco in fondo: «aggiungi un cuore **e invia**». «Scrivi a mia
  // madre e chiedile…» non si spezza, perché lì la seconda metà è il contenuto.
  const catena = f.match(/^(.+?) e (invia|inviala|invialo|mandalo|mandala|manda|spediscil[ao])$/);
  if (catena?.[1]) {
    const primo = interpreta(catena[1], m);
    const b = m.aFuoco();
    if (b && primo.tipo !== 'aperta') {
      return { tipo: 'sequenza', comandi: [primo, { tipo: 'consegna', task: b.id }] };
    }
  }

  // Scrivere a qualcuno è **comporre**, non consegnare: nasce un testo da guardare, e
  // finché non dici di mandarlo non esce niente (docs/09-catene §3).
  const scrittura = grezza.match(
    /^(?:adesso |poi |ora |e )?(?:manda|invia|spedisci|scrivi)(?: (?:un|una|il|lo|la|due))?(?: messaggio| mail| email| sms| righe| whatsapp)? (?:a|ad) (.+)$/,
  );
  if (scrittura?.[1]) {
    const resto = scrittura[1];
    const taglio = resto.match(/^(.+?) e (.+)$/);
    return taglio?.[1] && taglio[2]
      ? { tipo: 'componi', a: taglio[1], richiesta: taglio[2] }
      : { tipo: 'componi', a: resto, richiesta: '' };
  }

  // Tornare dov'eri: non è un richiamo per nome, è il fuoco che fa un passo indietro.
  if (/^(torna (?:su|sulla|sul|a|al|alla) (?:quell[ao] |la |il )?(?:task |bolla |cosa )?(?:precedente|di prima)|torna indietro|dicevamo)/.test(f)) {
    return { tipo: 'indietro' };
  }

  // «no» è una risposta, e non muove niente. Va prima di tutto il resto o «no» finisce
  // fra le frasi che non si capiscono, e una risposta capita è meglio di un'aperta.
  if (/^(no|no grazie|nemmeno|per adesso no)$/.test(f)) return { tipo: 'no' };

  // «aspetta» è sempre udibile, anche a bolla chiusa — ma «no, aspetta» è un'altra cosa.
  if (/^no,? ?aspetta/.test(f)) {
    const consegnato = m.task.find((t) => t.avanzamento === 'consegnato');
    return consegnato
      ? { tipo: 'annulla', task: consegnato.id }
      : { tipo: 'aperta', frase };
  }
  if (f === 'aspetta') return { tipo: 'aspetta' };

  // Spegnere il microfono. Le frasi sono tre modi di dire la stessa cosa, e la prima è
  // quella che verrebbe da dire: «non ascoltare». Riaccenderlo non è qui, e non lo sarà:
  // col microfono spento nessuna frase arriva (src/conoscenza/canali.ts).
  if (/^(non ascoltare|non mi ascoltare|scrivo|adesso scrivo|preferisco scrivere|spegni il microfono)$/.test(f)) {
    return { tipo: 'non-ascoltare' };
  }

  // La voce in uscita. Due versi, perché la bocca non ha l'impossibilità dell'orecchio.
  if (/^(non leggere|non leggermelo|taci|stai zitta|silenzio|spegni la voce|niente voce)$/.test(f)) {
    return { tipo: 'voce', come: 'spenta' };
  }
  if (/^(torna a leggere|leggi ad alta voce|riaccendi la voce|parla|puoi parlare)$/.test(f)) {
    return { tipo: 'voce', come: 'accesa' };
  }

  if (/^chiudi/.test(f)) return { tipo: 'chiudi' };

  // ─── il cassetto delle notifiche (NOTIFICATIONBAR, seconda versione) ────
  // «apri» secco è il cassetto; «aprila» è il dentro del task a fuoco; «apri Acme» è il
  // gruppo. Tre frasi vicine e tre cose diverse: la differenza la fa quello che segue,
  // e l'ordine qui sotto è quello che la tiene (legge 01, mai due che fanno lo stesso).
  if (/^(apri|apri le notifiche|apri il cassetto|cosa è arrivato|cos è arrivato)$/.test(f)) {
    return { tipo: 'mostra', area: 'NOTIFICATIONBAR' };
  }
  if (/^(me ne occupo|tienila|tienilo|prendila|prendilo|falla diventare un task)$/.test(f)) {
    const n = m.notificaAFuoco();
    if (n) return { tipo: 'estrai', notifica: n.id };
  }

  // La risposta a «non ho capito quale»: si dice quale, e basta il nome (docs/01-modello §5).
  // Sta qui, prima del richiamo, perché con un blocco aperto «proposta acme» non è un
  // richiamo: è la risposta a una domanda. Senza questo, `sciogli` era una parola che il
  // modello conosceva e che nessuna frase sapeva pronunciare.
  const inDubbio = m.task.find((t) => t.alternative?.length);
  if (inDubbio?.alternative) {
    const scelto = inDubbio.alternative.find((id) => {
      const t = m.task.find((x) => x.id === id);
      return t !== undefined && f.includes(t.nome.toLowerCase());
    });
    if (scelto) return { tipo: 'sciogli', task: scelto };
  }

  // L'archivio: si racconta, non si mostra (docs/07-memoria §9).
  if (/^(cosa (ti sei segnato|hai segnato)|che cosa ti sei segnato)/.test(f)) {
    return { tipo: 'racconta', su: 'ultima' };
  }
  if (/^cosa fai da solo/.test(f)) return { tipo: 'racconta', su: 'preferenze' };
  const su = f.match(/^cosa (?:sai|ti ricordi) (?:di|su|della|del|dello) (.+)$/);
  if (su?.[1]) return { tipo: 'racconta', su: su[1] };
  if (/^(dimenticalo|dimenticala|dimentica|non è vero|non e vero)$/.test(f)) {
    return { tipo: 'dimentica' };
  }
  if (/^(chiedimi sempre|non fare da solo|chiedimelo sempre)$/.test(f)) return { tipo: 'revoca' };
  // «sì» vuol dire sì a quello che ti ha appena chiesto: o mandi, o confermi un'abitudine.
  // La conferma si rinforza — «sì, è vero», «sì, fai pure» — ed è la forma che
  // docs/07-memoria §8 disegna. Le due metà vengono da due insiemi chiusi: la
  // grammatica resta chiusa anche quando la frase si allunga.
  if (/^(sì|si|va bene|fai pure|certo|d'accordo|daccordo)(,? (è vero|e vero|fai pure|va bene|certo|grazie|giusto))?$/.test(f)) {
    const b = m.aFuoco();
    if (b?.uscita && b.avanzamento === 'aspetta te') return { tipo: 'consegna', task: b.id };
    return { tipo: 'conferma' };
  }

  const nota = f.match(/^(?:segnati|segnatelo|ricordati|prendi nota)(?: che| di)? (.+)$/);
  if (nota?.[1]) return { tipo: 'aperta', frase: nota[1] };
  const appunto = f.match(/^(?:mettilo nelle note|salva nelle note|nelle note)[: ]?(.*)$/);
  if (appunto) return { tipo: 'salva-nota', testo: (appunto[1] ?? '').trim() || frase };
  if (/(fammi vedere le altre|le altre|cosa aspetta)/.test(f)) {
    return { tipo: 'mostra', area: 'NOTIFICATIONBAR' };
  }
  if (/cosa (hai|ho) in mano/.test(f)) return { tipo: 'mostra', area: 'TASKBAR' };
  // «cosa mi aspetta» non apre più un'area sua: le cose con un'ora stanno nel cassetto,
  // in fila con quelle arrivate (17 settembre 2026).
  if (/cosa mi aspetta/.test(f)) return { tipo: 'mostra', area: 'NOTIFICATIONBAR' };

  const ordinale = f.match(/^(?:la |il )?(prima|seconda|terza|quarta)$/);
  if (ordinale?.[1]) {
    const indice = ORDINALI[ordinale[1]];
    if (indice) return { tipo: 'scegli', indice };
  }

  const richiamo = f.match(/^(?:torna (?:a|al|alla) |riprendi (?:il |la )?)(.+)$/);
  if (richiamo?.[1]) return { tipo: 'richiama', nome: richiamo[1] };

  // ─── i gruppi (docs/01-modello §6) ──────────────────────────────────────
  // Stanno qui, prima di «manda» e «dopo», perché «manda tutte» non è «manda» e un
  // «dopo» detto a gruppo aperto parla al gruppo, non alla cosa che avevi in mano.

  const aperto = m.gruppoAperto();
  if (aperto) {
    if (/^manda tutte/.test(f)) return { tipo: 'consegna-gruppo', gruppo: aperto.nome };
    if (/^(separale|separali|separa|dividile|dividili)/.test(f)) {
      return { tipo: 'separa', gruppo: aperto.nome };
    }
    if (/^(dopo|rimandale|rimandali|più tardi|piu tardi)/.test(f)) {
      return { tipo: 'rimanda-gruppo', gruppo: aperto.nome };
    }
  }
  // Un gruppo solo si lascia mandare anche senza aprirlo: non c'è ambiguità su quale.
  if (/^manda tutte/.test(f)) {
    const soli = m.gruppi();
    return soli.length === 1 && soli[0]
      ? { tipo: 'consegna-gruppo', gruppo: soli[0].nome }
      : { tipo: 'aperta', frase };
  }

  // Il nome del gruppo lo scegli tu, e «Acme» non è «acme»: si prende dalla frase
  // com'era, non da quella schiacciata in minuscolo.
  const messa = f.match(/^mett(?:ila|ilo|i) (?:con|in|dentro|nel gruppo|insieme a) (.+)$/);
  if (messa?.[1]) {
    const b = m.aFuoco();
    if (b) return { tipo: 'metti', task: b.id, gruppo: coda(frase, messa[1].length) };
  }
  // «aprila» mostra, «leggila» dice: due frasi vicine, due cose diverse (§7).
  if (/^(aprila|aprilo|guardiamola|guardiamolo|fammi vedere cosa c.è dentro|mostramela per intero)$/.test(f)) {
    const b = m.aFuoco();
    if (b) return { tipo: 'dentro', task: b.id };
  }
  const apertura = f.match(/^(?:apri|fammi vedere)(?: il gruppo| quelle di| quelli di)? (.+)$/);
  if (apertura?.[1]) {
    const nome = apertura[1];
    const g = m.gruppi().find((x) => x.nome.toLowerCase() === nome);
    if (g) return { tipo: 'apri', gruppo: g.nome };
  }
  const separa = f.match(/^(?:separa|dividi|sciogli il gruppo) (.+)$/);
  if (separa?.[1]) {
    const nome = separa[1];
    const g = m.gruppi().find((x) => x.nome.toLowerCase() === nome);
    if (g) return { tipo: 'separa', gruppo: g.nome };
  }

  const bersaglio = m.aFuoco();

  if (/^riprova/.test(f)) {
    const fermo = m.task.find((t) => t.avanzamento === 'bloccato');
    return fermo ? { tipo: 'consegna', task: fermo.id } : { tipo: 'aperta', frase };
  }
  if (/^lascia stare/.test(f)) {
    const fermo = m.task.find((t) => t.avanzamento === 'bloccato') ?? bersaglio;
    return fermo ? { tipo: 'lascia', task: fermo.id } : { tipo: 'aperta', frase };
  }

  // Leggere una cosa che non stai guardando: la porta a fuoco **e** la dice. Se nomini
  // quello che è appena arrivato, il bersaglio è quello e non ciò che avevi in mano.
  if (/^(leggi|leggila|leggilo|leggimel[ao]|leggimi)/.test(f)) {
    const arrivata = /(notifica|mail|email|messaggio|posta|carta|arrivat)/.test(f) ? m.inCima() : undefined;
    const quale = arrivata ?? bersaglio;
    if (quale) return { tipo: 'leggi', task: quale.id };
  }

  if (!bersaglio) return { tipo: 'aperta', frase };

  // Il riassunto: da qualunque forma della domanda, perché è la cosa che si chiede di più.
  if (/(riassum|riassunto|di cosa si tratta|cosa c.è scritto|cosa dice)/.test(f)) {
    return { tipo: 'riassumi', task: bersaglio.id };
  }

  // «metti da parte» non è una quarta uscita: è «dopo» detto in un altro modo, e il
  // sistema risponde dicendoti fra quanto te lo rimette davanti (docs/11-aperte).
  if (/(metti da parte|mettil[ao] da parte|ci penso (dopo|poi|più tardi|piu tardi))/.test(f)) {
    return { tipo: 'rimanda', task: bersaglio.id };
  }

  const aggiunta = f.match(/^aggiungi(?:ci)? (.+)$/);
  if (aggiunta?.[1]) return { tipo: 'aggiungi', task: bersaglio.id, cosa: aggiunta[1] };

  if (/^(riscrivil[ao]|riscrivi|dillo in un altro modo|cambia le parole)/.test(f)) {
    return { tipo: 'riscrivi', task: bersaglio.id };
  }

  if (/^manda/.test(f)) return { tipo: 'consegna', task: bersaglio.id };
  if (/^(dopo|rimandala|più tardi|piu tardi)/.test(f)) {
    return { tipo: 'rimanda', task: bersaglio.id };
  }
  if (/(portala al centro|al centro|portala qui)/.test(f)) {
    return { tipo: 'al-centro', task: bersaglio.id };
  }

  return { tipo: 'aperta', frase };
}

/**
 * Le ultime `quante` lettere della frase **come l'hai detta**, tolti i segni e il verbo
 * di apertura — cioè la stessa ripulitura di `pulisci`, ma senza schiacciare le
 * maiuscole. Serve ai nomi che scegli tu: un gruppo si chiama «Acme», non «acme».
 */
function coda(frase: string, quante: number): string {
  let o = frase.replace(/[«»"'.!?]/g, '').replace(/\s+/g, ' ').trim();
  const basso = o.toLowerCase();
  for (const v of VERBI) {
    if (basso.startsWith(v + ' ')) {
      o = o.slice(v.length + 1);
      break;
    }
  }
  return o.slice(o.length - quante);
}

function pulisci(frase: string): string {
  let f = frase
    .toLowerCase()
    .replace(/[«»"'.!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Il verbo è la prima parola, non un risveglio separato: si toglie e si va avanti.
  for (const v of VERBI) {
    if (f.startsWith(v + ' ')) {
      f = f.slice(v.length + 1);
      break;
    }
  }
  return f;
}
