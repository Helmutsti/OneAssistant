# AGENTS.md

Regole vincolanti per chiunque — persona o agente — lavori su questo repository.
Non sono consigli. Chi non le rispetta produce lavoro da buttare.

## 0 · Prima di qualunque cosa

Leggi `README.md`. Definisce a cosa serve ogni cartella, ed è la regola che queste
istruzioni rendono obbligatoria.

---

## 1 · Dove va cosa

| Cartella | Cosa contiene | Cosa **non** contiene |
|---|---|---|
| `docs/` | la verità assoluta: decisioni **già prese** su comportamento, struttura, archivio, tecnica | proposte, bozze, ipotesi, alternative |
| `docs/design/` | **solo** grafica: estetica, materiali, colori, misure, movimenti | la logica — quando una cosa diventa un'altra, chi decide, cosa entra nel sistema |
| `tasks/` | lo stato dei lavori: cosa c'è da decidere, incongruenze, task futuri, proposte da approvare | decisioni già prese e consolidate |
| `audit/` | la distanza misurata fra documentazione e codice | documentazione. L'audit **non è** una fonte di verità |
| `src/` | il codice | decisioni. Il codice non decide niente |

I quattro file di `tasks/` hanno ruoli distinti, descritti in `README.md`:
`da_definire.md`, `pronti_per_lo_sviluppo.md`, `future.md`, `storico.md`.

**Prodotto e design non sono la stessa cosa.** `docs/L00`–`L05` è documentazione di
prodotto; `docs/design/` è documentazione di design, con una sua gerarchia L0–L4. Quando
scrivi «i documenti», di' sempre di quale dei due parli.

## 2 · L'ordine di lavoro

**Prima la documentazione di prodotto, poi il design, poi il codice si adatta.**
Mai il contrario. Una correzione al codice che anticipa una decisione documentale è
lavoro da rifare.

---

## 3 · Non si modifica `docs/` senza autorizzazione

**Mai.** Nemmeno per un refuso, nemmeno per una correzione ovvia, nemmeno quando il
documento si contraddice da solo.

Quando una modifica sembra necessaria:

1. **fermarsi;**
2. sottoporre il **testo esatto** — il «ora» e il «proposto», per intero, nel corpo della
   risposta. Non un riassunto di cosa cambierà;
3. **attendere** il via libera esplicito del proprietario del progetto;
4. scrivere **solo** quello che è stato visto e approvato;
5. annotare la decisione in `tasks/storico.md`.

Lo stesso vale per `docs/design/`, con in più la **regola di cascata** dichiarata in
`docs/design/L0 - Sistema.md`: chi modifica un documento aggiorna nella stessa risposta
tutte le occorrenze nei numeri più alti, e la cascata sale soltanto.

## 4 · Una proposta non entra in `docs/`

Un documento che dice «bozza», «proposta», «da approvare», «ipotesi» o «opzione» va in
`tasks/`. Se finisce in `docs/` diventa normativo senza che nessuno l'abbia approvato:
è già successo, ed è il motivo per cui questo file esiste.

Un documento di comportamento non va in `docs/design/` nemmeno se parla anche di pixel.

## 5 · Ogni decisione passa da `tasks/storico.md`

Si scrive **prima** di toccare `docs/`, non dopo. Serve a rispondere a una domanda sola:
perché una nozione è stata ridisegnata in modo diverso. Data, decisione, motivo,
conseguenza. Ciò che resta da chiarire va in `tasks/da_definire.md`.

---

## 6 · Quando codice e documento divergono

Ha ragione il documento. Due sole chiusure possibili:

- **il codice si adegua al documento**, oppure
- **il documento viene esteso** — e allora si passa dal §3 e dal §5.

Non esiste la terza via di lasciare il codice diverso e dichiararlo altrove.

## 7 · Non si inventa

Se una decisione non risulta da `docs/` o da `tasks/storico.md`, **non è stata presa**.
Si chiede. Non si deduce dal codice, non si deduce da un commento, non si sceglie
l'opzione più ragionevole per andare avanti.

## 8 · Si dichiara cosa si è verificato

Un'affermazione di conformità vale solo se dice **come** è stata verificata. Leggere una
costante non è verificare un comportamento: è già successo due volte in questo repo che
una conformità dichiarata fosse falsa — vedi `audit/AUDIT.md` §3.3.

Se un documento cita una regola di un altro documento, **controllare che quella regola
esista davvero**: è già successo che una tavola di livello 2 citasse una legge inesistente
di livello 0 per poi dichiarare di superarla.

## 9 · I problemi si dicono prima, non dopo

Se una decisione appena presa ne rompe un'altra, o contraddice un documento che non si
stava guardando, **fermarsi e dirlo prima di eseguire**. E cercarlo attivamente: prima di
toccare un concetto, cercarlo in tutto `docs/` — non solo nel file che si sta aprendo.

---

## 10 · Come si chiedono le decisioni

- **Italiano semplice.** Niente codici, sigle o percorsi di file dentro una domanda che
  deve essere capita al volo.
- Portare sempre: la **citazione letterale** del punto in questione con file e riga, cosa
  fa il codice, e le vie possibili con il costo di ciascuna. Chi decide deve poter
  verificare, non fidarsi di un riassunto.
- **Una decisione alla volta**, o al massimo quattro raggruppate. Se una risposta ne
  sblocca altre, dirlo.
- **Dare una raccomandazione**, non un elenco neutro di opzioni.

## 11 · Le tavole di design

- Una tavola **mostra il componente**. Non contiene ragionamenti, alternative scartate,
  tabelle di decisioni né **riferimenti al codice**. Quella roba sta in `tasks/`.
- Ogni variante disegnata **una volta sola**, nella grafica finale.
- Le alternative si propongono **visivamente affiancate**, con una raccomandazione.
  Appena una è scelta, le altre si cancellano.

## 12 · Come si risponde

- Andare al punto. Niente nozioni non richieste.
- A lavoro finito: cosa è stato scritto e dove, in poche righe.
- **Non committare** finché non viene chiesto.
