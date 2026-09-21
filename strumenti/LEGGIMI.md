# Le consolle di taratura

Due pagine per decidere le misure guardandole, invece che immaginandole dentro un
documento. Non fanno parte del prodotto e non fanno parte del design: sono banchi di
prova, come la pedana col pallino nel prototipo.

| | cosa tara | dov'è pubblicata |
|---|---|---|
| `taratura-testo.html` | diciannove misure di **testo e icone** | [artifact](https://claude.ai/artifact/7fzY4nXdAF2J92mdegQ9vm) |
| `taratura-materia.html` | trentacinque misure di **aria**, quattordici **colori**, il **vetro**, e le **icone** dei sette tipi | [artifact](https://claude.ai/artifact/UghZkj2JQbn5ZrLyPf7bq8) |
| `banco-ascolto.html` | **la voce**: le frasi vere del sistema lette dalle voci installate sulla macchina | [artifact](https://claude.ai/artifact/AckUsWJ7ENLB5cLHWzsBT3) |

Si aprono anche a mano, con un doppio clic: sono due file HTML senza dipendenze, tranne
i font che arrivano da Google Fonts.

## Come sono fatte

Sopra c'è il palco vero — 1440 × 900, gli stessi ancoraggi del prototipo — e sotto una
consolle di controlli. Ogni misura si muove di un passo alla volta e si vede cambiare
**dove vive davvero**, non su un campione ingrandito: è l'unico modo per accorgersi che
un titolo da 26 px era troppo grande, o che una bolla larga 452 resta vuota quando il
testo scende.

In fondo c'è un riquadro che scrive i valori scelti accanto a quelli di partenza,
pronto da dettare o da copiare.

Le icone sono i path ufficiali di **Lucide** (MIT), scaricati uno per uno e messi
inline: gli artifact non possono caricare font da CDN, e disegnarle a occhio avrebbe
significato scegliere su forme sbagliate.

## Quando si usano

Quando una misura non si decide leggendo. Le prime due tarature hanno prodotto:

- **le misure di testo**, il 16 settembre 2026 — vedi la tabella in `docs/00-aperte.md`;
- **la famiglia delle icone**, Lucide al posto di Material Symbols — vedi `L1 - Icone`
  su Claude Design.

Il banco d'ascolto ha una differenza dagli altri due: **quello che mostra dipende dalla
macchina su cui lo apri**, non dal progetto. Le voci italiane disponibili cambiano fra
Chrome ed Edge, e cambiano se installi le voci naturali di Windows — quindi va aperto
dove il prodotto girerà, e vale la pena riaprirlo dopo ogni installazione.

Se una taratura cambia qualcosa, il posto dove si scrive non è qui: è `docs/` per la
logica e Claude Design per il disegno. Queste pagine non sono una fonte di verità —
sono il banco su cui si guarda.
