# Pronti per lo sviluppo

Lavoro sul codice che non aspetta più nessuna decisione: `docs/` dice già cosa deve
succedere, e il codice si adegua. Le voci vengono da `tasks/future.md` (§Importazione e
adattamento del codice) e da `audit/AUDIT.md`; l'ordine è per **dipendenza**, non per
severità, ed è quello di `AUDIT.md` §1 e del ponte (`tasks/ponte_codice_documentazione.md`
§6).

Una voce si chiude quando il codice fa quello che dice il documento e c'è una verifica
che lo mostra. Chiusa, si spunta qui, si annota in `tasks/storico.md` e si segna il
finding in `audit/AUDIT.md`. Se durante il lavoro emerge una cosa che `docs/` non
determina, ci si ferma e la si scrive in `tasks/da_definire.md`.

> **23 settembre 2026 · ricostruzione** (storico §128, §129). Il codice è stato rifatto
> sul modello di `docs/`: le voci spuntate sono fatte e verificate — 36 test su modello,
> Delay e giro dell'AI (`npm test`), le porte del server provate dal vivo, il flusso della
> mail a Elena di `L3 - Flusso task` percorso a schermo con l'AI simulata. Le scelte
> provvisorie su quello che `docs/` non dice sono in `tasks/da_definire.md` (D1–D11).

---

## 1 · Prima di tutto

- [x] **Ripristinare la toolchain.** Installare le dipendenze, far passare `tsc --noEmit` e
  la build, e far girare gli scenari esistenti per sapere da dove si parte. Serve a
  verificare ogni voce successiva.
- [x] **Il confine dell'archivio** (`F-009`). Lettura e scrittura non escono da
  `Archivio/users/user_123/` né con `..` né con percorsi assoluti (`docs/L03`).

## 2 · L'invio verso l'esterno

- [x] **La Funzione Delay** (`F-001` … `F-005`). `T_CONCLUSIONE` → 90 secondi → chiamata al
  servizio → esito. «No, aspetta» dentro la finestra impedisce davvero la chiamata; fuori
  finestra non dichiara il falso. Un invio alla volta per task, niente doppi. Il bypass
  esplicito è immediato, definitivo e vale per quell'invio solo; il prompt di sistema lo
  nomina (`docs/L01` §Funzione Delay, `docs/L04`).
- [x] **Il cancello verso il mondo.** Ogni azione esterna passa dal motore e dalla conferma
  dell'utente.
- [x] **La grammatica chiusa.** Il catalogo tipizzato delle mosse resta; escono quelle che
  `docs/` non prevede, e AI principale e secondari ricevono solo gli strumenti permessi.

## 3 · Il modello dei task

- [x] **I quattro stati** (`F-015` … `F-018`): `T_DRAFT`, `T_LAVORAZIONE`, `T_ATTESA`,
  `T_CONCLUSIONE` (`docs/L01`). Un task sta in DESK oppure in SIDEBAR, mai in entrambe.
  Escono `CARTA` e `MEMORIA` come luoghi; `ORARIO` è un chip con un'ora in SIDEBAR.
- [x] **Il flusso passa dalla bozza.** Il task nasce in `T_DRAFT` nella dropzone, una bozza
  alla volta, e parte solo alla conferma; anche una notifica accettata produce una bozza
  (storico §25, §29, §30, §118–§122).
- [x] **Niente archiviazione automatica.** Un task concluso lascia l'interfaccia senza
  diventare memoria.
- [x] **Il sistema non sposta mai una bolla di sua iniziativa**; il rimandato che scade
  diventa ambra dove si trova (`docs/L02` §DESK e §SIDEBAR, storico §90, §91).

## 4 · Nomi e fonti

- [x] **I rimandi alle vecchie fonti** (`F-100`, parte in codice di `F-101`). Commenti e
  collegamenti puntano solo a `docs/`; dove la destinazione non esiste il rimando diventa
  `// DA DOCUMENTARE: <cosa>`. Via i file vuoti.
- [x] **La terminologia.** `DESK` per l'area centrale e `SIDEBAR` per i chip, ovunque nel
  codice e nell'interfaccia; escono i nomi e i concetti che `docs/` non ha.

## 5 · Le aree

- [x] **La NOTIFICATIONBAR canonica.** Esce la modalità precedente col flag `conCassetto`.
  La notifica è un oggetto senza luogo e senza stato; diventa task solo con «me ne
  occupo», passando dalla bozza. Ciò che il filtro non promuove entra muto.
- [x] **I rimandati in SIDEBAR.** La NOTIFICATIONBAR contiene solo ciò che arriva dal mondo.
- [x] **Il passaggio a React, Vite e Tailwind** (storico §4). Il livello di disegno si
  riscrive una volta sola, e i componenti qui sotto si rifanno **dentro** la riscrittura,
  uno per volta, ognuno con la sua scheda «numero del documento → numero del codice →
  esito». Il materiale entra dai file di `docs/design/`, senza copie.
- [x] **PROFILEBAR, BUBBLE, NOTIFICATIONBAR, SIDEBAR, INPUT, SYSTEMBAR, DESK**, in
  quest'ordine (ponte §6, Fase 2), sui valori di `L1 - Token` e sulle decisioni del 23
  settembre elencate in `F-120`: quattro taglie, focus 920 × 690, niente posizioni
  assolute tranne la NOTIFICATIONBAR, pallino 9 px a sinistra dell'icona, icone di tipo a
  14 / 16 px, targa nel colore dell'icona e senza età, chip colorato per intero con
  l'ambra in cima, niente trascinamento, la bolla documento.
  *Fatte le schede*, in `tasks/conformita.md` (storico §148, §149): ventidue divergenze
  corrette nel codice, cinque contraddizioni chiuse nei documenti. Restano le voci ✗ qui sotto.
- [x] **I movimenti di `L2 - Bubble movement`**: la bozza che vola dalla dropzone lungo un
  arco, l'onda delle vicine, la contrazione e la migrazione in SIDEBAR, l'uscita a scala 94%
  con le vicine che si riavvicinano, la transizione della active.
- [x] **Le tre voci ✗ delle schede**: la chiusura del cassetto coi ritardi invertiti; i chip
  al 45% quando INPUT cresce per la raccolta; le tessere di tre materiali (carta, vetro, filo
  tratteggiato).
- [x] **Il suono e l'orario di prova**: `Archivio/system-storage/notification.mp3`, e
  l'orario 9–13 e 14–18 letto da `memory/general.txt` (storico §110, §111).

## 6 · Chiusura

- [ ] **Il runtime supportato**, dopo il passaggio a React (storico §15).
- [x] **Scenari e verifiche riscritti** per DESK, SIDEBAR, NOTIFICATIONBAR, doppio
  archivio, confine utente, persistenza e transizioni definitive; test automatici per
  modello, motore, archivio e confini dei servizi. *Fatto* (storico §151): `npm test` — 48
  test su modello, Delay, AI, porte del server e chat raw; `npm run test:interfaccia` — 38
  test nel browser su aree, flusso della mail a Elena, schede di conformità, cassetto e
  movimenti, con l'AI a copione e un archivio di prova.
- [ ] **Verifica finale di conformità.** Il codice non contiene comportamenti che `docs/`
  non definisce, e ogni area osservabile corrisponde alla documentazione. Le voci
  rimanenti di `audit/AUDIT.md` sono chiuse.

---

**Non è qui, perché aspetta una decisione:** la Memory Engine permanente. Dipende da come
l'AI sceglie cosa entra in memoria, che è aperto in `tasks/da_definire.md`.
