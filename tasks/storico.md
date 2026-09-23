# Storico delle decisioni

Ogni riga risponde a una domanda sola: **perché una nozione è stata ridisegnata in modo
diverso.** Si scrive qui prima di toccare `docs/`, mai dopo. Formato: data · decisione ·
motivo · cosa ne consegue.

---

## 22 settembre 2026 — le otto decisioni della sessione di consolidamento UI

Discusse col proprietario del progetto e raccolte in un documento che era stato collocato
per errore in `docs/design/`, dove una bozza sarebbe diventata normativa senza
approvazione. Il documento è stato spostato in `tasks/Proposta - UI consolidata.md`
**senza modificarne una riga**; resta una bozza da approvare, e le sue sezioni entrano in
`docs/` una alla volta, ciascuna sottoposta prima della scrittura.

| # | Decisione | Conseguenza |
|---|---|---|
| 1 | Ogni invio esterno segue `T_CONCLUSIONE` → Delay di 90 s → chiamata al servizio → esito. Durante il Delay «no, aspetta» impedisce davvero la chiamata. «Invia subito» è un bypass esplicito, definitivo, valido solo per quell'invio | il codice si adegua: oggi l'invio parte subito e l'annullamento dichiara il falso |
| 2 | Il modello dei task usa `T_NUOVO`, `T_LAVORAZIONE`, `T_ATTESA`, `T_CONCLUSIONE`. Un task sta in DESK oppure in SIDEBAR, mai in entrambe | il codice si adegua: oggi usa due assi `Luogo × Avanzamento` e la stringa `T_NUOVO` non esiste in `src/` |
| 3 | I sotto-task sono task autonomi: stato proprio, visibili separatamente, possono avanzare in parallelo | da verificare contro l'implementazione |
| 4 | L'applicazione deve usare React, Vite e Tailwind | il codice si adegua: oggi è TypeScript vanilla con DOM imperativo e 1 126 righe di CSS a mano |
| 5 | Nel prototipo l'unica scrittura persistente autorizzata è la chat raw JSONL. Memoria intelligente, abitudini automatiche ed endpoint di scrittura non documentati restano disabilitati o vengono rimossi | il codice si adegua |
| 6 | I documenti dell'utente sono la fonte di configurazione; i valori cablati non documentati spariscono | il codice si adegua |
| 7 | Se OpenRouter non è disponibile l'azione si blocca e l'interfaccia mostra un errore chiaro. Nessun fallback finto silenzioso | il codice si adegua: oggi ripiega sulle regex per tutta la sessione, dichiarandolo solo in console |
| 8 | Una notifica esterna non è un task. Lo diventa solo quando l'utente lo chiede esplicitamente | da verificare contro l'implementazione |

**Motivo di fondo.** Le tre sessioni di audit del 21 e 22 settembre hanno misurato 119
divergenze fra `docs/` e il codice (`audit/AUDIT.md`). Nessuna si chiude senza decidere
prima quale delle due parti ha ragione: queste otto risposte sciolgono i nodi principali.

---

## 22 settembre 2026 — decisioni sull'allineamento dell'audit

| # | Decisione | Motivo |
|---|---|---|
| 9 | I 243 rimandi del codice a un corpus documentale scomparso (`docs/01-modello`, `04-motore`, `07-memoria`…) si cancellano, senza tentare di recuperare i documenti | quel codice viene comunque riscritto dalle decisioni 2 e 4; recuperare documenti morti costerebbe più di quanto renda |
| 10 | La legge 06 del design — «sette icone di tipo in tutto il sistema» — non è più vincolante nella forma attuale: si possono usare tutte le icone necessarie | la domanda era dichiarata aperta dal design stesso in `L2 - Profilebar` §«Aperta / l'ottava icona», e il codice aveva già scelto da solo. **Il nuovo testo della legge va sottoposto e approvato prima di scriverlo in `L0 - Sistema.md`** |
| 11 | `preferences.txt` resta in inglese, come il file distribuito. Il nome dell'assistente lo sceglie l'utente. Il parser si adegua al file, non viceversa | la documentazione ha la priorità, ma `docs/L03` non dichiara le chiavi: **il formato va scritto in L03, con testo da sottoporre** |
| 12 | Gli attrezzi di prova si rimuovono: `src/prova/` (2 125 righe), il pannello in `schermo.ts:1090-1199` e gli stili in `base.css:872-1064` | finivano nel prodotto compilato, con un pallino sempre a schermo, senza che nessun documento li nominasse |
| 13 | Il funzionamento di INPUT va **riprogettato interamente**. Le sei idee di raccolta di `docs/design/L2 - INPUT` non sono requisiti | quel documento contiene materiale non scritto dal proprietario del progetto. È l'unico documento di `docs/design/` in questa condizione: gli altri dodici sono confermati validi |
| 14 | Le proposte e le bozze non entrano in `docs/`. `docs/` contiene decisioni prese; `tasks/` contiene ciò che è da decidere; `docs/design/` contiene solo grafica, estetica e movimenti | il README lo prescriveva già e non era stato rispettato: da qui `AGENTS.md`, che lo rende vincolante per chiunque lavori sul repo |

---

## 22 settembre 2026 — runtime, archivio della chat, contraddizioni di `L0`

| # | Decisione | Motivo |
|---|---|---|
| 15 | Il runtime supportato si decide **dopo** il passaggio a React e Tailwind (decisione 4) | oggi `vite.config.ts` ha 4 `configureServer` e nessun `configurePreviewServer`, quindi dopo la build `/ai-engine`, `/archivio` e `/chat-raw` non esistono. Il passaggio a React rimescola comunque build e server: deciderlo ora significherebbe deciderlo due volte |
| 16 | «Integrale» significa **garantito**: il salvataggio della chat raw diventa affidabile — conferma, coda, nuovi tentativi — e un fallimento si dichiara a schermo, non in console. Il fuso orario diventa uno solo | `docs/L01:13`, `docs/L03:44` e il README usano tutti e tre la parola «integralmente». Oggi `src/archivio/chat-raw.ts:6` fa `void fetch` e ignora l'esito; il nome del file usa `Europe/Rome` mentre l'ora nella riga è UTC |
| 17 | Le tre contraddizioni interne a `docs/design/L0 - Sistema.md` si chiudono nel senso già scritto nella proposta: **Timeline e Systembar** sono le due eccezioni dichiarate alla legge delle bolle, e la dipendenza verticale Timeline → Profilebar → Systembar è una **pila limitata a tre componenti**, non una griglia generale | `L0` si smentisce da solo in tre punti: «l'eccezione è una sola» contro la Timeline a inchiostro diretto; la legge 11 «se un componente scompare, nessun altro si muove» contro «Profilebar e Systembar scorrono verticalmente con lei»; la quota fissa `44 / 126` della Systembar contro il suo stesso scorrimento. **Il testo esatto di L0 va sottoposto e approvato prima di scriverlo**, con la cascata su `L2 - Sidebar`, `L2 - Systembar`, `L2 - Profilebar`, `L2 - TIMELINE` |

---

## 22 settembre 2026 — la riprogettazione di INPUT

Il documento `docs/design/L2 - INPUT.dc.html` è risultato inattendibile su tre punti
verificati: cita `L0` attribuendogli la regola «nessun nome proprio: il sistema non è
qualcuno», che **in tutto il repo compare solo dentro quella citazione**; si dichiara
superiore alla legge di livello 0 («questa pagina lo supera»); ed è costruito sulla voce,
che `docs/L02` e `docs/L04` collocano esplicitamente in una fase futura. Viene sostituito
in blocco. La proposta è in `tasks/Proposta - INPUT riprogettato.md`.

| # | Decisione | Motivo |
|---|---|---|
| 18 | Il nuovo INPUT si progetta **solo per la tastiera** | `docs/L02` §INPUT: «Nel prototipo comprende soltanto il form di input testuale e l'utente interagisce tramite tastiera. La ricezione vocale e il tracking degli occhi appartengono a una fase futura.» La documentazione di prodotto comanda sulla logica |
| 19 | Resta **un campo minimo** come porta d'ingresso, dichiarato come **terza eccezione alla legge zero** accanto a SYSTEMBAR e TIMELINE | senza voce e senza campo non esiste niente che riceva il primo carattere. Il documento vecchio si concedeva la stessa deroga senza dichiararla. **Modifica a `L0` da sottoporre** |
| 20 | INPUT mostra **l'ultimo scambio e poi sparisce**; non è una finestra di conversazione | la cronologia integrale è già nella chat raw: una seconda copia a schermo trasformerebbe INPUT in una chat, contro la sua regola «uno scambio non è un task». **Correzione a `docs/L02` da sottoporre** |
| 21 | Il **punto d'ascolto** appartiene alla fase vocale futura e non compare nel prototipo | il punto è la voce che entra; senza voce non rappresenta niente. **Modifica a due righe di `L0` da sottoporre** |
| 22 | Cadono le **cinque parole d'apertura** («senti», «trova», «scrivi», «dimmi», «aspetta») e il **nome come alias** | servivano a dire *a chi* stai parlando quando parli; scrivendo lo dice la tastiera. Con loro cade la citazione inventata di `L0`, che esisteva solo per giustificare il nome |
| 23 | La **raccolta** si riprogetta da zero per la tastiera | le sei idee del documento vecchio non sono requisiti (decisione 13), ma `L0` §INPUT elenca la raccolta fra le tre competenze del componente: qualcosa deve esserci |

---

## 22 settembre 2026 — `L2 - INPUT` sostituito

| # | Decisione | Motivo |
|---|---|---|
| 24 | La tavola `docs/design/L2 - INPUT.dc.html` è stata **sostituita in blocco** con il componente riprogettato: sette momenti, la variante senza ascolto, le tessere, il componente intero a grandezza vera | il documento precedente citava una legge inesistente di `L0`, si dichiarava superiore al livello 0 ed era costruito sulla voce. La proposta approvata resta in `tasks/INPUT PROPOSTA.html` |

**Cascata da verificare.** `L3 - Flusso task` e `L4 - Schermate` mostrano INPUT nella forma
precedente e vanno riallineati. `L0 - Sistema` §INPUT dice «bolla» al singolare e nomina il
punto d'ascolto: va aggiornato — testo da sottoporre.

---

## 22 settembre 2026 — il modello dei task, e i confini fra porta e dropzone

| # | Decisione | Motivo |
|---|---|---|
| 25 | **`T_DRAFT` prende il posto di `T_NUOVO`.** Gli stati restano quattro | `T_NUOVO` era proforma — non compare in nessun file del codice — e definiva una condizione che non si vede a schermo. `T_DRAFT` ne rappresenta una che si vede: quello che sta nella dropzone |
| 26 | **La porta di INPUT resta solo testo.** La raccolta non ci entra: è la dropzone che accoglie direttamente la creazione del task, con le sue tessere | la porta è il punto di scambio e non si occupa mai; separare i due mestieri è la ragione per cui la dropzone esiste |
| 27 | **La dropzone accoglie un task alla volta** | — |
| 28 | Le **frasi dicibili** stanno sempre sotto una barra che attraversa la bolla da bordo a bordo | — |

---

## 22 settembre 2026 — le bozze, e le notifiche accettate

| # | Decisione | Motivo |
|---|---|---|
| 29 | **Una notifica accettata passa sempre per una bozza.** «Me ne occupo» non mette il sistema al lavoro: produce un task in `T_DRAFT` che puoi guardare, correggere o buttare prima che parta | nessuna cosa arrivata da fuori si mette in moto senza che tu l'abbia vista. Sostituisce l'ipotesi che una notifica accettata partisse subito in `T_LAVORAZIONE` |
| 30 | **`T_DRAFT` è uno stato, non un posto.** La dropzone ne mostra **una alla volta**; le altre bozze stanno in SIDEBAR, sganciate e ancora in bozza | il cassetto già tiene «quello che hai in mano e dorme»: una bozza messa da parte è quello |
| 31 | **Se accetti una notifica mentre stai componendo, la bozza in corso si sposta da sola in SIDEBAR** e la nuova prende la dropzone | la cosa appena arrivata è quella che chiede attenzione adesso; quella che stavi scrivendo non si perde, va nel cassetto |

---

## 22 settembre 2026 — scritto in `docs/L01-struttura_e_task.md`

Prima modifica a `docs/` di questa sessione, autorizzata sul testo esatto.

- riga 29, il flusso: richiesta e contesto formano un task **che nasce in `T_DRAFT`** e non parte finché l'utente non conferma;
- riga 42, la tabella: `T_DRAFT` prende il posto di `T_NUOVO`, con la definizione nuova. Gli stati restano quattro;
- righe 51-65, le transizioni: conferma e uscita dalla dropzone, la bozza scartata che non lascia traccia, il sotto-task che nasce già in `T_LAVORAZIONE`, `T_DRAFT` come stato e non come posto, e la notifica accettata che passa per una bozza.

**Cascata ancora da fare**, in quest'ordine: `docs/L02` (§INPUT e §SIDEBAR) · `docs/design/L0`
(legge zero, 01, 04, 06 e §INPUT) · `docs/design/L2 - Bubble` (i due punti che nominano
`T_NUOVO`) · `L3 - Flusso task` e `L4 - Schermate`.

---

## 22 settembre 2026 — scritto in `docs/L02-componenti.md`

Quattro correzioni, autorizzate sul testo esatto.

- **§INPUT**: dichiarato **l'unica via di scambio fra sistema e utente** — tutto quello che
  l'utente dice passa di qui, e per questo INPUT deve restare pulito e libero di accogliere
  un input dopo l'altro senza intoppi: niente di ciò che si sta componendo può occuparlo, e
  nessuna attesa può bloccarlo. È la ragione per cui la dropzone esiste. Aggiunto il
  paragrafo delle **due bolle** — la porta che non si occupa mai, la dropzone che mostra una bozza alla volta; il task nasce in bozza e non parte finché l'utente non conferma;
- **§INPUT**: «INPUT mostra la chat scritta della comunicazione» diventa «mostra l'ultimo scambio e poi sparisce: non è una finestra di conversazione». La cronologia resta nella chat raw;
- **§SIDEBAR**: aggiunte le **bozze sganciate**, che restano in bozza, e il caso in cui una bozza ci finisce da sola;
- **§NOTIFICATIONBAR**: la notifica accettata produce un task **in `T_DRAFT`**, mai un lavoro già avviato. Corretto anche un punto fermo al posto di una virgola.

`docs/` è ora allineata. **Resta il design**: `L0 - Sistema` (legge zero, 01, 04, 06, §INPUT),
`L2 - Bubble` (due punti che nominano `T_NUOVO`), e la cascata su `L3 - Flusso task` e
`L4 - Schermate`.

---

## 22 settembre 2026 — decisioni su `L0 - Sistema` (da scrivere)

| # | Decisione | Conseguenza |
|---|---|---|
| 32 | **Le frasi stanno solo in INPUT.** L'utente capisce al volo cosa dire guardando INPUT e leggendo il task chiamato in causa | contraddice `L2 - Bubble`, che in quattro punti dice che le frasi compaiono sulla bolla quando ha il fuoco. La barra sopra le frasi resta quindi materia di `L2 - INPUT`, non di `L0` |
| 33 | **Le bozze sono azzurre.** L'ambra resta ai task che hanno davvero priorità | `L0` legge 04 dichiara **tre** colori — salvia, ambra, rosso terra — e «massimo due punti di colore per schermo». L'azzurro è il quarto: la legge va riscritta, non ritoccata |
| 34 | **Le icone restano quelle definite.** Cade solo il «in tutto il sistema»: i sette sono i tipi di task, e altre icone esistono dove servono | fa emergere due tassonomie da definire: i **tipi di task** (semantica) e i **tipi di dato** (le tessere della dropzone) |
| 35 | **Il pallino verde dell'ascolto** compare solo in modalità ascolto attiva, e sta sempre accanto al balloon di INPUT | non punta verso nessuna bolla |
| 36 | **La bolla active si riconosce da un pallino verde accanto al titolo e all'icona** della bolla stessa | sostituisce il segno che `L0` legge 02 assegna oggi: «il punto d'ascolto puntato verso di lei» |

| # | Decisione | Motivo |
|---|---|---|
| 37 | **`docs/design/` non è intoccabile.** Quello che c'è scritto si può rimettere in discussione: non va trattato come un vincolo alla pari di `docs/`. **Una decisione importante sta in `docs/`, non in `docs/design/`** | il design descrive come una cosa appare; se una riga di design determina un comportamento o una regola di sistema, è nel posto sbagliato e va portata in `docs/` |
| 38 | **`L2 - Bubble` va corretto**: le frasi non compaiono sulla bolla col fuoco. Le frasi stanno solo in INPUT, e il pallino verde accanto al titolo è ciò che identifica la bolla active | conseguenza delle decisioni 32 e 36 |

---

## 22 settembre 2026 — i colori

La legge 04 dichiarava tre tinte terrose (`#4E6B54`, `#B3762A`, `#8A2E22`) e ammetteva lei
stessa che «la tavolozza del prototipo è più viva di questa — `#00a878`, `#eda31c`,
`#e0364f` — e vive nel profilo, non qui», parcheggiando la riconciliazione in
`docs/11-aperte`, che è uno dei documenti spariti. La riconciliazione si chiude qui.

| # | Decisione | Motivo |
|---|---|---|
| 39 | **Tutti i colori diventano brillanti**, nei valori che il prototipo già usa: verde `#00A878`, ambra `#EDA31C`, rosso `#E0364F` | su vetro satinato un colore desaturato smette di dire qualcosa |
| 40 | **L'azzurro delle bozze è `#009DD6`** | costruito come il verde — saturazione piena, luminanza 0,290 contro 0,294 — ed è l'unico freddo della tavolozza: l'unico stato in cui il task non è ancora partito |
| 41 | **Cade la regola «massimo due punti di colore per schermo»** | con quattro stati colorati e ogni bolla che porta il suo, non reggeva alla lettera. Resta solo la parte sui contenuti desaturati |
| 42 | **La semantica dei colori sta in `docs/L01`, i valori in `docs/design/L0`** | prima applicazione della decisione 37: quale stato porta quale colore è una decisione importante, e le decisioni importanti stanno in `docs/` |

**Scritto.** `docs/L01` ha una sezione nuova, *Il colore di uno stato*, con la tabella dei
quattro colori e la nota che `T_ATTESA` ne porta due — ambra quando aspetta te, rosso
quando è bloccato. `docs/design/L0` legge 04 è riscritta con i quattro valori; sparita la
nota sulle due tavolozze e l'ultimo riferimento a `T_NUOVO` in quel file.

**Nota misurata, non urgente:** i tre colori vivi non sono equilibrati fra loro — l'ambra
sta a luminanza 0,443, il rosso a 0,191. Su vetro l'ambra urla e il rosso si chiude.
Riequilibrarli è un lavoro a sé.

| # | Decisione | Motivo |
|---|---|---|
| 43 | **Il pallino verde della bolla active non è un colore di stato.** Si distingue da *dove* sta — accanto al titolo e all'icona — non da che tinta ha | — |
| 44 | **La forma grigia resta per il rimandato e per il concluso**, nel tempo in cui il concluso è ancora a schermo | — |
| 45 | **Bonifica dei documenti di design in una passata sola**: elenco di tutte le righe che dettano comportamento invece di grafica, con la proposta di dove spostarle. **Preciso e conciso**: i documenti devono restare leggibili da una persona | i design dettano regole che `L0` stesso dichiara di non voler contenere |

---

## 22 settembre 2026 — i colori, versione definitiva

Le decisioni 39-41 sono superate: la tavolozza è stata rivista due volte nella stessa
sessione. Vale quanto segue.

| # | Decisione | Motivo |
|---|---|---|
| 46 | **grigio `#94968E`** la bozza · **azzurro `#009DD6`** in lavorazione · **ambra `#EDA31C`** in attesa · **nessun colore** il concluso e il rimandato | grigio e azzurro alla stessa luminanza (0,30 e 0,29); l'ambra più chiara apposta, perché è l'unica che chiede qualcosa |
| 47 | **Il verde `#00A878` non è un colore di stato.** È solo il pallino della bolla active, accanto al titolo. Nessun task è mai verde | un colore che esiste in un posto solo si riconosce da lontano |
| 48 | **Il task bloccato resta ambra**, niente rosso: a sbloccarlo è comunque l'utente | — |
| 49 | **«La porta» non esiste.** La bolla in basso è INPUT, e non ha bisogno di un nome suo: è la rappresentazione grafica del componente. Sopra c'è la dropzone | era un nome inventato durante la conversazione, mai deciso e mai scritto in un documento |

**Scritto**: `docs/L01` §Il colore di uno stato · `docs/L02` §INPUT · `docs/design/L0`
legge 04 · `docs/design/L2 - INPUT` e la board in `tasks/`, ripulite dal nome inventato.

| 50 | **Cancellate `tasks/INPUT PROPOSTA.html` e `tasks/Proposta - INPUT riprogettato.md`** | la proposta è stata accettata e il suo contenuto vive in `docs/design/L2 - INPUT.dc.html`. Tenerle sarebbe una seconda copia da aggiornare due volte, e la storia di come sono nate sta qui |

---

## 22 settembre 2026 — `L0 - Sistema`: legge zero, §INPUT, e il nome della bolla

| # | Decisione | Motivo |
|---|---|---|
| 51 | **Le eccezioni alla legge zero sono due**: SYSTEMBAR e TIMELINE, entrambe a inchiostro diretto sul fondo | scritta finalmente la decisione 17, che `L0` non aveva mai recepito: dichiarava un'eccezione sola e poi ne descriveva due |
| 52 | **INPUT c'è sempre.** A riposo è ridotto al minimo — il posto dove scrivere — e il pallino verde sta fuori a sinistra solo quando l'ascolto è acceso | era scritto che «quando non c'è niente da dire non esiste affatto: nessun pallino in attesa» |
| 53 | **La bolla a cui INPUT sta parlando si chiama `active`**, non `main`, e si riconosce da un pallino verde accanto al titolo | «main» era una parola dei documenti che il proprietario del progetto non usa |

**Scritto**: `L0` legge zero (le due eccezioni e il paragrafo su INPUT), legge 02 (nome e
segno di riconoscimento), §INPUT (le due bolle, le frasi solo qui), §DESK. Cascata su
`L2 - Bubble` e `L2 - Sidebar`.

---

## 22 settembre 2026 — `L2 - Bubble` riallineato

| # | Decisione | Motivo |
|---|---|---|
| 54 | **Il catalogo dei titoli passa da cinque righe a quattro**: nasce `T_DRAFT` in grigio, `T_LAVORAZIONE` diventa azzurro, `T_ATTESA` assorbe il bloccato, e «senza colore» vale per il concluso e il rimandato | la mappa dei colori ha cambiato forma, non solo valori: due stati perdono il colore, uno lo guadagna, uno smette di essere una voce a sé |
| 55 | **Bozza e «senza colore» si distinguono dalla forma, non dalla tinta**: la bozza ha piastrella e punto pieni, «senza colore» ha piastrella vuota col filo tratteggiato e punto vuoto | il grigio è già quasi un'assenza di colore, e due grigi vicini non basterebbero. Se un giorno si confondono lo stesso, l'unica via è dare alla bozza una tinta che non sia grigia |
| 56 | **L'inchiostro del titolo resta nero in ogni stato**, tranne l'ambra. Il colore vive nel punto e nella targa, non nel testo | — |
| 57 | **Il pallino verde è un segno solo con un significato solo**: «questo è quello che farei io». Vale per la bolla active e per la frase più probabile in INPUT. Cade «uno per bolla» | i pallini a schermo possono essere due, ed è lo stesso suggerimento detto in due posti |

**Scritto in `L2 - Bubble`**: la griglia dei colori, la fascia di «Come si incrociano», la
sezione del pallino verde, le tre frasi sulle frasi che stavano sulla bolla, i due
`T_NUOVO`. Più la sostituzione dei valori in tutto il documento — 84 occorrenze fra punti,
piastrelle, barre di avanzamento e inchiostri.

| # | Decisione | Motivo |
|---|---|---|
| 58 | **Il chip di una cosa finita vive 6 secondi**, poi lascia l'interfaccia. **I 90 secondi sono un'altra cosa**: la finestra della Funzione Delay, che trattiene un invio verso l'esterno | `L3 - Flusso task` diceva «una cosa finita resta 90 secondi — la finestra per dire "no, aspetta"», fondendo due concetti distinti: un task concluso può non aver mandato niente. L'errore era anche dichiarato propagato alla Sidebar, dove però non è mai arrivato |
| 59 | **Le frasi spariscono da `L4 - Schermate`**: tolta la didascalia «Solo la main mostra le frasi» e la scheda «Le frasi stanno sotto la main» | conseguenza della decisione 32 |

| # | Decisione | Motivo |
|---|---|---|
| 60 | **La contrazione non esiste più.** Una bolla che ha finito **svanisce sul posto**: non si contrae, non migra, non lascia un chip | — |
| 61 | **L'attesa dei task chiusi è eliminata.** In SIDEBAR resta solo l'invio dentro i 90 secondi della Funzione Delay, mostrato come `T_LAVORAZIONE` — azzurro, perché l'invio non è partito | `L3` faceva vivere il chip finito 6 secondi in Sidebar, e la legge 03 dice che lì ci stanno solo i task vivi |
| 62 | **`T_CONCLUSIONE` non ha colore perché non si vede**: lascia l'interfaccia appena ha finito. «Nessun colore» resta al solo rimandato | conseguenza della 61 |

**Scritto**: `docs/L01` (tabella e paragrafo nuovo), `L2 - Bubble` (transizione, campione,
sezione dell'esaurimento, esempio della riga senza colore), `L3 - Flusso task` (il congedo
e la targa). Via anche la nota «DA PROPAGARE» in fondo a `L3`.

| # | Decisione | Motivo |
|---|---|---|
| 63 | **La contrazione automatica non esiste.** Una bolla scende in SIDEBAR solo quando l'utente lo chiede: niente regola dei 30 minuti, nessun timer invisibile | `L2 - Bubble` prescriveva che dopo 30 minuti senza essere nominata una bolla diventasse «fredda» e migrasse da sola. Non era mai stato deciso. Un lavoro ancora attivo non cambia posto senza che l'utente l'abbia detto |

---

## 22 settembre 2026 — `L2 - Bubble` sfoltito

Il file conteneva **due copie dello stesso documento** incollate una dopo l'altra: due
`</x-dc>`, due `</body>`, due `</html>`, e ogni sezione dopo «Catalogo dei titoli»
ripetuta. È il motivo per cui ogni correzione di oggi ne trovava due.

| # | Decisione | Motivo |
|---|---|---|
| 64 | **Rimossa la seconda copia del documento** — 86 690 caratteri | duplicazione pura: la prima copia contiene tutto |
| 65 | **Rimosse le sezioni «Tre taglie», «Fuoco», «Messa da parte» e «Le regole del movimento»** | non più utili. **Attenzione**: con «Tre taglie» spariscono le misure di Chip, Task e Pannello e la tabella delle deroghe per componente, che non stanno scritte da nessun'altra parte |
| 66 | **Restano «Il movimento · soap bubbles» e «Nascita · l'onda»**, da riallineare | l'animazione di nascita di un task è la sola che interessa tenere, e probabilmente verrà riscritta |

Il documento passa da **204 376 a 84 720 caratteri**. Verificato: `div` aperti e chiusi in
pari (448/448), una sola chiusura di documento. Prima del taglio erano sbilanciati di 3.
Copia di sicurezza nello scratchpad di sessione.

---

## 22 settembre 2026 — `L3 - Flusso task` e `L4 - Schermate` riallineati

| # | Decisione | Motivo |
|---|---|---|
| 67 | **`L3`**: i colori passano ad azzurro e ambra; cade «Mai due bolle colorate insieme in tutto il flusso»; le quattro affermazioni che mettevano le frasi sulla bolla diventano «le frasi stanno solo in INPUT»; l'apertura dice che INPUT c'è sempre, ridotto al minimo, col pallino verde fuori; il congedo dice che la bolla svanisce sul posto | conseguenze delle decisioni 32, 41, 52, 60 e 61 |
| 68 | **`L3`**: rimossi i due rimandi a `docs/09-catene`, uno dei documenti spariti | riferimento morto |
| 69 | **`L4`**: il punto d'ascolto diventa il pallino verde dell'ascolto attivo, presente solo a ascolto acceso; sostituiti sedici valori di colore | conseguenze delle decisioni 35 e 46 |

Restano in tutti e due i file i `#4E6B54` del blocco `<style>`, che sono il colore dei
link e il contorno del fuoco da tastiera, non stati.

---

## 22 settembre 2026 — `L2 - Bubble movement`

| # | Decisione | Motivo |
|---|---|---|
| 70 | **«Il movimento · soap bubbles» e «Nascita · l'onda» escono da `L2 - Bubble`** e vanno in una tavola loro, `L2 - Bubble movement.dc.html` | come una cosa si muove non è come una cosa è fatta |

La tavola nuova porta il testo com'era, spostato e **non ancora rivisto**: lo dichiara in
testa. `L2 - Bubble` scende a 75 813 caratteri. `div` in pari in entrambe: 59/59 e 402/402.

**Registro della bonifica** in `tasks/bonifica-design.md`: otto righe di comportamento da
spostare in `docs/`, l'elenco dei valori per `L1 - Token`, e sette contraddizioni aperte —
fra cui la misura delle icone che ha tre valori diversi e il pallino che ne ha tre.

---

## 22 settembre 2026 — `L1 - Token`, e quattro contraddizioni chiuse

| # | Decisione | Motivo |
|---|---|---|
| 71 | **Nasce `docs/design/L1 - Token.dc.html`**: colori di stato, inchiostro e fondo, i dodici temi come varianti, geometria, vetro, tipografia, movimento | un valore si scrive una volta sola e altrove si cita. I raggi vivevano solo nel codice: da qui in poi la fonte è il design |
| 72 | **C3 chiusa**: «sette icone in tutto il sistema» diventa «sette per i tipi di task, e altre dove servono», in `L1 - Icone` e `L2 - Sidebar` | applica la decisione 34 |
| 73 | **C4 chiusa**: la tavolozza vecchia esce da `L1 - Moodboard`, `L1 - Temi`, `L2 - Sidebar` e `L2 - TIMELINE` | applica la decisione 46 |
| 74 | **C5 chiusa**: cade il tetto «al massimo due icone colorate per schermo» in `L2 - Bubble`. Al suo posto: ogni bolla porta il colore del suo stato, e un tetto sarebbe una bugia sul numero di cose che stanno succedendo | applica la decisione 41 |
| 75 | **C7 chiusa**: in `L2 - Sidebar` il chip dentro i novanta secondi è **azzurro**, non salvia, perché l'invio non è partito e il task sta ancora lavorando | applica la decisione 61 |

**Restano aperte tre contraddizioni**, e sono valori che i documenti danno in tre versioni:
la misura delle icone (14–16 / 19 / 18–20), il diametro del pallino (8 / 9 / 13) e la
quota della Sidebar (`top 132` contro `44 / 180`). Sono segnate come non decise dentro
`L1 - Token`.

| # | Decisione | Motivo |
|---|---|---|
| 76 | **Il pallino è 9 px**, uno solo per tutto il sistema: la bolla active, la frase più probabile in INPUT, l'ascolto, l'inizio di una cosa sulla Timeline | i documenti ne davano tre — 8, 9 e 13. Il 9 è quello che `L2 - TIMELINE` usa già, e il 13 veniva da `L4`, che è il livello che deve seguire. La tavola nuova di INPUT ne disegnava 9 e 6 senza dichiararlo |
| 77 | **Le icone seguono la legge 06**: 14 px nella bolla e nel chip, 16 nella riga del cassetto e nella cornice | `L1 - Icone` diceva 19, `L2 - Bubble` 18–20. `L0` è l'unico che spiega perché due misure |
| 78 | **La Sidebar è ancorata a `44 / 180`**, il valore di `L0` | `L2 - Sidebar` diceva `top 132`. Chiude `F-107` dell'audit |
| 79 | **Il generatore della tavola dei token sta in `strumenti/genera-token.py`** | i dodici temi sono letti da `temi.css`, non ricopiati: se quel file cambia, la tavola si rigenera. È lo stesso posto dove stava `genera-temi.py`, che era sparito |

Con queste, `L1 - Token` non ha più un blocco «non decisi»: tutti i valori del sistema
hanno un numero solo.

---

## 22 settembre 2026 — il comportamento torna in `docs/`

| # | Decisione | Motivo |
|---|---|---|
| 80 | **`L1 - Moodboard` non è normativo**: è un lavoro di esplorazione e non influenza il design | va dichiarato, perché `L0` definisce il livello 1 come «le fondamenta» che governano tutto ciò che sta sotto. Senza questa riga, chi legge lo tratta come legge — è già successo |
| 81 | **Sette righe di comportamento passano dal design a `docs/`** | applica la decisione 37 |

Dove sono andate:

- **`docs/L01`** — il **preavviso di quindici minuti** per un task programmato (veniva da `L2 - TIMELINE`), e la sezione nuova **«Come si scrive il nome di un task»** con le nove regole per tipo e le quattro cose che nel nome non stanno mai (veniva da `L2 - Bubble`);
- **`docs/L02`** §SYSTEMBAR — il **microfono si spegne e si riaccende premendolo, non a voce**, con le due ragioni;
- **`docs/L02`** §SIDEBAR — flussi e rimandati fra ciò che il cassetto contiene;
- **`docs/L02`** §NOTIFICATIONBAR — ciò che il filtro non promuove **entra muto**, e l'apertura è **un momento, non una schermata**;
- **`docs/L04`** — il tema si sceglie nel profilo, **nessuna selezione automatica dal dispositivo**.

**Rimossa** da `L2 - Sidebar` la frase sulla Memory Engine: era scritta in tre posti, ora
in due, e la terza era quella nel documento sbagliato.

**Resta da fare**: accorciare a un rimando le sei righe che ora vivono sia nel design sia
in `docs/`. `L0` prescrive che «quello che un documento può dire, nessun altro lo ripete».

| # | Decisione | Motivo |
|---|---|---|
| 82 | **Le sei righe rimaste doppie diventano rimandi.** Il design mostra la regola applicata e cita `docs/`; non la ridecide | `L0`: «quello che un documento può dire, nessun altro lo ripete». Il modello è quello che `L2 - TIMELINE` già usava per conto suo — «è logica e non disegno: sta in docs/…, e da qui si cita e non si ricopia» |

Toccati: `L2 - TIMELINE` (due punti, fra cui un rimando a `docs/01-modello §8`, documento
sparito, ora `docs/L01`), `L2 - Bubble`, `L2 - Systembar`, `L2 - Notificationbar` (due
punti), `L1 - Temi`.

| # | Decisione | Motivo |
|---|---|---|
| 83 | **I sette rimandi al corpus scomparso dentro il design sono riportati ai documenti veri**: `docs/01-modello` e `docs/05-interfaccia` diventano `docs/L01` o `docs/L02` secondo cosa affermano | erano citazioni a sostegno di frasi vive, non si potevano cancellare come si è fatto nel codice: andavano lette una per una e reindirizzate |

Toccati: `L2 - Notificationbar` (2), `L2 - Profilebar` (1), `L2 - Sidebar` (2, di cui uno
sul colore → `docs/L01`), `L0 - Sistema` (2). **In tutto `docs/` non resta un solo rimando
al corpus scomparso.**

---

## 22 settembre 2026 — `L2 - Bubble movement` riscritto

Non era un riallineamento: gli eventi erano cambiati sotto. Quattro movimenti, e le
quattro regole che li tengono — ogni movimento ha una causa · nessuna collisione ·
l'acqua non rimbalza · il posto non è assegnato.

| # | Decisione | Motivo |
|---|---|---|
| 84 | **Una bolla nasce dalla dropzone e vola al suo posto** lungo un arco, 420 ms | una bolla nasce da una bozza confermata, che ha un punto di partenza preciso: si vede che quella bolla è la cosa che hai appena composto |
| 85 | **Cambiare active non muove niente**: accende un pallino e ne spegne un altro. La bolla active prende il film più denso e l'ombra più profonda — **nessun cambio di scala, nessuno spostamento** | una scrivania che si riorganizza a ogni frase non si può guardare. E la dimensione racconta il contenuto, mai il rango (legge 10) |
| 86 | **Uscendo, una bolla sfuma sul posto** — film `--liquid-quiet`, scala 94%, 320 ms — e **le vicine si riavvicinano del 40%**, sfalsate di 40 ms: l'onda al contrario | lo spazio liberato viene in parte riassorbito. La scrivania si ricompone senza tornare com'era: una configurazione nuova, non un rimbalzo |

Ripresa dalle sezioni cancellate la **messa da parte**, ora dichiarata come scelta
dell'utente: contrazione leggibile 280 ms, migrazione 420 ms lungo un arco, ancoraggio
`44 / 180`, e il diritto del chip di risalire quando lo nomini.

---

## 22 settembre 2026 — i tre decisi e non scritti, e lo stato dell'audit

| # | Decisione | Motivo |
|---|---|---|
| 87 | **Scritti i tre punti che erano decisi e non scritti**: il formato di `preferences.txt` in `docs/L03` (`F-112`), la proprietà «attraversa il confine» per il Delay in `docs/L01` (`F-006`), la deroga dichiarata e limitata alla legge 11 in `docs/design/L0` (`F-106`) | una decisione che non è scritta non esiste |
| 88 | **Corretto il refuso `assitant:` in `Archivio/users/user_123/preferences.txt`** | il formato ora è documentato, e il file distribuito deve corrispondere |
| 89 | **Il codice si allinea alla documentazione**: è la regola predefinita per chiudere le voci dell'audit che restano. Se durante una correzione emerge un vuoto vero — una cosa che `docs/` non determina — **ci si ferma**, si scrive in `tasks/da_definire.md` e se ne parla | non si sceglie l'opzione ragionevole per andare avanti: un vuoto del genere è una decisione mancante, non un dettaglio di implementazione |

**Segnato in `audit/AUDIT.md`**: un blocco di stato in testa e la marcatura voce per voce.
Sette finding chiusi — `F-006`, `F-104`, `F-105`, `F-106`, `F-109`, `F-110`, `F-112` — e
quattro chiusi in parte: `F-101`, `F-107`, `F-108`, `F-119`. Ogni nota rimanda alla
decisione che l'ha chiusa.

**Resta tutto il codice.** Da cominciare: `F-009`, il confine dell'archivio.

---

## 23 settembre 2026 — la libertà delle bolle, i chip colorati, le quattro taglie

| # | Decisione | Motivo |
|---|---|---|
| 90 | **DESK e SIDEBAR non hanno uno scopo assegnato**: cosa sta dove lo decide l'utente. Il sistema non sposta mai una bolla di sua iniziativa; la sposta solo un'azione dell'utente — accettare una notifica, iniziare un task nuovo, aprire il focus | massima libertà. Sostituisce il criterio proposto il 22 settembre («chi deve muoversi perché la cosa avanzi»), mai adottato |
| 91 | **Il rimandato che scade diventa ambra dove si trova**: non torna in DESK | era l'ultimo automatismo di posizione |
| 92 | **Quando la bolla active è ambra, fra le frasi di INPUT il sistema propone di metterla da parte**. Solo un suggerimento, e solo sulla bolla active o richiamata | le frasi sono l'unico controllo (legge 01) |
| 93 | **Il chip prende per intero il colore del suo stato** e perde il pallino di stato; il verde della active resta. **I chip ambra stanno in cima**, gli altri in ordine di arrivo | ciò che chiede qualcosa a te si vede per primo |
| 94 | **Il focus**: una bolla aperta in focus si allarga e le altre passano in SIDEBAR; uscendo, tornano da sole. È l'unica eccezione alla legge 08 | lo apre l'utente, quindi non è un automatismo |
| 95 | **La bolla documento**: stessa taglia e stesso chip di un task; si apre al centro, non dalla dropzone; esce solo se la chiude l'utente o se viene assorbita in un task. Qualunque tipo di dato può essere mostrato in una bolla documento, solo per vederlo. I tipi di dato restano quelli attuali | chiude la questione aperta il 22 settembre |
| 96 | **Niente si trascina**: né file da fuori né bolle | chiude la questione del trascinamento nella dropzone |
| 97 | **Quattro taglie: Banner, Chip, Task, Focus**, scritte in `docs/design/L0`. «Banner» è il nome della forma usata nella NOTIFICATIONBAR, prima «riga del cassetto». Il Focus prende le misure del vecchio Pannello | le misure non stavano più scritte da nessuna parte dal 22 settembre (§65) |
| 98 | **Il raggio del Banner è 20** anche in `L1 - Token`, che diceva 22 e chiamava la voce «raggio carta» | è la misura disegnata in `L2 - Notificationbar` e scritta in `L0` |
| 99 | **`F-074` cade**: la regola che misurava — «dentro si vede una cosa sola, e vince l'esito» — non esiste più in nessun documento | deciso dal proprietario del progetto nel riallineamento dell'audit |

**Già a posto, niente da scrivere:** `active` al posto di `main` e `T_DRAFT` al posto di
`T_NUOVO` risultano già applicati in `docs/`; restavano solo in `tasks/da_definire.md`.

**Corretto insieme:** in `L0` legge 04, «nessun colore» non dice più «ha finito» — un task
concluso non si vede — e comprende la bolla documento.

---

## 23 settembre 2026 — le icone

| # | Decisione | Motivo |
|---|---|---|
| 100 | **Un task porta l'icona del suo primo dato agganciato**; se non ne ha, quella della conversazione | un solo elenco per due usi: lo stesso segno non ha più due significati |
| 101 | **Le icone di tipo sono dieci**, i tipi di dato disegnati nella dropzone: email, cartella, documento, contatto, persone, conversazione, immagine, sveglia, indirizzo, appuntamento. L'elenco può crescere | applica «sette, ma possono aumentare» e «i tipi di dato restano quelli attuali» |
| 102 | **Le icone di cornice** — microfono, volume, rete, batteria, luogo, campanella, tastiera — sono una famiglia a parte: non contano fra quelle di tipo, non sono un elenco chiuso, e stanno sempre accanto a un valore o a una parola | chiude la domanda dell'ottava icona (`F-085`) |
| 103 | **«posta» diventa «email»** ovunque | scelta del proprietario del progetto |
| 104 | **Il catalogo di `L2 - Bubble` tiene solo i domini che hanno un'icona fra le dieci**: persone, indirizzo e immagine si aggiungono alle sette già portate; escono viaggi, spedizioni, liste, trascrizione, sistema e domande | non interessano al proprietario del progetto |
| 105 | **Le icone disegnate seguono la legge 06**: 14 px le icone di tipo, le targhe, la spunta del flusso e la TIMELINE nelle scene; 16 px la campanella, che è di cornice. 66 icone riportate in `L1 - Icone` (il campione sul vetro), `L2 - Bubble`, `L2 - Notificationbar`, `L3 - Flusso task`, `L4 - Schermate` | le tavole disegnavano 12, 15, 18 e 19 px contro una legge che dice 14 e 16. Resta a 19 solo il confronto fra famiglie di `L1 - Icone`, che è un ingrandimento dichiarato |
| 106 | **Corregge il §100**: l'icona di un task dipende dal tipo di task che si sta svolgendo, e quasi sempre coincide col dato che tratta. Non dal primo dato agganciato | il §100 era un'interpretazione sbagliata, corretta dal proprietario del progetto |
| 107 | **INPUT e PROFILEBAR hanno una geometria propria**, fuori dalle quattro taglie; e i nomi delle taglie sono allineati ovunque — «Pannello» diventa «Focus», le righe del cassetto usano «Banner», «tre taglie» diventa «quattro», «sette facce» diventa «sei». Il rimandato che scade «si accende d'ambra dove si trova», non «torna da sé». Cade l'ultima menzione delle cartine opache in `Liquid glass.md` | §97 aveva scritto «ogni bolla» senza eccezioni, e i documenti portavano ancora i nomi di prima del 23 settembre |

**Scritto in:** `L0` legge 06, `docs/L01` (tabella dei nomi), `L1 - Icone`, `L2 - Bubble`
(targa a 14 px, colore «nella bolla», catalogo con i nomi Lucide), `L2 - Sidebar`,
`L2 - INPUT`, `L2 - Profilebar` (tolto il riquadro «Aperta / l'ottava icona»).

---

## 23 settembre 2026 — le quattro domande rimaste nell'audit

| # | Decisione | Motivo |
|---|---|---|
| 108 | **Rimandata: come si separano i dati di prova da quelli veri** (`F-014`). Oggi `Archivio/users/user_123/` è tutto nel repository, compreso `password: ciao` in `preferences.txt`; nessun documento dice come aggiungere un utente vero senza committarlo | scelta del proprietario del progetto. Resta aperta, e va ripresa prima che l'archivio ospiti dati personali |
| 109 | **La memoria resta, per ora, il documento di contesto** `memory/general.txt` (`F-116`). Il criterio di ciò che è utile salvare non si decide adesso | nel prototipo la memoria è simulata: deciderne il criterio adesso vorrebbe dire deciderlo senza vederla lavorare |
| 110 | **L'orario di lavoro lo inserisce l'utente**; nel prototipo è un valore di prova, 9–13 e 14–18, in `memory/general.txt`, ed è l'orizzonte della TIMELINE (`docs/L02`) | c'erano due valori, 9–19 nel documento dell'utente e 8–19 nella tavola (`F-113`) |
| 111 | **Il suono delle notifiche è `Archivio/system-storage/notification.mp3`**, ricavato da `soundshelfstudio-ui-click-deep-512211.mp3`; `campanello.mp3` esce. `pubblico/suoni/notifica.mp3` resta finché il codice non legge quello nuovo | scelta del proprietario del progetto (`F-115`) |

---

## 23 settembre 2026 — le tre proposte grafiche

Scelte su una tavola di proposta in `tasks/`, poi cancellata. Da portare nei documenti L2,
e per cascata in L3 e L4.

| # | Decisione | Motivo |
|---|---|---|
| 112 | **Col focus il fondo resta com'è**: nessun velo intorno | il focus è un modo di lavorare che dura; il velo è il segno del cassetto, che è «un momento, non una schermata» |
| 113 | **La bolla documento porta la targa**, neutra: icona del tipo e provenienza, nessuno stato | la legge zero vuole «da chi o da dove viene» dentro la bolla |
| 114 | **Nel chip la tinta di stato è velata**: ambra al 30%, azzurro al 22%, sopra il film del vetro | scelta del proprietario del progetto, contro la tinta piena (55% / 42%) disegnata finora in `L2 - Sidebar` |
| 115 | **La taglia Focus è 920 × 690, raggio 30, e cambia scala dentro**: titolo Manrope 200 / 46, corpo 300 / 19, gli elementi agganciati in una colonna di 340 a destra. Occupa tutta la DESK | a 720 px sembrava una normale bolla active; scelta la variante C della proposta, poi cancellata |

**Scritto in:** `L0` (§Le quattro taglie; §SIDEBAR con la tinta velata), `L2 - Bubble` (due
sezioni nuove, «La bolla focus» e «La bolla documento»), `L2 - Sidebar` (chip velati).
Per cascata, `L4 - Schermate` ha due scene nuove: la 5, «In focus», e la 6, «Un documento».

---

## 23 settembre 2026 — il pallino della active

| # | Decisione | Motivo |
|---|---|---|
| 116 | **Il pallino verde della bolla active sta a sinistra della sua icona**, non accanto al titolo. Nel chip, davanti alla sua icona | era un malinteso: i documenti lo mettevano accanto al titolo, e così era stato disegnato |

**Scritto in:** `L0` leggi 02 e 04, `docs/L01` §Il colore di uno stato, `L2 - Bubble` (tre testi,
e il disegno delle sezioni focus e documento), `L4 - Schermate` (scene 5 e 6). La bolla
canonica di `L2 - Bubble` e le scene di `L3` non disegnano il pallino, quindi non cambiano.
| 117 | **La targa di stato prende il colore della sua icona**, a 12 px, peso 500: ambra `#EDA31C`, azzurro `#009DD6`, grigio `#94968E`; senza colore resta `#5A5F58`. Anche l'icona usa il colore di stato vero, non più le versioni scure `#8A5A17` e `#0B5B7A` | scelta del proprietario del progetto su una tavola di prova. Più tenue di prima — contrasto 1,9 per l'ambra, 2,7 per l'azzurro — e per questo più grande: la legge 07 non ammette il grassetto |

**Scritto in:** `L2 - Bubble` (la scheda della targa, il catalogo dei titoli, la tabella dominio ×
stato, le sezioni focus e documento), `L3 - Flusso task` (le targhe e il chip dei novanta
secondi, che segue anche la tinta velata), `L4 - Schermate`. In `L3` le targhe restano alla
misura della scena, che è disegnata in piccolo.

---

## 23 settembre 2026 — il flusso dei task riallineato

| # | Decisione | Motivo |
|---|---|---|
| 118 | **Il flusso passa dalla bozza**: la scena 3 diventa «La bozza» — grigia, nella dropzone, con le sue tessere, mentre INPUT resta libero — e nasce una battuta tua, «La conferma»: dici «vai» e la bolla vola al suo posto lungo un arco, già azzurra. Le battute diventano nove | «Il parto» faceva nascere il task al centro e spegneva INPUT: contraddiceva `docs/L01` (`T_DRAFT`), `docs/L02` (INPUT non si occupa mai) e la decisione §84 |
| 119 | **Mentre il sistema fa una domanda, il task è ambra**: targa «ti sto chiedendo», finché non rispondi | aspetta una tua parola, quindi è `T_ATTESA` (`docs/L01`) |
| 120 | **Tolti dalla tavola il blocco «Deciso insieme · ora è legge» e il riquadro «Ancora aperta»** | una tavola non porta elenchi di decisioni (`AGENTS.md` §11), e tre voci su sei erano superate: «massimo 720 px», «NOTIFICATIONBAR inchiostro diretto», la SIDEBAR con uno scopo assegnato |

**Corretto insieme, in `L3 - Flusso task`:** il pallino dell'ascolto e della frase più probabile
è verde, non azzurro; le frasi della scena «Aspetta te» escono dalla bolla ed entrano in
INPUT; la active non cresce più del 50% ma prende il pallino verde; «AMBRA → SALVIA» diventa
«AMBRA → AZZURRO»; le frasi dette nelle scene 1 e 8 stanno in una bolla di INPUT, non a
inchiostro sul fondo; la partitura ha nove battute.

**Non toccati:** i colori della partitura (ambra per TU, un verde salvia `#7FA083` per SISTEMA)
non sono colori di stato. Il salvia però appartiene alla tavolozza caduta il 22 settembre.

---

## 23 settembre 2026 — le tre voci rimaste aperte

| # | Decisione | Motivo |
|---|---|---|
| 121 | **La targa non porta più l'età** — il tempo trascorso o l'ora a destra, «2 min», «09:41» —: restano icona e stato. Se ne riparla più avanti (`tasks/future.md`) | scelta del proprietario del progetto |
| 122 | **La domanda del sistema è una faccia di INPUT**: «Variante · la domanda» in `L2 - INPUT` — targa ambra «ti sto chiedendo», il pallino dell'ascolto che diventa un anello, le risposte senza pallino | il flusso mostrava una faccia che il componente non aveva |
| 123 | **La partitura di `L3` resta com'è**, col suo salvia per SISTEMA | è solo uno schema, non un colore di stato |

**Scritto in:** `L1 - Icone`, `L1 - Temi`, `L2 - Bubble` (la scheda della targa perde «età a
destra»), `L2 - Sidebar`, `L3 - Flusso task`, `L4 - Schermate` per l'età; `L2 - INPUT` per la
domanda. Le ore d'inizio delle schede di `L3` e l'ora d'arrivo dei banner non sono età di una
targa, e restano.

**Corretto insieme, per cascata:** in `L2 - INPUT` il pallino dell'ascolto e quello della frase
più probabile erano ancora salvia `#4E6B54`; ora sono verdi `#00A878`, come vuole la legge 04.

---

## 23 settembre 2026 — niente posizioni assolute

| # | Decisione | Motivo |
|---|---|---|
| 124 | **In tutto il design non ci sono posizioni assolute: tutto risponde alle dimensioni dello schermo.** INPUT è ancorata in basso a sinistra; la dropzone è appoggiata sopra INPUT; la NOTIFICATIONBAR è ancorata in basso a destra, ed è **l'unica posizione assoluta**, perché apre un cassetto sopra tutti gli altri elementi; la TIMELINE è ancorata in alto a destra; la PROFILEBAR sta subito sotto la TIMELINE; la SIDEBAR subito sotto la PROFILEBAR. **Se crescono, tutto si muove** | detto dal proprietario del progetto, una volta sola: vale come regola, non come proposta. Sostituisce le quote fisse — `44 / 126`, `44 / 180`, «top 132» — e la deroga limitata della legge 11 |

**Da scrivere in `docs/`**, con testo da sottoporre: `L0` legge 08 (le schermate 1440 × 900),
legge 11 (autonomia e deroga), §Le sette aree (le quote), e la cascata su `L1 - Token`,
`L2 - Sidebar`, `L2 - Systembar`, `L2 - Bubble movement`, `L4 - Schermate`.

| # | Decisione | Motivo |
|---|---|---|
| 125 | **Il peso 600 è ammesso, ma solo per il titolo di una bolla e per il WorkMode della PROFILEBAR** (`F-108`). Per il resto vale la legge 07: si cambia scala, non peso | il 600 è già in tutte le bolle e tiene leggibile il titolo sul vetro |

**Scritto il 23 settembre, dopo il §124 e il §125:** `L0` leggi 07 (l'eccezione del 600), 08
(nessuna posizione assoluta, 1440 × 900 come misura di riferimento), 09 (le aree hanno un
ancoraggio, non una posizione), 11 riscritta — «Ancorati ai bordi, impilati fra loro»: due
pile, TIMELINE → PROFILEBAR → SYSTEMBAR → SIDEBAR in alto a destra e INPUT con la dropzone in
basso a sinistra, e la NOTIFICATIONBAR unica posizione assoluta —; le quote delle sette aree;
il Focus «tutta la DESK». Per cascata: `L1 - Token` (Sidebar), `L2 - Sidebar`, `L2 - Systembar`,
`L2 - Bubble movement`.

**Chiusi insieme, dall'audit:** `F-107` (le quote), `F-108` (il 600), `F-114` (la moodboard
passa ai token del vetro), `F-117` (il vetro opaco di riserva anche nello scuro, in
`materiali.css`), `F-118` (margine e ombra separati in `L2 - Sidebar`, e il pallino dell'ascolto
di quella scena verde a 9 px), `F-119` (il confronto delle icone a 14 px, la quota della
SIDEBAR).

| # | Decisione | Motivo |
|---|---|---|
| 126 | **`L1 - Moodboard` resta com'è: è un file a sé**, un riferimento d'atmosfera, e non si allinea per cascata alle regole che cambiano — il «verde salvia sordo» dell'introduzione e «il grassetto non esiste» senza l'eccezione del 600 restano | scelta del proprietario del progetto |

---

## 23 settembre 2026 — `tasks/` riallineato, e si passa al codice

| # | Decisione | Motivo |
|---|---|---|
| 127 | **Il lavoro sul codice va in `tasks/pronti_per_lo_sviluppo.md`**, in ordine di dipendenza: toolchain e confine dell'archivio, l'invio verso l'esterno, il modello dei task, nomi e fonti, le aree dentro il passaggio a React, la chiusura. Da `future.md` escono le voci aperte del codice; la selezione della memoria passa in `da_definire.md`, e la Memory Engine permanente aspetta quella decisione. `bonifica-design.md` è chiuso, e `future.md` dice `T_DRAFT` invece di `T_NUOVO` | chiesto dal proprietario del progetto: `docs/` è la verità assoluta e il codice si adegua. I tre file di `tasks/` descrivevano ancora lo stato di prima del 22 e 23 settembre |

| # | Decisione | Motivo |
|---|---|---|
| 128 | **Il codice si ricostruisce sul modello dei documenti, non si corregge pezzo per pezzo.** Restano i pezzi che non dipendono dal modello — server, connettore OpenRouter, chat raw, archivio, voce, servizi simulati; il motore dei task e l'interfaccia si rifanno in React e Tailwind sui quattro stati, con la Funzione Delay vera dall'inizio. Ordine: il modello coi suoi test, lo scheletro React con le aree ancorate, un componente per volta sui valori di `L1 - Token`, la rimozione del vecchio | scelta del proprietario del progetto. Il codice importato è un altro prodotto — sei luoghi, sei avanzamenti, gruppi, trentadue comandi — e correggere la Delay su un motore da buttare sarebbe lavoro fatto due volte (ponte §7) |

**La ricostruzione, fatta il 23 settembre** (§128). Cosa è cambiato, e perché:

| # | Decisione | Motivo |
|---|---|---|
| 129 | **Il codice vecchio è uscito dal repo**: `src/` di prima (≈ 12 600 righe, compresi `src/prova/` e `base.css`), `pubblico/suoni/` e `pubblico/volto.png`. Il nuovo sta in `src/modello` (i quattro stati, la Delay), `src/ai` (vocabolario chiuso in due ruoli, conversazione e lavoro), `src/ui` (React e Tailwind, il materiale importato da `docs/design/`), `src/voce` (Piper), e le porte in `server/` | §2, §4, §5, §7, §9, §12. Il suono delle notifiche è quello di `Archivio/system-storage/` (§110); il volto di riserva e i campanelli non stavano in nessun documento |
| 130 | **L'archivio si legge soltanto**, e confina alla cartella dell'utente anche sul percorso reale; la scrittura della memoria non esiste più | §5; audit `F-009`, `F-010` |
| 131 | **La chat raw ha un fuso solo**, Europe/Rome, per il nome del file e per l'ora della riga, e il salvataggio riprova finché il server non conferma; un fallimento si dice a schermo | §16 |
| 132 | **Il lavoro di un task non fa uscire niente da solo**: un task che esce dal computer si dichiara pronto e aspetta la parola dell'utente | `docs/L01`: niente parte verso il mondo senza l'utente; la Delay protegge l'invio, non la decisione di farlo |

Le strade provvisorie su quello che `docs/` non dice stanno in `tasks/da_definire.md`
(D1–D11), con sei contraddizioni fra documenti di design trovate strada facendo (C8–C13).

---

## 23 settembre 2026 — le prime risposte sulle strade provvisorie

| # | Decisione | Motivo |
|---|---|---|
| 133 | **Una bozza nuova, a dropzone occupata, manda in SIDEBAR quella che c'era**, ancora bozza: la stessa regola della notifica accettata (`da_definire` D1) | scelta del proprietario del progetto. La dropzone ne mostra una alla volta, e la regola è una sola per chiunque la occupi |
| 134 | **Dopo «no, aspetta» il task torna da solo in DESK** e diventa la active: dirlo è richiamarlo. Resta in SIDEBAR solo se l'utente lo specifica (D3) | scelta del proprietario del progetto. Sostituisce la strada provvisoria, che lo lasciava in SIDEBAR |
| 135 | **Confermate tre strade provvisorie**: il WorkMode non compare finché non è scritto come si calcola (D4); le notifiche del prototipo sono le righe «ricevuta» di `services/email.txt`, tutte promosse (D5); `wallpaper.jpg` non fa da fondo, il fondo è quello del tema (D6) | scelta del proprietario del progetto |
| 136 | **Il tema scuro c'è**: i due materiali stanno in `docs/design/materiali.css` e `temi.css`, e il codice li usa così come sono (D7). Resta da scrivere in `docs/L03` con quale chiave di `preferences.txt` si sceglie | detto dal proprietario del progetto: chiaro e scuro sono definiti nel design. `L1 - Temi` dice «si sceglie nel profilo, non si deduce da niente», e `docs/L03` ha solo `theme` |

| # | Decisione | Motivo |
|---|---|---|
| 137 | **Il materiale si sceglie con una chiave sua**, `material: light \| dark` in `System preferences` di `preferences.txt`; se manca, `light`. Il tema resta `theme`, e le due chiavi sono separate. Scritto in `docs/L03` col testo approvato. Chiude D7 | approvato dal proprietario del progetto. `L1 - Temi`: «un tema è una tinta, non un materiale: vale in chiaro e in scuro», e «si sceglie nel profilo, non si deduce da niente» |

| # | Decisione | Motivo |
|---|---|---|
| 138 | **D2**: il sotto-task compare in DESK. **D8**: il microfono per ora non si preme, è un'implementazione futura (`tasks/future.md`). **D9**: una bozza in SIDEBAR prende il colore della bozza, il grigio. **D10**: l'ultimo scambio resta 12 secondi, se non offre frasi. **D11**: resta in `da_definire`, fermo | scelte del proprietario del progetto |
| 139 | **La TIMELINE è un componente ancora completamente da scrivere**: esiste solo la struttura estetica, e al suo design non è stato attribuito nessun significato | detto dal proprietario del progetto rispondendo a C11. Annotato in `tasks/da_definire.md` (T1) |

| # | Decisione | Motivo |
|---|---|---|
| 140 | **C8**: in `L4 - Schermate`, scene 3 e 4, la bolla «Acme — proposta commerciale» perde il divisore e le tre frasi: le frasi stanno in INPUT | approvato dal proprietario del progetto: `L4` si allinea a `L3 - Flusso task` e `L2 - Bubble` |
| 141 | **C9**: in `L2 - Bubble` il titolo della bolla d'esempio e la sua didascalia passano da 27 a 21 px, il valore di `L1 - Token`. Per cascata, i quattro titoli di bolla di `L4 - Schermate` passano da 17 a 21. `L1 - Icone`, che ne disegna tre a 27, è di livello 1 e resta segnalato | approvato dal proprietario del progetto |
| 142 | **C12**: la legge 07 ammette il 600 anche per l'«adesso» della TIMELINE | approvato dal proprietario del progetto. `L2 - TIMELINE` diceva già 20/600 |
| 143 | **D12**: il chip di una bozza è velato di grigio al 22%, in `L0` §SIDEBAR e in `L2 - Sidebar` | approvato dal proprietario del progetto. Il grigio sta alla stessa luminanza dell'azzurro (legge 04) |
| 144 | **C10**: in `L2 - Notificationbar` la notifica presa «nasce bozza, nella dropzone», e cade il riquadro «Passato e futuro nella stessa fila» | approvato dal proprietario del progetto: allinea il documento a `docs/L01` e `docs/L02` (bozza in `T_DRAFT`, rimandati in SIDEBAR) |
| 145 | **C13**: la SIDEBAR non ha un tetto di quattro chip. Se ne mostrano quanti ne entrano fino alla campanella della NOTIFICATIONBAR; quelli che non entrano diventano un numero, **senza colore** | scelta del proprietario del progetto. Con l'ambra in cima, i chip nascosti tendono a non essere ambra; il numero resta comunque neutro. **Il testo di `L2 - Sidebar` va sottoposto** |

| # | Decisione | Motivo |
|---|---|---|
| 146 | **C13, scritto**: in `L2 - Sidebar` la riga di testa dice «larghezza intrinseca · fino alla campanella», e il riquadro «Oltre quattro si raggruppa» diventa «Fin dove c'è posto» col testo approvato | approvato dal proprietario del progetto; applica §145 |
| 147 | **C14**: le tre bolle di `L1 - Icone` hanno il titolo a 21 px, come `L1 - Token` | approvato dal proprietario del progetto. Due documenti dello stesso livello si contraddicevano: la cascata non poteva risolverlo |

| # | Decisione | Motivo |
|---|---|---|
| 148 | **Le schede di conformità**, componente per componente, in `tasks/conformita.md`: misurate con gli stili calcolati, sulle tavole e sull'app. Ventuno divergenze corrette nel codice — fra cui le classi del sistema, che scavalcavano le misure di Tailwind; la DESK e il focus, che finivano sotto la pila di INPUT; l'ora della PROFILEBAR, che era monospaziata. Cinque contraddizioni fra documenti annotate (C15–C19) | chiesto dal proprietario del progetto (`pronti_per_lo_sviluppo.md` §5). Il codice segue il documento; dove due documenti si contraddicono segue il livello più basso, e la voce resta da decidere |

| # | Decisione | Motivo |
|---|---|---|
| 149 | **C15–C19 si chiudono coi criteri già dati.** C15: la targa della bolla focus in `L2 - Bubble` si disegna a 11, come dice la sua didascalia. C16: in `L2 - Sidebar` cade lo stato «Active a schermo intero» — un task non appare in due aree (legge 03) — e con lui la frase che lo annunciava; gli stati diventano cinque. C18: in `L2 - TIMELINE` le targhe passano da 600 a 500 (legge 07). C19: la targa dell'«adesso» e quella della bolla d'esempio di `L2 - TIMELINE` lasciano il salvia per l'azzurro dello stato in corso, e la targa d'esempio prende la misura di `L2 - Bubble`. Per cascata, in `L4 - Schermate` le dodici targhe della TIMELINE passano a 500, e quelle dell'«adesso» dal blu scuro `#0B5B7A` all'azzurro. C17 non era una contraddizione fra documenti: è il codice che si adegua a `L2 - INPUT` | il proprietario del progetto aveva già risposto: il disegno si allinea alla regola scritta e al livello più basso (§140–§144), e la tavolozza vecchia esce (§73) |

| # | Decisione | Motivo |
|---|---|---|
| 150 | **Le voci ✗ delle schede sono fatte**: i movimenti di `L2 - Bubble movement` — la nascita lungo un arco dalla dropzone, l'onda delle vicine, la contrazione e il volo verso il chip, il richiamo che risale dove stava, l'uscita sul posto a scala 94% con le vicine che si riavvicinano, la dissolvenza di 180 ms della active —; la chiusura del cassetto coi ritardi invertiti; i chip al 45% durante la raccolta; le tessere di carta, vetro e tratteggio. Con `prefers-reduced-motion` non si muove niente | chiesto dal proprietario del progetto. Ogni movimento ha la sua causa scritta nel documento, e nessuno è decorativo |

| # | Decisione | Motivo |
|---|---|---|
| 151 | **I test dell'interfaccia e delle porte.** `npm run test:interfaccia` (Playwright, nel Chrome di sistema, a 1440 × 900): le aree e i loro ancoraggi, il flusso della mail a Elena di `L3` con la Funzione Delay su un orologio finto, le misure delle schede di conformità, il cassetto, i movimenti, il movimento ridotto. L'AI è a copione e l'archivio è di prova: nessun test tocca i dati dell'utente. `npm test` aggiunge le porte del server — il confine dell'archivio, anche attraverso un collegamento — e la chat raw, sul server e nel browser | chiesto dal proprietario del progetto (`pronti_per_lo_sviluppo.md` §6). Una scheda di conformità scritta una volta sola non ferma la prossima deriva; un test sì |

---

## 23 settembre 2026 — il fornitore dell'AI

| # | Decisione | Motivo |
|---|---|---|
| 152 | **Il prototipo usa le API di Anthropic direttamente**, non più OpenRouter. È la decisione di oggi, e può cambiare. Il testo di `docs/L04` va sottoposto prima di scriverlo | scelta del proprietario del progetto, dopo la prima prova dal vivo: i modelli gratuiti di OpenRouter erano limitati o sovraccarichi a monte, e passando da OpenRouter si perdono il ripiego sui rifiuti e il controllo dello sforzo. Con Anthropic diretta restano la cache del prompt e i parametri nativi |
| 153 | **`docs/L04` dice Anthropic, e il codice lo segue.** Scritto in `L04` il testo approvato: le API di Anthropic chiamate direttamente dal processo Node, Anthropic unico provider del prototipo, l'architettura aperta ad altri provider come OpenAI o OpenRouter. Il server legge `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL` (predefinito `claude-sonnet-5`) da `.env`; il ramo `chat/completions` di OpenRouter esce. Ogni passo va senza ragionamento e con sforzo basso, e il prompt di sistema resta in cache un'ora | approvato dal proprietario del progetto (§152). Un passo è una mossa sola sullo schermo: conta la prontezza. Il ragionamento resta fuori perché i passi passati tornano al modello ricostruiti dalle mosse, e un blocco di pensiero non si saprebbe rimandare |
| 154 | **Le proposte ancora aperte vanno in `tasks/future.md`**, insieme alle altre voci: togliere il passo `guarda`, le frasi di sicurezza senza l'AI, OneAssist come faccia di OpenClaw, chiamare Claude come fa Open Design | chiesto dal proprietario del progetto. Restano proposte: nessuna è decisa, e quella sulle frasi di sicurezza tocca `docs/L01` |
