# docs — la logica

Quando una cosa diventa un'altra, chi lo decide, cosa entra nel sistema.

Il disegno sta in `design/` e non qui: se una frase contiene **è largo**, **è salvia**, **sta
a 44 px**, **dura 340 ms**, è di là. Se contiene **quando**, **se**, **dopo N minuti**,
**allora**, è qui (`CLAUDE.md`).

---

## In che ordine si leggono

I numeri sono l'ordine di lettura, non una classifica. I primi tre bastano per capire di
cosa si tratta; gli altri servono quando ci si mette le mani.

| | | risponde a |
|---|---|---|
| **00** | [La visione](00-visione.md) | perché esiste, e cosa vuol dire che è riuscita |
| **01** | [Il modello](01-modello.md) | cos'è un task, dove sta, chi lo fa cambiare |
| **02** | [Più cose insieme](02-parallelo.md) | come si tengono dieci cose senza perderne nessuna |
| **03** | [L'architettura](03-architettura.md) | di che pezzi è fatta, e chi può toccare cosa |
| **04** | [Il metalinguaggio](04-metalinguaggio.md) | come si istruisce l'IA, e perché resta prevedibile |
| **05** | [L'interfaccia](05-interfaccia.md) | come si entra, come si esce, come l'IA muove lo schermo |
| **06** | [I confini](06-confini.md) | dove finisce il sistema e comincia il mondo |
| **07** | [La memoria](07-memoria.md) | cosa sa di te, e in che forma |
| **08** | [La voce](08-voce.md) | con che cosa sente e con che cosa parla |
| **09** | [Le catene](09-catene.md) | le catene che devono girare, e il banco che le prova |
| **10** | [I nomi](10-nomi.md) | il censimento, per non chiamare due cose allo stesso modo |
| **11** | [Quello che resta aperto](11-aperte.md) | tutto ciò che non è deciso, diviso per chi può deciderlo |

---

## Le tre cose da sapere prima

Se si legge una pagina sola, che sia questa.

1. **Una cosa sta in un posto solo.** Quando cambia stato, migra. Vale per i task, e vale
   per queste pagine: una regola scritta in due documenti prima o poi dice due cose diverse.
   Si cita e si rimanda, non si ricopia.
2. **Ogni documento tiene le sue domande aperte in fondo**, e `11-aperte` è solo l'indice.
   Quando una si chiude, si chiude nel suo documento e si toglie dall'indice.
3. **Le date contano.** Le decisioni portano il giorno in cui sono state prese, e quelle
   cadute restano barrate invece di sparire: serve a sapere cosa si è già provato e perché
   non andava.

---

## Cos'è cambiato il 18 settembre 2026

Questa cartella è stata rifatta. La versione precedente sta in `docs_old/` per intero, e non
va aggiornata: se una cosa serve, si porta di qua.

Cosa è successo, in breve:

- **è nata `00-visione`.** Prima non c'era: si partiva dal task, e perché la cosa esistesse
  non era scritto da nessuna parte;
- **`04-motore` si è diviso in tre.** Teneva insieme la catena, il contratto con il modello
  e l'interfaccia, che sono tre cose con tre vite diverse: adesso sono `03-architettura`,
  `04-metalinguaggio`, `05-interfaccia`;
- **è nato `02-parallelo`.** Tenere più cose insieme è la promessa centrale del prodotto, ed
  era descritta solo di sbieco, dentro il capitolo sugli agenti secondari;
- **`03-conoscenza` e `05-archivio` sono diventati `07-memoria`.** Dicevano la stessa cosa da
  due lati e ripetevano le stesse regole;
- **l'archivio è sospeso** (`07-memoria §6`), e la sospensione è dichiarata, temporanea, e ha
  scritto cosa la fa finire.
