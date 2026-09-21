# 06 — La voce

Chi ascolta, chi parla, chi riconosce. E quanto deve sembrare umana.

`04-motore` dice *cosa* succede a una frase. Qui si dice **con che cosa si sente e con
che cosa si risponde**, che è la parte che si può sbagliare in modo irrimediabile: una
voce sbagliata non è un difetto di rifinitura, è un altro prodotto.

---

## 1. Tre pezzi, non due

Il motore vocale sembra due cose — sentire e parlare — e invece sono tre. Il terzo è
quello che il modello ha appena reso obbligatorio e che oggi non esiste.

| | cosa fa | oggi | dove va |
|---|---|---|---|
| **l'orecchio** | trascrive quello che senti dire | niente: si scrive | Whisper in locale |
| **la bocca** | legge ad alta voce le risposte | `SpeechSynthesis` del browser | §3 |
| **il riconoscitore** | dice **chi** sta parlando | non c'è | impronta vocale, in locale |

> **Whisper trascrive, non identifica.** Dice *cosa* è stato detto, non *da chi*. Sono
> due modelli diversi, e confonderli è l'errore che rende inapplicabile la regola più
> importante del sistema.

Perché il terzo è obbligatorio: `03-conoscenza §1` dice che l'input è riservato a chi ha
la sessione, e che il sistema distingue tre casi — sei tu, è qualcuno che conosco, non ti
conosco. Senza riconoscimento della voce quella regola non è applicabile, e un assistente
che obbedisce a chiunque passi non è un assistente personale.

---

## 2. L'orecchio

**Whisper in locale**, nella taglia più piccola che regge l'italiano. Non esce niente:
`04-motore §3` dice che la trascrizione non attraversa mai il confine, ed è una promessa
che si mantiene solo se l'orecchio sta dentro la macchina.

Due cose che l'orecchio deve fare e che di solito si scordano:

- **riconoscere il verbo di apertura in modo istantaneo.** «Senti», «trova», «scrivi»,
  «dimmi», «aspetta» sono il risveglio: se arrivano in mezzo secondo non sono un
  risveglio. Questo si fa con un modello piccolissimo sempre acceso, non con Whisper;
- **sapere quando hai finito di parlare.** Il silenzio non è una soglia di volume: una
  pausa dentro una frase non è la fine della frase. È il pezzo che fa sembrare un
  sistema attento o impaziente.

---

## 3. La bocca

Qui sta la domanda vera, e la risposta onesta è che **`SpeechSynthesis` del browser non
è accettabile**: è la voce di un navigatore che legge un testo, e comunica esattamente
quello. Va bene per scoprire se il copy è dicibile — che è il motivo per cui l'abbiamo
messa — e per niente altro.

### Cosa si può usare davvero

| | dove gira | italiano | espressività | cosa costa |
|---|---|---|---|---|
| **Piper** | in locale, anche su CPU debole | comprensibile, piatto | nessuna | niente |
| ~~**Kokoro**~~ | in locale, CPU, modello piccolo | **non parla italiano** | poca, ma naturale | niente |
| **XTTS / F5 / CosyVoice** | in locale, meglio con GPU | buono | discreta, clona voci | GPU, e licenze da verificare |
| **Chatterbox, Orpheus, Sesame** | in locale con GPU | da verificare | **alta**, con controllo del tono | GPU vera |
| **ElevenLabs, Cartesia, OpenAI, Azure, Hume** | in rete | ottimo | **altissima**, istruibile a parole | **il testo esce dalla macchina** |

**Kokoro è stato provato il 17 settembre 2026, e non si può usare.** La libreria per il
browser, `kokoro-js`, spedisce 28 voci e sono tutte inglesi: le due italiane esistono nel
modello ma non sono esposte, perché Kokoro fuori dall'inglese vuole un fonemizzatore per
lingua e la libreria ne implementa uno solo. Gliel'abbiamo fatto dire in inglese per
misurare il motore: **dodici secondi** per una frase che Piper fa in uno. Darglielo,
l'italiano, si potrebbe — passando da eSpeak NG, che il progetto già spedisce — ma quel
numero resterebbe. Si riascolta con `strumenti/banco-voci.html`.

L'ultima riga è il problema, e non è un dettaglio di costo: **quello che la bocca legge è
il contenuto delle tue cose**. Se la voce arriva da un servizio, le risposte del sistema
— che parlano dei tuoi progetti, delle tue persone, delle tue mail — escono dalla
macchina a ogni frase. Un prodotto che promette «la trascrizione non esce mai» e poi
manda fuori tutte le risposte per farle leggere si sta prendendo in giro.

Quindi: **se la voce migliore è in rete, SYSTEMBAR deve dirlo**, esattamente come lo dice per
l'AI engine, e deve essere spegnibile in un attimo. Oppure si sta in locale e si accetta
una voce meno brillante.

### Quanto umana — l'assistente è un personaggio

Qui c'era scritto il contrario, e la decisione del 16 settembre 2026 lo ribalta:
**l'assistente può essere qualcuno.** Ha un nome — nel profilo di Lucia si chiama
*Amanda* — una voce con un genere, e un carattere che si sente.

Ne cade un pezzo di **legge 01**, quello che dice «nessun nome proprio: il sistema non è
qualcuno». Va riscritto di là, e non per cascata: è una legge, e si cambia solo
dichiarandolo.

Ma «personaggio» non vuol dire «qualunque cosa», e le due righe che restano in piedi
sono quelle che impediscono al carattere di diventare un impiccio:

> **Un personaggio non è un ostacolo.** Dire una cosa in più perché è simpatico è tempo
> che tolgo a te. La personalità sta in *come* dice le cose, non in quante ne dice.

> **Un personaggio non chiede di essere consolato.** Può essere caldo, asciutto, ironico;
> non può fare pesare un fallimento come se fosse suo — «purtroppo non ce l'ho fatta»
> con la voce mesta ti mette addosso un lavoro che non è tuo.

E tre cose che il personaggio deve saper fare, che sono le stesse di prima ma adesso
sono il minimo e non il massimo:

1. **le domande devono suonare come domande.** «Le mando?» con l'intonazione sbagliata
   è la differenza fra un assistente e un tostapane;
2. **i nomi propri e i numeri vanno detti bene.** «Andrea Riva», «il 15 settembre»,
   «128 su 412»: è lì che il sintetizzatore si tradisce;
3. **deve partire subito.** Se la voce comincia dopo che la frase è finita di generare,
   la latenza raddoppia. Serve che legga **mentre** il testo arriva.

Questo alza l'asticella sulla scelta tecnica: una voce neutra da sintesi non regge un
personaggio. Le famiglie che lo reggono sono quelle espressive — in rete quasi tutte, in
locale solo quelle con GPU — e quindi la decisione sul personaggio **tira con sé** quella
su dove gira la voce (§6.1).

### Il turno di parola

Questa è una legge, non una preferenza, e vale per qualunque bocca ci sia dietro.
Deciso il 16 settembre 2026.

> **Una cosa alla volta. Non si sovrappone, non si interrompe, e quello che arriva
> mentre parla si dice alla fine.**

Tre regole, e la terza è quella che cambia il carattere della cosa.

**Non si sovrappone.** Finché sta dicendo una cosa non ne comincia un'altra. Mai due voci
insieme, nemmeno per mezza sillaba — e nemmeno la voce sopra il campanello, o il
campanello sopra la voce (`§6`).

**Non si interrompe.** Quello che ha cominciato a dire lo finisce. L'unica cosa che la
taglia a metà parola sei tu, con «aspetta» (qui sotto). Una voce che si tronca da sola a
ogni notizia nuova non è un assistente: è una radio rotta.

**Quello che arriva mentre parla si mette da parte**, e si dice quando ha finito, in una
volta sola. Tre risposte in fila — «Aggiunto», «Mando a mamma», «Mandata a Carla
Moretti» — sono tre righe di uno stesso fatto, e quello che conta sentire è la terza.
La regola del riepilogo non inventa **nemmeno una parola**, perché la voce legge quello
che è scritto e basta (`04-motore §1`):

- si tiene **l'ultima**, che in una catena è quella vera;
- non si butta **una domanda rimasta senza risposta**: è l'unica cosa che chiede qualcosa
  a te, e va in fondo, perché una domanda si aspetta alla fine.

Il costo è dichiarato: una risposta può arrivare all'orecchio qualche secondo dopo che è
arrivata allo schermo. È il verso giusto — **lo schermo è immediato, la voce è
ordinata** — ed è esattamente il motivo per cui sono due canali paralleli e non uno solo
(`04-motore §1`). Se fossero lo stesso canale, uno dei due dovrebbe rinunciare al suo
ritmo.

Questo **non contraddice** il «deve partire subito» di qui sopra: quello parla della
latenza della prima parola, cioè di non aspettare che il testo sia finito di generare.
Qui si parla di cosa succede alla seconda cosa da dire mentre la prima è in bocca.

Nel prototipo il turno è `src/voce/turno.ts`, ed è un pezzo suo apposta: si prova senza
browser, con una bocca finta che si accorge se qualcuno le parla sopra (`npm run
scenario`).

### L'interruzione

«Aspetta» ferma l'azione, e deve fermare **anche la voce, a metà parola**
(`04-motore §6`). È un requisito sul motore vocale, non sul motore dei task: una voce
che finisce la frase mentre tu hai già detto di fermarti non sta ascoltando, sta
eseguendo. Con una voce in rete questo è più difficile, perché l'audio è già in volo.

---

## 4. Il riconoscitore

Serve a rispondere a una domanda sola: **chi sta parlando adesso?** Tre risposte
possibili, che sono i tre stati di SYSTEMBAR.

- **sei tu** — comandi;
- **qualcuno che conosco** — non comanda, può lasciare un messaggio;
- **non ti conosco** — il sistema non risponde.

L'impronta vocale **sta in locale e non esce mai**, come la trascrizione. È un dato
biometrico: se esce, il danno non è che qualcuno legge le tue mail, è che qualcuno ha la
tua voce.

E deve poter dire **non lo so**. Una voce al telefono in vivavoce, un raffreddore, due
persone che parlano insieme: l'incertezza è la norma, non l'eccezione. Nel dubbio il
sistema si comporta come col caso più prudente — non ti conosco — e lo dice.

---

## 5. Nel prototipo

| pezzo | adesso | il passo dopo |
|---|---|---|
| l'orecchio | non c'è: si scrive | Whisper piccolo, in locale |
| la bocca | **Piper, in locale** | una voce più espressiva, quando ce ne sarà una che gira qui |
| il riconoscitore | si cambia a mano dalla pedana | impronta vocale |

### La bocca, com'è fatta

Tre pezzi in fila, e nessuno è magico (`src/voce/piper.ts`):

1. **eSpeak NG**, in WebAssembly, trasforma le parole in fonemi. È il pezzo che sa
   l'italiano — che «gli» non è «g-l-i», che «perché» non finisce come «perche».
2. La **mappa dei fonemi** del modello li trasforma in numeri, con un separatore fra
   l'uno e l'altro: è la convenzione di Piper, non una scelta nostra.
3. **onnxruntime** fa girare il modello e restituisce dei campioni, che diventano un wav.

La voce femminile è `it_IT-paola-medium`, quella maschile `it_IT-riccardo-x_low`. Il
modello si scarica la prima volta e resta nella cache del browser; finché non è pronto
parla la sintesi di sistema, perché **un assistente che tace due minuti mentre scarica
un modello non è un assistente: è un programma che si installa**.

Due cose imparate montandolo, e valgono per chiunque ci rimetta mano:

- **Kokoro non fa italiano.** Il modello ha le voci `if_sara` e `im_nicola`, ma la
  libreria per il browser espone solo l'inglese. Era la prima scelta, ed era sbagliata.
- Il fonemizzatore che arriva con quelle librerie **contiene solo l'inglese**: serve
  `espeak-ng` completo, 17 MB, che le lingue ce le ha tutte.

I binari — 58 MB fra onnxruntime ed eSpeak — non stanno nel repo: li mette a posto
`npm run voce`, che gira da solo dopo `npm install`.

Il modo di scegliere la bocca è lo stesso delle icone e delle misure: **si ascolta**. Si
prende una manciata di frasi vere del sistema — una domanda, una consegna riuscita, un
blocco, un nome proprio, dei numeri — e si fanno leggere a tutte le candidate, di fila,
con lo stesso testo. Quello che sembra ovvio scritto si decide in trenta secondi
ascoltando.

---

## 6. Il campanello

La bocca legge; il campanello no. È l'unico suono che il sistema fa **da sé**, e dice una
cosa sola: è arrivato qualcosa.

Serve perché il layer copre lo schermo intero. Una bolla che nasce in un angolo mentre
guardi da un'altra parte non la vedi, e il sistema non ha una barra di notifiche dove
accumularla: o te ne accorgi adesso, o quella cosa aspetta in silenzio.

Suona in un punto solo — quando una proposta ha passato il filtro ed è diventata un task
(`02-confini §3`). Se il filtro dice «niente», non si sente niente: è tutto il senso del
filtro. La newsletter non fa rumore.

- **il file** lo dice il profilo — la riga `notifications: sound:` di
  `Archivio/<id>/settings.txt` — e vive in `pubblico/suoni/` col suo nome vero, non
  con un nome di comodo: due suoni che si chiamano tutti e due «notifica» non si possono
  confrontare. Senza quella riga resta `notifica.mp3`
- **acceso o muto** lo dice la stessa riga (`set: sound` / `set: silent`). Muto vuol dire
  muto: non c'è un mezzo campanello
- **il volume** è quello della macchina (`Archivio/<id>/settings.txt`, `VOLUME: 40%`),
  non un numero nostro: SYSTEMBAR lo dichiara a schermo, e sarebbe strano che il sistema lo ignorasse
- **prima che tu abbia toccato qualcosa** il browser non lascia suonare niente e rifiuta
  la richiesta senza dire niente. Non è un errore: è la pagina appena aperta

**Il campanello non suona mai sopra la voce**, e la voce non comincia mai sopra un
din-don (`§3.1`). Se arriva qualcosa mentre lei parla, il campanello resta appeso e si
sente appena c'è silenzio — **uno solo**, anche se nel frattempo è arrivato due volte.
Non è una perdita: lo schermo ha già fatto il suo lavoro nell'istante in cui la cosa è
arrivata, e il campanello serve a farti guardare, non a datare l'evento. Due din-don
sovrapposti poi non dicono «due cose»: dicono che qualcosa non va.

Resta da decidere se il campanello sia **uno solo o tre**: una cosa che arriva, una cosa
che si è conclusa e una cosa che si è bloccata sono eventi diversi, e la legge 04 li
distingue già per colore. Oggi suonano uguale — cioè solo il primo suona.

---

## 7. Domande aperte

1. ~~**In locale o in rete.**~~ **Deciso: in locale.** Piper gira dentro la pagina e non
   esce niente. Resta aperto se un giorno valga la pena una voce più espressiva pagandola
   con il confine — ma per ora la risposta è no.
2. ~~**Quanto lontano si spinge il personaggio.**~~ **Deciso il 17 settembre 2026: dice
   «io», e non ha opinioni.** Parla in prima persona e ha un tono — caldo, asciutto,
   ironico, come lo scrivi — ma non dice «secondo me» e non commenta le scelte di chi lo
   usa. Se gli chiedi un parere, risponde sui fatti che vede, non sui gusti.

   Le tre leggi stanno nel codice (`src/ai-engine/strumenti.ts`) e non nel profilo: un file
   che si edita a mano può cambiare *come* parla, non *cosa gli è permesso essere*. Il
   carattere invece sta nel profilo, sotto `copione:` — si prova cambiando una riga e
   ricaricando (`04-motore §2`).

   Resta aperto il pezzo più piccolo: **se il nome si veda a schermo** o viva solo nella
   voce. Oggi non si vede da nessuna parte, e nessuno l'ha sentito mancare.
3. ~~**Se la voce ha un genere.**~~ **Deciso: femminile**, e l'assistente si chiama
   *Amanda* (`Archivio/<id>/settings.txt`). Resta da decidere **quanto si vede il personaggio**:
   se dice «io», se ha opinioni, se il nome compare da qualche parte a schermo o vive
   solo nella voce.
4. ~~**Cosa fa il sistema quando il microfono è spento**~~ **Deciso il 17 settembre 2026:
   diventa una modalità, e si chiama tastiera** (`04-motore §1`).
   Non è un prodotto diverso e non è un ripiego — voce e scrittura sono di pari grado
   (`04-motore §1`), quindi spegnere il microfono toglie un canale su due e quello che
   resta fa tutto. Tre conseguenze, e sono quelle che si vedono:
   il punto d'ascolto **sta fermo e spento**, perché un pallino che pulsa senza un
   orecchio dietro è l'unica bugia che l'interfaccia può dire; il campo **prende il fuoco
   da sé**, perché è l'ingresso e non un posto dove andare; e SYSTEMBAR dice **SCRIVI**
   invece di *SPENTO*, perché dichiara un modo e non un guasto.

   Spegnerlo si dice («non ascoltare», «scrivo») ed è una mossa dell'AI engine. **Riaccenderlo
   no**: col microfono spento nessuna frase arriva, e non esiste uno strumento che apra il
   microfono di qualcuno. È l'unico atto del sistema che vive soltanto come gesto — si
   preme il microfono in SYSTEMBAR — ed è un'eccezione dichiarata alla legge 01.

   La domanda vecchia era «un assistente vocale col microfono spento è ancora questo
   prodotto?». La risposta, adesso: sì, ed è la stessa cosa da un'altra porta. Quello che
   resta da guardare è **se la voce in uscita ha ancora senso in tastiera** — oggi
   continua a leggere, e potrebbe essere giusto o potrebbe essere una voce che parla a
   qualcuno che ha scelto il silenzio.
5. **Quanto può restare indietro la voce.** Il turno di parola (`§3.1`) dice che
   l'arretrato si sente alla fine, ma non dice fino a quando. Se lei sta leggendo un
   riassunto lungo e nel frattempo è successo qualcosa tre minuti fa, quel qualcosa vale
   ancora la pena di dirlo? Serve una scadenza — e si scopre ascoltando, non a tavolino.
6. **Come si riconosce una voce che non ha mai sentito prima.** Perché diventi «qualcuno
   che conosco» qualcuno deve presentarla, e il modello non dice come.
