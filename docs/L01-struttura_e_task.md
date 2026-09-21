# Il flusso principale

> **Stato del prototipo.** Memory Engine e servizi descrivono il modello previsto.
> Nell'implementazione attuale non esistono ancora una memoria selettiva gestita
> automaticamente né integrazioni reali con servizi esterni: le informazioni necessarie
> vengono simulate tramite documenti di contesto forniti all'AI. La chat raw resta invece
> un archivio integrale e separato per ciascun utente.


**Prompt**: testo grezzo
**Task**: particella fondamentale di lavoro e comunicazione tra utente e sistema. Il task è il mattone base che costituisce le attività che l'utente svolge.
**Memory Engine**: archivio permanente e selettivo in cui l'assistente conserva le conoscenze utili apprese sull'utente. Ogni utente ha una memoria separata: l'assistente può leggere e modificare esclusivamente quella dell'utente attivo. Un task o una conversazione possono produrre informazioni da salvare, ma non vengono memorizzati automaticamente per intero. Il confine di ciò che è utile salvare deve ancora essere definito.
**Chat raw**: archivio completo degli scambi fra utente e assistente. È separato dalla Memory Engine e conserva integralmente ciò che viene detto o scritto.
**Contesto**: si tratta di tutto l'insieme di informazioni, dati, e documenti chiave per lo svolgimento della richiesta
**Richiesta**: si tratta della richiesta primaria che l'utente fa come: "invia questa email a marco!"
**Servizi**: SI tratta di sistemi esterni che l'assistente può interrogare e usare per svolgere i propri task oppure come output. "Salva questo contatto" oppure "invia questa email a marco" sono task che contemplano come output i servizi "Contatti" e "Mail". Oppure "Cerca questo documento" riguarda il servizio "Filesystem". Se il sistema è il corpo e l'assistente il cervello, I servizi sono gli arti.

Il flusso di un input è il seguente:

- Nel prototipo l'utente scrive il prompt tramite tastiera e preme invio. La ricezione
  vocale dell'utente appartiene a una fase futura
- Il prompt viene salvato, insieme al resto dello scambio, nell'archivio della chat raw dell'utente attivo
- Lo stesso prompt viene **esploso**. L'esplosione della frase serve a fissare i concetti astratti e la richiesta in modo separato:
	- Vengono estratte tutte le informazioni dalla richiesta andando a costituire un "contesto"
	- Viene estratta la richiesta reale 
- Il contesto viene arricchito con la Memory Engine dell'utente attivo (la memoria rappresenta la conoscenza utile e permanente che l'assistente ha selezionato per quell'utente)
- Il contesto viene arricchito anche con lo stato attuale dei lavori e cosa è presente sulla DESK.
- Il contesto viene arricchito interrogando anche i servizi se necessario che sono l'ultimo anello della catena di competenza dell'assistente.
- Richiesta e contesto formano un task

Nel prototipo, i passaggi che consultano Memory Engine e servizi leggono invece i
documenti di contesto disponibili. Questi documenti rappresentano dati fittizi e non
costituiscono ancora memoria selettiva gestita automaticamente o stato reale di un
servizio. La chat raw non viene sostituita da questi documenti.

# Gli stati dei task
Un task può assumere quattro stati durante la sua vita:

| stato            | vuol dire                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| `T_NUOVO`        | la richiesta esiste con il suo contesto, e nessuno ci ha ancora lavorato |
| `T_LAVORAZIONE`  | il sistema capisce, cerca, raccoglie ed esegue la richiesta              |
| `T_ATTESA`       | non sta lavorando, e aspetta un input esterno                            |
| `T_CONCLUSIONE`  | ha terminato il suo scopo                                                |

Comprendere la richiesta ed eseguirla appartengono entrambe a `T_LAVORAZIONE`: sono
passaggi interni e atomici dal punto di vista dell'utente, quindi non costituiscono due
stati osservabili differenti.

Un task passa da `T_NUOVO` a `T_LAVORAZIONE`. Da `T_LAVORAZIONE` può raggiungere
`T_ATTESA`, se ha bisogno di un input esterno, oppure `T_CONCLUSIONE`, se ha terminato il
suo scopo. Quando l'input atteso arriva, richiesta o contesto vengono aggiornati e il task
torna in `T_LAVORAZIONE`. Durante la lavorazione può anche nascere un sotto-task autonomo
in `T_NUOVO`.

## Funzione Delay

La **Funzione Delay** è una precauzione applicata a qualsiasi servizio che invia,
pubblica o trasmette qualcosa verso l'esterno, non soltanto al servizio email. Non si
applica alle operazioni di sola lettura o ricerca.

Per impostazione predefinita, dopo la conclusione del task il sistema attende 90 secondi
prima di effettuare realmente l'invio. Durante questa finestra l'utente può usare «no,
aspetta»: l'invio viene annullato prima che raggiunga il servizio e il task può essere
modificato.

L'utente può chiedere esplicitamente di bypassare la Funzione Delay. In questo caso la
chiamata al servizio viene eseguita immediatamente e l'invio è definitivo e non
annullabile dal sistema. Il bypass vale soltanto per l'invio per cui è stato richiesto e
non cambia l'impostazione predefinita dei task successivi.

# Importante
Ogni scambio deve avvenire tramite comunicazione tra l'utente e l'assistente. Essa può essere via chat o per via parlata e può anche essere ibrida. L'assistente può parlare e l'utente può scrivere e viceversa.
