# I componenti dell'interfaccia

> **Stato del prototipo.** I componenti mostrano il comportamento previsto del sistema.
> Per ora Memory Engine e servizi sono simulati da documenti di contesto: non vengono
> interrogati archivi persistenti o servizi esterni reali.

## INPUT
Il componente INPUT gestisce l'input dell'utente ed è **l'unica via di scambio fra sistema
e utente**: tutto quello che l'utente dice passa di qui, e non esiste un secondo posto dove
parlare. Per questo deve restare **pulito e libero**, capace di accogliere un input dopo
l'altro senza intoppi: niente di ciò che si sta componendo può occuparlo, e nessuna attesa
può bloccarlo. Nel prototipo si scrive soltanto da tastiera: la ricezione vocale e il
tracking degli occhi appartengono a una fase futura.

INPUT è fatto di **due bolle**. In basso **la bolla di INPUT**, dove l'utente scrive, che non si
occupa mai: qualunque cosa si stia componendo, resta libera per la frase successiva. Sopra
la **dropzone**, che compare solo quando c'è qualcosa in formazione e mostra una bozza alla
volta — il task in `T_DRAFT` con gli elementi che ha agganciato.

Il componente INPUT ha anche la capacità di creare il contesto consultando la Memory Engine dell'utente attivo, osservando la DESK o interrogando i servizi, e infine creare un task o modificarne uno esistente aggiornando richiesta e contesto. Il task nasce in bozza dentro la dropzone e non parte finché l'utente non lo conferma. Nel prototipo, INPUT legge `memory/general.txt`, `preferences.txt`, `system.txt` e i documenti nella cartella `services` dell'utente attivo. INPUT mostra l'ultimo scambio fra utente e assistente e poi sparisce: non è una finestra di conversazione. Ogni scambio viene comunque salvato integralmente nell'archivio `chat-raw` dell'utente attivo, separato dalla memoria simulata, ed è lì che la cronologia resta.
## DESK — cosa sta andando avanti

Contiene i task e  mostra i loro stati e permette all'utente di tenere sotto controlla la situazione dei task. Si tratta di una sorta di scrivania
## TIMELINE — dove sei dentro la giornata

Questo componente ha lo scopo di orientare l'utente temporalmente durante la giornata di lavoro o in generale durante l'utilizzo del sistema. **A cosa serve.** A **situarti nel tempo** — e situarsi non vuol dire sapere semplicemente "che ore sono", vuol dire sapere **quanto tempo hai** e **quanto tempo è passato o sta passando**.

## PROFILEBAR — quando, dove e chi sei

 Serve a restituire all'utente un contesto di utilizzo e varie informazioni che riguardato l'utente stesso che sta utilizzando il sistema. Mostra la foto profilo, la data e l'ora e anche la posizione GPS. Inoltre a ogni posizione GPS può essere associato un luogo conosciuto come "casa" o "Ufficio". **GPS** e **Data e ora** contribuiscono a definire un **WorkMode** che rappresenta il tipo di utilizzo che l'utente può voler svolgere.
 
## SYSTEMBAR — cosa sta facendo la macchina

**Risponde a:** chi ti sta sentendo, quanto suona, com'è la rete, quanta batteria resta.
**Contiene:** microfono, volume, rete, batteria — in **ordine fisso**, il microfono sempre
per primo. Rappresenta la finestra tecnica che si affaccia sul computer.

Serve a dichiarare lo stato della macchina come connessione a internet volume e microfono

Il microfono si spegne e si riaccende **premendolo, non a voce**, ed è l'unico atto del
sistema che esiste soltanto come gesto. Due ragioni, e nessuna è di stile: col microfono
spento non c'è niente che ti senta, quindi una frase per riaccenderlo sarebbe una frase che
il sistema non può ricevere; e un assistente che apre il microfono da sé è un altro prodotto.

## SIDEBAR — cosa hai in mano

Si tratta di un componente complementare alla **DESK** perché contiene e mostra tutti i task **messi da parte** o **in pausa** che non sono ancora terminati o vogliono essere tolti dalla DESK temporaneamente per chiarezza mentale e visiva. Un task nella **SIDEBAR** può essere richiamato in qualsiasi momento. Contiene inoltre i
**flussi** e i **rimandati**, che sono task con un'ora: quando l'ora scade tornano a
chiedere attenzione in DESK, e non diventano notifiche.

La SIDEBAR contiene anche le **bozze sganciate** dalla dropzone, che restano in bozza:
`T_DRAFT` è uno stato, non un posto. Una bozza ci finisce quando l'utente la mette da
parte, oppure da sola quando l'utente accetta una notifica mentre ne sta componendo
un'altra — la dropzone mostra una bozza alla volta.

## NOTIFICATIONBAR — cosa è arrivato dal mondo

Rappresenta lo stato esterno del mondo. Generalmente un informazione esterna proviene dai servizi e viene mostrata all'utente sotto forma di notifica. A questo punto l'utente può creare un task a partire da una notifica, che contribuirà a comporre il contesto. Quel task nasce sempre in `T_DRAFT`, nella dropzone: ciò che arriva da fuori passa per un passaggio di ragionamento che l'utente può vedere, correggere o scartare, e non si mette mai in moto da solo.

Ciò che il filtro non promuove **entra muto**: non suona, non conta nel badge, ma c'è. È la
differenza fra un sistema che ti interrompe e uno che tiene le cose da parte.

Aprire il cassetto azzera il badge: averle viste è averle viste. L'apertura è **un momento,
non una schermata** — dopo l'azione si richiude da sé, e non esiste uno stato «sto guardando
le notifiche».
