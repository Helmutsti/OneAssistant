# I componenti dell'interfaccia

> **Stato del prototipo.** I componenti mostrano il comportamento previsto del sistema.
> Per ora Memory Engine e servizi sono simulati da documenti di contesto: non vengono
> interrogati archivi persistenti o servizi esterni reali.

## INPUT
Il componente INPUT gestisce l'input dell'utente. Nel prototipo comprende soltanto il form
di input testuale e l'utente interagisce tramite tastiera. La ricezione vocale e il
tracking degli occhi appartengono a una fase futura.

Il componente INPUT ha anche la capacità di creare il contesto consultando la Memory Engine dell'utente attivo, osservando la DESK o interrogando i servizi, e infine creare un task o modificarne uno esistente aggiornando richiesta e contesto. Nel prototipo, INPUT legge `memory/general.txt`, `preferences.txt`, `system.txt` e i documenti nella cartella `services` dell'utente attivo. INPUT mostra la chat scritta della comunicazione tra utente e assistente e ogni scambio viene salvato integralmente nell'archivio `chat-raw` dell'utente attivo, separato dalla memoria simulata.
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

## SIDEBAR — cosa hai in mano

Si tratta di un componente complementare alla **DESK** perché contiene e mostra tutti i task **messi da parte** o **in pausa** che non sono ancora terminati o vogliono essere tolti dalla DESK temporaneamente per chiarezza mentale e visiva. Un task nella **SIDEBAR** può essere richiamato in qualsiasi momento.

## NOTIFICATIONBAR — cosa è arrivato dal mondo

Rappresenta lo stato esterno del mondo. Generalmente un informazione esterna proviene dai servizi e viene mostrata all'utente sotto forma di notifica. A questo punto l'utente può creare un task a partire da una notifica. che contribuirà a comporre il contesto.
