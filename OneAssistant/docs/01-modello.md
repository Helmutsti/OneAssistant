# 01 — Il modello

Cos'è un task, quali stati attraversa, chi lo fa passare da uno all'altro.
È la macchina da implementare: tutto il resto del sistema ne è una vista o una sorgente.

Il design di ogni stato sta in `design/`, livello L2. Qui non si descrive un pixel.

---

## 0. La forma

Una sorgente propone, un intento entra, tu lo lavori a voce o scrivendo, e poi o si
chiude dentro o esce da una destinazione.

```
  sorgenti          INTENTO         lavorazione          ┌─ concluso     niente esce
  mail        ──▶   entra      ──▶  voce o scrittura ──▶ │
  messaggi                                               └─ consegnato   attraversa il confine
  notizie                                                   mail · disco · sms
```

Tutto il resto del modello è il dettaglio di questa riga.

Le due uscite non sono equivalenti: **solo il consegnato attraversa un confine**, ed è
l'unico che può fare danno. È per questo che `aspetta te` esiste — è il cancello, non
una cortesia.

---

## 1. L'unità

Un **task** è un'intenzione con un esito atteso: qualcosa che deve succedere e che
a un certo punto smette di dover succedere.

Non è un'app aperta, non è un file, non è un messaggio. Una mail ricevuta non è un
task; *rispondere a quella mail* lo è.

### Origine

Tre, e l'origine non cambia mai per tutta la vita del task.

| origine | chi lo crea | dove nasce |
|---|---|---|
| `tua` | hai detto «senti», «trova», «scrivi» o «dimmi» | TABLE, come `MAIN` |
| `esterna` | **hai detto «me ne occupo»** su qualcosa che era arrivato | TABLE, come `MAIN` |
| `derivata` | il sistema l'ha aperto lavorando: un riassunto, un fork (§1) | TABLE, accanto a quello che l'ha generato |

Tutti e tre nascono **sulla board**, e dal 18 settembre 2026 è così anche per l'origine
esterna: quello che arriva non è un task finché non lo chiedi (§3). Quello che cambia fra
le tre non è dove nascono — è **chi ha cominciato**, e quello non cambia mai.

L'origine **non è uno stato**: dice solo chi ha iniziato (legge 02). Un task esterno
che porti al centro diventa `MAIN` a tutti gli effetti, ma resta di origine esterna.

### Il fork — un task che ne genera un altro

Mentre lavora, il sistema può accorgersi che serve **uno scopo intermedio o diverso** da
quello per cui il task era nato. Allora fa un **fork**: nasce un task suo, `derivata`,
che entra nel ciclo da `T_NUOVO` (§2).

Un fork è un task vero e non un modo di dire: ha un nome con cui lo richiami, i suoi
stati, una sua faccia a schermo. È l'unico modo che il sistema ha di dirti «per fare
quello che hai chiesto devo prima fare quest'altra cosa» senza nasconderlo dentro
un'attesa che non si spiega.

> **Il fork si vede. La delega no.**

È la distinzione che conta, perché sono due cose che si somigliano e non lo sono:

| | cos'è | si vede | chi lo decide |
|---|---|---|---|
| **fork** | uno scopo nuovo, che merita un task suo | **sì**: è un task, e si richiama per nome | l'AI engine, mentre lavora |
| **delega** | lo stesso scopo, fatto da più mani insieme | **no**: la faccia è la frazione che sale sul task padre (`02-parallelo §3`) | l'AI engine, mentre lavora |

Il test è una domanda sola: **quella cosa la vorresti richiamare per nome?** Se sì è un
fork, se no è una delega. Cercare tre indirizzi per mandare tre mail è una delega — non
richiami «la ricerca del secondo indirizzo». Scoprire che prima di rispondere ad Andrea
bisogna chiedere una cosa a Marco è un fork: «com'è andata con Marco?» è una frase che
dirai.

Tre vincoli, e sono quelli che impediscono al fork di diventare un albero:

- **il padre non aspetta il figlio per forza.** Un fork è un task a sé: può concludersi
  dopo, o prima, o mai. Se il padre non può proseguire senza, allora il padre è in
  `T_ATTESA` e lo dice;
- **un fork non forka a sua volta senza che si veda.** Può farlo — è un task come gli
  altri — ma ogni fork è una bolla in più a schermo, e la scrivania è il tetto naturale:
  quando non ci stanno più, si esauriscono in chip (§4) come tutto il resto;
- **il fork non eredita niente.** Nasce con il suo `ingresso`, che è lo scopo per cui è
  stato aperto — non con quello del padre. Se avesse lo stesso ingresso, sarebbe lo
  stesso task due volte.

### Il record

```
id
origine        tua | esterna | derivata
tipo           posta | cartella | documento | persone | conversazione | immagine | sveglia
nome           come lo diresti, due parole al massimo — è la parola con cui lo richiami
testo          la riga che si legge. Una riga, non un contenuto
ingresso       quello con cui nasce, e non cambia mai — vedi sotto
esito          quello che produce, se produce qualcosa — vedi sotto
luogo          asse 1, vedi §2
stato          asse 2, vedi §2 — e la sua forma, quando ne ha
dato           la singola cosa mostrata nel chip: una frazione, un'ora, una parola
frasi          fino a 4, ordinate per probabilità; la prima è la più probabile
ora            solo se programmato o rimandato
timer          le scadenze attive, vedi §4
fonte          da dove viene — solo per origine esterna o derivata
collegamenti   persone, progetti, documenti a cui il task si riferisce
flusso         il nome che gli hai dato tu, se gliene hai dato uno — vedi §6
```

I sette `tipo` sono chiusi: sono le sette icone del sistema (legge 06). Non se ne
aggiungono.

### I contenuti — due, non quattro

Un task porta del testo, e non è tutto lo stesso testo. Ce n'è di due specie sole, e
tenerle due è ciò che impedisce a una bolla di diventare un documento.

| | | |
|---|---|---|
| `ingresso` | quello con cui nasce | **non cambia mai** |
| `esito` | quello che produce | vuoto finché non c'è, poi cresce |

**L'ingresso è la ragione per cui il task esiste.** Per un task esterno è quello che è
arrivato — il corpo della mail, per intero. Per un task tuo è quello che hai dettato.
Nasce con lui e non si tocca più: se cambiasse, non sarebbe più lo stesso task.

**L'esito è quello su cui devi decidere.** La bozza della risposta, il riassunto scritto,
i file riordinati. Non tutti i task ne producono uno: «dimmi che ore sono» non lascia
niente dietro di sé, e va benissimo così.

Nessuno dei due è la riga che si legge. Quella è `testo`, e resta una riga: un contenuto
è la cosa intera, `testo` è come la diresti in un fiato.

### Produrre un esito è diventare `aspetta te`

Non sono due fatti che capitano insieme: sono **lo stesso fatto**, guardato da due parti.

L'asse 2 dice che ambra significa «la palla è tua, e c'è qualcosa di pronto» (§2). Un
task che ha prodotto un esito ha, per definizione, qualcosa di pronto — e finché non gli
dai una parola, la palla è tua. Non serve una regola nuova: c'era già, e i due flussi che
esistono, il riassunto e la composizione (`09-catene §2` e `§3`), ci cascano dentro senza
che nessuno li spinga. Che la stessa forma torni da sé è il segno che il modello regge.

Ne segue il contrario, ed è un controllo utile: **un task `aspetta te` senza esito e senza
una frase da offrirti è un errore.** Sta chiedendo una parola a proposito di niente.

### Dove si vedono

Una regola sola: **dentro si vede una cosa sola, e vince l'esito.** Quando un task ha
prodotto qualcosa, è quello che vuoi guardare — l'ingresso è *perché* esiste, l'esito è
ciò su cui devi decidere. Impilarli fa della bolla un documento, e i documenti hanno le
finestre.

| dove | cosa si vede |
|---|---|
| `CHIP` | solo `dato`: una frazione, un'ora. Un chip non ha contenuti, ha un segno |
| `MAIN` o `APERTO`, chiusa | solo `testo` |
| `MAIN` **aperta dentro** (§7) | l'esito se c'è; l'ingresso se non c'è ancora |
| `ORARIO` | niente. È una promessa, non un testo |
| `MEMORIA` | niente a schermo: si richiama a voce, e allora si racconta |

E il vincolo che li tiene tutti e due: **restano dicibili** (`05-interfaccia §1`). Un contenuto
che si può solo guardare non è ancora roba di questo sistema.

### L'uscita dice dove, non cosa

`uscita` porta **il dove** e **il a chi**, e nient'altro. Il *cosa* è l'esito del task, e
l'uscita si limita a portarlo fuori: è per questo che `consegna` riceve due cose e non
una (`06-confini §1`).

Un task che consegna senza aver prodotto niente manda la sua riga — è il caso della
promozione ai contatti, dove quello che esce è un nome e non un testo.

---

## 2. I due assi

Lo stato di un task non è uno: sono due, indipendenti fra loro.

- **Asse 1 — il luogo.** Dove il task è visibile. Esclusivo: un task sta in un posto
  solo (legge 03).
- **Asse 2 — lo stato.** A che punto è del suo ciclo. È il colore a comunicarlo
  (legge 04).

La posizione non dice mai lo stato, e il colore non dice mai il luogo.
È per questo che un chip non cambia mai forma né vetro: cambia solo il colore
dell'icona e della targa.

> **Perché due e non uno.** Un task minimizzato che sta lavorando è due fatti insieme:
> dove l'hai messo, e cosa sta facendo. Con un asse solo uno dei due andrebbe perso, e
> sarebbe sempre lo stesso — quello che non si vede. Chi lavora è il sistema; chi decide
> dove stanno le cose sei tu, e le due cose non si spostano insieme.

### Asse 1 — luogo

| valore | area | |
|---|---|---|
| `MAIN` | TABLE | la bolla a cui INPUT sta parlando. **Una sola per volta.** Solo lei mostra le sue frasi (§3). |
| `APERTO` | TABLE | una bolla sulla scrivania che non ha il fuoco |
| `CHIP` | TASKBAR | minimizzato, alto a destra. Oltre quattro si raggruppa |
| `ORARIO` | TASKBAR | rimandato: un chip con un'ora invece di un dato. Dorme, e torna da sé |
| `MEMORIA` | — | non a schermo. Si richiama solo a voce |

> **Cinque, e fino al 18 settembre 2026 erano sei.** Il sesto era `CARTA`: un task che
> stava nella NOTIFICATIONBAR, arrivato e non ancora preso in mano. È uscito insieme alla
> decisione del §3 — **quello che arriva non diventa un task da solo** — e con lui è uscita
> l'idea che nella barra delle notifiche potesse esserci qualcosa di nostro.
>
> Nella stessa mossa `ORARIO` ha cambiato casa: dal cassetto alla TASKBAR. Se il cassetto è
> la finestra sul mondo, una cosa che **tu** hai rimandato non ci sta dentro — è tua, ce
> l'hai in mano, e sta dove stanno le cose che hai in mano. Che sia un chip con un'ora
> invece di una frazione è tutto quello che serve per distinguerla.

Ne segue una riga che vale la pena tenere, perché è la più corta che descriva lo schermo:

> **TABLE è quello che stai facendo, TASKBAR è quello che hai in mano, NOTIFICATIONBAR è
> il mondo. Le prime due sono tue e sono fatte di task; la terza non è tua e non ne
> contiene nessuno.**

### Asse 2 — lo stato, che è un ciclo

Quattro, e non sono un elenco: sono un giro. Un task nasce, si lavora, e a ogni passo si
chiede una cosa sola — **posso concludere?** Se sì finisce, se no si ferma e chiede. E
quando la risposta arriva, il contesto si aggiorna e il giro ricomincia.

```
                    ┌──────── il contesto si aggiorna, e si riprende ────────┐
                    │                                                        │
   T_NUOVO ──▶ T_ELABORAZIONE ──── posso concludere? ── sì ──▶ T_CONCLUSIONE │
      ▲             │                     │                                  │
      │             │                     no                                 │
      │             │                     ▼                                  │
      │             │                 T_ATTESA ──────────────────────────────┘
      │             │              di te · di un'ora · bloccato
      │             │
      └─────────────┘  un fork: uno scopo intermedio o diverso, che è un task suo (§6)
```

Il ciclo è la cosa che questo modello aveva sempre fatto senza dirlo. Scriverlo cambia
due cose: si vede che **`T_ATTESA` non è una fine** — è il punto in cui il sistema ti
chiede qualcosa e riparte da dov'era — e si vede dove sta il fork, che prima non aveva un
posto.

| stato | vuol dire | quando ci entra |
|---|---|---|
| `T_NUOVO` | la richiesta esiste con il suo contesto, e nessuno ci ha ancora lavorato | l'hai detta, o è arrivata da fuori e ha passato il filtro |
| `T_ELABORAZIONE` | ci sta lavorando il sistema: capisce, cerca, raccoglie quello che gli serve | comincia il lavoro |
| `T_ATTESA` | non sta lavorando, e non può ricominciare da solo | non può concludere |
| `T_CONCLUSIONE` | ha smesso di dover succedere | ha concluso |

### Le forme, che sono quello che il colore mostra

Due dei quattro stati hanno **forme**, e le forme non sono una sottigliezza: sono la
ragione per cui il colore continua a dire una cosa sola (legge 04). Un task che aspetta
te e uno che si è bloccato sono tutti e due fermi, ma non ti chiedono la stessa cosa — e
quella differenza si vede, quindi è stato.

| stato · forma | colore | significa |
|---|---|---|
| `T_NUOVO` | **nessuno** | esiste e non chiede ancora niente. Quello che lo fa notare è dove sta, non di che colore è |
| `T_ELABORAZIONE` | salvia `#4E6B54` | la palla è al sistema |
| `T_ATTESA` · **di te** | ambra `#B3762A` | la palla è tua: c'è qualcosa di pronto, o una domanda da chiudere |
| `T_ATTESA` · **di un'ora** | nessuno | l'hai rimandato. Torna da sé, e non chiede niente adesso |
| `T_ATTESA` · **bloccato** | rosso terra `#8A2E22` | si è fermato e non può proseguire da solo |
| `T_CONCLUSIONE` · **dentro** | salvia `#4E6B54` | finito, e niente è uscito |
| `T_CONCLUSIONE` · **fuori** | salvia `#4E6B54` | qualcosa ha attraversato il confine, e la finestra di annullamento è ancora aperta |

Le due forme di `T_CONCLUSIONE` **si disegnano identiche**: stesso salvia, stesso chip. A
vedersi sono la stessa cosa, e va bene così — la differenza vive solo qui, perché solo
quella *fuori* ha fatto qualcosa di irreversibile e solo lei si può annullare.

> **Quattro stati, sette caselle.** Le quattro sono la forma del ciclo, e si usano per
> ragionare. Le sette sono quello che il colore mostra, e si usano per disegnare. Non
> sono due modelli: sono lo stesso, guardato da chi decide e da chi guarda.

### Combinazioni legali

|  | `T_NUOVO` | `T_ELABORAZIONE` | `T_ATTESA` | `T_CONCLUSIONE` |
|---|---|---|---|---|
| `MAIN` | sì | sì | sì | sì |
| `APERTO` | sì | sì | sì | sì |
| `CHIP` | sì | sì | sì | sì |
| `ORARIO` | — | — | **sì** | — |
| `MEMORIA` | — | — | — | **sì** |

Le caselle vuote sono impossibili, non improbabili: se il codice ne produce una, è un
errore.

Le ultime due righe dicono una cosa sola, ed è la stessa: **i due posti dove un task non
sta lavorando hanno uno stato ciascuno.** Il rimandato aspetta, la memoria accoglie solo
ciò che è finito. Non l'ha imposto nessuno — è venuto fuori mettendo il ciclo al posto dei
sei avanzamenti, ed è il segno che i quattro stati sono quelli giusti.

- **`ORARIO` è sempre `T_ATTESA`**, e passa dalla forma *di un'ora* alla forma *di te* nei
  quindici minuti prima dell'ora. È l'unico momento in cui un chip che dormiva si fa
  notare, e si fa notare col colore e non cambiando posto.
- **`MEMORIA` accoglie solo `T_CONCLUSIONE`** — vedi la domanda aperta in §9.
- **`T_ATTESA` non è mai vuota.** Un task che aspetta te senza avere né un esito né una
  frase da offrirti è un errore: sta chiedendo una parola a proposito di niente.
- **Un task nasce sempre sulla board.** `T_NUOVO` vive su TABLE o in TASKBAR, e da nessuna
  altra parte: non esiste un posto dove una cosa possa essere già un task **prima** che tu
  l'abbia chiesta (§3).

### I nomi di prima

I sei avanzamenti di ieri non sono stati buttati: sono diventati le forme. La tabella
serve a chi rilegge il codice, che li porta ancora tutti e sei.

| prima | adesso |
|---|---|
| `in corso` | `T_ELABORAZIONE` |
| `aspetta te` | `T_ATTESA` · di te |
| `programmato` | `T_ATTESA` · di un'ora |
| `bloccato` | `T_ATTESA` · bloccato |
| `concluso` | `T_CONCLUSIONE` · dentro |
| `consegnato` | `T_CONCLUSIONE` · fuori |
| — | `T_NUOVO`, che è l'unico davvero nuovo |

---

## 3. Chi fa scattare le transizioni

Tre attori, e solo tre.

### La tua voce

| frase | da | a |
|---|---|---|
| «senti…» «trova…» «scrivi…» «dimmi…» | — | nuovo task, `MAIN` |
| **«me ne occupo»** | una **notifica** nel cassetto | **nuovo task, `MAIN`** — e la notifica resta dov'è (§3, il mondo) |
| «mettila con …» | `MAIN` o `APERTO` | `CHIP`, dentro il flusso che nomini — vedi §6 |
| «dopo» | `MAIN` | `ORARIO`, in TASKBAR |
| «torna al …» (nome del chip) | `CHIP` | `MAIN` |
| una frase nomina un task a schermo | `APERTO` | `MAIN`; il `MAIN` uscente torna `APERTO` |
| «no, aspetta» | `T_CONCLUSIONE · fuori`, entro 90 s | annulla la consegna, torna allo stato precedente |
| «aspetta» | qualunque `T_ELABORAZIONE` | sospende l'azione — sempre udibile, anche a bolla chiusa |

**«Me ne occupo» è la frase più importante della tabella**, perché è l'unico ponte fra il
mondo e la board. Non ha una forma sola — «me ne occupo», «prendila», «rispondi ad
Andrea», o semplicemente nominare la cosa che è arrivata: quello che conta è che la
domanda «vuoi lavorarci?» abbia avuto risposta **da te**, e non da un punteggio.

Tre frasi aprono una vista senza cambiare nessuno stato: «cosa hai in mano?» (TASKBAR),
«cosa mi aspetta?» (il cassetto della NOTIFICATIONBAR), «aprila» (dentro il task a fuoco —
vedi §7).

I cinque verbi aprono ciascuno un'intenzione diversa: «senti» comanda, «trova» cerca
(e apre già in raccolta), «scrivi» detta, «dimmi» domanda, «aspetta» interrompe — ed è
l'unico sempre udibile, anche a bolla chiusa. Il verbo è la prima parola della frase, non
un risveglio separato. Dentro una conversazione aperta — **30 s dall'ultimo scambio** —
non serve ripeterlo.

### Il richiamo

Non serve un verbo dedicato per cambiare il fuoco: **basta che una frase nomini un task
già a schermo**. «torna al riordino» e «per il riordino usa l'altra cartella» fanno la
stessa cosa sull'asse 1 — il riordino diventa `MAIN`.

Chi decide il richiamo è l'AI engine, che è l'unico che legge una frase (`03-architettura §3`).
Fino al 16 settembre 2026 lo decideva il locale, in millisecondi e senza rete; adesso
costa un giro, e la ragione per cui si è scelto così sta in quel documento. Il nome del task è
nel record (`§1`), i task a schermo sono lo stato, e il riconoscimento è un confronto,
non un ragionamento. Succede **prima** che la frase parta verso l'AI engine, se ci deve
andare: il fuoco si sposta subito, la risposta arriva dopo.

Tre conseguenze, tutte sull'asse 1 e nessuna sull'asse 2 — **un richiamo non cambia mai
l'avanzamento di niente**:

- il task nominato diventa `MAIN`, e il `MAIN` uscente torna `APERTO`;
- gli altri task restano dove sono, a schermo e interi: **niente si chiude e niente
  migra**. Che si attenuino per far risaltare il fuoco è design, e sta di là;
- **le frasi compaiono sotto il task richiamato**, non altrove. Sono i suggerimenti di
  risposta a quel task: fino a quattro, ordinate per probabilità (`§1`). Gli altri task a
  schermo non mostrano frasi, e non per questo si esauriscono — l'esaurimento è non
  *averne*, non non mostrarle (`§4`).

Le frasi stanno sempre sotto **il task a cui INPUT sta parlando**: la `MAIN`. Se non c'è
una `MAIN`, non ci sono frasi — e va bene: vuol dire che tocca a te cominciare. Le
notifiche nel cassetto non ne hanno, perché non sono task: quello che si può dire a una
notifica è una cosa sola, e cioè prenderla (§3).

Se la frase nomina un `CHIP`, vale la riga «torna al …»: il chip risale e diventa `MAIN`.
Se nomina un task in `MEMORIA`, il task rientra come `MAIN`. Se ne nomina due, **il fuoco
non si sposta** e il sistema chiede quale: non è un blocco — un blocco è avanzamento, e
un richiamo l'avanzamento non lo tocca.

### Il tempo

| scadenza | da | a |
|---|---|---|
| 15 min prima dell'ora | `ORARIO` · di un'ora | `ORARIO` · di te |
| 90 s | `T_CONCLUSIONE` | `MEMORIA` |

Il tempo non tocca più il cassetto, e non è una semplificazione: **una notifica non
scade.** Scadeva quando era un task — una carta che non guardavi per un'ora scivolava via
— e adesso che è il mondo e basta, il mondo non si sposta perché tu non l'hai guardato.
Quello che il cassetto fa quando si riempie è un problema del cassetto (`06-confini §3`),
non una transizione del modello.

### Il mondo — sorgenti e destinazioni

**Il mondo non crea task. Mai.** È la regola che governa tutta questa sezione, ed è stata
decisa il 18 settembre 2026:

> **Quello che arriva entra com'è arrivato, in tempo reale, e non diventa lavoro finché non
> lo chiedi tu.**

Una mail che arriva si posa nella NOTIFICATIONBAR come **notifica**: mittente e oggetto
veri, non riscritti, non riassunti, non giudicati. È una finestra sul mondo, e una finestra
non decide cosa guardi. Diventa un task quando dici «me ne occupo», e allora il task nasce
sulla board come tutti gli altri.

| evento | effetto |
|---|---|
| **arriva qualcosa da un servizio** | **una notifica nel cassetto. Nessun task nasce** |
| un'azione autonoma si completa senza produrre niente fuori | `T_ELABORAZIONE` → `T_CONCLUSIONE` · dentro |
| una consegna va a buon fine | `T_ATTESA` → `T_CONCLUSIONE` · fuori |
| un'azione produce qualcosa da approvare | `T_ELABORAZIONE` → `T_ATTESA` · di te |
| un'azione fallisce, o trova un'ambiguità che non sa sciogliere | → `T_ATTESA` · bloccato |
| torna la risposta a una delega | rientra nel task che l'ha generata, `T_ATTESA` · di te |

Le sorgenti finte e quelle vere entrano esattamente dalla prima riga: producono notifiche e
nient'altro. È il confine, e sta tutto in un punto solo.

**Cosa ci guadagna il sistema a non promuovere da sé**, ed è la ragione della decisione: un
filtro che promuove sbaglia in due modi, e sono asimmetrici. In eccesso ti riempie lo
schermo, e lo vedi. In difetto butta via una cosa che ti serviva, e **non lo sai mai** —
è un errore invisibile per costruzione, e non puoi escluderlo nemmeno quando non capita.
Togliendogli la promozione, l'errore invisibile sparisce: il filtro decide cosa **suona** e
cosa **chiede**, non cosa **esiste**.

**Quello che ci perde**, ed è giusto scriverlo: un gesto in più su ogni cosa, e il rischio
che il cassetto diventi una posta in arrivo come tutte le altre. Il primo è il prezzo. Il
secondo è la cosa da sorvegliare, ed è scritta in `06-confini §3`.

Le **destinazioni** sono gli stessi canali percorsi al contrario — una mail entra ed esce
dalla posta.

| destinazione | esempio |
|---|---|
| posta | la risposta ad Andrea parte |
| disco | i documenti riordinati restano nella cartella |
| messaggio | l'sms a Marco |
| calendario | l'invito accettato |

**Una risposta a una delega non nasce mai due volte.** Quello che hai chiesto tu ha già un
posto dove tornare: il task che l'ha generata, che passa a `aspetta te` dove sta — e se
nel frattempo era caduto in `MEMORIA`, **risorge** come `CHIP aspetta te`, con il nome di
prima. Dal filtro passa solo ciò che nessun task stava aspettando (`06-confini §3`).

**Una consegna non avviene mai senza passare da `aspetta te`** — salvo le azioni che hai
autorizzato una volta per tutte: solo ciò che nessun altro vede, mai una cosa che un altro
essere umano legge. Quali siano e come si concedono, in `06-confini §6`.

**Il sistema non ti chiama di sera.** Fuori dall'orario di lavoro quello che arriva si
posa nel cassetto in silenzio: niente campanello, qualunque punteggio abbia. Non è che non
arrivi — arriva, perché il cassetto è il mondo e il mondo non chiude alle 19. È che non
chiede. Regola provvisoria, si preciserà in `06-confini`.

---

## 4. L'esaurimento — quando una bolla diventa chip

Una bolla si esaurisce **quando non ha più frasi da offrirti adesso**.

Non a tempo, non perché ne apri un'altra. Le frasi sono i comandi (legge 01): un task
che non ha più niente da farsi dire non ha più niente da mostrare, e si contrae in chip.

Succede in due casi:

- il task è in `T_CONCLUSIONE` — e il chip vive i suoi 90 secondi, poi cade in memoria;
- il task è in `T_ELABORAZIONE` da solo e non ti serve per proseguire — diventa il chip
  salvia con la frazione che sale.

Se più tardi riguadagna una frase (la bozza è pronta, l'azione va approvata) **non
torna al centro da sola**: diventa ambra nella TASKBAR e aspetta. Una cosa che è
partita da te non ti interrompe mai. E niente arriva da fuori che possa interromperti,
perché quello che arriva non è un task (§3).

---

## 5. Bloccato

Bloccato è una **forma di `T_ATTESA`** (§2), ed è puro asse 2: il task **resta dov'è** e
diventa rosso terra. Aspetta come tutte le attese — quello che cambia è che non aspetta
una tua decisione su qualcosa di pronto, ma una tua parola per poter ripartire.

Se sta in TASKBAR, sale in cima alla fila — un blocco per definizione vuole una tua
parola, e la posizione in cima è l'unico modo per dirlo senza interrompere.

Un task bloccato ha sempre almeno una frase, perché un blocco senza uscita è un vicolo
cieco. Le due ragioni:

- **non posso** — l'azione è fallita. Frasi: riprovare, cambiare strada, lasciar perdere.
- **non ho capito quale** — ambiguità sul referente. Le frasi sono le alternative:
  «il primo», «quello di Marco».

---

## 6. Il flusso

Un **flusso** è un insieme di task a cui hai dato un nome. Non lo fa il sistema: lo fai
tu, un task per volta, dicendolo.

> **Si chiamava «gruppo», e dal 18 settembre 2026 si chiama flusso.** Non è una rinomina
> di gusto: «gruppo» dice che stanno insieme, «flusso» dice **perché** — sono i pezzi di
> una cosa sola che stai portando avanti. È la parola con cui la cosa si nomina da fuori
> (`00-visione §3`: i processi che hai in ballo), e valeva la pena che fosse la stessa
> dentro. Nel prototipo si chiama ancora `gruppo`, insieme ai comandi
> `consegna-gruppo` e `rimanda-gruppo`: il rinomino nel codice è una cosa sola e si fa in
> un passaggio suo (`11-aperte`).

E una cosa che il nome nuovo **non** porta con sé, perché sarebbe un'altra macchina: un
flusso **non ha un ordine e non ha una sequenza**. Non esiste «prima questo e poi quello»,
e nessun task parte perché un altro è finito. Se servisse, servirebbe anche uno stato del
flusso — cosa vuol dire che un flusso è bloccato? — e quella è una domanda che oggi non ha
bisogno di risposta. Quello che lega due task in fila esiste già ed è il **fork** (§1): il
secondo nasce quando il primo scopre che serve.

È l'unico posto del modello in cui l'ordine è tuo e non suo. Il filtro decide cosa merita
di comparire, il tempo decide cosa scade, le sorgenti decidono cosa arriva — il flusso
no. Il flusso è il tuo modo di dire «queste tre sono la stessa cosa», e il sistema non ha
voce in capitolo. **Per questo non si forma da sé**: un flusso che comparisse senza che
tu l'abbia chiesto non sarebbe il tuo ordine mentale, sarebbe un'ipotesi del sistema sul
tuo ordine mentale — ed è un'altra cosa, che per giunta si vede.

### Non è un luogo

Un task dentro un flusso è ancora un `CHIP`, e sta ancora in un posto solo (legge 03).
Il flusso è un modo di tenere insieme la TASKBAR, non un settimo valore dell'asse 1.
Ne seguono tre vincoli:

- **Un task sta al massimo in un flusso.** Se stesse in due, sarebbe in due posti.
  Metterlo in un altro lo toglie dal primo: migra, come sempre.
- **Il flusso non ha stato proprio.** Non è salvato da nessuna parte se non come il nome
  che i suoi membri portano addosso: finché un task lo porta, il flusso esiste; quando
  l'ultimo lo lascia, il flusso non c'è più. Un flusso vuoto non si chiude, perché non
  esiste.
- **Il nome resta appeso al task anche fuori dalla TASKBAR.** Un membro che rimandi se lo
  porta in `ORARIO` e lo ritrova tornando. Il flusso *si vede* dove si raggruppa;
  *vale* ovunque.

### Si mette in un flusso ciò che hai in mano

Solo in TASKBAR.

Non nella NOTIFICATIONBAR, e adesso la ragione è più semplice di prima: **lì dentro non ci
sono task** (§3). Un flusso tiene insieme cose che stai portando avanti, e una notifica non
la stai portando avanti — l'hai solo ricevuta. Raggrupparle sarebbe mettere un'etichetta su
della posta in arrivo.

«Mettila con…» vale quindi su una bolla o su un chip, e mettere in un flusso non è
rimandare: è dire che quella cosa appartiene a un insieme, e che quell'insieme ce l'hai in
mano **adesso**.

### Chi parla per il flusso

Il flusso indossa **colore e icona del membro che ha più bisogno di te**:

| | |
|---|---|
| 1 | `bloccato` — un blocco non si nasconde mai dietro un numero |
| 2 | `aspetta te` |
| 3 | `in corso` |
| 4 | `concluso` o `consegnato` |
| 5 | `programmato` |

Il `dato` del flusso è quanti sono. Il nome è quello che gli hai dato tu.

Un effetto voluto: tre chip colorati diventano un punto di colore solo. La legge 04 vuole
al massimo due punti di colore per schermo, e il flusso è il primo meccanismo del sistema
che ci lavora a favore invece che contro.

### Le frasi

Come un chip, un flusso non ha voce finché non lo apri — e «apri Acme» funziona sempre,
perché è un richiamo per nome, esattamente come «torna al riordino».

| frase | dove | cosa fa |
|---|---|---|
| «mettila con Acme» | su una bolla o un chip | la mette nel flusso Acme, che nasce se non c'è |
| «apri Acme» | sempre | espande il flusso. È un momento, non una schermata |
| «manda tutte» | a flusso aperto, e solo se **tutti** i membri sono `aspetta te` e hanno un'uscita | le consegna insieme |
| «dopo» | a flusso aperto | rimanda tutti i membri |
| «separale» | a flusso aperto | il flusso smette di esistere; i chip restano dov'erano |

Si dice «separale» e non «sciogli» perché «sciogli» è già preso: scioglie un blocco della
forma *non ho capito quale* (§5). Due comandi con la stessa parola sono un comando solo
detto male.

«manda tutte» è l'unica frase del sistema che fa attraversare il confine a più cose con
una parola sola. Regge finché restano veri tutti e due questi vincoli: si offre **solo**
su un flusso interamente `aspetta te` — mai su uno misto, dove non sapresti cosa parte —
e **«no, aspetta» ritira l'intera consegna**, non l'ultima. Ciò che parte insieme si
annulla insieme.

---

## 7. Dentro un task

Una bolla mostra una riga. Un task, a volte, tiene di più — e finché sta sulla scrivania
insieme alle altre non c'è posto per farlo vedere.

**Dentro** è il momento in cui una bolla si apre: si allarga e mostra quello che tiene,
e intorno si spegne. Si dice «aprila», si esce con «chiudi».

### Attivo non vuol dire aperto

Sono due cose diverse, e vanno tenute diverse.

**Attivo** è `MAIN`: la bolla a cui INPUT sta parlando, una sola per volta (§2). Sta
sull'asse 1 ed è un luogo.

**Dentro** è un gradino in più che **solo una bolla attiva può salire**. Un task può
restare attivo per ore senza essere mai aperto: aprirlo è una cosa che fai tu, dicendola,
e si disfa da sé appena la bolla smette di essere attiva.

Nel codice si chiama `dentro` e non `fuoco` per una ragione che vale la pena scrivere:
in questo sistema «a fuoco» vuol già dire **attivo**. Due nomi uguali per due cose diverse
sono un errore che si paga ogni volta che qualcuno rilegge.

### Non cambia lo stato di niente

Dentro è una vista, come l'elenco della NOTIFICATIONBAR: non è un avanzamento, non è un luogo, e
non aggiunge un terzo asse. Tre conseguenze vincolanti:

- **Non cambia niente.** Un task che apri resta dov'era e com'era — stesso luogo, stesso
  avanzamento, stesso colore. Se aprirlo cambiasse qualcosa, guardare sarebbe un atto, e
  guardare non è un atto.
- **Si apre solo ciò che è attivo.** Aprire un task che non è `MAIN` lo porta prima al
  centro: prima diventa attivo, poi si apre. Mai il contrario, e mai senza passare di lì.
- **Uno per volta.** Vale la regola del cassetto e del flusso aperto (§6): aprire il
  cassetto chiude il dentro, e aprire un task chiude il cassetto. Due momenti insieme sono
  una finestra, e le finestre non esistono.

### Si chiude da sé

Il dentro segue il task, non te: se il task se ne va — lo mandi, lo rimandi, cade nella
memoria — la bolla non ha più niente da mostrare e si chiude da sola. Restare aperti su
una cosa che non c'è più è il modo più rapido di mentire.

### Cosa si vede dentro

I contenuti del task, con la regola che li governa: **una cosa sola, e vince l'esito**.
Sta in `§1`, sotto «Dove si vedono», e non si riscrive qui.

Vale la pena ripetere solo la conseguenza: dentro si vede **di più, non di diverso**.
Niente tabelle, niente elenchi lunghi — resta dicibile (`05-interfaccia §1`).

Ne segue la differenza fra due frasi che sembrano la stessa:

| frase | cosa fa |
|---|---|
| «aprila» | la **mostra**: il corpo compare, e la voce dice solo che è lì |
| «leggila» | la **dice**: la porta a fuoco e la legge ad alta voce |

Un task che non ha niente dentro **non si apre**, e lo dice invece di aprirsi vuoto.

---

## 8. Il tempo, e chi vince nella Timeline

La Timeline mostra due soggetti — **adesso** e **dopo** — e i soggetti possibili sono
più di due: le ore libere, l'impegno vicino, da quanto stai su una cosa, un rinvio che
torna, quanto resta della giornata. Il posto è uno, quindi qualcuno deve perdere.

Questa sezione esiste perché `design/L1 - TIMELINE` **si è rifiutato di deciderlo**: un
ordine di precedenza contiene «quando» e «se», quindi è logica e non disegno
(`CLAUDE.md` · la separazione). Il documento di design lo dichiara aperto e rimanda qui.

**Adesso.** Vince il task `in corso`, e ce n'è al massimo uno — è il modello a
garantirlo (`§2`), non la Timeline a scegliere. La targa dice **da quanto** ci stai,
misurata sull'ultimo cambio di avanzamento.

Se non c'è niente in corso, il posto **non resta vuoto e non mente**: dice quanto tempo
hai, da adesso alla prossima cosa che ha un'ora — o alla fine della giornata di lavoro,
se non c'è niente. È la frase che un calendario non dice mai, e la ragione per cui
questo componente non è un cruscotto.

**Dopo.** Vince **la cosa più vicina nel tempo**, e solo fra quelle che hanno un'ora:
`ora` ce l'hanno i programmati e i rimandati, che è esattamente l'insieme giusto — una
cosa senza un'ora non è «dopo», è solo da fare.

**Il preavviso scavalca tutto.** Dentro i quindici minuti (`REGOLE.preavviso`) il dopo
passa in ambra e prende peso. Non compare niente di nuovo e non si sposta niente: è
cambiato lo stato, quindi è cambiato il colore (legge 04). Questa è la sola soglia del
componente, ed è la stessa che promuove un programmato a `aspetta te` (`§3`) — non un
numero nuovo, lo stesso fatto guardato da un'altra parte.

**Niente prima.** Il passato è l'unica informazione che riguarda una cosa che non si può
più cambiare, e sta fuori. Se serve sapere cosa stavi facendo, lo dice l'adesso con
un'altra apertura, e solo quando non c'è più niente in corso.

**Il filo non decide niente.** I suoi tratti non scelgono: ognuno porta il colore dello
stato di quello che copre. Un tratto `programmato` non esiste, perché programmato non ha
colore — resta il fondo del filo. L'orizzonte è la giornata di lavoro del profilo
(`contesto.oreDiLavoro`), e **promette una precisione che non ha**: undici ore in 242 px
fanno cinque pixel per mezz'ora. Resta aperto in `design/L1 - TIMELINE` se accorciarlo.

**Cosa la Timeline non fa**, e se una di queste cade è un task in due posti (legge 03):
non offre frasi, non si preme, non migra. Mostra il tempo, *etichettato* da cosa
succede — e tutto quello che mostra sta già da un'altra parte: è **una
visualizzazione**, non una sorgente. Il giorno che arriva un calendario vero cambia da
dove legge, non cosa disegna.

---

## 9. Domande ancora aperte

1. ~~Non si può scartare niente: serve una quarta uscita?~~ **Deciso: no.**
   «Metti da parte, ci penso dopo» è «dopo» — il task va in `ORARIO`, programmato, e
   torna da solo. Non mancava uno stato, mancava **la frase**: il sistema dice fra
   quanto te la rimette davanti, e una cosa messa via di cui sai quando torna non è
   più una cosa persa. Vedi `09-catene §2`.
2. **Un task bloccato che non sciogli.** Resta rosso in TASKBAR per sempre? Oggi non
   c'è una strada verso `MEMORIA` che non passi da `fatto`.
3. ~~La tastiera è un'alternativa o una scorciatoia?~~ **Deciso: pari grado.**
   Voce e scrittura sono due canali equivalenti in ingresso, e le risposte sono sempre
   scritte *e* parallelamente dette — vedi `05-interfaccia §1`. Ne segue che due cose del
   design vanno cambiate, e non posso farlo io perché sono leggi di livello 1:
   la legge 01 («la tastiera è una scorciatoia, non un'alternativa») e il fatto che
   INPUT a riposo non esista, che non regge se si può scrivere. **INPUT diventa una
   presenza fissa a sinistra** che tiene lo scambio e la raccolta — vedi `05-interfaccia §1`.
