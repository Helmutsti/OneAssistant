// Fa girare le casistiche senza browser: le stesse cose che si premono sulla pedana.
// Niente parte da solo, qui come a schermo — il tempo passa solo dove c'è `avanza`.
//
//   npm run scenario

import { Orologio, MINUTO } from '../modello/tempo.ts';
import { Motore } from '../modello/motore.ts';
import { Posta } from '../confini/posta.ts';
import { Note } from '../confini/note.ts';
import { Contatti } from '../confini/contatti.ts';
import { Calendario } from '../confini/calendario.ts';
import { Promemoria } from '../confini/promemoria.ts';
import { Disco } from '../confini/disco.ts';
import { Archivio } from '../archivio/archivio.ts';
import { contesto } from '../conoscenza/contesto.ts';
import { leggiProfilo, codiceLingua } from '../conoscenza/profilo.ts';
import { AiEngineFinto } from '../ai-engine/finto.ts';
import { turnoSubito } from '../ai-engine/ai-engine.ts';
import { SecondarioFinto, lavora } from '../ai-engine/secondari.ts';
import { chiama } from '../ai-engine/api.ts';
import { MOSSE_SECONDARIE } from '../ai-engine/strumenti.ts';
import { ALFABETO, prova } from './alfabeto.ts';
import { dentroSiVede } from '../modello/tipi.ts';
import { COMANDI } from '../modello/tipi.ts';
import { Turno, riepiloga } from '../voce/turno.ts';
import type { Bocca } from '../voce/bocca.ts';
import { provaLaTimeline, provaIlLibero } from './timeline-prova.ts';
import { primoNome } from '../modello/motore.ts';

const orologio = new Orologio(new Date(2025, 8, 15, 9, 41, 0));
const posta = new Posta();
const note = new Note();
const disco = new Disco();
const archivio = new Archivio(disco, contesto.utilizzatore);
const contatti = new Contatti();
// Leggono l'orologio del banco, che è fermo al 15 settembre 2025 e si muove solo quando
// lo si spinge: le loro proposte hanno un'ora, e dev'essere la stessa che legge il filtro.
const calendario = new Calendario(() => orologio.adesso());
const promemoria = new Promemoria(() => orologio.adesso());
const motore = new Motore(orologio, { posta, note, contatti, calendario, promemoria }, archivio);
posta.osserva((p) => motore.accogli(p));
calendario.osserva((p) => motore.accogli(p));
promemoria.osserva((p) => motore.accogli(p));

/** Far passare del tempo a mano: è l'unico modo che ha di passare. */
const avanza = (ms: number) => orologio.salta(ms);

const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));

let errori = 0;
function verifica(cosa: string, atteso: unknown, ottenuto: unknown, dettaglio?: unknown): void {
  const ok = JSON.stringify(atteso) === JSON.stringify(ottenuto);
  if (!ok) errori++;
  const perche = dettaglio === undefined ? '' : ` · ${JSON.stringify(dettaglio)}`;
  console.log(`${ok ? '  ok ' : '  NO '} ${cosa}${ok ? '' : ` — atteso ${JSON.stringify(atteso)}, ottenuto ${JSON.stringify(ottenuto)}${perche}`}`);
}

/**
 * Come in main.ts: la frase va all'AI engine, e l'AI engine chiama le mosse (docs/03-architettura).
 * Qui l'AI engine è il finto, che risponde senza rete: si legge lo stato alla riga dopo
 * invece che in una promessa, ed è l'unico modo in cui una casistica si legge.
 */
const pensiero = new AiEngineFinto(motore);
motore.conSecondari((lavoro, dentro, quale) =>
  lavora(new SecondarioFinto(motore, () => dentro, quale), lavoro, motore, orologio, dentro),
);
function dillo(frase: string): void {
  turnoSubito(pensiero, frase, motore, orologio);
}

/**
 * Un banco pulito. I flussi di docs/07 vogliono uno schermo vuoto: una catena si legge
 * solo se non c'è già qualcosa a fuoco che se ne prende i comandi.
 */
function banco() {
  const suo = new Posta();
  const sue = new Contatti();
  const suoCalendario = new Calendario(() => orologio.adesso());
  const suoiPromemoria = new Promemoria(() => orologio.adesso());
  const m = new Motore(
    orologio,
    { posta: suo, note, contatti: sue, calendario: suoCalendario, promemoria: suoiPromemoria },
    archivio,
  );
  suo.osserva((p) => m.accogli(p));
  suoCalendario.osserva((p) => m.accogli(p));
  suoiPromemoria.osserva((p) => m.accogli(p));
  // Ogni banco ha il suo pensiero: guarda il suo motore, e non quello di un altro.
  const suoPensiero = new AiEngineFinto(m);
  // Ogni banco ha i suoi secondari, sul suo motore: uno che lavorasse su un altro
  // schermo riporterebbe di una cosa che qui non c'è.
  m.conSecondari((lavoro, dentro, quale) =>
    lavora(new SecondarioFinto(m, () => dentro, quale), lavoro, m, orologio, dentro),
  );
  const dillo = (frase: string) => turnoSubito(suoPensiero, frase, m, orologio);
  // Gli attrezzi sono gli stessi di main.ts: una parola dell'alfabeto si prova da qui
  // esattamente come si prova a schermo, o non si sta provando la stessa cosa.
  return {
    posta: suo,
    m,
    dillo,
    attrezzi: {
      posta: suo,
      calendario: suoCalendario,
      promemoria: suoiPromemoria,
      orologio,
      motore: m,
      dillo,
    },
  };
}

async function corri(): Promise<void> {
  console.log('\nuna mail che arriva, passa il filtro e viene consegnata\n');

  // Niente parte da solo: la mail arriva quando la si fa arrivare (src/prova/pedana.ts).
  posta.fai('Proposta Acme');
  verifica('la mail passa il filtro e diventa una carta', 1, motore.in('CARTA').length);
  verifica('la carta aspetta te', 'aspetta te', motore.inCima()?.avanzamento);
  verifica('le frasi sono tre', ['manda', 'dopo', 'portala al centro'], motore.inCima()?.frasi.map((f) => f.testo));

  posta.fai('Newsletter');
  posta.fai('Fattura Acme');
  verifica('newsletter e fattura non passano il filtro', 1, motore.in('CARTA').length);

  console.log('\nnominare un task lo porta a fuoco, e nient’altro\n');
  const prima = motore.inCima()!.avanzamento;
  dillo('della proposta acme che ne facciamo');
  verifica('il task nominato prende il fuoco', 'MAIN', motore.main()?.luogo);
  verifica('l’avanzamento non si muove', prima, motore.main()?.avanzamento);
  verifica('le frasi sono le sue', true, motore.frasiCorrenti() === motore.main()?.frasi);
  verifica('lo scambio resta in INPUT', 'della proposta acme che ne facciamo', motore.scambio[motore.scambio.length - 1]?.tua);

  dillo('manda');
  verifica('è uscita dalla pila', 0, motore.in('CARTA').length);
  verifica('va avanti da sola come chip', ['CHIP', 'in corso'], [motore.in('CHIP')[0]?.luogo, motore.in('CHIP')[0]?.avanzamento]);

  await attesa(700);
  verifica('la consegna è andata', 'consegnato', motore.in('CHIP')[0]?.avanzamento);
  verifica('la risposta è dicibile', true, /Mandata a Andrea Riva/.test(motore.ultimaRisposta));
  verifica('offre di annullare', ['no, aspetta'], motore.in('CHIP')[0]?.frasi.map((f) => f.testo));

  avanza(2 * MINUTO);
  verifica('dopo 90 secondi cade nella memoria', 1, motore.in('MEMORIA').length);
  verifica('la posta ricorda la consegna', 1, posta.leggi().length);

  console.log('\nuna consegna che fallisce\n');
  posta.guasta = true;
  avanza(0);
  // Ne serve un'altra: la prima è già in memoria. Si rimanda in gioco a mano.
  const secondo = motore.task[0]!;
  secondo.luogo = 'CARTA';
  secondo.avanzamento = 'aspetta te';
  dillo('manda');
  await attesa(700);
  verifica('il task si blocca', 'bloccato', motore.in('CHIP')[0]?.avanzamento);
  verifica('il blocco ha sempre un’uscita', ['riprova', 'lascia stare'], motore.in('CHIP')[0]?.frasi.map((f) => f.testo));

  dillo('lascia stare');
  verifica('lasciata stare', 'concluso', motore.in('MEMORIA')[0]?.avanzamento);

  console.log('\nil calendario e i promemoria: due confini che prima non c’erano\n');
  {
    // Un banco pulito: qui si guarda il filtro, e la pila di prima lo falserebbe.
    const { m, attrezzi } = banco();

    attrezzi.calendario.fai('Invito Pettinelli');
    verifica('l’invito è per te, ed è adesso: diventa una carta', 1, m.in('CARTA').length);
    verifica('e il tipo lo dà il servizio, non il motore', 'persone', m.inCima()?.tipo);

    attrezzi.calendario.fai('Udienza giovedì');
    // Questo è il ramo del filtro che prima non si vedeva mai: nessun servizio sapeva
    // produrlo, perché la posta finta non ha eventi con un'ora.
    verifica('ha un’ora lontana: dorme in ORARIO', 1, m.in('ORARIO').length);
    verifica('e non è salita nella pila', 1, m.in('CARTA').length);

    attrezzi.calendario.fai('Riunione generale');
    verifica('niente da decidere: non diventa niente', [1, 1], [m.in('CARTA').length, m.in('ORARIO').length]);

    attrezzi.promemoria.fai('Richiamare Giulia');
    verifica('una scadenza che matura è una carta', 2, m.in('CARTA').length);
    verifica('e il promemoria è sempre una sveglia', 'sveglia', m.inCima()?.tipo);
  }

  console.log('\nil disco resta un confine, anche adesso che nessuno ci scrive\n');
  {
    // Il disco è un servizio e non è sospeso: legge e scrive, e una cosa scritta si
    // rilegge. Questo continua a provarlo, perché il giorno che l'archivio torna
    // (docs/07-memoria §6) il ripiano dev'essere ancora sotto.
    const suo = new Disco();
    suo.scrivi('prova.md', 'una riga');
    verifica('quello che scrivi si rilegge', 'una riga', suo.leggi('prova.md'));
  }

  console.log('\nla memoria sospesa: dura quanto la sessione (docs/07-memoria §6)\n');
  {
    const suo = new Disco();
    const prima = new Archivio(suo, 'Prova Memoria');
    prima.annota('Acme', 'Progetti', 'il preventivo è alto', orologio.adesso(), 'Prova Memoria');
    verifica('se lo segna', 'il preventivo è alto', prima.cosaSa('Acme')?.righe.at(-1)?.testo);
    verifica('ma non tocca il disco', 0, suo.elenca('').length);

    // Una ricarica della pagina è esattamente questo: stesso disco, archivio nuovo. A
    // regime si rileggeva da capo; adesso si riparte, ed è la cosa che la sospensione
    // paga apposta.
    const dopo = new Archivio(suo, 'Prova Memoria');
    verifica('e alla ricarica riparte', undefined, dopo.cosaSa('Acme'));

    // **Fra profili non passa niente** (docs/07-memoria §7): due sessioni sono due
    // memorie, e restano due.
    const altra = new Archivio(new Disco(), 'Nessuno Qui');
    verifica('fra profili non passa niente', undefined, altra.cosaSa('Acme'));
  }

  console.log('\nil seme: il contesto minimo, e si pesca per nome\n');
  {
    const suo = new Disco();
    suo.scrivi(
      'seme.txt',
      '# un commento, che non si legge\nAndrea Riva decide sui preventivi di Acme.\nMia madre si chiama Carla.\n',
    );
    const con = new Archivio(suo, 'Prova Seme');
    verifica('il commento non entra', false, con.contenuti(['commento']).length > 0);
    verifica('pesca la riga che ti serve', true, con.contenuti(['Andrea'])[0]?.includes('preventivi') === true);
    verifica('e non rovescia il resto', 1, con.contenuti(['Andrea']).length);
    verifica('chi non nomini non esce', 0, con.contenuti(['Giulia']).length);
  }

  console.log('\nl’archivio: si scrive, ma non si mostra\n');

  dillo('Paolo dice che il preventivo Acme è alto');
  const acme = archivio.cosaSa('Acme');
  verifica('ha capito di cosa parlavi', ['Acme', 'Progetti'], [acme?.nome, acme?.genere]);
  verifica('ha collegato Paolo', true, acme?.righe.at(-1)?.collegamenti.includes('paolo'));
  verifica('chi l’ha detto se lo segna', contesto.utilizzatore, acme?.righe.at(-1)?.chi);
  verifica('e dice solo dove l’ha messo, non come', 'Me lo segno su Acme.', motore.ultimaRisposta);
  verifica('nessun percorso esce mai', false, /\/|\.md/.test(motore.ultimaRisposta));

  dillo('cosa sai di acme');
  verifica('racconta contenuti', true, /preventivo/.test(motore.ultimaRisposta));
  verifica('e mai posizioni', false, /\/|\.md|archivio/.test(motore.ultimaRisposta));

  dillo('dimenticalo');
  const smentita = archivio.cosaSa('Acme')?.righe.at(-1);
  verifica('smentisce, non cancella', true, !!smentita && !!smentita.smentita);
  verifica('la riga resta dov’era', true, (archivio.cosaSa('Acme')?.righe.length ?? 0) > 0);
  dillo('cosa sai di acme');
  verifica('e smette di pescarla', false, /preventivo/.test(motore.ultimaRisposta));

  console.log('\nfra profili non passa niente\n');

  // Marco ha il suo disco, perché un disco è di uno solo: è esattamente quello che
  // impedisce a due memorie di toccarsi.
  const marco = new Archivio(new Disco(), 'Marco Neri');
  verifica('un altro profilo non sa niente di te', 0, marco.nomi().length);
  verifica('e la tua memoria resta piena', true, archivio.nomi().length > 0);

  console.log('\nle autorizzazioni: alla terza volta lo propone\n');

  const appunti = ['comprare il latte', 'prenotare il treno', 'chiamare la banca'];
  for (let giro = 1; giro <= 3; giro++) {
    dillo(`nelle note: ${appunti[giro - 1]}`);
    verifica(`giro ${giro} · chiede prima di uscire`, 'La salvo nelle note?', motore.ultimaRisposta);
    dillo('manda');
    await attesa(200);
  }
  verifica('alla terza propone di farlo da solo', true, /d’ora in poi/.test(motore.ultimaRisposta));
  verifica('e intanto le note sono uscite', 3, note.leggi().length);

  dillo('sì');
  verifica('promossa in preferenze', true, archivio.dichiarato('consegna-note'));
  dillo('nelle note: rinnovare il dominio');
  await attesa(200);
  verifica('la quarta parte da sola', 4, note.leggi().length);
  verifica('e non ha chiesto niente', false, /\?/.test(motore.ultimaRisposta));

  dillo('cosa fai da solo');
  verifica('lo racconta a parole', true, /note/.test(motore.ultimaRisposta));
  dillo('chiedimi sempre');
  verifica('e si revoca a voce', false, archivio.dichiarato('consegna-note'));

  console.log('\nuna risposta a una delega sa dove tornare\n');

  const tardiva = motore.task.find((t) => t.luogo === 'MEMORIA');
  if (tardiva) {
    motore.rientro(tardiva.id, 'La revisione è pronta.');
    verifica('risorge dalla memoria', ['CHIP', 'aspetta te'], [tardiva.luogo, tardiva.avanzamento]);
    verifica('con il nome di prima', tardiva.nome, tardiva.nome);
  }

  console.log('\nchi non ha la sessione non comanda\n');

  const primaDi = motore.task.length;
  contesto.ascoltatore = { chi: 'sconosciuto' };
  dillo('manda');
  verifica('una voce che non conosce non muove niente', primaDi, motore.task.length);
  verifica('e il sistema lo dice', true, /non riconosco/i.test(motore.ultimaRisposta));

  contesto.ascoltatore = { chi: 'conosciuto', nome: 'Giulia' };
  dillo('digli che il contratto e pronto');
  verifica('chi conosce lascia un messaggio', primaDi + 1, motore.task.length);
  const messaggio = motore.task.at(-1);
  verifica('e un task, non una riga di memoria', ['CARTA', 'conversazione'], [messaggio?.luogo, messaggio?.tipo]);
  verifica('con la fonte scritta', 'Giulia, a voce', messaggio?.fonte);
  contesto.ascoltatore = { chi: 'tu' };

  console.log('\ni flussi · il riassunto (docs/09-catene §2)\n');
  {
    const { posta: p, m, dillo: di } = banco();

    p.fai('Proposta Acme');
    verifica('la mail passa il filtro', 1, m.in('CARTA').length);

    di('ho ricevuto una nuova email, puoi riassumere il contenuto');
    const r = m.main();
    verifica('nasce un task che lavora', ['MAIN', 'in corso'], [r?.luogo, r?.avanzamento]);
    verifica('ed è un riassunto', 'riassunto', r?.forma);
    verifica('la mail di partenza non si è mossa', 1, m.in('CARTA').length);
    verifica('e dice che ci pensa lei', 'Certo, ci penso io.', m.ultimaRisposta);

    await attesa(1800);
    verifica('quando ha finito aspetta te', 'aspetta te', r?.avanzamento);
    verifica('e chiede se leggerlo', true, /Vuoi che te lo legga/.test(m.ultimaRisposta));
    verifica('il riassunto è più corto dell’originale', true, (r?.testo.length ?? 0) < (r?.ingresso?.length ?? 0));
    verifica('e quello che ha prodotto è il suo esito', r?.testo, r?.esito);
    verifica('e i convenevoli non ci sono', false, /come stai/i.test(r?.testo ?? ''));
    verifica('offre tre frasi', ['leggimelo', 'metti da parte', 'lascia stare'], r?.frasi.map((f) => f.testo));

    di('no');
    verifica('un no non muove niente', ['MAIN', 'aspetta te'], [r?.luogo, r?.avanzamento]);
    verifica('ed è un esito, non un’aperta', 'Va bene.', m.ultimaRisposta);

    di('metti da parte, ci penso dopo');
    verifica('metterla da parte è rimandarla', ['ORARIO', 'programmato'], [r?.luogo, r?.avanzamento]);
    verifica('e ti dice fra quanto te la rimette davanti', `Perfetto ${primoNome(contesto.utilizzatore)}, te lo ricordo fra due ore.`, m.ultimaRisposta);
  }

  console.log('\ni flussi · due cose insieme, e un messaggio (docs/09-catene §3)\n');
  {
    const { posta: p, m, dillo: di } = banco();

    p.fai('Revisione contratto');
    di('portala al centro');
    const revisione = m.main();
    verifica('la prima è al centro', 'Revisione contratto', revisione?.nome);

    p.fai('Nuovo cliente');
    verifica('la seconda aspetta te', 'Nuovo cliente', m.inCima()?.nome);

    di('leggi la notifica');
    verifica('la nuova prende il centro', 'Nuovo cliente', m.main()?.nome);
    verifica('e la prima si mette da parte, senza cambiare stato', ['APERTO', 'aspetta te'], [revisione?.luogo, revisione?.avanzamento]);
    verifica('un task sta in un posto solo', 1, m.in('MAIN').length);

    di('torna a quella di prima, questa non mi interessa');
    verifica('il fuoco torna indietro', 'Revisione contratto', m.main()?.nome);

    di('adesso invia un messaggio a mia madre e chiedile a che ora ci vediamo per venerdì a cena');
    const messaggio = m.main();
    verifica('nasce la terza, ed è una composizione', 'composizione', messaggio?.forma);
    verifica('il contatto è già pescato', 'Carla Moretti', messaggio?.uscita?.a);
    verifica('e il testo è in discorso diretto', 'Ciao mamma, a che ora ci vediamo venerdì per cena?', messaggio?.testo);
    verifica('non è uscito niente: aspetta te', 'aspetta te', messaggio?.avanzamento);
    verifica('e chiede', 'Vuoi che lo invii?', m.ultimaRisposta);
    verifica('le altre due sono da parte', 2, m.in('APERTO').length);
    verifica(
      'offre quattro frasi',
      ['aggiungi una emoji del cuore', 'aggiungi un abbraccio', 'riscrivilo', 'lascia stare'],
      messaggio?.frasi.map((f) => f.testo),
    );

    di('aggiungi una emoji del cuore e invia');
    verifica('una frase, due comandi: il cuore c’è', true, /❤/.test(messaggio?.esito ?? ''));
    verifica('e la consegna è partita', ['CHIP', 'in corso'], [messaggio?.luogo, messaggio?.avanzamento]);

    await attesa(700);
    verifica('mandata', 'consegnato', messaggio?.avanzamento);
    verifica('e la posta se lo ricorda col cuore', true, /❤/.test(p.leggi()[0] ?? ''));
    verifica('una consegna con destinatari non si autorizza mai', false, /d’ora in poi/.test(m.ultimaRisposta));
  }

  console.log('\nla voce · una cosa alla volta (docs/08-voce §3.1)\n');
  {
    /**
     * Una bocca finta che ci mette del tempo, e che si accorge se qualcuno le parla
     * sopra: è l'unico modo di provare una sovrapposizione senza orecchie.
     */
    class BoccaFinta implements Bocca {
      come = 'finta';
      readonly dette: string[] = [];
      sovrapposte = 0;
      private dentro = 0;
      pronta(): boolean {
        return true;
      }
      async dillo(testo: string): Promise<void> {
        if (this.dentro > 0) this.sovrapposte++;
        this.dentro++;
        this.dette.push(testo);
        await attesa(60);
        this.dentro--;
      }
      zittisci(): void {}
    }

    const bocca = new BoccaFinta();
    const turno = new Turno(() => bocca);

    turno.dici('Certo, ci penso io.');
    turno.dici('Aggiunto.');
    turno.dici('Mando a mamma.');
    turno.dici('Mandata a Carla Moretti.');
    verifica('ha preso la parola subito', true, turno.staParlando());
    verifica('e le altre aspettano', 3, turno.quanteDaParte());
    await attesa(10);
    verifica('ma ne dice una sola', 1, bocca.dette.length);

    await attesa(200);
    verifica('non si è mai sovrapposta', 0, bocca.sovrapposte);
    verifica('non ha detto tutto: ha detto la prima e il riepilogo', 2, bocca.dette.length);
    verifica('e il riepilogo è l’ultima', 'Mandata a Carla Moretti.', bocca.dette[1]);
    verifica('quando ha finito non aspetta più niente', false, turno.staParlando());

    const seconda = new BoccaFinta();
    const altro = new Turno(() => seconda);
    altro.dici('Ho finito il riassunto che mi hai chiesto.');
    altro.dici('Mandata a Renzo Baldi.');
    altro.dici('Vuoi che lo invii?');
    altro.dici('Te lo ricordo fra due ore.');
    await attesa(200);
    verifica('una domanda senza risposta non si butta, e va in fondo',
      'Te lo ricordo fra due ore. Vuoi che lo invii?', seconda.dette[1]);

    const terza = new BoccaFinta();
    const zitta = new Turno(() => terza);
    zitta.dici('Sto leggendo la proposta.');
    zitta.dici('Mandata.');
    zitta.svuota();
    await attesa(200);
    verifica('«aspetta» si porta via anche l’arretrato', ['Sto leggendo la proposta.'], terza.dette);

    verifica('una sola cosa resta quella che è', 'Fatto.', riepiloga(['Fatto.']));
    verifica('niente da dire non dice niente', '', riepiloga([]));
  }

  console.log('\nil profilo · una riga si cambia e si ricarica (docs/07-memoria §3)\n');
  {
    const p = leggiProfilo(`Utente:
\tname: Lucia Moretti
\tlanguage: italian
System
\tpreferences
\t\tnotifications:
\t\t\tset: sound [sound, silent]
\t\t\tsound: "C:\\Users\\Lucia\\Desktop\\din-don.mp3"
\t\ttema:
\t\t\t# gli stati
\t\t\tsalvia:         #00a878
\t\t\tf1:             #ffffff   · era #c6cbc9
\t\t\tsfondo-quanto:   0.26   · era 0.34
\t\t\tvelo:           normal   · era luminosity
\t\t\tfuxia:          #ff00ff
\tVOLUME: 40%
assitant:
\tlettura: on
\tpreferenze:
\t\tvoce: femminile
\t\tnome: amanda
\t\tsesso: femmina
`);

    verifica('la lingua si legge com’è scritta', 'italian', p.lingua);
    verifica('e diventa un codice per la bocca', 'it-IT', codiceLingua(p.lingua));
    verifica('il sesso del personaggio non è il timbro della voce', ['femmina', 'femminile'], [p.assistente.sesso, p.assistente.voce]);

    verifica('il campanello è acceso', 'sound', p.macchina.notifiche.modo);
    verifica('fra parentesi c’era la scelta, non il valore', false, /\[/.test(p.macchina.notifiche.modo));
    // Un suono è dell’app, non tuo: sta in `pubblico/suoni/` e si serve dalla radice.
    verifica('e il suono tiene il suo nome', '/suoni/din-don.mp3', p.macchina.notifiche.suono);

    verifica('la tavolozza arriva intera', '#00a878', p.tema['salvia']);
    verifica('e il «era» resta fuori dal valore', '#ffffff', p.tema['f1']);
    verifica('anche quando il valore è un numero', '0.26', p.tema['sfondo-quanto']);
    verifica('e quando è una parola', 'normal', p.tema['velo']);
    verifica('i commenti non entrano', false, Object.keys(p.tema).some((k) => k.startsWith('#')));

    // I percorsi: relativi perché l'ambiente sia clonabile, e due strade di cortesia
    // per le righe incollate da una macchina vera (ambiente/LEGGIMI.md).
    const dovunque = leggiProfilo(`System
\tpreferences
\t\tprofilepicture: "media/volto.png"
\t\tbackground: "C:\\Dump\\Immagini\\foresta.jpg"
\t\tnotifications:
\t\t\tsound: "https://esempio.it/din.mp3"
`);
    verifica('un percorso relativo vale com’è', '/media/volto.png', dovunque.macchina.volto);
    // Un’immagine invece è **tua** e va sotto `storage/`. Al banco non c’è nessun utente
    // acceso — non si carica un profilo dalla porta — e senza utente una risorsa
    // dell’utente resta relativa invece di inventarsi un indirizzo rotto.
    verifica('uno di Windows tiene solo il nome, e va fra le cose tue', 'storage/foresta.jpg', dovunque.macchina.sfondo);
    verifica('un indirizzo in rete passa intero', 'https://esempio.it/din.mp3', dovunque.macchina.notifiche.suono);

    const spenta = leggiProfilo('System\n\tpreferences\n\t\tnotifications:\n\t\t\tset: silent [sound, silent]\n');
    verifica('silent vuol dire spento', 'silent', spenta.macchina.notifiche.modo);

    const nudo = leggiProfilo('Utente:\n\tname: Marco Neri\n');
    verifica('un profilo senza niente non si rompe', ['italiano', 'sound', 0], [
      nudo.lingua,
      nudo.macchina.notifiche.modo,
      Object.keys(nudo.tema).length,
    ]);
  }

  console.log('\nil gruppo · l’ordine è tuo, non suo (docs/01-modello §6)\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    b.posta.fai('Revisione contratto');
    b.posta.fai('Nuovo cliente');
    verifica('tre carte nella pila', 3, b.m.in('CARTA').length);
    verifica('e nessun gruppo, perché non l’hai chiesto', 0, b.m.gruppi().length);

    b.dillo('mettila con Acme');
    verifica('il gruppo nasce quando lo nomini', ['Acme'], b.m.gruppi().map((g) => g.nome));
    verifica('e chi ci è finito ha lasciato la pila', 2, b.m.in('CARTA').length);
    verifica('è in mano, non rimandato', ['CHIP', 'aspetta te'], [b.m.in('CHIP')[0]?.luogo, b.m.in('CHIP')[0]?.avanzamento]);
    verifica('il nome l’hai scelto tu, maiuscola compresa', 'Acme', b.m.gruppi()[0]?.nome);

    b.dillo('mettila con Acme');
    b.dillo('mettila con Acme');
    verifica('ci stanno in tre', 3, b.m.gruppi()[0]?.membri.length);
    verifica('la pila è vuota', 0, b.m.in('CARTA').length);
    verifica('la TASKBAR mostra un elemento solo', 1, b.m.elementi().length);

    // Un chip dentro un gruppo non è «quello a fuoco»: per parlargli va richiamato.
    b.dillo('torna alla proposta acme');
    b.dillo('mettila con Aurora');
    verifica('un task sta al massimo in un gruppo: nell’altro migra', ['Acme 2', 'Aurora 1'],
      b.m.gruppi().map((g) => `${g.nome} ${g.membri.length}`).sort());

    b.dillo('separa Aurora');
    verifica('separare non muove i chip', 3, b.m.in('CHIP').length);
    verifica('e il gruppo vuoto non esiste più', ['Acme'], b.m.gruppi().map((g) => g.nome));

    b.dillo('mettila con Acme');
    b.dillo('apri Acme');
    verifica('aprirlo è un momento, non una schermata', 'Acme', b.m.gruppoAperto()?.nome);
    verifica('e allora ha voce', ['manda tutte', 'dopo', 'separale', 'chiudi'],
      b.m.frasiCorrenti().map((f) => f.testo));
  }

  console.log('\nun gruppo misto non si manda tutto insieme\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    b.dillo('mettila con Acme');
    b.posta.fai('Revisione contratto');
    b.dillo('mettila con Acme');
    b.dillo('apri Acme');
    const primo = b.m.gruppi()[0]!.membri[0]!;
    primo.avanzamento = 'in corso';
    verifica('con un membro in corso «manda tutte» sparisce', ['dopo', 'separale', 'chiudi'],
      b.m.frasiCorrenti().map((f) => f.testo));
    verifica('e parla il più urgente, non il primo', 'aspetta te', b.m.gruppi()[0]?.parla.avanzamento);
    primo.avanzamento = 'bloccato';
    verifica('un blocco non si nasconde dietro un numero', 'bloccato', b.m.gruppi()[0]?.parla.avanzamento);
  }

  console.log('\nciò che parte insieme si annulla insieme\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    b.dillo('mettila con Acme');
    b.posta.fai('Revisione contratto');
    b.dillo('mettila con Acme');
    b.posta.fai('Nuovo cliente');
    b.dillo('mettila con Acme');

    b.dillo('apri Acme');
    b.dillo('manda tutte');
    verifica('partono tutte e tre', 3, b.m.in('CHIP').filter((t) => t.avanzamento === 'in corso').length);
    verifica('e l’elenco si chiude', null, b.m.espansa);

    await attesa(700);
    verifica('sono consegnate', 3, b.m.in('CHIP').filter((t) => t.avanzamento === 'consegnato').length);
    verifica('ma il sistema lo dice una volta sola', 'Mandate tutte e 3.', b.m.ultimaRisposta);
    verifica('la posta ne ricorda tre', 3, b.posta.leggi().length);

    b.dillo('no, aspetta');
    verifica('si ritira il lotto intero', 0, b.m.in('CHIP').filter((t) => t.avanzamento === 'consegnato').length);
    verifica('e tornano al cancello, non a «in corso»', ['aspetta te', 'aspetta te', 'aspetta te'],
      b.m.in('CHIP').map((t) => t.avanzamento));
    verifica('lo dice al plurale', 'Annullate tutte e 3. Non è uscito niente.', b.m.ultimaRisposta);

    avanza(3 * MINUTO);
    verifica('annullate, non cadono nella memoria', 0, b.m.in('MEMORIA').length);
  }

  console.log('\ni contenuti · due, non quattro (docs/01-modello §1)\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    const arrivata = b.m.inCima()!;
    verifica('nasce con quello che è arrivato', true, (arrivata.ingresso?.length ?? 0) > arrivata.testo.length);
    verifica('e con quello che c’è da decidere', true, /venerdì pomeriggio va benissimo/.test(arrivata.esito ?? ''));
    verifica('l’uscita dice dove e a chi, non cosa', ['posta', 'Andrea Riva'],
      [arrivata.uscita?.destinazione, arrivata.uscita?.a]);
    verifica('dentro vince l’esito', arrivata.esito, dentroSiVede(arrivata));

    b.dillo('manda');
    await attesa(700);
    verifica('quello che esce è l’esito, non la riga', true,
      /venerdì pomeriggio va benissimo/.test(b.posta.leggi()[0] ?? ''));
  }

  console.log('\nun task che non ha ancora prodotto niente mostra il suo ingresso\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    const fonte = b.m.inCima()!;
    fonte.esito = undefined;
    verifica('senza esito si vede l’ingresso', fonte.ingresso, dentroSiVede(fonte));

    b.dillo('portala al centro');
    b.dillo('riassumimela');
    await attesa(2000);
    const r = b.m.task.find((x) => x.forma === 'riassunto');
    verifica('il riassunto nasce con dentro quello che deve leggere', fonte.ingresso, r?.ingresso);
    verifica('e quello che scrive è il suo esito', r?.testo, r?.esito);
    verifica('averlo prodotto è essere aspetta te', 'aspetta te', r?.avanzamento);
  }

  console.log('\nnessuno aspetta te a proposito di niente\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    b.posta.fai('Revisione contratto');
    b.dillo('portala al centro');
    // L'invariante di docs/01-modello §1: se aspetta te, o ha prodotto qualcosa, o ha
    // almeno una frase da offrirti. Altrimenti chiede una parola a proposito di niente.
    const muti = b.m.task.filter(
      (x) => x.avanzamento === 'aspetta te' && !x.esito && x.frasi.length === 0,
    );
    verifica('ogni ambra ha un esito o una frase', [], muti.map((x) => x.nome));
  }

  console.log('\ndentro un task · attivo non vuol dire aperto (docs/01-modello §7)\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    b.dillo('portala al centro');
    const t0 = b.m.main()!;
    verifica('è attiva', 'MAIN', t0.luogo);
    verifica('ma non è aperta: sono due cose diverse', undefined, b.m.aperto()?.id);

    b.dillo('aprila');
    verifica('adesso è aperta', t0.id, b.m.aperto()?.id);
    verifica('e restare aperta non le ha cambiato niente', ['MAIN', t0.avanzamento],
      [t0.luogo, t0.avanzamento]);
    verifica('mostra, non dice: la voce non legge il corpo', 'Eccola per intero.', b.m.ultimaRisposta);
    verifica('le frasi restano le sue, più l’uscita', 'chiudi',
      b.m.frasiCorrenti()[b.m.frasiCorrenti().length - 1]?.testo);
    verifica('e non sfondano il tetto di quattro', true, b.m.frasiCorrenti().length <= 4);

    // Un momento per volta: due insieme sarebbero una finestra.
    b.dillo('cosa hai in mano');
    verifica('aprire un elenco chiude il dentro', undefined, b.m.aperto()?.id);

    b.dillo('chiudi');
    b.dillo('aprila');
    verifica('riaperta', t0.id, b.m.aperto()?.id);
    b.dillo('dopo');
    verifica('se il task se ne va, il dentro si chiude da sé', undefined, b.m.aperto()?.id);
    verifica('e il task è andato davvero', 'ORARIO', t0.luogo);
  }

  console.log('\nun task senza niente dentro non si apre\n');
  {
    const b = banco();
    b.posta.fai('Proposta Acme');
    const t0 = b.m.inCima()!;
    t0.ingresso = undefined;
    t0.esito = undefined;
    b.dillo('aprila');
    verifica('non si apre vuoto', undefined, b.m.aperto()?.id);
    verifica('e lo dice', true, /non ha altro dentro/i.test(b.m.ultimaRisposta));
  }

  console.log('\nl’alfabeto · la lingua è chiusa, si pronuncia tutta, e si prova tutta\n');
  {
    const provati = new Set<string>();
    const storti: string[] = [];
    const irraggiungibili: string[] = [];

    // Una parola per banco: lo stato che le serve se lo costruisce lei (src/prova/stato.ts),
    // e provarla su quello che ha lasciato la parola di prima non direbbe niente di lei.
    // Prima erano quattro mondi fatti a mano, e le parole che non ci stavano dentro —
    // «separale», «sì, fai pure», il blocco da sciogliere — restavano non provate.
    for (const fam of ALFABETO) {
      for (const az of fam.azioni) {
        if (!az.comando) continue;
        const esito = await prova(banco().attrezzi, az);
        if (!esito) continue;
        if (esito.senzaStato) {
          irraggiungibili.push(`«${esito.detta}» · serve ${(az.serve ?? []).join(', ')}`);
          continue;
        }
        provati.add(az.comando);
        if (esito.uscito !== az.comando) {
          storti.push(`«${esito.detta}» → ${esito.uscito}, non ${az.comando}`);
        }
      }
    }

    const nominati = new Set(
      ALFABETO.flatMap((f) => f.azioni.map((x) => x.comando)).filter(
        (x): x is NonNullable<typeof x> => x !== undefined,
      ),
    );
    verifica('l’alfabeto nomina ogni comando della lingua', [], COMANDI.filter((c) => !nominati.has(c)));
    verifica('ogni situazione che una parola presuppone si sa costruire', [], irraggiungibili);
    verifica('e ogni frase produce il comando che dichiara', [], storti);
    verifica('nessuna parola resta solo da leggere', [], COMANDI.filter((c) => !provati.has(c)));
  }

  // ─── i secondari · l'AI engine che si moltiplica (docs/02-parallelo §3) ──────
  {
    console.log('\ni secondari lavorano dentro un task, e non ne creano uno\n');
    const b = banco();
    b.posta.fai('Revisione contratto');
    b.dillo('portala al centro');
    const quanti = b.m.task.length;
    const dentro = b.m.main()!;

    b.dillo('preparami alla revisione');
    verifica('non nasce un task nuovo: lavorano dentro quello che c’è', quanti, b.m.task.length);
    verifica('il task lavora', 'in corso', dentro.avanzamento);
    verifica('e la frazione è la loro faccia', '0/2', dentro.dato);

    await attesa(260);
    verifica('la frazione sale, non salta: si vede anche a metà', '1/2', dentro.dato);

    await attesa(300);
    verifica('quando hanno finito la frazione se ne va', undefined, dentro.dato);
    verifica('torna al cancello, che è tuo: non consegnano', 'aspetta te', dentro.avanzamento);
    verifica('quello che hanno prodotto è l’esito', true, (dentro.esito ?? '').length > 0);
    verifica('due riporti, uno per secondario', 2, (dentro.esito ?? '').split('\n').length);

    // Il permesso è l'elenco, e si prova chiedendo una mossa che non è nell'elenco.
    const nega = (nome: string, argomenti: Record<string, unknown>) =>
      chiama({ nome, argomenti }, b.m, orologio, MOSSE_SECONDARIE).sbagliata === true;
    verifica('un secondario non consegna', true, nega('consegna', { task: dentro.id }));
    verifica('e non scrive nella memoria', true, nega('segna', { nome: 'X', genere: 'Ricordi', testo: 'x' }));
    verifica('un livello solo: non delega a sua volta', true, nega('delega', { task: dentro.id, lavori: ['x'] }));
    verifica('e non parla con chi usa il sistema', true, nega('parla', { testo: 'ciao' }));
    verifica('ma guardare lo sa fare', false, nega('guarda', {}));
  }

  // ─── la memoria dell'AI engine · la giornata di lavoro (docs/04-metalinguaggio §4) ──
  {
    console.log('\nl’AI engine ricorda la giornata, non la conversazione\n');
    const b = banco();
    b.dillo('segnati che il preventivo Acme va rifatto');
    b.dillo('e anche che Paolo non risponde alle mail');
    verifica('quello che è a schermo è la coda', true, b.m.scambioVisibile().length > 0);
    verifica(
      'e la memoria tiene i giri già avvenuti, non quello di adesso',
      b.m.scambio.length - 1,
      b.m.memoria().length,
    );

    // I trenta secondi di orologio vero non si possono aspettare qui, ma l'ora del
    // sistema sì: si salta fuori dalle ore di lavoro, che è la sola cosa che pota.
    const quanti = b.m.memoria().length;
    avanza(11 * 60 * MINUTO);
    b.dillo('e questa la dico a notte fonda');
    verifica('fuori dall’orario di lavoro la memoria riparte', true, b.m.memoria().length < quanti);
  }

  // ─── la Timeline ───────────────────────────────────────────
  // Il componente è una funzione pura dello stato, quindi si guarda come stringa: qui si
  // somma il filo, perché un filo i cui tratti non fanno 242 **sembra** giusto.
  console.log('\nla timeline situa nel tempo\n');
  provaLaTimeline(motore, orologio, verifica);
  provaIlLibero(motore, orologio, verifica);

  console.log('\nquello che ancora non gira\n');
  for (const manca of [
    'sms e notizie — dei sette servizi ce ne sono cinque',
    'la promozione di una persona nota ai contatti (docs/07-memoria §5)',
    'gli agenti di terzi, e con che contratto si dichiara cosa esce (docs/06-confini §5)',
    'l’AI engine vero gira solo col server e una chiave: qui pensa il finto (docs/03-architettura §8)',
    'gli archi temporali di un progetto che cresce (docs/07-memoria §7)',
  ]) console.log(`  --  ${manca}`);

  console.log(errori === 0 ? '\ntutto a posto\n' : `\n${errori} verifiche fallite\n`);
  (globalThis as any).process.exit(errori === 0 ? 0 : 1);
}

void corri();
