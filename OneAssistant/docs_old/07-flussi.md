# 07 — I flussi

Gli altri documenti dicono **cosa può succedere**: cos'è un task, dove sta, chi lo fa
cambiare. Nessuno diceva **in che ordine**, e il buco si vedeva a occhio nudo: la pedana
di prova era un elenco di cose da premere, e un elenco non dice mai cosa viene dopo. Si
premeva qualcosa, succedeva qualcosa, e non c'era modo di sapere se era quello che
doveva succedere.

Qui stanno le catene. Una catena è una conversazione che va avanti — il mondo annuncia,
tu dici una cosa, lei risponde, tu ne dici un'altra — e ogni passo dichiara **cosa devi
vedere** quando è andato. È quella dichiarazione che rende una casistica sbagliabile, e
quindi studiabile.

I flussi girano in due posti, dagli stessi pezzi: la pedana a schermo
(`src/prova/flussi.ts`) e le verifiche senza browser (`npm run scenario`).

---

## 1. Cosa arriva

Sei cose possono arrivare dalla posta. Quattro passano il filtro e due no, e le due che
non passano servono a vedere il filtro lavorare (`02-confini §3`).

| | da | passa | perché |
|---|---|---|---|
| **Proposta Acme** | Andrea Riva | sì | ti nomina, e c'è una frase da offrirti |
| **Foto vacanza** | Mamma | sì | idem — e non tutto quello che passa è lavoro |
| **Revisione contratto** | Capo | sì | ti nomina, ha una scadenza vicina |
| **Nuovo cliente** | Capo | sì | ti nomina, e ti chiede una cosa |
| **Newsletter** | una lista | **no** | non ti riguarda: si ferma alla prima domanda |
| **Fattura Acme** | amministrazione | **no** | ti riguarda, ma non c'è niente da fare |

Ognuna ha due testi, e la differenza conta: la **riga**, che è quella che si legge nella
carta e dev'essere dicibile ad alta voce, e il **corpo**, che è la mail per intero. Il
corpo non si mostra e non si dice mai: è quello che l'AI engine apre quando gli chiedi un
riassunto.

---

## 2. Il riassunto — il lavoro è un task nuovo

> *arriva una mail* · «puoi riassumere il contenuto?» · «Certo, ci penso io.» ·
> «Ho finito il riassunto che mi hai chiesto. Vuoi che te lo legga?» · «no» ·
> «metti da parte, ci penso dopo»

Tre cose che questo flusso decide.

**Chiedere un lavoro su una cosa non muove quella cosa.** La mail resta dov'era, con
l'avanzamento che aveva. Nasce accanto un task **derivato** (`01-modello §1`) che è il
lavoro, e i due vivono separati: si può mettere da parte il riassunto senza toccare la
mail.

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

> *arriva* · «portala al centro» · *arriva un'altra* · «leggi la notifica» ·
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
  (`03-conoscenza §3`) — lo dice subito, invece di provarci e fallire;
- **il testo nasce in discorso diretto.** Non «chiedile a che ora ci vediamo», ma «Ciao
  mamma, a che ora ci vediamo venerdì per cena?». Quello che tu racconti, lei lo dice.

Le frasi di una composizione sono i modi di **cambiarla**, non di mandarla — «aggiungi
una emoji del cuore», «aggiungi un abbraccio», «riscrivilo», «lascia stare». Mandarla è
la risposta alla domanda che ha appena fatto, e si dice «sì». Sono quattro, il massimo
di legge 01, e la prima è la più probabile.

Una consegna con destinatari **non si autorizza mai una volta per tutte**
(`02-confini §6`): un messaggio a tua madre passa da `aspetta te` ogni volta, anche al
centesimo.

---

## 4. Una frase, più mosse

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

## 5. Il banco

La pedana (`src/prova/pedana.ts`) è un copione, non un elenco. Si sceglie un flusso e i
passi si premono in fila; ognuno dice **chi parla**, **cosa dice** e **cosa devi vedere**.

Tre voci:

| | |
|---|---|
| **mondo** | un servizio annuncia, il tempo salta, cambia chi parla. Si preme. |
| **tu** | una frase, che entra dalla stessa porta di INPUT. Si preme. |
| **lei** | quello che risponde il sistema. **Non si preme:** succede da sé, ed è scritto solo perché si possa confrontare con quello che è successo davvero. |

Cambiare flusso **svuota il mondo**, e «da capo» pure. Non è pigrizia: un copione
dichiara cosa devi vedere a ogni passo, e quello che avanza dal flusso di prima farebbe
mentire l'attesa — o peggio, si prenderebbe i comandi, perché il bersaglio di «manda» è
quello che sta a fuoco e non quello che stai leggendo nel copione.

Fuori dal copione resta una corsia sola: una **frase libera**, che l'AI engine legge prima
di applicarla. È lì che si prova la grammatica che i flussi non toccano. L'iniezione di
un'intesa scritta a mano non c'è più — e dal 17 settembre 2026 non c'è più nemmeno
l'intesa: serviva a raggiungere stati che il parser non
sapeva produrre, e adesso la grammatica ci arriva da sé.

Accanto al copione c'è l'**alfabeto** (`src/prova/alfabeto.ts`), che risponde a una
domanda che viene prima di «questa catena funziona?»: **quali parole esistono?** È il
vocabolario chiuso, letto tutto insieme — un linguaggio si giudica anche per quello che
*non* si può dire — e ogni riga dichiara il comando che la frase deve produrre. Si preme
la frase, mai il comando: se «apri Acme» non produce `apri`, si vede lì, in rosso.

Una parola però vuol dire qualcosa **solo dentro una situazione**: «separale» senza un
gruppo aperto non è una frase, è rumore. Le situazioni sono un insieme chiuso
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

## 6. Domande aperte

**Quanto ci mette a pensare.** Il riassunto oggi ha tre passi da 350 ms, che è un numero
inventato. La latenza vera dell'AI engine cambia tutto: sotto una certa soglia la bolla che
lavora è di troppo, sopra un'altra il task va minimizzato da solo (`04-motore §6`).

**Dove si spezza una frase.** Oggi si spezza solo davanti a un mandare secco in fondo.
La lingua ne ha molti altri modi — «riscrivilo e leggimelo», «mettila da parte e passa
alla prossima» — e ognuno è una riga di grammatica in più. Quando la grammatica si apre,
questo è il punto in cui serve il modello piccolo al posto del parser (`04-motore §5`).

**Quanto in là arriva il discorso diretto.** «Per venerdì a cena» che diventa «venerdì
per cena» è una regola scritta a mano, e ce ne sono cento come quella. È l'AI engine a
doverlo fare: qui serve solo la forma, cioè che il testo composto sia una cosa che si
può leggere ad alta voce senza vergognarsi.

**Se un riassunto si segna.** Oggi vive come task e muore lì. Ma «di cosa parlava quella
mail di Andrea» è una domanda che si farà, e la risposta è nell'archivio o da nessuna
parte (`05-archivio`).
