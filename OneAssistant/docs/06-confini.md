# 06 — I confini

Cosa entra nel sistema e cosa ne esce. I servizi **sono** il confine: dentro c'è il
modello, fuori c'è il mondo.

Finché il mondo non è raggiungibile, i servizi sono finti. Un servizio finto è finto
**oltre** il confine: da dentro dev'essere indistinguibile da quello vero. Il giorno in
cui la posta diventa vera, non cambia una riga del motore.

---

## 1. Il contratto

Ogni servizio, vero o finto, fa tre cose e non una di più.

| verbo | cosa fa | chi lo chiama |
|---|---|---|
| `leggi` | risponde a una domanda su ciò che possiede | il motore, quando serve |
| `osserva` | annuncia che è successo qualcosa | il servizio, quando succede |
| `consegna` | accetta **dove** (l'uscita) e **cosa** (l'esito del task) e lo fa uscire | il motore, dopo `aspetta te` |

Due regole che tengono in piedi tutto il resto:

- **Nessun servizio crea task.** `osserva` produce **proposte**, non task. Una proposta
  diventa un task solo se supera il filtro (§3). È l'unico punto in cui si decide se
  qualcosa merita la tua attenzione, ed è dentro il sistema, non dentro il servizio.
- **`consegna` è l'unico verbo irreversibile**, ed è l'unico che passa dal cancello
  `aspetta te` — vedi `01-modello §0`.

---

## 2. I sette servizi

| servizio | `leggi` | `osserva` — cosa propone | `consegna` |
|---|---|---|---|
| **posta** | messaggi, thread, allegati | è arrivata una mail | invia, rispondi, inoltra |
| **sms** | conversazioni | è arrivato un messaggio | invia |
| **notizie** | articoli per argomento | è uscita una notizia che ti riguarda | — |
| **calendario** | eventi, disponibilità | un invito, un evento imminente | crea, accetta, sposta |
| **contatti** | persone, recapiti | — | aggiungi, aggiorna |
| **promemoria** | cose da fare con una scadenza | una scadenza è arrivata | crea, chiudi |
| **note** | testi liberi, ricerca | — | crea, modifica |

Tre forme diverse, e vale la pena notarle:

- **notizie** non consegna niente: è l'unico servizio di sola lettura. Quello che ci fai
  esce da un'altra parte — una nota, una mail.
- **contatti** e **note** non osservano: nessuno ti scrive per dirti che un contatto è
  cambiato. Sono quasi solo destinazioni — ma i contatti hanno un quarto verbo che è
  solo loro, **cercare**: «mia madre», «la mamma» e «mamma» sono la stessa persona, e
  il sistema deve saperlo prima di aprire bocca (`09-catene §3`). Nel prototipo i
  contatti ci sono: `src/confini/contatti.ts`.
- **posta**, **sms** e **calendario** sono simmetrici: entri ed esci dalla stessa porta.
  Sono quelli che portano il carico del prodotto.

**Nel prototipo ce ne sono cinque** (17 settembre 2026): posta, note, contatti,
calendario e promemoria. Mancano sms e notizie. Il calendario è l'unico che produce un
evento con un'**ora**, e quindi l'unico per cui il filtro sceglie `ORARIO`: finché non
c'è stato, quel ramo della §3 non si era mai visto girare.

### Un servizio si può spegnere

Nessun servizio è per forza acceso. Nel profilo (`Archivio/<id>/settings.txt`) ognuno ha un
interruttore, e **spento vuol dire spento in tutti e tre i verbi**: non annuncia, non si
legge, non accetta consegne. Non è una modalità ridotta — è come se non ci fosse.

Ne segue una cosa che vale la pena dire: **un servizio spento non produce silenzio, ma
un blocco.** Se chiedi di mandare una mail e la posta è spenta, il task va `bloccato`
nella forma *non posso* (`01-modello §5`), con le sue uscite. Il sistema non finge di non
aver capito, e non aspetta in silenzio qualcosa che non arriverà mai.

Lo stesso interruttore c'è per le tre cartelle dell'archivio (`07-memoria §7`), e lì
spegnere significa un'altra cosa: il sistema **non ci scrive più**, ma quello che c'è
resta. Spegnere i Ricordi non è dimenticare — è smettere di prendere appunti.

### Il tipo di un task viene dal servizio

I sette `tipo` del modello (`01-modello §1`) sono le sette icone del design, non i sette
servizi: **posta** → posta, **sms** e messaggi → conversazione, **calendario** → persone
o sveglia, **promemoria** → sveglia, **note** e **notizie** → documento, il disco →
cartella. La mappa è fissa e non cresce.

---

## 3. Il filtro, e il cassetto

**Dal 18 settembre 2026 il filtro ha perso il potere che lo rendeva pericoloso.** Prima
decideva se una cosa arrivata diventasse un task; adesso non lo decide più, perché a
deciderlo sei tu (`01-modello §3`).

> **Tutto quello che arriva si posa nel cassetto, com'è arrivato. Il filtro decide se
> chiede, non se esiste.**

Il cassetto — la NOTIFICATIONBAR — è **una finestra sul mondo**. Ci sono le notifiche vere
dei servizi, in tempo reale, col loro mittente e il loro oggetto: non riassunte, non
riscritte, non riordinate dall'AI engine. Quello che il sistema ci fa sopra è una cosa
sola, ed è dire quali ti chiedono qualcosa.

### Le tre domande, che sono rimaste

1. **È per te?** Ti nomina, risponde a qualcosa che hai mandato, o riguarda un progetto in
   cui sei dentro.
2. **Puoi farci qualcosa?** Se non c'è niente che tu possa farne, è una cosa da sapere — e
   le cose da sapere non interrompono.
3. **È adesso?** Una scadenza lontana non chiede oggi.

Chi passa tutte e tre **chiede**: conta nel numerino e suona il campanello (`08-voce §6`).
Chi non passa **c'è lo stesso**: si posa, muto, e non chiede niente.

| | prima | adesso |
|---|---|---|
| passa il filtro | diventava un task a schermo | **chiede**: conta e suona |
| non passa | **spariva** | **c'è**, muto, nel cassetto |

### Perché il cambio, in una riga

Un filtro che promuove sbaglia in due modi e sono asimmetrici. **In eccesso** ti riempie
lo schermo, e lo vedi subito. **In difetto** butta via una cosa che ti serviva, e non lo
sai mai — è un errore invisibile per costruzione, e la fiducia non si rompe perché capita
spesso, si rompe perché non puoi escluderlo.

Togliendo al filtro la promozione, l'errore invisibile sparisce: il peggio che può fare
adesso è non suonare quando doveva, e quella cosa è lì, nel cassetto, dove la trovi.

**Dal filtro passa solo ciò che nessun task stava aspettando.** Una risposta a una tua
delega — un agente che riporta, un servizio che finisce un lavoro — non è una notifica:
rientra nel task che l'ha generata (`01-modello §3`). Il filtro giudica solo le cose **non
richieste**; quello che hai chiesto tu ha già un posto dove tornare.

### La cosa da sorvegliare

È il prezzo di questa scelta, e va scritto dove si vede: **un cassetto che si riempie
diventa una posta in arrivo**, cioè esattamente la cosa che questo prodotto esiste per
abolire. Prima il tetto era la pila che non doveva accumulare; adesso il cassetto accumula
per definizione — è il mondo, e il mondo non smette di arrivare.

Quindi il tetto si sposta e diventa un altro: **quante volte al giorno apri il cassetto.**
Se lo apri di continuo, non è il cassetto a essere sbagliato — è il campanello che non
suona quando dovrebbe, cioè il filtro che sbaglia in difetto dove ancora può. E se invece
non lo apri mai e non ti perdi niente, il filtro sta lavorando bene.

> Questa sezione resta la più provvisoria del documento. Le tre domande sono la forma; i
> pesi e le soglie vanno visti su dati finti prima di essere scritti sul serio — ma adesso
> sbagliarli costa molto meno.

---

## 4. Essere finti

Un servizio finto deve mentire bene, e mentire bene significa tre cose.

**Vive nel tempo.** Una posta finta che restituisce sempre le stesse cinque mail non
serve a niente: l'unica cosa che vogliamo davvero provare è il filtro, e il filtro si
prova solo se le cose arrivano quando non te le aspetti. Ogni servizio ha uno scenario:
una sequenza di eventi con un orario, che si può far scorrere più veloce del reale.

**Fallisce.** `01-modello §5` prevede `bloccato`, e un servizio che riesce sempre non lo
fa mai scattare. Ogni servizio finto sa fallire su richiesta: non raggiungibile,
ambiguo, rifiutato.

**Ricorda le consegne.** Una mail inviata dev'essere lì la volta dopo. Altrimenti il
confine non è un confine, è uno specchio.

Lo scenario di riferimento — persone, progetti, messaggi, calendario — è quello del
prompt di design, in `uploads/prompt_design_ai_native_desktop.md` nel progetto di
Claude Design.

---

## 5. I servizi non sono agenti

Un servizio ha tre verbi e non pensa. Ti annuncia che è arrivata una mail, ti dà quello
che ha, accetta quello che esce — e in mezzo non c'è nessuno che decide niente. È la
ragione per cui il contratto può essere così stretto.

**Le notifiche arrivano in tempo reale: il sistema viene svegliato, non interroga.**
`osserva` non è una domanda ripetuta, è un colpo alla porta. Non aggiunge un attore alle
transizioni — conferma quello che `01-modello §3` chiama *il mondo*.

### Gli agenti secondari non stanno qui

Non sono un ottavo servizio: **non stanno sul confine**. Non sono un posto, sono un modo
di lavorare — l'AI engine che si moltiplica dentro un task che esiste già. Vivono in
`02-parallelo §3`, insieme all'AI engine, e da lì non escono.

### Gli agenti di terzi invece sì

Un agente che non è tuo ha scopi suoi e memoria sua. Nel momento in cui gli passi una
richiesta, **qualcosa è uscito** — e allora non serve un genere nuovo di confine, perché
entra nel contratto di sempre:

| verbo | per un agente di terzi |
|---|---|
| `consegna` | gli passi la richiesta. **Passa da `aspetta te`, ogni volta.** |
| `osserva` | la sua risposta rientra come una proposta, e ripassa dal filtro (§3) |
| `leggi` | quello che ti ha già detto |

Il suo `tipo` è **conversazione**: è l'unica cosa fuori dal sistema che risponde.

> **Il confine non è «è un agente?». È «è tuo?».**

Un secondario tuo è lavoro interno: nessun cancello, e SYSTEMBAR lo dichiara solo se gira fuori
dalla macchina. Un agente di terzi è una consegna come una mail — cancello, novanta
secondi per dire «no, aspetta», nessuna eccezione. È l'unica consegna che ti risponde, e
la risposta non entra dalla porta di servizio: rifà la fila dal filtro come tutti.

### E il disco

È il servizio su cui posa l'archivio (`07-memoria §7`, §6). Legge e scrive, ma **non
osserva**: nessuno ti bussa perché un file è cambiato. E quello che il sistema ci scrive
non attraversa nessun confine — è la sua stessa testa, e per questo non passa dal
cancello.

**Dal 17 settembre 2026 il disco è vero.** Prima dietro c'era una mappa in memoria, e la
conseguenza non era «il disco è finto»: era che **la testa dell'agente si svuotava a ogni
ricarica**. Tutto questo documento e tutto `07-memoria` funzionavano — e non
sopravvivevano a un F5. Non era finta la memoria: era finto il ripiano su cui posava.

Adesso dietro c'è una porticina di Node, `/disco`, gemella di quella dell'AI engine, e i
file sono file: si aprono, si leggono, si correggono a mano. Tre cose che la forma di
quella porta dice, e non sono dettagli di cablaggio:

- **legge tutto in una volta, scrive un file per volta.** `Archivio` legge e scrive in
  modo sincrono, e lo fa già dentro il proprio costruttore; una porta sta dietro la rete.
  Quindi si scarica tutto all'avvio, la mappa resta come copia di lavoro, e ogni
  scrittura va a segno subito in memoria e parte in sottofondo di là;
- **non sa cancellare.** Non c'è il verbo, e non ci deve essere: l'archivio non cancella
  niente — una riga smentita resta (`07-memoria §10`) — e una porta che non sa cancellare
  non può cancellare la cosa sbagliata;
- **non sta nel `publicDir`.** Quella è la radice del sito: un archivio lì sarebbe
  scaricabile da chiunque apra la pagina, ed è lo stesso errore della chiave. Sta in
  `Archivio/<id>/memory/`, che il sito non serve e che `server.fs.deny` nega anche a
  `/@fs/…` — e quel diniego va scritto `**/Archivio/**`, perché un pattern senza `**/`
  Vite lo confronta col nome del file e non col percorso (provato: rispondeva 200).

**E dal 17 settembre 2026 i dati non sono più del repo.** Tutto quello che è di una
persona — il profilo, la sua faccia, la sua memoria, le impostazioni dei suoi servizi —
sta sotto `Archivio/<id>/`, e ci si arriva da una porta sola: `/archivio`. Oggi quella
cartella è ancora dentro il repo; domani no, e quel giorno cambia `RADICE` nella porta e
nient'altro. Com'è fatta sta in `Archivio/LEGGIMI.md`.

Il giorno che si passa a Electron cambia un file solo, `src/confini/disco.ts`: `fetch`
diventa `ipcRenderer` e i quattro verbi restano quelli. È il confine che cambia, mai il
modello.

---

## 6. Le autorizzazioni

`01-modello §3` dice che una consegna non avviene mai senza passare da `aspetta te`,
*salvo le azioni che hai autorizzato una volta per tutte*. Ecco quali, e come.

Il test non è il servizio — è chi c'è dall'altra parte:

> **Si autorizza una volta per tutte solo ciò che nessun altro vede.**

| | esempio | autorizzabile |
|---|---|---|
| calendario, evento tuo | «segna che venerdì sono fuori» | sì |
| contatti | «aggiungi Paolo, 347…» | sì |
| promemoria, note, disco | «segnati questa cosa» | sì |
| posta | «rispondi ad Andrea che venerdì va bene» | **mai** |
| sms | «scrivi a Marco che arrivo tardi» | **mai** |
| calendario, invito con destinatari | «manda l'invito a Marco e Andrea» | **mai** |
| agente di terzi | «fallo analizzare a lui» | **mai** |

Le prime due righe e le ultime quattro si somigliano a due a due, e il calendario sta da
entrambe le parti: non è il servizio a dividerle, è se qualcuno riceve qualcosa. Una cosa
che un altro essere umano legge **non è autorizzabile, nemmeno se lo chiedi**.

**Come si concede.** Non c'è niente da configurare. Alla terza volta che confermi la
stessa cosa, `osservato.md` ha le prove e il sistema propone — *«Le tue note le salvo da
solo, d'ora in poi?»* — e con un sì la riga sale in `preferenze.md`. È la promozione di
`07-memoria §5`, quarta volta che quella macchina ricompare da sé.

**Come si revoca.** «chiedimi sempre», e la riga scende. «Cosa fai da solo?» te lo
racconta a parole, mai come elenco di impostazioni (`07-memoria §9`).

**Cosa non si tocca.** Autorizzare toglie la domanda, **non l'annullamento**: la nota
parte da sola, ma il chip diventa `consegnato` e i novanta secondi per dire «no, aspetta»
ci sono lo stesso. Si toglie il cancello, non la retromarcia.

---

## 7. Domande aperte

1. **I pesi del filtro.** Vedi §3.
2. **Quanto ritardo simulare.** Le notifiche vere arrivano in tempo reale, ma non
   istantanee: il ritardo va imitato nei finti, perché cambia la sensazione.
3. **Quali agenti di terzi** si possono usare, e con che contratto si dichiara quello che
   esce verso di loro. Che passino dal cancello ogni volta è deciso (§6); cosa esattamente
   gli si manda, no.
