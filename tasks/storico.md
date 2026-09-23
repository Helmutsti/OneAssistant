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

**Scritto in:** `L0` legge 06, `docs/L01` (tabella dei nomi), `L1 - Icone`, `L2 - Bubble`
(targa a 14 px, colore «nella bolla», catalogo con i nomi Lucide), `L2 - Sidebar`,
`L2 - INPUT`, `L2 - Profilebar` (tolto il riquadro «Aperta / l'ottava icona»).
