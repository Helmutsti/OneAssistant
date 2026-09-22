# Bonifica del design — registro

Passata unica sui quattordici documenti di `docs/design/`, 22 settembre 2026. Due elenchi:
le righe che **dettano comportamento** e dovrebbero stare in `docs/` (decisione 37), e i
**valori** da consolidare in un documento di token (`L1 - Token`).

In coda, le **contraddizioni ancora aperte** trovate strada facendo.

---

## A · Comportamento scritto nel design

| | Dove | Cosa dice | Dove andrebbe |
|---|---|---|---|
| A1 | `L2 - Notificationbar` | «Ciò che il filtro non promuove entra muto: non suona, non conta nel badge, ma c'è». Più: «entra nel modello solo con *me ne occupo*» e «l'apertura è un momento, non una schermata: non esiste uno stato *sto guardando le notifiche*» | `docs/L02` §NOTIFICATIONBAR |
| A2 | `L2 - Sidebar` | «Il task non entra automaticamente nella memoria; può soltanto produrre informazioni utili da selezionare per la Memory Engine dell'utente attivo» | `docs/L01` — è già quasi parola per parola in `L0` legge 03, quindi è **ripetuto in tre posti** |
| A3 | `L2 - Sidebar` | Cosa contiene il cassetto: task messi da parte, flussi, rimandati con l'ora | `docs/L02` §SIDEBAR |
| A4 | `L2 - Systembar` | «Il microfono si spegne e si riaccende premendolo, **non a voce**» — con le due ragioni: col microfono spento nessuno ti sente, e un assistente che apre il microfono da sé è un altro prodotto | `docs/L02`: è una regola di sicurezza, non di grafica |
| A5 | `L2 - TIMELINE` | «Il *dopo* compare quando il modello lo ha già promosso, cioè dentro il **preavviso di 15 minuti**» | `docs/L01`: è una soglia del modello |
| A6 | `L2 - Bubble` | Le regole sui titoli per dominio: «Mail: sempre il destinatario, mai l'oggetto», «Documenti: il nome del file va riscritto in italiano leggibile», «Ricerche: il titolo è la domanda, non il numero di risultati», e altre sei | `docs/L01`: riguardano cosa il sistema scrive, non come appare |
| A7 | `L1 - Temi` | «Nessuna selezione automatica dal tema del dispositivo: cambiare materiale da solo mentre guardi è una cosa che succede sotto le mani» | `docs/L02` o `L04` |
| A8 | `L1 - Moodboard` | «L'AI non ha una faccia e non ha una finestra… il personaggio vive nel parlato, non a schermo» | `docs/L00` o `L01` |

**Nota su `L3 - Flusso task`.** Tutto il documento è comportamento: è un giro intero di
lavorazione raccontato a schermate. Ma il suo livello si chiama «i flussi» e la sua
ragione d'essere è mostrare come le cose si vedono succedere. Non lo tratterei come
materiale da spostare: semmai da **citare** `docs/L01` invece di riscriverlo.

---

## B · I valori, per `L1 - Token`

Raccolti dai quattordici documenti. Dove due documenti danno valori diversi è segnato.

**Colori di stato** — grigio `#94968E`, azzurro `#009DD6`, ambra `#EDA31C`, nessun colore.
Verde `#00A878` solo per il pallino della bolla active.

**Fondo e inchiostri** — `--f1` `#C6CBC9` · `--f2` `#B9BEB9` · `--f3` `#9BA096` · `--f4`
`#7C8178`. Inchiostro `#1A1C19`, corpo `#3E423C`, tenue `#4A4E48`, fioco `#5A5F58`.

**I dodici temi, come varianti** — oggi in `temi.css`, generato da uno script che nel repo
non c'è più. Un tema cambia fondo e inchiostro e **nient'altro**: gli stati non cambiano
mai. Il fondo scende sempre da 82% a 50% in chiaro, da 22% a 8% in scuro.

**Vetro** — `--liquid-film`, `--liquid-focus`, `--liquid-quiet`, `--liquid-optics`,
`--liquid-edge`. Blur 12 in chiaro, 10 in scuro. Il fuoco è film +12% e ombra più profonda.

**Raggi** — chip 20 · carta 22 · task 26 · pannello 30. *Oggi stanno solo in
`src/stile/base.css`.*

**Margini e aria** — margine 44 (tutti gli ancoraggi) · aria fra i componenti della guida
22, metà del margine · passo interno 4 / 8 / 12 / 16 / 24.

**Tipografia** — Manrope 200 per numeri e titoli grandi, 300 per le frasi, 500 per le
etichette; il grassetto non esiste. IBM Plex Mono per targhe, dati, stati e misure.
Scale viste: 11 (Systembar) · 12 · 13 · 14 (Profilebar) · 16/26 corpo · 18/500 ·
20/600 e 20/500 (Timeline) · 21 (titolo bolla) · 28 (titolo sezione). Titolo di bolla:
**32 caratteri, una riga sola**.

**Opacità** — 84% ciò che è a fuoco · 78% ciò che aspetta · 62% ciò che informa. Chip al
45% quando INPUT cresce.

**Movimento** — onda 12 px al massimo · sfalsamento 40 ms fra le vicine · rientro 40% ·
campanella 640 ms, una volta sola · pulsazione del contorno ogni 4 s.

**Ancoraggi** — destra 44 · Timeline `top 40` · Sidebar `top 132`.

---

## C · Contraddizioni ancora aperte

| | Cosa |
|---|---|
| C1 | **La misura delle icone ha tre valori.** `L0` legge 06 dice 14–16 px; `L1 - Icone` dice «alla misura vera — 19 px»; `L2 - Bubble` dice 18–20 px |
| C2 | **Il pallino ha tre diametri.** 8 px in `L2 - Bubble`, 9 px in `L2 - TIMELINE`, 13 px in `L4 - Schermate` — e la Timeline dice che «è lo stesso punto della Notificationbar e di INPUT, e non serve un terzo segno» |
| C3 | **«Sette icone in tutto il sistema»** è ancora scritto in `L1 - Icone` e in `L2 - Sidebar`, dopo la decisione 34 che toglie il conteggio |
| C4 | **La tavolozza vecchia** sopravvive in `L1 - Moodboard` («lo stato resta salvia, ambra, rosso terra»), `L1 - Temi` («salvia, ambra, rosso terra non cambiano tinta»), `L2 - Sidebar` («ambra e salvia vivono sull'icona»), `L2 - TIMELINE` («niente salvia nel filo», «un tratto rosso»), e in `materiali.css` |
| C5 | **Il tetto dei due colori** è ancora in `L2 - Bubble`: «Su uno schermo intero vivono al massimo due icone colorate. La terza task che chiede attenzione diventa grigia e aspetta il suo turno». È la regola tolta dalla legge 04 — e qui produce anche un grigio che vuol dire un'altra cosa rispetto alla bozza |
| C6 | **La quota della Sidebar**: `top 132` in `L2 - Sidebar`, `44 / 180` in `L0`. Già nell'audit come `F-107`, mai chiusa |
| C7 | **`L2 - Sidebar`** dice che un chip concluso «lascia l'interfaccia quando scade» la finestra dei 90 secondi: va riletto dopo la decisione 61 |
