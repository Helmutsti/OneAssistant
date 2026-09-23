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
- Richiesta e contesto formano un task, che nasce in `T_DRAFT`: compare nella dropzone
  di INPUT e non parte finché l'utente non lo conferma

Nel prototipo, i passaggi che consultano Memory Engine e servizi leggono invece i
documenti di contesto disponibili. Questi documenti rappresentano dati fittizi e non
costituiscono ancora memoria selettiva gestita automaticamente o stato reale di un
servizio. La chat raw non viene sostituita da questi documenti.

# Gli stati dei task
Un task può assumere quattro stati durante la sua vita:

| stato            | vuol dire                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| `T_DRAFT`        | il task si sta componendo: esiste nella dropzone di INPUT, si può ancora cambiare o scartare, e nessuno gli ha detto di partire |
| `T_LAVORAZIONE`  | il sistema capisce, cerca, raccoglie ed esegue la richiesta              |
| `T_ATTESA`       | non sta lavorando, e aspetta un input esterno                            |
| `T_CONCLUSIONE`  | ha terminato il suo scopo                                                |

Comprendere la richiesta ed eseguirla appartengono entrambe a `T_LAVORAZIONE`: sono
passaggi interni e atomici dal punto di vista dell'utente, quindi non costituiscono due
stati osservabili differenti.

Un task passa da `T_DRAFT` a `T_LAVORAZIONE` quando l'utente lo conferma: in quel momento
lascia la dropzone. Una bozza non confermata non diventa mai un task e non lascia traccia.
Da `T_LAVORAZIONE` può raggiungere `T_ATTESA`, se ha bisogno di un input esterno, oppure
`T_CONCLUSIONE`, se ha terminato il suo scopo. Quando l'input atteso arriva, richiesta o
contesto vengono aggiornati e il task torna in `T_LAVORAZIONE`. Durante la lavorazione può
anche nascere un sotto-task autonomo, che **nasce già in `T_LAVORAZIONE`**: non è la bozza
di nessuno e non passa dalla dropzone.

`T_DRAFT` è uno stato, non un posto. La dropzone mostra **una bozza alla volta**; le altre
restano in SIDEBAR, sganciate e ancora in bozza.

Anche una notifica esterna che l'utente accetta produce un task in `T_DRAFT`, mai un lavoro
già avviato: ciò che arriva da fuori passa sempre per un passaggio di ragionamento che
l'utente può vedere, correggere o scartare. Se in quel momento la dropzone è occupata, la
bozza in corso si sposta in SIDEBAR e la nuova prende il suo posto.

## Il colore di uno stato

Il colore dice **in che stato è un task**, e nient'altro. Non è categoria, non è gusto, non
è decorazione: due task dello stesso tipo hanno colori diversi se sono a punti diversi del
loro percorso.

| colore | quando | vuol dire |
| --- | --- | --- |
| **grigio** | `T_DRAFT` | non è ancora partito: si sta componendo, e lo puoi ancora cambiare o scartare |
| **azzurro** | `T_LAVORAZIONE` | il sistema sta lavorando |
| **ambra** | `T_ATTESA` | la palla è tua: il task non va avanti finché non dici qualcosa |
| **nessun colore** | `T_ATTESA · di un'ora` | l'hai rimandato: non chiede niente finché l'ora non scade, poi diventa ambra dove si trova |

Un task **fermo**, che non può proseguire da solo, resta ambra: non ha un colore suo perché
a sbloccarlo sei comunque tu.

Un task in `T_CONCLUSIONE` non compare nella tabella perché **non si vede**: quando ha finito
svanisce sul posto e lascia l'interfaccia. Non si contrae, non migra, non lascia un segno.
Se ha prodotto un invio verso l'esterno, resta in SIDEBAR per i 90 secondi della Funzione
Delay — e in quella finestra è ancora `T_LAVORAZIONE`, azzurro, perché l'invio non è partito.

Il **verde** non è un colore di stato: è il segno della bolla **active**, quella a cui stai
parlando, e sta a sinistra della sua icona. Nessun task è mai verde.

I valori esatti e il modo in cui i colori si comportano sul vetro stanno in
`docs/design/L0 - Sistema`, legge 04.

Un task programmato per un'ora futura entra nell'orizzonte dell'utente **quindici minuti
prima**: è la soglia oltre la quale il sistema lo considera imminente e lo dichiara. Prima
di quel preavviso esiste, ma non chiede niente.

## Come si scrive il nome di un task

Il nome è l'unica riga che l'utente legge sempre, ed è la parola con cui richiama il task a
voce. Una riga sola, al massimo 32 caratteri: quel che avanza è contesto, non nome.

| tipo | come si scrive |
| --- | --- |
| email | sempre il destinatario, mai l'oggetto per esteso |
| documento | il nome del file riscritto in italiano leggibile |
| ricerca | il titolo è la domanda, non il numero di risultati |
| conversazione | il conteggio nel nome è ammesso solo qui |
| denaro | la cifra sta sempre nel nome, valuta per esteso |
| persone | al plurale; per una persona sola vince il volto |
| trascrizione | la frase dell'utente, fra virgolette, com'è uscita |
| domanda | il titolo è la domanda, la risposta sta nel corpo |
| media | l'anteprima resta desaturata finché non la si nomina |

Nel nome non stanno mai: il nome dell'app, l'ora, lo stato scritto a parole, i puntini di
sospensione. Quelle quattro cose hanno già un posto.

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

Il Delay non vale per tutte le operazioni: vale per quelle che **attraversano il confine**
del computer — mandare, pubblicare, trasmettere. Leggere, cercare, calcolare e salvare in
locale non lo attraversano, e partono subito.

Ogni destinazione dichiara quindi una sola cosa: **se attraversa il confine o no.** Non
esiste un elenco di eccezioni da ricordare, e non si deduce dal nome del servizio: una
destinazione nuova la dichiara, o il Delay non la protegge.
