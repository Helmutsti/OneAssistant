# 00 — Quello che resta aperto

L'indice di tutto ciò che non è deciso. Le domande vivono nei loro documenti: qui
stanno insieme, divise per **chi** può rispondere.

Quando una si chiude, si chiude nel suo documento e si toglie da qui.

---

## Serve una decisione tua

Non sono cose che si scoprono lavorando: sono scelte.

**Un task bloccato che non sciogli.** Resta rosso in TASKBAR per sempre? Oggi non c'è
strada verso `MEMORIA` che non passi da `fatto`. → `01-modello §9`

**Se il nome dell'assistente si veda a schermo**, o viva solo nella voce. È quello che
resta della domanda sul personaggio, chiusa il 17 settembre 2026: dice «io» e non ha
opinioni, le leggi stanno nel codice e il carattere nel profilo. Oggi il nome non si vede
da nessuna parte, e nessuno l'ha sentito mancare. → `06-voce §2`

**Dove vanno le cose che aspettano te.** La decisione è ancora aperta, ma **quello che
c'era scritto qui non era più vero** (corretto il 17 settembre 2026): diceva che la
Notificationbar è spenta e non si disegna. Si disegnano entrambe le versioni — la pila
delle carte e la campanella col cassetto — e a scegliere quale è `Motore.conCassetto`,
che si gira dalla pedana.

Spenta voleva dire che **quello che arriva non si vedeva affatto**: una carta nasce,
nessuno la disegna, e lo schermo dice che non è successo niente. Un componente da
ripensare è meglio di un buco, quindi sono tornate entrambe e si guardano una accanto
all'altra. Resta da decidere **quale delle due**, e la tesi che le divide è una sola: se
il filtro promuove da solo, o se promuovi tu dicendo «me ne occupo»
(`02-confini §3`). → `01-modello §2`

**Quali agenti di terzi** si possono usare, e con che contratto si dichiara quello che
esce verso di loro. → `02-confini §7`

**Lucia o Luca.** Il prompt fondativo dice *Luca Moretti*, i mockup dicono *Lucia*. Il
codice dice Lucia, che è quella che si vede. → `03-conoscenza §5`

---

## Si scopre sui dati, non a tavolino

Non chiedono una decisione adesso: chiedono di far girare lo scenario e guardare.

**I pesi del filtro.** La forma è decisa — è per te? puoi farci qualcosa? è adesso? — ma
soglie e pesi no. È la parte più provvisoria di tutto. → `02-confini §3`

**Quando proporre l'ancoraggio** di un'entità che continua a tornare. Tre menzioni? In
quanti giorni? → `03-conoscenza §5`

**La latenza accettabile** prima che l'AI engine debba dire qualcosa, e quindi prima che il
task si minimizzi da solo. → `04-motore §6`

**La Notificationbar mostra le notifiche vere, o quelle riscritte da lei?** Oggi sono
riscritte: `Notifica.testo` è una riga in voce sua — «Andrea Riva ti riscrive dopo un po'
e ha una proposta da farti» — non l'oggetto della mail. È coerente con `04-motore §1`,
dove ogni riga dev'essere dicibile ad alta voce; ma ha un costo che non abbiamo ancora
guardato in faccia.

Se riscrive tutto, **non si distingue più quello che è arrivato da quello che lei ha
capito**: un riassunto sbagliato è invisibile, perché non c'è niente accanto con cui
confrontarlo. Se invece mostra il grezzo — mittente e oggetto — il cassetto torna un
centro notifiche come tutti gli altri, e la cosa che rende utile il sistema sparisce
proprio nel punto in cui servirebbe di più: quando le cose arrivano tutte insieme.

Le tre strade, e nessuna è ovvia:

- **riscritte, com'è adesso.** Una riga sola, sua, sempre dicibile. Il grezzo esiste
  nell'`ingresso` del task e si vede solo dopo aver estratto la notifica;
- **vere, e basta.** Mittente e oggetto come li manda il servizio. La riscrittura
  diventa una cosa che chiedi — «riassumimela» — e non una cosa che trovi;
- **vera in targa, riscritta nel corpo.** La targa porta chi scrive e l'oggetto vero, il
  corpo porta la riga sua. Due righe invece di una, e si vede sempre da dove viene.

Il test per decidere non è estetico: **se lei riscrive male, me ne accorgo?** Se la
risposta è no, la prima strada è sbagliata per quanto sia bella. → `02-confini §3`,
`04-motore §1`

**Quanto scambio tiene INPUT.** Botta e risposta resta a schermo, ma per quanto: la
giornata, la conversazione aperta, un numero fisso di scambi? → `04-motore §6`

**Quanto grande è l'estratto** che l'AI engine riceve dall'archivio. Numero di partenza da
smentire: otto file, un salto di collegamento. → `05-archivio §8`

**Quanto dura un arco.** Un progetto che cresce si divide per arco temporale: un mese, un
trimestre, o finché il file non supera una certa misura? → `05-archivio §8`

**Cosa si dimentica da solo.** La forma è decisa — non si cancella, si smette di pescare —
ma non dopo quanto. → `05-archivio §5`, `03-conoscenza §5`

**Quanto può restare indietro la voce.** L'arretrato si sente alla fine, ma non c'è una
scadenza: una cosa successa tre minuti fa vale ancora la pena di dirla? Si scopre
ascoltando. → `06-voce §7`

**Quanto ci mette a pensare.** Il riassunto ha tre passi da 350 ms, che è un numero
inventato: la latenza vera dell'AI engine decide se la bolla che lavora serve o è di troppo.
→ `07-flussi §6`, `04-motore §6`

**Dove si spezza una frase.** «Aggiungi un cuore e invia» si spezza; «scrivi a mia madre e
chiedile…» no. Oggi il confine è una riga di grammatica: la seconda metà dev'essere un
mandare secco in fondo. Ogni altro modo è una riga in più, ed è lì che serve il modello
piccolo al posto del parser. → `07-flussi §6`

**Quanto ritardo simulare.** Un servizio finto annuncia all'istante; uno vero fa polling o
riceve webhook. Le notifiche vere sono in tempo reale ma non istantanee: il ritardo va
imitato nei finti, perché cambia la sensazione. → `02-confini §7`

---

## Da fare, già deciso

**Il vetro è giusto, il fondo no.** Le bolle del prototipo sembravano «bianche e basta»,
e la ricetta del vetro non c'entrava: è identica a `L1 - Bubble` — film 62→44, blur 42,
saturate 1.9, brightness 1.14, anello bianco 78%. Quello che manca è **cosa ci sta
dietro**. I documenti di componente mettono tre macchie sature dietro il vetro (salvia,
ambra, verde scuro) ed è per quello che lì il materiale si vede; il prototipo — come
`L3 - Composizioni` — ha un gradiente liscio e quasi neutro, più la foto dell'utente
tenuta al 34% di opacità, 42% di saturazione e in `luminosity`. Il vetro non ha niente da
rifrangere, quindi rifrange il bianco.

Due strade, provate tutte e due sul vetro vero (17 settembre 2026):

- **la foto si vede.** `soft-light`, opacità 62%, saturazione 78%: il materiale torna
  vivo subito, ma il suo carattere dipende dalla foto che hai messo — con un'immagine
  scura o affollata cambia tutto;
- **il fondo si colora.** La foto resta in sordina e sono i tre aloni del sistema a
  portare il colore, come nei documenti di componente: il vetro si comporta uguale su
  qualunque scrivania. Più fedele a `legge 05` — «qualcosa da rifrangere, non qualcosa
  che rubi la scena» — e non dipende dall'utente.

Da scegliere. La seconda è quella che consiglierei. → `L1 - Moodboard`, `L1 - Bubble`

**La coda sul design.** Dal 17 settembre 2026 i documenti stanno in `design/` e si
correggono qui: questa non è più una lista di cose «da riportare di là», è una lista di
cose **da sistemare in quei file**. Le due righe delle aree e quella della Notificationbar
sono già fatte.

| dove | cosa |
|---|---|
| `L2 - WHO` → `L2 - Systembar`, `L2 - WHEN-WHERE` → `L2 - Profilebar` | **le due aree si ridividono**: tecnica di qua (microfono, volume, rete, batteria), tu di là (ora, giorno, luogo, volto e nome). Il volto passa dalla Systembar alla Profilebar, e il concetto di WHEN esce dal documento: va nella Notificationbar |
| tutti gli `L2`, `L3` | **gli ancoraggi cambiano**: la cornice è tutta sul bordo destro, incolonnata — Profilebar (44/40), Systembar (44/126, più piccola), Taskbar (44/180), campanella (44/44 dal fondo). In alto a sinistra non c'è più niente |
| `L2 - Sidebar` → `L2 - Notificationbar` | **l'area cambia nome.** Non è una rinomina cosmetica: cambia anche cosa contiene — non più la pila delle cose che aspettano te, ma le notifiche, che **non sono task** finché non ne estrai una. Qui il rename è fatto ovunque; di là il documento si chiama ancora `L2 - Sidebar` e tutti i rimandi di `docs/` puntano a quel titolo finché non lo cambi |
| `L1 - Sistema` | la tabella elenca cinque aree e la Notificationbar non c'è · la riga di TABLE dice ancora «una sola per volta, mai due al centro» · l'intestazione dice «otto regole fisse» e sono undici |
| `L1 - Sistema`, legge 01 | «la tastiera è una scorciatoia, non un'alternativa» non vale più: voce e scrittura sono di pari grado |
| `L2 - INPUT` | INPUT cambia funzione e ha **tre stati** — assente, scrittura, attesa. Tiene il testo dello scambio e la raccolta, **dentro la bolla**; niente virgolette, niente riferimenti ai task; il punto d'ascolto pulsa mentre ascolta. «A riposo INPUT non esiste» torna vera, ma per un'altra ragione: sparisce quando la conversazione è finita, non quando taci → `docs/04-motore §1` |
| `L1 - Moodboard` | **la cosa è un window manager con un motore AI al posto dell'interfaccia.** Non un assistente dentro un sistema: è il sistema — le finestre non esistono perché le ha sostituite qualcosa che capisce |
| tutti gli `L2` | **le bolle sono troppo grandi.** Nel prototipo sono scese: bolla raggio 24 e titolo 23, carta 412 di larghezza, chip alti 30, testo di INPUT 17. Da riportare di là, o da smentire con numeri migliori |
| `L2 - Table`, `L2 - Sidebar` | le frasi compaiono **sotto il task a cui INPUT parla** — la MAIN, o la carta in cima se non c'è MAIN — e non più dentro INPUT. Da disegnare → `docs/01-modello §3` |
| `L2 - Table`, movimento | quando un task prende il fuoco, gli altri si **attenuano un poco**. Di quanto, e se rientra nei tre livelli di opacità della legge 08, è da decidere di là → `docs/01-modello §3` |
| `L3 - Composizioni` | l'ora è disegnata in peso 600, ma `L2 - WHEN/WHERE` dice 300 e L2 è la fonte di verità per L3. Il prototipo segue L2 |
| `L3 - Composizioni`, `00` | in SYSTEMBAR manca la **rete**, che `L2 - WHO` elenca fra volume e batteria |
| `L2 - INPUT` | l'intestazione dice «ancoraggio bottom 44 · **centrato**», ma `L2 - Sidebar` lo disegna in basso a sinistra ed è lì che deve stare. Deciso: **a sinistra** |
| `L1 - Sistema`, legge 06 | **la famiglia delle icone cambia: da Material Symbols Rounded a Lucide.** È una modifica di L1 ed è decisa, quindi va riscritta la legge e poi aggiornate **tutte** le occorrenze: `L1 - Bubble`, ogni `L2`, `L3 - Composizioni`. Il confronto che ha portato alla scelta sta in `L1 - Icone` |
| `L2 - Sidebar` | **la carta scende da 496 a 400 px.** 496 era dimensionata su un testo da 17; con la taratura il testo è 14, e la differenza era tutta aria — la carta sembrava enorme e mezza vuota |
| `L3`, `L2 - Table` | **le bolle hanno lo stesso difetto e non è ancora corretto**: 452 a fuoco e 388 a riposo erano su un titolo da 26, che adesso è 16. In proporzione starebbero sui 290 / 250 |
| tutti gli `L2`, `L3`, `L1 - Bubble` | **le misure di testo e icone sono state tarate**, guardando tutti gli elementi insieme ai loro ancoraggi veri. La tabella completa sta fra le cose decise, sotto «Le misure». Il sistema scende di circa un terzo: il titolo della bolla passa da 26 a 16 |
| `L1 - Sistema`, legge 01 | **cade «nessun nome proprio: il sistema non è qualcuno»**: l'assistente è un personaggio, ha un nome e una voce con un genere. Restano i due limiti di `docs/06-voce §3` |
| `L1 - Colori`, legge 04 | **la tavolozza è cambiata nel prototipo e non nei documenti.** Il profilo (`Archivio/<id>/settings.txt`, blocco `tema`) porta il set «ritoccato»: gli stati diventano più vivi (`#00a878`, `#eda31c`, `#e0364f` invece di `#4e6b54`, `#b3762a`, `#8a2e22`), il fondo del sistema perde il verde e diventa una scala neutra, il film di vetro sale a 0,88 / 0,66 e l'immagine sotto passa da `luminosity` a `normal` — cioè **si vede a colori**. La legge 04 regge (gli stati restano tre e restano stato), ma le tinte sono design: o si riportano di là, o si smentiscono. Finché vivono solo qui, i due posti dicono due cose diverse |
| `L2 - Profilebar`, legge zero | **il velo diventa un contenitore, e la deroga va riscritta o smentita.** Il documento dice che la Profilebar sta **senza contenitore** — «una bolla è una cosa che può finire, e chi sei tu non finisce mai» — e il velo sotto al luogo è dichiarato «non è un contenitore, è un velo». Dal 17 settembre 2026 il prototipo mette **quando, dove e chi dentro un velo solo**, con l'ora e il luogo impilati a destra e il volto a fianco: le tre cose erano già una cosa sola — il contesto — e stavano vicine fingendo di non stare insieme. Ma un velo che tiene tutto ha la forma di un contenitore, e la distinzione «velo, non bolla» adesso regge solo a parole. Da decidere: o la deroga si riscrive dicendo cosa separa un velo da una bolla (nessun bordo, nessuno stato, nessun colore, e non può finire), o il prototipo torna indietro. **Finché non è deciso, i due posti dicono due cose diverse** |
| legge 04 | max due punti di colore per schermo: nel prototipo non c'è nessun controllo che lo imponga, e con lo scenario pieno si sfora |
| `L2 - Taskbar` | **il gruppo**: un chip che ne contiene altri, con colore e icona del membro più urgente e il numero al posto del dato. La logica sta in `01-modello §6`; manca com'è fatto — che spessore ha, come si vede che dentro c'è più di una cosa, come si apre |
| `L2 - Table`, movimento | **dentro un task**: la bolla a fuoco si allarga e mostra il corpo, le altre si scuriscono più di quanto già facciano. Quanto si allarga, quanto scuriscono e come ci arriva sono design e non sono disegnati — la logica sta in `01-modello §7`. Nel prototipo: 560 di larghezza, le altre a 0,34 di opacità |

**L'AI engine.** È il pezzo che vale: far funzionare «rispondi ad Andrea che venerdì va
bene» invece di una bozza già scritta a mano nello scenario. Cosa vede della memoria ora
è deciso — un estratto di file (`05-archivio §0`) — quindi non c'è più niente da decidere
prima: c'è da farlo. → `04-motore §5`

**Il resto dei sette servizi.** Nel prototipo adesso ce ne sono cinque: posta, note,
**contatti** (16 settembre 2026, perché senza rubrica «scrivi a mia madre» non ha nessuno
a cui scrivere), e **calendario** e **promemoria** dal 17 settembre 2026. Quei due
mancavano in un modo che faceva male: stavano dentro `Destinazione`, quindi il sistema
poteva proporsi di scriverci, e poi il registro era vuoto e il task si bloccava con «non
ho un modo per scrivere su calendario». Col calendario arriva anche il primo evento con
un'ora, e quindi la prima cosa che diventa un **ORARIO** invece di una carta: quel ramo
del filtro non si era mai visto girare. Restano fuori sms e notizie. → `02-confini §2`,
`03-conoscenza §4`

**L'interruzione.** «Aspetta» ferma l'azione, ma deve fermare anche la voce che sta
leggendo, a metà parola. È un requisito sul TTS. → `04-motore §6`

---

## Chiuse, per memoria

**I contenuti sono due, non quattro.** Un task porta `ingresso` — quello con cui nasce,
immutabile — ed `esito` — quello che produce. `corpo` e `richiesta` sono diventati
l'ingresso, `uscita.contenuto` è diventato l'esito, e `uscita` è rimasta il **dove** e il
**a chi**. Ne segue che `consegna` riceve due argomenti, e che produrre un esito e
diventare `aspetta te` sono lo stesso fatto. Deciso e fatto il 16 settembre 2026.
→ `01-modello §1`

**Il turno di parola.** La voce dice **una cosa alla volta**: non si sovrappone, non si
interrompe, e quello che arriva mentre parla si mette da parte e si dice alla fine in una
volta sola — tenendo l'ultima, più una domanda rimasta senza risposta. A tagliarla a
metà parola sei solo tu, con «aspetta». Vale anche per il campanello, nei due versi.
Ne segue una cosa che vale la pena dire da sola: **lo schermo è immediato, la voce è
ordinata.** Deciso il 16 settembre 2026. → `06-voce §3.1`

**Non serve una quarta uscita: «metti da parte» è «dopo».** Una cosa che non ti interessa
adesso si programma e torna — va in `ORARIO`, non in un limbo. Quello che mancava non era
uno stato, era **la frase**: il sistema dice fra quanto te la rimette davanti («Perfetto
Lucia, te lo ricordo fra due ore»), perché mettere via una cosa senza sapere quando torna
è la sensazione che il sistema deve togliere. Deciso il 16 settembre 2026.
→ `07-flussi §2`, `01-modello §9`

**I flussi.** Le casistiche non sono un elenco di cose da premere: sono catene, e ogni
passo dichiara cosa devi vedere quando è andato. Da lì vengono quattro pezzi nuovi — il
riassunto come task derivato che si vede lavorare, la composizione di un messaggio in
discorso diretto, il fuoco che sa tornare indietro, e più comandi in una frase sola.
Deciso il 16 settembre 2026. → `07-flussi`

**L'archivio.** La memoria si posa in file: una cartella per profilo, tre cartelle chiuse
dentro (Persone, Ricordi, Progetti), `preferenze.md` per ciò che hai dichiarato e
`osservato.md` per ciò che il sistema ha dedotto. Ci scrive l'AI engine. «Dimenticalo»
smentisce, non cancella. Deciso il 16 settembre 2026. → `05-archivio`

**L'archivio è dell'agente e non si mostra.** È la sua testa, non un tuo raccoglitore: non
si apre, non si sfoglia, non si nominano mai i file. Quando scrive dice una frase — «me lo
segno su Acme», o «ho preso nota» — e il controllo passa dalla conversazione: «cosa ti sei
segnato?», «dimenticalo». Racconta contenuti, mai posizioni. Deciso il 16 settembre 2026.
→ `05-archivio §3`

**I profili.** La divisione per utilizzatore separa **la memoria e il modo**: fra profili
non passa niente — nessun dato, nessuna preferenza, nessuna abitudine dedotta. Cambiare
utilizzatore non è filtrare un archivio solo: è un altro archivio. Deciso il 16 settembre
2026. → `05-archivio §1`

**Le autorizzazioni.** Si autorizza una volta per tutte **solo ciò che nessun altro
vede**: calendario privato, contatti, promemoria, note, disco. Posta, sms, inviti con
destinatari e agenti di terzi mai, nemmeno se lo chiedi. Si concede per promozione alla
terza conferma, si revoca con «chiedimi sempre», e l'annullamento resta comunque: si toglie
il cancello, non la retromarcia. Deciso il 16 settembre 2026. → `02-confini §6`

**Le risposte alle deleghe non passano dal filtro.** Rientrano nel task che le ha
generate; se era caduto in `MEMORIA`, risorge come chip ambra con il nome di prima. Dal
filtro passa solo ciò che nessun task stava aspettando — quindi un agente che risponde
spesso non affoga la pila. Deciso il 16 settembre 2026. → `01-modello §3`, `02-confini §3`

**La voce gira in locale.** Piper dentro la pagina, con eSpeak NG per l'italiano: il
modello si scarica una volta e poi non esce più niente. Deciso il 16 settembre 2026.
→ `06-voce §5`

**L'assistente è un personaggio.** Ha un nome — *Amanda* — e una voce femminile. Cade il
pezzo di legge 01 sul nome proprio. Deciso il 16 settembre 2026. → `06-voce §3`

**Le tre cartelle dell'archivio si chiamano Persone, Ricordi, Progetti.** «Ricordi» al
posto di «Personale». Deciso il 16 settembre 2026. → `05-archivio §1`

**Un servizio si può spegnere**, e spento vuol dire spento in tutti e tre i verbi: chi
chiede una consegna a un servizio spento trova un `bloccato`, non un silenzio. Per le
cartelle dell'archivio spegnere significa smettere di scriverci, non dimenticare.
Deciso il 16 settembre 2026. → `02-confini §2`

**Il profilo si legge da un file.** `Archivio/<id>/settings.txt`: una riga per cosa, si cambia a
mano e si ricarica. Mescola di proposito tre strati che nel modello sono separati —
preferenze, contesto, stato della macchina — perché per provare una situazione conta
avere un posto solo. Deciso il 16 settembre 2026. → `src/conoscenza/profilo.ts`

Il 16 settembre 2026 il file è cresciuto di quattro cose, e tutte e quattro girano:

| riga | cosa fa |
|---|---|
| `language:` | la lingua del sistema, e quella con cui la bocca legge |
| `notifications: set / sound` | il campanello acceso o muto, e **quale** file suona: un campanello si sceglie ascoltandolo (`06-voce §6`) |
| `tema:` | una tavolozza in prova, applicata alle variabili di `:root`. È **design**, e vive di là: qui si può solo guardarla sul vetro vero prima di decidere — vedi la coda qui sopra |
| `sesso:` (assistente) | il sesso del personaggio, che non è il timbro della voce: oggi vanno insieme, sono due righe perché il giorno che divergono non si rifaccia il formato (`06-voce §3`) |

Un nome che il tema non conosce si lascia cadere e si dice in console: un file scritto a
mano ha sempre una riga di troppo, e non deve rompere niente.

~~**L'intesa.**~~ **Disfatta il 17 settembre 2026, un giorno dopo.** Diceva: il locale non
esegue, intende — da ogni frase ricava un metalinguaggio che muove l'interfaccia subito e
viaggia verso l'AI engine coi riferimenti già sciolti.

Non regge più, perché il locale non c'è più: un metalinguaggio fra due cervelli, con un
cervello solo, non vuol dire niente. Al posto suo l'AI engine ha delle **mosse** e una
**vista** che si chiede da sé. Quello che è sopravvissuto di quel giorno è la seconda
metà: quando non è sicuro di quale cosa parli, **chiede e aspetta**, e la domanda è il
`bloccato` nella forma «non ho capito quale» che il modello aveva già.
→ `04-motore §2`

**Le misure.** Tarate il 16 settembre 2026 su una consolle che mostrava tutti gli elementi
insieme, ai loro ancoraggi veri. Il prototipo le usa già; i documenti di design no.

| | adesso | era |
|---|---|---|
| icona nella bolla · nel chip | **14** | 19 · 18 |
| icona nella carta · nella cornice · in SYSTEMBAR | **16** | 17 · 19 · 20 |
| bolla: targa · titolo · corpo · etichetta · frasi | **10 · 16 · 12 · 10 · 12** | 11 · 26 · 15 · 9,5 · 16 |
| chip: altezza · nome · dato | **30 · 14 · 10** | 34 · 15 · 11,5 |
| carta: targa · testo · frasi | **10 · 14 · 12** | 10 · 17 · 14,5 |
| INPUT: quello che dici · la risposta | **13 · 13** | 15 · 16 |
| cornice: ora · data e luogo · dati di SYSTEMBAR | **40 · 14 · 12** | 34 · 16 · 12,5 |

**Le icone sono Lucide.** Scelte guardandole affiancate alla misura vera e sul vetro
vero (`L1 - Icone` su Claude Design): terminazioni arrotondate e tratto uniforme, che
stanno con i raggi delle bolle invece di sembrare prese in prestito. Nel prototipo sono
già in funzione — `mail`, `folder`, `file-text`, `users`, `message-circle`, `image`,
`alarm-clock`. Deciso il 16 settembre 2026. → `L1 - Icone`

**Il movimento è implementato.** Le quattro transizioni di `L1 - Soap Bubbles` girano nel
prototipo con le loro durate e curve, e la scrivania calcola le posizioni invece di averle
scritte: nascita nel punto più libero, onda a cascata, fuoco verso il centro, separazione
perché nessuna bolla copra il contenuto di un'altra. Il peso dell'ora scende a 300, e in
SYSTEMBAR compare la rete. Deciso il 16 settembre 2026. → `src/aree/scrivania.ts`

**Gli agenti secondari.** Il principale delega, **un livello solo**, e un secondario non
tocca lo stato, non consegna e non scrive nell'archivio. Non compare mai a schermo — il
chip che pulsa è già la sua faccia — e muore col task. Un agente **di terzi** invece è
un'altra cosa: è una consegna, passa da `aspetta te` ogni volta, e la sua risposta rientra
dal filtro. Il confine non è «è un agente?», è «è tuo?». Deciso il 16 settembre 2026.
→ `04-motore §2`, `02-confini §5`

**L'agente è perpetuo.** Non è di un progetto e non è di uno strumento: dura più dei
progetti, degli strumenti e degli altri agenti che ti aiuta a usare. Ne segue che
`Progetti/` sono i tuoi, non i suoi, e che l'archivio è l'unica parte del sistema che non
si può rifare da capo. Deciso il 16 settembre 2026. → `05-archivio`

**La disposizione su disco non è modello.** Il genere di un'entità è modello; dove
finiscono i byte è gestione del filesystem, cioè un servizio. La struttura di cartelle non
si vede mai, non si dice mai, non genera mai una frase. Un progetto che cresce si divide
per arco temporale e non si riassume; le decisioni stanno in una cartella loro dentro il
progetto e non invecchiano con gli archi. Quello che qualcun altro dice davanti alla
macchina entra attribuito nel profilo di chi la sta usando, e lì resta. Deciso il 16
settembre 2026. → `05-archivio §1`, §4

**Cosa vede l'AI engine: un estratto.** Non tutto il grafo — i file delle entità nominate,
più un salto lungo i collegamenti. Deciso il 16 settembre 2026. → `04-motore §6`,
`05-archivio §0`

**INPUT ha tre stati.** *Assente* quando non c'è niente da dire né da ricordare,
*scrittura* mentre parli o scrivi (si vede solo il messaggio di adesso), *attesa* finché la
conversazione è aperta (si vede lo scambio, **dentro** la bolla). Il confine fra attesa e
assente sono i 30 secondi di `01-modello §3`. Dentro non entra mai niente di un task, e non
ci sono virgolette: le «» marcano ciò che puoi dire, non ciò che hai detto. Un richiamo a un
task a schermo sposta il fuoco e fa comparire le frasi sotto quel task. Deciso il 16
settembre 2026. → `04-motore §1`, `01-modello §3`

**Le aree diventano sei, e stanno tutte a destra.** `WHO` e `WHEN/WHERE` non esistono
più: al loro posto la **PROFILEBAR** — l'ora, il giorno, dove sei, tu — e la
**SYSTEMBAR**, più piccola perché conta meno: microfono, volume, rete, batteria. La
divisione non è più «tempo e luogo» contro «macchina», è **tu** contro **la macchina**.

Il concetto di `WHEN` si riversa nella NOTIFICATIONBAR: le cose che hanno un'ora non
hanno più un'area loro, stanno nel cassetto in fila con quelle arrivate, **una lista sola
in ordine di tempo** — sopra quello che è successo, sotto quello che deve succedere. Ne
segue che «cosa mi aspetta?» e «fammi vedere le altre» aprono lo stesso posto, e che
cade la vecchia regola «a schermo c'è solo il prossimo»: nel cassetto ci sono tutte.

A schermo tutto quello che non è TABLE sta incolonnato sul bordo destro, dall'alto in
basso in ordine di importanza: Profilebar, Systembar, Taskbar, campanella. Lo schermo
resta sgombro a sinistra, dove vivono le bolle e INPUT. Aprendo il cassetto **tutto
intorno si spegne**: quello che stai guardando è lì dentro.

Deciso il 17 settembre 2026. → `04-motore §1`, `01-modello §2`, `02-confini §3`

**La tastiera è di pari grado.** Non è una scorciatoia: voce e scrittura sono due canali
equivalenti in ingresso, e le risposte sono sempre scritte *e* parallelamente dette.
Deciso il 16 settembre 2026. Da qui vengono i due cambi di design qui sopra.
→ `04-motore §1`
