# Da definire

Cose emerse durante il lavoro che non sono ancora decisioni, e che vanno chiarite prima
di andare in sviluppo.

Il 23 settembre 2026 sono state chiuse tutte le voci precedenti — dropzone, trascinamento,
modello dei task, le due tassonomie, main o active, le misure, DESK e SIDEBAR, la bolla
documento, il raggio del banner, le icone (storico §90–§106).

## Aperta da prima

- [ ] **Selezione della memoria.** Definire il confine con cui l'AI decide quali
  informazioni di una conversazione o di un task siano abbastanza utili da entrare nella
  Memory Engine. Fino a quella decisione, il meccanismo deve restare esplicitamente
  sperimentale e non deve salvare automaticamente i task.

## Emerse dalla ricostruzione del codice · 23 settembre 2026

`docs/` non le determina. Per non bloccare il lavoro il codice ha preso una strada
provvisoria, segnata con `DA DEFINIRE` nel punto esatto: va confermata o cambiata.
D1–D10 e D12 sono chiuse (storico §133–§143). D11 è ferma: se ne riparla con la TIMELINE.

| | La domanda | Cosa fa oggi il codice | Dove |
|---|---|---|---|
| D11 | Chi «sta su» un task, per la TIMELINE: «adesso · da 25 min». **Ferma**: non ce ne si preoccupa finché la TIMELINE non ha un significato (T1) | la bolla active, da quando è diventata active | `Guida.tsx` · `Timeline` |

## La TIMELINE

- [ ] **T1 · La TIMELINE è un componente ancora completamente da scrivere.** Esiste solo la
  struttura estetica (`docs/design/L2 - TIMELINE`); al suo design non è stato attribuito
  ancora nessun significato — cosa dice «adesso», cosa dice «dopo», cosa copre il filo e
  con quali colori. Detto dal proprietario del progetto il 23 settembre 2026. Il codice
  oggi le dà un significato provvisorio (D11), che non vale come decisione.

## Contraddizioni fra documenti di design, trovate ricostruendo

Il codice segue il documento di numero più basso, o `docs/` dove si parla di logica. I
documenti sbagliati vanno corretti per cascata. C8–C14 sono chiuse (storico §140–§147): al
momento non ce n'è di aperte.
