# 04 — Il motore

Come una frase diventa un'azione, e come una risposta torna indietro.

---

## 1. Due canali, in ingresso e in uscita

**In ingresso, voce e scrittura sono di pari grado.** Non c'è una modalità principale e
una di ripiego: la stessa frase si dice o si scrive, e da lì in poi il percorso è
identico. La trascrizione è il primo passo del motore ed è anche l'ultimo punto in cui
la differenza esiste.

**In uscita, la risposta è sempre scritta, e parallelamente anche detta.**

> La voce non aggiunge niente al testo. Sono lo stesso contenuto su due canali paralleli.

Tre conseguenze, tutte vincolanti:

- **Il testo è la verità, la voce ne è la lettura.** Non si genera mai due volte: non
  esiste una «versione parlata» prodotta a parte. Un testo solo, letto ad alta voce.
- **Ogni risposta dev'essere dicibile.** Niente tabelle, niente elenchi lunghi, niente
  markdown, niente «come vedi qui sopra». Se una frase non si può leggere ad alta voce
  senza suonare assurda, è scritta male — non è un problema della sintesi vocale.
- **La voce si può spegnere senza perdere niente.** In riunione, in open space, o se
  semplicemente dà fastidio. Nessuna informazione vive solo nell'audio.

Nemmeno l'archivio fa eccezione. Quando il sistema si segna qualcosa dice una frase —
*«Me lo segno su Acme»*, o *«Ho preso nota»* — e quella frase è tutto: niente elenchi di
file a schermo che la voce non legge, perché l'archivio non si mostra affatto
(`05-archivio §3`). I due canali restano identici, come dice la legge.

### INPUT — tre stati, e due modalità

Se il testo è la verità, il testo deve restare. Ma restare non vuol dire stare sempre lì:
INPUT ha tre stati, e si distinguono da cosa c'è da dire.

| stato | quando | cosa si vede |
|---|---|---|
| **assente** | non stai dicendo niente e non c'è più una conversazione | **niente.** INPUT non esiste |
| **scrittura** | stai parlando o scrivendo | **solo il messaggio di adesso** |
| **attesa** | la conversazione è aperta | **lo scambio**, dentro la bolla |

Il confine fra attesa e assente non è un numero nuovo: è la conversazione aperta di
`01-modello §3` — **30 secondi dall'ultimo scambio**. Passati quelli, non c'è più niente da
ricordare a schermo, e quello che è stato detto vive nell'archivio (`05-archivio`), non qui.

Questo chiude diversamente la vecchia legge «a riposo INPUT non esiste». Quella cadeva
perché legava l'esistenza di INPUT al *parlare*, e con la tastiera di pari grado non
reggeva. Ora INPUT c'è quando c'è qualcosa da dire o da ricordare, e sparisce quando non
c'è: la stessa forma, con la ragione giusta.

Tre regole su cosa ci sta dentro, tutte e tre negative:

- **La conversazione sta dentro la bolla**, non sopra. Niente scritte flottanti sul fondo:
  vale la legge zero anche qui.
- **Niente di un task entra in INPUT.** Stato, avanzamento, frasi, progresso: stanno sulla
  bolla di quel task. INPUT porta le parole, TABLE porta le cose.
- **Niente virgolette.** Le «» sono l'affordance dei comandi (legge 01): marcano ciò che
  *puoi dire*, non ciò che hai detto. Le tue parole non le portano, e nemmeno le risposte.

Dentro ci stanno solo tre cose: il testo di ciò che hai detto o scritto, la raccolta di
file e concetti agganciati allo scambio, e lo scambio stesso. Uno scambio **non è un task e
non ne crea uno**: una domanda a cui il sistema risponde e basta resta uno scambio e muore
lì (o finisce nell'archivio, che è un'altra cosa).

Mentre ascolta, il punto d'ascolto pulsa. È l'unico movimento di INPUT, e dice una cosa
sola: ti sto sentendo.

### E due modalità, che tagliano i tre stati di traverso

I tre stati dicono **quanto** c'è da mostrare. Le due modalità dicono **da dove entra**
quello che dici, e sono ortogonali: ogni stato esiste in tutte e due (17 settembre 2026,
e chiude la quarta domanda di `06-voce`).

| | il microfono | il punto | il campo |
|---|---|---|---|
| **voce** | sente | **pulsa**: ti sto sentendo | c'è, perché l'orecchio non è ancora costruito (`§5`) |
| **tastiera** | spento | fermo e spento | **prende il fuoco da sé**: è l'ingresso, e l'invito dice «scrivi» |

Non sono due prodotti, e la ragione è la prima riga di questo documento: **voce e
scrittura sono di pari grado.** Spegnere il microfono non toglie una funzione — toglie un
canale su due, e quello che resta fa tutto. Per questo in tastiera SYSTEMBAR dice
**SCRIVI** e non *SPENTO*: dichiara un modo, non un guasto.

Una conseguenza sullo stato *assente*: in tastiera INPUT non sparisce mai del tutto.
Se sparisse, l'unica porta d'ingresso sarebbe un campo invisibile, e a schermo non ci
sarebbe niente che dica da dove si entra. In voce invece continua a sparire, perché il
punto e la voce bastano.

### Il gesto che non ha una frase

Spegnere si dice — «non ascoltare», «scrivo» — ed è una mossa come le altre. **Riaccendere
no**, e non è una dimenticanza: sono due impossibilità diverse, e conviene tenerle
distinte.

- **non si può dire.** Col microfono spento non c'è niente che ti senta: una frase per
  riaccenderlo sarebbe una frase che il sistema non può ricevere;
- **non è una mossa dell'AI engine.** Un assistente che ti apre il microfono da sé è un altro
  prodotto. Non c'è uno strumento per farlo — non «c'è e non lo usa»: non c'è (`§2`).

Quindi riaccenderlo è **l'unico atto del sistema che esiste soltanto come gesto**: si preme
il microfono in SYSTEMBAR. È un'eccezione dichiarata alla legge 01, nella stessa famiglia
della campanella — un indicatore che si può anche premere — con una differenza: la
campanella ha *anche* una frase, questo no, perché non può averla.

Per questo la riga che il sistema dice spegnendosi è quella che conta: *«Non ascolto più.
Scrivi, e per riaccendermi premi il microfono.»* Senza quella, spegnere sarebbe una porta
che si chiude senza maniglia.

---

## 2. Un cervello solo, e delle API

Fino al 16 settembre 2026 i cervelli erano due: un **locale** — veloce, sempre acceso,
mai fuori dalla macchina — che trascriveva, riconosceva il verbo di apertura, risolveva i
riferimenti a ciò che era a schermo e decideva se serviva pensare; e un **AI engine**, lento,
che pensava. In mezzo, un metalinguaggio: l'*intesa*.

**Il 17 settembre 2026 il locale è stato abolito.** Non ridotto, non rimandato: tolto.
Resta un cervello solo, e gli si dà una cosa che prima non aveva — **le mani**.

### Cosa vuol dire, esattamente

Prima l'AI engine pensava e qualcun altro muoveva. Poteva rispondere e segnarsi le cose, ma
non poteva *toccare*: consegnare, rimandare, spostare il fuoco, aprire un cassetto erano
mestieri del locale, e l'AI engine non li vedeva nemmeno.

Adesso muove lui, e l'unico modo che ha di muovere è un **elenco chiuso di mosse**. Trenta
e poco più, ognuna con il suo nome e il suo *quando*: `guarda`, `al_centro`, `consegna`,
`rimanda`, `componi`, `metti`, `estrai`, `segna`, `chiedi`, `parla`. Non c'è una
trentunesima, e non c'è un modo di farne una: se una mossa non è nell'elenco, il sistema
non la sa fare.

Tre proprietà che lo tengono in piedi, e sono le stesse di prima con un attore di meno:

- **le mosse passano dal motore.** L'AI engine non ha lo stato, non lo vede e non lo scrive:
  chiama una mossa, e la mossa passa da `§4`. Questo non è cambiato, ed è la ragione per
  cui il cambio si è potuto fare in un giorno;
- **l'elenco è il prompt.** Il *quando* di ogni mossa è la riga che il modello legge per
  decidere: non c'è un documento di istruzioni scritto a parte che può divergere dal
  codice. Si aggiunge una mossa, e si è già spiegata;
- **una bocca sola.** Quello che dice lo dice con `parla`, una volta per turno. Le mosse
  che cambiano uno stato rispondono da sé — «Mandata a Andrea», «Annullata» — perché
  quella riga racconta un fatto del modello, non un pensiero.

### La cosa che conta, e che è cambiata di segno

Prima qui c'era scritto, in grande:

> ~~La maggior parte delle frasi non arriva mai all'AI engine.~~

Adesso **ci arrivano tutte.** È il prezzo, ed è giusto scriverlo dove si vede invece di
scoprirlo usando il sistema: «dopo», «manda», «la seconda», «chiudi» erano comandi che il
locale eseguiva in millisecondi, senza rete. Ora fanno un giro come tutti gli altri.

Si è scelto lo stesso, per una ragione che vale più della latenza: **due cervelli sono due
grammatiche da tenere d'accordo.** Quella chiusa cresceva a ogni catena — sei azioni in un
giorno solo, il 16 settembre — e ogni parola nuova andava insegnata due volte, in due
posti, con due modi di sbagliare. E il momento in cui i due leggevano la stessa frase in
modo diverso aveva bisogno di un meccanismo suo: chi vince, chi chiede, chi non si muove.
Quel momento adesso non esiste.

### Mentre pensa, lo schermo sta fermo

Non c'è più niente che muova l'interfaccia in millisecondi, e **non si è messo niente al
suo posto.** Finché l'AI engine non ha deciso, INPUT pulsa e non si muove nient'altro.

È una scelta, non una mancanza. Un riflesso che *indovina* di cosa stai parlando sposta le
cose sotto le mani di chi guarda, e quando ha indovinato male le rimette a posto: la
scrivania balla. Meglio ferma per mezzo secondo che viva e bugiarda — ed è lo stesso
principio per cui, quando l'AI engine non è sicuro di quale cosa parli, **chiede e aspetta**
invece di scegliere la più probabile.

Resta una cosa sola di qua dal confine, e non è intelligenza: la **raccolta** di INPUT
(`§1`) continua a mostrare che hai nominato Acme mentre scrivi. È una ricerca nell'elenco
di quello che c'è a schermo, non una decisione: si vede *che* l'hai nominata, e non si
muove niente.

### Come guarda — `guarda`, e se la chiede lui

L'AI engine ha bisogno di avere la board sotto controllo per poterla muovere, e ce l'ha in un
modo solo: **la chiede.** `guarda` è la prima mossa di ogni turno, e torna lo schermo per
intero in parole — le aree, i task con id, luogo e avanzamento, chi è a fuoco, i gruppi, il
cassetto, lo scambio aperto, e le frasi che potresti dire adesso.

Non gli arriva addosso da sé, e il perché è semplice: una fotografia che non ha chiesto è
una fotografia che non sa di quando è. Fra una frase e l'altra il mondo va avanti — arriva
una mail, un rimando scade — e un AI engine che si fida di quello che si ricorda muove la
cosa sbagliata. Se un id non c'è più, la mossa non si fa e glielo si dice: *guarda di
nuovo, gli id cambiano*.

Quello che la vista **non** contiene è altrettanto importante: niente percorsi di file, e
niente memoria. Dell'archivio l'AI engine vede solo quello che chiede con `ricorda`, e sono
contenuti, mai posizioni (`05-archivio §3`).

### Cosa si ricorda, fra un turno e l'altro

Si ricorda **la giornata di lavoro** (17 settembre 2026): i discorsi restano finché sei
dentro le ore che il profilo dichiara (`03-conoscenza §2`), e fuori da quelle riparte. Non
è un numero nuovo — è una cosa che il modello aveva già.

La regola che lo tiene onesto è una sola, e conviene impararla come una frase:

> **Ricordare la conversazione non è ricordare lo schermo.**

I discorsi gli arrivano come discorsi; quello che c'è **a schermo** lo rilegge con `guarda`
ogni volta, sempre. Le due cose scadono in momenti diversi e devono: così può capire «no,
l'altra» tre minuti dopo, e non può parlarti di una carta che nel frattempo è caduta in
`MEMORIA`. Un AI engine che si fidasse del suo ricordo dello schermo muoverebbe la cosa
sbagliata, e sarebbe *sicuro* di aver ragione.

Due conseguenze pratiche:

- **INPUT e l'AI engine dimenticano in momenti diversi.** A schermo la conversazione dura
  trenta secondi (`§1`); nella sua testa dura la giornata. Non è un'incoerenza: uno mostra,
  l'altro capisce, e mostrare per otto ore vorrebbe dire una bolla che cresce fino a sera;
- **non si taglia una conversazione a metà.** Se l'ora passa le 19 mentre stai parlando,
  quello che vi state dicendo resta — altrimenti alle 19:01 dimenticherebbe in mezzo a una
  frase, che è il difetto peggiore di legare la memoria a un orario.

### Quanto costa rimandargli tutto

La Messages API è senza stato: non esiste un «all'inizio». Il prompt — chi è, il copione,
e le mosse con il loro *quando* — **viaggia a ogni richiesta**, per costruzione.

Quello che lo rende sostenibile è che quel prefisso non cambia mai di un byte, quindi si
legge dalla cache invece di ripagarlo: prima gli strumenti, poi il sistema, e il segno
sull'ultimo blocco copre tutto quello che sta prima. Vive un'ora, perché fra una frase e
l'altra di una sessione vera passa spesso più di cinque minuti.

Da qui una regola sul prompt che sembra pedanteria e non lo è: **niente che cambi da sé
può entrarci.** Non l'ora, non un id, non un contatore. L'ora sta nella vista, che viaggia
dopo. Quello che cresce — i discorsi della giornata — sta dopo il segno, quindi crescere
non costa il prompt intero.

Come si controlla che stia funzionando: `cache_read_input_tokens` nella riga che la porta
scrive a ogni passo. Se resta zero a richieste ripetute, qualcosa nel prefisso si muove, e
si guarda il prompt — non la cache.

### Il copione — chi è, e da dove viene

Il carattere dell'assistente **sta nel profilo**, in `Archivio/<id>/settings.txt`, sotto
`copione:` (17 settembre 2026): si prova cambiando una riga e ricaricando, come il tema e
la voce. Il server lo legge da sé, dal nome del profilo che il browser gli manda — se
arrivasse il testo dalla pagina, il `system` del modello verrebbe dal client, ed è
esattamente la forma che `§3` esclude.

Quello che il profilo **non** può cambiare sono le tre leggi sul carattere, che stanno nel
codice: un personaggio non è un ostacolo, non chiede di essere consolato, e dice «io»
senza avere opinioni sue (`06-voce §2`). Un file che si edita a mano può cambiare *come*
parla, non *cosa gli è permesso essere* — se «non è un ostacolo» fosse scrivibile di là,
la prima volta che serve un assistente più simpatico sparirebbe.

Senza copione l'AI engine dice le leggi e nessun carattere: parla corretto e non parla come
qualcuno. È una mancanza che si sente, ed è giusto che si senta.

### Gli errori tornano a lui

Una mossa che non si può fare non è un'eccezione: è una risposta, scritta in italiano, che
torna all'AI engine. *Non c'è nessun task t7.* *Non c'è nessun gruppo Acme.* *A componi manca
richiesta.* Così impara dentro il turno, e non c'è un posto dove un errore si perde.

### I secondari — l'AI engine che si moltiplica

Quando una cosa sola non basta, l'AI engine delega: uno o più **agenti secondari**, che
lavorano in parallelo dentro un task che esiste già. Non sono un servizio e non stanno sul
confine (`02-confini §5`): sono un modo di lavorare, non un posto.

Quello che li tiene a bada è la regola che vale già per l'AI engine (`§4`), e vale identica:

> **Un secondario non tocca lo stato, non consegna, non scrive nell'archivio.**

Tre no, tre buchi diversi:

- **non tocca lo stato** — gli attori delle transizioni sono tre e sono la tua voce, il
  tempo e il mondo (`01-modello §3`). Un secondario non è un quarto attore: è lavoro
  dentro un task che qualcuno ha già aperto;
- **non consegna** — il cancello `aspetta te` è tuo. Ciò che esce passa da te, non da un
  delegato del tuo delegato;
- **non scrive nell'archivio** — **la memoria ha una penna sola** (`05-archivio §3`). Con
  due, «chi l'ha detto» smetterebbe di voler dire qualcosa.

### Come sono fatti, adesso che ci sono

**Girano dal 17 settembre 2026**, e sono stati la prima cosa che il cervello unico ha reso
quasi gratis: un secondario non è un pezzo nuovo di sistema, è **lo stesso AI engine con tre
mosse invece di trentasette**.

Il principale li chiama con `delega`: un task che esiste già, e un lavoro per riga. Quello
che ognuno ha in mano è `MOSSE_SECONDARIE`, e sono tre:

```
guarda    lo schermo, come lo vede il principale
ricorda   l'archivio, per i nomi che gli servono
riporta   il suo lavoro, una volta, e finisce lì
```

**I tre no del documento non sono controlli:** sono tre nomi che mancano da quell'elenco.

| il no | come è fatto rispettare |
|---|---|
| non tocca lo stato | nessuna mossa che sposti un task o muova il fuoco |
| non consegna | `consegna` non c'è. Quando finiscono il task torna `aspetta te` |
| non scrive nell'archivio | `segna` non c'è: la penna è una sola |

E ce n'è un quarto che non era scritto e serviva: **non parla.** `parla` non è fra le tre.
Un secondario riporta al principale, che è l'unico con una bocca — se ce l'avessero anche
loro, una richiesta produrrebbe tre voci.

**Un livello solo, e non serve ricordarselo.** `delega` non è fra le tre, quindi un
secondario non delega: la ricorsione non è vietata, è *impossibile*, perché la parola per
farla non esiste. Così «aspetta» ferma una fila e non un albero.

**La faccia è la frazione.** Mentre lavorano, il task che li contiene è `in corso` e porta
`0/2`, `1/2`, `2/2` nel suo dato — e quello è tutto ciò che si vede di loro. Quando l'ultimo
riporta, i riporti diventano l'`esito` del task e il task torna al cancello.

**Muoiono col task**, e si controlla al ritorno di ognuno e non alla partenza: se quello
dentro cui lavoravano non c'è più, quello che riportano si butta. Uno che non ce la fa non
ferma gli altri e non passa per buono — la frazione arriva in fondo, il suo riporto no.

Nel prototipo dietro c'è un secondario finto che sa **un mestiere solo**: legge quello che
il task ha dentro e lo dice corto. Non è quello che farà un modello; è la forma di ciò che
farà, e basta a vedere la frazione salire.

**Un livello solo.** Il principale delega; un secondario lavora e riporta, e non delega a
sua volta. Così «aspetta» ferma una fila e non un albero, e non esiste il momento in cui
non sai più quanti ne stanno girando.

**Non si vedono.** Un secondario non è un task e non compare mai a schermo: il chip salvia
che pulsa con la frazione che sale *è già* la sua faccia (`01-modello §4`). Se ne avesse
una sua, avresti due cose a schermo per una intenzione sola, e salta la legge 03.

**Muoiono col task.** L'agente perpetuo è uno solo (`05-archivio`): i secondari sono usa e
getta, e quando il task si chiude non resta niente di loro — nessuna memoria, nessun
residuo, niente da ripulire.

---

## 3. Il guardiano, e la legge che si è rotta

SYSTEMBAR dichiara per primo dove finisce quello che dici (`L1 - Sistema`), e quella
dichiarazione dev'essere vera. Fino al 16 settembre 2026 diceva una cosa forte, e la
manteneva:

> ~~**La trascrizione non esce mai.** Quello che esce, quando serve l'AI engine, è la
> richiesta e il contesto necessario a rispondere.~~

**Quella legge è caduta il 17 settembre 2026, e non si finge che non sia caduta.** Se il
cervello è uno e sta in rete, ogni frase che dici esce: non c'era un modo di abolire il
locale e tenerla. Al posto suo restano tre regole, più deboli e vere:

- **esce il testo, non l'audio.** L'orecchio e la bocca sono rimasti in locale: Whisper
  trascrive sulla macchina, Piper legge sulla macchina. Non sono pensiero — sono ingresso e
  uscita — e non c'era ragione di spedirli via insieme al resto (`06-voce`);
- **esce da una porta sola, e la porta si guarda.** Tutto passa da `/ai-engine`, che gira su
  Node e non nel browser: la chiave non entra mai nella pagina, e ogni passo verso il
  modello lascia una riga che si legge. Se i punti d'uscita fossero dieci, non si
  potrebbero guardare;
- **niente esce senza che si veda.** SYSTEMBAR lo dice mentre succede, e adesso lo dice
  sempre, perché adesso succede sempre.

E la vista che l'AI engine chiede è **quello che è a schermo**, non tutto quello che il
sistema sa: l'archivio resta fuori finché non lo chiede per nome, e quando lo chiede ne
riceve contenuti, non posizioni.

Cosa esattamente l'AI engine veda della memoria (`03-conoscenza`) resta una domanda aperta, e
con un cervello solo pesa più di prima.

---

## 4. La catena

```
  voce ──▶ trascrizione (in locale) ──┐
                                      ├──▶ AI ENGINE ──┬──▶ guarda ──────▶ la vista
  scrittura ──────────────────────────┘      ▲      │
                                             │      ├──▶ una mossa ──▶ MOTORE ──┐
                                             └──────┤                           │
                                        cosa ha visto└──▶ parla ──▶ risposta (testo)
                                                                                 │
                                                          ┌──────────────────────┴───┐
                                                          ▼                          ▼
                                                    schermo (sempre)      voce (in parallelo)
```

Il motore è la macchina a stati di `01-modello`: riceve comandi, cambia stato, chiede
consegne ai servizi di `02-confini`. L'AI engine non tocca lo stato direttamente — **passa
sempre dal motore**, che è l'unico posto dove un task cambia.

Il giro — chiede una mossa, la mossa si esegue, gli si riporta cosa ha visto, e si
ricomincia — sta **dalla parte dello schermo**, non dalla parte del modello. Lo stato è
qui: se il giro fosse di là, ogni mossa dovrebbe portarsi dietro la scrivania intera e
riportarla indietro. Così invece il modello fa un passo alla volta, e resta senza memoria
fra un passo e l'altro: quello che sa del turno è quello che gli si rimanda.

Un turno finisce quando l'AI engine dice qualcosa, o quando non chiede più niente. Al
massimo dieci mosse: oltre quelle, lo schermo ha smesso di essere una conseguenza di
quello che hai detto e diventa un film che guardi.

---

## 5. Nel prototipo

Web, TypeScript, Vite. Prima tutto scritto, la voce dopo.

| pezzo | nel prototipo | dove si va a finire |
|---|---|---|
| **trascrizione** | niente: si scrive | Whisper in locale |
| ~~il locale~~ | **non esiste più** (17 settembre 2026) | — |
| **l'AI engine** | **API Claude** dietro `/ai-engine`, con le mosse in mano | lo stesso, e i secondari |
| **l'AI engine, senza chiave** | **regole**, oltre lo stesso confine | — |
| **l'archivio** | file veri su un disco finto | gli stessi file, su un disco vero |
| **la voce che legge** | Piper, in locale | Piper o Kokoro |
| **i servizi** | finti (`02-confini §4`) | veri |

Tre scelte da spiegare:

**Il parser non è stato buttato: è passato oltre il confine.** Era il locale, e adesso è il
modo in cui il **AI engine finto** fa le veci di quello vero — esattamente come i servizi
finti di `02-confini §4` fanno le veci dei veri. Da dentro è indistinguibile: escono le
stesse chiamate, e le catene di `07-flussi` si vedono girare senza chiave e senza rete. La
differenza è tutta in cosa fa: prima **decideva** quali frasi meritassero l'AI engine; adesso
**simula** un AI engine che non c'è.

**Senza chiave si ripiega, e si vede.** `.env` non c'è, la porta risponde
503, e da quel momento pensa il finto — con una riga in console e il nome che cambia sulla
pedana. Non si finge mai di pensare.

**La voce che legge va messa subito** anche se si scrive soltanto. È l'unico modo per
scoprire presto se il copy è davvero dicibile — ed è il vincolo più facile da violare senza
accorgersene.

### Whisper trascrive, non parla

È l'orecchio, non la bocca — e non è nemmeno il riconoscitore: dice *cosa* è stato detto,
non *da chi*. Sono tre modelli diversi, e stanno in un documento loro: `06-voce`.

---

## 6. Domande aperte

1. ~~**Cosa vede l'AI engine.** Tutto il grafo, o un estratto?~~ **Deciso: un estratto.**
   La memoria è un archivio di file (`05-archivio`), e l'estratto è un pugno di percorsi:
   i file delle entità che hai nominato, più un salto lungo i collegamenti. Quanti file e
   quanti salti resta da vedere sui dati — `05-archivio §8.1`.
2. ~~**Quale modello in locale**, e se gira su CPU o pretende GPU.~~ **Caduta col locale**
   (17 settembre 2026). Resta per l'orecchio e per la bocca, e sta in `06-voce`.
3. **La latenza, che adesso è la prima domanda e non la quarta.** Ogni frase fa un giro di
   rete, «dopo» e «manda» compresi. Quanto è troppo, prima che il sistema smetta di
   sembrare istantaneo? E se si scoprisse che è troppo, la risposta è un modello più
   pronto, una mossa che parte prima di finire di pensare, o un riflesso che torna?
4. **L'interruzione.** «Aspetta» ferma l'azione in corso — ma deve fermare anche la voce
   che sta leggendo, a metà parola. È un requisito sul TTS, non solo sul motore. Con un
   cervello solo se ne aggiunge un pezzo: deve fermare anche **un turno a metà**, con
   delle mosse già fatte e delle altre ancora da chiedere.
5. **Quante mosse per turno.** Il tetto è dieci, e dieci è un numero messo lì. Un turno
   che ne fa otto è un turno o è un sistema che sta lavorando per conto suo?
6. **Quanto scambio tiene INPUT.** Botta e risposta resta — ma per quanto? Fino a fine
   giornata, finché la conversazione è aperta (30 s, `01-modello §3`), o un numero fisso
   di scambi? E cosa succede quando lo scambio riguarda un task che nel frattempo è
   caduto in `MEMORIA`. Da definire meglio: per ora tiene, e basta.
7. ~~**Cosa sa l'AI engine fra un turno e l'altro.**~~ **Deciso il 17 settembre 2026: la
   giornata di lavoro** — vedi `§2`. Resta da vedere sui dati se una giornata di discorsi
   stia comoda nel prefisso o se vada riassunta, ma è una domanda di token e non di
   modello.
