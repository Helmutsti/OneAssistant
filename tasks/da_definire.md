# Da definire

Cose emerse durante il lavoro che non sono ancora decisioni, e che vanno chiarite prima
di andare in sviluppo.

---

## INPUT / la dropzone

**Le bolle in bozza sono bolle a tutti gli effetti.** Possono essere **sganciate dalla
dropzone e messe in SIDEBAR**, come qualunque altra bolla. Da integrare nella
documentazione quando si scrive il modello dei task e la competenza di SIDEBAR.

Ne discendono almeno tre domande aperte:

- **risolto il 22 settembre:** una bozza sganciata in SIDEBAR **resta in bozza**.
  `T_DRAFT` è uno stato, non un posto (storico §30);
- `docs/design/L0`, §SIDEBAR e legge 03, elenca cosa sta nel cassetto: i chip, i
  rimandati. Una bozza sganciata sarebbe una quarta cosa, da nominare;
- **risolto il 22 settembre:** la dropzone accoglie *un task alla volta*. Quindi
  sganciare una bozza è anche il modo di liberarla per la successiva.

## INPUT / il trascinamento

Il nome «dropzone» dice che è il posto dove le cose atterrano. Se il trascinamento di file
da fuori entra nello scope, quella bolla è l'unico bersaglio dello schermo. Non deciso.

## Il modello dei task

**Risolto il 22 settembre:** `T_DRAFT` prende il posto di `T_NUOVO`, gli stati restano
quattro (storico §25).

**Risolto il 22 settembre:** la notifica accettata passa per una bozza (storico §29), e
se la dropzone è occupata la bozza in corso si sposta da sola in SIDEBAR (§31).

Resta da riscrivere di conseguenza: `L0` legge 04 e `L2 - Bubble` nominano `T_NUOVO` per
la bolla grigia che «esiste e non chiede ancora niente». Senza quello stato, il grigio
resta a rappresentare il rimandato e la bozza.

## Le due tassonomie

Emerse il 22 settembre dalla legge 06 (storico §34). Sono elenchi chiusi da scrivere, e
oggi non esistono in nessun documento:

- **i tipi di task** — la semantica: cosa distingue un task «posta» da uno «documento».
  Sono sette e hanno le loro icone, ma il criterio non è scritto;
- **i tipi di dato** — le tessere che stanno nella dropzone: documento, cartella,
  indirizzo, contatto, appuntamento, posta, immagine, conversazione, sveglia, e il task
  già a schermo. Disegnate in `L2 - INPUT`, mai definite.

Le due liste si somigliano ma non sono la stessa cosa, ed è il motivo per cui la legge 06
contava male.

## Il nome: «main» o «active»

`docs/design/L0 - Sistema.md` usa **main** in tre punti, `L2 - Bubble` in uno. Il
proprietario del progetto la chiama **active** e dice di non aver mai usato «main». Da
decidere quale nome resta, e da allineare ovunque.

## Le misure di Chip, Task e Pannello

Stavano nella sezione «Tre taglie» di `L2 - Bubble`, rimossa il 22 settembre (storico §65).
Larghezze, altezze, raggi e la tabella delle deroghe per componente **non sono più scritte
da nessuna parte**.

`L4 - Schermate` porta ancora una nota di revisione che dice «l'altezza del chip: `L2 -
Bubble` diceva 34 e `L0 - Sistema` 30, adesso dicono tutti 30». La prima metà della frase
si riferisce a una sezione che non esiste più.

Da decidere: le misure si riscrivono, e dove, oppure cadono e si toglie anche il rimando.

---

## DESK e SIDEBAR: due mestieri in un posto solo

Emerso il 22 settembre 2026, dopo l'allineamento. **Non è deciso.**

Oggi la SIDEBAR fa due cose che non hanno la stessa natura:

- **il background** — cose che vanno avanti da sole e non ti riguardano finché non finiscono;
- **il parcheggio** — cose che aspettano **te**, ma che hai tolto dal centro per vedere meglio.

Il primo è una proprietà del task, il secondo è una comodità dell'utente. Si accavallano
perché stanno nello stesso posto per ragioni diverse.

**Il criterio proposto**, che ne usa uno solo — *chi deve muoversi perché la cosa avanzi*:

| | |
|---|---|
| **DESK** | tutto ciò che aspetta te: bozze in pausa, task fermi, task pronti da confermare |
| **SIDEBAR** | ciò che non chiede niente adesso: va avanti da solo, oppure torna da solo a un'ora |

**Il parcheggio non si perde, cambia nome.** `docs/L00` elenca fra le quattro prove che il
prodotto è riuscito: «Ti fidi di lasciar andare una cosa: dici *dopo* e smetti di pensarci,
**perché sai che torna e sai fra quanto**». Il parcheggio senza scadenza è proprio ciò che
quella riga esclude — e il **rimandato** esiste già: è un chip con un'ora, sta in SIDEBAR,
torna da sé. Liberare il desk resterebbe possibile, ma dicendo *quando* la cosa torna. Se
non sai dire quando, ti riguarda adesso, e il suo posto è il centro.

**Cosa cambierebbe, se si adotta:**

- le **bozze sganciate** oggi vanno in SIDEBAR (storico §30): andrebbero sulla DESK, perché
  una bozza aspetta te per definizione;
- la **notifica accettata mentre ne stai componendo un'altra** (storico §31) cambierebbe
  destinazione;
- `docs/L02` §SIDEBAR e `docs/design/L0` legge 03 andrebbero riscritti.

---

## La bolla documento / informazione

Definita il 22 settembre 2026. **Parzialmente decisa**, e non ancora disegnata.

### Cosa è stato definito

- **Ha l'aspetto di una bolla**, e solo quello: ne prende il vetro, il bordo, le ombre.
- **Ha le frasi in INPUT**, come qualunque altra bolla: può essere la bolla *active*, e
  quando lo è le frasi che puoi dire riguardano lei.
- **Non ha stati.** Non nasce, non lavora, non aspetta, non conclude.
- **Mostra il contenuto di un file**: un testo, un'immagine, un filmato. **Niente musica,
  per ora.**
- **Può essere messa in SIDEBAR.**
- **Può essere chiusa dentro un task**: la bolla documento sparisce, e il documento diventa
  un elemento di quel task, come qualunque altra cosa agganciata.

### Cosa ne discende

- **Non ha colore, mai.** La legge 04 dice che il colore è stato; un documento non ne ha,
  quindi resta fuori dalla tavolozza. Attenzione: «nessun colore» oggi vuol dire *il
  rimandato*, e diventerebbe due cose — va scritto in modo che non si confondano.
- **Se può essere active, prende il pallino verde** accanto al titolo, come le altre.
- **È il primo oggetto che si congeda a mano**: non finisce da sé, quindi esce solo perché
  lo chiudi tu o perché lo assorbi in un task.

### Cosa resta da decidere

- **Che taglia ha.** Un testo e un filmato non occupano lo stesso spazio, e la sezione
  «Tre taglie» di `L2 - Bubble` è stata rimossa il 22 settembre: oggi le misure di Chip,
  Task e Pannello non stanno scritte da nessuna parte.
- **Che cosa mostra il suo chip in SIDEBAR.** Nome e tipo, ma il terzo posto — quello del
  dato — in un documento che cosa dice?
- **Come si chiude.** A voce («chiudila»), e basta?
- **Da dove arriva.** Nasce da una risposta («fammi vedere il preventivo»), o è una cosa
  che ci trascini dentro? Si lega alla questione del trascinamento nella dropzone.

### Una tensione da sciogliere

Sta in SIDEBAR — ma il criterio proposto nella questione qui sopra dice che in SIDEBAR
sta **ciò che non chiede niente adesso: va avanti da solo, oppure torna da solo a un'ora**.
Un documento non fa né l'una né l'altra cosa: sta, e basta. O il criterio ammette una terza
voce, o la SIDEBAR torna ad avere due mestieri — che è il problema da cui si era partiti.
