# L'archivio

**Il repo è il codice. Questa cartella sono i dati.** Oggi stanno vicine e domani no —
e tutto qui dentro è fatto perché quel giorno costi una riga.

Non è un dettaglio di ordine: `src/` sa *cosa* è un utente, non *dove* sta. Fra i due
c'è una porta sola, `/archivio`, servita da `vite.config.ts`. Il giorno che l'archivio
se ne va — su un'altra macchina, in un bucket, dentro Electron — cambia `RADICE` in
quella porta, e non cambia nient'altro.

## Com'è fatto

```
Archivio/
  impostazioni.txt            chi c'è su questa macchina, e chi entra se non dici niente
  <user_id>/                  l'id è il nome della cartella, e basta quello
    settings.txt              chi sei, che voce, che colori, cos'è acceso
    storage/
      avatar.jpg              la tua faccia, in PROFILEBAR e nello schermo bloccato
      background.jpg          l'immagine sotto il vetro
    memory/                   quello che l'assistente si ricorda di te
      seme.txt                il contesto minimo da cui parte ogni sessione ← l'unico letto
      Persone/ Ricordi/ Progetti/    \
      osservato.md                    | sospesi dal 18 settembre 2026
      preferenze.md                  /
    services/
      filesystem/
        settings.txt          acceso, e quali cartelle vede
        folders/              i tuoi file, quelli che il servizio può aprire
      calendar/
        settings.txt          acceso, e da dove arrivano gli eventi
```

Un utente si aggiunge così: si crea la sua cartella, si scrive il suo `settings.txt`, e
si mette il suo id in `impostazioni.txt`. Si entra come lui con `?utente=<id>`.

## Il seme, e l'archivio sospeso

**Dal 18 settembre 2026 l'archivio strutturato è sospeso** (`docs/07-memoria §6`): la
memoria nasce a ogni sessione, muore con lei, e non tocca il disco. Le cartelle che ci
sono già **non si toccano e non si perdono** — semplicemente nessuno le legge finché
dura la sospensione.

Quello che si legge è uno solo: `memory/seme.txt`, il contesto minimo. Si parte copiando
`seme.esempio.txt`, che dice anche come si scrive — prosa, una riga un fatto, corto. Se
non c'è, non è un guasto: è un assistente che ti incontra oggi per la prima volta.

## Le due regole che non si negoziano

**Fra utenti non passa niente** (`docs/07-memoria §7`). Prima era un prefisso dentro
una mappa condivisa; adesso sono cartelle diverse, e un `Disco` è di una persona sola.
È una garanzia più forte proprio perché è più stupida: per non sapere niente di te,
basta non avere il tuo disco.

**Questa cartella non è servita dal sito.** `vite.config.ts` ha `publicDir: 'pubblico'`,
non `Archivio`, e in più la nega esplicitamente in `server.fs.deny` — perché `/@fs/…`
ci arriverebbe lo stesso. Ci si passa **solo** dalla porta, che sa cosa può uscire e
dove si può scrivere.

Il perché è già successo, tre volte in un giorno, il 17 settembre 2026: qualunque cosa
finisca nel `publicDir` la scarica chiunque apra la pagina. Con una chiave dentro era
grave; con `memory/` dentro sarebbe peggio.

## Cosa può fare la porta, e cosa no

| | |
|---|---|
| `GET /archivio/impostazioni.txt` | chi c'è |
| `GET /archivio/<id>/settings.txt` | il profilo |
| `GET /archivio/<id>/storage/avatar.jpg` | la roba tua |
| `GET /archivio/<id>/memory` | tutta la memoria in una volta, all'avvio |
| `POST /archivio/<id>/memory` | scrive **un** file, e solo dentro `memory/` |

**Non sa cancellare**, e non deve: l'archivio non cancella niente — una riga smentita
resta, barrata (`docs/07-memoria §10`) — e una porta che non sa cancellare non può
cancellare la cosa sbagliata.

## I percorsi dentro `settings.txt`

Si scrivono relativi, e la regola è una riga: **quello che comincia per `storage/` è
tuo.** Tutto il resto è dell'app, e sta in `pubblico/`.

```
profilepicture: "storage/avatar.jpg"      → /archivio/<id>/storage/avatar.jpg
background:     "storage/background.jpg"  → /archivio/<id>/storage/background.jpg
sound:          "suoni/notifica.mp3"      → /suoni/notifica.mp3
```

Restano due strade di cortesia, perché un file scritto a mano raccoglie di tutto: un
indirizzo in rete (`https://…`) passa com'è, e di un percorso assoluto incollato da una
macchina vera si tiene solo il nome — un'immagine si cerca in `storage/`, un suono in
`suoni/`. Se il file è lì funziona; se no non si vede, ed è giusto così: **una risorsa
che non è nell'archivio non è dell'archivio**.

## Cosa si versiona e cosa no

**Niente di tuo.** Dal 17 settembre 2026 git non guarda dentro questa cartella: non il
tuo nome, non la tua faccia, non lo sfondo, non dove sei, non quello che ti sei segnato.

Restano nel repo due cose sole, e non appartengono a nessuno:

- **questo file**, che spiega com'è fatto l'archivio;
- **`esempio/`** e **`impostazioni.esempio.txt`**, un profilo vuoto con la forma giusta.

Prima ci stava la struttura vera — i profili e i loro `settings.txt` — perché un clone
dovesse trovare qualcuno già pronto. Il prezzo era che la foto e la posizione di chi
lavora qui finivano **nella storia di git**, e da lì non se ne vanno cancellando il file
domani. Non valeva il comodo che dava.

### Far partire un clone

```
cp Archivio/impostazioni.esempio.txt Archivio/impostazioni.txt
cp -r Archivio/esempio Archivio/<il-tuo-id>
```

Poi scrivi il tuo id in `impostazioni.txt` — sotto `predefinito:` e in `utenti:` — e il
tuo nome in `<il-tuo-id>/settings.txt`. La faccia e lo sfondo sono facoltativi: senza,
vale il volto di riserva in `pubblico/volto.png`.

Quando l'archivio uscirà davvero dal repo — altra macchina, bucket, Electron — anche
l'esempio se ne andrà con lui: cambia `RADICE` nella porta, e non cambia nient'altro.

## Quello che non sta qui

Le **chiavi** stanno in `.env` alla radice, ed è una scelta: è l'unico file del progetto
che Vite nega da sé con un 403. Metterle qui dentro significherebbe appendere la loro
sicurezza a una riga di `fs.deny` che un giorno qualcuno cancella. Vedi `env.example`.
