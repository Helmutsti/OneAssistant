# Aspetti tecnici

Questa lista rappresenta l'elenco di decisioni tecniche prese finora.

## Stato attuale del progetto

OneAssist è attualmente un **prototipo**, non un sistema completo. Memory Engine e servizi
indicano l'architettura verso cui si vuole arrivare, ma non sono ancora implementati come
memoria selettiva automatica o integrazioni esterne. In questa fase memoria e dati dei
servizi sono sostituiti da documenti di contesto testuali forniti all'AI. La chat raw è
invece un archivio distinto che conserva integralmente gli scambi dell'utente attivo.

## Decisioni tecniche

- Il progetto è Node 24.
- Nel prototipo l'utente comunica soltanto tramite tastiera e input testuale. La ricezione
  vocale con Whisper e il tracking degli occhi restano possibilità future e non fanno
  parte dello scope attuale.
- Il prompt viene analizzato dall'AI tramite un connettore API per OpenRouter. Nel
  prototipo OpenRouter è l'unico provider. In futuro l'architettura dovrà permettere di
  collegare anche le API di OpenAI e Anthropic.
- Memory Engine e servizi reali restano obiettivi futuri. Nel prototipo i dati
  necessari sono contenuti nei documenti dell'utente attivo: `memory/general.txt` simula
  la memoria e i file in `services` simulano i servizi. Non devono essere interpretati
  come persistenza intelligente o integrazioni già funzionanti.
- La chat raw viene salvata separatamente nella cartella `chat-raw` dell'utente attivo e
  non viene usata automaticamente come memoria semantica. Usa un file JSONL per giorno,
  con una riga per messaggio contenente data e ora, ruolo e testo originale.
- Il prototipo è un sito React, Vite e Tailwind. Il prodotto dovrà diventare
  un'applicazione desktop, ma il contenitore desktop sarà deciso in seguito.
- L'interfaccia web non legge direttamente percorsi arbitrari del disco. L'accesso ai
  documenti di contesto locali passa attraverso il processo Node, che espone al frontend
  soltanto i file appartenenti all'utente attivo.
- Nel prototipo esiste un solo utente, considerato unico e principale. Il suo `user_id`
  è `user_123` e viene configurato lato Node. Tutti i suoi dati si trovano in
  `Archivio/users/user_123`; autenticazione, selezione e cambio utente appartengono a una
  fase futura.
- `preferences.txt` descrive profilo e preferenze dell'utente; `system.txt` simula lo
  stato corrente della macchina per quell'utente. Entrambi vengono letti localmente dal
  processo Node.
- La Funzione Delay rinvia di 90 secondi la chiamata reale per ogni operazione che invia
  o pubblica contenuti verso l'esterno. Un bypass richiesto esplicitamente dall'utente
  produce invece un invio immediato e non annullabile.
- Il tema si sceglie nel profilo dell'utente. **Nessuna selezione automatica dal tema del
  dispositivo**: il sistema copre lo schermo intero, e cambiare materiale da solo mentre
  l'utente guarda è una cosa che succede sotto le mani.
- Nel prototipo è presente la voce dell'assistente con Piper e Serena HIGH. In futuro si
  potrà adottare un modello vocale più performante e a pagamento.
