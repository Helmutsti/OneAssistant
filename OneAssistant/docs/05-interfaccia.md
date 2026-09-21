# 05 — L'interfaccia

Come si entra e come si esce, cos'è INPUT, e come l'AI engine vede e muove lo schermo.

È l'unico documento che guarda l'interfaccia da tutte e due le parti: quella che vedi tu, e
quella che tocca il modello. Le misure non stanno qui — stanno in `design/` — qui sta
quando una cosa c'è e quando non c'è.

---

## 1. Due canali, in ingresso e in uscita

**In ingresso, voce e scrittura sono di pari grado.** Non c'è una modalità principale e una
di ripiego: la stessa frase si dice o si scrive, e da lì in poi il percorso è identico. La
trascrizione è il primo passo del motore ed è anche l'ultimo punto in cui la differenza
esiste.

**In uscita, la risposta è sempre scritta, e parallelamente anche detta.**

> La voce non aggiunge niente al testo. Sono lo stesso contenuto su due canali paralleli.

Tre conseguenze, tutte vincolanti:

- **Il testo è la verità, la voce ne è la lettura.** Non si genera mai due volte: non esiste
  una «versione parlata» prodotta a parte. Un testo solo, letto ad alta voce.
- **Ogni risposta dev'essere dicibile.** Niente tabelle, niente elenchi lunghi, niente
  markdown, niente «come vedi qui sopra». Se una frase non si può leggere ad alta voce senza
  suonare assurda, è scritta male — non è un problema della sintesi vocale.
- **La voce si può spegnere senza perdere niente.** In riunione, in open space, o se
  semplicemente dà fastidio. Nessuna informazione vive solo nell'audio.

Nemmeno la memoria fa eccezione. Quando il sistema si segna qualcosa dice una frase — *«Me
lo segno su Acme»*, o *«Ho preso nota»* — e quella frase è tutto: niente elenchi di file a
schermo che la voce non legge, perché la memoria non si mostra affatto (`07-memoria §9`).

### Le due modalità

Le modalità dicono **da dove entra** quello che dici, e sono ortogonali a tutto il resto:

| | il microfono | il punto d'ascolto | il campo |
|---|---|---|---|
| **voce** | sente | **pulsa**: ti sto sentendo | c'è, perché l'orecchio non è ancora costruito (`03-architettura §8`) |
| **tastiera** | spento | fermo e spento | **prende il fuoco da sé**: è l'ingresso, e l'invito dice «scrivi» |

Non sono due prodotti, ed è la prima riga di questo documento a dirlo: spegnere il microfono
non toglie una funzione, toglie un canale su due, e quello che resta fa tutto. Per questo in
tastiera SYSTEMBAR dice **SCRIVI** e non *SPENTO*: dichiara un modo, non un guasto.

### Il gesto che non ha una frase

Spegnere si dice — «non ascoltare», «scrivo» — ed è una mossa come le altre. **Riaccendere
no**, e sono due impossibilità diverse:

- **non si può dire.** Col microfono spento non c'è niente che ti senta: una frase per
  riaccenderlo sarebbe una frase che il sistema non può ricevere;
- **non è una mossa dell'AI engine.** Un assistente che ti apre il microfono da sé è un
  altro prodotto. Non c'è uno strumento per farlo — non «c'è e non lo usa»: non c'è.

Quindi riaccenderlo è **l'unico atto del sistema che esiste soltanto come gesto**: si preme
il microfono in SYSTEMBAR. È un'eccezione dichiarata alla legge 01, nella stessa famiglia
della campanella, con una differenza: la campanella ha *anche* una frase, questo no, perché
non può averla.

Per questo la riga che il sistema dice spegnendosi è quella che conta: *«Non ascolto più.
Scrivi, e per riaccendermi premi il microfono.»* Senza quella, spegnere sarebbe una porta
che si chiude senza maniglia.

---

## 2. INPUT — tre stati

Se il testo è la verità, il testo deve restare. Ma restare non vuol dire stare sempre lì:
INPUT ha tre stati, e si distinguono da cosa c'è da dire.

| stato | quando | cosa si vede |
|---|---|---|
| **assente** | non stai dicendo niente e non c'è più una conversazione | **niente.** INPUT non esiste |
| **scrittura** | stai parlando o scrivendo | **solo il messaggio di adesso** |
| **attesa** | la conversazione è aperta | **lo scambio**, dentro la bolla |

Il confine fra attesa e assente non è un numero nuovo: è la conversazione aperta di
`01-modello §3` — **30 secondi dall'ultimo scambio**. Passati quelli, non c'è più niente da
ricordare a schermo.

In tastiera INPUT non sparisce mai del tutto: se sparisse, l'unica porta d'ingresso sarebbe
un campo invisibile, e a schermo non ci sarebbe niente che dica da dove si entra. In voce
continua a sparire, perché il punto e la voce bastano.

Tre regole su cosa ci sta dentro, tutte e tre negative:

- **la conversazione sta dentro la bolla**, non sopra. Niente scritte flottanti sul fondo:
  vale la legge zero anche qui;
- **niente di un task entra in INPUT.** Stato, avanzamento, frasi, progresso stanno sulla
  bolla di quel task. **INPUT porta le parole, TABLE porta le cose**;
- **niente virgolette.** Le «» sono l'affordance dei comandi (legge 01): marcano ciò che
  *puoi dire*, non ciò che hai detto.

Dentro ci stanno solo tre cose: il testo di ciò che hai detto o scritto, la raccolta di file
e concetti agganciati allo scambio, e lo scambio stesso. Uno scambio **non è un task e non
ne crea uno**: una domanda a cui il sistema risponde e basta resta uno scambio e muore lì.

Mentre ascolta, il punto d'ascolto pulsa. È l'unico movimento di INPUT, e dice una cosa
sola: ti sto sentendo.

### Mentre parli non si capisce niente, e si vede lo stesso

È la regola che tiene INPUT onesto, e va detta perché sembra una limitazione e non lo è:

> **Mentre parli si muove solo la raccolta. La frase si capisce una volta sola, quando
> hai finito di dirla.**

La **raccolta** aggancia i nomi che il sistema già conosce — Marco, Acme, una cartella che
è a schermo — ed è una ricerca in un elenco, non una comprensione: si vede *che* l'hai
nominato, e non si muove nient'altro. Nessuna bolla nasce, nessun fuoco si sposta, nessuna
ricerca parte.

Poi la frase finisce, e **il turno è uno**: una chiamata, un contesto costruito, una
risposta. Capire a metà vorrebbe dire agire a metà — e agire su una frase che non è ancora
finita è il modo più rapido di fare la cosa sbagliata con l'aria di essere svegli
(`03-architettura §4`).

La catena che mostra tutti e quattro i momenti in fila è `09-catene §4`.

---

## 3. Le sei aree

Sono un insieme chiuso, e ognuna risponde a una domanda sola. Restano in inglese, ed è
un'eccezione dichiarata (`CLAUDE.md`).

| area | risponde a | cosa contiene |
|---|---|---|
| **PROFILEBAR** | chi sei, e quando e dove sei | ora, giorno, luogo, volto |
| **SYSTEMBAR** | cosa sta facendo la macchina, e cosa esce | microfono, volume, rete, batteria |
| **TABLE** | cosa sta andando avanti | le bolle: `MAIN` e `APERTO` |
| **TASKBAR** | cosa hai in mano | i chip, i flussi, e i rimandati |
| **NOTIFICATIONBAR** | cosa è arrivato dal mondo | le **notifiche**, com'è arrivate. Nessun task |
| **INPUT** | cosa ci stiamo dicendo | lo scambio, la raccolta, il punto d'ascolto |

Le tre righe centrali sono i tre insiemi della visione (`00-visione §3`), ed è l'unico punto
in cui una promessa di prodotto e una divisione di schermo coincidono esattamente. Quando
una cosa nuova non sa in quale area andare, quasi sempre vuol dire che non è ancora chiaro
in che stato è — non che manca un'area.

### Il linguaggio dell'interfaccia — i quattro momenti

Il ciclo di `01-modello §2` dice **cosa fa** un task. Qui si dice **cosa gli sta
succedendo a schermo**, e sono quattro momenti con un nome:

| momento | cos'è | dove |
|---|---|---|
| `UI_CREACONTESTO` | la richiesta si compone: il testo cresce e la raccolta si aggancia da sé | INPUT, stato *scrittura* (§2) |
| `UI_AGGIORNA` | un task che esiste già riceve una richiesta o un contesto nuovo | INPUT, e il task torna a fuoco |
| `UI_FOCUS` | il task ha l'attenzione: è la `MAIN`, e può aprirsi **dentro** | TABLE |
| `UI_MINIMIZZATO` | il task è un chip: niente contenuti, un segno solo | TASKBAR |

Due dei quattro sono momenti di INPUT, e due sono posizioni (`01-modello §2`:
`UI_FOCUS` è `MAIN`, `UI_MINIMIZZATO` è `CHIP`). **Non sono un terzo asse**: sono i quattro
punti in cui l'interfaccia fa qualcosa invece di limitarsi a mostrare uno stato.

Ne restano fuori tre posizioni, e non è una dimenticanza — sono i posti in cui un task
esiste **senza che gli stia succedendo niente a schermo**: `APERTO` (sulla scrivania, senza
il fuoco), `ORARIO` (in TASKBAR, che dorme fino alla sua ora), `MEMORIA` (non a schermo
affatto).
Un'interfaccia che avesse un momento anche per quelli starebbe dicendo che guardare è un
atto, e guardare non è un atto.

**Su `UI_FOCUS`, una precisazione che vale una legge.** Il fuoco ingrandisce e mostra di
più — l'esito se c'è, l'ingresso se non c'è ancora (`01-modello §7`). Quello che **non**
fa è diventare una schermata con dei comandi dentro: dentro si vede **di più, non di
diverso**. Se una cosa si può fare, si può dire, e la frase sta sotto la bolla come tutte
le altre. Il giorno che dentro comparisse un bottone, le finestre sarebbero tornate — con
un altro nome e una bolla intorno.

---

## 4. Come l'AI engine la tocca

Da questa parte del confine l'interfaccia è due cose: **una vista che si chiede** e **un
elenco di mosse**.

- la vista è `guarda`, e torna lo schermo per intero in parole: aree, task con id, luogo e
  avanzamento, fuoco, flussi, cassetto, scambio, frasi possibili (`04-metalinguaggio §3`);
- le mosse sono l'elenco chiuso, e passano tutte dal motore: **nessuna mossa disegna**. Una
  mossa cambia uno stato, e sono le aree a disegnare lo stato che ne esce
  (`03-architettura §2`).

Questa seconda riga è la cosa più importante del capitolo, e va detta al negativo perché è
così che si controlla:

> **L'AI engine non ha una mossa per «mostra», «evidenzia», «apri una finestra», «metti
> questo lì». Se una cosa si vede, è perché uno stato è cambiato.**

Il giorno in cui servisse una mossa che disegna e basta, il sistema avrebbe due sorgenti di
verità per quello che si vede — lo stato e l'ultima cosa che il modello ha chiesto — e la
seconda vincerebbe sempre, perché arriva dopo.

---

## 5. La ristrutturazione che viene

Le mosse sono trentasette, e sono cresciute una alla volta: ognuna è nata quando serviva,
ed è per questo che il sistema si è mosso in fretta. Ma trentasette nomi cresciuti uno alla
volta non sono la stessa cosa di trentasette nomi progettati insieme, e adesso si vede.

**Il problema, detto per bene.** Oggi sappiamo elencare *cosa il modello può fare*. Non
sappiamo elencare *in che situazioni lo schermo si può trovare*. Sono due elenchi diversi, e
finché esiste solo il primo l'AI engine ha degli strumenti ma non ha una mappa: può
comporre uno stato che nessuno ha mai guardato, e non c'è un posto dove andare a vedere se
quello stato è previsto o è un incidente.

**Cosa si vuole ottenere**, in una riga:

> **Un elenco chiuso delle situazioni in cui il sistema si può trovare, e per ognuna la
> certezza che ci sia un modo di disegnarla.**

Non è un'idea nuova nel repo: **il banco di prova lo fa già** per la lingua.
`src/prova/stato.ts` tiene un insieme chiuso di situazioni, e ognuna sa tre cose — come si
chiama, se c'è adesso, e **come ci si arriva** (`09-catene §6`). È l'impalcatura giusta,
costruita per un altro scopo: lì serve a provare che ogni parola si possa pronunciare
davvero; qui servirebbe a provare che ogni situazione si possa **vedere** davvero.

**I criteri**, che valgono più di qualunque soluzione proposta adesso:

1. **si parte dalle situazioni, non dalle chiamate.** L'API è una conseguenza dell'elenco
   delle situazioni, non il suo indice;
2. **ogni situazione ha un modo di arrivarci**, come nel banco. Una situazione dichiarata e
   irraggiungibile non è una situazione: è una riga di documentazione;
3. **ogni situazione ha un disegno**, e se non ce l'ha è un buco da dichiarare, non da
   scoprire in produzione;
4. **le combinazioni illegali restano impossibili.** La matrice di `01-modello §2` non si
   riapre: se un elenco di situazioni ne contiene una che quella matrice vieta, è l'elenco
   a essere sbagliato;
5. **niente di quello che c'è si rompe in silenzio.** Il metalinguaggio si cambia con le
   quattro regole di `04-metalinguaggio §9` — si aggiunge, non si allarga.

**Cosa resta da decidere**, e non si decide qui:

- se le situazioni siano un **prodotto** dei due assi (luogo × avanzamento, più il fuoco,
  più il dentro, più il flusso) o un elenco scritto a mano. La prima è completa e cresce da
  sé; la seconda è leggibile e non contiene mostri. Probabilmente il prodotto, con le
  caselle vietate marcate — cioè la matrice di `01-modello §2` portata fino in fondo;
- se l'AI engine debba **vedere** l'elenco delle situazioni, o solo le mosse. Vederlo
  significa che può dire «questa è la situazione X» e ragionarci; non vederlo tiene il
  prompt immobile (`04-metalinguaggio §8`);
- se le mosse vadano **raggruppate per situazione** invece che elencate in piano. È la parte
  che tocca il prompt, quindi è la più cara e la più rischiosa: va fatta per ultima.

Fino ad allora vale la regola di adesso: **ogni cosa che si vede è uno stato, e ogni stato
sta in `01-modello`.**

---

## 6. Domande aperte

1. **Quanto scambio tiene INPUT.** Botta e risposta resta a schermo — ma per quanto? Fino a
   fine giornata, finché la conversazione è aperta (30 s), o un numero fisso di scambi? E
   cosa succede quando lo scambio riguarda un task che nel frattempo è caduto in `MEMORIA`.
2. **Se la voce in uscita ha ancora senso in tastiera.** Oggi continua a leggere, e potrebbe
   essere giusto o potrebbe essere una voce che parla a qualcuno che ha scelto il silenzio.
3. **Le situazioni**, tutto il §5.
