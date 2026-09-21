# 03 — La conoscenza

Cosa il sistema sa, e da dove lo sa.

Tre strati, dal più esterno al più interno:

| strato | chi lo possiede | quanto spesso cambia |
|---|---|---|
| **i servizi** | qualcun altro | di continuo |
| **il contesto** | il sistema | lentamente |
| **la memoria** | il sistema | a ogni conversazione |

E una regola che li ordina, che è la cosa più importante di questo documento:

> **La memoria è il grafo. I servizi ne sono proiezioni parziali.**

Non il contrario. Se i contatti fossero la verità, una persona che nomini e che non è nei
contatti non esisterebbe — e invece esiste, perché l'hai appena nominata. I contatti sono
solo l'elenco delle persone di cui qualcuno, una volta, ha scritto il numero.

---

## 1. Chi c'è davanti

Due cose diverse, che quasi sempre coincidono.

- **L'utilizzatore** — di chi è la macchina. Ha un nome, un volto, un lavoro, una casa,
  dei progetti. Nello scenario di prova è **Lucia Moretti**, sviluppatrice, studio a
  Bologna.
- **L'ascoltatore** — chi sta parlando *adesso*. È quello che SYSTEMBAR dichiara per primo,
  prima del volume e della batteria, perché è la cosa che conta di più sapere.

### L'input è riservato a chi ha la sessione

Non è una questione di cortesia: è **chi comanda la macchina**. Tre casi, e tre
comportamenti diversi.

| chi parla | cosa succede |
|---|---|
| **sei tu**, il titolare della sessione | tutto normale |
| **una persona che il sistema conosce** | non prende il controllo. Può **lasciarti un messaggio**, e nient'altro |
| **una persona che non conosce** | il sistema non risponde, o dice che non la riconosce |

> **Nessuna voce che non sia la tua muove un task.** Chi non ha la sessione non consegna,
> non rimanda, non porta niente al centro, non cambia il fuoco. Al massimo lascia detto.

**Il messaggio è un task, non una riga di memoria.** Giulia dice «digli che il contratto
è pronto» e quello che resta è una `CARTA` che aspetta te, di tipo conversazione, con la
fonte scritta: *Giulia, a voce, alle 10:31*. Passa dal filtro come tutto il resto — la
prima domanda («è per te?») ha già risposta sì.

**E per comandare davvero serve la sua sessione.** Come gli utenti paralleli di un
sistema operativo: si apre una sessione col suo profilo, e allora la macchina è sua.
Quello che vede è **solo il suo**: i task di un profilo non compaiono nell'altro.

> **Notifiche e operazioni non si incrociano mai fra utilizzatori.** Non esiste una vista
> comune, non esiste una pila condivisa, non esiste un task che appartiene a due persone.
> Due profili sono due macchine che condividono soltanto il vetro.

---

## 2. Il contesto

Quello che è vero di te e che cambia lentamente. Non si chiede: si osserva e si
conferma.

| | esempio |
|---|---|
| **dove** | studio · Bologna. Casa, ufficio, in viaggio. |
| **quando** | le ore in cui lavori, i giorni in cui non vuoi essere disturbata |
| **cosa fai** | il mestiere, i progetti aperti, chi ci lavora insieme a te |
| **come preferisci** | «niente riunioni prima delle 09:30», dedotto da dodici volte che le hai spostate |

Il contesto alimenta due cose sole: il filtro (`02-confini §3`) e le frasi che INPUT ti
offre. Non si mostra mai per sé — non esiste una schermata «il tuo profilo».

Dove sta, su disco, è `osservato.md` (`05-archivio §2`): il dedotto, con le sue prove.
Accanto c'è `preferenze.md`, che tiene solo ciò che hai dichiarato tu — e **vince
sempre**, perché una regola che hai dato non ha la stessa autorità di un'ipotesi.

Ogni cosa nel contesto **sa da dove viene** e si può smentire a voce: «non è vero»,
«dimenticalo». Una preferenza dedotta che non si può correggere è una gabbia.

---

## 3. La memoria

Qui vivono le **entità**: le cose di cui parli. Persone, progetti, documenti, luoghi,
impegni, decisioni.

Un'entità ha due stati rispetto al mondo — ed è un asse a sé, indipendente da tutto il
resto:

| ancoraggio | significa |
|---|---|
| `nota` | esiste solo nella memoria. L'hai nominata, il sistema l'ha registrata. |
| `ancorata` | esiste anche in un servizio: è nei contatti, è un evento in calendario, è un file su disco. |

Un'entità `nota` è a tutti gli effetti reale. Si può nominare, cercare, collegare a un
task. L'unica cosa che non si può fare è **consegnarle** qualcosa, perché per consegnare
serve un recapito, e il recapito ce l'ha solo un servizio.

### Come nasce un'entità — tre stadi, non due

**Un nome non è una persona.** Se bastasse nominarla, dopo una settimana l'archivio
sarebbe pieno di gente di cui non sai niente: una scheda con dentro solo un nome non è
memoria, è rumore che rende più difficile trovare il resto.

| stadio | dove vive | come ci arriva |
|---|---|---|
| **menzionata** | dentro la riga in cui l'hai nominata, e basta | la nomini |
| **nota** | ha una scheda sua in `Persone/` | il sistema ha raccolto abbastanza, e **te lo chiede** |
| **ancorata** | esiste anche nei contatti, con un recapito | la promozione di §4 |

Il passaggio da menzionata a nota **non è automatico: si chiede.** «Di Paolo mi sono
segnato tre cose in due settimane. Me lo ricordo?» — ed è la stessa macchina della
promozione, una casella prima. Quando dici di sì, spesso ha senso arrivare fino in fondo
nello stesso momento: *«Gli aggiungo anche un recapito?»*

Quanto sia «abbastanza» è una domanda aperta (§5), ma la forma è chiara: **non si conta
quante volte l'hai nominata, si guarda quanto sapresti dirne.** Tre menzioni che dicono
tutte la stessa cosa non fanno una scheda; due frasi che dicono che lavora in Acme e che
è lui a decidere sui preventivi, sì.

E in ogni caso il sistema **non inventa il resto**: non le dà un cognome, non le
attribuisce un'azienda, non indovina un numero.

---

## 4. La promozione

È il momento che rende utile tutto lo strato.

> — «manda un sms a Paolo»
> — Paolo non è nei contatti.

Il sistema non dice «non trovato». Sa chi è Paolo — l'hai nominato tre volte questa
settimana, sempre parlando del preventivo Acme. Quello che gli manca è **un recapito**,
non un'identità.

Quindi il task va `bloccato`, forma *non posso* (`01-modello §5`), e le frasi sono le
uscite vere:

- «aggiungilo ai contatti» → chiedi il numero, poi consegna verso **contatti**
- «è il Paolo di Acme» → aggancia a un'entità già ancorata, se ce n'è una plausibile
- «lascia stare»

**Promuovere è una consegna.** Scrivere nei contatti fa uscire qualcosa dal sistema:
passa dal cancello `aspetta te`, ha i suoi 90 secondi di annullamento, esattamente come
una mail. Non serve un meccanismo nuovo — è la stessa macchina di sempre, e questo è il
segno che il modello regge.

Il sistema può anche proporla da sé, quando un'entità `nota` continua a tornare. Ma
propone: una carta nella NOTIFICATIONBAR, che non interrompe.

La stessa macchina muove una preferenza da `osservato.md` a `preferenze.md`
(`05-archivio §2`). Terza volta che ricompare senza che nessuno la forzi.

---

## 5. Domande aperte

1. **Più utilizzatori.** Deciso a metà: **memorie separate**, una cartella per uno
   (`05-archivio §1`): un profilo separa la memoria e il modo, e fra profili non passa
   niente. Quello che un ascoltatore non riconosciuto dice entra nel profilo di chi sta
   usando la macchina, attribuito (`05-archivio §4`).
2. **Quanto è «abbastanza» per ricordarsi di qualcuno.** Vale per tutti e due i passaggi
   — da menzionata a nota, e da nota ad ancorata. La forma è decisa (si guarda quanto
   sapresti dirne, non quante volte l'hai nominata), la soglia no. Da vedere su dati
   finti, come i pesi del filtro.
3. **Come fa a riconoscere chi parla.** Il modello dà per scontato che il sistema sappia
   distinguere tre casi — sei tu, è qualcuno che conosco, non ti conosco — e quella è
   un'impronta vocale da tenere in locale, con tutto quello che comporta. Anche SYSTEMBAR deve
   diventare a tre stati, non a due.
3. **Cosa si dimentica da solo.** Una persona nominata una volta sei mesi fa e mai più
   deve restare per sempre? La forma è decisa — **dimenticare non è cancellare, è smettere
   di pescare** (`05-archivio §5`) — ma non dopo quanto, né con che criterio.
4. **Lucia o Luca.** Il prompt fondativo dice *Luca Moretti*, i mockup disegnati dicono
   *Lucia* (`volto-lucia.webp`). Ho tenuto Lucia, che è quella che si vede. Da allineare
   nel prompt, o da correggere qui.
