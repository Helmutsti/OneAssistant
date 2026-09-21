# L0 — Sistema

**Solo regole scritte.** Questo documento non mostra interfacce: le stabilisce. Se un
disegno di livello 1, 2 o 3 contraddice una riga di qui, **il disegno è sbagliato**.

Va in coppia con `L0 - Moodboard`: la moodboard dice **come deve apparire**, questo dice
**come deve comportarsi**.

> Dal 18 settembre 2026 è un file di testo e non più un documento grafico. Non aveva
> niente da mostrare: erano righe, disegnate come se fossero un componente. Adesso si
> legge, si cerca, e si vede cosa cambia in un diff.

---

## I quattro livelli

Ogni documento del design appartiene a un livello, e il livello dice chi comanda su chi.

| | | |
|---|---|---|
| **L0** | le fondamenta | `Moodboard` come appare · `Sistema` come si comporta · `Icone` |
| **L1** | i componenti | uno per area, più la primitiva: `Bubble`, `Notificationbar`, `INPUT`, `Profilebar`, `Systembar`, `TASKBAR`, `TIMELINE` |
| **L2** | i flussi | un giro intero: un flusso di task, un flusso di input |
| **L3** | le schermate | tutti i componenti insieme, in un momento vero |

**L0 non contiene componenti disegnati**, e non si modifica per cascata: se una modifica di
componente contraddice una legge, va segnalata e discussa, non applicata in silenzio.

**Un componente L1** mostra tutte le facce della sua area e mai la composizione intera.
Obbedisce a L0, ed è la fonte di verità per L2 e L3.

**L2 e L3 non inventano niente.** Ogni pixel viene da un componente: se differisce, è il
livello basso da aggiornare, mai il componente.

> **Regola di cascata, obbligatoria.** Chi modifica un componente aggiorna, nella stessa
> risposta, tutte le sue occorrenze nei livelli sotto. Un documento che mostra una versione
> vecchia di un componente è peggio di un documento che non esiste. La cascata **scende
> soltanto**.

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
Il vetro satinato è il bordo del pensiero: dove finisce la bolla, finisce l'argomento.

**Le eccezioni sono tre, dichiarate.**

- **PROFILEBAR** e **SYSTEMBAR** non hanno bolla: non sono task, sono la voce del sistema, e
  vivono a inchiostro diretto sul fondo;
- **la cartina** della NOTIFICATIONBAR ha un contenitore e non è una bolla (18 settembre
  2026). Non è una deroga: la legge dice che la bolla è l'unico contenitore **del sistema**,
  e una cartina contiene una cosa di qualcun altro. Si vede, perché non è di vetro
  (`L1 - Bubble`).

INPUT invece la bolla ce l'ha, e quando non c'è niente da dire non esiste affatto: nessun
pallino in attesa. Il punto d'ascolto sta fuori dalla bolla, a sinistra, come la coda di un
balloon.

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
non una funzione (`docs/05-interfaccia §1`).

Due eccezioni, tutte e due gesti che non possono avere una frase: **la campanella**, che si
preme e ha anche una frase, e **il microfono**, che si preme e basta — col microfono spento
non esiste una frase che possa arrivare.

### 02 · L'origine dice chi ha cominciato, non quanto conta

~~Main e side: conta chi ha iniziato.~~ **Riscritta il 18 settembre 2026**, perché le *side*
non esistono più: quello che arriva non è un task finché non lo prendi
(`docs/01-modello §3`).

Quello che resta, ed è la parte che valeva: **l'origine non è una gerarchia**. Un task che
hai chiesto tu e uno nato da una cosa arrivata hanno lo stesso vetro, lo stesso raggio, lo
stesso inchiostro. L'origine si sa, non si vede.

La **main** è la bolla a cui INPUT sta parlando — una sola per volta — e si riconosce da un
segno solo: il punto d'ascolto puntato verso di lei, mai dall'essere il doppio delle altre.

### 03 · Un task in un posto solo

Nessun task appare in due aree contemporaneamente.

| dove | cosa ci sta |
|---|---|
| **TABLE** | le bolle: quella a fuoco e quelle che stanno sulla scrivania |
| **TASKBAR** | i chip — quello che hai in mano e dorme — e i **rimandati**, che sono chip con un'ora |
| **MEMORIA** | quello che è finito. Non è a schermo: si richiama a voce |

**La NOTIFICATIONBAR non compare in questa tabella**, ed è la cosa più importante della
legge: lì dentro non ci sono task. C'è il mondo.

Quando un task cambia stato, **migra**: esce da un'area ed entra nell'altra, non si duplica.

### 04 · Colore è stato, mai categoria

| | | |
|---|---|---|
| **salvia** | `#4E6B54` | il sistema sta lavorando, o ha finito |
| **ambra** | `#B3762A` | la palla è tua |
| **rosso terra** | `#8A2E22` | si è fermato e non può proseguire da solo |
| **nessun colore** | | esiste e non chiede niente: appena nato, o rimandato |

Nessun colore «di app», nessun colore decorativo. **Massimo due punti di colore per
schermo**: contenuti e immagini si mostrano desaturati, e il colore torna solo sul dato in
discussione.

Il colore segue le **sette facce** del modello, non i quattro stati: `T_NUOVO` e
`T_ATTESA · di un'ora` non hanno colore perché non chiedono niente, e per una cosa che non
chiede il colore sarebbe una bugia (`docs/01-modello §2`).

> La tavolozza del prototipo è più viva di questa — `#00a878`, `#eda31c`, `#e0364f` — e vive
> nel profilo, non qui. Finché le due non si riconciliano, i due posti dicono due cose
> diverse: è in `docs/11-aperte`.

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
bolla e nel chip, 16 nella cartina e nella cornice), sempre accompagnata da un numero o da
una parola: si legge da lontano e si può dire a voce.

**Sette icone di tipo** in tutto il sistema: posta, cartella, documento, persone,
conversazione, immagine, sveglia. Nessun logo di app, nessun mimetismo.

### 07 · Tipografia: una famiglia, tre pesi

**Manrope** 200 per numeri e titoli grandi, 300 per le frasi, 500 per le etichette.
**IBM Plex Mono** per targhe, dati, stati e misure.

Il grassetto non esiste nell'interfaccia: dove serve enfasi, **si cambia scala, non peso**.

### 08 · Il layer è sopra, non al posto

Il fondo del sistema operativo resta visibile ai bordi in ogni composizione: **margine 44**,
schermate **1440 × 900**.

Niente riempie lo spazio solo perché c'è — se non c'è nulla da fare, lo schermo lo dice e
resta vuoto. **Un task non si sposta perché stai parlando**: cede attenzione (opacità), mai
posizione.

### 09 · Una scrivania, non un sito — *solo in TABLE*

Dentro TABLE: niente griglie, niente colonne allineate, niente header e footer. I task si
appoggiano sul fondo come oggetti su un tavolo: posizioni irregolari, dimensioni diverse,
bordi che non si allineano, con leggere sovrapposizioni dove è naturale.

**Le altre aree fanno il contrario**: PROFILEBAR, SYSTEMBAR, INPUT, TASKBAR e
NOTIFICATIONBAR hanno ancoraggi fissi al pixel e non si spostano mai. È la loro immobilità
che permette al centro di essere libero.

### 10 · Tutti i task hanno lo stesso peso — *solo in TABLE*

Nessuna gerarchia visiva fra i task. Stesso vetro, stesso raggio, stesso inchiostro. **Un
task non è più grande perché conta di più: è più grande perché contiene più cose da
leggere.** La dimensione racconta il contenuto, non il rango.

**Irregolare per natura, non per effetto.** Le posizioni nascono da dove il task è comparso e
da quanto spazio gli serve, come i fogli su una scrivania. Nessuna rotazione decorativa,
nessun disordine simulato: solo assenza di griglia.

> Il riferimento è il **mission control**, non la dashboard: uno sguardo d'insieme dove tutto
> è vivo e visibile allo stesso modo, e la scelta di cosa guardare resta tua. **Un sistema
> che decide per te cosa è importante ti ha già sostituito.**

Vale per i task dentro TABLE: la cornice — ora, voce, chip, cassetto — resta ordinata e
prevedibile, perché è ciò che rende leggibile il disordine del centro.

### 11 · Ogni componente è autonomo e flottante

Nessun componente è in griglia o in colonna con un altro. Ognuno ha il suo ancoraggio e la
sua dimensione intrinseca: galleggia sul fondo e **non si allarga per riempire lo spazio
lasciato libero da un vicino**, né si restringe per farne posto.

Non esistono contenitori condivisi, righe, colonne o larghezze residue: **se un componente
scompare, nessun altro si muove.**

---

## Le sei aree e la loro competenza

Nomi in inglese, tutto il resto in italiano. Ogni area ha una competenza esclusiva: nessuna
fa il lavoro di un'altra.

### PROFILEBAR
Quando sono, dove sono, chi sono. In cima alla guida di destra, **44 / 40**. Senza bolla,
eccezione dichiarata alla legge zero.

### SYSTEMBAR
La macchina: chi ha la voce, volume, rete, batteria. Ordine fisso, il microfono sempre per
primo; **il colore qui significa privacy**. Subito sotto la Profilebar, **44 / 126**.
Inchiostro, nessun contenitore. Più piccola perché conta meno.

### TABLE
Quello che sta andando avanti: le bolle. La **main** è una sola per volta ed è quella a cui
INPUT sta parlando; le altre restano sulla scrivania, intere. Centro, nessun ancoraggio:
è l'unica area senza griglia (legge 09).

### INPUT
La voce, lo scambio, la raccolta. Le frasi sono quelle della main: cambia la main, cambiano
le frasi. Basso a sinistra, bolla, con il punto d'ascolto fuori a sinistra. Quando la
conversazione è finita non esiste.

### TASKBAR
Quello che hai in mano: i chip, i flussi, e i rimandati. Un chip è **una bolla che si è
stretta**: icona di tipo, nome come lo diresti, un dato solo. Nella guida di destra,
**44 / 180**, in verticale. Chip alti 30, raggio 20.

### NOTIFICATIONBAR
**Il mondo.** Quello che arriva dai servizi, com'è arrivato — mittente e oggetto veri, mai
riscritti. Una notifica **non è un task**: lo diventa quando dici «me ne occupo». Il badge
conta solo quello che ti riguarda e non hai ancora visto.

In fondo alla guida, **44 / 44 dal basso**. Campanella **44** con badge **16**; il cassetto
sale da sotto di lei e intorno si spegne tutto.
