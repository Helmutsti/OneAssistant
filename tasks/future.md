# Future

## Regola per l'importazione della vecchia versione

La cartella `OneAssistant/` contiene una vecchia versione del progetto. Da questa cartella
si può importare e riutilizzare **soltanto il codice**. La sua documentazione, il design,
`CLAUDE.md`, i dati di esempio e le decisioni incorporate nei commenti non sono fonti di
verità. Il codice importato deve essere adattato alla documentazione presente nella root
di questo progetto.

## Gap da chiarire nella documentazione root

- [x] **Confine del prototipo.** La documentazione distingue il comportamento previsto
  dallo stato attuale: memoria e servizi non sono ancora sistemi operativi e nel
  prototipo sono rappresentati da documenti di contesto forniti all'AI. La chat raw è un
  archivio integrale separato e non viene simulata dai documenti di contesto.
- [x] **Posizione dei documenti di contesto.** Nell'archivio del prototipo,
  `memory/general.txt` simula la memoria e i documenti in `services` simulano i servizi. La chat raw resta
  separata nella cartella `chat-raw`.
- [x] **Modello degli stati.** Il modello definitivo ha quattro stati: `T_NUOVO`,
  `T_LAVORAZIONE`, `T_ATTESA` e `T_CONCLUSIONE`. Comprensione ed esecuzione sono passaggi
  interni e atomici per l'utente, entrambi compresi in `T_LAVORAZIONE`.
- [ ] **Selezione della memoria.** Definire il confine con cui l'AI decide quali
  informazioni di una conversazione o di un task siano abbastanza utili da entrare nella
  Memory Engine. Fino a quella decisione, il meccanismo deve restare esplicitamente
  sperimentale e non deve salvare automaticamente i task.
- [x] **Struttura della chat raw.** Usare un file `YYYY-MM-DD.jsonl` per giorno nella
  cartella `chat-raw` dell'utente. Ogni riga contiene almeno data e ora, ruolo e testo
  originale. La chat raw resta distinta dalla Memory Engine e viene scritta in ordine
  cronologico.
- [x] **Funzione Delay.** Ogni invio o pubblicazione verso l'esterno viene trattenuto per
  90 secondi prima della chiamata reale al servizio. «No, aspetta» lo annulla durante la
  finestra. L'utente può richiedere esplicitamente un bypass per ottenere un invio
  immediato, definitivo e non annullabile. Letture e ricerche non usano il Delay.
- [x] **Utente del prototipo.** Esiste un solo utente, considerato unico e principale. Il
  suo identificatore è `user_123`, configurato lato Node, e il frontend non può fornire percorsi arbitrari.
  Autenticazione, selezione, cambio utente e isolamento multiutente restano futuri.
- [x] **Stack del prototipo.** Usare Node 24, React, Vite e Tailwind. Il prototipo resta
  un sito web; il contenitore dell'applicazione desktop sarà deciso in futuro.
- [x] **Provider AI del prototipo.** Usare OpenRouter. In futuro predisporre connettori
  anche per le API di OpenAI e Anthropic, mantenendo esplicita la scelta del provider.
- [x] **Input del prototipo.** L'utente usa soltanto tastiera e scrittura. Sono incluse le
  risposte vocali dell'assistente; voce dell'utente e tracking degli occhi restano futuri.

## Importazione e adattamento del codice

- [x] **Preparare l'importazione selettiva.** Copiare dalla vecchia `OneAssistant/`
  soltanto i sorgenti e gli asset tecnici ancora utili. Non importare `docs/`,
  `docs_old/`, `design/`, `CLAUDE.md` o altre specifiche della vecchia versione.
- [ ] **Rimuovere i riferimenti alle vecchie fonti.** Aggiornare commenti, nomi e
  collegamenti del codice affinché puntino esclusivamente alla documentazione root.
- [ ] **Allineare la terminologia.** Usare `DESK` per l'area centrale e `SIDEBAR` per i
  chip in tutto il codice e nell'interfaccia. Eliminare i nomi e i concetti UI non
  presenti nella documentazione nuova.
- [ ] **Ricostruire il modello dei task.** Adeguare tipi, invarianti e transizioni agli
  stati definitivi della root. Rimuovere `CARTA` e `MEMORIA` dai luoghi dei task.
  `ORARIO` deve essere rappresentato nella SIDEBAR come chip con un'ora.
- [ ] **Rimuovere l'archiviazione automatica dei task.** Un task concluso deve lasciare
  l'interfaccia senza diventare una voce di memoria. Se produce un invio o una
  pubblicazione, deve restare annullabile durante la Funzione Delay e lasciare
  l'interfaccia dopo l'invio effettivo o dopo il bypass esplicito.
- [ ] **Rendere canonica la nuova NOTIFICATIONBAR.** Eliminare la modalità precedente e
  il feature flag `conCassetto`. Una notifica deve essere un oggetto senza luogo e senza
  stato, e diventare task soltanto dopo «me ne occupo».
- [ ] **Spostare i rimandati nella SIDEBAR.** La NOTIFICATIONBAR deve contenere soltanto
  ciò che arriva dal mondo. I task rimandati appartengono alla SIDEBAR e tornano
  automaticamente quando matura il tempo.
- [ ] **Adattare DESK e fuoco.** Conservare la scrivania libera e deterministica, con una
  sola bolla `MAIN` e le altre aperte senza duplicazioni. Posizioni e movimento devono
  rispettare L0-L4 della root.
- [ ] **Adattare TIMELINE, PROFILEBAR e SYSTEMBAR.** Riutilizzare la logica compatibile,
  ma applicare geometria, ordine e competenze definite nella documentazione root.
- [ ] **Implementare la Memory Engine permanente.** Riattivare la persistenza delle
  informazioni selezionate, separata per utente. Le operazioni di salvataggio non devono
  essere no-op e al riavvio devono essere rilette tutte le conoscenze persistenti.
- [x] **Implementare la chat raw permanente.** Salvare integralmente ogni scambio in
  `Archivio/users/user_123/chat-raw/YYYY-MM-DD.jsonl`, con una riga per messaggio
  contenente data e ora, ruolo e testo originale, senza usarlo automaticamente come
  memoria semantica.
- [x] **Applicare il confine utente del prototipo.** Ogni lettura e scrittura è vincolata
  all'unico utente principale `user_123`. Il processo Node costruisce i percorsi e rifiuta
  utenti o percorsi arbitrari forniti dal client.
- [x] **Adeguare la struttura dell'archivio.** Migrare da `Archivio/<id>/...` alla
  struttura `Archivio/users/user_123/chat-raw`, `memory`, `services` e `filesystem`
  descritta in `docs/L03-archivio.md`, mantenendo separati dati di sistema e dati utente.
- [ ] **Implementare la Funzione Delay.** Trattenere per 90 secondi ogni invio o
  pubblicazione prima di chiamare il servizio, permettendo l'annullamento reale. Gestire
  il bypass esplicito come invio immediato e non annullabile, evitando divergenze tra
  stato locale e stato del servizio.
- [ ] **Mantenere il cancello verso il mondo.** Conservare il passaggio obbligatorio dal
  motore e la conferma dell'utente prima delle azioni esterne non autorizzate.
- [ ] **Conservare la grammatica chiusa.** Riutilizzare il catalogo tipizzato delle mosse,
  rimuovendo quelle incompatibili e verificando che AI principale e secondari ricevano
  soltanto gli strumenti permessi.
- [x] **Allineare il connettore AI.** Adattare la porta esistente alla decisione sul
  provider: OpenRouter nel prototipo, con futura estensione a OpenAI e Anthropic.
  Mantenere le chiavi esclusivamente lato server e un fallback visibile.
- [x] **Allineare input e voce allo scope corrente.** Rendere completa e affidabile la
  tastiera; mantenere Piper soltanto se compatibile con la documentazione e non simulare
  ascolto vocale o tracking finché non sono implementati.
- [ ] **Aggiornare scenari e verifiche.** Riscrivere gli scenari della vecchia versione
  perché controllino DESK, SIDEBAR, Notificationbar, doppio archivio, isolamento utenti,
  persistenza e transizioni definitive.
- [ ] **Ripristinare la toolchain.** Installare le dipendenze della versione importata,
  eseguire il controllo TypeScript e aggiungere test automatici per modello, motore,
  archivio e confini dei servizi.
- [ ] **Verifica finale di conformità.** Considerare completata la migrazione soltanto
  quando il codice non contiene più comportamenti derivati dalla documentazione interna
  alla vecchia `OneAssistant/` e ogni area osservabile corrisponde alla documentazione
  della root.
