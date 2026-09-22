# Il ponte fra il codice e la documentazione

Analisi eseguita il 21 settembre 2026 su un worktree staccato del branch `CLAUDE`
(`OneAssistant-CLAUDE-wt`, commit `07d64e1`), per non toccare la copia su cui sta
lavorando un altro agente.

Metodo: lettura integrale di `docs/**` (compresi i sette documenti di design e i loro
CSS), di `src/**`, di `vite.config.ts`, `index.html`, `package.json` e dell'archivio di
esempio. Ogni affermazione qui sotto porta il file e la riga da cui viene.

> **`docs/` è la verità assoluta.** L'elenco puntuale delle divergenze e di ciò che è
> stato implementato senza menzione nella documentazione sta in `audit/AUDIT.md`, il
> registro unico, con codici stabili `F-nnn`. Questo file è il **piano di rientro**: dice
> in che ordine si chiudono quelle voci.
>
> Il registro precedente — `audit/fonti/claude/DIVERGENZE.md`, codici `D-xx`, `N-xx`,
> `A-xx` — è confluito lì insieme agli altri due audit ed è conservato come fonte. Le sue
> voci restano citabili: `audit/AUDIT.md` porta la tabella di corrispondenza.

---

## 0. La diagnosi in una riga

**Il codice non è disallineato dalla documentazione: è allineato a un'altra
documentazione, che in questo repo non esiste più.**

Il codice cita 228 volte un corpus `docs/NN-nome` che non è mai stato importato:

| citato dal codice | volte | esiste in `docs/`? |
|---|---|---|
| `docs/01-modello` | 56 | no |
| `docs/07-memoria` | 43 | no |
| `docs/06-confini` | 34 | no |
| `docs/05-interfaccia` | 21 | no |
| `docs/08-voce` | 20 | no |
| `docs/09-catene` | 15 | no |
| `docs/03-architettura` | 11 | no |
| `docs/11-aperte` | 10 | no |
| `docs/02-parallelo` | 8 | no |
| `docs/04-motore`, `04-metalinguaggio`, `05-archivio`, `03-conoscenza`, `00-aperte` | 10 | no |
| `CLAUDE.md` (radice) | 7 | no |

Il corpus vero è `docs/L00-lo_scopo.md … docs/L05-design.md` più `docs/design/L0…L4`.
Nessun file di `src/` lo nomina una sola volta.

Lo stesso vale per i documenti di design citati dal codice: `L1 - Sistema`,
`L1 - Bubble`, `L1 - Soap Bubbles`, `L2 - Taskbar`, `L3 - Composizioni`
(`src/aree/schermo.ts:1-8`, `src/stile/base.css:1-13`). Nel repo esistono
`L0 - Sistema`, `L2 - Bubble`, `L2 - Sidebar`: la numerazione è cambiata, due documenti
(`Soap Bubbles`, `Composizioni`) non esistono e uno (`Taskbar`) è stato rinominato
`Sidebar`.

**Questa è la causa prima di tutti i gap che seguono, compreso quello grafico.** Non è
un problema di commenti sbagliati: è che il codice obbedisce a decisioni prese in
documenti che sono stati sostituiti, e quindi implementa la versione precedente di
quasi ogni componente.

C'è anche una deriva **interna alla documentazione**: i documenti di design nuovi
citano a loro volta il corpus morto — `L0 - Sistema` rimanda a `docs/01-modello §2`,
`docs/05-interfaccia §1`, `docs/11-aperte` e `CLAUDE.md`. Quindi oggi nemmeno L0 è
verificabile per intero contro `docs/L00…L05`.

---

## 1. Il gap grafico — perché «non corrisponde per niente»

### 1.1 Il materiale è quello di due revisioni fa

I documenti di design hanno **tre** fogli di materiale, e l'app ne carica uno:

- `docs/design/liquid-glass.css` — il materiale corrente (film multistrato con riflessi
  radiali, lama diagonale, `blur(12px) saturate(1.65) brightness(1.06)`, doppio menisco
  `--liquid-edge`, ombra di contatto + due ombre diffuse). **Non importato.**
- `docs/design/materiali.css` — il vetro chiaro e il vetro scuro, gli inchiostri `--ink*`,
  gli stati, `--carta-notifica`. **Non importato.**
- `docs/design/temi.css` — i dodici temi. **Importato** (`src/main.ts:12`).

Il vetro dell'app è scritto a mano in `src/stile/base.css:128-138`:

```
background: linear-gradient(155deg, rgba(255,255,255,.62), rgba(248,248,244,.44));
backdrop-filter: blur(42px) saturate(1.9) brightness(1.14);
box-shadow: inset 0 0 0 1px rgba(255,255,255,.78), 0 20px 44px rgba(30,36,30,.24);
```

cioè **esattamente la ricetta di `L1 - Moodboard §2a`** («blur 44, film bianco al 62%,
rim 1px a 75%»), che la revisione *Liquid glass* ha sostituito. Il risultato a schermo è
un altro materiale: più satinato, senza riflessi d'angolo, senza spessore ottico, con
un'ombra sola invece di tre.

Conseguenza collaterale: i vocabolari di variabili sono due e non comunicano —
`base.css` usa `--inchiostro*`, `materiali.css` usa `--ink*`. `temi.css` alimenta solo il
primo, quindi anche i dodici temi entrano a metà.

**Il tema scuro non esiste nell'app.** `temi.css` e `materiali.css` si accendono con
`data-tema='scuro'`, e in tutto `src/` non c'è una riga che scriva quell'attributo
(`document.documentElement.dataset.colori` sì, `data-tema` mai — `src/main.ts:203`).
`L1 - Temi` e `L4 - Schermate` mostrano le ventiquattro combinazioni; l'app ne può
mostrare dodici.

### 1.2 La scala tipografica è circa il 60% di quella disegnata

`L2 - Bubble`, esemplare canonico (tavola «la bolla canonica»), contro `src/stile/base.css`:

| | design | codice | dove |
|---|---|---|---|
| larghezza bolla | 464 | 388 a riposo / 452 a fuoco / 560 aperta | `src/aree/scrivania.ts:91-94` |
| raggio | 26 | 26 ✓ | `base.css:70` |
| padding | 20 / 22 | 22 / 24 | `base.css:390` |
| icona targa | 19 px | 14 px | `base.css:468` |
| targa mono | 10 px · `0.16em` | 10 px · `0.14em` | `base.css:466` |
| titolo | 27 px / 600 / `-0.035em` | **16 px** / 600 / `-0.03em` | `base.css:473` |
| corpo | 15.5 px | **12 px** | `base.css:479` |
| «Puoi dire» | 9.5 px · `0.2em` | 10 px · `0.2em` | `base.css:493` |
| frasi | 16 px | **12 px** | `base.css:500` |
| pallino della probabile | 9 px | 8 px | `base.css:508` |

`base.css:11-13` lo dichiara apertamente: *«Le misure di testo e icone sono state tarate
a mano il 16 settembre 2026 … Dove un numero diverge dal documento, è questa taratura ad
avere ragione»*. È una **inversione esplicita della regola di cascata di L0** («se un
disegno contraddice una riga di qui, il disegno è sbagliato»; «la cascata sale soltanto»).
Finché questa riga resta, codice e design non possono convergere per costruzione.

### 1.3 Componente per componente

**PROFILEBAR** — il caso più netto.

| | documentazione | codice |
|---|---|---|
| natura | **è una bolla** dal 19 set (`L0` legge zero; `Liquid glass` §19 set) | «velo», deroga dichiarata alla legge zero (`src/aree/schermo.ts:181-199`) |
| materiale | `--liquid-film` + `--liquid-optics` + `--liquid-edge` (`profilebar.css:13-25`) | `background: rgba(26,28,25,0.06)` (`base.css:268`) |
| padding | 8 / 12 / 8 / **24** | 7 / 7 / 7 / 16 (`base.css:266`) |
| raggio · altezza | 30 · 60 | 29 · libera (`base.css:267`) |
| gap testo–volto | 16 | 14 (`base.css:265`) |
| gap fra le righe | 4, interlinea 18 | 2, nessuna interlinea (`base.css:278`) |
| ora/data e città/luogo | due gruppi separati da spazi reali, **senza middledot** | `${orario} · ${giorno} …` e `città · luogo` con `<span class="punto">·</span>` (`schermo.ts:204`, `schermo.ts:229`) |
| modalità attiva (WorkMode) | «Deep», semibold 600, gap 12 — unica eccezione tipografica | **assente** |
| volto | 44 ✓ | 44 ✓ |

`docs/L02-componenti.md` chiede inoltre che GPS + data/ora definiscano un **WorkMode**:
non c'è traccia nel codice.

**SIDEBAR / TASKBAR**

- Il componente si chiama `#taskbar` ovunque (`schermo.ts:296`, `base.css:327`), il luogo
  del modello è `CHIP`, e la mossa dell'AI è `mostra area: 'TASKBAR'`
  (`src/modello/tipi.ts:251`). La documentazione conosce solo **SIDEBAR**.
- Chip: altezza 30 ✓, raggio 20 ✓, padding 14 ✓, gap 9 ✓ (il commento a `base.css:324`
  dice «chip 34», ma il CSS è corretto: è il commento a essere vecchio).
- **Oltre quattro si taglia invece di raggruppare**: `m.elementi().slice(0, 4)`
  (`schermo.ts:299`). `L2 - Sidebar` prescrive che il quinto diventi `+3 IN CORSO`. Oggi
  il quinto task sparisce dallo schermo senza dirlo.
- L'ancoraggio `44 / 132` di `L2 - Sidebar` è in conflitto con `L2 - Systembar`
  (17 set: quota relativa, 22 px d'aria). Il codice segue la versione nuova
  (`base.css:179-187`, `#taskbar { margin-top: 22px }`): qui il difetto è **della
  documentazione**, che non ha propagato la cascata.

**SYSTEMBAR** — la più fedele. Ordine fisso ✓, icona+valore ✓, premibilità di microfono e
volume ✓, «SCRIVI» a microfono spento ✓, «MUTA» ✓. Unico scostamento: mono a **10 px**
(`base.css:313`) contro gli 11 px dichiarati due volte in `L2 - Systembar`.

**TIMELINE** — fedele: `adesso 20/600`, `dopo 20/500`, targhe 10 mono, filo `242 × 3`,
capo 9 px agli inizi (`base.css:195-241`, `src/aree/timeline.ts:40`). È l'unico componente
in cui codice e documento coincidono quasi riga per riga.

**NOTIFICATIONBAR**

| | documentazione | codice |
|---|---|---|
| campanella | 44 | 56 (`base.css:756`) |
| badge | 16 | 20 (`base.css:777`) |
| cassetto | 400 largo, max 420 alto | 400 ✓, max **440** (`base.css:803`) |
| apertura / righe / velo | 420 ms · 40 ms · 54% | ✓ ✓ ✓ (`base.css:790-821`, `739-747`) |
| righe del cassetto | **bolle come tutte le altre** (L0, 19 set: «la cartina non esiste») | carta opaca `rgba(251,251,249,.94)` (`base.css:812`) |
| cosa contiene | **solo ciò che viene da fuori**; i rimandati stanno in SIDEBAR (18 set) | mescola notifiche e `m.in('ORARIO')` — i rimandati — nella stessa lista (`schermo.ts:600-609`) |

E soprattutto: **all'avvio la NOTIFICATIONBAR non c'è.** `conCassetto = false`
(`src/modello/motore.ts:109`): il sistema parte disegnando `pila()`, cioè la *prima*
versione — la pila di carte della vecchia Sidebar — che il codice stesso dichiara «spenta
dal 16 settembre» (`schermo.ts:466-467`) e che la documentazione non contempla più. La
versione canonica si accende solo da un bottone della pedana di prova.

**INPUT**

- Ancoraggio: `L2 - INPUT` dice «bottom 44 · centrato», `L0` dice «basso a sinistra». Il
  codice fa in basso a sinistra (`base.css:555-559`): segue L0, ed è la scelta giusta —
  ma è un altro conflitto interno ai documenti.
- Larghezza: `ascolto: 380` nel documento, `max-width: 560` nel codice.
- Mancano due dei sei stati disegnati: **«sto lavorando»** (linea che avanza + conteggio
  passi, `2 DI 3`) e **«aspetta te»** (il punto che si svuota e diventa **anello ambra**).
  Nel codice il punto ha due soli stati, pieno salvia fermo o pulsante (`base.css:574-580`),
  e l'anello esiste solo come indicatore «sta pensando», in salvia (`base.css:591-597`).
- Raccolta ≤ 340 px ✓, punto 13 px ✓, pulsazione 1,2 s 13→15 px ✓, baloon 240 ms ✓,
  tasti `↵`/numeri in tastiera ✓.

**Icone** — `L1 - Icone` fissa **19 px**, `L0` legge 06 dice **14–16 px**: i due
documenti di fondamenta si contraddicono (esattamente l'errore che quel documento
racconta di aver già commesso una volta con Material Symbols). Il codice usa 14–16.
In più, oltre alle sette di tipo il codice ne usa dodici di cornice (`mic`, `volume`,
`wifi`, `battery`, `bell`, `keyboard`, `house`, `briefcase`, `map-pin`, …): alcune sono
implicitamente autorizzate dai documenti L2, ma la formula di L0 «sette icone in tutto il
sistema» va riscritta, e il codice stesso lo segnala (`schermo.ts:216-219`).

---

## 2. Il gap di modello

`docs/L01-struttura_e_task.md` definisce **quattro stati**: `T_NUOVO`, `T_LAVORAZIONE`,
`T_ATTESA`, `T_CONCLUSIONE`. Nel codice non esistono. `src/modello/tipi.ts:17-37`
implementa **due assi**:

- `Luogo`: `MAIN | APERTO | CHIP | CARTA | ORARIO | MEMORIA`
- `Avanzamento`: `in corso | aspetta te | programmato | bloccato | concluso | consegnato`

con una tabella di combinazioni legali. È il modello di `docs/01-modello`, il documento
che non c'è. `L0 - Sistema` lo dà per buono («il colore segue le **sette facce** del
modello, non i quattro stati»), quindi oggi **L0 e L01 descrivono due modelli diversi** e
il codice segue quello di L0.

Corollari già annotati in `tasks/future.md` e ancora aperti: `CARTA` e `MEMORIA` da
togliere, `ORARIO` da rappresentare come chip in SIDEBAR.

Cosa invece è in regola: Funzione Delay a 90 s (`motore.ts:42`), chat raw JSONL per
giorno scritta da Node (`vite.config.ts:712-764`), porta `/archivio` con utente unico
`user_123` e setaccio dei percorsi (`vite.config.ts:687-696`), chiave solo in `.env`
(`vite.config.ts:211-218`), OpenRouter come unico provider (`vite.config.ts:234-262`).

---

## 3. Il gap di stack

`docs/L04-aspetti_tecnici.md`: «Il prototipo è un sito **React, Vite e Tailwind**».
`tasks/future.md` lo dà per deciso e spuntato.

Realtà: `package.json` non ha né React né Tailwind; il prototipo è **TypeScript vanilla**
che costruisce HTML con template string e un unico `base.css` di 1126 righe scritte a
mano (`src/aree/schermo.ts`, `src/stile/base.css`). Le dipendenze sono
`@anthropic-ai/sdk`, `onnxruntime-web`, `espeak-ng`, `phonemizer`.

Non è un dettaglio di forma: **è la ragione tecnica per cui il ponte grafico è tanto
costoso.** Con Tailwind i token del design sarebbero una configurazione; qui ogni numero
è trascritto a mano in un foglio unico.

---

## 4. Implementato e mai definito nella documentazione

Sottosistemi interi, funzionanti, che nessun documento della root nomina. Per ognuno
serve una decisione: **documentare o rimuovere**.

| cosa | dove | note |
|---|---|---|
| **Pedana di prova** (copione, flussi, passi, registro delle mosse) | `src/prova/pedana.ts`, `flussi.ts`, `schermo.ts:1106-1199` | il codice ammette «non fa parte del design» |
| **Alfabeto** — vocabolario chiuso delle frasi, con stato richiesto e token atteso | `src/prova/alfabeto.ts`, `stato.ts` | banco di conformità della lingua |
| **Scia** — le celle in cui un task è passato | `src/prova/scia.ts` | |
| **Compositore** — inventare una notifica a mano | `schermo.ts:1059-1104` | |
| **Schermata di blocco** | `schermo.ts:913-927`, `base.css:1066-1126` | il codice dichiara «non esiste un documento di Claude Design» |
| **Memoria in sessione** con entità, righe, smentite, ipotesi, promozione a preferenza dopo 3 prove | `src/archivio/archivio.ts` | la doc dice che la Memory Engine **non è implementata**: in realtà c'è, sospesa e non persistente |
| **Mossa `ricorda`** data all'AI | `src/ai-engine/strumenti.ts:82` | scrive nella memoria |
| **Secondari / `delega`** — lavori in parallelo con un sottoinsieme di strumenti | `src/ai-engine/secondari.ts`, `motore.ts:188` | «un modo di lavorare, non un posto» |
| **Gruppi di task** — `metti`, `apri`, `separa`, `consegna-gruppo`, `rimanda-gruppo` | `tipi.ts:308-320`, `motore.ts:1223` | nessun documento li nomina |
| **Forme del task** (`riassunto`, `composizione`) e catene `componi/aggiungi/riscrivi` | `tipi.ts:173`, `292-301` | |
| **Raccolta** — nomi e file agganciati mentre scrivi | `src/aree/raccolta.ts` | disegnata in `L2 - INPUT` come «idee», mai decisa |
| **Voce in uscita** — Piper + `serena-high`, espeak/phonemizer, coda con il campanello | `src/voce/*` | `L04` la nomina in una riga; il comportamento (turni, silenzi, `aspetta`) non è documentato |
| **Canali** — asimmetria orecchio/bocca | `src/conoscenza/canali.ts` | descritta bene in `L2 - Systembar`, assente in `docs/` |
| **Filtro** degli arrivi | `src/confini/filtro.ts` | decide cosa suona e cosa conta nel badge |
| **Sette servizi** (`posta, note, contatti, calendario, promemoria, disco, sms`) e autorizzazioni | `src/confini/*`, `tipi.ts:104-127` | `docs/L03` nomina solo i documenti di contesto |
| **Scenario CLI** e banchi HTML (`banco-voci`, `banco-ascolto`, `taratura-materia`, `taratura-testo`) | `strumenti/` | |
| **Tavolozza dal profilo** (`tema:` in `preferences.txt` → variabili `:root`) | `src/stile/tema.ts` | il codice stesso la chiama «un debito» |

Aggiungo un dato sporco trovato per strada: `src/conoscenza/contesto.ts:26-32` cablava
utilizzatore, mestiere, ore di lavoro e progetti (`Manuel Cucca`, `sviluppatore`,
`Acme`, `Aurora`), mentre l'archivio di esempio dichiara `Lucia Moretti`
(`Archivio/users/user_123/preferences.txt:9`). `main.ts:90-91` sovrascrive solo nome e
luogo: mestiere, orario e progetti restano quelli del codice e finiscono nel filtro e
nelle frasi.

---

## 5. Documentato e non implementato

- **WorkMode** della PROFILEBAR (`L02`, `Liquid glass`).
- **`+N IN CORSO`** oltre il quarto chip (`L2 - Sidebar`).
- **Stati «sto lavorando» e «aspetta te» di INPUT** (`L2 - INPUT`).
- **Tema scuro** e i due materiali (`L1 - Temi`, `L4 - Schermate`).
- **Memory Engine permanente e selettiva** (`L01`, `L03`, `L04`) — oggi la memoria vive
  in sessione e muore con lei.
- **`docs/L05-design.md` è vuoto** (0 righe), benché il README lo indichi come parte
  della documentazione vitale e `docs/design/` esista.
- **`tasks/storico.md`, `tasks/pronti_per_lo_sviluppo.md`, `tasks/da_definire.md` sono
  vuoti** (0 righe), benché il README dica che lì si registra ogni decisione e ogni cambio
  di rotta. Tutto il «perché» del sistema vive nei commenti del codice — che è esattamente
  il posto da cui `tasks/future.md` dice di non prendere verità.

---

## 6. Il ponte

Cinque fasi. Le prime due non cambiano una riga di comportamento e sbloccano tutto il
resto; le altre tre sono lavoro vero e vanno fatte **un componente per volta**.

### Fase 0 · Rendere confrontabili i due mondi (nessun rischio)

1. **Glossario di migrazione** — un file solo, `docs/L06-glossario.md`, con tre tabelle:
   `docs/NN-*` → `docs/L0N-*` (o «non esiste più»); `L1 - X` → `L0/L2 - X`;
   `TABLE→DESK`, `TASKBAR→SIDEBAR`, `pila→NOTIFICATIONBAR (v1, morta)`, `CARTA→notifica`.
2. **Riscrivere i 228 rimandi** nei commenti con una passata meccanica guidata dal
   glossario. Dove la destinazione non esiste, il rimando diventa
   `// DA DOCUMENTARE: <cosa>` — così il debito si conta invece di essere invisibile.
3. **Sanare la contraddizione di autorità.** Togliere da `base.css:11-13` la riga che dà
   ragione al codice contro il documento, e sostituirla con la regola di L0. Se una
   taratura vale, sale nel documento; non resta come eccezione locale.
4. **Riattivare `tasks/storico.md`**: da qui in avanti ogni voce chiusa ci finisce con la
   sua motivazione.

### Fase 1 · Il materiale in un posto solo

5. `src/main.ts` importa `docs/design/liquid-glass.css` e `docs/design/materiali.css`
   prima di `base.css`. Nessuna copia: **il design entra dal suo file**, come già fa
   `temi.css`.
6. Creare `src/stile/ponte.css`: l'unico file in cui `--inchiostro*` e i nomi vecchi di
   `base.css` sono alias di `--ink*` e dei token liquidi. Serve a non riscrivere 1126
   righe in un colpo.
7. Riscrivere `.bolla-base` come `background: var(--liquid-film)` /
   `backdrop-filter: var(--liquid-optics)` / `box-shadow: var(--liquid-edge)`, e le tre
   densità (`--liquid-focus`, `--liquid-film`, `--liquid-quiet`) al posto dei sei numeri
   `--film-*`. Da qui in poi **nessun `blur()` e nessun `rgba()` di vetro fuori dai token**.
8. Accendere lo scuro: leggere `tema:`/`modo:` dal profilo e scrivere `data-tema` sulla
   radice. Costa poco e rende vere 12 combinazioni su 24 che oggi sono codice morto.

### Fase 2 · Un componente per volta, con la sua scheda di conformità

Per ognuno: una tabella «numero del documento → numero del codice → esito», il diff, e
la spunta. Ordine consigliato, dal più divergente al meno:

1. **PROFILEBAR** — diventa una bolla, prende i token, padding 8/12/8/24, raggio 30,
   altezza 60, gruppi senza middledot, e nasce il WorkMode.
2. **BUBBLE** — scala tipografica del documento (27 / 15.5 / 16), padding 20/22,
   larghezza 464, icona 19 (o 16, se si sceglie L0 — vedi decisioni).
3. **NOTIFICATIONBAR** — canonica di default (`conCassetto` sparisce), campanella 44,
   badge 16, cassetto 420, righe di vetro invece che di carta, e **fuori i rimandati**.
4. **SIDEBAR** — rinomina completa, `+N` oltre il quarto.
5. **INPUT** — i due stati mancanti del punto.
6. **SYSTEMBAR** — mono a 11.
7. **DESK** — rinomina di `TABLE`; il campo di forze resta com'è (è buono, e nessun
   documento lo contraddice — va solo scritto in un `L2 - DESK`).

### Fase 3 · Il modello

8. Decidere fra i due modelli (vedi decisioni) e, qualunque sia la scelta, farlo dire da
   **un solo documento**. Poi: via `CARTA` e `MEMORIA`, `ORARIO` come chip in SIDEBAR,
   notifica come oggetto senza luogo né stato.

### Fase 4 · Il debito non documentato

9. Per ognuna delle voci del §4: un documento breve o la rimozione. Proposta minima —
   `docs/L06-banco-di-prova.md` (pedana, alfabeto, scia, scenario, banchi),
   `docs/L07-voce.md` (Piper, turni, campanello, canali),
   `docs/L08-servizi.md` (i sette confini, autorizzazioni, filtro),
   e in `docs/design/` una tavola `L2 - DESK` e una `L4 - Blocco`.
10. Ripulire i dati cablati in `contesto.ts` portandoli nel profilo.

---

## 7. Le decisioni che restano a te

`docs/` è la verità assoluta: dove il codice diverge, si adegua il codice, e non serve
chiedere. Restano aperte solo le due cose che la documentazione **non può risolvere da
sé**, perché sono due documenti che dicono il contrario.

1. **Stack.** `docs/L04-aspetti_tecnici.md` prescrive React + Tailwind; il codice è
   TypeScript vanilla. Presa la regola alla lettera, va riscritto il livello di disegno —
   e allora la Fase 2 va fatta **dentro** quella riscrittura, non due volte. L'alternativa
   è una modifica di `L04`, che è l'unico modo legittimo di cambiare la verità. È la
   decisione che ordina tutto il resto del piano, e va presa prima della Fase 2.
2. **Modello dei task.** `docs/L01` definisce quattro stati `T_*`; `docs/design/L0`
   parla delle sette facce di un modello a due assi e rimanda a un documento che non
   esiste. Due documenti della root, due modelli: la cascata non li risolve perché
   appartengono a corpus diversi. Proposta da approvare: tenere i due assi come modello
   interno e definire i quattro `T_*` come loro proiezione osservabile, scrivendolo in
   `L01`.

Le altre contraddizioni fra documenti (icone 19 px vs 14–16, INPUT centrato vs a
sinistra, quota della SIDEBAR, materiale in `L1 - Moodboard`) sono risolte dalla cascata
e sono già registrate in appendice a `DIVERGENZE.md`: lì il lavoro è **correggere il
documento sbagliato**, non decidere.

---

## 8. Il pezzo di governance che manca

`L0` dice che la cascata sale e che il documento vince. In pratica oggi ci sono tre
sorgenti di verità che si contraddicono a vicenda: i documenti L0–L4, i documenti
L00–L05, e i commenti del codice — che sono la fonte più ricca e la sola che `future.md`
dichiara non valida.

Il ponte regge solo se, insieme alle fasi qui sopra, vale una regola sola e verificabile:

> **Un numero grafico esiste in un posto solo.** Se è nel codice e non in un documento,
> il codice è in debito; se è in due documenti, uno dei due è sbagliato. Una modifica che
> non aggiorna il numero più alto non è finita.
