# Archivio

L'archivio rappresenta lo **spazio di archiviazione previsto** del sistema.

> **Stato del prototipo.** La struttura seguente organizza anche i dati locali usati dal
> prototipo, ma non costituisce ancora una Memory Engine o un'integrazione reale con i
> servizi. L'AI riceve documenti di contesto appartenenti esclusivamente all'utente
> attivo: la memoria simulata è in `memory/general.txt`, mentre i documenti che simulano
> i servizi sono nella cartella `services` dello stesso utente. La chat raw resta in un
> archivio distinto.

Nel prototipo l'intero archivio è contenuto nella cartella `Archivio/` della root del
progetto. La struttura è questa:

Archivio
	system-storage
		campanello.mp3
	users
		user_123
			chat-raw
				YYYY-MM-DD.jsonl
			preferences.txt
			system.txt
			filesystem.txt
			memory
				general.txt
			services
				contacts.txt
				email.txt
			filesystem
				Home
					wallpaper.jpg
					avatar.jpg
				Services
	system-settings.txt

**system-settings.txt**: Impostazioni generali del sistema. Tutte le impostazioni che non sono specifiche dell'utente. In questo momento è vuoto.
**system-storage**: Si tratta della cartella che contiene i file condivisi del sistema, come il suono delle notifiche
**campanello.mp3**: Suono delle notifiche
**users**: Cartella che contiene i dati degli utenti
**user_123**: Cartella dell'unico utente del prototipo, considerato l'utente principale
del sistema. Il nome è il suo identificatore tecnico. Il supporto per più utenti verrà
definito in futuro.
**chat-raw**: Archivio completo degli scambi fra questo utente e l'assistente. Conserva integralmente la chat ed è separato dalla Memory Engine. Nel prototipo contiene un file JSONL per giorno, denominato `YYYY-MM-DD.jsonl`. Ogni riga rappresenta un singolo messaggio e contiene almeno data e ora, ruolo (`user` oppure `assistant`) e testo originale. I messaggi vengono aggiunti in ordine cronologico senza riscrivere quelli precedenti.
**memory**: Cartella riservata alla Memory Engine permanente e selettiva di questo utente. Nel prototipo contiene `general.txt`, il documento di contesto che simula la memoria. Nel prodotto futuro conterrà soltanto le conoscenze che l'assistente considera utili per aiutare meglio l'utente. Una conversazione o l'esecuzione di un task possono produrre informazioni da salvare, ma il task non viene archiviato automaticamente nella memoria. Il criterio che stabilisce quali informazioni siano utili non è ancora definito.
	La memoria non deve mai essere confusa tra utenti. L'assistente deve caricare, conoscere e modificare esclusivamente la memoria dell'utente attivo.
**general.txt**: Documento che fornisce all'AI la memoria simulata dell'utente attivo durante il prototipo. Non è ancora una memoria selettiva gestita automaticamente.
**services**: Cartella che contiene configurazioni e dati legati ai servizi. Nel prototipo i documenti al suo interno sono contesto testuale e sostituiscono le chiamate ai servizi reali.
**preferences.txt**: Profilo e preferenze stabili dell'utente, comprese lingua, tema,
luoghi conosciuti e configurazione della voce dell'assistente. Nel prototipo l'eventuale
campo `password` è soltanto un dato locale: non implementa autenticazione e non viene
inviato al provider AI.

Il file è in **inglese**, e questo è il formato. Le chiavi sono quelle, l'indentazione è a
tabulazione, e i due punti separano chiave e valore.

```
Utente:
	name:             nome e cognome dell'utente
	datebirth:        AAAA-M-G
	sex:              female | male
	language:         italian | english
	password:         dato locale, non è autenticazione e non raggiunge il provider
System preferences
	focuses:          uno per riga, «indirizzo - nome del luogo»
	theme:            il nome di uno dei dodici temi
assistant:
	reading:          on | off — la lettura ad alta voce
	settings:
		voice:            femminile | maschile
		name:             come si chiama l'assistente. Lo sceglie l'utente
		assistant gender: female | male
	copione:          prosa libera: come parla
```

Quello che il file non dichiara resta al valore predefinito. Una chiave che il file scrive e
il sistema non conosce **non viene ignorata in silenzio**: è un errore di formato, e va detto.
**system.txt**: Stato corrente del sistema per questo utente, compresi microfono,
batteria, rete, volume e posizione. Nel prototipo è un documento di contesto aggiornato
manualmente, non una lettura reale della macchina.
**filesystem.txt**: Documento di impostazioni e contesto del servizio filesystem.
**filesystem**: è la cartella di memoria del servizio filesystem. un servizio può avere una cartella annessa se necessario

ps: filesystem è l'unico servizio che viene di base attivato e non è possibile da non usare. Se non ci fosse il sistema non funzionerebbe. altrimenti tutto sarebbe inutile
