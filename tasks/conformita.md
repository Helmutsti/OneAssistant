# Schede di conformità

Un componente per volta: il valore del documento, quello misurato nel codice, l'esito.
Misurato il 23 settembre 2026 a 1440 × 900, tema chiaro, con gli stili calcolati dal
browser: sulle tavole di `docs/design/` e sull'app che gira, con l'AI simulata. Il metodo
sta in fondo.

**Esiti.** ✓ conforme · **corretto** era diverso, il codice è stato adeguato in questa
passata · ✗ manca · ⚠ il documento si contraddice, o contraddice un livello più basso: il
codice segue il livello più basso, e la voce va decisa.

---

## PROFILEBAR · `L2 - Profilebar`, `docs/design/profilebar.css`

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | destra 44, 22 sotto la TIMELINE (L0 legge 11) | destra 44, 22 sotto | ✓ |
| Velo | bolla, raggio 30, padding 8 / 12 / 8 / 24, gap 16, altezza 60 | 30 · 8 12 8 24 · 16 · 60 | ✓ |
| Larghezza | si stringe sul contenuto | intrinseca (286) | ✓ |
| Contesto | due righe a 13, allineate a destra, gap 4, interlinea 18 | 13 · destra · 4 · 18 | ✓ |
| Ora | Manrope 13 / 500, cifre tabellari | era IBM Plex Mono | **corretto** |
| Ora e data | gap 12 | 12 | ✓ |
| Data e luogo | inchiostro tenue `#3E423C` | `#3E423C` | ✓ |
| Icona del luogo | 14, gap 4 | 14 · 4 | ✓ |
| Volto | 44, cerchio, anello di luce 2 | 44 · 50% · anello 2 | ✓ |
| WorkMode | 600, a 12 dal luogo | non compare (storico §135) | ✓ |

## BUBBLE · `L2 - Bubble`, `L1 - Token`

| | Documento | Codice | Esito |
|---|---|---|---|
| Ricetta | raggio 26, `--liquid-film`, `--liquid-optics`, `--liquid-edge`, padding 20 / 22 | 26 · vetro · 20 22 | ✓ |
| Larghezza | 348–452 secondo il contenuto (L0 §Le quattro taglie) | 348–452 | ✓ |
| Targa | IBM Plex Mono 12 / 500 / +0.16em, maiuscolo, nel colore dell'icona | 12 · 500 · 1.92px · colore di stato | ✓ |
| Icona di tipo | 14 (legge 06) | 14 | ✓ |
| Pallino della active | 9, `#00A878`, a sinistra dell'icona | 9 · verde · a sinistra | ✓ |
| Titolo | Manrope 600 / 21 / −0.035em, inchiostro sempre | 21 · 600 · era −0.02em | **corretto** |
| Corpo | Manrope 400 / 15,5, inchiostro al 70%, due righe | 15,5 · 400 · 70% · due righe | ✓ |
| Frasi | non nella bolla: stanno in INPUT (tabella «Chi la declina») | in INPUT | ✓ |
| Active | film `--liquid-focus`, nessun cambio di misura né di posto | `vetro-fuoco` | ✓ |
| Lavora | il contorno pulsa ogni 4 s | 4 s | ✓ |
| Bolla documento | targa neutra: tipo e provenienza | era nel colore dell'inchiostro pieno, ora fioco | **corretto** |

**Focus** · `L2 - Bubble` §La bolla focus, `L0` §Le quattro taglie

| | Documento | Codice | Esito |
|---|---|---|---|
| Misura | 920 × 690 a 1440 × 900, raggio 30, padding 38 / 42, `--liquid-focus` | 920 × 690 · 30 · 38 42 · fuoco | ✓ |
| Fondo | «tutta la DESK» | copriva la dropzone quando c'era: ora finisce 22 sopra la pila di INPUT | **corretto** |
| Titolo | Manrope 200 / 46 / −0.035em | 46 · 200 · −1.61px | ✓ |
| Corpo | Manrope 300 / 19, inchiostro all'80% | 19 · 300 · 80% · interlinea 30,4 | ✓ |
| Colonna destra | 340, gap 40 | 340 · 40 | ✓ |
| Tessere della colonna | Manrope 13,5 / 500 | erano 14 / 400 | **corretto** |
| Targa | IBM Plex Mono 11 (la tavola ora la disegna così, storico §149) | 11 | ✓ |
| Icona | 16 | 16 | ✓ |

## NOTIFICATIONBAR · `L2 - Notificationbar`, `L0` §NOTIFICATIONBAR

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | destra 44, fondo 44, l'unica posizione assoluta | 44 · 44 · assoluta | ✓ |
| Campanella | 44, vetro | 44 · vetro | ✓ |
| Badge | 16, IBM Plex Mono 11 / 500, su ambra | era 10 / 400 | **corretto** |
| Badge | conta solo quello che è promosso e nuovo, e l'apertura lo azzera | così (test del modello) | ✓ |
| Cassetto | 400 di larghezza, al massimo 420 di altezza | 400 · 420 | ✓ |
| Banner | bolla, raggio 20, padding 13 / 16 | 20 · 13 16 | ✓ |
| Mittente | IBM Plex Mono 10 / 400, +0.14em, maiuscolo, inchiostro fioco | era 12 / 500 / +0.16em | **corretto** |
| Testo | Manrope 14, interlinea 18,9, `--testo-carta` | era 15 | **corretto** |
| Muta | c'è, attenuata, non conta nel badge | opacità 62%, fuori dal badge | ✓ |
| Velo | nero 54%, saturate .62, brightness .86, 380 ms | così | ✓ |
| Apertura | 420 ms dal basso a destra, righe sfalsate di 40 ms | così | ✓ |
| Squillo | 640 ms, una volta sola | così | ✓ |
| Chiusura | i ritardi si invertono | chiude di colpo | ✗ |

## SIDEBAR · `L2 - Sidebar`, `L0` §SIDEBAR

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | 22 sotto la SYSTEMBAR; scende se la pila sopra cresce | 22 · segue la pila | ✓ |
| Chip | alto 30, raggio 20, padding 0 / 14, gap 9, largo quanto il contenuto | 30 · 20 · 0 14 · 9 · intrinseco | ✓ |
| Nome | Manrope 14 / 400 | 14 · 400 | ✓ |
| Dato | IBM Plex Mono 10, +0.06em, inchiostro | era 11, inchiostro tenue | **corretto** |
| Icona | 14 | 14 | ✓ |
| Colore | velato: ambra 30%, azzurro 22%, grigio 22% per una bozza; nessun pallino di stato | così | ✓ |
| Ordine | l'ambra in cima, poi per arrivo | così | ✓ |
| Rimandato | film a metà, nome tenue, un'ora al posto del dato | `--liquid-quiet` · era a inchiostro pieno | **corretto** |
| Quanti | fino alla campanella, poi un numero senza colore (storico §145) | così | ✓ |
| La active a schermo intero | nessun chip: un task sta in un posto solo (storico §149) | nessun chip | ✓ |
| Durante la raccolta | i chip scendono al 45% quando INPUT cresce | no | ✗ |

## INPUT · `L2 - INPUT`, `L3 - Flusso task`

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | basso a sinistra, margine 44 | 44 · 44 | ✓ |
| Campo | raggio 22, padding 9 / 16, gap 9, 200 di larghezza a riposo | 22 · 9 16 · 9 · 200 | ✓ |
| Testo | Manrope 15; segnaposto «scrivi» all'inchiostro al 40% | 15 · era inchiostro fioco pieno | **corretto** |
| Senza ascolto | niente pallino fuori, icona della tastiera dentro | così | ✓ |
| Dropzone | sopra INPUT, aria 12; raggio 22, padding 12 / 14 | 12 · 22 · 12 14 | ✓ |
| Titolo della bozza | Manrope 15 / 500, e «Bozza» 12,5 inchiostro fioco | così | ✓ |
| Tessera | raggio 12, padding 7 / 11, gap 8; nome 13,5 / 500 | così | ✓ |
| Etichetta della tessera | IBM Plex Mono 10, +0.1em, maiuscolo | era 9,5 / +0.12em | **corretto** |
| Dato della tessera | IBM Plex Mono 11, inchiostro tenue | era 12 | **corretto** |
| «+N» | IBM Plex Mono 12 | 12 | ✓ |
| Risposta | Manrope 16, interlinea 24 | così | ✓ |
| Frasi | Manrope 14,5, gap 14, pallino sulla prima quando è la più probabile | così | ✓ |
| Domanda | targa mono 12 / 500 / +0.16em in ambra; testo 16 / 24; anello fuori a sinistra; risposte senza pallino | la targa era 11 | **corretto** |
| «sto pensando» | Manrope 13,5, inchiostro tenue, anello che gira | così | ✓ |
| Lo scambio | la risposta o la domanda al posto del campo, raggio 26, padding 14 / 18, frasi sotto la barra; mentre pensa, la frase e «sto pensando»; il campo torna al primo tasto | il campo restava sempre, raggio 22 | **corretto** |
| Le tessere | «carta per le cose raccolte, vetro per i task già a schermo, filo tratteggiato per ciò che esiste solo nella memoria» | tutte uguali | ✗ |

## SYSTEMBAR · `L2 - Systembar`

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | 22 sotto la PROFILEBAR, inchiostro diretto, nessun contenitore | così | ✓ |
| Testo | IBM Plex Mono 11 / 500, +0.06em, inchiostro tenue | era 400 / +0.08em | **corretto** |
| Icone | 14 | 14 | ✓ |
| Ordine | microfono, volume, rete, batteria | così | ✓ |
| Microfono | spento: SCRIVI, in ambra; premerlo, per ora, niente (storico §138) | così | ✓ |
| Volume | si preme; muto dice MUTA e perde il numero | così | ✓ |
| Senza rete | SENZA RETE | così | ✓ |

## TIMELINE · `L2 - TIMELINE`

Solo la struttura estetica: il significato è ancora da scrivere (storico §139, `da_definire` T1).

| | Documento | Codice | Esito |
|---|---|---|---|
| Ancoraggio | destra 44, alto 40 | 44 · 40 | ✓ |
| Targhe | IBM Plex Mono 10, +0.14em | erano 12 / +0.16em | **corretto** |
| Targhe | peso 500 (legge 07; la tavola ora le disegna così, storico §149) | 500 | ✓ |
| Adesso | Manrope 20 / 600 / −0.03em, interlinea 1,14 | era −0.02em, interlinea 1,5 | **corretto** |
| Dopo | Manrope 20 / 500, inchiostro `#4A4E48` | era inchiostro `#3E423C` | **corretto** |
| Libero | Manrope 18 / 500, inchiostro `#4A4E48` | era inchiostro pieno | **corretto** |
| Filo | 242 × 3 | 242 × 3 | ✓ |
| Targa dell'adesso | nel colore dello stato, azzurro mentre lavora (storico §149) | colore dello stato | ✓ |

## DESK · `L0` leggi 08–11

| | Documento | Codice | Esito |
|---|---|---|---|
| Spazio | quello che resta dalle due pile, margine 44 | le bolle finivano sotto la dropzone: ora l'area si ferma 22 sopra la pila di INPUT, con posto per la dropzone | **corretto** |
| Niente griglia | posizioni irregolari, leggere sovrapposizioni | il punto più libero, variato per bolla | ✓ |
| Non si sposta perché parli | cede attenzione, mai posizione | il posto resta | ✓ |
| Focus | le altre in SIDEBAR, e tornano da sole | così (test del modello) | ✓ |

## I movimenti · `L2 - Bubble movement`

| | Documento | Codice | Esito |
|---|---|---|---|
| Nascita | la bozza vola dalla dropzone lungo un arco, 420 ms | compare sul posto | ✗ |
| Onda | le vicine si scostano di 6 / 8 / 12, sfalsate di 40 ms, rientro 40% | no | ✗ |
| Active | film +12%, ombra più profonda, 180 ms | film +12%, senza transizione | ✗ |
| Messa da parte | si contrae in 280 ms e vola alla SIDEBAR in 420 ms | svanisce e ricompare | ✗ |
| Uscita | `--liquid-quiet`, scala 94%, 320 ms, e le vicine si riavvicinano | svanisce in 320 ms, senza scala né riavvicinamento | ✗ |

---

## Il metodo

Sull'app: una scena costruita con l'AI simulata, con una bolla ambra e active, una che
lavora, un documento, i chip ambra, programmato, bozza e azzurro, la dropzone con tre
tessere, il focus e il cassetto aperto; gli elementi si ritrovano dagli attributi
`data-parte`. Sulle tavole: l'elemento più piccolo che contiene il testo del campione. Si
confrontano font, misura, peso, interlinea, spaziatura, colore, padding, raggio, gap e
posizione.

Gli script sono in `.playwright-mcp/` e non stanno nel repo: vanno portati nei test
dell'interfaccia (`pronti_per_lo_sviluppo.md` §6).
