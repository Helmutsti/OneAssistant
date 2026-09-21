# 01 — Il modello

Cos'è un task, quali stati attraversa, chi lo fa passare da uno all'altro.
È la macchina da implementare: tutto il resto del sistema ne è una vista o una sorgente.

Il design di ogni stato sta in Claude Design (L2). Qui non si descrive un pixel.

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
| `esterna` | un evento di una sorgente ha superato il filtro | NOTIFICATIONBAR, come `CARTA` |
| `derivata` | il sistema ha estratto un impegno da una conversazione | NOTIFICATIONBAR, come `CARTA` |

L'origine **non è uno stato**: dice solo chi ha iniziato (legge 02). Un task esterno
che porti al centro diventa `MAIN` a tutti gli effetti, ma resta di origine esterna.

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
avanzamento    asse 2, vedi §2
dato           la singola cosa mostrata nel chip: una frazione, un'ora, una parola
frasi          fino a 4, ordinate per probabilità; la prima è la più probabile
ora            solo se programmato o rimandato
timer          le scadenze attive, vedi §4
fonte          da dove viene — solo per origine esterna o derivata
collegamenti   persone, progetti, documenti a cui il task si riferisce
gruppo         il nome che gli hai dato tu, se gliene hai dato uno — vedi §6
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
esistono, il riassunto e la composizione (`07-flussi §2` e `§3`), ci cascano dentro senza
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
| `CARTA` | solo `testo`. Una side chiede una parola, non fa leggere |
| `CHIP` | solo `dato`: una frazione, un'ora. Un chip non ha contenuti, ha un segno |
| `MAIN` o `APERTO`, chiusa | solo `testo` |
| `MAIN` **aperta dentro** (§7) | l'esito se c'è; l'ingresso se non c'è ancora |
| `ORARIO` | niente. È una promessa, non un testo |
| `MEMORIA` | niente a schermo: si richiama a voce, e allora si racconta |

E il vincolo che li tiene tutti e due: **restano dicibili** (`04-motore §1`). Un contenuto
che si può solo guardare non è ancora roba di questo sistema.

### L'uscita dice dove, non cosa

`uscita` porta **il dove** e **il a chi**, e nient'altro. Il *cosa* è l'esito del task, e
l'uscita si limita a portarlo fuori: è per questo che `consegna` riceve due cose e non
una (`02-confini §1`).

Un task che consegna senza aver prodotto niente manda la sua riga — è il caso della
promozione ai contatti, dove quello che esce è un nome e non un testo.

---

## 2. I due assi

Lo stato di un task non è uno: sono due, indipendenti fra loro.

- **Asse 1 — il luogo.** Dove il task è visibile. Esclusivo: un task sta in un posto
  solo (legge 03).
- **Asse 2 — l'avanzamento.** Cosa sta succedendo. È il colore a comunicarlo (legge 04).

La posizione non dice mai l'avanzamento, e il colore non dice mai il luogo.
È per questo che un chip non cambia mai forma né vetro: cambia solo il colore
dell'icona e della targa.

### Asse 1 — luogo

| valore | area | |
|---|---|---|
| `MAIN` | TABLE | la bolla a cui INPUT sta parlando. **Una sola per volta.** Solo lei mostra le sue frasi (§3). |
| `APERTO` | TABLE | una bolla sulla scrivania che non ha il fuoco |
| `CHIP` | TASKBAR | minimizzato, alto a destra. Oltre quattro si raggruppa. |
| `CARTA` | NOTIFICATIONBAR | arrivato e non ancora preso in mano. Solo il primo ha voce. |
| `ORARIO` | NOTIFICATIONBAR | rimandato. Nel cassetto, in fila con quello che è arrivato, in ordine di ora. |
| `MEMORIA` | — | non a schermo. Si richiama solo a voce. |

### Asse 2 — avanzamento

| valore | colore | significa |
|---|---|---|
| `in corso` | salvia `#4E6B54` | la palla è al sistema |
| `aspetta te` | ambra `#B3762A` | la palla è tua, e c'è qualcosa di pronto |
| `programmato` | nessuno | esiste, ha un'ora, non chiede niente adesso |
| `bloccato` | rosso terra `#8A2E22` | il sistema si è fermato e non può proseguire da solo |
| `concluso` | salvia `#4E6B54` | finito dentro il sistema, niente è uscito |
| `consegnato` | salvia `#4E6B54` | qualcosa ha attraversato il confine, e la finestra di annullamento è ancora aperta |

### Combinazioni legali

|  | in corso | aspetta te | programmato | bloccato | concluso / consegnato |
|---|---|---|---|---|---|
| `MAIN` | sì | sì | sì | sì | sì |
| `APERTO` | sì | sì | sì | sì | sì |
| `CHIP` | sì | sì | sì | sì | sì |
| `CARTA` | — | **sì** | — | — | — |
| `ORARIO` | — | sì | sì | — | — |
| `MEMORIA` | — | — | — | — | sì |

Le caselle vuote sono impossibili, non improbabili: se il codice ne produce una,
è un errore.

- **`CARTA` è sempre e solo `aspetta te`.** Una side esiste per chiedere una parola.
  Nel momento in cui gliela dai, lascia la pila: «manda» la fa diventare `CHIP in corso`,
  «dopo» la manda in `ORARIO`, «portala al centro» la fa `MAIN`.
- **`ORARIO` diventa `aspetta te`** solo nei quindici minuti prima dell'ora.
- **`MEMORIA` accoglie solo ciò che è finito** — vedi la domanda aperta in §6.
- **`concluso` e `consegnato` si disegnano identici**: stesso salvia, stesso chip. A
  vedersi sono la stessa cosa, e va bene così — la differenza vive solo qui, perché solo
  il consegnato ha fatto qualcosa di irreversibile e solo lui si può annullare.

---

## 3. Chi fa scattare le transizioni

Tre attori, e solo tre.

### La tua voce

| frase | da | a |
|---|---|---|
| «senti…» «trova…» «scrivi…» «dimmi…» | — | nuovo task, `MAIN` |
| «portala al centro» | `CARTA` | `MAIN` |
| «mettila con …» | `CARTA`, `MAIN` o `APERTO` | `CHIP`, dentro il gruppo che nomini — vedi §6 |
| «manda» | `CARTA aspetta te` | `CHIP in corso` |
| «dopo» | `CARTA` o `MAIN` | `ORARIO programmato` |
| «torna al …» (nome del chip) | `CHIP` | `MAIN` |
| una frase nomina un task a schermo | `APERTO` | `MAIN`; il `MAIN` uscente torna `APERTO` |
| «no, aspetta» | `consegnato`, entro 90 s | annulla la consegna, torna all'avanzamento precedente |
| «aspetta» | qualunque `in corso` | sospende l'azione — sempre udibile, anche a bolla chiusa |

Quattro frasi aprono una vista senza cambiare nessuno stato: «cosa hai in mano?»
(TASKBAR), «fammi vedere le altre» e «cosa mi aspetta?» (tutte e due la NOTIFICATIONBAR —
è un posto solo: sopra quello che è arrivato, sotto quello che ha un'ora), «aprila»
(dentro il task a fuoco — vedi §7).

I cinque verbi aprono ciascuno un'intenzione diversa: «senti» comanda, «trova» cerca
(e apre già in raccolta), «scrivi» detta, «dimmi» domanda, «aspetta» interrompe — ed è
l'unico sempre udibile, anche a bolla chiusa. Il verbo è la prima parola della frase, non
un risveglio separato. Dentro una conversazione aperta — **30 s dall'ultimo scambio** —
non serve ripeterlo.

### Il richiamo

Non serve un verbo dedicato per cambiare il fuoco: **basta che una frase nomini un task
già a schermo**. «torna al riordino» e «per il riordino usa l'altra cartella» fanno la
stessa cosa sull'asse 1 — il riordino diventa `MAIN`.

Chi decide il richiamo è l'AI engine, che è l'unico che legge una frase (`04-motore §2`).
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

Le frasi stanno sempre sotto **il task a cui INPUT sta parlando**: la `MAIN` se c'è,
altrimenti la carta in cima alla pila, che è l'unica ad avere voce. Se non c'è né l'una
né l'altra, non ci sono frasi — e va bene: vuol dire che tocca a te cominciare.

Se la frase nomina un `CHIP`, vale la riga «torna al …»: il chip risale e diventa `MAIN`.
Se nomina un task in `MEMORIA`, il task rientra come `MAIN`. Se ne nomina due, **il fuoco
non si sposta** e il sistema chiede quale: non è un blocco — un blocco è avanzamento, e
un richiamo l'avanzamento non lo tocca.

### Il tempo

| scadenza | da | a |
|---|---|---|
| 1 h senza che tu la guardi | `CARTA` | `ORARIO` |
| 15 min prima dell'ora | `ORARIO programmato` | `ORARIO aspetta te` |
| 30 min dal rinvio | l'eco in TASKBAR | sparisce dalla fila; il task resta in `ORARIO` |
| 90 s | `concluso` o `consegnato` | `MEMORIA` |

La pila della NOTIFICATIONBAR non accumula: se cresce, il filtro ha sbagliato a proporre.

### Il mondo — sorgenti e destinazioni

| evento | effetto |
|---|---|
| un'azione autonoma si completa senza produrre niente fuori | `in corso` → `concluso` |
| una consegna va a buon fine | `aspetta te` → `consegnato` |
| un'azione produce qualcosa da approvare | `in corso` → `aspetta te` |
| un'azione fallisce, o trova un'ambiguità che non sa sciogliere | → `bloccato` |
| arriva un evento che supera il filtro | nasce un task, `CARTA aspetta te` |
| torna la risposta a una delega | rientra nel task che l'ha generata, `aspetta te` |

Le sorgenti finte e quelle vere entrano esattamente da qui: producono questi eventi e
nient'altro. È il confine, e sta tutto in un punto solo.

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
prima. Dal filtro passa solo ciò che nessun task stava aspettando (`02-confini §3`).

**Una consegna non avviene mai senza passare da `aspetta te`** — salvo le azioni che hai
autorizzato una volta per tutte: solo ciò che nessun altro vede, mai una cosa che un altro
essere umano legge. Quali siano e come si concedono, in `02-confini §6`.

**Il sistema non propone lavoro di sera.** Fuori dall'orario di lavoro nessun evento
genera una `CARTA`, qualunque punteggio abbia: al massimo aspetta il mattino.
Regola provvisoria, si preciserà in `02-confini`.

---

## 4. L'esaurimento — quando una bolla diventa chip

Una bolla si esaurisce **quando non ha più frasi da offrirti adesso**.

Non a tempo, non perché ne apri un'altra. Le frasi sono i comandi (legge 01): un task
che non ha più niente da farsi dire non ha più niente da mostrare, e si contrae in chip.

Succede in due casi:

- il task è `fatto` — e il chip vive i suoi 90 secondi, poi cade in memoria;
- il task è `in corso` da solo e non ti serve per proseguire — diventa il chip salvia
  con la frazione che sale.

Se più tardi riguadagna una frase (la bozza è pronta, l'azione va approvata) **non
torna al centro da sola**: diventa ambra nella TASKBAR e aspetta. Una cosa che è
partita da te non ti interrompe mai — solo le side arrivano da fuori, e nemmeno quelle
interrompono.

---

## 5. Bloccato

`bloccato` è puro asse 2: il task **resta dov'è** e diventa rosso terra.

Se sta in TASKBAR, sale in cima alla fila — un blocco per definizione vuole una tua
parola, e la posizione in cima è l'unico modo per dirlo senza interrompere.

Un task bloccato ha sempre almeno una frase, perché un blocco senza uscita è un vicolo
cieco. Le due forme:

- **non posso** — l'azione è fallita. Frasi: riprovare, cambiare strada, lasciar perdere.
- **non ho capito quale** — ambiguità sul referente. Le frasi sono le alternative:
  «il primo», «quello di Marco».

---

## 6. Il gruppo

Un **gruppo** è un insieme di task a cui hai dato un nome. Non lo fa il sistema: lo fai
tu, un task per volta, dicendolo.

È l'unico posto del modello in cui l'ordine è tuo e non suo. Il filtro decide cosa merita
di comparire, il tempo decide cosa scade, le sorgenti decidono cosa arriva — il gruppo
no. Il gruppo è il tuo modo di dire «queste tre sono la stessa cosa», e il sistema non ha
voce in capitolo. **Per questo non si forma da sé**: un gruppo che comparisse senza che
tu l'abbia chiesto non sarebbe il tuo ordine mentale, sarebbe un'ipotesi del sistema sul
tuo ordine mentale — ed è un'altra cosa, che per giunta si vede.

### Non è un luogo

Un task dentro un gruppo è ancora un `CHIP`, e sta ancora in un posto solo (legge 03).
Il gruppo è un modo di tenere insieme la TASKBAR, non un settimo valore dell'asse 1.
Ne seguono tre vincoli:

- **Un task sta al massimo in un gruppo.** Se stesse in due, sarebbe in due posti.
  Metterlo in un altro lo toglie dal primo: migra, come sempre.
- **Il gruppo non ha stato proprio.** Non è salvato da nessuna parte se non come il nome
  che i suoi membri portano addosso: finché un task lo porta, il gruppo esiste; quando
  l'ultimo lo lascia, il gruppo non c'è più. Un gruppo vuoto non si chiude, perché non
  esiste.
- **Il nome resta appeso al task anche fuori dalla TASKBAR.** Un membro che rimandi se lo
  porta in `ORARIO` e lo ritrova tornando. Il gruppo *si vede* dove si raggruppa;
  *vale* ovunque.

### Si raggruppa ciò che hai in mano

Solo in TASKBAR.

Non nella NOTIFICATIONBAR: la pila non deve accumulare (`02-confini §3`), e poter raggruppare lì
renderebbe comodo l'accumulo invece di farlo notare — un gruppo di side è un filtro che
sbaglia con un'etichetta sopra. E non fra le cose rimandate: quelle si guardano quando
apri il cassetto, non si maneggiano.

Ne segue che **«mettila con…» toglie una side dalla pila**, accanto a «manda», «dopo» e
«portala al centro». Non riapre la questione della quarta uscita, che è chiusa: «metti da
parte» è «dopo». Mettere in un gruppo non è rimandare — è dire che quella cosa appartiene
a un insieme, e che quell'insieme ce l'hai in mano **adesso**.

### Chi parla per il gruppo

Il gruppo indossa **colore e icona del membro che ha più bisogno di te**:

| | |
|---|---|
| 1 | `bloccato` — un blocco non si nasconde mai dietro un numero |
| 2 | `aspetta te` |
| 3 | `in corso` |
| 4 | `concluso` o `consegnato` |
| 5 | `programmato` |

Il `dato` del gruppo è quanti sono. Il nome è quello che gli hai dato tu.

Un effetto voluto: tre chip colorati diventano un punto di colore solo. La legge 04 vuole
al massimo due punti di colore per schermo, e il gruppo è il primo meccanismo del sistema
che ci lavora a favore invece che contro.

### Le frasi

Come un chip, un gruppo non ha voce finché non lo apri — e «apri Acme» funziona sempre,
perché è un richiamo per nome, esattamente come «torna al riordino».

| frase | dove | cosa fa |
|---|---|---|
| «mettila con Acme» | su una bolla o una carta | la mette nel gruppo Acme, che nasce se non c'è |
| «apri Acme» | sempre | espande il gruppo. È un momento, non una schermata |
| «manda tutte» | a gruppo aperto, e solo se **tutti** i membri sono `aspetta te` e hanno un'uscita | le consegna insieme |
| «dopo» | a gruppo aperto | rimanda tutti i membri |
| «separale» | a gruppo aperto | il gruppo smette di esistere; i chip restano dov'erano |

Si dice «separale» e non «sciogli» perché «sciogli» è già preso: scioglie un blocco della
forma *non ho capito quale* (§5). Due comandi con la stessa parola sono un comando solo
detto male.

«manda tutte» è l'unica frase del sistema che fa attraversare il confine a più cose con
una parola sola. Regge finché restano veri tutti e due questi vincoli: si offre **solo**
su un gruppo interamente `aspetta te` — mai su uno misto, dove non sapresti cosa parte —
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
- **Uno per volta.** Vale la regola dell'elenco e del gruppo aperto (§6): aprire la pila
  chiude il dentro, e aprire un task chiude la pila. Due momenti insieme sono una
  finestra, e le finestre non esistono.

### Si chiude da sé

Il dentro segue il task, non te: se il task se ne va — lo mandi, lo rimandi, cade nella
memoria — la bolla non ha più niente da mostrare e si chiude da sola. Restare aperti su
una cosa che non c'è più è il modo più rapido di mentire.

### Cosa si vede dentro

I contenuti del task, con la regola che li governa: **una cosa sola, e vince l'esito**.
Sta in `§1`, sotto «Dove si vedono», e non si riscrive qui.

Vale la pena ripetere solo la conseguenza: dentro si vede **di più, non di diverso**.
Niente tabelle, niente elenchi lunghi — resta dicibile (`04-motore §1`).

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

Questa sezione esiste perché `design/L2 - Timeline` **si è rifiutato di deciderlo**: un
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
fanno cinque pixel per mezz'ora. Resta aperto in `design/L2 - Timeline` se accorciarlo.

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
   più una cosa persa. Vedi `07-flussi §2`.
2. **Un task bloccato che non sciogli.** Resta rosso in TASKBAR per sempre? Oggi non
   c'è una strada verso `MEMORIA` che non passi da `fatto`.
3. ~~La tastiera è un'alternativa o una scorciatoia?~~ **Deciso: pari grado.**
   Voce e scrittura sono due canali equivalenti in ingresso, e le risposte sono sempre
   scritte *e* parallelamente dette — vedi `04-motore §1`. Ne segue che due cose del
   design vanno cambiate, e non posso farlo io perché sono leggi di livello 1:
   la legge 01 («la tastiera è una scorciatoia, non un'alternativa») e il fatto che
   INPUT a riposo non esista, che non regge se si può scrivere. **INPUT diventa una
   presenza fissa a sinistra** che tiene lo scambio e la raccolta — vedi `04-motore §1`.
