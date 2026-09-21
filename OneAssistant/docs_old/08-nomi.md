# 08 — I nomi

Tutto quello che abbiamo nominato, in un posto solo. Non è un glossario per i nuovi: è
un censimento per noi, perché **un nome dato due volte a due cose diverse è un bug che
non compila** — e ne abbiamo qualcuno.

Aggiornato al 17 settembre 2026. I conti sono estratti dal codice, non ricordati.

---

## 1. Le aree — 6

Sono l'unica cosa che resta in inglese (`CLAUDE.md`). Si vedono a schermo, hanno un
ancoraggio fisso, e ognuna ha un documento in `design/`.

| area | dov'è | cos'è | prima si chiamava |
|---|---|---|---|
| **PROFILEBAR** | guida di destra, in cima | ora, giorno, luogo, volto | WHEN / WHERE |
| **SYSTEMBAR** | sotto la Profilebar, a 22 | microfono, volume, rete, batteria | WHO |
| **TABLE** | il centro | le attività: le bolle | WHAT |
| **INPUT** | in basso a sinistra | la voce, lo scambio, la raccolta | — |
| **TASKBAR** | guida di destra, sotto | i chip: quello che hai in mano | — |
| **NOTIFICATIONBAR** | in fondo a destra | quello che arriva e quello che ti aspetta | SIDEBAR |

Tre rinominate in due giorni. La regola che ne è uscita: **si rinomina quando cambia
cosa contiene**, non quando suona meglio — WHO è diventata Systembar perché ha perso il
volto, non perché «Systembar» è più chiaro.

---

## 2. Le primitive del design — 2, più le leggi

| nome | cos'è |
|---|---|
| **Bubble** | l'unico contenitore del sistema. Quattro taglie, un solo vetro |
| **Soap Bubbles** | come si muove: le bolle si fanno spazio a vicenda |

Più, in `L1 - Sistema`: **11 leggi**, la **tavolozza** (salvia · ambra · rosso terra),
le **7 icone** di tipo, i **3 livelli** di opacità, il **margine 44**.

---

## 3. Il modello — le cose che esistono

| nome | cos'è | dove |
|---|---|---|
| **Task** | una cosa da fare. Ha due assi | `modello/tipi.ts` |
| **Notifica** | una cosa arrivata che **non è un task** | `modello/tipi.ts` |
| **Gruppo** | task che tu hai messo insieme. Non è un task | `modello/tipi.ts` |
| **Frase** | un comando dicibile, fra «» | `modello/tipi.ts` |
| **Uscita** | dove un task esce, e a chi | `modello/tipi.ts` |
| **Scambio** | un giro di botta e risposta. Non è un task | `modello/motore.ts` |
| ~~Intesa~~ | ~~cosa il locale ha capito di una frase~~ · **morta col locale**, 17 settembre 2026 | — |
| **Riferimento** | chi è nominato dentro una frase, risolto | `aree/raccolta.ts` |
| **Strumento** | una mossa che l'AI engine può chiedere, e il suo *quando* | `ai-engine/strumenti.ts` |
| **Chiamata** | una mossa chiesta, con i suoi argomenti | `ai-engine/strumenti.ts` |
| **Mossa** | una chiamata fatta, e cosa gli ha risposto | `modello/motore.ts` |
| **Espansa** | cosa è aperto adesso: un elenco, un gruppo, un dentro | `modello/motore.ts` |

## I due assi, e i tre insiemi chiusi

- **Luogo — 6**: `MAIN` · `APERTO` · `CHIP` · `CARTA` · `ORARIO` · `MEMORIA`
- **Avanzamento — 6**: `in corso` · `aspetta te` · `programmato` · `bloccato` · `concluso` · `consegnato`
- **Tipo — 7** (le icone): posta · cartella · documento · persone · conversazione · immagine · sveglia
- **Origine — 3**: tua · esterna · derivata
- **Destinazione — 7**: posta · sms · calendario · contatti · promemoria · note · disco

---

## 4. La lingua — 32 comandi

`consegna` `rimanda` `al-centro` `richiama` `annulla` `mostra` `chiudi` `scegli`
`aspetta` `lascia` `racconta` `dimentica` `conferma` `revoca` `salva-nota` `sciogli`
`riassumi` `leggi` `indietro` `componi` `aggiungi` `riscrivi` `no` `metti` `apri`
`separa` `consegna-gruppo` `rimanda-gruppo` `sequenza` `dentro` `aperta` `estrai`

Più i **5 verbi di apertura**: senti · trova · scrivi · dimmi · aspetta.

L'insieme è chiuso per costruzione: un comando che non sta in `COMANDI` non compila, e
uno che nessuna frase sa pronunciare lo trova il banco (`src/prova/alfabeto.ts`).

---

## 5. I confini — 4 servizi su 7

**Posta**, **Note**, **Contatti**, **Disco** girano. Mancano sms, calendario,
promemoria. Intorno a loro: **Proposta** (ciò che un servizio annuncia), **Giudizio** e
il **filtro** che lo produce, **Registro** (chi sa consegnare dove), **Contatto**.

## 6. L'intelligenza, che è una

Dal 17 settembre 2026 il locale non c'è più, e con lui sono morti due nomi: **Intesa** —
il metalinguaggio fra due cervelli — e **Pensiero**, che era quello che l'AI engine
riportava quando non poteva toccare niente.

Al posto loro c'è il vocabolario delle mosse. **Strumento** è una mossa che l'AI engine può
chiedere, con il suo *quando*; **Chiamata** è una mossa chiesta; **Mossa** è una chiamata
fatta, con quello che gli è tornato indietro. **AiEngine** è il pensiero da qualunque parte
arrivi, **Porta** quello vero dietro `/ai-engine`, **AiEngineFinto** le regole che ne fanno le
veci, e **Dialogo** quello che sa di un turno mentre lo sta facendo.

Vivono in tre file: `ai-engine/strumenti.ts` (cosa si può chiedere), `ai-engine/api.ts` (dove
una chiamata diventa una mossa vera), `ai-engine/ai-engine.ts` (il giro di un turno). La vista
che chiede con `guarda` sta in `ai-engine/vista.ts`, e **Nota** è rimasta soltanto come
argomento di `segna`.

## 7. La memoria — l'archivio

**Archivio**, **Entità**, **Genere**, **Ancoraggio** (ancorata / solo ricordata),
**Ipotesi** (un'abitudine osservata), **Riga**.

## 8. La voce

**Lettura** (chi legge), **Bocca** (con due corpi: di sistema e in locale), **Piper**
(il modello vero), **Campanello**, **Turno**.

## 9. Chi sei, dove sei

**Profilo**, **Macchina**, **Assistente**, **Notifiche**, **Contesto**, **Ascoltatore**.

## 10. Il banco — non fa parte del design

**Pedana** (il mobile), **Flusso** / **Passo** / **Chi** (il copione), **Famiglia** /
**Azione** (l'alfabeto), **Condizione** / **Chiave** (lo stato), **Scia** / **Passaggio**
(dove è passato un task), **Attrezzi** (quello che serve per premere una parola).

---

## Quanti sono

| | quanti |
|---|---|
| aree | 6 |
| documenti di design | 13 (5 L1 · 6 L2 · 1 L3 · 1 prove) + 2 superati |
| documenti di logica | 9, con questo |
| comandi | 32 |
| valori degli insiemi chiusi | 29 |
| tipi e classi esportati nel codice | 63 |

---

## I nomi che si pestano i piedi

Questa è la parte utile. Sono **omonimie vere**, già nel codice.

**`Esito`, tre volte.** Il `Esito` del filtro (`CARTA` / `ORARIO` / `niente`), l'`Esito`
dell'alfabeto (cosa è uscito premendo una parola), e l'`esito` di un Task (quello che ha
prodotto, e che attraversa il confine). Tre cose senza niente in comune. Il terzo è quello
che conta di più ed è l'unico minuscolo: gli altri due andrebbero rinominati — `Giudizio`
lo è già, quindi il filtro può dire `Verdetto`, e il banco `Prova`.

**`Frase` e `frase`.** `Frase` è un comando dicibile con il suo `Comando` dentro;
`frase` è la stringa che hai detto (`dillo(frase)`). Convivevano in `intesa.ts` a due
righe di distanza; adesso la seconda entra in `ai-engine/ai-engine.ts` e la prima esce nella
vista, ed è già meno facile scambiarle.

**`Genere` e `Genere`.** Due, e non c'entrano niente: quello dell'archivio dice dove va a
finire una nota (Persone, Progetti, Ricordi), quello di `strumenti.ts` dice di che tipo è
un argomento (testo, numero, elenco). Il secondo è nato il 17 settembre 2026 e il nome
era libero: non lo è più, e uno dei due andrà rinominato.

**`Nota` e `Note`.** `Nota` è quello che l'AI engine si segna; `Note` è il servizio dove
esce una nota. Singolare e plurale, due cose diverse.

**`Passo` e `Passaggio`.** `Passo` è una riga del copione; `Passaggio` è una cella in cui
un task è stato. Si leggono uguale.

**`Scrivania` e TABLE.** La classe `Scrivania` è il campo di forze che dispone le bolle;
adesso che l'area si chiama TABLE, «la scrivania» è rimasta solo una metafora nei
commenti. O si rinomina la classe `Tavolo`, o si smette di dire scrivania.

**`Posto` e «il posto».** `Posto` è dove sta una bolla; «il posto» nella Profilebar è
casa o ufficio.

**`Tipo` e `tipo`.** `Tipo` sono le sette icone; `c.tipo` è il token di un comando.

**`Chiave`.** In `stato.ts` è una situazione del banco; in `archivio.ts`
`chiaveAbitudine` è l'identificatore di un'abitudine.

Nessuna di queste rompe niente adesso. Tutte rompono qualcosa il giorno in cui due
persone diverse leggono lo stesso file.
