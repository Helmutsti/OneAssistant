# OneAssistant · prototipo MCP visivo

Prototipo spostato qui da `~/Documents/Codex/2026-09-26/.../prototipo-visual-mcp` il 28 settembre 2026. La finestra è indipendente e il server MCP è locale. La resa usa i componenti, gli stati e i token del [file Figma OneAssistant](https://www.figma.com/design/oH8gSnlH23y5tkdwHNQ3Dp). Il vecchio motore non viene avviato.

## Avvio

1. `npm install --ignore-scripts`
2. `npm start`
3. `npm run finestra`: apre la finestra in Brave in modalità kiosk (schermo intero senza barre; si esce con ⌘Q). Lo sfondo è `public/sfondo.jpg`, sfocato via CSS.
4. In un secondo terminale, `npm run demo`.

Il tool MCP `render_scene` riceve una scena dichiarativa con Bubble, Bubble item, Vassoio, Timeline, Profilebar, Systembar e Notificationbar. Ogni invio con revisione crescente aggiorna la finestra via Server-Sent Events. Nessun elemento visivo è cliccabile. La demo invia sette revisioni: Base, In corso, In attesa, Focus, quattro Bubble sulla scrivania, contrazione di una Bubble verso il Vassoio e chiusura delle notifiche. Termina con tre Bubble visibili e un Chip nel Vassoio, a destra tra Systembar e Notificationbar. Dopo ogni chiamata MCP controlla lo stato ricevuto dal server. La conversazione avviene in ChatGPT: questa finestra non contiene un campo di input.

Le Bubble sono posizionate liberamente sulla scrivania, con posti stabili e senza una griglia visiva. Quando ne arriva una, le vicine si scostano e rientrano parzialmente; quando viene messa da parte, si contrae e migra verso il Chip nel Vassoio. Il movimento riprende tempi, curva, onda e arco da `src/ui/movimento.ts` del progetto originale. Il ridimensionamento della finestra ricalcola i posti per evitare che le Bubble escano dall'area disponibile.

L'endpoint HTTP è `http://127.0.0.1:4318/mcp`. Con `node server.mjs --stdio`, lo stesso processo espone anche MCP via stdin/stdout e avvia la finestra su quella porta; i messaggi di servizio vanno su stderr per non interferire con il protocollo. Codex può avviare questa modalità come server MCP locale dopo averla registrata e riavviato l'app. ChatGPT sul web non è ancora collegato. Lo stato resta in memoria finché il server rimane avviato. Le varianti e i contenuti visibili dipendono dai dati della scena. L'immagine del volto della Profilebar proviene dall'asset Figma.

## Più chat, un'unica finestra

Ogni chat di ChatGPT Work avvia il proprio processo `server.mjs --stdio`. Il primo apre la porta 4318 e la finestra; i successivi non si chiudono più per `EADDRINUSE`, ma inoltrano le scene al primo (`POST /scene`). Se il primo si chiude, il processo successivo che invia una scena prende la porta e ricomincia da una scena vuota; la finestra aperta si ricollega da sola.

`revision` è facoltativa: se manca o è già superata, il server usa la successiva e lo scrive nella risposta. I Chip senza Bubble e gli ID duplicati vengono corretti e segnalati, non rifiutati.

Le immagini accettano un percorso locale (assoluto o relativo alla radice del repository): il server lo serve da `/file?path=…`, solo per file immagine dentro il repository o nelle cartelle elencate in `ONEASSISTANT_IMAGE_ROOTS` (separate da `:`).

## Collegamento all'host locale

Su questo computer il server è registrato come `oneassistant_visual` nella configurazione MCP di Codex. `codex mcp get oneassistant_visual` mostra il comando configurato. Dopo aver scelto **Restart** nella sezione **Settings → MCP servers** dell'app, una nuova conversazione può usare `render_scene` direttamente; l'avvio del processo apre anche la porta della finestra. Il catalogo degli strumenti di una conversazione già in corso non si aggiorna automaticamente. Il collegamento a ChatGPT sul web richiede una configurazione separata e un endpoint raggiungibile dal servizio.
