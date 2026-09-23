# L0 — Sistema

**Solo regole scritte.** Questo documento non mostra interfacce: le stabilisce. È l'unico
documento di livello 0. Se un disegno di livello 1, 2, 3 o 4 contraddice una riga di qui,
**il disegno è sbagliato**.

Va in coppia con `L1 - Moodboard`: la moodboard dice **come deve apparire**, questo dice
**come deve comportarsi**.

> **Stato del prototipo.** Le regole descrivono il comportamento del prodotto previsto.
> Nell'implementazione attuale memoria e servizi non sono sistemi operativi: i dati
> necessari vengono forniti all'AI tramite documenti di contesto. Persistenza e
> integrazioni reali appartengono alle fasi future.

> Dal 18 settembre 2026 è un file di testo e non più un documento grafico. Non aveva
> niente da mostrare: erano righe, disegnate come se fossero un componente. Adesso si
> legge, si cerca, e si vede cosa cambia in un diff.

---

## I cinque livelli

Ogni documento del design appartiene a un livello, e il numero dice chi comanda su chi.
**Il numero più basso è la verità**: ogni livello è la base del successivo, e chi sta più
in alto non inventa — declina.

| | | |
|---|---|---|
| **L0** | la legge | `Sistema`: come si comporta. Uno solo, e comanda su tutti |
| **L1** | le fondamenta | come deve apparire: `Moodboard` la luce · `Temi` il colore e i due materiali · `Icone` la famiglia |
| **L2** | i componenti | uno per area, più la primitiva: `Bubble`, `Notificationbar`, `INPUT`, `Profilebar`, `Systembar`, `Sidebar`, `TIMELINE` |
| **L3** | i flussi | un giro intero: `Flusso task` |
| **L4** | le schermate | tutti i componenti insieme, in un momento vero: `Schermate` |

**L0 e L1 non contengono componenti disegnati**, e non si modificano per cascata: se una
modifica di componente contraddice una legge o un valore del materiale, va segnalata e
discussa, non applicata in silenzio.

**Un componente L2** mostra tutte le facce della sua area e mai la composizione intera.
Obbedisce a L0 e a L1, ed è la fonte di verità per L3 e L4.

**L3 e L4 non inventano niente.** Ogni pixel viene da un componente L2: se differisce, si
aggiorna il documento di numero **più alto**, mai il componente.

> **Regola di cascata, obbligatoria.** Chi modifica un documento aggiorna, nella stessa
> risposta, tutte le sue occorrenze nei numeri più alti. Un documento che mostra una
> versione vecchia di ciò che sta sotto di lui è peggio di un documento che non esiste.
> La cascata **sale soltanto**: dal numero basso al numero alto, mai al contrario.

Un livello non si salta e non si duplica: quello che un documento può dire, nessun altro
lo ripete. Se una cosa appare in due livelli, è del più basso — l'altro la cita.

Cosa non sta qui: **la logica**. Quando una cosa diventa un'altra, chi lo decide, cosa entra
nel sistema — quello sta in `docs/`, si cita e non si ricopia (`CLAUDE.md`).

---

## Legge zero — ogni task vive dentro una bolla

**Niente scritte flottanti.** Nessun testo appoggiato sul fondo di sistema: né stati, né
frasi da dire, né conteggi. Se una cosa si legge, ha un contenitore.

**La bolla circoscrive contenuto e contesto.** Dentro la stessa bolla: che cos'è, da chi o
da dove viene, il suo stato, e le frasi che la riguardano. Mai il contesto fuori dalla bolla
del suo task.

**Una bolla, un task.** Due task non condividono una bolla e un task non si spezza in due.
L'unica bolla che non contiene un task è la **bolla documento**, che mostra un contenuto e
non ha stato (`docs/L02`).
Il vetro satinato è il bordo del pensiero: dove finisce la bolla, finisce l'argomento.

**Le eccezioni sono due** — e il 19 settembre 2026 erano tre.

- **SYSTEMBAR** non ha bolla: non è un task, è la macchina che si dichiara, e vive a
  inchiostro diretto sul fondo.
- **TIMELINE** non ha bolla: non è un task, è dove sei dentro la giornata, e vive anche lei
  a inchiostro diretto sul fondo.

Le altre due sono cadute, e vale la pena sapere come, perché tutte e due erano finzioni
che si vedevano solo a parole:

- ~~**PROFILEBAR** non ha bolla.~~ **Caduta.** Lo era già di fatto: un contenitore che
  tiene tre cose *ha la forma* di un contenitore, e la distinzione reggeva solo finché
  nessuno la guardava. Adesso è una bolla come le altre, con la sua geometria
  (`L2 - Profilebar`);
- ~~**la cartina** della NOTIFICATIONBAR ha un contenitore e non è una bolla.~~
  **Caduta.** Doveva dire «questa cosa non è nostra» col materiale — opaca invece che di
  vetro — e il materiale non era il posto dove dirlo: una cosa arrivata da fuori resta di
  qualcun altro anche vista attraverso il vetro. A dirlo restano il contenuto, che non si
  riscrive mai, e il fatto che non migra e non ha stato (`L2 - Notificationbar`).

Ne segue una riga più corta di quella di prima, ed è il guadagno vero: **tutto quello che
si legge sta in una bolla, e le bolle sono fatte tutte della stessa cosa.** Il materiale
non distingue più niente — lo fanno il contenuto e il comportamento
(`L1 - Temi`).

INPUT invece la bolla ce l'ha, e **c'è sempre**: è l'unica via di scambio fra sistema e
utente, e non si può togliere di mezzo. A riposo è ridotta al minimo — il posto dove
scrivere, e nient'altro. Quando l'ascolto attivo è acceso, un **pallino verde** sta fuori
dalla bolla, a sinistra, come la coda di un balloon; quando è spento, non c'è.

---

## Le undici leggi

Nessuna è negoziabile senza dichiararlo esplicitamente. Quelle cadute restano, barrate: serve
a sapere cosa si è già provato e perché non andava.

### 01 · Nessun bottone

Tutti i controlli sono frasi fra «». Massimo quattro, mai due che fanno la stessa cosa; la
prima porta il punto salvia ed è quella più probabile. **Le virgolette sono l'affordance**:
nessun rettangolo, nessun bordo, nessun verbo imperativo rivolto all'utente.

~~La tastiera è una scorciatoia, non un'alternativa.~~ **Caduta il 17 settembre 2026**: voce
e scrittura sono di pari grado in ingresso, e spegnere il microfono toglie un canale su due,
non una funzione (`docs/L02`).

Due eccezioni, tutte e due gesti che non possono avere una frase: **la campanella**, che si
preme e ha anche una frase, e **il microfono**, che si preme e basta — col microfono spento
non esiste una frase che possa arrivare.

### 02 · L'origine dice chi ha cominciato, non quanto conta

~~Main e side: conta chi ha iniziato.~~ **Riscritta il 18 settembre 2026**, perché le *side*
non esistono più: quello che arriva non è un task finché non lo prendi
(`docs/L02`).

Quello che resta, ed è la parte che valeva: **l'origine non è una gerarchia**. Un task che
hai chiesto tu e uno nato da una cosa arrivata hanno lo stesso vetro, lo stesso raggio, lo
stesso inchiostro. L'origine si sa, non si vede.

La **active** è la bolla a cui INPUT sta parlando — una sola per volta — e si riconosce da
un segno solo: **un pallino verde a sinistra dell'icona della bolla**, mai dall'essere il doppio delle
altre.

### 03 · Un task in un posto solo

Nessun task appare in due aree contemporaneamente.

| dove | cosa ci sta |
|---|---|
| **DESK** | le bolle |
| **SIDEBAR** | i chip, cioè le bolle tolte dalla DESK, e i **rimandati**, che sono chip con un'ora |

Cosa sta dove lo decide l'utente, non il sistema (`docs/L02`).

**La NOTIFICATIONBAR non compare in questa tabella**, ed è la cosa più importante della
legge: lì dentro non ci sono task. C'è il mondo.

**Anche la MEMORIA non compare in questa tabella**, perché non è un luogo per i task. Un
task concluso non viene archiviato automaticamente. Se produce un invio o una
pubblicazione verso l'esterno, resta annullabile durante i 90 secondi della Funzione
Delay e lascia l'interfaccia dopo l'invio effettivo. Nel prodotto previsto, la sua
esecuzione può produrre informazioni utili
da conservare nella Memory Engine permanente e selettiva dell'utente attivo; il criterio
di selezione non è ancora definito. La chat raw viene conservata integralmente in un
archivio separato e non è sostituita da documenti di contesto. Nel prototipo, soltanto la
Memory Engine è rappresentata da `memory/general.txt`.

La **Funzione Delay** protegge ogni invio o pubblicazione verso l'esterno: la chiamata al
servizio parte dopo 90 secondi, durante i quali «no, aspetta» annulla realmente l'invio.
Se l'utente richiede esplicitamente il bypass, l'invio parte subito ed è definitivo e non
annullabile. Letture e ricerche nei servizi non usano il Delay.

Quando un task cambia stato, **migra**: esce da un'area ed entra nell'altra, non si duplica.

### 04 · Colore è stato, mai categoria

| | | |
|---|---|---|
| **grigio** | `#94968E` | non è ancora partito: è una bozza |
| **azzurro** | `#009DD6` | il sistema sta lavorando |
| **ambra** | `#EDA31C` | la palla è tua |
| **nessun colore** | | non chiede niente: l'hai rimandato, oppure è un documento |

Grigio e azzurro stanno alla stessa luminanza — 0,30 e 0,29 — così sullo stesso vetro
nessuno dei due pesa più dell'altro. L'ambra è più chiara apposta: è l'unica che chiede
qualcosa a te.

Il **verde** `#00A878` non compare in questa tabella perché non è uno stato: è il pallino
della bolla **active**, a sinistra della sua icona. È l'unico posto in cui il verde
esiste, ed è per questo che si riconosce da lontano.

Nessun colore «di app», nessun colore decorativo: contenuti e immagini si mostrano
desaturati, e il colore torna solo sul dato in discussione.

**Quale stato porta quale colore sta in `docs/L01`.** Qui stanno i valori e il modo in cui
si comportano sul vetro.

### 05 · Leggibilità sopra il vetro

> **Revisione liquid glass, branch codex.** Per il materiale dei campioni attivi,
> i token di [Liquid glass](Liquid%20glass.md) sostituiscono le opacità uniformi
> indicate sotto con tre film a gradiente. Cambiano solo film, blur e ombre;
> forme, posizioni, tipografia e colori di stato restano invariati.

Vetro satinato sì, bianco su bianco no. Il pannello di lavoro sta a **≥ 84% di opacità** con
inchiostro `#1A1C19` pieno; il vetro trasparente è ammesso solo per ora e stato, non per
leggere una frase.

**Tre livelli di opacità per schermo, mai quattro:** 84% ciò che è a fuoco, 78% ciò che
aspetta, 62% ciò che informa.

### 06 · Icona con valore, mai icona sola

**Lucide** — tratto uniforme, terminazioni arrotondate, licenza MIT — 14–16 px (14 nella
bolla e nel chip, 16 nel banner e nella cornice), sempre accompagnata da un numero o da
una parola: si legge da lontano e si può dire a voce.

**Le icone di tipo** dicono che tipo di task si sta svolgendo, e quasi sempre coincidono
col dato che quel task tratta: email, cartella, documento, contatto, persone,
conversazione, immagine, sveglia, indirizzo, appuntamento. Le stesse icone segnano i dati
nelle tessere della dropzone. L'elenco può crescere. Nessun logo di app, nessun mimetismo.

**Le icone di cornice** dicono lo stato della macchina e del contesto: microfono, volume,
rete, batteria, luogo, campanella, tastiera. Non sono un elenco chiuso e non contano fra
quelle di tipo, ma obbediscono alla stessa regola: mai senza un valore o una parola.

### 07 · Tipografia: una famiglia, tre pesi

**Manrope** 200 per numeri e titoli grandi, 300 per le frasi, 500 per le etichette.
**IBM Plex Mono** per targhe, dati, stati e misure.

Il grassetto non esiste nell'interfaccia: dove serve enfasi, **si cambia scala, non peso**.
Unica eccezione, il **600** per il titolo di una bolla e per il WorkMode della PROFILEBAR:
stacca dalle altre fasce senza diventare un'insegna.

### 08 · Il layer è sopra, non al posto

Il fondo del sistema operativo resta visibile ai bordi in ogni composizione: **margine 44**.
**Nessuna posizione è assoluta**: ogni componente è ancorato a un bordo dello schermo o al
vicino su cui poggia, e tutto risponde alle dimensioni dello schermo. Le tavole disegnano a
**1440 × 900**: è una misura di riferimento, non quella dello schermo.

Niente riempie lo spazio solo perché c'è — se non c'è nulla da fare, lo schermo lo dice e
resta vuoto. **Un task non si sposta perché stai parlando**: cede attenzione (opacità), mai
posizione. L'unica eccezione è il **focus**, che apri tu: le altre bolle passano in SIDEBAR
e ne tornano da sole quando esci.

### 09 · Una scrivania, non un sito — *solo in DESK*

Dentro DESK: niente griglie, niente colonne allineate, niente header e footer. I task si
appoggiano sul fondo come oggetti su un tavolo: posizioni irregolari, dimensioni diverse,
bordi che non si allineano, con leggere sovrapposizioni dove è naturale.

**Le altre aree fanno il contrario**: TIMELINE, PROFILEBAR, SYSTEMBAR, SIDEBAR, INPUT e
NOTIFICATIONBAR hanno un ancoraggio fisso — un bordo dello schermo, o il vicino su cui
poggiano — e un ordine che non cambia. È la loro prevedibilità che permette al centro di
essere libero.

### 10 · Tutti i task hanno lo stesso peso — *solo in DESK*

Nessuna gerarchia visiva fra i task. Stesso vetro, stesso raggio, stesso inchiostro. **Un
task non è più grande perché conta di più: è più grande perché contiene più cose da
leggere.** La dimensione racconta il contenuto, non il rango.

**Irregolare per natura, non per effetto.** Le posizioni nascono da dove il task è comparso e
da quanto spazio gli serve, come i fogli su una scrivania. Nessuna rotazione decorativa,
nessun disordine simulato: solo assenza di griglia.

> Il riferimento è il **mission control**, non la dashboard: uno sguardo d'insieme dove tutto
> è vivo e visibile allo stesso modo, e la scelta di cosa guardare resta tua. **Un sistema
> che decide per te cosa è importante ti ha già sostituito.**

Vale per i task dentro DESK: la cornice — ora, voce, chip, cassetto — resta ordinata e
prevedibile, perché è ciò che rende leggibile il disordine del centro.

### 11 · Ancorati ai bordi, impilati fra loro

Nessun componente ha una posizione assoluta: ognuno è ancorato a un bordo dello schermo o al
componente su cui poggia, e ha la sua dimensione intrinseca — **non si allarga per riempire lo
spazio lasciato libero da un vicino**, né si restringe per farne posto.

Le pile sono due, e l'ordine è fisso:

| dove | dall'ancoraggio in poi |
|---|---|
| **in alto a destra** | TIMELINE, poi PROFILEBAR, poi SYSTEMBAR, poi SIDEBAR — ognuno 22 px sotto il precedente |
| **in basso a sinistra** | INPUT, e la dropzone appoggiata sopra |

**Se un componente cresce, quelli che gli poggiano si muovono con lui**; se uno scompare, la
sua pila si richiude. Fra le due pile non c'è dipendenza.

**Un'eccezione sola: la NOTIFICATIONBAR**, ancorata in basso a destra a posizione assoluta,
perché apre un cassetto sopra tutti gli altri elementi.

Il DESK sta nello spazio che resta, senza ancoraggio (legge 09).

---

## Le sette aree e la loro competenza

Nomi in inglese, tutto il resto in italiano. Ogni area ha una competenza esclusiva: nessuna
fa il lavoro di un'altra.

### TIMELINE
Dove sei dentro la giornata: cosa stai facendo, da quanto tempo e cosa viene dopo. Sta in
cima alla pila di destra, ancorata in alto a destra — 44 dal bordo destro, 40 da quello
alto — come inchiostro diretto sul fondo. Non si apre, non si contrae e non si preme. La sua
altezza dipende dal contenuto, e la pila sotto di lei si muove con lei (legge 11).

### PROFILEBAR
Quando sono, dove sono, chi sono. Subito sotto la TIMELINE, a 22 px. **È una
bolla**, dal 19 settembre 2026: si stringe sul suo contenuto e non si allarga sulla riga.

### SYSTEMBAR
La macchina: chi ha la voce, volume, rete, batteria. Ordine fisso, il microfono sempre per
primo; **il colore qui significa privacy**. Subito sotto la PROFILEBAR, a 22 px.
Inchiostro, nessun contenitore. Più piccola perché conta meno.

### DESK
Le bolle. La **active** è una sola per volta ed è quella a cui
INPUT sta parlando; le altre restano sulla scrivania, intere. Centro, nessun ancoraggio:
è l'unica area senza griglia (legge 09).

### INPUT
Quello che dici, e quello che si sta formando. Due bolle, ancorate in basso a sinistra al margine 44:
sotto INPUT, dove si scrive e dove compare la risposta; sopra la **dropzone**, che c'è solo
quando un task si sta componendo e ne mostra uno alla volta. INPUT non si occupa mai:
qualunque cosa ci sia nella dropzone, resta pronto per la frase successiva.

**Le frasi che puoi dire stanno qui, e solo qui** — sono quelle della bolla **active**, e
cambiano con lei. Il pallino verde dell'ascolto sta fuori a sinistra quando l'ascolto è
acceso.

### SIDEBAR
I chip, i flussi e i rimandati; l'ambra sta in cima. Un chip è **una bolla che si è
stretta**: icona di tipo, nome come lo diresti, un dato solo. **Il vetro del chip prende
per intero il colore del suo stato**, velato — ambra al 30%, azzurro al 22% — e non porta un
pallino di stato; il verde della
active invece resta, perché non è uno stato. Subito sotto la SYSTEMBAR, a 22 px, in
verticale: se la pila sopra cresce, scende con lei.

### NOTIFICATIONBAR
**Il mondo.** Quello che arriva dai servizi, com'è arrivato — mittente e oggetto veri, mai
riscritti. Una notifica **non è un task**: lo diventa quando dici «me ne occupo». Il badge
conta solo quello che ti riguarda e non hai ancora visto.

I banner del cassetto sono **bolle come tutte le altre**: a dire che non sono tue sono il
contenuto e il comportamento — non migrano, non hanno stato — non il materiale.

Ancorata in basso a destra, a 44 dai due bordi: è l'unica posizione assoluta del sistema,
perché il suo cassetto si apre sopra tutto il resto (legge 11). Campanella **44** con badge **16**; il cassetto
sale da sotto di lei e intorno si spegne tutto.

---

## Le quattro taglie

Ogni bolla ha una di queste quattro taglie, e nessun'altra. Fanno eccezione INPUT e
PROFILEBAR, che hanno una geometria propria (`L2 - INPUT`, `L2 - Profilebar`).

| taglia | misure | dove |
|---|---|---|
| **Banner** | largo 400 · raggio 20 · margini interni 13 / 16 | NOTIFICATIONBAR, i banner del cassetto |
| **Chip** | alto 30 · raggio 20 · largo quanto il contenuto | SIDEBAR |
| **Task** | largo 348–452 · raggio 26 | DESK |
| **Focus** | tutta la DESK — 920 × 690 a 1440 × 900 · raggio 30 · titolo 46 / 200 · corpo 19 / 300 | la bolla aperta in focus |
