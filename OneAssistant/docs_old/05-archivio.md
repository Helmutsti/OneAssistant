# 05 — L'archivio

Dove il sistema tiene quello che sa di te, con che criterio ci scrive, e cosa si vede
mentre lo fa.

`03-conoscenza` dice **cosa** il sistema sa e da dove lo sa. Questo documento dice **che
forma ha** quel sapere quando si posa da qualche parte. La regola di là vale anche qui,
ed è quella che ordina tutto:

> **La memoria è il grafo. I servizi ne sono proiezioni parziali.**

E una premessa che decide la forma di tutto il resto:

> **L'agente è perpetuo.** Non è di un progetto, non è di uno strumento. Sta lì mentre i
> progetti cominciano e finiscono, mentre gli strumenti cambiano, e ti aiuta perfino a
> usare altri agenti — che vanno e vengono, mentre lui resta.

Da qui viene il senso dell'archivio: **è la cosa che dura più di tutto il resto**. I
`Progetti/` non sono i suoi lavori, sono i tuoi. Un agente che campa quanto una
conversazione non ha bisogno di ricordare niente; questo sì, ed è l'unica parte del
sistema che non si può rifare da capo.

E una seconda premessa, che decide tutto il capitolo 3:

> **L'archivio è dell'agente. È la sua testa, non un tuo raccoglitore.**

Non lo apri, non lo sfogli, non esiste una vista che lo mostri. Non è segretezza: è che
non sei tu a doverlo tenere in ordine. Quello che puoi fare è **chiedergli cosa si
ricorda**, e te lo dice a parole.

---

## 0. Perché file, e non una base dati

Perché risolve la domanda aperta più importante del motore (`04-motore §6.1`): *cosa vede
l'AI engine, tutto il grafo o un estratto costruito per la richiesta?*

Con un archivio di file la risposta smette di essere filosofica e diventa una lista di
percorsi: **l'AI engine vede un pugno di file**, scelti a partire dalle entità che hai
nominato, più un salto lungo i collegamenti. L'estratto non va inventato — si costruisce,
si legge, si conta, e si sbaglia in modo visibile.

---

## 1. La forma

```
archivio/
  lucia/
    preferenze.md      ciò che hai dichiarato tu. Vince sempre.
    osservato.md       ciò che il sistema ha dedotto, con le prove.
    Persone/           chi c'è nella tua vita — paolo.md, andrea-riva.md
    Ricordi/         il vissuto, le esperienze, come pensi, cosa ti piace
    Progetti/          ciò che ha un esito atteso — acme.md, patentino.md
  marco/
    …
servizi/               fuori dall'archivio: il mondo non è di nessuno
```

Un utilizzatore, una cartella. I tre generi sono un **insieme chiuso**, come i sette
`tipo` del modello: tre, e non se ne aggiungono.

### Una cartella per profilo

La divisione per utilizzatore non è una questione di permessi: serve a tenere separati
**la memoria e il modo**. Con Lucia l'agente sa certe cose e parla in un certo modo; con
Marco sa altre cose e parla diversamente. Sono due profili, e **fra profili non passa
niente**: nessun dato, nessuna preferenza, nessuna abitudine dedotta.

Il profilo è l'unione dei due file di testa (`§2`) e delle tre cartelle. Cambiare
utilizzatore non è cambiare filtro su un archivio solo: è un altro archivio.

### La disposizione su disco non è modello

Il **genere** di un'entità — persona, vissuto, progetto — è modello. **Dove finiscono i
byte** no: è gestione del filesystem, cioè un servizio che l'agente usa, di là dal confine
come la posta (`02-confini`). Oggi le due cose coincidono, e domani possono smettere senza
che si rompa niente.

> **La struttura di cartelle non si vede mai, non si dice mai, non genera mai una frase.**

Non è vocabolario: non esiste «apri la cartella Progetti», non esiste una vista
dell'archivio. Si nominano le cose — Paolo, Acme — e dove stanno è affare del disco.

### Il test fra Ricordi e Progetti

È lo stesso test che definisce un task (`01-modello §1`), un gradino più su:

> **Un Progetto ha un esito atteso. Ricordi ti spiega e non chiede niente.**

«Odio le call del lunedì» è un Ricordo. «Prendere il patentino» è un Progetto. Da un
Progetto possono nascere task; dai Ricordi mai — e un task, in fondo, è un progetto
abbastanza piccolo da finire in giornata.

### Un progetto che cresce diventa una cartella

Un file solo regge finché il progetto è piccolo. Quando cresce, si apre — e **si divide
per arco temporale**, non per argomento:

```
Progetti/acme/
  adesso.md          l'arco in corso: è sempre nell'estratto
  2026-06.md         gli archi chiusi: entrano solo se li peschi
  2026-03.md
  decisioni/         «niente Postgres» · 12 marzo — sopravvivono agli archi
```

Il tempo è il criterio giusto perché è l'unico che non chiede di capire: un arco si chiude
da solo. E soprattutto **non si riassume niente** — riassumere è perdere, e perdere in
silenzio è la cosa peggiore che questo strato possa fare. Gli archi vecchi restano interi:
smettono solo di essere pescati, che è la stessa cosa che succede a ciò che dimentichi
(§5).

Le **decisioni** stanno in una cartella loro dentro il progetto. Non sono un arco: «niente
Postgres» vale ancora fra due anni, quando tutto il resto di quel trimestre non interessa
più a nessuno. Sono l'unica cosa che attraversa gli archi senza invecchiare.

### Le cartelle non sono il grafo

Una cartella è un albero: mette ogni cosa in un posto solo. Ma Paolo sta nelle Persone,
**e** dentro il progetto Acme, **e** dentro un ricordo. Non si duplica: due copie
divergono sempre.

> **La cartella dice che genere di cosa sei. I collegamenti fanno il grafo.**

Dentro i file, `[[paolo]]` e `[[acme]]`. Un collegamento a un file che non esiste ancora
non è un errore: è una cosa che varrà la pena scrivere.

---

## 2. Dichiarato e osservato

Due file a livello zero, e non è una separazione estetica: **hanno autorità diversa**.

| | `preferenze.md` | `osservato.md` |
|---|---|---|
| da dove viene | l'hai detto tu, o hai confermato | il sistema l'ha dedotto guardando |
| cosa porta | la regola, e basta | la regola **e le prove**: quante volte, quando |
| quanto pesa | **vince sempre** | è un'ipotesi, e si comporta come tale |

`osservato.md` **è** il contesto di `03-conoscenza §2` — quello che non si chiede e si
osserva. Non serviva un posto nuovo: serviva dargli un file.

In `preferenze.md` sta anche **il modo**: quanto asciutto, quanto formale, quanto ti
spiega prima di fare. È la parte del profilo che si sente di più e che si scrive di meno,
e non attraversa mai il confine fra due profili.

### La promozione, terza volta

Una riga passa da `osservato.md` a `preferenze.md` **solo se la confermi**. È la stessa
macchina di `03 §4`: un'entità `nota` diventa `ancorata` quando acquista un recapito, una
preferenza dedotta diventa tua quando le dai la tua parola.

```
osservato.md    sposta le riunioni del mattino · 12 volte dal 3 giugno
                                 ↓  «sì, è vero»
preferenze.md   niente riunioni prima delle 09:30
```

Che la stessa forma torni tre volte senza che nessuno la forzi è il segno che il modello
regge, ed è lo stesso argomento di `03 §4`.

---

## 3. Chi scrive

L'AI engine, dopo lo scambio. Vede **lo scambio e i file delle entità nominate** — cioè lo
stesso estratto che ha già letto per rispondere: nessun confine nuovo rispetto a quello
che serviva comunque (`04-motore §3`). Non esce il resto dell'archivio, non escono gli
altri scambi.

Scrivere nell'archivio **non è una consegna**: l'archivio sta dentro, e il cancello
`aspetta te` esiste per ciò che attraversa il confine (`01-modello §0`). Ma proprio
perché non c'è cancello, deve esserci la vista.

### Non si mostra: si dice

Nessun elenco di file, nessun percorso, nessuna ricevuta. Una frase, e basta:

```
«Paolo dice che il preventivo Acme è alto»
  Me lo segno su Acme.
```

Che siano stati toccati `acme.md`, `paolo.md` e `osservato.md` non si vede e non si dice:
è la stessa regola di `§1` — la struttura su disco non è vocabolario. Al massimo un nome,
e vale il test della voce:

> **Si dice solo ciò che hai nominato tu.**

Hai detto «Paolo» e «Acme»: la risposta è *«Me lo segno su Acme»*. Se non hai nominato
niente di preciso, è *«Ho preso nota»* — e non serve altro.

Così `04-motore §1` resta intatta senza eccezioni: non c'è niente a schermo che la voce
non dica, perché non c'è niente a schermo oltre alla frase.

### Il controllo è conversazionale

Senza vista e senza cancello, la garanzia non può essere un elenco: è che **la memoria si
racconta a richiesta**.

| dici | succede |
|---|---|
| «cosa ti sei segnato?» | racconta a parole l'ultima cosa scritta |
| «cosa sai di Acme?» | racconta il contenuto, mai i file |
| «dimenticalo» | smentisce l'ultima nota (`§5`) |
| «non è vero» | smentisce la cosa di cui state parlando |

Racconta **contenuti, mai posizioni**: «che il preventivo Acme ti sembra alto», non «l'ho
scritto in `Progetti/acme.md`». La seconda forma non esiste nel sistema, in nessun caso —
nemmeno se la chiedi.

---

## 4. Chi ha parlato

**Solo la tua voce scrive.** L'input è riservato a chi ha la sessione (`03 §1`): una
persona che il sistema conosce ma che non è il titolare non comanda la macchina, e
quindi **non le scrive nemmeno in testa**. Al massimo ti lascia un messaggio, che è un
task — una carta che aspetta te — non una riga di memoria.

Questo corregge una decisione precedente. Avevamo scritto che quello che dice un altro
entra attribuito; ma se non può muovere un task, non può nemmeno depositare un ricordo:
sarebbe una porta sul retro verso la stessa cosa. Chi scrive nell'archivio di un profilo
è **il titolare di quel profilo**, e nessun altro.

```
Persone/giulia.md
  Ha lasciato detto che il contratto è pronto.
    ← 16 set 10:31 · me l'hai raccontato tu
```

Anche qui la riga la scrive la tua voce: il messaggio di Giulia diventa memoria solo se
**tu** ne parli. Finché resta un messaggio in attesa, è un task e basta.

E vale la separazione di `§1`: fra profili non passa niente. Marco ha un archivio suo
solo se è lui ad aprire una sessione, e quello che succede nella tua non lo sfiora.

---

## 5. Dimenticare

«Dimenticalo» **non cancella: smentisce.**

```
~~Non vuole riunioni il lunedì~~
  smentito da te il 16 set · non ripropormelo
```

La riga esce dall'archivio attivo e non entra più in nessun estratto. Ma il segno resta,
e serve a una cosa sola: **il sistema non rideduce domani quello che gli hai già tolto
oggi**. Senza quel segno, le stesse dodici riunioni spostate riproducono la stessa
deduzione la settimana dopo, e la correzione non è una correzione: è un rinvio.

Ne viene una distinzione che vale anche per l'oblio automatico (`03 §5.3`, ancora aperta):

> **Dimenticare non è cancellare. È smettere di pescare.**

---

## 6. L'archivio non è un servizio

Con tutto in `.md` sul disco è tentante fare dell'archivio un ottavo servizio. Non lo è, e
la differenza non è di comodo:

| | dove sta | chi lo possiede | come ci si scrive |
|---|---|---|---|
| **archivio** | dentro | il sistema | l'AI engine, senza cancello, a vista |
| **servizi** | fuori | qualcun altro | solo `consegna`, dopo `aspetta te` |

`servizi/contatti.txt` è finto **oltre** il confine (`02-confini §4`): ci si arriva solo
per `leggi`, `osserva`, `consegna`, mai aprendo il file. Il giorno in cui i contatti
diventano veri, l'archivio non cambia di una riga.

**Il disco, invece, è un servizio — e l'archivio ci sta sopra.** Non è una
contraddizione: è la differenza fra il foglio e quello che c'è scritto. Il foglio si
compra, si cambia, si sposta, e di quello si occupa il filesystem; quello che c'è scritto
è la memoria, e non attraversa nessun confine quando il sistema ci scrive — resta nella
sua testa. Per questo scrivere non passa dal cancello, e per questo si deve vedere.

Se l'archivio diventasse un servizio, la regola di `03` si invertirebbe — e la prima cosa
che si romperebbe è Paolo: una persona che esiste perché l'hai nominata smetterebbe di
esistere perché non ha un numero.

---

## 7. Nel prototipo

Gira, e si prova senza browser con `npm run scenario`.

| pezzo | dov'è |
|---|---|
| il disco | `src/confini/disco.ts` — legge e scrive, non osserva |
| l'archivio | `src/archivio/archivio.ts` — ci posa sopra, e sta dentro |
| chi ci scrive | `src/ai-engine/finto.ts` — l'AI engine, per ora fatto di regole |

L'AI engine finto riconosce i nomi che l'archivio già conosce, i progetti del contesto e le
maiuscole in mezzo alla frase; decide il genere e scrive una riga con la provenienza.
Quando arriva quello vero prende il suo posto e il motore non cambia: è lo stesso confine
dei servizi finti (`02-confini §4`).

Quello che il banco di prova verifica già, e che sono le regole di questo documento:
nessun percorso esce mai da una risposta, «dimenticalo» smentisce senza cancellare, fra
due profili non passa niente, e alla terza conferma il sistema propone di fare da solo.

---

## 8. Domande aperte

1. **Come si apre una sessione con un altro profilo**, e cosa succede allo schermo nel
   frattempo. Le due macchine condividono solo il vetro (`03 §1`), quindi passando di là
   la scrivania si svuota — ma di come ci si passa il modello non dice niente.
2. **Quanto grande è l'estratto.** Numero di partenza, da smentire appena gira: **otto
   file, un salto di collegamento**, e l'arco in corso di ogni progetto nominato. Se
   otto non bastano quasi mai, il problema non è il tetto — è che i file sono scritti
   male. Si vede sui dati, come i pesi del filtro.
3. **Quanto dura un arco.** Un mese, un trimestre, o finché il file non supera una certa
   misura? Il criterio è il tempo (§1), la taglia no. Anche questa si guarda girando.
4. **Cosa si dimentica da solo** (`03 §5.3`). §5 dà la forma — si smette di pescare, non
   si cancella — ma non dice dopo quanto, né se il tempo basta come criterio.
5. **Gli altri agenti.** L'agente è perpetuo e ti aiuta perfino a usarne altri: allora un
   altro agente è un ottavo servizio con i tre verbi di `02-confini §1`, o è qualcosa che
   non entra in quel contratto? È la domanda che apre il capitolo dopo, non questo.
