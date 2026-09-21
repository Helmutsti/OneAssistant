# OneAssist

Un collaboratore a cui parli, che ti tiene sotto gli occhi quello che hai in mano. Sta fra
te e il sistema operativo e copre lo schermo per intero: la voce è l'input principale, e le
finestre non esistono perché le ha sostituite qualcosa che capisce.

**Perché esiste e cosa vuol dire che è riuscita sta in `docs/00-visione.md`**, e non si
riassume qui: due copie divergono sempre. Prima di una decisione di fondamenta, si legge
quella pagina.

Si costruisce un pezzo alla volta, con sorgenti finte dove quelle vere non sono
raggiungibili. Una sorgente finta deve produrre gli stessi eventi di quella vera:
è il confine che cambia, mai il modello.

## La separazione — due cartelle, un repo solo

Dal 17 settembre 2026 **anche il design sta qui**: i documenti sono in `design/`, e si
aprono da `design/index.html` (con `npm run dev`, su
`localhost:5173/design/index.html`). Prima vivevano nel progetto Claude Design
`OneAssist` — restano lì com'erano, ma la copia buona è questa: si modifica come il
resto del repo, si versiona, e si guarda accanto al prototipo che la esegue.

**Dal 18 settembre i livelli sono quattro**, e ognuno dice una cosa sola: **L0** le
fondamenta (Sistema, Moodboard, Icone), **L1** i componenti — la primitiva e le sei aree —,
**L2** i flussi interi, **L3** le schermate. L0 governa tutto, L1 governa L2 e L3, e la
cascata scende soltanto.

| | dove sta | risponde a |
|---|---|---|
| **Design** | `design/`, L0 / L1 / L2 / L3 | com'è fatto, dove sta, che colore ha, come si muove, che parole usa |
| **Logica** | `docs/` | quando una cosa diventa un'altra, chi lo decide, cosa entra nel sistema |
| **Prototipo** | `src/` | l'unica cosa che esegue tutti e due, e che li smentisce quando non tornano |

**I documenti di `docs/` si leggono in ordine di numero**, e `docs/README.md` dice cosa
risponde a cosa. Dal 18 settembre 2026 quella cartella è stata rifatta: la versione
precedente sta in `docs_old/` per intero, **non si aggiorna e non si cita** — se una cosa
serve, si porta di qua.

La separazione **non cambia perché adesso sono vicini**: un documento di `design/` non
contiene logica, e `docs/` non contiene misure. Se una regola di comportamento serve a
spiegare un disegno, si cita e si rimanda — due copie divergono sempre, ed è già successo.

Il test, quando non è ovvio: se la frase contiene **quando**, **se**, **dopo N minuti**,
**allora** — è logica e sta in `docs/`. Se contiene **è largo**, **è salvia**, **sta a
44 px**, **dura 340 ms** — è design e sta in `design/`.

Casi di confine già decisi:

- «il contorno pulsa una volta ogni 4 s» → design (è come appare uno stato)
- «dopo 90 secondi cade nella memoria» → logica (è quando uno stato diventa un altro)
- «salvia significa in corso» → design (è il vocabolario)
- «un task diventa in corso quando il sistema comincia a lavorarci» → logica

## Le leggi del design non si negoziano da qui

Le undici leggi in `L0 - Sistema` governano anche l'implementazione. Le tre che
mordono di più sul codice:

- **Nessun bottone.** Ogni comando è una frase fra «». Al massimo quattro per volta,
  mai due che fanno la stessa cosa, la prima è la più probabile.
- **Un task in un posto solo.** Mai lo stesso task in due aree: quando cambia stato,
  migra.
- **Colore è stato, mai categoria.** Salvia in corso o fatto, ambra aspetta te,
  rosso terra bloccato.

Se una necessità di implementazione contraddice una legge, segnalarlo e discuterlo:
non aggirarlo in silenzio.

## Lingua

Tutto in italiano, codice compreso — nomi di stato, eventi, commenti.

Restano in inglese due famiglie di nomi, e sono due eccezioni dichiarate:

- **le aree**: PROFILEBAR, SYSTEMBAR, TABLE, INPUT, TASKBAR, NOTIFICATIONBAR, TIMELINE;
- **l'AI engine**, dal 17 settembre 2026. Si chiamava «il grande» — in coppia con «il
  locale», che quel giorno è stato abolito — e restare «il grande» da solo non voleva
  più dire niente. In codice è `AiEngine`, in `src/ai-engine/`, e la sua porta è
  `/ai-engine`; in prosa si scrive *l'AI engine*, minuscolo, come un termine di
  prodotto e non come un'area.

Una cosa che il rinomino ha insegnato e che vale per il prossimo: **in questo repo
«grande» è anche un aggettivo** — «l'ora grande», «la cosa più grande dello schermo»,
«a grandezza vera». Una sostituzione sulla parola nuda distrugge mezzo documento di
design. Si sostituiscono frasi, e alla fine si rilegge quello che resta.
