# Divergenze fra il codice e la documentazione

**La cartella `docs/` è la verità assoluta.** Comprende sia i documenti di prodotto
(`docs/L00` … `docs/L05`) sia il design (`docs/design/`). Dove il codice dice una cosa
diversa, è il codice a essere in errore; dove il codice fa una cosa che la documentazione
non nomina, quella cosa è un debito da documentare o da rimuovere.

Quando due documenti si contraddicono vale la regola di cascata scritta in
`docs/design/L0 - Sistema.md`: **il numero più basso comanda** (L0 → L1 → L2 → L3 → L4),
e i documenti di prodotto governano la logica. Le contraddizioni interne alla
documentazione sono raccolte in appendice, già risolte con questa regola.

Rilevato il 21 settembre 2026 sul branch `CLAUDE`, commit `07d64e1`, leggendo per intero
`docs/**`, `src/**`, `vite.config.ts`, `index.html`, `package.json` e `Archivio/`.

Ogni voce ha un codice stabile (`D-xx` divergenze, `N-xx` non documentato, `A-xx`
assente) così che i task possano citarla.

---

## A · Implementato in modo diverso da come è documentato

### A.1 Materiale e fondamenta

**D-01 · Il materiale del vetro è una revisione precedente.**
La documentazione corrente è `docs/design/Liquid glass.md` con i token di
`docs/design/liquid-glass.css`: film multistrato con riflessi radiali agli angoli, lama
diagonale di luce, centro all'8%, `blur(12px) saturate(1.65) brightness(1.06)`, doppio
menisco ottico `--liquid-edge`, ombra di contatto più due ombre diffuse.
Il codice scrive a mano un altro materiale in `src/stile/base.css:128-138`:
`linear-gradient` a due fermate (62%→44%), `blur(42px) saturate(1.9) brightness(1.14)`,
un anello e un'ombra sola. È la ricetta di `L1 - Moodboard §2a`, che *Liquid glass* ha
sostituito. Effetto: nessun riflesso, nessuno spessore ottico, fondo più satinato del
dovuto.

**D-02 · I fogli di materiale del design non vengono caricati.**
`src/main.ts:11-12` importa `./stile/base.css` e `../docs/design/temi.css` e basta.
`docs/design/liquid-glass.css` e `docs/design/materiali.css` non sono importati da
nessuna parte: i loro token esistono solo nei documenti.

**D-03 · Due vocabolari di variabili che non comunicano.**
La documentazione nomina gli inchiostri `--ink`, `--ink-tenue`, `--ink-corpo`,
`--ink-fioco` (`docs/design/materiali.css:27,38`); il codice usa `--inchiostro`,
`--inchiostro-tenue`, `--inchiostro-corpo`, `--inchiostro-fioco`
(`src/stile/base.css:29-32`). `temi.css` alimenta solo i secondi, quindi anche i dodici
temi entrano a metà.

**D-04 · Il tema scuro non esiste nell'applicazione.**
`docs/design/L1 - Temi.dc.html` prescrive dodici tinte **ognuna in chiaro e in scuro**
(24 combinazioni), e `docs/design/L4 - Schermate.dc.html` mostra le quattro scene nei due
temi. Sia `temi.css` sia `materiali.css` si accendono con `data-tema='scuro'`: in tutto
`src/` quell'attributo non viene mai scritto (`src/main.ts:203` scrive solo
`dataset.colori`). Metà della tavolozza documentata è irraggiungibile.

**D-05 · Il codice si dichiara più autorevole della documentazione.**
`src/stile/base.css:11-13`: «Le misure di testo e icone sono state tarate a mano il 16
settembre 2026 … Dove un numero diverge dal documento, è questa taratura ad avere ragione,
e il documento è da aggiornare». È l'opposto di `L0 - Sistema` («se un disegno contraddice
una riga di qui, il disegno è sbagliato»; «la cascata sale soltanto»). Finché quella riga
resta, la convergenza è impedita per principio.

**D-06 · La tavolozza del profilo introduce colori fuori dai documenti.**
`src/stile/tema.ts` permette a `preferences.txt` di riscrivere `--salvia`, `--ambra`,
`--rosso`, i fondi e il film. Il codice stesso lo chiama «un debito» (`src/stile/tema.ts:1-14`).
Nessun documento di `docs/` prevede che il profilo cambi i colori del design.

### A.2 BUBBLE — la primitiva

Riferimento: `docs/design/L2 - Bubble.dc.html`, esemplare canonico.

**D-07 · Scala tipografica della bolla ridotta di circa il 40%.**

| | documentazione | codice |
|---|---|---|
| titolo | 27 px / 600 / `-0.035em` | 16 px (`base.css:473`) |
| corpo | 15.5 px | 12 px (`base.css:479`) |
| frasi «…» | 16 px | 12 px (`base.css:500`) |
| icona della targa | 19 px (`L1 - Icone`) / 14–16 px (`L0` legge 06, che comanda) | 14 px (`base.css:468`) |
| targa mono | 10 px · `0.16em` | 10 px · `0.14em` (`base.css:466`) |
| pallino della probabile | 9 px | 8 px (`base.css:508`) |

**D-08 · Larghezza e padding della bolla.**
Documentazione: larghezza 464, padding 20/22. Codice: 388 a riposo, 452 a fuoco, 560
aperta (`src/aree/scrivania.ts:91-94`), padding 22/24 (`base.css:390`).

### A.3 PROFILEBAR

Riferimenti: `docs/L02-componenti.md`, `docs/design/L0 - Sistema.md` (legge zero, 19
settembre), `docs/design/Liquid glass.md`, `docs/design/profilebar.css`.

**D-09 · Non è una bolla.**
La deroga alla legge zero è **caduta il 19 settembre 2026**: la Profilebar è una bolla,
con la ricetta condivisa. Il codice la disegna come «velo» con
`background: rgba(26,28,25,0.06)` (`src/stile/base.css:264-269`) e dichiara ancora la
vecchia eccezione (`src/aree/schermo.ts:181-199`: «Senza contenitore … legge zero,
eccezione dichiarata»).

**D-10 · Geometria della Profilebar.**

| | documentazione (`profilebar.css`, `Liquid glass`) | codice (`base.css:264-289`) |
|---|---|---|
| padding | 8 / 12 / 8 / 24 | 7 / 7 / 7 / 16 |
| raggio | 30 | 29 |
| altezza | 60 | libera (dipende dal contenuto) |
| gap testo–volto | 16 | 14 |
| gap fra le due righe | 4, interlinea 18 | 2, nessuna interlinea |
| volto | 44 con anello | 44 con anello ✓ |

**D-11 · Il middledot vietato.**
`Liquid glass.md` §«Varianti definitive del profilo»: «Ora/data e città/luogo sono gruppi
separati da spazi reali, **senza middledot**». Il codice li separa con `·` in tutte e due
le righe (`src/aree/schermo.ts:204` e `schermo.ts:229`).

**D-12 · Manca la modalità attiva (WorkMode).**
`docs/L02-componenti.md`: «GPS e Data e ora contribuiscono a definire un **WorkMode**».
`Liquid glass.md` ne fissa anche la resa: semibold 600, gap 12, nessun badge né
separatore. Nel codice non esiste: `profilebar()` mostra solo ora, data, luogo e volto.

**D-13 · La riga larga 392 e la doppia ancora.**
`src/stile/base.css:243-259` e `src/aree/schermo.ts:196-199` dichiarano una «deroga alla
legge 08» con la riga larga 392 che sfonda oltre i 292 della guida, «da dichiarare in
L1 - Sistema». In `docs/` quella deroga non esiste, e `profilebar.css:13-18` dice il
contrario: il componente **si stringe sul suo contenuto**.

### A.4 SIDEBAR

Riferimenti: `docs/L02-componenti.md`, `docs/design/L2 - Sidebar.dc.html`,
`docs/design/L0 - Sistema.md` (le sette aree).

**D-14 · Il componente si chiama TASKBAR in tutto il sistema.**
`#taskbar` nel disegno (`src/aree/schermo.ts:296-303`, `src/stile/base.css:323-333`), e
soprattutto **nel vocabolario dato all'AI**: la mossa è `mostra area: 'TASKBAR'`
(`src/modello/tipi.ts:251`, `src/ai-engine/strumenti.ts:187-198`). La documentazione
conosce solo SIDEBAR. Il nome è osservabile, non interno: l'AI lo usa.

**D-15 · Oltre il quarto chip il quinto sparisce.**
`docs/design/L2 - Sidebar.dc.html`: «Oltre quattro si raggruppa. Il quinto chip diventa
`+3 IN CORSO`». Il codice tronca senza dire niente: `m.elementi().slice(0, 4)`
(`src/aree/schermo.ts:299`).

**D-16 · Il chip non ha lo stato «main a schermo intero».**
Il documento elenca sei stati del chip, fra cui il chip a inchiostro pieno che compare
quando la main è a schermo intero. Il codice ne disegna due (normale e `lavora`,
`schermo.ts:322-332`).

### A.5 NOTIFICATIONBAR

Riferimenti: `docs/L02-componenti.md`, `docs/design/L2 - Notificationbar.dc.html`,
`docs/design/L0 - Sistema.md`.

**D-17 · All'avvio la NOTIFICATIONBAR non c'è.**
`src/modello/motore.ts:109`: `conCassetto = false`. Il sistema parte disegnando `pila()`
(`src/aree/schermo.ts:469-506`), cioè la **prima versione**, che il codice stesso dichiara
spenta dal 16 settembre e che la documentazione non contempla più. La versione documentata
si accende solo premendo un bottone della pedana di prova (`src/main.ts:438-442`).

**D-18 · Geometria della campanella e del cassetto.**

| | documentazione | codice |
|---|---|---|
| campanella | 44 | 56 (`base.css:756`) |
| badge | 16 | 20 (`base.css:775-777`) |
| cassetto | 400 largo · max 420 alto | 400 ✓ · max 440 (`base.css:803`) |
| apertura / righe / velo | 420 ms · 40 ms · 54% | ✓ ✓ ✓ |

**D-19 · Le righe del cassetto sono di carta opaca invece che di vetro.**
`L0 - Sistema`, 19 settembre: «~~la cartina della NOTIFICATIONBAR ha un contenitore e non
è una bolla~~ **Caduta**… Le righe del cassetto sono **bolle come tutte le altre**». Il
codice le disegna opache: `background: rgba(251,251,249,0.94)` (`src/stile/base.css:812`).

**D-20 · Nel cassetto finiscono i rimandati.**
`L2 - Notificationbar`, 18 settembre: «~~le cose che hanno un'ora stanno in fondo alla
stessa lista~~ **Caduta**: i rimandati sono tuoi, e il cassetto è il mondo. Stanno in
SIDEBAR». Il codice mescola `m.notifiche` e `m.in('ORARIO')` nella stessa fila
(`src/aree/schermo.ts:589-610`), marcandoli `futura`.

**D-21 · Icona della riga a 15 px.**
`L0` legge 06: 16 px nella riga del cassetto. Codice: 15 px (`src/stile/base.css:832`).

### A.6 INPUT

Riferimenti: `docs/L02-componenti.md`, `docs/design/L2 - INPUT.dc.html`,
`docs/design/L0 - Sistema.md`.

**D-22 · Mancano due dei sei stati.**
Non sono implementati: **«sto lavorando»** (la linea che avanza e il conteggio dei passi,
`2 DI 3`) e **«aspetta te»** (il punto che si svuota e diventa **anello ambra** — «l'unico
ambra di INPUT»). Nel codice il punto ha due stati soli, pieno fermo o pulsante
(`src/stile/base.css:574-580`); l'anello esiste solo come segno «sta pensando», in salvia
(`base.css:591-597`).

**D-23 · Larghezza.**
Documento: `ascolto: 380`. Codice: `max-width: 560` (`src/stile/base.css:559`).

**D-24 · Le idee della fase di raccolta non sono quelle disegnate.**
`L2 - INPUT` disegna sei modi di mostrare la raccolta (tessere, setaccio, gruppi, mazzo,
anteprima). Il codice ne implementa uno non disegnato: pastiglie con icona e nome
(`src/aree/schermo.ts:840-870`, `src/stile/base.css:676-697`). Il tetto di 340 px è
rispettato.

### A.7 SYSTEMBAR e TIMELINE

**D-25 · Mono della Systembar a 10 px invece di 11.**
`docs/design/L2 - Systembar.dc.html` lo dice due volte («icone 14 px · mono 11 px», «11 px
contro i 14 della Profilebar»). Codice: 10 px (`src/stile/base.css:313`).

TIMELINE è conforme (adesso 20/600, dopo 20/500, targhe 10 mono, filo 242 × 3, capo 9 px
agli inizi: `src/stile/base.css:195-241`, `src/aree/timeline.ts:40`). Nessuna divergenza
rilevata.

### A.8 DESK

**D-26 · L'area centrale si chiama TABLE.**
`#table` nel disegno (`src/aree/schermo.ts:338-344`, `src/stile/base.css:374-385`). La
documentazione la chiama **DESK** (`docs/L02-componenti.md`, `L0` le sette aree). Anche
qui il nome arriva all'AI attraverso la vista (`src/ai-engine/vista.ts`).

### A.9 Il modello dei task

**D-27 · Gli stati del task sono un altro insieme.**
`docs/L01-struttura_e_task.md` definisce quattro stati — `T_NUOVO`, `T_LAVORAZIONE`,
`T_ATTESA`, `T_CONCLUSIONE` — con le loro transizioni. Nel codice non compaiono mai:
`src/modello/tipi.ts:17-37` implementa due assi, `Luogo` (`MAIN | APERTO | CHIP | CARTA |
ORARIO | MEMORIA`) e `Avanzamento` (`in corso | aspetta te | programmato | bloccato |
concluso | consegnato`), con una tabella di combinazioni legali.

**D-28 · `CARTA` e `MEMORIA` come luoghi del task.**
`L0` legge 03 elenca due soli posti — DESK e SIDEBAR — e dichiara esplicitamente che né
la NOTIFICATIONBAR né la MEMORIA sono luoghi per i task. Il codice li tiene come valori di
`Luogo` (`src/modello/tipi.ts:18,36`) e ci fa vivere dei task.

**D-29 · Un task concluso finisce in memoria.**
`L0` legge 03: «Un task concluso non viene archiviato automaticamente». Il luogo
`MEMORIA` ammette `concluso` e `consegnato` (`src/modello/tipi.ts:36`).

### A.10 Stack e impianto tecnico

**D-30 · Non è React e non è Tailwind.**
`docs/L04-aspetti_tecnici.md`: «Il prototipo è un sito React, Vite e Tailwind». Il
progetto è TypeScript vanilla che compone HTML con template string, più un `base.css` di
1126 righe scritte a mano (`package.json:15-24`, `src/aree/schermo.ts`). Vite sì.

**D-31 · Dipendenze non dichiarate da nessun documento.**
`@anthropic-ai/sdk`, `onnxruntime-web`, `espeak-ng`, `phonemizer` (`package.json:19-24`).
`L04` nomina OpenRouter come unico provider — e la porta lo rispetta
(`vite.config.ts:234-262`) — ma l'SDK di Anthropic è usato come trasporto, e i tre
pacchetti della voce non sono mai menzionati.

**D-32 · Le risorse esterne vengono da una CDN.**
`index.html:7-18` carica i font Google (Manrope, IBM Plex Mono) e `lucide-static` da
`jsdelivr`. Nessun documento lo prevede; `L04` dice che il prodotto dovrà diventare
un'applicazione desktop.

**D-33 · I 228 rimandi a una documentazione che non esiste.**
Il codice cita `docs/01-modello` (56 volte), `docs/07-memoria` (43), `docs/06-confini`
(34), `docs/05-interfaccia` (21), `docs/08-voce` (20), `docs/09-catene` (15),
`docs/03-architettura` (11), `docs/11-aperte` (10), `docs/02-parallelo` (8),
`docs/04-motore`, `docs/04-metalinguaggio`, `docs/05-archivio`, `docs/03-conoscenza`,
`docs/00-aperte`, e `CLAUDE.md` in radice (7). **Nessuno di questi file esiste**, e
nessun file di `src/` nomina mai `docs/L00`…`docs/L05`.
Lo stesso per il design: il codice cita `L1 - Sistema`, `L1 - Bubble`,
`L1 - Soap Bubbles`, `L2 - Taskbar`, `L3 - Composizioni`; nel repo esistono
`L0 - Sistema` e `L2 - Bubble`, mentre `Soap Bubbles` e `Composizioni` non esistono e
`Taskbar` è diventato `Sidebar`.

**D-34 · Dati dell'utente cablati nel codice.**
`src/conoscenza/contesto.ts:26-32` fissa utilizzatore (`Manuel Cucca`), mestiere, ore di
lavoro e progetti (`Acme`, `Aurora`). `docs/L03-archivio.md` vuole questi dati
nell'archivio dell'utente attivo, e `Archivio/users/user_123/preferences.txt` dichiara
un'altra persona (`Lucia Moretti`). `src/main.ts:90-91` sovrascrive solo nome e luogo:
mestiere, orario e progetti restano quelli del codice e alimentano filtro e frasi.

**D-35 · Il profilo dichiara luoghi che il codice non legge.**
`preferences.txt` elenca i luoghi noti sotto `focuses:`
(`Archivio/users/user_123/preferences.txt:15-17`); il parser cerca invece
`location from gps` (`src/conoscenza/profilo.ts:215`). I luoghi noti di
`docs/L02-componenti.md` («casa», «Ufficio») non arrivano mai a schermo.

---

## B · Implementato senza alcuna menzione nella documentazione

**N-01 · La pedana di prova.** Un banco completo sovrapposto all'interfaccia: copione a
passi, schede dei flussi, registro delle mosse dell'AI, orologio.
`src/prova/pedana.ts`, `src/prova/flussi.ts`, `src/aree/schermo.ts:1106-1199`,
`src/stile/base.css:872-1064`. Il codice stesso annota: «non fa parte del design».

**N-02 · L'alfabeto.** Elenco chiuso delle frasi dicibili con la situazione che ciascuna
richiede e il token atteso, premibili per provarle. `src/prova/alfabeto.ts`,
`src/prova/stato.ts`.

**N-03 · La scia.** Storico delle celle attraversate dal task a fuoco, con la causa di
ogni passaggio. `src/prova/scia.ts`.

**N-04 · Il compositore.** Modulo per inventare una notifica e farla entrare dai servizi.
`src/aree/schermo.ts:1059-1104`, `src/prova/pedana.ts`.

**N-05 · Gli scenari da riga di comando.** `npm run scenario`, `src/prova/scenario.ts`
(800 righe), `src/prova/timeline-prova.ts`.

**N-06 · La schermata di blocco.** Ora grande, volto, nome, frase di sblocco.
`src/aree/schermo.ts:913-927`, `src/stile/base.css:1066-1126`. Il codice: «di questa
schermata non esiste un documento di Claude Design».

**N-07 · La memoria di sessione.** Entità, righe datate con autore, collegamenti,
smentite, ipotesi promosse a preferenza dopo tre prove, tetto dell'estratto, seme
iniziale. `src/archivio/archivio.ts` (368 righe). `docs/L01`, `L03` e `L04` dicono che la
Memory Engine **non è implementata**: in realtà esiste, sospesa e non persistente.

**N-08 · La mossa `ricorda` data all'AI.** Permette al modello di scrivere in memoria
(`src/ai-engine/strumenti.ts:82-103`). Nessun documento prevede una scrittura di memoria
nel prototipo.

**N-09 · I secondari e la mossa `delega`.** Lavori in parallelo affidati a un modello con
un sottoinsieme di strumenti. `src/ai-engine/secondari.ts`, `src/modello/motore.ts:165-240`,
`src/ai-engine/strumenti.ts:371-397`.

**N-10 · I gruppi di task.** `metti`, `apri`, `separa`, `consegna-gruppo`,
`rimanda-gruppo`, con il membro che «parla» per il gruppo e l'ordine di urgenza.
`src/modello/tipi.ts:64-87,308-320`, `src/modello/motore.ts:1223-1266`.

**N-11 · Le forme del task e le catene di composizione.** `riassunto` e `composizione`,
con `componi`, `aggiungi`, `riscrivi`, `riassumi`, e il testo scritto in discorso diretto.
`src/modello/tipi.ts:173,278-301`, `src/ai-engine/testi.ts`.

**N-12 · Il vocabolario chiuso delle 32 mosse.** `COMANDI` in `src/modello/tipi.ts:235-241`
e gli strumenti dichiarati al modello in `src/ai-engine/strumenti.ts` (722 righe), con le
istruzioni di personaggio. Nessun documento elenca le mosse.

**N-13 · La vista.** La fotografia dello schermo che il modello riceve a ogni passo.
`src/ai-engine/vista.ts`.

**N-14 · La raccolta.** Riconoscimento di nomi ed entità mentre si scrive, con pastiglie
agganciate e marcatura «senza recapito». `src/aree/raccolta.ts`.

**N-15 · La voce in uscita.** Piper con `it_IT-serena-high` scaricato da HuggingFace,
`onnxruntime-web`, espeak/phonemizer, turni, silenzi, coda con il campanello, comando
`aspetta`. `src/voce/*`, `strumenti/prepara-voce.mjs`. `docs/L04` la nomina in una riga
(«Piper e Serena HIGH»); il comportamento non è documentato da nessuna parte.

**N-16 · Il campanello.** Suono di notifica, volume dalla macchina, precedenza rispetto
alla voce nei due versi. `src/voce/suono.ts`, `src/main.ts:146-153`.

**N-17 · I canali di ingresso e uscita.** Modalità voce/tastiera, asimmetria fra orecchio
e bocca (il microfono si riaccende solo con un gesto). `src/conoscenza/canali.ts`. La
regola è disegnata in `L2 - Systembar` ma non compare in `docs/L0*`.

**N-18 · Il filtro degli arrivi.** Decide cosa diventa carta/notifica, cosa suona e cosa
conta nel badge. `src/confini/filtro.ts`, `src/modello/motore.ts:337-405`.

**N-19 · I sette servizi e le autorizzazioni.** `posta`, `note`, `contatti`, `calendario`,
`promemoria`, `disco`, `sms`, con la regola «si autorizza una volta per tutte solo ciò che
nessun altro vede». `src/confini/*`, `src/modello/tipi.ts:104-127`. `docs/L01` cita i
servizi come concetto e `docs/L03` solo i documenti di contesto.

**N-20 · La scrivania a campo di forze.** Posizionamento, onda a cascata di 40 ms,
compressione al contatto, rientro ai bordi, nascita/contrazione/chiusura.
`src/aree/scrivania.ts`, `src/aree/schermo.ts:34-75`. `L0` legge 09 dice «niente griglia»,
ma il modello fisico, le durate e le curve non sono in nessun documento.

**N-21 · Il palco che riempie la finestra.** Scala dinamica con tela minima 1440 × 900 e
variabile `--scala`. `src/main.ts:53-67`. `L0` legge 08 fissa 1440 × 900 e margine 44.

**N-22 · L'orologio simulato.** Tempo del sistema separato dal tempo vero, battito ogni
10 secondi, salti manuali dalla pedana. `src/modello/tempo.ts`, `src/main.ts:234-237`.

**N-23 · Il `copione` del personaggio nel profilo.** Prosa letta da Node ed entrata nelle
istruzioni del modello. `src/conoscenza/profilo.ts:63-79`, `vite.config.ts:110-132`.

**N-24 · I banchi di taratura.** `strumenti/banco-voci.html`, `banco-ascolto.html`,
`taratura-materia.html`, `taratura-testo.html`.

**N-25 · La chiusura automatica della conversazione.** INPUT sparisce 30 secondi dopo
l'ultimo scambio (`src/modello/motore.ts`, `src/main.ts:241-246`). È scritto in
`L2 - INPUT` come nota di componente, ma non in `docs/L0*`: la logica sta fuori dal design.

**N-26 · `src/aree/testo.ts`** — l'escape dell'HTML: dettaglio tecnico, nessuna
implicazione documentale, citato per completezza dell'inventario.

---

## C · Presente nella documentazione e assente dal codice

Complementare alle due liste precedenti: non è «implementato in modo diverso», è
mancante.

**A-01 · WorkMode** (`docs/L02-componenti.md`) — vedi D-12.
**A-02 · Il chip `+N IN CORSO`** (`L2 - Sidebar`) — vedi D-15.
**A-03 · Gli stati «sto lavorando» e «aspetta te» di INPUT** (`L2 - INPUT`) — vedi D-22.
**A-04 · Il tema scuro** (`L1 - Temi`, `L4 - Schermate`) — vedi D-04.
**A-05 · La Memory Engine permanente e selettiva** (`L01`, `L03`, `L04`): oggi la memoria
vive in sessione e muore con essa (`src/archivio/archivio.ts:4-19`).
**A-06 · I luoghi noti («casa», «Ufficio») della PROFILEBAR** — vedi D-35.
**A-07 · `docs/L05-design.md` è vuoto** (0 righe), benché il README lo elenchi fra i
documenti vitali.
**A-08 · `tasks/storico.md`, `tasks/pronti_per_lo_sviluppo.md`, `tasks/da_definire.md`
sono vuoti** (0 righe), benché il README assegni a `storico.md` il registro di ogni
decisione e cambio di rotta. Di fatto tutto il «perché» del sistema vive oggi nei commenti
del codice.

Conformi e verificati, per contrasto: Funzione Delay a 90 secondi
(`src/modello/motore.ts:42`), chat raw in JSONL per giorno scritta da Node
(`vite.config.ts:712-764`), porta `/archivio` con utente unico `user_123` e setaccio dei
percorsi (`vite.config.ts:687-696`), chiave solo in `.env` (`vite.config.ts:211-218`),
OpenRouter come unico provider (`vite.config.ts:234-262`), sette tipi di icona
(`src/modello/tipi.ts:8-15`), tre colori di stato come stato e mai categoria
(`src/modello/tipi.ts:44-57`), nessun bottone nell'interfaccia di sistema, TIMELINE.

---

## Appendice · Dove la documentazione si contraddice

Segnalate perché servono per applicare la verità senza ambiguità. Risolte con la cascata
di `L0` (il numero più basso comanda).

1. **Modello dei task.** `docs/L01` definisce quattro stati `T_*`; `docs/design/L0 -
   Sistema` parla delle «sette facce del modello, non i quattro stati» e rimanda a
   `docs/01-modello`, che non esiste. → I due documenti descrivono due modelli diversi, e
   la cascata non li risolve perché appartengono a corpus diversi: **serve una decisione**.
2. **Posizione di INPUT.** `L2 - INPUT`: «bottom 44 · centrato». `L0`: «Basso a sinistra,
   bolla, con il punto d'ascolto fuori a sinistra». → Vince L0: il codice (a sinistra) è
   conforme.
3. **Misura delle icone.** `L1 - Icone`: 19 px. `L0` legge 06: 14–16 px. → Vince L0: il
   codice (14 in bolla e chip) è conforme; resta da correggere `L1 - Icone`.
4. **Quota della SIDEBAR.** `L2 - Sidebar`: «ancorati a destra 44, top 132».
   `L2 - Systembar` (17 settembre): la quota non è più un numero, la colonna scorre con
   22 px d'aria. → Stesso livello, vince la data più recente: il codice (colonna
   relativa, `base.css:179-187`) è conforme, e `L2 - Sidebar` va aggiornato.
5. **Materiale delle bolle.** `L1 - Moodboard §2a` descrive «blur 44, film bianco al 62%»;
   `Liquid glass` + `L2 - Bubble` prescrivono blur 12 e il film multistrato. → Vince la
   revisione dichiarata in `Liquid glass`, che sostituisce «le vecchie ricette di blur,
   film e ombra nei campioni attivi»; `L1 - Moodboard` va aggiornato.
6. **Rimandi a documenti inesistenti dentro i documenti.** `L0 - Sistema` cita
   `docs/01-modello §2`, `docs/05-interfaccia §1`, `docs/11-aperte` e `CLAUDE.md`;
   `L2 - Sidebar` e `L2 - Notificationbar` citano `docs/01-modello §2` e `§3`. Oggi quei
   rimandi non sono verificabili.

---

## Come si usa questo file

- È un **registro**, non un piano: il piano di rientro sta in
  `tasks/ponte_codice_documentazione.md`.
- Ogni voce chiusa va spuntata qui e motivata in `tasks/storico.md`.
- Una voce si chiude in due modi soltanto: **il codice si adegua al documento**, oppure
  **il documento viene esteso** (e allora la modifica sale la cascata fino a L4, come
  prescrive `L0`). Non esiste la terza via di lasciare il codice diverso e dichiararlo
  altrove.
