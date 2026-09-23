# Audit OneAssist — registro unico

**Fusione di tre audit indipendenti** condotti sullo stesso codice il 21 e 22 settembre
2026. Questo è l'unico documento da leggere: i tre originali restano in `fonti/` come
prova e come dettaglio.

> **`docs/` è la verità assoluta.** Comprende i documenti di prodotto (`docs/L00`…`L05`)
> e il design (`docs/design/`). Dove il codice dice una cosa diversa, è il codice a
> essere in errore; dove il codice fa una cosa che la documentazione non nomina, quella
> cosa è un debito da documentare o da rimuovere. Quando due documenti si contraddicono
> vale la cascata di `L0 - Sistema`: il numero più basso comanda.

**120 finding**, codici stabili `F-nnn`. **Nessun file di codice è stato modificato da
nessuno dei tre audit.**

---

## 0 · Stato al 23 settembre 2026

**Le dodici domande di §5 hanno tutte una risposta.** Erano il blocco dichiarato del
registro — «finché non si risponde, ogni correzione è provvisoria» — e sono state sciolte
il 22 settembre. Le decisioni, con data e motivo, stanno in `tasks/storico.md`.

**Diciassette finding sono chiusi e quattro chiusi in parte**, tutti documentali: sono segnati voce
per voce qui sotto.

- **22 settembre** — chiusi `F-006`, `F-104`, `F-105`, `F-106`, `F-109`, `F-110`, `F-112`;
  in parte `F-101`, `F-107`, `F-108`, `F-119`;
- **23 settembre** — chiusi `F-008`, `F-073`, `F-074`, `F-085`, `F-107`, `F-108`, `F-114`, `F-117`, `F-118`, `F-119`; in parte `F-111`, `F-113`, `F-115`.
  Aggiornati, perché citavano documentazione nel frattempo cambiata: `F-015`, `F-024`,
  `F-057`, `F-071`, `F-078`, `F-088`, `F-100`. Aggiunto `F-120`, le decisioni del giorno
  che il codice non segue ancora.

**Tutto il resto è codice, e nessun file di `src/` è stato toccato** — né durante l'audit
né dopo.

### Come si chiudono le voci che restano

**Il codice si allinea alla documentazione.** Adesso che le dodici domande hanno una
risposta, per quasi tutte le voci non c'è più niente da decidere: c'è da leggere cosa dice
`docs/` e farlo fare al codice. Questa è la regola, e vale come predefinito.

**Se durante una correzione emerge un vuoto vero** — una cosa che la documentazione non
determina, e che il codice non può dedurre — non si sceglie l'opzione ragionevole per
andare avanti: si ferma, si scrive in `tasks/da_definire.md`, e se ne parla. Un gap del
genere è una decisione mancante, non un dettaglio di implementazione.

**Da dove cominciare non cambia:** `F-009`, il confine dell'archivio che si attraversa con
`..`, non dipendeva da nessuna delle dodici domande e non dipende da niente adesso.

---

## 0 · Le tre fonti, e cosa vale ciascuna

| Fonte | Dove | Finding | Metodo | Forza |
|---|---|---|---|---|
| **CG** | `fonti/chatgpt/` | 96 (`A001`–`A096`) | lettura + **esecuzione**: build, suite, riproduzioni isolate, sonde HTTP sul dev server | l'unica con evidenza dinamica |
| **CL** | `fonti/claude/AUDIT.md` | 53 (`AUD-01`–`AUD-53`) | sola lettura, matrici di tracciabilità nei due versi | ricostruzione del modello previsto, correzione del registro precedente |
| **DIV** | `fonti/claude/DIVERGENZE.md` | 69 (`D-xx`, `N-xx`, `A-xx`) | sola lettura, primo registro | misure grafiche componente per componente |

**Come sono stati fusi.** Ogni finding delle tre fonti è stato riletto e ricondotto a una
anomalia unica. Due voci diventano un solo `F-nnn` quando descrivono la **stessa causa**;
restano separate quando descrivono cause diverse dello stesso sintomo — per esempio il
Delay assente (`F-001`) e l'annullamento senza scadenza (`F-003`) sono due difetti
distinti dello stesso percorso. La colonna **Origine** porta sempre tutti i codici
sorgente, così ogni voce resta rintracciabile nel documento da cui viene.

**Convergenza.** 27 finding sono stati trovati **indipendentemente da due o più fonti**:
sono marcati ⊕ e vanno considerati i più solidi del registro. 9 di questi da tutte e tre.

**Attenzione ai codici.** `DIV` usa `A-01`…`A-08` per «assente», `CG` usa `A001`…`A096`
per tutti i suoi finding: sono insiemi diversi. Nel registro compaiono sempre col
prefisso della fonte (`CG:A032`, `DIV:A-01`).

### Cosa ha eseguito CG, e perché conta

| Verifica | Esito | Evidenza |
|---|---|---|
| Build `tsc --noEmit` + Vite | superata, con warning | `fonti/chatgpt/evidenze/build.log` |
| `npm run scenario` | **fallita: 3 asserzioni** | `fonti/chatgpt/evidenze/scenario.log` |
| Delay, invii doppi, undo tardivo, rinvii, tool malformati, contatti, preferenze | riprodotti con stub e orologio simulato | `fonti/chatgpt/evidenze/reproduce.json` |
| Turni concorrenti, bersaglio del finto | errori riprodotti | `fonti/chatgpt/evidenze/races.log` |
| GET/POST `/archivio` con percorsi sintetici | **200 fuori perimetro, scritture verificate** | `fonti/chatgpt/evidenze/http-test.log` |
| Script inline dei 4 banchi | 1 errore di sintassi | `fonti/chatgpt/evidenze/script-check.json` |

CL e DIV non hanno eseguito nulla: `node_modules/` era assente. Dove un finding di CL o
DIV è stato poi **provato** da CG, il registro lo dice nel campo Evidenza.

---

## 1 · Da dove cominciare

L'ordine non è per severità: è per **dipendenza**. Le prime due si chiudono senza aspettare
nessuna decisione; tutto il resto dipende dalle risposte di §5.

1. **`F-009` — il confine dell'archivio si attraversa con `..`.** Lettura e scrittura fuori
   da `memory/` e fuori da `user_123`, provate. Si chiude in poche righe e vale a
   prescindere da qualunque decisione documentale.
2. **`F-001` … `F-005` — l'invio verso l'esterno.** Il Delay non esiste, l'invio parte
   subito, può partire due volte, e l'annullamento dichiara il falso anche fuori finestra.
   È l'unico gruppo con conseguenze fuori dal computer.
3. **`F-100` — il codice obbedisce a un corpus documentale scomparso** (243 rimandi).
   È la causa prima: finché non si decide cosa farne, ogni altra correzione è provvisoria.
4. **`F-015` … `F-018` — il modello dei task è un altro modello.** Da qui dipendono viste,
   API, test e metà del design.
5. **`F-040`, `F-044` — il profilo distribuito e il suo parser non parlano la stessa
   lingua**: personaggio, voce, luoghi e orario non arrivano mai dove servono.
6. **`F-064`, `F-065`, `F-069` — il design a schermo è la revisione precedente**, in punti
   che i documenti hanno chiuso il 19 e il 21 settembre.

### Distribuzione

| Severità | Quanti |
|---|---|
| Critica / Alta | 31 |
| Media | 56 |
| Bassa | 32 |

| Categoria | Quanti |
|---|---|
| `BUG` | 28 |
| `DOC_CODE_MISMATCH` | 21 |
| `DOCUMENTATION_AMBIGUITY` | 17 |
| `PARTIAL_IMPLEMENTATION` | 15 |
| `UNDOCUMENTED_IMPLEMENTATION` | 14 |
| `DOC_MISSING_IMPLEMENTATION` | 9 |
| `LEGACY_OR_UNKNOWN` | 6 |
| `SECURITY` | 4 |
| `CONFLICTING_IMPLEMENTATION` | 3 |
| `TEST_MISMATCH` | 2 |

---

## 2 · Il registro

Legenda: ⊕ trovato indipendentemente da due o più fonti · **Certezza**: `verificato`
(dimostrato dal sorgente o riprodotto) · `forte` (catena statica completa, trigger non
riprodotto) · `da decidere` (dipende da una decisione umana).

---

### 2.1 · L'invio verso l'esterno

---

**F-001 ⊕ · Il Delay è applicato dopo la consegna: l'invio parte subito**
`DOC_CODE_MISMATCH` · **critica** · verificato · Origine: `CG:A001`, `CL:AUD-06`

- **Dove**: `src/modello/motore.ts:778-816`, in particolare `:799-800`
- **Documentazione**: `docs/L01` §Funzione Delay («*attende 90 secondi prima di
  effettuare realmente l'invio*»); `docs/L04:41`; `docs/design/L0 - Sistema.md` legge 03
- **Previsto**: `consegna` → attesa 90 s → `servizio.consegna(...)`
- **Effettivo**: `servizio.consegna(...)` è chiamato immediatamente; i 90 s
  (`REGOLE.annullamento`, `motore.ts:42`) partono **dentro la `then`** e governano solo la
  caduta in `MEMORIA`
- **Impatto**: la garanzia di sicurezza principale del prodotto non esiste
- **Evidenza**: `reproduce.json` → `delay_before_90_seconds: elapsed=0, calls=1`
- **Correzione**: accodare la chiamata prima del confine; `annulla` deve cancellare la
  scadenza (`Orologio.annulla` esiste già, `tempo.ts:84`)

**F-002 ⊕ · «No, aspetta» dichiara che nulla è uscito, mentre è già uscito**
`BUG` · **critica** · verificato · Origine: `CG:A001`, `CL:AUD-08`

- **Dove**: `src/modello/motore.ts:921-948`
- **Documentazione**: `docs/L01`; `L0` legge 03 («*annullato prima che raggiunga il
  servizio*»)
- **Effettivo**: `annulla` riporta il task a `CHIP · aspetta te` e risponde «Annullata.
  {nome} non è uscita», mentre `Posta.consegna` ha già eseguito `inviate.push(...)`
- **Impatto**: il sistema afferma all'utente un fatto falso. `docs/L00` — «*Ti accorgi
  quando sbaglia — la più difficile e la più importante*» — è violato nel punto in cui conta
- **Evidenza**: `reproduce.json` → `undo_after_91_seconds: calls=2, response="Annullata. A mamma non è uscita."`
- **Correzione**: conseguenza automatica di `F-001`

**F-003 · Annullamento senza scadenza, e timer di invii precedenti ancora validi**
`BUG` · **alta** · verificato · Origine: `CG:A013`

- **Dove**: `src/modello/motore.ts:810`, `:921`
- **Effettivo**: `annulla` verifica solo `avanzamento === 'consegnato'`, anche dopo i 90 s
  e anche in `MEMORIA`; il callback del timer legge `t.avanzamento` ma non l'identità
  dell'invio, quindi il timer di una consegna vecchia può archiviare una riconsegna nuova
- **Impatto**: falso annullamento tardivo; interferenza fra invii successivi dello stesso task
- **Evidenza**: annullamento oltre deadline riprodotto in `reproduce.json`
- **Correzione**: legare deadline e token al singolo invio, invalidare i timer precedenti

**F-004 · Invii duplicati e completamenti asincroni dopo l'abbandono**
`BUG` · **alta** · verificato · Origine: `CG:A012`

- **Dove**: `src/modello/motore.ts:778`, `:830`, `:945`
- **Effettivo**: `consegna` non controlla stato, pendenza né versione: due «manda»
  producono due invii; la `then` riporta a `CHIP · consegnato` un task nel frattempo
  abbandonato
- **Impatto**: duplicazione e resurrezione di task rimossi; i lotti hanno lo stesso difetto
- **Evidenza**: `reproduce.json` → `duplicate_send_while_pending: calls=2`;
  `completion_after_leave: CHIP/consegnato`
- **Correzione**: idempotenza per operazione, versionamento e cancellazione dei callback

**F-005 ⊕ · Il bypass esplicito del Delay non esiste in nessuna forma**
`DOC_MISSING_IMPLEMENTATION` · **alta** · verificato · Origine: `CG:A002`, `CL:AUD-09`

- **Dove**: `src/modello/tipi.ts:229`, `src/ai-engine/api.ts:180`,
  `src/ai-engine/strumenti.ts:204-217`, `:660-694`
- **Documentazione**: `docs/L01`, `docs/L04` — bypass richiesto esplicitamente, invio
  immediato, definitivo, non annullabile, valido solo per quell'invio
- **Effettivo**: `consegna` ha un solo argomento; né `Comando`, né `Uscita`, né gli
  strumenti rappresentano il bypass. **Il prompt di sistema non nomina mai la Funzione
  Delay**: il modello non sa che esiste
- **Correzione**: contratto, transizione e riga di prompt insieme a `F-001` — le tre cose
  non si possono separare

**F-006 · Il Delay non è classificato per destinazione**
`DOC_MISSING_IMPLEMENTATION` · alta · verificato · Origine: `CL:AUD-07`

> **Chiuso · 22 settembre 2026.** la documentazione dichiara ora la proprietà «attraversa il confine» (`docs/L01`, §Funzione Delay). Storico §87

- **Dove**: `src/modello/tipi.ts:105`, `:120`
- **Documentazione**: `docs/L01` — vale per «*qualsiasi servizio che invia, pubblica o
  trasmette*», non per letture e ricerche
- **Effettivo**: nessuna classificazione esiste. L'unico insieme dichiarato è
  `AUTORIZZABILI`, che risponde a una domanda diversa (quali consegne si autorizzano una
  volta per tutte) e include `note` e `disco` escludendo `posta`
- **Impatto**: blocca la correzione di `F-001`; `AUTORIZZABILI` rischia di essere scambiato
  per la lista giusta
- **Correzione**: proprietà «attraversa il confine» su `Destinazione`, documentata in `L01`

**F-007 · `aspetta` non interrompe la lavorazione pendente**
`PARTIAL_IMPLEMENTATION` · media · forte · Origine: `CG:A016`

- **Dove**: `src/modello/motore.ts:608`, `src/main.ts:310`, `src/ai-engine/ai-engine.ts:83`
- **Effettivo**: `aspetta` risponde «Aspetto» senza cancellare turni; solo la stringa
  esatta digitata spegne la voce; nessun `AbortController`
- **Impatto**: azioni e risposte possono arrivare dopo l'apparente arresto
- **Correzione**: separare pausa voce, cancellazione lavoro e annullamento invio nel
  contratto; non estendere implicitamente `aspetta`

**F-008 · Le tavole di design descrivono ancora la sequenza consegna→undo precedente al Delay**
`DOCUMENTATION_AMBIGUITY` · alta · da decidere · Origine: `CG:A084`

> **Chiuso · 23 settembre 2026.** le scene non raccontano più la consegna prima del Delay: il chip finito non esiste, e in SIDEBAR resta solo l'invio dentro i 90 secondi, azzurro (`L3 - Flusso task`, `L2 - Sidebar`). Verificato cercando la sequenza in `L2 - Bubble` e `L3`: non c'è più. Storico §58, §61

- **Dove**: `docs/design/L2 - Bubble.dc.html:583`, `docs/design/L3 - Flusso task.dc.html:178`
- **Effettivo**: le scene raccontano «fatto» a 6 s e il chip annullabile per 90 s **dopo**
  la consegna. La cascata risolve a favore di `L01`, ma le scene restano fuorvianti
- **Impatto**: una realizzazione fedele alle scene riproduce esattamente `F-001`
- **Correzione**: ridisegnare la sequenza con conclusione, attesa, invio e irrevocabilità
  distinti

---

### 2.2 · Sicurezza e confini

---

**F-009 ⊕ · Il confine dell'archivio si attraversa: lettura e scrittura fuori da `memory/` e da `user_123`**
`SECURITY` · **critica** · verificato · Origine: `CG:A032`, `CL:AUD-53`

- **Dove**: `vite.config.ts:687-700` (`dentroLArchivio`), `:788-812` (ramo POST)
- **Documentazione**: `docs/L04` — «*espone al frontend soltanto i file appartenenti
  all'utente attivo*»; `docs/L03` — «*La memoria non deve mai essere confusa tra utenti*»
- **Effettivo**: due difetti che si sommano. (1) il setaccio
  `/^[A-Za-z0-9._-]+$/` **include il punto**, quindi il segmento `..` lo attraversa
  intatto — e il commento accanto afferma il contrario («*il che esclude già `..`*»);
  (2) `dove.startsWith(RADICE + sep)` confina dentro `Archivio/**users**`, non dentro la
  cartella dell'utente; il controllo su `pezzi[0]` guarda solo il primo segmento. Sul POST
  la guardia `memory/` è applicata all'URL mentre il nome del file arriva dal corpo e non
  viene riverificato sul percorso risolto
- **Impatto**: lettura e sovrascrittura arbitrarie dentro `Archivio/users/`. Oggi c'è un
  solo utente, ma la garanzia su cui `L03` insiste è già rotta, e lo sarà in produzione al
  secondo utente
- **Evidenza**: `http-test.log` →
  `GET /archivio/user_123/../audit_sibling/probe.txt` → **200** `"SYNTHETIC_SIBLING_DATA"`;
  `POST …{"percorso":"../services/audit-probe.md"}` → **200**;
  `POST …{"percorso":"../../audit_sibling/audit-probe.md"}` → **200**; `writes_verified True True`
- **Correzione**: confinare a `resolve(RADICE, UTENTE_PRINCIPALE)`; rifiutare `.` e `..`
  esplicitamente; riverificare `memory/` sul percorso risolto; correggere il commento
- **Nota**: `CL` aveva inizialmente dichiarato **conforme** questo confine, accettando
  l'affermazione del commento invece di provarla. L'errata è in `fonti/claude/AUDIT.md` §6.1

**F-010 · I symlink non sono considerati dal controllo di confinamento**
`SECURITY` · media · forte · Origine: `CG:A033`

- **Dove**: `vite.config.ts:687-700`
- **Effettivo**: il confronto è lessicale; `readFileSync`/`writeFileSync` seguono i link
  senza `realpath`/`lstat`
- **Impatto**: un link dentro l'archivio aggira il controllo anche eliminando `..`.
  Prerequisito: link creato localmente
- **Evidenza**: analisi statica; nessuna catena di symlink è stata costruita
- **Correzione**: confinare il percorso **reale** e le directory genitrici, con politica
  esplicita sui link

**F-011 · URL immagine interpolato in HTML senza escape dell'attributo**
`SECURITY` · bassa · forte · Origine: `CG:A075`

- **Dove**: `src/conoscenza/profilo.ts:306`, `src/aree/schermo.ts:207`, `:923`
- **Effettivo**: `nomeFile` accetta stringhe `http`, e `src` è interpolato senza `esc`:
  virgolette interne possono chiudere l'attributo
- **Impatto**: HTML injection da un file preferenze alterato. Richiede controllo locale
  del documento: nessuna via remota è provata
- **Correzione**: assegnare `src` via proprietà su un nodo, con URL validato

**F-012 · Payload HTTP senza limiti, errori classificati troppo grossolanamente**
`BUG` · media · forte · Origine: `CG:A076`

- **Dove**: le tre porte di `vite.config.ts`
- **Effettivo**: il corpo è accumulato senza limite; JSON o forma errati diventano
  500/502; letture e scritture sincrone bloccano l'event loop su contenuti grandi
- **Correzione**: limiti e schema per endpoint; 400/413 coerenti; I/O proporzionato

**F-013 · Il testo della conversazione finisce nei log di console**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CG:A077`

- **Effettivo**: `console.info` stampa la frase integrale a ogni passo, insieme ai contatori
- **Impatto**: copie del contenuto nei log del terminale, con durata e accesso non stabiliti
- **Correzione**: decidere la politica diagnostica e la minimizzazione del testo

**F-014 · Fixture e dati reali non sono distinguibili nel repository**
`DOCUMENTATION_AMBIGUITY` · bassa · da decidere · Origine: `CG:A092`

> **Rimandato · 23 settembre 2026.** la decisione è stata rinviata dal proprietario del progetto. Storico §108

- **Dove**: `Archivio/users/user_123/**`
- **Effettivo**: profilo, sistema, servizi e media sono tracciati; solo `chat-raw` è
  ignorata. Non è specificato come sostituire le fixture con dati personali senza
  committarli
- **Nota**: `preferences.txt` contiene `password: ciao`. Verificato che **non** raggiunge
  il provider (vedi `F-041`): il rischio è il repository, non il prompt
- **Correzione**: politica fixture/dati locali e procedura di personalizzazione

---

### 2.3 · Il modello dei task

---

**F-015 ⊕⊕ · Gli stati e i luoghi sono rimasti al contratto precedente**
`DOC_CODE_MISMATCH` · **critica** · verificato · Origine: `CG:A003`, `CL:AUD-01`, `DIV:D-27`

> **Aggiornato · 23 settembre 2026.** il «previsto» segue il modello deciso — `T_DRAFT` al posto di `T_NUOVO`, sotto-task già in `T_LAVORAZIONE`. La decisione umana è presa: il codice si adegua. Storico §2, §25

- **Dove**: `src/modello/tipi.ts:17-41`; propagato a `motore.ts`, `vista.ts:24-31`, `strumenti.ts`
- **Documentazione**: `docs/L01` §Gli stati dei task — quattro stati con le loro transizioni
- **Previsto**: `T_DRAFT → T_LAVORAZIONE → {T_ATTESA | T_CONCLUSIONE}`, ritorno da
  `T_ATTESA`, sotto-task che nasce già in `T_LAVORAZIONE`
- **Effettivo**: due assi — `Luogo` (6 valori) × `Avanzamento` (6 valori) — con tabella di
  combinazioni legali. **La stringa `T_NUOVO` non compare in nessun file di `src/`**.
  I task nascono direttamente in attesa o programmato; la comprensione non è rappresentata
- **Impatto**: nessuna affermazione di `L01` sul ciclo di vita è verificabile. Transizioni,
  viste, API e test parlano un altro modello
- **Correzione**: decisione umana (§5 Q1). Non è una rinominazione di enum: non esiste
  mappa 1:1 — `T_ATTESA` copre `aspetta te`, `bloccato` e `programmato`, che nel codice
  hanno colori e frasi diversi

**F-016 ⊕ · `CARTA` e `MEMORIA` sono luoghi di task, contro una tabella esplicita**
`CONFLICTING_IMPLEMENTATION` · alta · verificato · Origine: `CL:AUD-04`, `DIV:D-28`, `CG:A003`

- **Dove**: `src/modello/tipi.ts:18`, `:29-36`; `src/ai-engine/vista.ts:24-31`
- **Documentazione**: `L0` legge 03 — tabella a due righe (DESK, SIDEBAR), più «*La
  NOTIFICATIONBAR non compare in questa tabella*» e «*Anche la MEMORIA non compare*»
- **Effettivo**: sei luoghi, fra cui proprio i due esclusi. `vista.ts:30` **dichiara
  MEMORIA al modello** come area, quindi l'AI può ragionarci sopra
- **Correzione**: rimuovere `CARTA` e `MEMORIA` da `Luogo`

**F-017 ⊕⊕ · Un task concluso è archiviato e resta richiamabile**
`DOC_CODE_MISMATCH` · alta · verificato · Origine: `CG:A005`, `CL:AUD-05`, `DIV:D-29`

- **Dove**: `src/modello/motore.ts:810-813`, `:843-850`, `:911`, `:945`
- **Documentazione**: `L0` legge 03 — «*Un task concluso non viene archiviato
  automaticamente*»; `docs/L01` §Memory Engine
- **Effettivo**: scaduti i 90 s il task va in `MEMORIA` e resta nell'array; `richiama`
  cerca anche fra i conclusi e i consegnati
- **Impatto**: task archiviati rientrano in esecuzione e interferiscono con ricerca,
  selezione e Timeline
- **Correzione**: il task lascia il modello; separare ciclo di vita e storia

**F-018 ⊕ · Richiesta e contesto non formano sistematicamente un task**
`PARTIAL_IMPLEMENTATION` · alta · forte · Origine: `CG:A004`, `CL:AUD-02`

- **Dove**: `src/ai-engine/ai-engine.ts:83`, `src/ai-engine/strumenti.ts`, `motore.ts:1106`
- **Documentazione**: `docs/L01` §Il flusso principale — il prompt viene **esploso** in
  contesto e richiesta, che insieme formano un task
- **Effettivo**: il ciclo esegue tool su stato globale; i task nascono solo per casi
  speciali (composizione, riassunto, fixture, promemoria). Non esiste un percorso generale
  di creazione
- **Nota**: una domanda semplice può legittimamente restare uno scambio
  (`L2 - INPUT`), quindi non è contata come task mancante
- **Correzione**: definire il percorso generale e il rapporto task/sotto-task, senza
  dedurlo dalle specializzazioni esistenti

**F-019 · Rinvii e arrivi futuri non tornano al lavoro alla scadenza**
`BUG` · alta · verificato · Origine: `CG:A011`

- **Dove**: `src/modello/motore.ts:337`, `:369`, `:885`
- **Effettivo**: `rimanda` programma solo il preavviso a 105 min; a 120 non accade nulla.
  Gli arrivi in `ORARIO` non hanno timer. Una `CARTA` dopo 60 min diventa `ORARIO` anche
  senza avere un'ora
- **Impatto**: i lavori differiti diventano invisibili o restano in attesa indefinita
- **Evidenza**: `reproduce.json` → dopo 121 minuti: `ORARIO / aspetta te`
- **Correzione**: schedulare la condizione effettiva e la transizione di ripresa; eliminare
  il timer `CARTA` obsoleto

**F-020 ⊕ · Le costanti temporali del modello non hanno una fonte documentale**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CL:AUD-51`, `CG:A043`

- **Dove**: `src/modello/motore.ts:35-44`
- **Effettivo**: `cartaSenzaRisposta` 60 min, `preavviso` 15 min, `rinvio` 120 min citano
  `docs/01-modello §3`, inesistente. Solo i 90 s hanno una fonte in `docs/`. Lo stesso vale
  per il tetto di 10 passi, la cache 1 h, `max_tokens: 4000`
- **Correzione**: registro dei parametri approvato; rimuovere ciò che non è adottato

**F-021 · I tempi di conclusione e di riposo automatico della bolla non esistono**
`DOC_MISSING_IMPLEMENTATION` · media · verificato · Origine: `CG:A055`

- **Dove**: `src/modello/motore.ts:36`, `src/aree/schermo.ts:352`
- **Documentazione**: `L2 - Bubble` — conclusione visibile 6 s, riposo dopo 30 min
- **Effettivo**: esistono solo 90 s, 60 min, 120 min e i timer di animazione
- **Correzione**: riconciliare prima la sequenza conclusione/Delay nei documenti (`F-008`),
  poi implementare

---

### 2.4 · Le notifiche

---

**F-022 ⊕ · Le notifiche diventano task da sole: il modello corretto è dietro un flag spento**
`DOC_CODE_MISMATCH` · alta · verificato · Origine: `CG:A006`, `CL:AUD-11`

- **Dove**: `src/modello/motore.ts:109`, `:337`; `src/main.ts:439`
- **Documentazione**: `docs/L02` NOTIFICATIONBAR; `L2 - Notificationbar` — «*Una notifica
  non è un task: lo diventa quando dici «me ne occupo»*»
- **Effettivo**: `conCassetto = false` è il predefinito, quindi un arrivo crea direttamente
  `CARTA`/`ORARIO` e la campanella non si disegna. Il comportamento normativo esiste, ma
  si accende solo dalla pedana
- **Impatto**: il prodotto si avvia nel modello sbagliato; il banco permette di alternare
  due modelli incompatibili
- **Correzione**: rendere unico il flusso documentato, rimuovere il flag

**F-023 · Nel percorso predefinito le notifiche silenziose sono perse**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A007`

- **Dove**: `src/modello/motore.ts:343`, `src/confini/filtro.ts`
- **Documentazione**: `L2 - Notificationbar` — «*Quello che è scartato non è perso*»
- **Effettivo**: con il flag spento, l'esito `niente` ritorna **prima** di salvare l'arrivo
- **Correzione**: conservare l'arrivo separatamente dalla decisione di notificare

**F-024 · La promozione rimuove la notifica originale**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A008`

> **Aggiornato · 23 settembre 2026.** la frase citata è uscita da `L2 - Bubble` con la sezione «Tre taglie». La regola resta in `L0` §NOTIFICATIONBAR: i banner del cassetto «*non migrano, non hanno stato*». Il finding resta aperto

- **Dove**: `src/modello/motore.ts:1053`
- **Documentazione**: `L2 - Bubble` — «*La riga resta dov'era: il mondo non si consuma
  quando lo guardi*»
- **Effettivo**: `estrai` elimina la notifica dall'array mentre crea il task
- **Correzione**: conservare la notifica con un collegamento al task e uno stato di presa
  in carico

**F-025 · L'ordinale delle notifiche non corrisponde all'ordine mostrato**
`BUG` · alta · verificato · Origine: `CG:A009`

- **Dove**: `src/aree/schermo.ts:610`, `src/modello/motore.ts:954`
- **Effettivo**: il disegno ordina per data crescente e include i task in `ORARIO`;
  `scegli` usa solo le notifiche, in ordine inverso
- **Impatto**: «la seconda» può selezionare un messaggio diverso da quello letto
- **Correzione**: una sola proiezione ordinata, gli stessi identificatori in vista e selezione

**F-026 · Le notifiche non hanno il contratto completo di mittente, oggetto e ora**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A010`

- **Dove**: `src/modello/tipi.ts:190`, `src/aree/schermo.ts:618`, `src/confini/posta.ts`
- **Documentazione**: `L2 - Notificationbar` — «*mittente e oggetto veri, mai riscritti*»
- **Effettivo**: nome e testo delle fixture sono sintetici; non esiste un campo oggetto
  originale; `chi ?? orario` sostituisce l'ora con la fonte
- **Correzione**: conservare e rappresentare i dati originali

---

### 2.5 · Il turno e l'AI engine

---

**F-027 · In conversazioni concorrenti le risposte finiscono sul turno sbagliato**
`BUG` · **alta** · verificato · Origine: `CG:A014`

- **Dove**: `src/ai-engine/ai-engine.ts:83`, `src/modello/motore.ts:1474`, `src/main.ts:323`
- **Effettivo**: `turno` non identifica lo scambio; `rispondi` riempie l'ultimo scambio
  senza risposta, qualunque richiesta l'abbia prodotta
- **Impatto**: domande e risposte si mescolano, e i turni successivi ricevono una
  cronologia sbagliata — quindi l'errore si propaga
- **Evidenza**: `races.log` → `[{"question":"prima domanda"},{"question":"seconda domanda","answer":"risposta alla prima"},{"question":"","answer":"risposta alla seconda"}]`
- **Correzione**: id del turno, contesto isolato, collegamento esplicito dei risultati

**F-028 · L'interprete finto consegna il task precedente invece di quello nominato**
`BUG` · **alta** · verificato · Origine: `CG:A090`

- **Dove**: `src/ai-engine/finto.ts:77`, `src/ai-engine/regole.ts:224`, `:264`
- **Effettivo**: accoda `al_centro` sul task nominato ma interpreta **prima** di eseguirlo,
  quindi `consegna` porta l'id del fuoco vecchio
- **Impatto**: invio del contenuto sbagliato quando è attivo il fallback — che è il
  percorso predefinito senza chiave (`F-031`)
- **Evidenza**: `races.log` → `named_send {"named":"t1","focused":"t2","moves":[al_centro t1, consegna t2]}`
- **Correzione**: risolvere il bersaglio esplicito prima della traduzione

**F-029 · La validazione dei tool è incompleta: valori malformati accettati, `null` fa crashare il turno**
`BUG` · **alta** · verificato · Origine: `CG:A017`

- **Dove**: `src/ai-engine/api.ts:66`, `:165`
- **Documentazione**: `docs/L00` — «*Ogni mossa viene da un elenco chiuso … nel dubbio il
  sistema chiede invece di tirare a indovinare*»
- **Effettivo**: sono controllati presenza ed enum, non tipi, interi o proprietà extra.
  `null` produce `TypeError`; `1.5` è accettato come indice
- **Evidenza**: `reproduce.json` → `null_arguments: TypeError: Cannot read properties of null`;
  `fractional_tool_index: {visto:"fatto", comando:"scegli"}`
- **Correzione**: validare lo schema completo prima dell'esecuzione, con errore tipizzato

**F-030 · Il risultato `fatto` non riflette l'esito reale della mossa**
`BUG` · media · verificato · Origine: `CG:A018`

- **Dove**: `src/ai-engine/api.ts:125`, `src/modello/motore.ts:778`
- **Effettivo**: `m.esegui` restituisce `void`; l'API risponde `fatto` anche per no-op,
  blocchi o invii ancora pendenti
- **Impatto**: il modello può annunciare un successo mai avvenuto e proseguire su premesse
  false
- **Correzione**: esito distinto fra accettato, in corso, rifiutato, concluso, fallito

**F-031 · Il ripiego sull'interprete finto è permanente e silenzioso**
`UNDOCUMENTED_IMPLEMENTATION` · **alta** · verificato · Origine: `CG:A019`

- **Dove**: `src/ai-engine/ai-engine.ts:188`, `src/main.ts:129`, `:177`
- **Documentazione**: `docs/L04` — il prompt è analizzato da OpenRouter. La simulazione è
  documentata per memoria e servizi, **non** come sostituzione del ragionamento
- **Effettivo**: dopo un 503 o tre errori si passa alle regex per tutta la sessione; lo
  dichiarano solo la console e un nome interno che non arriva a schermo
- **Impatto**: l'utente non distingue un guasto da un cambiamento radicale di capacità.
  E in quella modalità vale `F-028`: può inviare la cosa sbagliata
- **Correzione**: modalità offline esplicita o errore recuperabile, con stato visibile

**F-032 · Turni che finiscono senza risposta: limite passi, output vuoto, `fetch` senza timeout**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A020`

- **Dove**: `src/ai-engine/ai-engine.ts:56`, `:90`, `:250`
- **Effettivo**: al decimo passo si esce senza spiegazione; zero mosse termina in silenzio;
  nessun timeout esplicito sul `fetch`
- **Correzione**: timeout, budget e risultato terminale esplicito; distinguere errore da
  nessuna azione

**F-033 · La scadenza di INPUT si conta dall'invio dell'utente, non dall'ultimo scambio**
`BUG` · media · verificato · Origine: `CG:A015`

- **Dove**: `src/modello/motore.ts:307`, `:1478`, `src/main.ts:245`
- **Documentazione**: `L2 - INPUT` — lo scambio resta 30 s **dall'ultimo scambio**
- **Effettivo**: riempire `risposta` non aggiorna `quando`; una risposta lenta può arrivare
  a conversazione già chiusa
- **Correzione**: aggiornare l'attività alla risposta e riprogrammare la chiusura

**F-034 ⊕ · I secondari sono sempre simulati, anche con il modello vero attivo**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A021`, `CL:AUD-42`

- **Dove**: `src/main.ts:137`, `src/ai-engine/secondari.ts:97`, `src/modello/motore.ts:188`
- **Effettivo**: il cablaggio costruisce sempre `SecondarioFinto`, con ritardi fissi ed
  estratti testuali. Il ramo `Porta(chi: 'secondario')` e `ARNESI.secondario` lato server
  esistono e non sono mai esercitati
- **Impatto**: preparazioni complesse sembrano eseguite e sono euristiche
- **Correzione**: implementare il percorso o dichiarare la simulazione nel contratto

**F-035 · Deleghe: errori soppressi e risultati in ordine di completamento**
`BUG` · media · verificato · Origine: `CG:A022`

- **Dove**: `src/modello/motore.ts:199`, `:224`
- **Effettivo**: `catch` vuoto; se almeno uno riesce annuncia «Ho finito»; i risultati sono
  accodati nell'ordine di risoluzione, senza id del sotto-lavoro
- **Impatto**: successi parziali presentati come completi; testo instabile
- **Correzione**: risultati per id, errori parziali riportati, controllo dello stato del task

**F-036 ⊕ · Il ramo provider nativo è irraggiungibile, e i commenti promettono un provider che non c'è**
`DEAD_CODE` · media · verificato · Origine: `CG:A042`, `CL:AUD-21`, `DIV:D-31`

- **Dove**: `vite.config.ts:135-158`, `:220-266`, `:545-556`
- **Documentazione**: `docs/L04` — OpenRouter unico provider, architettura estendibile
- **Effettivo**: `nativo` è sempre `false`, quindi il blocco `betas`/`fallbacks`/
  `output_config` è morto. I commenti descrivono una strada `ANTHROPIC_API_KEY` con regola
  di precedenza: quella chiave **non viene mai letta**. `Fornitore.nome` ammette solo
  `'openrouter'`, quindi l'estendibilità promessa non è predisposta
- **Nota**: usare l'SDK Anthropic come trasporto verso OpenRouter non è di per sé un
  secondo provider
- **Correzione**: rimuovere il ramo morto e i commenti, oppure implementare la seconda strada

**F-037 ⊕ · Parametri e API del motore non sono specificati da nessun documento attuale**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CG:A043`, `CL:N-12`

- **Dove**: `src/ai-engine/strumenti.ts` (722 righe), `src/modello/tipi.ts:235-241`
- **Effettivo**: 38 strumenti, due liste di permessi, 32 comandi, gruppi e lotti, e le
  istruzioni di personaggio esistono solo nel codice e in riferimenti rimossi
- **Impatto**: non è determinabile quali dettagli siano autorizzati e quali siano residui
- **Correzione**: approvare un contratto API e un registro dei parametri

---

### 2.6 · Dati, profilo, servizi

---

**F-038 ⊕ · La rubrica e i servizi operativi sono indipendenti dai documenti di contesto**
`CONFLICTING_IMPLEMENTATION` · **alta** · verificato · Origine: `CG:A023`, `CL:AUD-12`

- **Dove**: `src/confini/contatti.ts:77-110`, `src/confini/posta.ts`, `src/main.ts:96`
- **Documentazione**: `docs/L03` §`services` — «*i documenti al suo interno sono contesto
  testuale e **sostituiscono le chiamate ai servizi reali***»
- **Effettivo**: l'AI riceve `services/contacts.txt` nel prompt; il motore usa `RUBRICA`,
  un array `const` nel codice. Nessun nome coincide tranne «Mamma», con recapito diverso
  (`mamma@gmail.com` contro `carla.moretti@posta.it`)
- **Impatto**: l'assistente conosce dati che non può usare. «Manda una mail a Marco» viene
  inteso dal modello e rifiutato dal motore
- **Evidenza**: `reproduce.json` → `contact_substring: marco=null`
- **Correzione**: unificare la sorgente sui documenti dell'utente

**F-039 · La ricerca dei contatti è per sottostringa, senza disambiguazione**
`BUG` · **alta** · verificato · Origine: `CG:A024`

- **Dove**: `src/confini/contatti.ts:48`, `:57`
- **Documentazione**: `docs/L00` — nel dubbio il sistema chiede
- **Effettivo**: `includes` riconosce «Giulia» dentro «Giuliano» e «Capo» dentro
  «capolavoro»; vince la corrispondenza più lunga
- **Impatto**: destinatario sbagliato già in composizione
- **Evidenza**: `reproduce.json` → `giuliano → Giulia`, `capolavoro → Capo`
- **Correzione**: risoluzione per parole intere, e domanda esplicita nei casi ambigui

**F-040 ⊕ · Il parser delle preferenze è incompatibile con il file distribuito**
`BUG` · **alta** · verificato · Origine: `CG:A029`, `CL:AUD-17`, `DIV:D-35`

- **Dove**: `src/conoscenza/profilo.ts:229`, `:263-268`; `Archivio/users/user_123/preferences.txt`
- **Documentazione**: `docs/L03` — `preferences.txt` contiene «*lingua, tema, luoghi
  conosciuti e configurazione della voce dell'assistente*»
- **Effettivo**: il parser cerca chiavi che il file non ha:

  | il parser cerca | il file scrive | esito |
  |---|---|---|
  | `location from gps` | `focuses:` | luogo noto mai risolto |
  | `figli('preferenze') → voce` | `settings: → voice:` | voce non letta |
  | `figli('preferenze') → nome` | `settings: → name: amanda` | nome assistente non letto |
  | `figli('preferenze') → sesso` | `settings: → assistant gender` | non letto |
  | `lettura` | `reading: on` | `true` **per caso** |
  | `prosa('copione')` | `copione:` vuoto | `undefined` |
  | `notifications → set/sound` | assente | predefiniti |
  | `theme` | `theme: cenere` | unica che funziona |

- **Impatto a catena**: `Personaggio` arriva **vuoto** a `istruzioni()`
  (`vite.config.ts:124`), quindi il blocco «Ti chiami Amanda» e la sezione «Come parli»
  non entrano mai nel prompt. Tutta la funzionalità «personaggio» è inerte con i dati che
  il repo spedisce
- **Evidenza**: `reproduce.json` → `documented_reading_off: reading=true` (lettura
  dichiarata `off` resta accesa)
- **Correzione**: un solo schema testuale, allineato fra parser, fixture e validazione — e
  **documentato**, perché oggi il formato non sta scritto da nessuna parte (`F-113`)

**F-041 ⊕ · Il contesto dell'AI non contiene le preferenze stabili dell'utente**
`PARTIAL_IMPLEMENTATION` · alta · verificato · Origine: `CG:A028`, `CL:AUD-45`

- **Dove**: `src/conoscenza/profilo.ts:263`, `vite.config.ts:112-121`
- **Documentazione**: `docs/L02` — INPUT legge `memory/general.txt`, `preferences.txt`,
  `system.txt` e i documenti in `services`
- **Effettivo**: il prompt passa solo `p.assistente` a `istruzioni`, più `system.txt`,
  `memory/*` e `services/*`. Preferenze e luoghi registrati non sono serializzati;
  `filesystem.txt` non entra
- **Nota verificata**: l'esclusione della password è **corretta e conforme** a `docs/L03`
- **Correzione**: contesto utente esplicito e filtrato, mantenendo l'esclusione della password

**F-042 · Valori di sistema mancanti o malformati diventano dati inventati**
`BUG` · media · verificato · Origine: `CG:A030`

- **Dove**: `src/conoscenza/profilo.ts:207`, `:255`, `:384`
- **Effettivo**: `numero` elimina segni e separatori; `microfono` ed `ethernet` assenti
  diventano `true`; un caricamento fallito conserva il profilo predefinito senza avviso
- **Impatto**: stato macchina o identità fuorvianti, valori fuori range, falso ascolto
- **Correzione**: validare schema e intervalli; distinguere assente, sconosciuto, spento
  ed errore di lettura

**F-043 ⊕ · WorkMode e riconoscimento dei luoghi registrati non esistono**
`DOC_MISSING_IMPLEMENTATION` · media · verificato · Origine: `CG:A031`, `CL:AUD-18`, `DIV:A-01`

- **Dove**: `src/conoscenza/profilo.ts:213`, `src/aree/schermo.ts:199`, `src/conoscenza/contesto.ts:30`
- **Documentazione**: `docs/L02` PROFILEBAR — «*GPS e Data e ora contribuiscono a definire
  un WorkMode*»; `L2 - Profilebar` mostra «Casa Deep»
- **Effettivo**: nessuna risoluzione fra `focuses` e GPS, nessun WorkMode; il luogo è due
  stringhe separate da un punto mediano
- **Correzione**: implementare le regole dal profilo; chiarire la precedenza fra modalità

**F-044 ⊕ · Identità, orario e progetti dell'utente sono cablati nel codice**
`UNDOCUMENTED_IMPLEMENTATION` · alta · verificato · Origine: `CG:A073`, `CL:AUD-16`, `DIV:D-34`

- **Dove**: `src/conoscenza/contesto.ts:23-32`, `src/confini/filtro.ts:20`, `src/modello/motore.ts:276`
- **Effettivo**: `utilizzatore: 'Manuel Cucca'`, `dove: 'casa · Genova'`, `mestiere`,
  `oreDiLavoro {8,19}`, `progetti: ['Acme','Aurora']`. `main.ts:91-92` sovrascrive **solo**
  nome e luogo: orario e progetti restano quelli del codice e alimentano il filtro, la
  potatura della memoria, la Timeline e il riconoscimento dei nomi
- **Nota**: `memory/general.txt` dichiara «*Lavoro fra le 9 e le 19*»; il codice usa 8–19;
  `L2 - TIMELINE` disegna 8–19. Tre fonti, due valori (`F-114`)
- **Correzione**: leggere tutto il contesto dal profilo; non usare esempi di tavola come
  regole di business

**F-045 · Il filesystem, dichiarato indispensabile, non è collegato al flusso dei servizi**
`DOC_MISSING_IMPLEMENTATION` · alta · verificato · Origine: `CG:A025`

- **Dove**: `src/main.ts:124`, `src/confini/disco.ts`, `Archivio/users/user_123/filesystem.txt`
- **Documentazione**: `docs/L03` — «*filesystem è l'unico servizio che viene di base
  attivato e non è possibile da non usare. Se non ci fosse il sistema non funzionerebbe*»
- **Effettivo**: `Disco` serve alla memoria ma non è nel `Registro`; `filesystem.txt` non
  entra nel prompt; la porta HTTP serve file noti e non implementa «cerca documento»
- **Correzione**: collegare contesto e operazioni nel perimetro del prototipo

**F-046 · `filesystem.txt` è una copia byte-identica di `system.txt`**
`BUG` · media · verificato · Origine: `CL:AUD-15`

- **Dove**: `Archivio/users/user_123/filesystem.txt`
- **Effettivo**: contiene microfono, batteria, WIFI, ethernet, volume, gps — cioè
  `system.txt`. `diff` conferma l'identità
- **Impatto**: il servizio dichiarato indispensabile non ha contesto. Oggi l'errore è
  silenzioso perché il file non è letto da nessuno (`F-041`)
- **Correzione**: scrivere il contenuto vero e decidere se entra nel contesto dell'AI

**F-047 · `sms` è una destinazione senza servizio: un task che la usa si blocca**
`PARTIAL_IMPLEMENTATION` · bassa · verificato · Origine: `CL:AUD-38`

- **Dove**: `src/modello/tipi.ts:105`, `src/main.ts:114`
- **Effettivo**: `Destinazione` include `'sms'`; il `Registro` non lo ha. Un'uscita verso
  `sms` o `disco` finisce in `blocca(t, 'non ho un modo per scrivere su sms')`
- **Correzione**: togliere `sms` finché non c'è il servizio

**F-048 · I servizi simulati assumono date e identità che nessun contratto definisce**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CG:A091`

- **Dove**: `src/confini/calendario.ts:68`, `src/confini/promemoria.ts:110`, `src/confini/contatti.ts:35`
- **Effettivo**: il calendario registra la consegna all'istante corrente, non all'ora
  richiesta; i promemoria confrontano i testi per inclusione; i contatti sono aggiunti
  senza recapito; le note accodano stringhe
- **Impatto**: le risposte «fatto» non equivalgono ad aver creato l'evento, la data o il
  contatto richiesti; le fixture diventano regole implicite
- **Correzione**: contratto minimo delle simulazioni, distinguendo dimostrazione, lettura
  di contesto e operazione futura

**F-049 · Le fixture della posta si rivolgono a una persona diversa dall'utente**
`BUG` · bassa · verificato · Origine: `CL:AUD-44`

- **Dove**: `src/confini/posta.ts:74`
- **Effettivo**: l'ingresso dello scenario dice «Ciao Manuel», mentre l'utente del profilo
  è Lucia Moretti e il contesto cablato dice Manuel Cucca (`F-044`)
- **Correzione**: allineare le fixture all'utente del profilo

---

### 2.7 · Memoria e archivio

---

**F-050 ⊕ · Memoria semantica e abitudini automatiche esistono senza autorizzazione documentale**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CG:A026`, `CL:N-07`

- **Dove**: `src/archivio/archivio.ts:67`, `:100`, `src/ai-engine/finto.ts:160`
- **Documentazione**: `docs/L01`, `L03`, `L04` — nel prototipo la memoria è un documento
  di contesto; il criterio di selezione **non è ancora definito**
- **Effettivo**: entità, collegamenti datati con autore, smentite, ipotesi promosse a
  preferenza dopo tre prove, tetto dell'estratto e seme sono implementati e attivi in
  memoria
- **Impatto**: l'architettura semantica e le regole di autonomia sono anticipate senza
  decisione. E i dati si perdono al reload, nonostante il sistema risponda «me lo segno»
- **Correzione**: sospendere o segregare ciò che non è deciso; non dedurre ora una
  politica di persistenza dalle strutture temporanee

**F-051 ⊕ · La catena di scrittura della memoria è morta, e il formato non combacia col documento**
`DEAD_CODE` · media · verificato · Origine: `CG:A037`, `CG:A072`, `CL:AUD-39`

- **Dove**: `src/archivio/archivio.ts:330-334`, `src/confini/disco.ts:86-104`, `vite.config.ts:788-812`
- **Effettivo**: tre livelli scollegati. `Archivio.salva()`, `salvaOsservato()`,
  `salvaPreferenze()` sono **no-op vuoti**; quindi `Disco.scrivi()`, `.esiste()`,
  `.quanti()` non sono chiamati da nessun file; e l'endpoint POST accetta **solo `.md`**
  mentre il documento prescrive `general.**txt**`
- **Impatto**: una porta di scrittura funzionante, irraggiungibile, che rifiuterebbe
  comunque il nome documentato
- **Correzione**: rimuovere la catena, oppure riattivarla **e** allineare l'estensione a `L03`

**F-052 · La raccolta non indicizza le entità del documento di memoria**
`CONFLICTING_IMPLEMENTATION` · media · verificato · Origine: `CG:A027`

- **Dove**: `src/archivio/archivio.ts:243`, `:309`, `src/aree/raccolta.ts:58`
- **Effettivo**: `general.txt` è letto correttamente sia dal server sia da
  `Archivio.semina`; ma `nomi()` restituisce solo le entità annotate nella sessione, e la
  raccolta usa `nomi()` invece del seme
- **Nota**: CG segnala di aver **corretto un proprio sospetto iniziale** in seconda
  passata — `general.txt` viene letto; il difetto è l'indicizzazione
- **Correzione**: definire l'indicizzazione dei nomi noti per la raccolta

**F-053 · La chat raw può perdere messaggi senza blocco né recupero**
`PARTIAL_IMPLEMENTATION` · **alta** · verificato · Origine: `CG:A034`

- **Dove**: `src/archivio/chat-raw.ts:6`, `src/modello/motore.ts:430`
- **Documentazione**: `docs/L01`, `L03` — archivio **integrale** degli scambi
- **Effettivo**: `fetch` fire-and-forget, errori solo in console, nessun retry, ack o coda;
  il lavoro prosegue anche se la scrittura fallisce
- **Impatto**: l'integrità dichiarata dell'unico archivio persistente non è garantita
- **Correzione**: consegna affidabile con id e coda; segnalare e recuperare i salvataggi mancati

**F-054 · L'ordine cronologico della chat raw non è garantito**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A035`

- **Dove**: `src/archivio/chat-raw.ts:6`, `vite.config.ts:741-755`
- **Documentazione**: `docs/L03` — «*aggiunti in ordine cronologico*»
- **Effettivo**: richieste concorrenti, timestamp preso dal client, append nell'ordine di
  arrivo, nessuna sequenza
- **Evidenza**: `http-test.log` → due POST con timestamp decrescente accettati; il JSONL
  conserva l'ordine inverso
- **Correzione**: sequenza monotona; definire il contratto temporale

**F-055 · Il testo «originale» viene normalizzato prima di essere archiviato**
`DOC_CODE_MISMATCH` · bassa · verificato · Origine: `CG:A036`

- **Dove**: `src/main.ts:290`, `src/archivio/chat-raw.ts:3`
- **Documentazione**: `docs/L03` — «*testo originale*»
- **Effettivo**: il campo è `trim` prima del turno; `salvaMessaggio` scarta i testi vuoti
- **Correzione**: separare il testo grezzo registrato da quello normalizzato

**F-056 · Il giorno del file di chat raw è calcolato su un fuso cablato**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CL:AUD-24`

- **Dove**: `vite.config.ts:741`
- **Effettivo**: `toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })`, mentre il
  `timestamp` della riga è in UTC: nome del file e contenuto usano due riferimenti diversi
- **Correzione**: documentare il fuso in `L03`

---

### 2.8 · Stack, build, toolchain

---

**F-057 ⊕⊕ · Lo stack prescritto non è quello del progetto: niente React, niente Tailwind**
`DOC_CODE_MISMATCH` · **alta** · verificato · Origine: `CG:A038`, `CL:AUD-20`, `DIV:D-30`

> **Aggiornato · 23 settembre 2026.** la decisione umana è presa: il codice passa a React, Vite e Tailwind. Storico §4

- **Dove**: `package.json`, `src/main.ts`, `src/aree/schermo.ts`, `src/stile/base.css`
- **Documentazione**: `docs/L04` — «*Il prototipo è un sito React, Vite e Tailwind*»
- **Effettivo**: TypeScript vanilla con costruzione imperativa del DOM via template
  string, e 1 126 righe di CSS scritte a mano. React e Tailwind non sono né dipendenze né
  componenti. Vite sì
- **Impatto**: una scelta architetturale centrale, deliberata e scritta, è disattesa
- **Correzione**: decisione umana (§5 Q3). Non si può dichiarare conforme lo stack
  esistente senza cambiare formalmente il requisito

**F-058 ⊕ · Build e preview non includono il backend del prototipo**
`PARTIAL_IMPLEMENTATION` · **alta** · verificato · Origine: `CG:A039`, `CL:AUD-22`

- **Dove**: `vite.config.ts:483`, `:715`, `:847` — tutti e tre i plugin implementano solo
  `configureServer`
- **Documentazione**: `docs/L04` — l'accesso ai documenti passa dal processo Node
- **Effettivo**: `dist` è statico e manca `configurePreviewServer`. Con
  `npm run build && npm run preview` le porte `/ai-engine`, `/archivio` e `/chat-raw` non
  esistono: il profilo ricade sul predefinito, il disco resta in memoria, ogni salvataggio
  di chat raw fallisce e l'AI ripiega sul finto
- **Evidenza**: build `tsc` + Vite riuscita; analisi di tutti i plugin. Preview non provato
  in browser
- **Correzione**: documentare e implementare il runtime supportato dopo la build

**F-059 ⊕ · Node 24 non è vincolato, e `scenario` dipende da un esbuild transitivo**
`PARTIAL_IMPLEMENTATION` · bassa · verificato · Origine: `CG:A040`, `CL:AUD-52`

- **Dove**: `package.json`
- **Documentazione**: `docs/L04` — «*Il progetto è Node 24*»
- **Effettivo**: nessun campo `engines` né file di versione; `npm run scenario` invoca
  `esbuild`, presente solo come dipendenza transitiva di Vite
- **Correzione**: dichiarare il runtime e la dipendenza diretta del comando di prova

**F-060 · La dipendenza `phonemizer` non è referenziata da nulla**
`DEAD_CODE` · bassa · verificato · Origine: `CG:A041`

- **Effettivo**: presente in manifest e lock, nessun import nei sorgenti: la fonemizzazione
  usa `espeak-ng`
- **Correzione**: confermarne un uso esterno o rimuoverla

**F-061 ⊕ · Diagnostica e fixture di sviluppo sono incluse nel prodotto senza separazione di build**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CG:A044`, `CL:AUD-34`, `CL:N-01…N-05`

- **Dove**: `src/prova/**` (~2 000 righe), `src/aree/schermo.ts:1090-1199`,
  `src/stile/base.css:872-1064`, importati dall'entry point
- **Documentazione**: nessuna. `strumenti/LEGGIMI.md` dichiara i banchi separati dal
  prodotto; la pedana non gode della stessa dichiarazione, e il codice stesso annota
  «*non fa parte del design*»
- **Effettivo**: pedana, alfabeto, scia, compositore, reset del mondo, iniezione di arrivi,
  salti temporali e i due interruttori (`conCassetto`, posizione delle frasi) finiscono
  nella build. Il pallino di apertura è sempre a schermo, e la pedana usa decine di
  `<button>` contro la legge 01
- **Correzione**: definire il perimetro demo e separare l'attivazione dagli artefatti di
  prova (§5 Q6)

**F-062 · Font e icone arrivano da CDN esterne**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `DIV:D-32`

- **Dove**: `index.html:7-18`
- **Effettivo**: Google Fonts (Manrope, IBM Plex Mono) e `lucide-static` da jsDelivr
- **Impatto**: nessun documento lo prevede, e `L04` dice che il prodotto diventerà
  un'applicazione desktop
- **Correzione**: decidere la politica di distribuzione dei font e delle icone

**F-063 · Il bundle di produzione importa un file dalla cartella della documentazione**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CL:AUD-41`

- **Dove**: `src/main.ts:12` — `import '../docs/design/temi.css'`
- **Impatto**: `docs/` diventa una dipendenza di build: rinominare un documento rompe la
  compilazione. Ed è incoerente, perché `liquid-glass.css` e `materiali.css` non sono
  importati (`F-064`)
- **Correzione**: decidere se i CSS del design sono sorgenti condivisi o documentazione

---

### 2.9 · Design e interfaccia

---

**F-064 ⊕⊕ · Il materiale a schermo è due revisioni indietro: Liquid glass non è adottato**
`DOC_CODE_MISMATCH` · **alta** · verificato · Origine: `CG:A045`, `CL:AUD-27`, `DIV:D-01`, `DIV:D-02`

- **Dove**: `src/stile/base.css:50-61`, `:128-138`; `src/main.ts:11-12`
- **Documentazione**: `docs/design/Liquid glass.md` («*sostituisce le vecchie ricette di
  blur, film e ombra nei campioni attivi*»), `L0` legge 05, `L1 - Temi` (tabella dei 16 valori)
- **Previsto**: `--liquid-film/focus/quiet`, `blur(12px) saturate(1.65) brightness(1.06)`,
  `--liquid-edge` con dieci ombre, riflessi radiali e lama diagonale
- **Effettivo**: `linear-gradient` a due fermate (62%→44%), `blur(42px) saturate(1.9)
  brightness(1.14)`, un anello e un'ombra. È la ricetta di `L1 - Moodboard §2a`, che la
  revisione ha sostituito. `liquid-glass.css`, `materiali.css` e `profilebar.css` non sono
  importati da nessuna parte
- **Impatto**: nessun riflesso, nessuno spessore ottico, fondo più satinato del dovuto
- **Correzione**: importare i token canonici e riscrivere `.bolla-base`

**F-065 ⊕⊕ · Il materiale scuro non esiste nell'applicazione**
`DOC_MISSING_IMPLEMENTATION` · media · verificato · Origine: `CG:A046`, `CL:AUD-28`, `DIV:D-04`

- **Dove**: `src/main.ts:203`, `src/stile/tema.ts:21`
- **Documentazione**: `L1 - Temi` — dodici tinte, **ognuna in chiaro e in scuro**, 24
  combinazioni; `L4 - Schermate` mostra le quattro scene nei due temi
- **Effettivo**: `temi.css` e `materiali.css` si accendono con `data-tema='scuro'`. Quella
  stringa **non compare in nessun file di `src/`**: `main.ts` scrive solo `dataset.colori`
- **Nota**: l'assenza di selezione automatica dal tema del dispositivo **è** conforme alla
  regola «si dichiara, non si deduce»
- **Correzione**: leggere `tema: chiaro|scuro` dal profilo e propagare il materiale
  separatamente dalla tinta

**F-066 · Due vocabolari di variabili che non comunicano**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `DIV:D-03`

- **Dove**: `src/stile/base.css:29-32` contro `docs/design/materiali.css:27,38`
- **Effettivo**: la documentazione nomina `--ink`, `--ink-tenue`, `--ink-corpo`,
  `--ink-fioco`; il codice usa `--inchiostro*`. `temi.css` alimenta solo i secondi, quindi
  anche i dodici temi entrano a metà
- **Correzione**: un vocabolario solo

**F-067 ⊕ · Il profilo può riscrivere i colori semantici degli stati**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A047`, `CL:AUD-33`, `DIV:D-06`

- **Dove**: `src/stile/tema.ts:21`, `src/conoscenza/profilo.ts:222`
- **Documentazione**: `L0` legge 04, `L1 - Temi` — «*Gli stati restano tre, e restano
  quelli*»; un tema cambia fondo e inchiostro, e nient'altro
- **Effettivo**: il blocco `tema` del profilo può riscrivere `--salvia`, `--ambra`,
  `--rosso` e i relativi inchiostri; il controllo dei contrasti segnala solo `accent color`
- **Impatto**: un file locale può annullare il significato degli stati senza segnalazione.
  Il codice stesso lo definisce «un debito»
- **Correzione**: limitare gli override ai token consentiti e validare la tavolozza

**F-068 ⊕ · Il codice si dichiara più autorevole della documentazione**
`CONFLICTING_IMPLEMENTATION` · alta · verificato · Origine: `CL:AUD-26`, `DIV:D-05`

- **Dove**: `src/stile/base.css:11-13`
- **Documentazione**: `L0` — «*Se un disegno di livello 1, 2, 3 o 4 contraddice una riga di
  qui, il disegno è sbagliato*»; «*La cascata sale soltanto*»
- **Effettivo**: «*Dove un numero diverge dal documento, è questa taratura ad avere
  ragione, e il documento è da aggiornare*»
- **Impatto**: finché quella riga resta, ogni divergenza grafica è autoassolta e la
  convergenza è impedita per principio
- **Correzione**: rimuovere la riga; riportare le tarature nei documenti

**F-069 ⊕ · La PROFILEBAR implementa una deroga che la documentazione ha ritirato**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A048`, `CL:AUD-29`

- **Dove**: `src/aree/schermo.ts:176-199`, `src/stile/base.css:268`
- **Documentazione**: tre documenti concordi e datati 19 settembre — `L2 - Profilebar`
  («*la deroga cade, e questa è una bolla come le altre … prende la ricetta condivisa*»),
  `L0` legge zero («~~PROFILEBAR non ha bolla~~ **Caduta**»), `Liquid glass.md`
- **Previsto**: una bolla come le altre, che **si stringe sul contenuto**; altezza 60,
  raggio 30, padding 8/12/8/24, gap 16/12, volto 44; nessun punto mediano
- **Effettivo**: velo legacy con padding e distanze diversi, ora e data unite da un punto
  mediano, città e luogo ripetuti. I commenti motivano la scelta citando la versione
  ritirata: «*Senza contenitore … eccezione dichiarata*», «*un velo che si allarga*»
- **Correzione**: applicare la geometria condivisa e cancellare i commenti sulla deroga

**F-070 ⊕ · Le bolle hanno geometria e gerarchia tipografica della revisione precedente**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A051`, `DIV:D-07`

- **Dove**: `src/stile/base.css:386`, `:490`, `src/aree/scrivania.ts:94`
- **Documentazione**: `L2 - Bubble`, esemplare canonico

  | | documento | codice |
  |---|---|---|
  | larghezza | 464 | 388 / 452 / 560 secondo il fuoco |
  | padding | 20 / 22 | 22 / 24 |
  | titolo | 27 px / 600 | **16 px** |
  | corpo | 15,5 px | **12 px** |
  | frasi | 16 px | **12 px** |
  | icona targa | 19 px (`L1 - Icone`) · 14–16 (`L0`, che comanda) | 14 px |
  | pallino | 9 px | 8 px |

- **Impatto**: densità, leggibilità e spazio dipendono dal fuoco invece che dal contenuto,
  contro la legge 10
- **Correzione**: allineare le misure non ambigue; risolvere prima il conflitto `L0`/`L2`
  sui pesi (`F-109`)

**F-071 ⊕ · La SIDEBAR tronca oltre quattro elementi senza indicare `+N`**
`DOC_MISSING_IMPLEMENTATION` · media · verificato · Origine: `CG:A049`, `DIV:A-02`

> **Aggiornato · 23 settembre 2026.** resta valido; il raggruppamento dovrà rispettare l'ordine nuovo della SIDEBAR, con i chip ambra in cima (`docs/L02`). Storico §93

- **Dove**: `src/aree/schermo.ts:299` — `m.elementi().slice(0, 4)`
- **Documentazione**: `L2 - Sidebar` — «*Oltre quattro si raggruppa. Il quinto chip diventa
  +3 IN CORSO*»
- **Impatto**: non si può sapere quanti task sono fuori vista
- **Correzione**: mostrare `+N` e il percorso conversazionale per raggiungerli

**F-072 · La SIDEBAR si attenua per qualsiasi fuoco, non durante la raccolta**
`DOC_CODE_MISMATCH` · bassa · verificato · Origine: `CG:A050`

- **Dove**: `src/aree/schermo.ts:306`
- **Documentazione**: `L2 - Sidebar` — i chip scendono al 45% **quando INPUT cresce per
  mostrare documenti**
- **Effettivo**: la classe è legata a `aFuoco`, con un'opacità diversa, e compare anche nel
  lavoro ordinario
- **Correzione**: legare l'attenuazione allo stato della raccolta, col valore documentato

**F-073 · Il tetto di due punti di colore per schermo non è garantito**
`DOC_CODE_MISMATCH` · bassa · verificato · Origine: `CG:A052`

> **Chiuso · 23 settembre 2026.** la regola citata non esiste più: il tetto è caduto il 22 settembre, e dal 23 il chip prende per intero il colore del suo stato. Storico §74, §93

- **Documentazione**: `L0` legge 04 — «*Massimo due punti di colore per schermo*»
- **Effettivo**: ogni task, chip e targa prende la tinta dal proprio stato, indipendentemente
  dagli altri
- **Correzione**: priorità visiva globale, senza perdere lo stato accessibile

**F-074 · Contenuti lunghi e apertura interna non seguono il contratto «una cosa sola»**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A053`

> **Chiuso · 23 settembre 2026.** la regola citata — «*dentro si vede una cosa sola, e vince l'esito*» — non esiste più in nessun documento, e il finding cade per decisione del proprietario del progetto. Storico §99

- **Dove**: `src/aree/schermo.ts:430`, `src/stile/base.css:480`, `:699`
- **Documentazione**: `L2 - Bubble` («dentro si vede una cosa sola, e vince l'esito»);
  `L2 - INPUT` (tre cose sole)
- **Effettivo**: la vista interna aggiunge testo esteso e separatori al corpo già presente;
  INPUT ha altezza massima con `overflow: hidden` e nessuna garanzia di accesso agli
  scambi lunghi
- **Correzione**: una sola proiezione del contenuto, con scorrimento e promozione coerenti

**F-075 · Il timer di uscita può eliminare una bolla tornata attiva**
`BUG` · media · forte · Origine: `CG:A054`

- **Dove**: `src/aree/schermo.ts:352`, `:375`
- **Effettivo**: un nodo in uscita può essere riusato prima dei 700/1500 ms senza che
  `dataset.uscita` e il `setTimeout` siano annullati, e `Scrivania.togli` è già stato eseguito
- **Impatto**: la bolla richiamata sparisce dal DOM pur essendo viva nel modello
- **Evidenza**: sequenza statica `togli → timer remove → querySelector riusa nodo`; non
  verificata in browser
- **Correzione**: annullare uscita e timer al rientro

**F-076 ⊕ · INPUT mostra uno spinner e varianti di frasi che l'ultima revisione non prevede**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A056`, `DIV:A-03`

- **Dove**: `src/aree/schermo.ts:773`, `src/main.ts:444`, `src/prova/pedana.ts:69`
- **Documentazione**: `L2 - INPUT` — dentro INPUT stanno tre cose: le parole, la raccolta,
  lo scambio. Gli stati «sto lavorando» e «aspetta te» hanno una forma precisa (linea che
  avanza, conteggio dei passi, punto che si svuota in anello ambra)
- **Effettivo**: c'è uno spinner `gira` durante il pensiero; la pedana può spostare le
  frasi dentro INPUT mantenendo varianti precedenti; gli stati documentati non esistono
- **Correzione**: adottare la revisione finale e isolare le varianti storiche

**F-077 · La raccolta riconosce solo nomi già noti**
`PARTIAL_IMPLEMENTATION` · media · verificato · Origine: `CG:A057`

- **Dove**: `src/aree/raccolta.ts:43`, `src/aree/schermo.ts:690`
- **Effettivo**: ricerca per sottostringa in task, memoria e rubrica; nessuna raccolta di
  file dal filesystem, nessun percorso per gruppi o recupero degli scarti
- **Nota**: le sei idee di `L2 - INPUT` sono esplorazioni, non tutte requisiti: quali siano
  approvate è una decisione (§5 Q8)
- **Correzione**: decidere quali idee sono requisiti e implementare quelle

**F-078 · «Sì» e la prima frase verde fanno cose diverse nella composizione**
`DOC_CODE_MISMATCH` · media · verificato · Origine: `CG:A058`

> **Aggiornato · 23 settembre 2026.** `L2 - Bubble` dice ora «*quella che parte se rispondi «sì»*»: la frase è riformulata, la regola è la stessa. Il finding resta aperto

- **Dove**: `src/modello/motore.ts:1533`, `src/ai-engine/regole.ts:150`, `src/main.ts:301`
- **Documentazione**: `L2 - Bubble` — la prima frase porta il pallino ed è «quella che
  partirebbe se rispondi sì»
- **Effettivo**: la prima frase aggiunge un cuore; «sì» invia. La domanda «Vuoi che lo
  invii?» non ha una frase di invio fra le quattro
- **Correzione**: allineare domanda, prima frase e conferma allo stesso intento

**F-079 · Il controllo del microfono è cliccabile ma non gestito, e fuori scope**
`LEGACY_OR_UNKNOWN` · media · verificato · Origine: `CG:A059`

- **Dove**: `src/aree/schermo.ts:273`, `src/main.ts:355`, `src/conoscenza/canali.ts`
- **Documentazione**: `docs/L04` — nel prototipo l'utente comunica **soltanto** da tastiera;
  la ricezione vocale è futura
- **Effettivo**: l'interfaccia mostra «SOLO TU» e «premi per tornare a voce», ma
  `data-microfono` non ha alcun handler; e l'identità simulata dell'ascoltatore influenza
  l'accettazione dell'input
- **Correzione**: rimuovere o segregare la simulazione d'ascolto, mantenendo la tastiera

**F-080 · La Timeline sceglie task conclusi e misura la durata dall'ultimo tocco**
`BUG` · media · verificato · Origine: `CG:A060`

- **Dove**: `src/aree/timeline.ts:52`, `:60`, `:206`
- **Effettivo**: `inCorso` prende il primo che trova; `ilDopo` considera ogni task con
  un'ora futura, anche concluso; la durata usa `tocco`, che si aggiorna a ogni cambio di
  avanzamento
- **Impatto**: agenda e tempo libero falsi; un'attività sembra ricominciare solo perché la
  richiami
- **Correzione**: filtrare per ciclo di vita e distinguere inizio lavoro da ultimo cambio

**F-081 · La Timeline disegna marcatori vecchi all'inizio della giornata**
`BUG` · bassa · verificato · Origine: `CG:A061`

- **Dove**: `src/aree/timeline.ts:134`, `:161`
- **Documentazione**: `L2 - TIMELINE` — «*Niente prima*»
- **Effettivo**: `tratti` include attese con ora passata e blocchi senza controllo di
  giornata; `px` li appiattisce sul bordo 0
- **Correzione**: filtrare l'intervallo prima della proiezione

**F-082 · I nomi dei chip non sono vincolati e il dato non è protetto dall'overflow**
`PARTIAL_IMPLEMENTATION` · bassa · verificato · Origine: `CG:A093`

- **Dove**: `src/aree/schermo.ts:318`, `src/stile/base.css:342`
- **Documentazione**: `L2 - Sidebar` — nome di due parole al massimo; se è lungo si taglia
  il dato, mai il nome
- **Effettivo**: il template mostra il nome integrale; le fixture ne hanno di più lunghi;
  nessuna politica di overflow
- **Correzione**: nome breve separato dal titolo, overflow sul solo dato

**F-083 · SYSTEMBAR: monospaziato a 10 px contro gli 11 dichiarati**
`DOC_CODE_MISMATCH` · bassa · verificato · Origine: `CG:A094`

- **Dove**: `src/stile/base.css:309`
- **Nota**: la tavola `L2 - TIMELINE` usa a sua volta 10 px — ulteriore incoerenza fra
  campioni (`F-109`)
- **Correzione**: allineare le tavole e la misura canonica prima di toccare il codice

**F-084 · Un commento dichiara i chip alti 34, il CSS li fa 30**
`DOCUMENTATION_AMBIGUITY` · bassa · verificato · Origine: `CL:AUD-31`

- **Dove**: `src/aree/schermo.ts:295` contro `src/stile/base.css:336`
- **Effettivo**: il CSS è **corretto** (30, come `L0` e come `L4` ha confermato il 21
  settembre); è il commento a portare il valore superato
- **Correzione**: correggere il commento

**F-085 · L'ottava icona esiste già nel codice, e la domanda è dichiarata aperta**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CL:AUD-32`

> **Chiuso · 23 settembre 2026.** la legge 06 distingue ora le dieci icone di tipo, che dicono il tipo di task, dalle icone di cornice, che non contano fra quelle; il riquadro «Aperta / l'ottava icona» è uscito da `L2 - Profilebar`. Storico §100–§103

- **Dove**: `src/aree/schermo.ts:213-217`
- **Documentazione**: `L0` legge 06 — «*Sette icone di tipo in tutto il sistema*»;
  `L2 - Profilebar` §«Aperta / l'ottava icona» pone la domanda e non la chiude
- **Effettivo**: `icon-house`, `icon-briefcase`, `icon-map-pin` per il luogo, più nove
  icone di cornice (microfono, volume, rete, batteria, campanella, tastiera)
- **Impatto**: il codice ha già risposto «sette più quelle del contesto» senza decisione
- **Correzione**: decisione umana (§5 Q5)

**F-086 · I controlli cliccabili non hanno semantica né accesso da tastiera**
`BUG` · bassa · verificato · Origine: `CG:A074`

- **Dove**: `src/aree/schermo.ts:273`, `:640`
- **Effettivo**: indicatori e campanella sono `div` con `click` e `dataset`, senza ruolo,
  `tabindex` o gestione dei tasti
- **Impatto**: la navigazione con Tab e le tecnologie assistive non li raggiungono. I
  comandi testuali parziali non equivalgono al controllo
- **Nota**: nessuno dei tre audit certifica la conformità WCAG
- **Correzione**: controlli semantici, conservando il disegno

**F-087 · «Chi sono io per te» non ha la vista profilo descritta**
`PARTIAL_IMPLEMENTATION` · bassa · verificato · Origine: `CG:A095`

- **Dove**: `src/ai-engine/strumenti.ts:67`, `src/aree/schermo.ts:430`
- **Documentazione**: `L2 - Profilebar` — il ritratto è sorgente di due segni, quello da 44
  nella cornice e quello da **54 nella bolla di risposta**
- **Effettivo**: possibile una risposta testuale generica via `parla`; nessun task né
  anatomia del ritratto da 54
- **Correzione**: implementare la presentazione o qualificare la scena come futura

**F-088 · La scrivania a campo di forze non è descritta da nessun documento**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CL:N-20`

> **Aggiornato · 23 settembre 2026.** il movimento sta ora in `L2 - Bubble movement` ed è stato ridefinito il 22 settembre (storico §84–86). Il confronto col codice va rifatto su quei valori

- **Dove**: `src/aree/scrivania.ts`, `src/aree/schermo.ts:34-75`
- **Documentazione**: `L2 - Bubble` §«Il movimento · soap bubbles» descrive onda,
  ritardo a cascata di 40 ms, durate e curve
- **Effettivo**: il modello fisico è implementato con molle, repulsione e compressione; i
  valori del codice non coincidono con quelli della tavola, e il modello in sé non è
  documentato
- **Correzione**: riconciliare i valori o documentare il modello

**F-089 · Il palco riempie la finestra, mentre la legge fissa 1440 × 900**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CL:N-21`

- **Dove**: `src/main.ts:53-67`
- **Documentazione**: `L0` legge 08 — schermate 1440 × 900, margine 44
- **Effettivo**: tela minima 1440 × 900 e scala dinamica `--scala`; sopra quella misura il
  palco prende la dimensione vera della finestra
- **Nota**: è una scelta ragionevole, ma nessun documento la autorizza
- **Correzione**: portarla nei documenti o tornare alla tela fissa

---

### 2.10 · Voce e suono

---

**F-090 ⊕ · Il campanello punta a un file che non esiste, e ignora quello documentato**
`BUG` · media · verificato · Origine: `CG:A064`, `CL:AUD-19`

- **Dove**: `src/voce/suono.ts:16`, `src/conoscenza/profilo.ts:261`
- **Documentazione**: `docs/L03` — «*`campanello.mp3`: Suono delle notifiche*», in
  `Archivio/system-storage/`
- **Effettivo**: `PREDEFINITO = '/media/suoni/notifica.mp3'`. Il `publicDir` è `pubblico/`,
  quindi il file esiste all'URL `/suoni/notifica.mp3`: non esiste alcun prefisso `/media/`.
  E la porta `/archivio` rifiuta `system-storage`, perché `dentroLArchivio` esige
  `pezzi[0] === 'user_123'`
- **Impatto**: nessun campanello, mai, nella configurazione predefinita. L'errore è
  **silenzioso**: `tocca()` cattura il fallimento. Il profilo non può rimediare, perché
  `notifications → sound` non viene letto (`F-040`)
- **Evidenza**: `http-test.log` → `/media/suoni/notifica.mp3` risponde **200 `text/html`**
  (è la pagina, per il fallback SPA di Vite); `/archivio/system-storage/campanello.mp3` → **400**
- **Correzione**: servire esplicitamente l'asset di sistema previsto e usarlo come default

**F-091 · La voce di sistema e la voce maschile sono alternative non documentate**
`UNDOCUMENTED_IMPLEMENTATION` · media · verificato · Origine: `CG:A062`

- **Dove**: `src/voce/lettura.ts:27`, `src/voce/bocca.ts:43`, `src/voce/piper.ts:28`
- **Documentazione**: `docs/L04` — «*la voce dell'assistente con Piper e Serena HIGH*»
- **Effettivo**: il TTS del browser parla finché Piper non è pronto o se fallisce; esiste
  la scelta maschile (Riccardo); il punteggio **privilegia le voci online**
- **Impatto**: identità e qualità della voce variabili, e possibile uso di sintesi non
  locale — che tocca la privacy, dato che la bocca legge il contenuto delle tue cose
- **Nota**: nessun audit ha verificato traffico di sintesi online
- **Correzione**: definire fallback e privacy, o limitarsi al percorso previsto

**F-092 · La coda vocale omette risposte e può ripartire dopo il silenzio**
`BUG` · media · verificato · Origine: `CG:A063`

- **Dove**: `src/voce/turno.ts:75`, `:112`, `src/voce/lettura.ts:77`
- **Effettivo**: `riepiloga` tiene solo l'ultimo testo più una domanda; `leggi` controlla
  `accesa` solo in ingresso; `giro` può superare `viaLibera` dopo uno `svuota` e chiamare
  comunque `dillo`
- **Impatto**: risposte perse in voce, e audio residuo dopo lo spegnimento
- **Correzione**: legare la coda ai turni, rivalutare `accesa` prima di parlare

**F-093 · Il modello vocale non è fissato a una revisione, e si carica anche a voce spenta**
`UNDOCUMENTED_IMPLEMENTATION` · bassa · verificato · Origine: `CG:A065`

- **Dove**: `src/voce/piper.ts:40`, `:76`, `src/voce/lettura.ts:65`
- **Effettivo**: i modelli sono scaricati da `huggingface.co/.../resolve/main`, cioè un
  riferimento mobile; `prepara` è chiamato sempre, senza condizione sulla lettura
- **Correzione**: fissare la versione, documentare la politica di cache, validare gli
  errori HTTP

**F-094 · `prepara-voce` dichiara successo anche senza binari**
`BUG` · bassa · verificato · Origine: `CG:A067`

- **Dove**: `strumenti/prepara-voce.mjs:23`
- **Effettivo**: i file assenti sono saltati con `continue` e l'uscita è 0; stampa «la voce
  è pronta» anche con 0 file copiati
- **Impatto**: un'installazione incompleta sembra riuscita, e il guasto si scopre al runtime
- **Correzione**: verificare tutti gli asset e fallire, o dichiarare lo stato parziale

---

### 2.11 · Test, strumenti, diagnostica

---

**F-095 ⊕ · I test codificano il modello legacy, e la suite fallisce**
`TEST_MISMATCH` · **alta** · verificato · Origine: `CG:A068`, `CL:AUD-50`

- **Dove**: `src/prova/scenario.ts` (800 righe), `src/prova/stato.ts`, `src/prova/alfabeto.ts`
- **Effettivo**: i test sono costruiti su `CARTA`, `MEMORIA`, `ORARIO`, sull'invio prima
  dell'undo e su fixture superate. **Tre verifiche falliscono**: due per il seme obsoleto
  e una per un percorso Windows atteso (`storage/foresta.jpg` contro
  `/archivio/user_123/filesystem/Home/foresta.jpg`)
- **Impatto**: una suite verde dopo correzioni cosmetiche proteggerebbe ancora
  comportamenti non conformi
- **Evidenza**: `scenario.log`, `scenario-npm.log` — stessi 3 fallimenti con entrambi i
  metodi di esecuzione
- **Correzione**: ricostruire la matrice requisiti-test; coprire Delay, confini e concorrenza

**F-096 · Le prove interattive non attendono il turno dell'AI**
`TEST_MISMATCH` · media · verificato · Origine: `CG:A070`

- **Dove**: `src/main.ts:323`, `src/prova/alfabeto.ts:84`, `src/prova/pedana.ts:135`
- **Effettivo**: `dillo` è `void` e avvia un turno asincrono; le verifiche del banco
  leggono mosse e stato subito, mentre `scenario` usa `turnoSubito`
- **Impatto**: la stessa prova può fallire o leggere esiti precedenti solo nel browser
- **Correzione**: attendere il completamento con un id di turno

**F-097 · La scia attribuisce ai cambiamenti la mossa precedente**
`BUG` · bassa · verificato · Origine: `CG:A069`

- **Dove**: `src/prova/scia.ts:51`, `src/ai-engine/ai-engine.ts:145`, `src/modello/motore.ts:448`
- **Effettivo**: `chiama` modifica e notifica **prima** di `m.segna`, quindi la scia legge
  il registro precedente; oltre 24 mosse la lunghezza non cresce più e l'euristica cade
- **Impatto**: il banco fornisce evidenze di causalità ingannevoli — cioè lo strumento
  diagnostico mente
- **Correzione**: registrare l'evento causale con la transizione

**F-098 · Il banco d'ascolto è bloccato da un errore di sintassi**
`BUG` · media · verificato · Origine: `CG:A066`

- **Dove**: `strumenti/banco-ascolto.html:311`
- **Effettivo**: una stringa fra apici contiene un backslash duplicato prima
  dell'apostrofo, chiude la stringa e produce `SyntaxError`: **nessuno script della pagina
  viene eseguito**
- **Evidenza**: `script-check.json` — `node --check` sullo script estratto; gli altri 3
  banchi sono validi
- **Correzione**: correggere il quoting e aggiungere un controllo sintattico

**F-099 ⊕ · Asset duplicati e strumenti non elencati coerentemente**
`LEGACY_OR_UNKNOWN` · bassa · verificato · Origine: `CG:A078`, `CL:AUD-48`, `CL:AUD-49`

- **Dove**: `pubblico/volto.png`, `docs/design/volto.png`, `pubblico/suoni/`, `strumenti/LEGGIMI.md:3`
- **Effettivo**: il volto è duplicato; il campanello esiste in `pubblico/` con un nome
  diverso da quello documentato; `pubblico/suoni/soundshelfstudio-ui-click-deep-512211.mp3`
  non è referenziato da nulla; `LEGGIMI` parla di «due pagine», ne elenca tre e i banchi
  sono quattro
- **Correzione**: dichiarare gli asset canonici e aggiornare l'inventario

---

### 2.12 · Tracciabilità della documentazione

---

**F-100 ⊕⊕ · Il codice cita centinaia di volte un corpus documentale che non esiste**
`LEGACY_OR_UNKNOWN` · **critica** · verificato · Origine: `CG:A071`, `CL:AUD-25`, `DIV:D-33`

> **Aggiornato · 23 settembre 2026.** la decisione umana è presa: i rimandi al corpus scomparso si cancellano, senza recuperare i documenti. Storico §9

- **Dove**: 50 file. Concentrazioni: `motore.ts` (44 righe), `tipi.ts` (18),
  `scenario.ts` (18), `archivio.ts` (15), `profilo.ts` (13)
- **Effettivo**: il codice cita `docs/01-modello`, `02-parallelo`, `03-architettura`,
  `03-conoscenza`, `04-motore`, `04-metalinguaggio`, `05-interfaccia`, `05-archivio`,
  `06-confini`, `07-memoria`, `08-voce`, `09-catene`, `00-aperte`, `11-aperte` e un
  `CLAUDE.md` di radice. **Nessuno esiste**, e nessun file di `src/` nomina mai
  `docs/L00`…`docs/L05`. Lo stesso per il design: `L1 - Sistema`, `L1 - Bubble`,
  `L1 - Soap Bubbles`, `L2 - Taskbar`, `L3 - Composizioni` — due non esistono e uno è stato
  rinominato
- **Conteggi**: CG registra 243 occorrenze candidate con file e riga in
  `evidenze/broken-doc-refs.json`; CL ne conta 253 includendo i documenti di design.
  Entrambi avvertono che è una lista euristica, non 243 bug distinti
- **Impatto**: il codice non è disallineato dalla documentazione — **è allineato a un'altra
  documentazione, che qui non esiste più**. Ogni invariante implementata è tracciabile a
  una decisione non più verificabile. È la causa prima di quasi tutto il resto
- **Nota, e non è minore**: la deriva è anche **interna alla documentazione**.
  `L0 - Sistema` cita `docs/01-modello §2`, `docs/05-interfaccia §1`, `docs/11-aperte` e
  `CLAUDE.md`; `L2 - TIMELINE` cita `docs/01-modello §8`; `L2 - Sidebar` e
  `L2 - Notificationbar` citano `§2` e `§3`; `L3 - Flusso task` cita `docs/09-catene §4`.
  Oggi nemmeno `L0` è verificabile per intero contro `docs/L00`…`L05`
- **Correzione**: decisione umana (§5 Q2) — è il prerequisito di ogni altra correzione

**F-101 ⊕ · Riferimenti rotti e file vitali vuoti**
`DOCUMENTATION_AMBIGUITY` · media · verificato · Origine: `CL:AUD-35`, `CL:AUD-36`, `CG:A088`, `CG:A087`

> **Chiuso in parte · 22 settembre 2026.** i rimandi al corpus scomparso dentro `docs/` sono stati riportati ai documenti veri, e `strumenti/` ha di nuovo un generatore. **Restano** i file vuoti e i rimandi dentro `src/`

- Riferimenti a file inesistenti, verificati uno per uno:

  | citato in | riferimento |
  |---|---|
  | `docs/design/temi.css:23`, `L1 - Temi` | `strumenti/genera-temi.py` |
  | `strumenti/LEGGIMI.md:41` | `docs/00-aperte.md` |
  | `Archivio/.../preferences.txt:2` | `impostazioni.txt`, `LEGGIMI.md` |
  | `src/conoscenza/profilo.ts:347-349` | `ambiente/impostazioni.txt`, `ambiente/profili/lucia.txt` |
  | `src/stile/tema.ts:6`, `src/voce/suono.ts:11` | `ambiente/impostazioni.txt` |
  | `vite.config.ts:878`, `src/prova/scenario.ts:488` | `ambiente/LEGGIMI.md` (è `pubblico/`) |
  | `src/confini/disco.ts:18` | la porta `/disco` (è `/archivio`) |
  | `vite.config.ts:88` | `Archivio/impostazioni.txt` (è `system-settings.txt`) |
  | `docs/L03-archivio.md:27` | `filesystem/Services/` (cartella assente) |

- File vuoti benché il `README.md` li dichiari vitali: `docs/L05-design.md` (0 righe),
  `tasks/storico.md` (0), `tasks/pronti_per_lo_sviluppo.md` (0), `tasks/da_definire.md` (0)
- **Impatto**: `storico.md` doveva contenere «*tutte le decisioni grezze e le motivazioni
  che hanno definito un cambio di rotta*». È vuoto: tutto il «perché» del sistema vive oggi
  nei commenti del codice, cioè nella fonte **meno** autorevole — ed è la stessa fonte che
  `F-100` dichiara inattendibile
- **Correzione**: ripristinare il generatore o documentare il processo manuale; riempire o
  ritirare i file dichiarati vitali

**F-102 · Nomenclatura di aree superate viva nei commenti e negli identificatori**
`LEGACY_OR_UNKNOWN` · bassa · verificato · Origine: `CL:AUD-47`

- **Dove**: `src/aree/scrivania.ts:15`, `src/aree/schermo.ts:1-8`, `src/stile/base.css:1-13`,
  `src/prova/scia.ts:34`
- **Effettivo**: `WHEN`, `WHO`, `TABLE`, `Taskbar` convivono con i nomi correnti. Le aree
  del codice si chiamano `#table` e `#taskbar`, mentre la documentazione dice **DESK** e
  **SIDEBAR** — e `mostra` dichiara al modello l'area `'TASKBAR'`
- **Correzione**: allineare la terminologia; è già un task aperto in
  `tasks/ponte_codice_documentazione.md`

**F-103 ⊕ · Stub e funzioni legacy senza consumatori**
`DEAD_CODE` · bassa · verificato · Origine: `CG:A072`, `CL:AUD-40`, `CL:AUD-43`

- **Dove**: `src/conoscenza/profilo.ts:356`, `src/archivio/archivio.ts:132-160`, `:330`,
  `src/confini/disco.ts:86-104`
- **Effettivo**: `utenteChiesto()` ritorna sempre `undefined` e il suo commento descrive un
  `?profilo=lucia` e un setaccio che non esistono; `Archivio.ancora()`, `.ricorda()`,
  `.daRicordare()` e il tipo `Ancoraggio` non sono chiamati da nessuna parte; `ilPrompt`
  riceve il nome del profilo e lo scarta con `void nome`
- **Impatto**: nomi e interfacce suggeriscono capacità assenti
- **Correzione**: inventariare i consumatori esterni prima di rimuovere; distinguere stub
  futuri da funzionalità reali

---

### 2.13 · Ambiguità e difetti **della documentazione**

Queste voci non riguardano il codice: riguardano `docs/`. Sono registrate perché la
cascata di `L0` non le risolve, e perché finché restano aperte non si può dichiarare
conforme il componente corrispondente.

---

**F-104 ⊕ · Due modelli dei task in due corpus, e la cascata non arbitra**
`DOCUMENTATION_AMBIGUITY` · **alta** · da decidere · Origine: `CL:§7.1`, `CG:A087`, `DIV:appendice 1`

> **Chiuso · 22 settembre 2026.** il modello dei task è uno solo: `T_DRAFT` prende il posto di `T_NUOVO` e gli stati restano quattro (`docs/L01`). Storico §25

`docs/L01` definisce quattro stati `T_*`. `docs/design/L0 - Sistema` parla delle «*sette
facce del modello, non i quattro stati*» e rimanda a `docs/01-modello §2`, che non esiste.
I due appartengono a corpus diversi e nessuno dei due è «più basso» dell'altro: **serve
una decisione**, non una lettura più attenta. → §5 Q1

**F-105 · La legge zero è contraddetta dalla Timeline dentro lo stesso `L0`**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A079`

> **Chiuso · 22 settembre 2026.** le eccezioni alla legge zero sono **due**, SYSTEMBAR e TIMELINE, ed è scritto (`L0`). Storico §51

`L0` dice che ogni contenuto leggibile sta in una bolla, con **una sola** eccezione
dichiarata (SYSTEMBAR); e poi, nella sezione delle aree, definisce la TIMELINE «*inchiostro
diretto sul fondo*». `L2 - Bubble` conserva inoltre eccezioni precedenti alla revisione
glass. Non si può certificare la conformità della Timeline rispetto a entrambe le regole.

**F-106 · Autonomia dei componenti contro la guida verticale condivisa**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A080`

> **Chiuso · 22 settembre 2026.** la pila verticale è una **deroga dichiarata e limitata** a TIMELINE → PROFILEBAR → SYSTEMBAR (`L0`, legge 11). Storico §87

La legge 11 dice che nessun componente è in colonna con un altro e che «*se un componente
scompare, nessun altro si muove*». Lo stesso `L0`, e `L2 - Profilebar`, dicono che
PROFILEBAR e SYSTEMBAR **seguono** l'altezza della Timeline con 22 px d'aria. Il codice
implementa una guida flex. Le due regole non sono simultaneamente soddisfacibili.

**F-107 · Quote e ancoraggi discordanti fra norme, testo e scene**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A081`, `CL:§7.5`, `DIV:appendice 2,4`

> **Chiuso · 23 settembre 2026, sera.** non ci sono più quote fisse: le aree sono ancorate ai bordi o al vicino, in due pile, e la NOTIFICATIONBAR è l'unica posizione assoluta (`L0` leggi 08, 09, 11). Storico §124

> **Chiuso in parte · 22 settembre 2026.** la quota della SIDEBAR è `44 / 180` ovunque, e il pallino è 9 px. **Restano** le quote della SYSTEMBAR

SIDEBAR a `top 132` nel testo di `L2 - Sidebar` e `44 / 180` in `L0`; SYSTEMBAR a `44 / 126`
insieme a una guida dichiarata dinamica; INPUT «*bottom 44 · centrato*» nel titolo di
`L2 - INPUT` e «*basso a sinistra*» in `L0` e nelle scene. Per INPUT la cascata risolve —
vince `L0`, e il codice è conforme; per le quote no.

**F-108 · Tipografia e icone: i campioni non sono coerenti con le leggi superiori**
`DOCUMENTATION_AMBIGUITY` · bassa · da decidere · Origine: `CG:A082`, `CL:§7.6`, `DIV:appendice 3`

> **Chiuso · 23 settembre 2026, sera.** la legge 07 ammette il 600 per il titolo di una bolla e per il WorkMode, e nient'altro. Storico §125

> **Chiuso in parte · 22 settembre 2026.** la misura delle icone segue la legge 06 — 14 nella bolla e nel chip, 16 nella cornice — in tutti i documenti. **Resta** l'eccezione del peso 600

> **Aggiornato · 23 settembre 2026.** la chiusura del 22 valeva per il testo, non per i disegni: 66 icone erano ancora a 12, 15, 18 o 19 px. Ora sono tutte a 14, e la campanella a 16. **Resta** l'eccezione del peso 600. Storico §105

`L0` legge 06 dice icone 14–16 px; `L1 - Icone` le mostra a 19. `L0` legge 07 dice tre pesi
(200/300/500) e «*il grassetto non esiste*»; `L2 - Bubble` usa titoli 600/27 px e
`L2 - Profilebar` dichiara un 600 come «eccezione esplicita». Non tutte le misure dei
mockup possono essere normative insieme.

**F-109 · La tavolozza è descritta insieme come irrisolta e come già riconciliata**
`DOCUMENTATION_AMBIGUITY` · bassa · da decidere · Origine: `CG:A083`

> **Chiuso · 22 settembre 2026.** la tavolozza è decisa e unica: grigio, azzurro, ambra, nessun colore — più il verde, che non è uno stato. La nota sulle due tavolozze è sparita da `L0`. Storico §46

`L0` legge 04 rimanda a `docs/11-aperte` (inesistente) e descrive la tavolozza del
prototipo come ancora divergente; `L1 - Moodboard` la dichiara chiusa il 18 settembre
(«*il prototipo è stato smentito*»). Da qui dipende l'autorità degli override ancora
implementati (`F-067`).

**F-110 · Il fuoco durante la frase contraddice l'ultima revisione di INPUT**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A085`

> **Chiuso · 22 settembre 2026.** INPUT è stato riscritto: mentre si scrive non si muove niente e nessun fuoco si sposta. Storico §18

`L2 - Bubble` e `L3 - Flusso task` descrivono il fuoco immediato e la crescita del 50%
**mentre** parli; `L2 - INPUT`, nella revisione finale, dice che durante l'acquisizione si
muove solo la raccolta e «*la frase si capisce una volta sola*». Timing e geometria non
sono certificabili contro entrambe.

**F-111 · Le notifiche future sono ancora descritte nel cassetto**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A086`

> **Chiuso in parte · 23 settembre 2026.** `L2 - Notificationbar` non include più le cose con un'ora: verificato cercando orari e rimandati nel testo della tavola. **Resta** il codice, che mescola ancora notifiche e task con un'ora

`L2 - Notificationbar` dichiara caduta, il 18 settembre, la regola che metteva le cose con
un'ora in fondo alla stessa lista — «*i rimandati sono tuoi, e il cassetto è il mondo*» —
ma altre righe dello stesso documento continuano a includerle. Il codice implementa la
versione vecchia (`schermo.ts:589-610` mescola `m.notifiche` e `m.in('ORARIO')`).

**F-112 · Il formato di `preferences.txt` non è documentato da nessuna parte**
`DOCUMENTATION_AMBIGUITY` · **alta** · da decidere · Origine: `CL:§7.3`

> **Chiuso · 22 settembre 2026.** il formato di `preferences.txt` è scritto in `docs/L03`, in inglese, e il refuso `assitant` è corretto nel file distribuito. Storico §87

`docs/L03` dice **cosa** contiene («lingua, tema, luoghi conosciuti, configurazione della
voce»), mai **con quali chiavi**. Il file di esempio e il parser divergono (`F-040`) e non
esiste un documento che dica chi ha ragione. → §5 Q6

**F-113 · L'orario di lavoro ha tre fonti e due valori**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CL:§7.4`

> **Chiuso in parte · 23 settembre 2026.** l'orario lo inserisce l'utente; nel prototipo è 9–13 e 14–18 in `memory/general.txt`, e la tavola della TIMELINE lo segue. **Resta** il codice, che usa 8–19. Storico §110

`memory/general.txt` dice 9–19; `L2 - TIMELINE` disegna 8–19; `contesto.ts` usa 8–19.
Nessuno dei tre è dichiarato normativo, e il valore alimenta il filtro degli arrivi e la
potatura della memoria (`F-044`).

**F-114 · Materiale: `L1 - Moodboard` contro `Liquid glass`**
`DOCUMENTATION_AMBIGUITY` · bassa · risolta dalla cascata · Origine: `CL:§7.7`, `DIV:appendice 5`

> **Chiuso · 23 settembre 2026, sera.** `L1 - Moodboard` descrive e disegna il vetro con i token di `Liquid glass`, chiaro e scuro

`L1 - Moodboard §2a` descrive «blur 44, film bianco al 62%»; `Liquid glass` prescrive blur
12 e il film multistrato, e **dichiara** di sostituire le ricette precedenti. Risolta: vince
la revisione. Resta da aggiornare `L1 - Moodboard`, che oggi è la ricetta che il codice
implementa (`F-064`).

**F-115 · Quale asset è il campanello**
`DOCUMENTATION_AMBIGUITY` · bassa · da decidere · Origine: `CL:§7.8`

> **Chiuso in parte · 23 settembre 2026.** il suono è `Archivio/system-storage/notification.mp3` (`docs/L03`). **Resta** il codice, che legge `pubblico/suoni/` da un percorso rotto (`F-090`). Storico §111

`L03` nomina `Archivio/system-storage/campanello.mp3`; il codice usa `pubblico/suoni/` con
un altro nome e un percorso rotto (`F-090`). Nessun documento spiega la differenza.

**F-116 · I criteri della memoria selettiva restano dichiaratamente aperti**
`DOCUMENTATION_AMBIGUITY` · media · da decidere · Origine: `CG:A087`

> **Rimandato · 23 settembre 2026.** per ora la memoria resta il documento di contesto; il criterio si decide in una fase successiva. Le altre lacune elencate qui — API, errori, calendario, fuso orario, recupero della chat — restano aperte. Storico §109

`docs/L01` e `L03` dichiarano che «*il confine di ciò che è utile salvare deve ancora
essere definito*». Mancano inoltre schemi API, semantica degli errori, idempotenza,
sovrapposizione dei WorkMode, contratto del calendario, fuso orario e recupero della chat.
**Nessuna di queste lacune va colmata deducendola dal codice**: è la regola che i tre audit
applicano, ed è il motivo per cui `F-050` è un finding e non una conformità.

**F-117 · Il fallback opaco dei mockup non copre il ramo scuro**
`BUG` (nella documentazione eseguibile) · bassa · verificato · Origine: `CG:A089`

> **Chiuso · 23 settembre 2026, sera.** `materiali.css` porta il vetro opaco di riserva anche sul ramo scuro

- **Dove**: `docs/design/liquid-glass.css:42`, `docs/design/materiali.css:13`
- **Effettivo**: il fallback `@supports not` e `prefers-reduced-transparency` ridefinisce i
  token su `:root`, ma `[data-tema='scuro']` sui contenitori ridefinisce a sua volta film e
  ottiche: le scene scure ignorano il fallback ereditato
- **Correzione**: applicare il fallback anche ai rami materiale

**F-118 · Due dichiarazioni CSS delle tavole sono sintatticamente invalide**
`BUG` (nella documentazione eseguibile) · bassa · verificato · Origine: `CG:A096`

> **Chiuso · 23 settembre 2026, sera.** la dichiarazione di `L2 - Sidebar` separa margine e ombra; quella di `L2 - INPUT` non c'era già più

- **Dove**: `docs/design/L2 - Sidebar.dc.html:192`, `docs/design/L2 - INPUT.dc.html:507`
- **Effettivo**: `margin-bottom: 15px, 0 0 0 18px rgba(...)` e
  `margin-top: 14px, 0 0 0 16px rgba(...)` usano valori da ombra dentro un margine: il
  browser scarta le dichiarazioni, e la scena non rappresenta l'intenzione del markup
- **Evidenza**: estrazione completa degli attributi `style` in `evidenze/html-style-values.json`
- **Correzione**: separare `margin` e `box-shadow`

**F-119 · Le scene di `L4` e i documenti citano ancora misure superate**
`DOCUMENTATION_AMBIGUITY` · bassa · verificato · Origine: `DIV:appendice`, `CG:A081`

> **Chiuso · 23 settembre 2026, sera.** il confronto di `L1 - Icone` è a 14 px, la misura vera; la quota della SIDEBAR segue la legge 11

> **Chiuso in parte · 22 settembre 2026.** colori, pallino e quota della SIDEBAR allineati nelle scene. **Resta** il resto delle misure di `L4`

`L4 - Schermate` porta una nota del 21 settembre che chiude sei divergenze, ma `L2 - Sidebar`
non è stato aggiornato di conseguenza (quota della colonna), e `L1 - Icone` continua a
mostrare 19 px contro i 14–16 di `L0`. La regola di cascata prescrive che chi modifica
aggiorni **nella stessa risposta** tutte le occorrenze nei numeri più alti: qui non è
successo.


**F-120 · Le decisioni del 23 settembre non hanno ancora un corrispettivo nel codice**
`DOC_MISSING_IMPLEMENTATION` · media · da verificare · Origine: sessione del 23 settembre 2026

> **Aggiornato · 23 settembre 2026, sera.** l'elenco copre ora tutte le decisioni della giornata, dal §90 al §123.

Non è una misura sul codice: è l'elenco di ciò che `docs/` prescrive da oggi e che il
codice, scritto prima, non può fare. Va verificato voce per voce, e ogni voce confermata
diventa un finding a sé.

- **DESK e SIDEBAR senza scopo**: il sistema non sposta mai una bolla di sua iniziativa (`docs/L02` §DESK). Storico §90
- **il rimandato che scade diventa ambra dove si trova**, non torna in DESK (`docs/L02` §SIDEBAR). Storico §91
- **la frase «mettila da parte»** fra quelle di INPUT quando la active è ambra. Storico §92
- **il chip colorato per intero**, senza pallino di stato, e **l'ambra in cima** (`L0` §SIDEBAR, `L2 - Sidebar`). Storico §93
- **il focus**: le altre bolle passano in SIDEBAR e tornano da sole (`docs/L02` §DESK, `L0` legge 08). Storico §94
- **la bolla documento** (`docs/L02`, `L0` legge zero). Storico §95
- **niente si trascina** (`docs/L02` §INPUT). Storico §96
- **le quattro taglie**, Banner, Chip, Task, Focus (`L0` §Le quattro taglie). Storico §97, §98
- **il focus a 920 × 690**, con titolo Manrope 200 / 46 e corpo 300 / 19, e il fondo che resta com'è (`L0` §Le quattro taglie, `L2 - Bubble`). Storico §112, §115
- **la bolla documento con la targa neutra**: tipo e provenienza, nessuno stato (`L2 - Bubble`). Storico §113
- **la tinta velata del chip**: ambra al 30%, azzurro al 22% (`L0` §SIDEBAR, `L2 - Sidebar`). Storico §114
- **il pallino verde della active a sinistra della sua icona**, non accanto al titolo (`L0` leggi 02 e 04, `docs/L01`). Storico §116
- **la targa nel colore della sua icona**, a 12 px e peso 500, e le icone nel colore di stato vero (`L2 - Bubble`). Storico §117
- **la targa senza età**: niente «2 min» né «09:41» a destra. Storico §121
- **il flusso passa dalla bozza**: la bozza grigia nella dropzone, la conferma a voce, la bolla che vola al suo posto; e il task ambra mentre il sistema fa una domanda (`L3 - Flusso task`, `L2 - INPUT`). Storico §118, §119, §122
- **le icone**: il tipo di task sceglie l'icona, dieci icone di tipo più quelle di cornice, 14 e 16 px (`L0` legge 06). Storico §100–§106
- **il suono delle notifiche** è `Archivio/system-storage/notification.mp3`, e **l'orario di prova** è 9–13 e 14–18 in `memory/general.txt` (`docs/L03`, `docs/L02`). Storico §110, §111

---

## 3 · Tabelle di corrispondenza

### 3.1 · Da CG (`fonti/chatgpt/finding.md`) a questo registro

| CG | F | CG | F | CG | F | CG | F |
|---|---|---|---|---|---|---|---|
| A001 | F-001, F-002 | A025 | F-045 | A049 | F-071 | A073 | F-044 |
| A002 | F-005 | A026 | F-050 | A050 | F-072 | A074 | F-086 |
| A003 | F-015, F-016 | A027 | F-052 | A051 | F-070 | A075 | F-011 |
| A004 | F-018 | A028 | F-041 | A052 | F-073 | A076 | F-012 |
| A005 | F-017 | A029 | F-040 | A053 | F-074 | A077 | F-013 |
| A006 | F-022 | A030 | F-042 | A054 | F-075 | A078 | F-099 |
| A007 | F-023 | A031 | F-043 | A055 | F-021 | A079 | F-105 |
| A008 | F-024 | A032 | F-009 | A056 | F-076 | A080 | F-106 |
| A009 | F-025 | A033 | F-010 | A057 | F-077 | A081 | F-107 |
| A010 | F-026 | A034 | F-053 | A058 | F-078 | A082 | F-108 |
| A011 | F-019 | A035 | F-054 | A059 | F-079 | A083 | F-109 |
| A012 | F-004 | A036 | F-055 | A060 | F-080 | A084 | F-008 |
| A013 | F-003 | A037 | F-051 | A061 | F-081 | A085 | F-110 |
| A014 | F-027 | A038 | F-057 | A062 | F-091 | A086 | F-111 |
| A015 | F-033 | A039 | F-058 | A063 | F-092 | A087 | F-104, F-116 |
| A016 | F-007 | A040 | F-059 | A064 | F-090 | A088 | F-101 |
| A017 | F-029 | A041 | F-060 | A065 | F-093 | A089 | F-117 |
| A018 | F-030 | A042 | F-036 | A066 | F-098 | A090 | F-028 |
| A019 | F-031 | A043 | F-037, F-020 | A067 | F-094 | A091 | F-048 |
| A020 | F-032 | A044 | F-061 | A068 | F-095 | A092 | F-014 |
| A021 | F-034 | A045 | F-064 | A069 | F-097 | A093 | F-082 |
| A022 | F-035 | A046 | F-065 | A070 | F-096 | A094 | F-083 |
| A023 | F-038 | A047 | F-067 | A071 | F-100 | A095 | F-087 |
| A024 | F-039 | A048 | F-069 | A072 | F-051, F-103 | A096 | F-118 |

### 3.2 · Da CL (`fonti/claude/AUDIT.md`) a questo registro

| CL | F | CL | F |
|---|---|---|---|
| AUD-01 | F-015 | AUD-31 | F-084 |
| AUD-02 | F-018 | AUD-32 | F-085 |
| AUD-04 | F-016 | AUD-33 | F-067 |
| AUD-05 | F-017 | AUD-34 | F-061 |
| AUD-06 | F-001 | AUD-35, AUD-36 | F-101 |
| AUD-07 | F-006 | AUD-38 | F-047 |
| AUD-08 | F-002 | AUD-39 | F-051 |
| AUD-09 | F-005 | AUD-40, AUD-43 | F-103 |
| AUD-11 | F-022 | AUD-41 | F-063 |
| AUD-12 | F-038 | AUD-42 | F-034 |
| AUD-15 | F-046 | AUD-44 | F-049 |
| AUD-16 | F-044 | AUD-45 | F-041 |
| AUD-17 | F-040 | AUD-47 | F-102 |
| AUD-18 | F-043 | AUD-48, AUD-49 | F-099 |
| AUD-19 | F-090 | AUD-50 | F-095 |
| AUD-20 | F-057 | AUD-51 | F-020 |
| AUD-21 | F-036 | AUD-52 | F-059 |
| AUD-22 | F-058 | AUD-53 | F-009 |
| AUD-24 | F-056 | N-01…N-05 | F-061 |
| AUD-25 | F-100 | N-07 | F-050 |
| AUD-26 | F-068 | N-12 | F-037 |
| AUD-27 | F-064 | N-20 | F-088 |
| AUD-28 | F-065 | N-21 | F-089 |
| AUD-29 | F-069 | §7.1…§7.8 | F-104, F-107, F-108, F-112, F-113, F-114, F-115 |

### 3.3 · Da DIV (`fonti/claude/DIVERGENZE.md`) a questo registro

| DIV | F | DIV | F |
|---|---|---|---|
| D-01, D-02 | F-064 | D-33 | F-100 |
| D-03 | F-066 | D-34 | F-044 |
| D-04 | F-065 | D-35 | F-040 |
| D-05 | F-068 | N-01…N-06 | F-061 |
| D-06 | F-067 | N-07, N-08 | F-050 |
| D-07…D-26 | F-070, F-069, F-071, F-072, F-076 | N-09 | F-034 |
| D-27 | F-015 | N-15, N-16 | F-090, F-091 |
| D-28 | F-016 | N-20, N-21 | F-088, F-089 |
| D-29 | F-017 | A-01 | F-043 |
| D-30 | F-057 | A-02 | F-071 |
| D-31 | F-036 | A-03 | F-076 |
| D-32 | F-062 | A-04 | F-065 |
| | | A-05 | F-050 |
| | | A-07, A-08 | F-101 |

> `D-07`…`D-26` sono le misure grafiche componente per componente. Qui sono ricondotte a
> cinque finding tematici: **il dettaglio numerico resta in `fonti/claude/DIVERGENZE.md`
> ed è l'unica fonte che lo contiene.**

> **Voce ritirata.** `DIV` elenca la Funzione Delay fra i punti «conformi e verificati»,
> citando `motore.ts:42`. La costante esiste, ma non trattiene l'invio: vedi `F-001`. La
> conformità era dedotta dalla presenza del numero, non dal percorso di esecuzione.
> Analogamente `CL` aveva dichiarato conforme il confine `/archivio`: vedi `F-009`.
> **Entrambe le voci sono annullate da questo registro.**

---

## 4 · Cosa nessuno ha verificato

L'unione dei limiti dichiarati dalle tre fonti. L'assenza di finding qui non significa
conformità.

| Area | Perché |
|---|---|
| **Chiamate reali a OpenRouter** | nessun audit ha usato una chiave. Disponibilità del modello, formato remoto, latenza, costi, politiche di cache e qualità delle risposte restano non verificati |
| **Integrazioni reali** (email, calendario, contatti) | fuori scope del prototipo. I difetti di invio sono provati al confine `Servizio` con stub, non con destinatari veri. **Nessun recapito è stato contattato da nessun audit** |
| **Resa visiva** | nessuna matrice browser/OS/viewport, nessun confronto screenshot, nessun test con screen reader, nessun giudizio percettivo su animazioni e contrasto. Le collisioni del motore fisico e il contrasto sul wallpaper richiedono verifica visiva |
| **Qualità della voce** | il modello Piper non è stato scaricato né ascoltato. Pronuncia, prestazioni ONNX, autoplay e consumo di memoria restano non verificati |
| **Asset binari** | 7 file analizzati per hash, formato e collocazione; nessun giudizio sul contenuto |
| **Dipendenze di terzi** | manifest, lock e integrazione esaminati; nessun audit riga per riga dei pacchetti, nessuna consultazione di un database CVE. **Nessuna affermazione di assenza di vulnerabilità transitive** |
| **Robustezza estrema** | disco pieno, spegnimento improvviso, concorrenza multiprocesso, catene di symlink verso dati reali, exploit da origine remota: non eseguiti |
| **Preview dopo build** | `F-058` è dedotto dai plugin, non provato in browser |
| **Storia Git** | fuori perimetro: sarebbe una fonte diversa da `docs/` corrente |

---

## 5 · Decisioni che servono prima di correggere

Dodici domande, fuse dalle tre fonti. Nessuna è risolvibile leggendo: o la documentazione
non determina una risposta, o due documenti ne determinano due. **L'audit non sceglie al
posto del progetto.**

**Q1 — Il modello dei task.** Quattro stati `T_*` (`docs/L01`) o due assi `Luogo ×
Avanzamento` (codice)? Da qui dipendono `F-015`…`F-021`, le viste, le API e tutti i test.
*È la decisione che ne blocca il maggior numero di altre.*

**Q2 — Il corpus scomparso.** I documenti `docs/NN-nome` citati centinaia di volte vanno
reimportati, riscritti dentro `L00`–`L05`, o dichiarati decaduti? Finché non si risponde,
ogni correzione è provvisoria (`F-100`).

**Q3 — Lo stack.** Adottare React e Tailwind come già deliberato in `docs/L04`, oppure
modificare prima la decisione architetturale (`F-057`).

**Q4 — La sequenza dell'invio.** Confermare conclusione → Delay → invio per tutte le
tavole, con l'esperienza del bypass e il significato preciso di «aspetta» distinto da «no,
aspetta» (`F-001`…`F-008`).

**Q5 — Le icone.** Sette in tutto il sistema, o «sette più quelle del contesto»? Il codice
ha già scelto la seconda (`F-085`, `F-108`).

**Q6 — Lo schema dei documenti utente.** Un solo formato per `preferences`, `system`,
`services`, `filesystem`, incluse lettura, voce, luoghi e WorkMode — e dove va scritto
(`F-040`, `F-112`).

**Q7 — Il perimetro di prova.** La pedana si documenta come strumento, si sposta fuori dal
bundle, o si rimuove? Sono ~2 000 righe sempre raggiungibili a schermo (`F-061`).

**Q8 — Le proposte di raccolta.** Quali delle sei idee di `L2 - INPUT` sono requisiti
approvati e quali restano esplorazioni? Non vanno trattate automaticamente come
implementazioni mancanti (`F-077`).

**Q9 — Le scritture reali.** Quali sono permesse nel prototipo oltre alla chat raw?
Tenere l'endpoint `memory` e le abitudini automatiche richiede una decisione separata
(`F-050`, `F-051`).

**Q10 — Il ripiego offline.** Quali capacità dell'interprete finto sono autorizzate? Deve
bloccare, dichiararsi, o consentire un sottoinsieme esplicito (`F-031`)?

**Q11 — Il runtime supportato.** Il prototipo gira solo in `npm run dev`. Si documenta il
limite o si fa funzionare la build? E con quale politica di robustezza, fuso e idempotenza
per la chat raw (`F-053`, `F-054`, `F-056`, `F-058`)?

**Q12 — Conflitti interni a `L0`.** Bolle contro Timeline, autonomia contro guida
verticale, quote e pesi. Vanno congelati, e le scene superate marcate come tali
(`F-105`…`F-108`, `F-119`).

---

## 6 · Come si usa questo file

- È un **registro**, non un piano. Il piano di rientro è
  `tasks/ponte_codice_documentazione.md`.
- Una voce si chiude in due modi soltanto: **il codice si adegua al documento**, oppure
  **il documento viene esteso** — e allora la modifica sale la cascata fino a `L4`, come
  prescrive `L0`. Non esiste la terza via di lasciare il codice diverso e dichiararlo
  altrove.
- Ogni voce chiusa va spuntata qui e motivata in `tasks/storico.md` (oggi vuoto, `F-101`).
- I tre rapporti originali in `fonti/` **non vanno aggiornati**: sono la prova di cosa era
  noto, quando, e con quale metodo. Le due conformità che hanno affermato per errore sono
  annullate in §3.3.

## 7 · Dichiarazione di perimetro

Le tre fonti hanno letto, insieme: l'intera documentazione di prodotto e di design, i CSS
del design, l'intero `src/**`, `vite.config.ts`, tutti i file di configurazione, tutti i
dati di `Archivio/`, gli strumenti e i registri preesistenti. CG ha inventariato 106 file e
ne ha eseguito build e suite; CL e DIV hanno lavorato per sola lettura.

**Nessun audit dichiara il progetto conforme in alcuna area**, nemmeno in quelle senza
finding. Le sole conformità affermate, con la portata esatta:

- **la chiave sta solo in `.env`**, e non raggiunge il client;
- **OpenRouter è l'unico provider contattato** (nessun altro `fetch` verso un modello);
- **la password non raggiunge il provider**: `preferences.txt` grezzo non entra nel prompt;
- **la chat raw rispetta il formato** documentato — per la **forma**, non per la
  robustezza né per l'ordine (`F-053`, `F-054`);
- **il modello dei tipi ha sette icone** — nel modello, non nell'interfaccia (`F-085`);
- **i colori di stato sono tre e sono stato** — con la riserva di `F-067`;
- **la voce femminile è Serena HIGH** — per quel valore, non per il fallback (`F-091`).

Tutto il resto è divergente, non documentato, o non determinabile senza le risposte di §5.
