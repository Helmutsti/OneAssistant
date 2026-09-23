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

**Niente si trascina.** Né i file da fuori né le bolle sullo schermo: ogni cosa entra, si
sposta o si aggancia perché l'utente lo dice.

## DESK — la scrivania

Contiene le bolle, ne mostra gli stati e permette all'utente di tenere sotto controllo la
situazione. DESK e SIDEBAR **non hanno uno scopo assegnato**: dove mettere cosa lo decide
l'utente, e il sistema non sposta mai una bolla da un'area all'altra di sua iniziativa. Si
sposta solo per un'azione dell'utente — accettare una notifica, iniziare un task nuovo,
aprire una bolla in focus.

**Il focus.** L'utente può aprire una bolla in focus: si allarga, diventa la cosa
principale dello schermo, e tutte le altre bolle di DESK passano in SIDEBAR. Quando esce
dal focus, le bolle tornano da sole dov'erano.

## La bolla documento

Una bolla che **non è un task**: mostra un contenuto, e basta — un testo, un'immagine, un
filmato; niente musica, per ora. Non ha stati e non ha colore, ma ha le sue frasi in INPUT
e può essere la bolla active. Ha la stessa taglia e lo stesso chip di un task.

Si apre **al centro dello schermo**, non dalla dropzone. Può essere messa in SIDEBAR. Esce
in due modi soltanto: **la chiude l'utente**, oppure viene **assorbita in un task**, e
allora il documento diventa uno degli elementi agganciati a quel task.

I tipi di dato restano quelli di oggi. Qualunque dato può essere mostrato in una bolla
documento, solo per vederlo.

## TIMELINE — dove sei dentro la giornata

Questo componente ha lo scopo di orientare l'utente temporalmente durante la giornata di lavoro o in generale durante l'utilizzo del sistema. **A cosa serve.** A **situarti nel tempo** — e situarsi non vuol dire sapere semplicemente "che ore sono", vuol dire sapere **quanto tempo hai** e **quanto tempo è passato o sta passando**.

**L'orizzonte** è l'orario di lavoro dell'utente, un'informazione che inserisce lui.
Nel prototipo è un valore di prova, 9–13 e 14–18, scritto nel suo documento di contesto
(`memory/general.txt`).

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

Contiene i chip: le bolle che l'utente ha tolto dalla DESK. Un chip nella **SIDEBAR** può
essere richiamato in qualsiasi momento. Contiene anche i **flussi** e i **rimandati**, che
sono task con un'ora: quando l'ora scade il rimandato **diventa ambra dove si trova** —
non torna in DESK e non diventa una notifica.

I chip in **ambra** stanno in cima; gli altri seguono nell'ordine in cui sono arrivati.

Quando la bolla active è ambra — non può andare avanti senza l'utente — fra le frasi di
INPUT il sistema propone di **metterla da parte**. È un suggerimento e basta: la bolla si
sposta solo se l'utente lo dice.

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
