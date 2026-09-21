# 02 — Più cose insieme

Come si tengono in piedi tre cose per volta senza che nessuna si perda, e chi esattamente
lavora in parallelo.

`01-modello` dice cos'è una cosa. Questo documento dice cosa succede quando ce ne sono
cinque, che è la situazione normale e non il caso limite.

---

## 1. L'unità del parallelismo è il task, non la conversazione

È la riga che separa questo sistema da un assistente vocale, ed è una scelta di modello
prima che di implementazione.

> **Ogni intenzione diventa un task, e ogni task ha uno stato suo.**

Un assistente a conversazione singola tiene una cosa sola: quello che gli hai chiesto
prima è finito, e se lo riprendi devi rispiegarlo. Qui la conversazione è **una sola** — c'è
una bocca sola e un orecchio solo — ma quello di cui parla sono **tante cose**, ognuna con
la sua vita.

Ne segue la proprietà che regge tutto il resto:

> **Un task non ha bisogno di te per andare avanti, e non ha bisogno di te per restare
> dov'è.**

Gli attori delle transizioni sono tre — la tua voce, il tempo, il mondo (`01-modello §3`)
— e due su tre lavorano mentre tu guardi altrove. Un task `in corso` avanza, un `ORARIO`
matura, una consegna va a buon fine. Nessuno di questi tre ha bisogno che quella cosa sia
quella a fuoco.

---

## 2. Cosa è parallelo e cosa no

Metà dei malintesi su questo sistema stanno qui, quindi conviene fare due colonne.

| va in parallelo | è sempre uno solo |
|---|---|
| **i task** — quanti ne hai | **il fuoco**: una `MAIN` per volta (`01-modello §2`) |
| **i secondari** dentro un task (§3) | **la bocca**: una cosa alla volta (`08-voce §3`) |
| **i servizi**, che annunciano quando vogliono (`06-confini §1`) | **il turno**: una frase tua per volta, e lo schermo sta fermo mentre pensa (`03-architettura §4`) |
| **il tempo**, che scade per tutti insieme | **la penna della memoria**: una sola (`07-memoria §9`) |

La colonna di destra non è una limitazione tecnica da togliere quando si potrà: è quello
che rende leggibile la colonna di sinistra. **Dieci cose che vanno avanti si sopportano
solo se una alla volta ti parla.** Se due task potessero rivolgerti la parola insieme, il
parallelismo smetterebbe di essere una comodità e diventerebbe la cosa da cui difendersi —
ed è esattamente quello che fanno le notifiche di un sistema operativo normale.

---

## 3. I secondari — l'AI engine che si moltiplica

Quando una cosa sola non basta, l'AI engine delega: uno o più **agenti secondari**, che
lavorano in parallelo **dentro un task che esiste già**. Non sono un servizio e non stanno
sul confine (`06-confini §5`): sono un modo di lavorare, non un posto.

Girano dal 17 settembre 2026, e sono stati la prima cosa che il cervello unico ha reso
quasi gratis: un secondario non è un pezzo nuovo di sistema, è **lo stesso AI engine con
tre mosse invece di trentasette**.

Il principale li chiama con `delega`: un task che esiste già, e un lavoro per riga. Quello
che ognuno ha in mano è `MOSSE_SECONDARIE`, e sono tre:

```
guarda    lo schermo, come lo vede il principale
ricorda   la memoria, per i nomi che gli servono
riporta   il suo lavoro, una volta, e finisce lì
```

### I quattro no, che sono quattro nomi che mancano

La regola che li tiene a bada è una sola:

> **Un secondario non tocca lo stato, non consegna, non scrive nella memoria, non parla.**

E non è fatta rispettare da un controllo: è fatta rispettare da un elenco.

| il no | come è fatto rispettare | perché |
|---|---|---|
| non tocca lo stato | nessuna mossa che sposti un task o muova il fuoco | gli attori sono tre, e un secondario non è un quarto: è lavoro dentro un task che qualcuno ha già aperto |
| non consegna | `consegna` non c'è | il cancello `aspetta te` è tuo. Ciò che esce passa da te, non da un delegato del tuo delegato |
| non scrive nella memoria | `segna` non c'è | la penna è una sola: con due, «chi l'ha detto» smetterebbe di voler dire qualcosa (`07-memoria §9`) |
| non parla | `parla` non c'è | il principale è l'unico con una bocca. Se ce l'avessero anche loro, una richiesta produrrebbe tre voci |

**Un livello solo, e non serve ricordarselo.** `delega` non è fra le tre, quindi un
secondario non delega: la ricorsione non è vietata, è *impossibile*, perché la parola per
farla non esiste. Così «aspetta» ferma una fila e non un albero, e non esiste il momento in
cui non sai più quanti ne stanno girando.

### Come si vedono

**Non si vedono.** Un secondario non è un task e non compare mai a schermo: se ne avesse
una faccia sua, avresti due cose a schermo per un'intenzione sola, e salterebbe la legge
03.

**La faccia è la frazione.** Mentre lavorano, il task che li contiene è `in corso` e porta
`0/2`, `1/2`, `2/2` nel suo `dato` — e quello è tutto ciò che si vede di loro. Quando
l'ultimo riporta, i riporti diventano l'`esito` del task e il task torna al cancello,
`aspetta te`.

**Muoiono col task**, e si controlla al ritorno di ognuno e non alla partenza: se quello
dentro cui lavoravano non c'è più, quello che riportano si butta. Uno che non ce la fa non
ferma gli altri e non passa per buono — la frazione arriva in fondo, il suo riporto no.

Nel prototipo dietro c'è un secondario finto che sa **un mestiere solo**: legge quello che
il task ha dentro e lo dice corto. Non è quello che farà un modello; è la forma di ciò che
farà, e basta a vedere la frazione salire.

---

## 4. Come non si perde il filo

Tenere dieci cose è facile. Ritrovare la terza quando la nomini di sbieco è il problema
vero, e la risposta sta in tre meccanismi che stanno già altrove — vale la pena vederli
una volta insieme, perché è insieme che fanno il lavoro.

**Il richiamo per nome.** Non serve un verbo per cambiare argomento: basta che una frase
nomini un task che è a schermo (`01-modello §3`). «Per il riordino usa l'altra cartella»
sposta il fuoco e dà il comando nella stessa frase. È questo che rende il cambio di
argomento gratis, e quindi possibile davvero.

**La vista a ogni turno.** L'AI engine non si ricorda lo schermo: se lo fa raccontare da
capo a ogni turno, con gli id di adesso (`04-metalinguaggio §3`). È la ragione per cui può
tornare su una cosa di cui avete parlato dieci minuti fa senza muovere quella sbagliata —
e per cui, se nel frattempo è caduta in `MEMORIA`, lo sa.

**Il ritorno ha un posto.** Una risposta a una delega non rifà la fila: rientra nel task
che l'ha generata (`06-confini §3`). Dal filtro passa solo ciò che **nessun task stava
aspettando**. Senza questa regola, ogni cosa chiesta tornerebbe come una cosa arrivata, e
dieci task in parallelo produrrebbero dieci notifiche da smistare a mano.

### Due frasi che fanno quasi la stessa cosa

Con più cose insieme diventano importanti, perché sono il modo di tenere il ritmo:

| frase | cosa fa |
|---|---|
| «aspetta» | sospende l'azione in corso. È sempre udibile, anche a bolla chiusa |
| «torna a quella di prima» | rimette il fuoco dov'era, senza cercare per nome e senza cambiare niente |

Nessuna delle due cambia un avanzamento: guardare non è un atto, e fermarsi non è
disfare.

---

## 5. Quando sono troppe

Il sistema ha già tre modi di non affogare, e tutti e tre sono conseguenze del modello e
non aggiunte:

- **l'esaurimento.** Una bolla che non ha più niente da farsi dire si contrae in chip
  (`01-modello §4`). La scrivania si sfolla da sé, e si sfolla per un criterio vero — non
  avere più niente da dire — non per età;
- **il flusso.** Tre chip colorati diventano un punto di colore solo, e il nome lo dai tu
  (`01-modello §6`). È l'unico meccanismo del sistema in cui l'ordine è tuo;
- **il filtro.** Non promuove più niente a task (`01-modello §3`): decide cosa suona e cosa
  chiede. Quello che non passa si posa lo stesso nel cassetto, muto — quindi il filtro non
  può più far crescere il numero di cose che hai in mano, solo il rumore
  (`06-confini §3`).

Quello che **non** c'è, e che è la tentazione da evitare per prima: una vista che le mostra
tutte insieme in un elenco. Un elenco di quaranta cose non è il parallelismo che funziona,
è la confessione che non funziona.

---

## 6. Domande aperte

1. **Quante cose insieme reggono davvero.** Il modello non mette un tetto, e i tre
   meccanismi del §5 sono gli unici argini. Da vedere girando: a quante cose la
   TASKBAR smette di essere leggibile, e se la risposta è raggruppare di più o proporre di
   meno.
2. **Se due task possono aver bisogno della stessa cosa.** Oggi ogni task ha il suo
   `ingresso` e i suoi collegamenti, e due task che parlano della stessa mail non lo
   sanno. Probabilmente va bene così; è da provare su un caso vero prima di scriverlo.
3. **Quanti secondari per task**, e se ha senso un tetto. Oggi sono quanti ne chiede il
   principale, e l'unico segnale è la frazione che sale.
4. **Cosa fa «aspetta» con più cose in corso.** Ferma quello a fuoco, o ferma tutto? Oggi
   ferma l'azione in corso, che con un task solo non era ambiguo e con tre lo diventa.
