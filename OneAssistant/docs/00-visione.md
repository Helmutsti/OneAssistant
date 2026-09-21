# 00 — La visione

Perché questa cosa esiste, e cosa vuol dire che è riuscita.

È il documento da cui discendono tutti gli altri. Quando una decisione più in basso
contraddice una riga di qui, è la decisione a essere sbagliata — oppure è questo
documento che va cambiato, dichiarandolo.

---

## 1. La cosa in una riga

> **Un collaboratore a cui parli, che ti tiene sotto gli occhi quello che hai in mano.**

Non un assistente dentro un sistema operativo: **è il sistema**, per la parte che conta —
lo strato fra te e la macchina. Copre lo schermo per intero, e le finestre non esistono
perché le ha sostituite qualcosa che capisce.

I due riferimenti sono dichiarati, e non sono un ornamento:

- **Jarvis** — *Iron Man*. Il modo di rivolgersi: gli parli come a qualcuno che lavora con
  te, non come a un comando. Fa cose vere nel mondo, non solo risposte. Sta sempre lì, e
  non va aperto.
- **Her** (2013) — il modo di parlare: linguaggio naturale davvero, non «linguaggio
  naturale» nel senso di una frase chiave con delle varianti. Capisce quello che intendi
  anche quando lo dici male, di traverso, a metà.

Quello che **non** si prende da nessuno dei due è la magia. Qui dentro non c'è niente che
indovini: ogni cosa che il sistema fa è una mossa di un elenco chiuso, e ogni stato che
mostra è uno stato che esiste nel modello (`01-modello`). La sensazione dev'essere quella
di Her; la meccanica dev'essere verificabile riga per riga.

---

## 2. La tesi — l'I/O

È la scommessa del progetto, e vale la pena scriverla come tale: se è sbagliata, non si
salva niente del resto.

> **Il modo in cui parliamo ai computer è fermo a un'astrazione di cinquant'anni fa: apri
> una cosa, ci stai dentro, la chiudi. Quell'astrazione non serve a noi, serve alla
> macchina — e adesso c'è qualcosa che può fare a meno di lei.**

Le finestre, le cartelle, le applicazioni, il puntatore: sono tutti modi di dire alla
macchina **dove** guardare, perché la macchina non sapeva capire **cosa** volevi. Un
modello che capisce cosa vuoi rende quel livello intermedio un costo, non un aiuto.

Ne seguono le tre inversioni su cui è costruito tutto il resto:

| prima | qui |
|---|---|
| apri un'applicazione, poi fai una cosa | **dici la cosa.** Con che servizio si faccia è affare del sistema (`06-confini`) |
| il computer aspetta comandi | **il computer tiene il filo.** Sa cosa hai in ballo, e te lo tiene davanti |
| una cosa per volta, quella nella finestra davanti | **più cose insieme**, ognuna che va avanti per conto suo (`02-parallelo`) |

**L'input principale è la voce.** Non perché scrivere sia peggio — voce e scrittura sono
di pari grado in ingresso (`05-interfaccia §1`) — ma perché la voce è l'unico ingresso che
non chiede di sapere dov'è una cosa prima di nominarla. È il canale che costringe il
sistema a essere onesto: **se una funzione esiste solo perché c'è un posto dove premere,
qui non esiste affatto.**

---

## 3. Cosa hai sotto gli occhi

La promessa visiva è una sola, e sta prima di ogni componente:

> **In ogni momento vedi cosa sta andando avanti, cosa dorme, e cosa viene dopo.**

Sono i tre insiemi che uno schermo normale non ti dà mai insieme: quello che è in
esecuzione sta dentro una finestra, quello che dorme è minimizzato da qualche parte, e
quello che viene dopo sta in un calendario che devi aprire.

| | dove sta | cos'è nel modello |
|---|---|---|
| **quello che va avanti adesso** | TABLE, al centro | i task in `T_ELABORAZIONE` e in `T_ATTESA` |
| **quello che hai in mano ma dorme** | TASKBAR, a destra | i `CHIP` |
| **quello che arriva e quello che viene dopo** | NOTIFICATIONBAR e TASKBAR | le **notifiche** — il mondo, non toccato — e gli `ORARIO` |

Non sono tre viste della stessa cosa: sono tre posti, e **una cosa sta in un posto solo**.
Quando cambia stato, migra. È la terza legge del design, ed è qui che si vede perché è una
legge e non un gusto: se una cosa potesse stare in due posti, la promessa di questa
sezione sarebbe falsa — guarderesti due elenchi per sapere una cosa sola.

---

## 4. Più cose insieme

È il punto in cui questo sistema si separa da un assistente vocale, e merita di stare
nella visione e non in un capitolo tecnico.

> **Tu parli di più cose. Lui le tiene separate, e le manda avanti in parallelo.**

Un assistente vocale normale ha una conversazione sola: gli chiedi una cosa, risponde, e
quello che c'era prima è finito. Qui ogni intenzione diventa **un task**, che ha un suo
stato, un suo avanzamento e una sua faccia a schermo — e continua a esistere mentre tu
parli di un'altra.

Tre conseguenze, che sono requisiti e non desideri:

- **si può cambiare argomento a metà**, e tornare indietro senza ripetere il contesto;
- **il lavoro va avanti mentre parli d'altro**, e quando è pronto non ti interrompe:
  aspetta in TASKBAR, ambra (`01-modello §4`);
- **niente si perde per aver guardato altrove.** Non esiste un posto dove una cosa possa
  finire senza che tu ce l'abbia mandata.

Come questo è fatto davvero — chi lavora in parallelo, cosa può fare e cosa no — sta in
`02-parallelo`.

---

## 5. Gli ambiti, in ordine

Il sistema non nasce generico. Nasce in un ambito, e gli altri arrivano quando il primo
regge.

| ambito | quando | cosa vuol dire |
|---|---|---|
| **produttività** | **adesso** | mail, calendario, promemoria, note, file, fogli. Le cose che hai da fare e i canali da cui arrivano |
| **creatività** | dopo | scrivere, comporre, cercare forme. Cambia cosa produce un task, non cos'è un task |
| **sviluppo software** | dopo | il codice come materiale di lavoro |

**Perché la produttività per prima**, ed è una scelta e non un ripiego: è l'unico ambito
in cui il valore si misura senza discutere. Una mail a cui hai risposto è una mail a cui
hai risposto; un riassunto è giusto o è sbagliato. Se il sistema funziona qui si vede, e
se non funziona si vede lo stesso — che è la cosa più importante delle due.

**Cosa cambia quando si apre un ambito nuovo**, ed è il test che tiene onesta la
progressione: **il modello non deve cambiare**. Un task creativo è ancora un'intenzione
con un esito atteso, ancora su due assi, ancora in un posto solo. Se per aggiungere un
ambito servisse uno stato nuovo o un'area nuova, vorrebbe dire che il modello era
l'ambito travestito — ed è il modo più rapido per accorgersene.

---

## 6. Cosa non è

Le negazioni servono più delle affermazioni, perché sono quelle che si perdono per strada.

- **Non è una chat.** Una chat è una colonna di testo in cui il passato scorre via. Qui lo
  scambio sparisce dopo trenta secondi (`05-interfaccia §2`), e quello che resta è **lo
  stato delle cose**, non la cronologia di quello che vi siete detti.
- **Non è un lanciatore di comandi.** Non c'è un elenco di cose che sa fare da imparare:
  ci sono cinque verbi di apertura e la lingua di tutti i giorni.
- **Non è un cruscotto.** Non mostra numeri su di te. Ogni cosa a schermo è una cosa a cui
  puoi dire una frase; se non c'è niente da dirle, non ci sta.
- **Non è un assistente dentro le applicazioni.** Non apre un client di posta e non lo
  pilota: i servizi stanno oltre un confine e hanno tre verbi (`06-confini`). Quello che
  vedi non è mai la faccia di un'altra applicazione.
- **Non è autonomo.** Niente attraversa il confine senza che tu l'abbia detto — salvo
  quello che hai autorizzato una volta per tutte, che per costruzione è solo ciò che
  nessun altro essere umano legge (`06-confini §6`).

---

## 7. Come si capisce che è riuscita

Quattro prove, in ordine di difficoltà. Non sono metriche: sono cose che o succedono o non
succedono.

1. **Non apri più niente per una cosa che sai dire.** La prima volta che ti accorgi di
   aver finito una giornata senza cercare una finestra.
2. **Ti fidi di lasciar andare una cosa.** Dici «dopo» e smetti di pensarci, perché sai che
   torna — e sai fra quanto, perché te l'ha detto (`09-catene §2`).
3. **Parli di tre cose e nessuna si perde.** Le tre vanno avanti, e quando ne richiami una
   il sistema sa di quale parli senza che tu la rispieghi.
4. **Ti accorgi quando sbaglia.** È la più difficile e la più importante. Un sistema che
   capisce quasi sempre, e che quando capisce male è indistinguibile da quando capisce
   bene, è peggio di uno che capisce meno. Da qui vengono due regole che altrove
   sembrerebbero pignoleria: lo schermo sta fermo mentre pensa (`03-architettura §4`), e
   nel dubbio chiede invece di indovinare.

---

## 8. Come si costruisce

Un pezzo alla volta, con sorgenti finte dove quelle vere non sono raggiungibili — e la
regola che rende la finzione lecita:

> **Una sorgente finta produce gli stessi eventi di quella vera. È il confine che cambia,
> mai il modello.**

Da qui l'ordine dei documenti che seguono: prima cos'è una cosa (`01-modello`), poi come se
ne tengono tante insieme (`02-parallelo`), poi com'è fatta la macchina
(`03-architettura`), come le si parla (`04-metalinguaggio`), cosa può toccare
(`05-interfaccia`), dove finisce il sistema e comincia il mondo (`06-confini`), cosa si
ricorda (`07-memoria`), con che cosa sente e parla (`08-voce`), e infine come si prova che
tutto questo gira davvero (`09-catene`).
