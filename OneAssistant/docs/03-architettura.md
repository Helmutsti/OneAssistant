# 03 — L'architettura

I pezzi di cui è fatta la macchina, come una frase li attraversa tutti, e chi ha il
permesso di toccare cosa.

Gli altri documenti guardano un pezzo per volta. Questo è l'unico che li guarda insieme, e
serve a una cosa sola: **poter dire, di qualunque comportamento, da dove viene**.

---

## 1. I pezzi

Sette, e nessuno di più. Quello che non sta in questa tabella non esiste nel sistema.

| pezzo | cosa fa | dove | chi lo chiama |
|---|---|---|---|
| **l'orecchio** | trascrive quello che dici | in locale | il browser, quando parli |
| **l'AI engine** | capisce, e decide le mosse | in rete, dietro `/ai-engine` | il motore, una volta per frase |
| **il motore** | **l'unico posto dove un task cambia** | in pagina | l'AI engine, una mossa per volta |
| **le aree** | disegnano lo stato, e nient'altro | in pagina | il motore, quando qualcosa cambia |
| **la memoria** | quello che il sistema sa di te | su disco | l'AI engine, con una penna sola |
| **i servizi** | il mondo: posta, calendario, disco… | oltre il confine | il motore, con tre verbi |
| **la bocca** | legge le risposte ad alta voce | in locale | il turno di parola, una cosa per volta |

Due righe di questa tabella sono leggi travestite da caselle, e conviene leggerle due
volte: **l'AI engine non è nell'elenco di chi tocca lo stato**, e **il motore non è
nell'elenco di chi decide**. Sono i due errori che il sistema non può fare, e non li fa
perché non ha le mani per farli.

---

## 2. La catena

```
   voce ──▶ orecchio ──┐
   (in locale)         │
                       ├──▶  AI ENGINE  ──┬──▶ guarda ────────▶ la vista, in parole
   scrittura ──────────┘        ▲         │
                                │         ├──▶ ricorda ───────▶ la memoria (contenuti,
                                │         │                     mai posizioni)
                                │         │
                                │         ├──▶ una mossa ─────▶ MOTORE ──┬──▶ le aree
                                │         │                              │
                                │         │                              └──▶ un servizio
                                │         │                                   (solo dopo
                                │         │                                    «aspetta te»)
                                │         │
                                │         ├──▶ delega ────────▶ i secondari, in parallelo
                                │         │                     (02-parallelo §3)
                                │         │
                                │         └──▶ parla ─────────▶ la risposta, in testo
                                │                                     │
                                └──────────────────────────────┐      ├──▶ schermo (subito)
                                    cosa ha visto la mossa     │      └──▶ bocca (in parallelo,
                                                               ┘           e in ordine)
```

Tre cose da leggere in questo disegno, e sono tre decisioni:

**Il giro sta dalla parte dello schermo, non dalla parte del modello.** L'AI engine chiede
una mossa, la mossa si esegue qui, e gli si riporta cosa ha visto. Se il giro fosse di là,
ogni mossa dovrebbe portarsi dietro la scrivania intera e riportarla indietro. Così invece
il modello fa un passo alla volta e resta **senza memoria fra un passo e l'altro**: quello
che sa del turno è quello che gli si rimanda.

**Tutto quello che cambia passa dal motore.** Non c'è una freccia che vada dall'AI engine a
un'area o a un servizio senza passare di lì. È la ragione per cui il 17 settembre si è
potuto togliere un cervello intero in un giorno: cambiava chi chiedeva, non chi faceva.

**Un turno finisce** quando l'AI engine dice qualcosa, o quando non chiede più niente. Al
massimo dieci mosse: oltre quelle, lo schermo ha smesso di essere una conseguenza di quello
che hai detto e diventa un film che guardi.

---

## 3. Un cervello solo

Fino al 16 settembre 2026 i cervelli erano due: un **locale** — veloce, sempre acceso, mai
fuori dalla macchina — che trascriveva, riconosceva il verbo di apertura, risolveva i
riferimenti a ciò che era a schermo e decideva se serviva pensare; e un **AI engine**,
lento, che pensava. In mezzo, un metalinguaggio.

**Il 17 settembre 2026 il locale è stato abolito.** Non ridotto, non rimandato: tolto.
Resta un cervello solo, e gli si dà una cosa che prima non aveva — **le mani**
(`04-metalinguaggio`).

### Il prezzo, scritto dove si vede

Prima qui c'era scritto, in grande:

> ~~La maggior parte delle frasi non arriva mai all'AI engine.~~

Adesso **ci arrivano tutte**, ed è giusto scriverlo invece di scoprirlo usando il sistema:
«dopo», «manda», «la seconda», «chiudi» erano comandi che il locale eseguiva in
millisecondi, senza rete. Ora fanno un giro come tutti gli altri.

Si è scelto lo stesso, per una ragione che vale più della latenza: **due cervelli sono due
grammatiche da tenere d'accordo.** Quella chiusa cresceva a ogni catena — sei azioni in un
giorno solo — e ogni parola nuova andava insegnata due volte, in due posti, con due modi di
sbagliare. E il momento in cui i due leggevano la stessa frase in modo diverso aveva bisogno
di un meccanismo suo: chi vince, chi chiede, chi non si muove. Quel momento adesso non
esiste.

**Il metalinguaggio invece è rimasto, e ha cambiato mestiere.** Non è più il ponte fra due
cervelli: è il modo di dare a quello rimasto istruzioni specifiche e deterministiche, che
non cambiano da un giorno all'altro. Sta tutto in `04-metalinguaggio`, ed è il documento
che spiega perché un sistema costruito su un modello probabilistico può lo stesso essere
prevedibile.

---

## 4. Mentre pensa, lo schermo sta fermo

Non c'è più niente che muova l'interfaccia in millisecondi, e **non si è messo niente al
suo posto.** Finché l'AI engine non ha deciso, INPUT pulsa e non si muove nient'altro.

È una scelta, non una mancanza. Un riflesso che *indovina* di cosa stai parlando sposta le
cose sotto le mani di chi guarda, e quando ha indovinato male le rimette a posto: la
scrivania balla. Meglio ferma per mezzo secondo che viva e bugiarda — ed è lo stesso
principio per cui, quando l'AI engine non è sicuro di quale cosa parli, **chiede e aspetta**
invece di scegliere la più probabile.

È anche la quarta prova della visione (`00-visione §7`) vista da dentro: un sistema di cui
ti accorgi quando sbaglia è un sistema che non si muove finché non ha capito.

Resta una cosa sola di qua dal confine, e non è intelligenza: la **raccolta** di INPUT
(`05-interfaccia §2`) continua a mostrare che hai nominato Acme mentre scrivi. È una
ricerca nell'elenco di quello che c'è a schermo, non una decisione: si vede *che* l'hai
nominata, e non si muove niente.

---

## 5. Il guardiano — cosa esce dalla macchina

SYSTEMBAR dichiara per primo dove finisce quello che dici (`design/L0 - Sistema.md`), e quella
dichiarazione dev'essere vera. Fino al 16 settembre 2026 diceva una cosa forte:

> ~~**La trascrizione non esce mai.** Quello che esce, quando serve l'AI engine, è la
> richiesta e il contesto necessario a rispondere.~~

**Quella legge è caduta il 17 settembre 2026, e non si finge che non sia caduta.** Se il
cervello è uno e sta in rete, ogni frase che dici esce: non c'era un modo di abolire il
locale e tenerla. Al posto suo restano tre regole, più deboli e vere:

- **esce il testo, non l'audio.** L'orecchio e la bocca sono rimasti in locale: Whisper
  trascrive sulla macchina, Piper legge sulla macchina. Non sono pensiero — sono ingresso e
  uscita — e non c'era ragione di spedirli via insieme al resto (`08-voce`);
- **esce da una porta sola, e la porta si guarda.** Tutto passa da `/ai-engine`, che gira
  su Node e non nel browser: la chiave non entra mai nella pagina, e ogni passo verso il
  modello lascia una riga che si legge. Se i punti d'uscita fossero dieci, non si
  potrebbero guardare;
- **niente esce senza che si veda.** SYSTEMBAR lo dice mentre succede, e adesso lo dice
  sempre, perché adesso succede sempre.

E la vista che l'AI engine chiede è **quello che è a schermo**, non tutto quello che il
sistema sa: la memoria resta fuori finché non la chiede per nome, e quando la chiede ne
riceve contenuti, non posizioni (`07-memoria §9`).

---

## 6. Il risveglio — chi bussa

Il sistema non sta in attesa di te. Tre cose lo svegliano, e sono le stesse tre che muovono
i task (`01-modello §3`) viste dal lato della macchina:

| chi bussa | come | cosa produce |
|---|---|---|
| **tu** | una frase, detta o scritta | un turno (§2) |
| **il mondo** | un servizio chiama `osserva` | una **notifica** nel cassetto, com'è arrivata. Nessun task (`01-modello §3`) |
| **il tempo** | una scadenza matura | una transizione, e basta |

**Il sistema viene svegliato, non interroga.** `osserva` non è una domanda ripetuta, è un
colpo alla porta: un servizio annuncia quando ha qualcosa, e in mezzo non c'è nessun ciclo
che chiede «ci sono novità?». Quando i servizi veri non sapranno fare altro che essere
interrogati, l'interrogazione sta **oltre il confine**, dentro il servizio, e di qua arriva
lo stesso colpo alla porta.

**Quello che il tempo fa, lo fa in silenzio.** Un `ORARIO` che diventa `T_ATTESA · di te`
quindici minuti prima dell'ora è una transizione, non un annuncio. Il campanello suona in
un punto solo — quando arriva qualcosa che il filtro giudica degno di chiederti una parola
(`08-voce §6`) — e non suona per il tempo che passa.

**Quello che ancora non c'è** è il terzo modo di svegliarsi: il sistema che **prende la
parola da sé** perché è il momento giusto, non perché è arrivato qualcosa. Il riepilogo
del mattino, la cosa rimandata tre volte, il «hai due ore libere prima della revisione».
Oggi non esiste, e non è una dimenticanza: è che prendere la parola senza che sia arrivato
niente è la sola cosa che questo sistema fa che **non è una conseguenza di un fatto**, e va
progettata con più cura del resto. Sta fra le domande aperte (`11-aperte`), ed è una delle
poche che non si scopre girando: va decisa.

---

## 7. Chi può toccare cosa

Sei invarianti. Sono sparsi negli altri documenti; qui stanno insieme perché è insieme che
si controllano, e perché **ognuno è fatto rispettare da una parola che manca**, non da un
controllo che si può dimenticare di scrivere.

| invariante | dove | come è fatto rispettare |
|---|---|---|
| solo il motore cambia un task | §2 | l'AI engine non ha lo stato: non lo vede e non lo scrive |
| niente esce senza `aspetta te` | `01-modello §0` | `consegna` è l'unico verbo irreversibile, e passa dal cancello |
| un task sta in un posto solo | `01-modello §2` | il luogo è un campo solo: cambiarlo è migrare |
| la memoria ha una penna sola | `07-memoria §9` | `segna` non è fra le mosse dei secondari |
| un secondario non delega | `02-parallelo §3` | `delega` non è fra le sue tre mosse |
| nessuna voce che non sia la tua muove un task | `07-memoria §2` | chi non ha la sessione può solo lasciare un messaggio, che è un task |

Se uno di questi cade, non è un bug di una funzione: è il sistema che ha cambiato natura.
Vale la pena accorgersene in questa pagina invece che in produzione.

---

## 8. Nel prototipo

Web, TypeScript, Vite. Prima tutto scritto, la voce dopo.

| pezzo | nel prototipo | dove si va a finire |
|---|---|---|
| **l'orecchio** | niente: si scrive | Whisper in locale |
| ~~il locale~~ | **non esiste più** (17 settembre 2026) | — |
| **l'AI engine** | **API Claude** dietro `/ai-engine`, con le mosse in mano | lo stesso, e i secondari |
| **l'AI engine, senza chiave** | **regole**, oltre lo stesso confine | — |
| **la memoria** | sospesa: si riparte a ogni sessione (`07-memoria §6`) | l'archivio di file |
| **la bocca** | Piper, in locale | Piper, o una voce più espressiva quando ne girerà una qui |
| **i servizi** | finti, cinque su sette (`06-confini §4`) | veri |

Tre scelte da spiegare:

**Il parser non è stato buttato: è passato oltre il confine.** Era il locale, e adesso è il
modo in cui l'**AI engine finto** fa le veci di quello vero — esattamente come i servizi
finti fanno le veci dei veri. Da dentro è indistinguibile: escono le stesse chiamate, e le
catene di `09-catene` si vedono girare senza chiave e senza rete. La differenza è tutta in
cosa fa: prima **decideva** quali frasi meritassero l'AI engine; adesso **simula** un AI
engine che non c'è.

**Senza chiave si ripiega, e si vede.** `.env` non c'è, la porta risponde 503, e da quel
momento pensa il finto — con una riga in console e il nome che cambia sulla pedana. Non si
finge mai di pensare.

**La voce che legge va messa subito** anche se si scrive soltanto. È l'unico modo per
scoprire presto se il copy è davvero dicibile — ed è il vincolo più facile da violare senza
accorgersene.
