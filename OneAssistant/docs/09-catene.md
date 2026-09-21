# 09 — Le catene

Gli altri documenti dicono **cosa può succedere**: cos'è un task, dove sta, chi lo fa
cambiare. Nessuno diceva **in che ordine**, e il buco si vedeva a occhio nudo: la pedana
di prova era un elenco di cose da premere, e un elenco non dice mai cosa viene dopo. Si
premeva qualcosa, succedeva qualcosa, e non c'era modo di sapere se era quello che
doveva succedere.

Qui stanno le catene. Una catena è una conversazione che va avanti — il mondo annuncia,
tu dici una cosa, lei risponde, tu ne dici un'altra — e ogni passo dichiara **cosa devi
vedere** quando è andato. È quella dichiarazione che rende una casistica sbagliabile, e
quindi studiabile.

Le catene girano in due posti, dagli stessi pezzi: la pedana a schermo
(`src/prova/flussi.ts`) e le verifiche senza browser (`npm run scenario`).

---

## 1. Cosa arriva

Sei cose possono arrivare dalla posta, e **tutte e sei si posano nel cassetto**: quello
che arriva non sparisce mai (`06-confini §3`). Quattro **chiedono** — contano e suonano —
e due no, e le due mute servono a vedere il filtro lavorare senza fare danni.

| | da | chiede | perché |
|---|---|---|---|
| **Proposta Acme** | Andrea Riva | sì | ti nomina, e c'è qualcosa da farne |
| **Foto vacanza** | Mamma | sì | idem — e non tutto quello che chiede è lavoro |
| **Revisione contratto** | Capo | sì | ti nomina, ha una scadenza vicina |
| **Nuovo cliente** | Capo | sì | ti nomina, e ti chiede una cosa |
| **Newsletter** | una lista | **no** | non ti riguarda: si ferma alla prima domanda |
| **Fattura Acme** | amministrazione | **no** | ti riguarda, ma non c'è niente da fare |

Nessuna delle sei è un task. Lo diventa quando lo chiedi tu — «me ne occupo», «riassumila»,
«rispondi ad Andrea» — e allora nasce sulla board (`01-modello §3`).

Ognuna ha due testi, e la differenza conta: la **riga**, che nel cassetto è quella vera —
mittente e oggetto, come li manda il servizio — e il **corpo**, che è la mail per intero.
Il corpo non si mostra e non si dice mai: è quello che l'AI engine apre quando gli chiedi
un riassunto.

---

## 2. Il riassunto — il lavoro è un task nuovo

> *arriva una mail* · «puoi riassumere il contenuto?» · «Certo, ci penso io.» ·
> «Ho finito il riassunto che mi hai chiesto. Vuoi che te lo legga?» · «no» ·
> «metti da parte, ci penso dopo»

Tre cose che questa catena decide.

**Chiedere un lavoro su una cosa non muove quella cosa.** La mail resta nel cassetto, dove
si era posata: il mondo non si sposta perché tu ci hai lavorato sopra. Nasce sulla board un
task **derivato** (`01-modello §1`) che è il lavoro, e i due vivono separati — si può
mettere da parte il riassunto senza che la mail sparisca da dov'è.

**Il lavoro si vede lavorare.** Il task nasce `in corso` e il suo dato cambia mentre va
— *leggo*, *capisco*, *scrivo*. Non è una barra di caricamento: è l'unico modo che ha il
sistema di dire «ci sto lavorando» dentro il vocabolario che ha già. Quando ha finito
**non parte niente**: passa a `aspetta te`, perché la cosa dopo la decidi tu.

**Un «no» è un esito, non un comando.** Se lei chiede «vuoi che te lo legga?» e tu dici
no, non si muove niente e non si apre niente: risponde «va bene» e la bolla resta ferma.
Prima «no» finiva fra le frasi che non si capiscono, e una frase capita che non fa niente
è meglio di una non capita.

**«Metti da parte» è «dopo».** Non è una quarta uscita: il task va in `ORARIO`,
programmato, e torna da solo. Quello che cambia è la risposta — *«Perfetto Lucia, te lo
ricordo fra due ore»* — perché mettere via una cosa senza sapere quando torna è
esattamente la sensazione che il sistema deve togliere. Deciso il 16 settembre 2026;
chiude la prima domanda aperta di `01-modello §6`.

---

## 3. Due cose insieme, e un messaggio

> *arriva* · «me ne occupo» · *arriva un'altra* · «leggi la notifica» ·
> «torna a quella di prima, questa non mi interessa» ·
> «adesso invia un messaggio a mia madre e chiedile a che ora ci vediamo per venerdì a
> cena» · «Vuoi che lo invii?» · «aggiungi una emoji del cuore e invia»

**Leggere non è richiamare.** Un richiamo sposta il fuoco e tace (`01-modello §3`).
«Leggila» sposta il fuoco **e** la dice. Sono due comandi, e la differenza si sente.

**Il fuoco sa tornare indietro.** «Torna a quella di prima» non cerca per nome: il
sistema si ricorda dov'era il fuoco, e ce lo rimette. Non cambia nessun avanzamento —
guardare una cosa non è farci niente. Quello che lasci non sparisce: resta una bolla
piccola su TABLE, perché niente si scarta (`01-modello §6`).

**Scrivere a qualcuno è comporre, non consegnare.** Nasce un task di **composizione**,
`aspetta te`, e finché non dici di mandarlo non esce niente. Dentro succedono due cose
che si vedono:

- **il contatto si pesca mentre parli.** «Mia madre» è Mamma, che è Carla Moretti, che
  ha un recapito. Chi il sistema conosce ma non sa dove trovare — noto e senza recapito
  (`07-memoria §4`) — lo dice subito, invece di provarci e fallire;
- **il testo nasce in discorso diretto.** Non «chiedile a che ora ci vediamo», ma «Ciao
  mamma, a che ora ci vediamo venerdì per cena?». Quello che tu racconti, lei lo dice.

Le frasi di una composizione sono i modi di **cambiarla**, non di mandarla — «aggiungi
una emoji del cuore», «aggiungi un abbraccio», «riscrivilo», «lascia stare». Mandarla è
la risposta alla domanda che ha appena fatto, e si dice «sì». Sono quattro, il massimo
di legge 01, e la prima è la più probabile.

Una consegna con destinatari **non si autorizza mai una volta per tutte**
(`06-confini §6`): un messaggio a tua madre passa da `aspetta te` ogni volta, anche al
centesimo.

---

## 4. La mail a Marco — dalla voce all'invio

È la catena più lunga che il sistema sappia fare, e serve a due cose: mostrare **come si
costruisce un contesto** prima di aprire bocca, e far vedere il ciclo di `01-modello §2`
girare per intero — `T_NUOVO`, `T_ELABORAZIONE`, due volte `T_ATTESA`, `T_CONCLUSIONE`.
Tocca anche tutti e quattro i momenti dell'interfaccia (`05-interfaccia §3`), ed è l'unica
finora che lo faccia.

> «ciao, vorrei scrivere una email a Marco per mostrargli le foto che ho scattato ieri sera
> al bar» · «sì, le foto sono queste. Scrivigli che in questo bar fanno un caffè
> buonissimo» · «aggiungi l'indirizzo e invia»

| chi | cosa succede | cosa devi vedere |
|---|---|---|
| **tu** | dici la frase | `UI_CREACONTESTO`: INPUT in *scrittura*, e la **raccolta** aggancia Marco mentre parli. Nient'altro si muove |
| **lei** | pensa, **una volta sola** | INPUT pulsa. Lo schermo sta fermo (`03-architettura §4`) |
| **lei** | cerca nel mondo: Marco nei contatti, le foto di ieri fra le 18 e le 23 sul disco | niente, ancora: la ricerca non ha una faccia |
| **lei** | nasce il task, di composizione | una bolla al centro, salvia: `MAIN`, `T_ELABORAZIONE` |
| **lei** | «Ho trovato sei foto di ieri sera, fra le sette e le undici. Cosa gli scrivo?» | il task passa a `T_ATTESA · di te`, **ambra**. Le foto si vedono aprendolo |
| **tu** | «sì, le foto sono queste. Scrivigli che…» | `UI_AGGIORNA`: la richiesta si arricchisce, il task torna salvia |
| **lei** | compone in discorso diretto | `T_ELABORAZIONE`, e l'**esito** nasce adesso |
| **lei** | «*Ciao Marco, guarda che caffè buonissimo in questo bar.*» · «Vuoi che la mandi?» | `T_ATTESA · di te`, ambra. Le frasi: «sì» · «aggiungi l'indirizzo» · «riscrivilo» · «lascia stare» |
| **tu** | «aggiungi l'indirizzo e invia» | una frase, due mosse (§5) |
| **lei** | aggiunge, e consegna | `T_CONCLUSIONE · fuori`, salvia. Una frase sola: «no, aspetta» |
| **il tempo** | 90 secondi | si esaurisce in chip, poi cade in `MEMORIA` |

### Cinque cose che questa catena decide

**Il contesto si cerca prima di parlare, e si cerca una volta.** Prima di dire qualunque
cosa il sistema è andato a vedere chi è Marco e quali foto esistono. Non è una rifinitura:
è la differenza fra chiedere *«a quale Marco?»* e dire *«ne ho trovate sei»*. Questa mossa
**oggi non c'è** (`04-metalinguaggio §2`), e questa catena è la ragione migliore per
aggiungerla: senza, la prima riga non parte nemmeno.

**La richiesta non cambia mai. L'esito sì.** L'`ingresso` è «manda a Marco le foto di ieri
al bar», e resta quello fino alla fine. Quello che viene riscritto a ogni giro è l'esito —
la bozza. È la regola di `01-modello §1`, ed è quella che impedisce a un task di diventare
un altro task mentre ci lavori sopra: se cambiasse la richiesta, a metà catena non sapresti
più a cosa stai dicendo di sì.

Ne segue una cosa piccola e utile: **l'esito di una composizione può essere testo più
file.** Le foto stanno lì dentro, con la riga. L'`uscita` resta quello che è sempre stata —
il **dove** e il **a chi** — e non porta mai il cosa.

**Non si chiede quello che si può offrire.** L'indirizzo non è una domanda: è una frase,
accanto a «riscrivilo» e «lascia stare». La domanda è una sola e arriva quando c'è qualcosa
di pronto — *«Vuoi che la mandi?»* — perché una domanda sola si chiude con un «sì». Ogni
domanda che poteva essere una frase è un giro di parola in più, ed è tempo tolto a te
(`08-voce §3`).

**Quello che si vede si deve poter dire.** Le foto sono la cosa più visiva che questo
sistema maneggi, e la regola non si piega: la voce dice *quante* e *quando* — «sei, fra le
sette e le undici» — e le immagini si guardano **dentro** il task. Se la voce dicesse solo
«eccole», l'informazione vivrebbe solo nell'immagine, e con la voce spenta il sistema
avrebbe smesso di funzionare.

**A conclusione cambia la riga, non il nome.** Il `nome` è la parola con cui lo richiami e
resta «mail a Marco», anche fra due giorni. Quello che cambia è il `testo`, la riga che si
legge: diventa *«Mandata a Marco»*. Scrivere «inviata» nel nome metterebbe lo stato in due
posti — il colore e la parola — e la parola con cui lo richiami cambierebbe sotto i piedi.

E una cosa che questa catena **non** fa, e conviene notarla: non apre niente. Non c'è un
momento in cui «si apre la posta». La posta è la **destinazione** di una consegna che
avviene all'ultima riga, e fino a lì non esiste nessuna finestra di nessuna applicazione
(`00-visione §6`).

### Cosa serve per farla girare

Oggi non gira, e il divario è fatto di sei cose precise — verificate nel codice, non
immaginate. Le prime due sono quelle senza cui non parte nemmeno la prima riga.

| | cosa manca | dov'è adesso |
|---|---|---|
| **1** | una **mossa per cercare nel mondo**. L'AI engine ha `guarda` per lo schermo e `ricorda` per la memoria, e niente per i servizi | `ai-engine/strumenti.ts` |
| **2** | `leggi` **non prende una domanda**: `leggi(): readonly string[]` torna quello che il servizio possiede, tutto. Cercare vuol dire chiedere, non ricevere un elenco e filtrarlo di qua | `confini/servizio.ts` |
| **3** | l'**esito è solo testo** — `esito?: string`. Le foto sono file, e in una bozza ci stanno accanto alla riga | `modello/tipi.ts` |
| **4** | `T_NUOVO` **non esiste** fra gli avanzamenti: sono ancora i sei di prima | `modello/tipi.ts`, ed è il rinomino già in coda (`11-aperte`) |
| **5** | la **prima attesa ha bisogno di un esito.** «Ho trovato sei foto» non è una cortesia: senza, il task sarebbe `T_ATTESA` a proposito di niente, che `01-modello §2` chiama errore. L'esito della prima elaborazione **è il contesto raccolto**, detto a parole | conseguenza di 1 e 3 |
| **6** | le **frasi di una composizione sono un elenco fisso** — l'emoji, l'abbraccio, riscrivilo. «Aggiungi l'indirizzo» non è nella lista: nasce da quello che il contesto ha trovato | `ai-engine/testi.ts` |

**L'ordine non è l'elenco.** Si fanno **2 e 1** per prime, in quest'ordine — prima il verbo
sa rispondere a una domanda, poi c'è una mossa che gliela fa — e a quel punto la catena
parte e si vede fallire nei punti giusti. Poi **3**, che è un campo. Poi **6**, che è la
differenza fra un sistema che offre e uno che recita. La **4** viaggia col rinomino e non
blocca niente: il ciclo si legge bene anche sotto i vecchi nomi, ed è per quello che
esiste la tabella dei nomi di prima.

Il **5** non è lavoro: è il controllo che dice se il resto è stato fatto bene. Se alla
prima attesa il task ha un esito e una frase, la catena regge; se non ce l'ha, è la mossa
di ricerca a non aver riportato niente di dicibile — e il posto da guardare è quello, non
l'interfaccia.

---

## 5. Una frase, più mosse

«Aggiungi una emoji del cuore **e invia**» è una frase sola e due mosse. L'AI engine le
chiede in fila, e ognuna vede lo stato che le ha lasciato quella prima.

Fino al 16 settembre 2026 questa era una cosa a parte: il locale spezzava la frase e ne
faceva una **sequenza**, che era un comando del modello con dentro altri comandi. Dal 17
settembre 2026 non serve più, ed è la parte più pulita di aver tolto il locale — più mosse
in un turno sono *più chiamate*, non una parola nuova da insegnare. `sequenza` è uscita
dal modello e non ci rientra.

Tre limiti, e sono quello che tiene in piedi la cosa:

- **la seconda metà dev'essere un'altra mossa, non il contenuto della prima.** «Scrivi a
  mia madre **e chiedile** a che ora ci vediamo» è una mossa sola: lì la seconda metà è
  quello che c'è da dire. Il confine è questo, e non si allarga a naso;
- **non è una transazione.** Quello che è fatto è fatto: se la seconda mossa non trova il
  suo bersaglio, la prima resta fatta — e l'errore torna all'AI engine, che decide se
  fermarsi o chiedere. Un annullamento c'è già ed è la retromarcia di sempre
  (`01-modello §3`);
- **il tetto è dieci.** Non per il modello: per lo schermo. Oltre una decina di mosse in un
  turno, quello che si vede ha smesso di essere la conseguenza di quello che hai detto.
  Ogni mossa si legge nel registro della pedana, una riga per chiamata.

---

## 6. Il banco

La pedana (`src/prova/pedana.ts`) è un copione, non un elenco. Si sceglie una catena e i
passi si premono in fila; ognuno dice **chi parla**, **cosa dice** e **cosa devi vedere**.

Tre voci:

| | |
|---|---|
| **mondo** | un servizio annuncia, il tempo salta, cambia chi parla. Si preme. |
| **tu** | una frase, che entra dalla stessa porta di INPUT. Si preme. |
| **lei** | quello che risponde il sistema. **Non si preme:** succede da sé, ed è scritto solo perché si possa confrontare con quello che è successo davvero. |

Cambiare flusso **svuota il mondo**, e «da capo» pure. Non è pigrizia: un copione
dichiara cosa devi vedere a ogni passo, e quello che avanza dalla catena di prima farebbe
mentire l'attesa — o peggio, si prenderebbe i comandi, perché il bersaglio di «manda» è
quello che sta a fuoco e non quello che stai leggendo nel copione.

Fuori dal copione resta una corsia sola: una **frase libera**, che l'AI engine legge prima
di applicarla. È lì che si prova la grammatica che le catene non toccano. L'iniezione di
un'intesa scritta a mano non c'è più — e dal 17 settembre 2026 non c'è più nemmeno
l'intesa: serviva a raggiungere stati che il parser non
sapeva produrre, e adesso la grammatica ci arriva da sé.

Accanto al copione c'è l'**alfabeto** (`src/prova/alfabeto.ts`), che risponde a una
domanda che viene prima di «questa catena funziona?»: **quali parole esistono?** È il
vocabolario chiuso, letto tutto insieme — un linguaggio si giudica anche per quello che
*non* si può dire — e ogni riga dichiara il comando che la frase deve produrre. Si preme
la frase, mai il comando: se «apri Acme» non produce `apri`, si vede lì, in rosso.

Una parola però vuol dire qualcosa **solo dentro una situazione**: «separale» senza un
flusso aperto non è una frase, è rumore. Le situazioni sono un insieme chiuso
(`src/prova/stato.ts`) e ognuna sa tre cose: come si chiama, se c'è adesso, e **come ci
si arriva**. Quest'ultima è la parte che conta:

- una parola spenta si preme lo stesso, e il banco porta prima il mondo dove quella
  frase vuol dire qualcosa — dicendo frasi e facendo succedere cose, mai toccando il
  motore, perché uno stato costruito a mano non sarebbe uno stato vero;
- quindi ogni parola della lingua si prova **davvero**, non solo si legge. Prima le
  situazioni difficili si costruivano a mano in quattro mondi di prova, e quello che non
  ci stava dentro — «separale», «sì, fai pure», la risposta a «non ho capito quale» —
  restava dichiarato e mai provato. `npm run scenario` adesso preme ogni parola su un
  banco suo, e la verifica che conta è che **nessuna parola resti solo da leggere**.

Da qui è venuta fuori la prima cosa che non andava: `sciogli` — la risposta a «non ho
capito quale» — era un comando che il modello conosceva e che nessuna frase sapeva
pronunciare. L'AI engine adesso lo chiede quando, con un blocco aperto, dici il nome di
una delle due (`01-modello §5`).

---

## 7. Domande aperte

**Quanto ci mette a pensare.** Il riassunto oggi ha tre passi da 350 ms, che è un numero
inventato. La latenza vera dell'AI engine cambia tutto: sotto una certa soglia la bolla che
lavora è di troppo, sopra un'altra il task va minimizzato da solo (`11-aperte`).

**Dove si spezza una frase.** Oggi si spezza solo davanti a un mandare secco in fondo.
La lingua ne ha molti altri modi — «riscrivilo e leggimelo», «mettila da parte e passa
alla prossima» — e ognuno è una riga di grammatica in più. Quando la grammatica si apre,
questo è il punto in cui serve il modello piccolo al posto del parser (`03-architettura §7`).

**Quanto in là arriva il discorso diretto.** «Per venerdì a cena» che diventa «venerdì
per cena» è una regola scritta a mano, e ce ne sono cento come quella. È l'AI engine a
doverlo fare: qui serve solo la forma, cioè che il testo composto sia una cosa che si
può leggere ad alta voce senza vergognarsi.

**Se un riassunto si segna.** Oggi vive come task e muore lì. Ma «di cosa parlava quella
mail di Andrea» è una domanda che si farà, e la risposta è nell'archivio o da nessuna
parte (`07-memoria`).
