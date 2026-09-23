# Future

## Regola per il codice importato

La vecchia versione del progetto è stata importata selettivamente e la sua copia locale
è stata rimossa. Il codice presente nella root può essere riutilizzato soltanto dopo
l'allineamento alla documentazione presente nella root di questo progetto. La
documentazione, il design, `CLAUDE.md`, i dati di esempio e le decisioni incorporate nei
commenti della vecchia versione non sono fonti di verità.

## Gap da chiarire nella documentazione root

- [x] **Confine del prototipo.** La documentazione distingue il comportamento previsto
  dallo stato attuale: memoria e servizi non sono ancora sistemi operativi e nel
  prototipo sono rappresentati da documenti di contesto forniti all'AI. La chat raw è un
  archivio integrale separato e non viene simulata dai documenti di contesto.
- [x] **Posizione dei documenti di contesto.** Nell'archivio del prototipo,
  `memory/general.txt` simula la memoria e i documenti in `services` simulano i servizi. La chat raw resta
  separata nella cartella `chat-raw`.
- [x] **Modello degli stati.** Il modello definitivo ha quattro stati: `T_DRAFT`,
  `T_LAVORAZIONE`, `T_ATTESA` e `T_CONCLUSIONE` (`T_DRAFT` ha preso il posto di `T_NUOVO`,
  storico §25). Comprensione ed esecuzione sono passaggi
  interni e atomici per l'utente, entrambi compresi in `T_LAVORAZIONE`.
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

Le voci ancora aperte sono passate il 23 settembre 2026 in
`tasks/pronti_per_lo_sviluppo.md`, in ordine di lavoro. Qui restano quelle fatte.

- [x] **Preparare l'importazione selettiva.** Sono stati copiati soltanto i sorgenti e
  gli asset tecnici ancora utili. Le vecchie specifiche non sono state adottate come
  documentazione del progetto e la relativa copia locale è stata rimossa.
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
- [x] **Allineare il connettore AI.** Adattare la porta esistente alla decisione sul
  provider: OpenRouter nel prototipo, con futura estensione a OpenAI e Anthropic.
  Mantenere le chiavi esclusivamente lato server e un fallback visibile.
- [x] **Allineare input e voce allo scope corrente.** Rendere completa e affidabile la
  tastiera; mantenere Piper soltanto se compatibile con la documentazione e non simulare
  ascolto vocale o tracking finché non sono implementati.

## Da riprendere più avanti

- [ ] **L'età nella targa.** Tolta il 23 settembre 2026 (storico §121): «2 min», «09:41» a destra
  della targa. Forse utile per quello che arriva da fuori, rumore per i task aperti
  dall'utente. Da riprendere quando si sarà vista una scrivania piena.
- [ ] **Il microfono che si preme.** `docs/L02` §SYSTEMBAR dice che si spegne e si riaccende
  premendolo; nel prototipo non c'è ascolto, quindi per ora premerlo non fa niente e la
  SYSTEMBAR lo mostra soltanto (storico §138). Arriva con la voce dell'utente.
- [ ] **Togliere il passo `guarda` all'inizio di ogni frase.** Oggi ogni frase costa tre
  chiamate al modello: guarda lo schermo, fa la mossa, risponde. Se la prima richiesta
  portasse già lo schermo, dopo il prefisso in cache, le chiamate scenderebbero a due e
  l'attesa di circa un terzo. Tocca soltanto il codice.
- [ ] **Le frasi di sicurezza senza l'AI.** «no, aspetta» fermerebbe l'invio subito, nel
  codice, senza chiedere al modello: oggi funziona, ma passa da due chiamate e qualche
  secondo mentre i 90 secondi della Funzione Delay scorrono. Tocca `docs/L01`: il testo va
  sottoposto prima di scriverlo.
- [ ] **OneAssist come faccia di OpenClaw.** Un agente autonomo come OpenClaw potrebbe
  lavorare dietro OneAssist come un servizio: OneAssist resta l'unico che muove lo schermo,
  e mostra quello che l'agente fa come task, con la Funzione Delay e le conferme di sempre.
  È la strada che tiene il controllo e la visibilità dell'utente.
- [ ] **Chiamare Claude come fa Open Design.** Open Design avvia il `claude` da riga di
  comando come processo separato, con gli strumenti esposti da un server MCP. Da valutare
  solo se servisse usare un abbonamento invece dei crediti delle API: i termini d'uso non
  sono verificati, e ogni chiamata aprirebbe una conversazione nuova.
