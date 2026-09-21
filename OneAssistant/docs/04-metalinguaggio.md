# 04 — Il metalinguaggio

Come si danno a un modello istruzioni specifiche e deterministiche, e come si fa in modo
che quelle istruzioni non cambino da un giorno all'altro.

È il documento che risponde alla sola obiezione seria che si può fare a questo progetto:
**come fa un sistema costruito su una cosa probabilistica a essere prevedibile.**

---

## 1. Cos'è, e cosa non è

Il metalinguaggio è nato come ponte fra due cervelli — il locale e quello lento — e il 17
settembre 2026 quel ponte è stato tolto insieme al locale (`03-architettura §3`). Quello
che è rimasto ha cambiato mestiere, e vale la pena dire subito cos'è adesso:

> **Il metalinguaggio è il contratto fra noi e l'AI engine. Dice cosa può fare, con che
> parole, e in che circostanze — e non cambia perché il modello ha avuto una giornata
> diversa.**

Tre cose che **non** è, e sono le tre confusioni possibili:

- **non è un secondo modello.** Non c'è un'intelligenza che traduce e un'altra che esegue:
  il motore ha **una IA sola** (`03-architettura §3`). Se ce ne fossero due, sarebbero due
  grammatiche da tenere d'accordo, e quel problema è stato risolto togliendone una;
- **non è una lingua che parli tu.** Tu parli come parli. Il metalinguaggio sta *dopo* di
  te: è quello che il modello produce dopo aver capito, non quello che tu devi produrre per
  farti capire;
- **non è un formato.** Non è JSON contro XML. È **l'elenco di quello che si può dire**, e
  la sua forza sta tutta nel fatto che è chiuso.

---

## 2. Le mosse

L'unico modo che l'AI engine ha di toccare qualcosa è un **elenco chiuso di mosse**. Trenta
e poco più, ognuna con il suo nome e il suo *quando*: `guarda`, `al_centro`, `consegna`,
`rimanda`, `componi`, `metti`, `estrai`, `segna`, `chiedi`, `parla`. Non c'è una
trentunesima, e non c'è un modo di farne una: **se una mossa non è nell'elenco, il sistema
non la sa fare.**

Tre proprietà lo tengono in piedi:

- **le mosse passano dal motore.** L'AI engine non ha lo stato, non lo vede e non lo scrive:
  chiama una mossa, e la mossa passa da `03-architettura §2`;
- **l'elenco è il prompt.** Il *quando* di ogni mossa è la riga che il modello legge per
  decidere: non c'è un documento di istruzioni scritto a parte che può divergere dal codice.
  Si aggiunge una mossa, e si è già spiegata;
- **una bocca sola.** Quello che dice lo dice con `parla`, una volta per turno. Le mosse che
  cambiano uno stato rispondono da sé — «Mandata a Andrea», «Annullata» — perché quella riga
  racconta un fatto del modello, non un pensiero.

**Più mosse in un turno sono più chiamate, non una parola nuova.** «Aggiungi una emoji del
cuore e invia» è una frase sola e due mosse: l'AI engine le chiede in fila, e ognuna vede lo
stato che le ha lasciato quella prima. Fino al 16 settembre esisteva un comando `sequenza`,
cioè un comando con dentro altri comandi; è uscito dal modello e non ci rientra
(`09-catene §5`).

È anche la risposta a una cosa che sembra mancare e non manca: **«crea un flusso e mettici
il primo, il secondo e il terzo»** non ha bisogno di una mossa sua. Sono tre `metti` in
fila, e il flusso nasce alla prima (`01-modello §6`). Una mossa che ne contenesse tre
sarebbe `sequenza` con un altro nome.

### Le azioni su un task, e le tre che mancano

Il ciclo di un task (`01-modello §2`) si percorre con queste. La colonna di destra è
quello che conta: dice se la parola esiste già o se è un buco dichiarato.

| l'azione | le mosse di oggi | |
|---|---|---|
| **genera contesto** | `guarda` lo schermo, `ricorda` la memoria | **mezza.** Vedi sotto |
| **crea** | nasce dal turno; `componi` per un messaggio, `ricordami` per una cosa che deve tornare | c'è |
| **modifica** | `aggiungi`, `riscrivi` | c'è, ma solo su una composizione |
| **leggi · riassumi** | `leggi`, `riassumi`, `mostra` | c'è |
| **fork** | — | **manca** |
| **crea flusso · aggiungi a flusso** | `metti`, che crea il flusso se non c'è | c'è |
| **togli da un flusso** | `separa`, che però scioglie il flusso intero | **manca** |
| **elimina · cancella** | — | **non esiste, e non per dimenticanza** |

**«Genera contesto» oggi è mezza.** Il sistema sa guardare lo schermo e sa guardarsi in
testa, e **non sa cercare nel mondo**: non c'è una mossa che legga la posta, apra un
documento sul disco o interroghi il calendario per capire meglio. Il verbo esiste già di
là dal confine — `leggi` è uno dei tre di ogni servizio (`06-confini §1`) — ma nessuna
mossa lo raggiunge. È il buco più grosso dei tre, ed è quello che separa un assistente che
esegue da uno che capisce prima di eseguire.

**«Elimina» non c'è perché niente si scarta.** È una decisione chiusa e vale la pena
ripeterla qui, perché è la prima cosa che si prova ad aggiungere: quello che non ti serve
più si dice con «lascia stare» — e il task **conclude**, dentro, senza che nulla esca — o
con «dopo», e torna da sé a un'ora che il sistema ti dice. Non mancava uno stato: mancava
la frase, e una cosa messa via di cui sai quando torna non è una cosa persa
(`09-catene §2`).

**Le due che mancano si aggiungono con le regole del §9**: una mossa nuova, non una vecchia
allargata, e nessuna delle due entra finché non c'è una frase che sappia pronunciarla.
Per il fork quella frase probabilmente non la dici tu — è il sistema che forka mentre
lavora — e allora la prova che serve è l'altra: che a schermo si veda nascere un task che
non hai chiesto, **e si capisca perché**.

---

## 3. La vista

L'AI engine ha bisogno di avere la scrivania sotto controllo per poterla muovere, e ce l'ha
in un modo solo: **la chiede**. `guarda` è la prima mossa di ogni turno, e torna lo schermo
per intero in parole — le aree, i task con id, luogo e avanzamento, chi è a fuoco, i flussi,
il cassetto, lo scambio aperto, e le frasi che potresti dire adesso.

Non gli arriva addosso da sé, e il perché è semplice: **una fotografia che non ha chiesto è
una fotografia che non sa di quando è.** Fra una frase e l'altra il mondo va avanti — arriva
una mail, un rimando scade — e un AI engine che si fida di quello che si ricorda muove la
cosa sbagliata. Se un id non c'è più, la mossa non si fa e glielo si dice: *guarda di nuovo,
gli id cambiano*.

Quello che la vista **non** contiene è altrettanto importante: niente percorsi di file, e
niente memoria. Della memoria l'AI engine vede solo quello che chiede con `ricorda`, e sono
contenuti, mai posizioni (`07-memoria §9`).

---

## 4. Cosa si ricorda fra un turno e l'altro

Si ricorda **la giornata di lavoro**: i discorsi restano finché sei dentro le ore che il
profilo dichiara (`07-memoria §3`), e fuori da quelle riparte.

La regola che lo tiene onesto è una sola, e conviene impararla come una frase:

> **Ricordare la conversazione non è ricordare lo schermo.**

I discorsi gli arrivano come discorsi; quello che c'è **a schermo** lo rilegge con `guarda`
ogni volta, sempre. Le due cose scadono in momenti diversi e devono: così può capire «no,
l'altra» tre minuti dopo, e non può parlarti di un task che nel frattempo è caduto in
`MEMORIA`. Un AI engine che si fidasse del suo ricordo dello schermo muoverebbe la cosa
sbagliata, e sarebbe *sicuro* di aver ragione.

Due conseguenze pratiche:

- **INPUT e l'AI engine dimenticano in momenti diversi.** A schermo la conversazione dura
  trenta secondi (`05-interfaccia §2`); nella sua testa dura la giornata. Non è
  un'incoerenza: uno mostra, l'altro capisce, e mostrare per otto ore vorrebbe dire una
  bolla che cresce fino a sera;
- **non si taglia una conversazione a metà.** Se l'ora passa le 19 mentre stai parlando,
  quello che vi state dicendo resta — altrimenti alle 19:01 dimenticherebbe in mezzo a una
  frase, che è il difetto peggiore di legare la memoria a un orario.

---

## 5. Il copione

Il carattere dell'assistente **sta nel profilo**, in `Archivio/<id>/settings.txt`, sotto
`copione:`: si prova cambiando una riga e ricaricando, come il tema e la voce. Il server lo
legge da sé, dal nome del profilo che il browser gli manda — se arrivasse il testo dalla
pagina, il `system` del modello verrebbe dal client, ed è esattamente la forma che
`03-architettura §5` esclude.

Quello che il profilo **non** può cambiare sono le tre leggi sul carattere, che stanno nel
codice: un personaggio non è un ostacolo, non chiede di essere consolato, e dice «io» senza
avere opinioni sue (`08-voce §3`). Un file che si edita a mano può cambiare *come* parla,
non *cosa gli è permesso essere* — se «non è un ostacolo» fosse scrivibile di là, la prima
volta che serve un assistente più simpatico sparirebbe.

Senza copione l'AI engine dice le leggi e nessun carattere: parla corretto e non parla come
qualcuno. È una mancanza che si sente, ed è giusto che si senta.

---

## 6. Gli errori tornano a lui

Una mossa che non si può fare non è un'eccezione: è **una risposta, scritta in italiano**,
che torna all'AI engine. *Non c'è nessun task t7.* *Non c'è nessun flusso Acme.* *A componi
manca richiesta.*

Così impara dentro il turno, e non c'è un posto dove un errore si perde. È anche il motivo
per cui il sistema non ha bisogno di validare due volte: **la validazione è il messaggio di
errore**, e il messaggio di errore è una frase che il modello legge.

---

## 7. Perché resta prevedibile

Qui sta il senso di tutto il documento. Un modello probabilistico rende prevedibile un
sistema a cinque condizioni, e ci sono tutte e cinque:

1. **L'insieme delle azioni è chiuso.** Qualunque cosa il modello pensi, quello che può fare
   sono trentasette cose. Il peggio che può succedere non è una cosa imprevista: è la cosa
   sbagliata fra quelle previste — che si vede, si annulla e si corregge.
2. **Ogni azione ha un bersaglio che esiste o non esiste.** Si muove un task per `id`, non
   per descrizione. Un id che non c'è più non produce un'approssimazione: produce un errore
   (§6).
3. **Chi esegue non è chi decide.** Il motore applica le regole di `01-modello` a
   prescindere da cosa il modello si aspettava: una combinazione illegale non si verifica
   perché è il motore a costruire lo stato, non il modello a dichiararlo.
4. **Niente attraversa il confine senza una tua parola.** Lo sbaglio più caro — mandare la
   cosa sbagliata a qualcuno — è l'unico che richiede un passaggio che il modello non può
   fare da solo (`06-confini §6`).
5. **Il prefisso non cambia di un byte.** Le istruzioni che il modello legge sono le stesse
   a ogni richiesta, per costruzione (§8). Un sistema in cui il prompt si compone a runtime
   con pezzi che dipendono dall'ora o dallo stato è un sistema che si comporta diversamente
   ogni giorno **senza che nessuno abbia cambiato niente** — e quando sbaglia non si sa
   nemmeno cosa guardare.

Ne segue la frase che vale la pena tenere:

> **Non si rende prevedibile un modello. Si rende prevedibile ciò che il modello può
> toccare.**

---

## 8. Quanto costa rimandargli tutto

La Messages API è senza stato: non esiste un «all'inizio». Il prompt — chi è, il copione, e
le mosse con il loro *quando* — **viaggia a ogni richiesta**, per costruzione.

Quello che lo rende sostenibile è che quel prefisso non cambia mai di un byte, quindi si
legge dalla cache invece di ripagarlo: prima gli strumenti, poi il sistema, e il segno
sull'ultimo blocco copre tutto quello che sta prima. Vive un'ora, perché fra una frase e
l'altra di una sessione vera passa spesso più di cinque minuti.

Da qui una regola sul prompt che sembra pedanteria e non lo è: **niente che cambi da sé può
entrarci.** Non l'ora, non un id, non un contatore. L'ora sta nella vista, che viaggia dopo.
Quello che cresce — i discorsi della giornata — sta dopo il segno, quindi crescere non costa
il prompt intero.

Come si controlla che stia funzionando: `cache_read_input_tokens` nella riga che la porta
scrive a ogni passo. Se resta zero a richieste ripetute, qualcosa nel prefisso si muove, e
si guarda il prompt — non la cache.

Si noti che la regola tecnica della cache e la quinta condizione del §7 sono **la stessa
regola**: il prefisso deve essere immobile perché costi poco, e deve essere immobile perché
il sistema si comporti uguale domani. Che due ragioni diverse chiedano la stessa cosa è il
segno che è la cosa giusta.

---

## 9. Come si cambia il metalinguaggio

Un contratto che si può cambiare in silenzio non è un contratto. Quattro regole, e valgono
per chiunque ci rimetta mano:

- **si aggiunge una mossa, non si allarga una mossa.** Se `consegna` comincia ad accettare
  un caso nuovo, tutto quello che è stato provato su `consegna` va riprovato. Una mossa
  nuova invece nasce senza passato e non può rompere niente;
- **una mossa non cambia significato.** Il nome è la cosa che il modello ha imparato a
  usare: cambiarne il senso tenendo il nome è il modo più rapido per avere un sistema che
  fa una cosa diversa da quella che il documento dice;
- **il *quando* si scrive insieme alla mossa**, nella stessa riga di codice. Se il *quando*
  vive altrove, prima o poi dirà un'altra cosa;
- **niente si aggiunge senza una frase che lo pronunci.** Una mossa che nessuna frase sa
  chiamare è un comando morto, e ce n'è già stato uno — `sciogli`, che il modello conosceva
  e che nessuno sapeva dire (`09-catene §6`). Il banco lo scopre, ma solo se la parola
  nuova entra anche nell'alfabeto.

---

## 10. Domande aperte

1. **Quante mosse per turno.** Il tetto è dieci, e dieci è un numero messo lì. Un turno che
   ne fa otto è un turno o è un sistema che sta lavorando per conto suo?
2. **La latenza.** Ogni frase fa un giro di rete, «dopo» e «manda» compresi. Quanto è
   troppo, prima che il sistema smetta di sembrare istantaneo? E se fosse troppo, la
   risposta è un modello più pronto, una mossa che parte prima di finire di pensare, o un
   riflesso che torna?
3. **L'interruzione a metà turno.** «Aspetta» deve fermare delle mosse già fatte e delle
   altre ancora da chiedere. Cosa resta fatto, e cosa si dice.
4. **Se le mosse vadano riordinate.** Trentasette nomi cresciuti uno alla volta non sono
   la stessa cosa di trentasette nomi progettati insieme. È la ristrutturazione di
   `05-interfaccia §5`, e questa è la sua metà che riguarda la lingua.
