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
