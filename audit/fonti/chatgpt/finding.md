# Registro dei finding

Audit del commit `07d64e17c854e6584a207314d851e348aeec4052`, 22 settembre 2026, Europe/Rome. 96 finding. Nessuna modifica al codice.

Severità: **Alta** = rischio di azione/dati errati o divergenza centrale; **Media** = comportamento incompleto o ambiguo; **Bassa** = difetto circoscritto/manutenzione/dettaglio visivo. La severità considera che i servizi di invio sono oggi simulati. Non è una graduatoria CVSS.

**Fatto verificato** include proprietà dimostrate dal sorgente, non necessariamente osservate in browser. **Forte evidenza** identifica una catena statica con trigger/effetto non interamente riprodotti. Le ipotesi esterne non verificate sono elencate nel rapporto, non promosse a bug certi.

Indice sintetico e limiti: [AUDIT.md](<AUDIT.md>). Matrici: [matrice-documentazione-codice.md](<matrice-documentazione-codice.md>), [matrice-codice-documentazione.md](<matrice-codice-documentazione.md>).

<a id="a001"></a>
## A001 — Delay applicato dopo la consegna, annullamento soltanto locale

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:778](<../../../src/modello/motore.ts#L778>), [src/modello/motore.ts:921](<../../../src/modello/motore.ts#L921>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:58](<../../../docs/L01-struttura_e_task.md#L58>), [docs/L04-aspetti_tecnici.md:41](<../../../docs/L04-aspetti_tecnici.md#L41>).

**Previsto:** Attendere 90 secondi prima di chiamare il servizio; no, aspetta impedisce la chiamata.

**Effettivo:** consegna chiama subito servizio.consegna; il timer parte nella then. annulla cambia stato e dichiara che nulla è uscito, senza ritirare la consegna.

**Divergenza:** Delay applicato dopo la consegna, annullamento soltanto locale.

**Impatto:** Garanzia principale di sicurezza falsa, anche se oggi i servizi sono simulati.

**Evidenza:** reproduce.json: elapsed=0, calls=1; dopo 91 s «Annullata… non è uscita» con calls=2. Nessun invio esterno eseguito dall’audit.

**Correzione necessaria:** Accodare prima del confine; cancellare la chiamata pendente e descrivere fedelmente gli esiti.

<a id="a002"></a>
## A002 — Bypass esplicito per singolo invio assente

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/tipi.ts:229](<../../../src/modello/tipi.ts#L229>), [src/ai-engine/api.ts:180](<../../../src/ai-engine/api.ts#L180>), [src/modello/motore.ts:778](<../../../src/modello/motore.ts#L778>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:66](<../../../docs/L01-struttura_e_task.md#L66>), [docs/L04-aspetti_tecnici.md:41](<../../../docs/L04-aspetti_tecnici.md#L41>).

**Previsto:** Richiesta esplicita: invio immediato definitivo soltanto per quel task.

**Effettivo:** Né Comando, Uscita, strumenti né consegna rappresentano bypass, irrevocabilità o autorizzazione per invio.

**Divergenza:** Bypass esplicito per singolo invio assente.

**Impatto:** Impossibile distinguere le due modalità prescritte.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Introdurre contratto e transizione del bypass con ambito limitato al singolo invio.

<a id="a003"></a>
## A003 — Modello di stati e luoghi rimasto al contratto precedente

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/tipi.ts:18](<../../../src/modello/tipi.ts#L18>), [src/modello/motore.ts:337](<../../../src/modello/motore.ts#L337>), [src/modello/motore.ts:1106](<../../../src/modello/motore.ts#L1106>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:38](<../../../docs/L01-struttura_e_task.md#L38>), [docs/design/L0 - Sistema.md:131](<../../../docs/design/L0 - Sistema.md#L131>).

**Previsto:** Quattro stati T_NUOVO, T_LAVORAZIONE, T_ATTESA, T_CONCLUSIONE; task su desk o sidebar.

**Effettivo:** Sei avanzamenti e luoghi CARTA, ORARIO, MEMORIA, MAIN, APERTO, CHIP; task creati direttamente in attesa/programmato; comprensione non rappresentata nel ciclo prescritto.

**Divergenza:** Modello di stati e luoghi rimasto al contratto precedente.

**Impatto:** Transizioni, viste, API e test parlano un modello differente.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Riallineare modello e consumatori; non rinominare semplicemente gli enum.

<a id="a004"></a>
## A004 — Richiesta e contesto non formano sistematicamente un task

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/ai-engine.ts:83](<../../../src/ai-engine/ai-engine.ts#L83>), [src/ai-engine/strumenti.ts:1](<../../../src/ai-engine/strumenti.ts#L1>), [src/modello/motore.ts:1106](<../../../src/modello/motore.ts#L1106>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:23](<../../../docs/L01-struttura_e_task.md#L23>), [docs/L01-struttura_e_task.md:50](<../../../docs/L01-struttura_e_task.md#L50>).

**Previsto:** Separare richiesta/contesto, creare task e sotto-task autonomi nel flusso previsto.

**Effettivo:** Il ciclo esegue tool su stato globale; crea task per composizioni, riassunti e fixture, non espone una creazione generale T_NUOVO; delega lavora dentro il task padre.

**Divergenza:** Richiesta e contesto non formano sistematicamente un task.

**Impatto:** Richieste operative fuori dai casi speciali mancano di un ciclo generale tracciabile. Le semplici domande possono legittimamente restare scambi (INPUT:556), quindi non sono contate come task mancanti.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire ed implementare il percorso generale e il rapporto fra task/sotto-task, senza dedurlo dalle specializzazioni esistenti.

<a id="a005"></a>
## A005 — Task terminati conservati e richiamabili come archivio operativo

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:810](<../../../src/modello/motore.ts#L810>), [src/modello/motore.ts:911](<../../../src/modello/motore.ts#L911>), [src/modello/motore.ts:945](<../../../src/modello/motore.ts#L945>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:141](<../../../docs/design/L0 - Sistema.md#L141>), [docs/L01-struttura_e_task.md:11](<../../../docs/L01-struttura_e_task.md#L11>).

**Previsto:** La memoria non è un terzo luogo dei task; conoscenza selettiva distinta dai task conclusi.

**Effettivo:** MEMORIA conserva gli oggetti nell’array; richiama cerca anche quelli conclusi/consegnati.

**Divergenza:** Task terminati conservati e richiamabili come archivio operativo.

**Impatto:** Task archiviati rientrano in esecuzione e interferiscono con ricerca, selezione e timeline.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Separare ciclo di vita e storia/contesto; impedire selezioni operative di task terminati.

<a id="a006"></a>
## A006 — Notifiche trasformate automaticamente in task; modello corretto dietro flag spento

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:109](<../../../src/modello/motore.ts#L109>), [src/modello/motore.ts:337](<../../../src/modello/motore.ts#L337>), [src/main.ts:439](<../../../src/main.ts#L439>), [src/aree/schermo.ts:567](<../../../src/aree/schermo.ts#L567>).

**Riferimento documentale:** [docs/L02-componenti.md:38](<../../../docs/L02-componenti.md#L38>), [docs/design/L2 - Notificationbar.dc.html:46](<../../../docs/design/L2 - Notificationbar.dc.html#L46>), [docs/design/L0 - Sistema.md:294](<../../../docs/design/L0 - Sistema.md#L294>).

**Previsto:** Arrivi esterni nella Notificationbar; promozione a task solo per scelta dell’utente.

**Effettivo:** conCassetto=false predefinito: arrivo crea CARTA/ORARIO; campanella assente. Il banco permette di alternare due modelli incompatibili.

**Divergenza:** Notifiche trasformate automaticamente in task; modello corretto dietro flag spento.

**Impatto:** Il comportamento normativo non è quello avviato dal prodotto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Rendere unico il flusso documentato, rimuovere o confinare esplicitamente il modello legacy.

<a id="a007"></a>
## A007 — Notifiche silenziose perse nel percorso predefinito

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:343](<../../../src/modello/motore.ts#L343>), [src/confini/filtro.ts:1](<../../../src/confini/filtro.ts#L1>).

**Riferimento documentale:** [docs/design/L2 - Notificationbar.dc.html:66](<../../../docs/design/L2 - Notificationbar.dc.html#L66>).

**Previsto:** Un arrivo filtrato non disturba ma resta consultabile nel cassetto.

**Effettivo:** Con flag spento, esito niente ritorna prima di salvare l’arrivo.

**Divergenza:** Notifiche silenziose perse nel percorso predefinito.

**Impatto:** Informazioni eliminate senza possibilità di recupero.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Conservare l’arrivo separatamente dalla decisione di notificare.

<a id="a008"></a>
## A008 — Promozione rimuove la notifica originale

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:1053](<../../../src/modello/motore.ts#L1053>).

**Riferimento documentale:** [docs/design/L2 - Notificationbar.dc.html:133](<../../../docs/design/L2 - Notificationbar.dc.html#L133>).

**Previsto:** La notifica resta nel cassetto dopo me ne occupo; nasce un task distinto.

**Effettivo:** estrai elimina la notifica dall’array mentre crea il task.

**Divergenza:** Promozione rimuove la notifica originale.

**Impatto:** Si perde la traccia del messaggio originale.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Conservare la notifica con collegamento al task e stato di presa in carico.

<a id="a009"></a>
## A009 — Ordinale delle notifiche diverso dall’ordine mostrato

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:610](<../../../src/aree/schermo.ts#L610>), [src/modello/motore.ts:954](<../../../src/modello/motore.ts#L954>).

**Riferimento documentale:** [docs/design/L2 - Notificationbar.dc.html:95](<../../../docs/design/L2 - Notificationbar.dc.html#L95>), [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>).

**Previsto:** Una selezione ordinale identifica la riga visibile corrispondente.

**Effettivo:** Rendering ordina per data crescente e include ORARIO; scegli usa solo notifiche in ordine inverso.

**Divergenza:** Ordinale delle notifiche diverso dall’ordine mostrato.

**Impatto:** La prima/la seconda può selezionare un messaggio diverso da quello letto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Usare una sola proiezione ordinata e gli stessi identificatori nella vista e nella selezione.

<a id="a010"></a>
## A010 — Notifiche senza contratto completo di mittente, oggetto e ora

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/tipi.ts:190](<../../../src/modello/tipi.ts#L190>), [src/aree/schermo.ts:618](<../../../src/aree/schermo.ts#L618>), [src/confini/posta.ts:1](<../../../src/confini/posta.ts#L1>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:294](<../../../docs/design/L0 - Sistema.md#L294>), [docs/design/L2 - Notificationbar.dc.html:95](<../../../docs/design/L2 - Notificationbar.dc.html#L95>).

**Previsto:** Mittente e oggetto originali, ora, testo non riscritto dall’assistente.

**Effettivo:** Nome/testo delle fixture sono sintetici; non esiste campo oggetto originale; chi sostituisce l’ora tramite chi ?? orario.

**Divergenza:** Notifiche senza contratto completo di mittente, oggetto e ora.

**Impatto:** Non si ricostruisce con precisione la provenienza e il momento dell’arrivo.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Separare e conservare i dati originali, renderizzandoli tutti.

<a id="a011"></a>
## A011 — Rinvio e arrivi futuri non tornano al lavoro alla scadenza

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:337](<../../../src/modello/motore.ts#L337>), [src/modello/motore.ts:369](<../../../src/modello/motore.ts#L369>), [src/modello/motore.ts:885](<../../../src/modello/motore.ts#L885>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:50](<../../../docs/L01-struttura_e_task.md#L50>), [docs/L02-componenti.md:34](<../../../docs/L02-componenti.md#L34>).

**Previsto:** Attesa in sidebar; al verificarsi dell’input/condizione si aggiorna il task e riparte la lavorazione.

**Effettivo:** rimanda programma solo il preavviso a 105 min; a 120 non accade nulla. Arrivi ORARIO senza timer; CARTA dopo 60 min diventa ORARIO anche senza ora.

**Divergenza:** Rinvio e arrivi futuri non tornano al lavoro alla scadenza.

**Impatto:** Lavori differiti diventano invisibili o restano in attesa indefinita.

**Evidenza:** reproduce.json: dopo 121 minuti luogo ORARIO, avanzamento aspetta te; ramo accogli non pianifica le scadenze future.

**Correzione necessaria:** Schedulare la condizione effettiva, luogo sidebar e transizione di ripresa; eliminare il timer CARTA obsoleto.

<a id="a012"></a>
## A012 — Invii duplicati e completamenti asincroni dopo abbandono

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:778](<../../../src/modello/motore.ts#L778>), [src/modello/motore.ts:945](<../../../src/modello/motore.ts#L945>), [src/modello/motore.ts:830](<../../../src/modello/motore.ts#L830>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:50](<../../../docs/L01-struttura_e_task.md#L50>), [docs/L01-struttura_e_task.md:58](<../../../docs/L01-struttura_e_task.md#L58>).

**Previsto:** Una operazione ha una sola esecuzione e gli esiti rispettano lo stato corrente.

**Effettivo:** consegna non controlla stato/pending/versione; due chiamate inviano due volte; then riporta un task abbandonato a CHIP/consegnato.

**Divergenza:** Invii duplicati e completamenti asincroni dopo abbandono.

**Impatto:** Duplicazioni e resurrezione di task cancellati; lotti esposti allo stesso problema.

**Evidenza:** reproduce.json: duplicate_send_while_pending calls=2; completion_after_leave=CHIP/consegnato.

**Correzione necessaria:** Idempotenza per operazione e versionamento/cancellazione dei callback.

<a id="a013"></a>
## A013 — Annullamento senza scadenza e timer di invii precedenti ancora validi

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:810](<../../../src/modello/motore.ts#L810>), [src/modello/motore.ts:921](<../../../src/modello/motore.ts#L921>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:63](<../../../docs/L01-struttura_e_task.md#L63>).

**Previsto:** Annullabile soltanto durante la finestra dell’invio corrente.

**Effettivo:** annulla verifica soltanto consegnato, anche in MEMORIA dopo 90 s; il timer controlla stato ma non l’identità dell’invio.

**Divergenza:** Annullamento senza scadenza e timer di invii precedenti ancora validi.

**Impatto:** Falso annullamento tardivo; una riconsegna può essere archiviata dal vecchio timer.

**Evidenza:** Annullamento oltre deadline riprodotto in reproduce.json; interferenza fra timer derivata dal callback che legge soltanto t.avanzamento.

**Correzione necessaria:** Associare deadline e token al singolo invio e invalidare i timer precedenti.

<a id="a014"></a>
## A014 — Risposte assegnate al turno sbagliato in conversazioni concorrenti

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/ai-engine.ts:83](<../../../src/ai-engine/ai-engine.ts#L83>), [src/modello/motore.ts:1474](<../../../src/modello/motore.ts#L1474>), [src/main.ts:323](<../../../src/main.ts#L323>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:35](<../../../docs/L00-lo_scopo.md#L35>), [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>).

**Previsto:** Più richieste possono convivere mantenendo contesto e risposta correttamente associati.

**Effettivo:** turno non identifica lo scambio; rispondi riempie l’ultimo non risposto, indipendentemente dalla richiesta che ha prodotto l’esito.

**Divergenza:** Risposte assegnate al turno sbagliato in conversazioni concorrenti.

**Impatto:** Domande e risposte si mescolano; i turni successivi ricevono una cronologia errata.

**Evidenza:** races.log: risposta alla prima assegnata a seconda domanda; risposta alla seconda aggiunta con domanda vuota.

**Correzione necessaria:** ID del turno, contesto isolato e collegamento esplicito dei risultati.

<a id="a015"></a>
## A015 — Scadenza INPUT calcolata dall’invio dell’utente, non dall’ultimo scambio

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:307](<../../../src/modello/motore.ts#L307>), [src/modello/motore.ts:1478](<../../../src/modello/motore.ts#L1478>), [src/main.ts:245](<../../../src/main.ts#L245>).

**Riferimento documentale:** [docs/design/L2 - INPUT.dc.html:548](<../../../docs/design/L2 - INPUT.dc.html#L548>).

**Previsto:** Lo scambio resta visibile 30 secondi dall’ultimo scambio.

**Effettivo:** Riempire risposta non aggiorna quando; una risposta lenta può arrivare a conversazione già chiusa.

**Divergenza:** Scadenza INPUT calcolata dall’invio dell’utente, non dall’ultimo scambio.

**Impatto:** Risposta appena prodotta scompare o non rimane leggibile per il tempo previsto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Aggiornare l’attività alla risposta con un orologio coerente e riprogrammare la chiusura.

<a id="a016"></a>
## A016 — Aspetta non interrompe la lavorazione pendente

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/modello/motore.ts:608](<../../../src/modello/motore.ts#L608>), [src/main.ts:310](<../../../src/main.ts#L310>), [src/ai-engine/ai-engine.ts:83](<../../../src/ai-engine/ai-engine.ts#L83>).

**Riferimento documentale:** [docs/design/L2 - INPUT.dc.html:437](<../../../docs/design/L2 - INPUT.dc.html#L437>), [docs/L01-struttura_e_task.md:63](<../../../docs/L01-struttura_e_task.md#L63>).

**Previsto:** Interruzione e annullamento devono avere un significato operativo coerente, soprattutto nella finestra Delay.

**Effettivo:** aspetta dice Aspetto senza cancellare turni; solo la stringa esatta digitata spegne la voce. Nessun AbortController del turno.

**Divergenza:** Aspetta non interrompe la lavorazione pendente.

**Impatto:** Azioni o risposte possono arrivare dopo l’apparente arresto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Separare pausa voce/cancellazione lavoro/annullamento invio nel contratto e applicare la semantica documentata; non estendere implicitamente aspetta.

<a id="a017"></a>
## A017 — Validazione dei tool incompleta e valori malformati accettati

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/api.ts:66](<../../../src/ai-engine/api.ts#L66>), [src/ai-engine/api.ts:165](<../../../src/ai-engine/api.ts#L165>), [vite.config.ts:55](<../../../vite.config.ts#L55>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>), [docs/L01-struttura_e_task.md:50](<../../../docs/L01-struttura_e_task.md#L50>).

**Previsto:** Grammatica chiusa, argomenti validi e domanda in caso non determinabile.

**Effettivo:** Sono controllati presenza ed enum, non tipi/interi/proprietà extra; null causa TypeError; 1.5 è un indice accettato.

**Divergenza:** Validazione dei tool incompleta e valori malformati accettati.

**Impatto:** Crash del turno o azioni non sensate da output AI malformato.

**Evidenza:** reproduce.json: null_arguments TypeError e fractional_tool_index restituisce fatto.

**Correzione necessaria:** Validare schema completo e vincoli prima dell’esecuzione, restituire errore tipizzato.

<a id="a018"></a>
## A018 — Risultato API fatto non riflette esito o mancata esecuzione

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/api.ts:125](<../../../src/ai-engine/api.ts#L125>), [src/modello/motore.ts:778](<../../../src/modello/motore.ts#L778>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>), [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>).

**Previsto:** L’assistente deve conoscere ciò che è stato realmente eseguito.

**Effettivo:** m.esegui restituisce void; l’API risponde fatto anche per no-op, blocco o invio ancora pendente.

**Divergenza:** Risultato API fatto non riflette esito o mancata esecuzione.

**Impatto:** Il modello può annunciare un successo mai avvenuto o proseguire su premesse false.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Restituire esito distinto fra accettato, in corso, rifiutato, concluso e fallito.

<a id="a019"></a>
## A019 — Fallback permanente e silenzioso a interprete finto

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/ai-engine.ts:188](<../../../src/ai-engine/ai-engine.ts#L188>), [src/main.ts:129](<../../../src/main.ts#L129>), [src/main.ts:177](<../../../src/main.ts#L177>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:19](<../../../docs/L04-aspetti_tecnici.md#L19>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Prompt analizzato via OpenRouter; simulazione documentata per memoria e servizi, non sostituzione implicita del ragionamento.

**Effettivo:** Dopo 503 o tre errori passa alle regex per tutta la sessione; solo console/nome interno ne danno notizia, il nome non è passato alla pedana.

**Divergenza:** Fallback permanente e silenzioso a interprete finto.

**Impatto:** L’utente non distingue un guasto da un cambiamento radicale di capacità.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere modalità offline esplicita o errore recuperabile; rendere visibile stato e ripristino.

<a id="a020"></a>
## A020 — Turni senza risposta a limite passi, output vuoto o fetch sospeso

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/ai-engine/ai-engine.ts:56](<../../../src/ai-engine/ai-engine.ts#L56>), [src/ai-engine/ai-engine.ts:90](<../../../src/ai-engine/ai-engine.ts#L90>), [src/ai-engine/ai-engine.ts:250](<../../../src/ai-engine/ai-engine.ts#L250>), [vite.config.ts:400](<../../../vite.config.ts#L400>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>).

**Previsto:** Scambio comprensibile anche quando il lavoro non riesce.

**Effettivo:** Massimo 10 passi poi ritorno senza spiegazione; zero mosse termina in silenzio; fetch chat/browser senza timeout esplicito.

**Divergenza:** Turni senza risposta a limite passi, output vuoto o fetch sospeso.

**Impatto:** Lavoro apparentemente fermo senza esito; durata non controllata.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire timeout, budget e risultato terminale esplicito; distinguere errori da nessuna azione.

<a id="a021"></a>
## A021 — Secondari sempre simulati e non autonomi

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/main.ts:137](<../../../src/main.ts#L137>), [src/ai-engine/secondari.ts:97](<../../../src/ai-engine/secondari.ts#L97>), [src/modello/motore.ts:188](<../../../src/modello/motore.ts#L188>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:53](<../../../docs/L01-struttura_e_task.md#L53>), [docs/L04-aspetti_tecnici.md:19](<../../../docs/L04-aspetti_tecnici.md#L19>).

**Previsto:** Durante lavorazione possono nascere sotto-task autonomi; elaborazione AI nel connettore.

**Effettivo:** Sempre SecondarioFinto anche con OpenRouter attivo, ritardi fissi e estratti testuali; nessun ciclo autonomo T_NUOVO.

**Divergenza:** Secondari sempre simulati e non autonomi.

**Impatto:** Preparazioni complesse sembrano eseguite ma sono fixture euristiche.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Implementare il percorso previsto oppure limitare e dichiarare la simulazione nel contratto del prototipo.

<a id="a022"></a>
## A022 — Deleghe: errori soppressi e risultati in ordine di completamento

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:199](<../../../src/modello/motore.ts#L199>), [src/modello/motore.ts:224](<../../../src/modello/motore.ts#L224>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:50](<../../../docs/L01-struttura_e_task.md#L50>), [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>).

**Previsto:** Fallimenti e risultati identificabili per lavoro.

**Effettivo:** catch vuoto; se almeno uno riesce annuncia Ho finito; push dei risultati segue l’ordine di risoluzione, senza ID del sotto-lavoro né controllo di abbandono.

**Divergenza:** Deleghe: errori soppressi e risultati in ordine di completamento.

**Impatto:** Successi parziali presentati come completi; testo instabile; callback tardivi cambiano task terminati.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Conservare risultati per ID, riportare errori parziali e verificare generazione/stato del task.

<a id="a023"></a>
## A023 — Rubrica e servizi operativi indipendenti dai documenti di contesto

**Categoria:** `CONFLICTING_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/confini/contatti.ts:77](<../../../src/confini/contatti.ts#L77>), [src/confini/posta.ts:1](<../../../src/confini/posta.ts#L1>), [src/main.ts:96](<../../../src/main.ts#L96>), [Archivio/users/user_123/services/contacts.txt:1](<../../../Archivio/users/user_123/services/contacts.txt#L1>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:30](<../../../docs/L01-struttura_e_task.md#L30>), [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>), [docs/L03-archivio.md:48](<../../../docs/L03-archivio.md#L48>).

**Previsto:** Dati simulati ricavati dai documenti del singolo utente.

**Effettivo:** AI legge services; motore usa RUBRICA hardcoded e fixture in memoria. Mamma ha un recapito diverso; Marco presente nei documenti non è risolvibile dal motore.

**Divergenza:** Rubrica e servizi operativi indipendenti dai documenti di contesto.

**Impatto:** L’assistente conosce dati che non può usare e può selezionare destinatari diversi dal contesto.

**Evidenza:** reproduce.json: Marco=null; confronto fra contacts.txt e RUBRICA. Nessun recapito è stato contattato.

**Correzione necessaria:** Unificare sorgente delle simulazioni sui documenti e dichiarare quali operazioni sono solo dimostrazioni.

<a id="a024"></a>
## A024 — Ricerca contatti per sottostringa senza disambiguazione

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/confini/contatti.ts:48](<../../../src/confini/contatti.ts#L48>), [src/confini/contatti.ts:57](<../../../src/confini/contatti.ts#L57>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>).

**Previsto:** Non indovinare persone o destinatari in caso di incertezza.

**Effettivo:** includes riconosce Giulia in Giuliano e Capo in capolavoro; la prima corrispondenza più lunga vince.

**Divergenza:** Ricerca contatti per sottostringa senza disambiguazione.

**Impatto:** Possibile destinatario errato già nella composizione.

**Evidenza:** reproduce.json: Giuliano→Giulia; capolavoro→Capo.

**Correzione necessaria:** Risoluzione per entità/parole intere e richiesta esplicita nei casi ambigui.

<a id="a025"></a>
## A025 — Filesystem obbligatorio non collegato al flusso dei servizi

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/main.ts:124](<../../../src/main.ts#L124>), [src/confini/disco.ts:1](<../../../src/confini/disco.ts#L1>), [vite.config.ts:112](<../../../vite.config.ts#L112>), [Archivio/users/user_123/filesystem.txt:1](<../../../Archivio/users/user_123/filesystem.txt#L1>).

**Riferimento documentale:** [docs/L03-archivio.md:56](<../../../docs/L03-archivio.md#L56>), [docs/L03-archivio.md:59](<../../../docs/L03-archivio.md#L59>), [docs/L01-struttura_e_task.md:15](<../../../docs/L01-struttura_e_task.md#L15>).

**Previsto:** Filesystem sempre disponibile e contesto letto dal documento dedicato.

**Effettivo:** Disco è usato per memoria ma manca dal Registro; filesystem.txt non entra nel prompt; la porta HTTP serve file noti, non implementa il percorso cerca documento.

**Divergenza:** Filesystem obbligatorio non collegato al flusso dei servizi.

**Impatto:** Servizio fondamentale non utilizzabile tramite l’assistente come definito.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Collegare contesto e operazioni filesystem nel perimetro del prototipo, mantenendo il confine utente.

<a id="a026"></a>
## A026 — Memoria semantica temporanea e abitudini automatiche non autorizzate

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/archivio/archivio.ts:67](<../../../src/archivio/archivio.ts#L67>), [src/archivio/archivio.ts:100](<../../../src/archivio/archivio.ts#L100>), [src/ai-engine/finto.ts:160](<../../../src/ai-engine/finto.ts#L160>), [src/modello/motore.ts:857](<../../../src/modello/motore.ts#L857>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:11](<../../../docs/L01-struttura_e_task.md#L11>), [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>), [docs/L03-archivio.md:45](<../../../docs/L03-archivio.md#L45>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Nel prototipo documenti di contesto; selezione automatica futura ancora da definire.

**Effettivo:** Entità, collegamenti, smentite, ipotesi, tre prove, conferma di abitudini e salvataggi automatici attivi in memoria.

**Divergenza:** Memoria semantica temporanea e abitudini automatiche non autorizzate.

**Impatto:** Architettura semantica e regole di autonomia anticipate senza decisione documentale; dati persi al reload nonostante formule me lo segno.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Sospendere/segregare i comportamenti non decisi o documentarli dopo decisione; non inventare ora una persistenza intelligente.

<a id="a027"></a>
## A027 — Raccolta non indicizza le entità del documento general.txt

**Categoria:** `CONFLICTING_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/archivio/archivio.ts:243](<../../../src/archivio/archivio.ts#L243>), [src/archivio/archivio.ts:309](<../../../src/archivio/archivio.ts#L309>), [src/aree/raccolta.ts:58](<../../../src/aree/raccolta.ts#L58>).

**Riferimento documentale:** [docs/L03-archivio.md:45](<../../../docs/L03-archivio.md#L45>), [docs/L04-aspetti_tecnici.md:23](<../../../docs/L04-aspetti_tecnici.md#L23>).

**Previsto:** Unica memoria simulata in memory/general.txt.

**Effettivo:** general.txt è correttamente letto sia dal server sia da Archivio.semina; tuttavia nomi() restituisce soltanto entità annotate nella sessione e raccolta usa nomi(), non il seme.

**Divergenza:** Raccolta non indicizza le entità del documento general.txt.

**Impatto:** Risposta dipende dal percorso AI/test/locale, pur usando lo stesso utente.

**Evidenza:** Archivio.semina usa SEME=general.txt (riga339); contenuti cerca nel seme, nomi legge soltanto entita. I due test falliti dipendono dalla fixture seme.txt obsoleta, non da un mancato caricamento general.txt.

**Correzione necessaria:** Definire l’indicizzazione dei nomi noti nel contesto per la raccolta; conservare la lettura di general.txt già corretta.

<a id="a028"></a>
## A028 — Contesto AI privo delle preferenze stabili dell’utente

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [vite.config.ts:110](<../../../vite.config.ts#L110>), [src/conoscenza/profilo.ts:263](<../../../src/conoscenza/profilo.ts#L263>), [src/ai-engine/strumenti.ts:630](<../../../src/ai-engine/strumenti.ts#L630>).

**Riferimento documentale:** [docs/L02-componenti.md:11](<../../../docs/L02-componenti.md#L11>), [docs/L03-archivio.md:49](<../../../docs/L03-archivio.md#L49>).

**Previsto:** Leggere preferenze, lingua, luoghi e contesto; password esclusa dall’AI.

**Effettivo:** Il prompt passa soltanto p.assistente a istruzioni e aggiunge system/memory/services; preferenze dell’utente e luoghi registrati non sono serializzati.

**Divergenza:** Contesto AI privo delle preferenze stabili dell’utente.

**Impatto:** Richieste non informate da dati che la documentazione dichiara disponibili.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Passare un contesto utente esplicito filtrato; mantenere l’esclusione della password.

<a id="a029"></a>
## A029 — Parser preferenze incompatibile con il file distribuito

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/conoscenza/profilo.ts:229](<../../../src/conoscenza/profilo.ts#L229>), [src/conoscenza/profilo.ts:263](<../../../src/conoscenza/profilo.ts#L263>), [Archivio/users/user_123/preferences.txt:20](<../../../Archivio/users/user_123/preferences.txt#L20>).

**Riferimento documentale:** [docs/L03-archivio.md:49](<../../../docs/L03-archivio.md#L49>), [docs/L04-aspetti_tecnici.md:38](<../../../docs/L04-aspetti_tecnici.md#L38>).

**Previsto:** Preferenze e voce configurate dal documento locale.

**Effettivo:** Il file usa assitant/reading/settings; parser legge lettura e figli(preferenze).voce/nome/sesso; focuses ignorati.

**Divergenza:** Parser preferenze incompatibile con il file distribuito.

**Impatto:** Lettura off e identità/voce scelte non hanno effetto.

**Evidenza:** reproduce.json: assitant: reading: off produce lettura=true; assistente del file attuale contiene soltanto lettura.

**Correzione necessaria:** Definire un solo schema testuale e allineare parser, fixture e validazione.

<a id="a030"></a>
## A030 — Valori di sistema mancanti o malformati trasformati in dati inventati

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/conoscenza/profilo.ts:207](<../../../src/conoscenza/profilo.ts#L207>), [src/conoscenza/profilo.ts:255](<../../../src/conoscenza/profilo.ts#L255>), [src/conoscenza/profilo.ts:384](<../../../src/conoscenza/profilo.ts#L384>).

**Riferimento documentale:** [docs/L03-archivio.md:53](<../../../docs/L03-archivio.md#L53>), [docs/L02-componenti.md:26](<../../../docs/L02-componenti.md#L26>).

**Previsto:** Mostrare lo stato simulato indicato, senza attribuire capacità non disponibili.

**Effettivo:** numero elimina segni e separatori; microfono/ethernet assenti diventano true; caricamento fallito conserva un profilo predefinito senza avviso.

**Divergenza:** Valori di sistema mancanti o malformati trasformati in dati inventati.

**Impatto:** Stato macchina o identità fuorviante, valori fuori range e falso ascolto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Validare range/schema e distinguere assente, sconosciuto, spento ed errore di lettura.

<a id="a031"></a>
## A031 — WorkMode e riconoscimento dei luoghi registrati assenti

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/conoscenza/profilo.ts:213](<../../../src/conoscenza/profilo.ts#L213>), [src/aree/schermo.ts:199](<../../../src/aree/schermo.ts#L199>), [src/conoscenza/contesto.ts:30](<../../../src/conoscenza/contesto.ts#L30>).

**Riferimento documentale:** [docs/L02-componenti.md:22](<../../../docs/L02-componenti.md#L22>), [docs/design/L2 - Profilebar.dc.html:70](<../../../docs/design/L2 - Profilebar.dc.html#L70>), [docs/design/Liquid glass.md:47](<../../../docs/design/Liquid glass.md#L47>).

**Previsto:** Luogo noto senza città ridondante; WorkMode ricavato da posizione/orario, ad esempio Deep.

**Effettivo:** Nessuna risoluzione fra focuses e GPS, nessun WorkMode; luogo composto da due stringhe e punto mediano.

**Divergenza:** WorkMode e riconoscimento dei luoghi registrati assenti.

**Impatto:** Profilebar non comunica il contesto operativo previsto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Implementare le regole da preferenze; chiarire la precedenza fra più modalità sovrapposte.

<a id="a032"></a>
## A032 — Attraversamento dei percorsi oltre utente e oltre memory

**Categoria:** `SECURITY` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [vite.config.ts:687](<../../../vite.config.ts#L687>), [vite.config.ts:795](<../../../vite.config.ts#L795>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:31](<../../../docs/L04-aspetti_tecnici.md#L31>), [docs/L01-struttura_e_task.md:11](<../../../docs/L01-struttura_e_task.md#L11>).

**Previsto:** Node espone soltanto file dell’utente attivo; scrittura dichiarata limitata a memory.

**Effettivo:** La regex accetta ..; resolve è confinato a users, non a user_123 né memory; POST permette ../services e ../../altro-utente.

**Divergenza:** Attraversamento dei percorsi oltre utente e oltre memory.

**Impatto:** Lettura/sovrascrittura fuori dal perimetro autorizzato. Nel prototipo esiste un solo utente, ma il controllo non garantisce il confine.

**Evidenza:** http-test.log: GET del file sintetico dell’utente fratello=200; POST fuori memory e altro utente=200; entrambi i file verificati.

**Correzione necessaria:** Rifiutare segmenti speciali; confinare path normalizzato/reale alla radice specifica dell’operazione e gestire symlink.

<a id="a033"></a>
## A033 — Symlink non considerati dal controllo di confinamento

**Categoria:** `SECURITY` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [vite.config.ts:694](<../../../vite.config.ts#L694>), [vite.config.ts:842](<../../../vite.config.ts#L842>), [vite.config.ts:807](<../../../vite.config.ts#L807>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:31](<../../../docs/L04-aspetti_tecnici.md#L31>).

**Previsto:** Il file effettivo deve appartenere al perimetro utente.

**Effettivo:** Confronto lessicale del path; readFileSync/writeFileSync seguono link senza realpath/lstat del percorso effettivo.

**Divergenza:** Symlink non considerati dal controllo di confinamento.

**Impatto:** Un link presente nell’archivio può aggirare il controllo anche eliminando ..; prerequisito: link creato localmente.

**Evidenza:** Analisi statica; non è stata creata una catena di symlink verso dati reali.

**Correzione necessaria:** Confinare percorso reale e directory genitrici, con politica esplicita sui link.

<a id="a034"></a>
## A034 — Chat raw può perdere messaggi senza blocco o recupero

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** forte evidenza

**File e posizione:** [src/archivio/chat-raw.ts:6](<../../../src/archivio/chat-raw.ts#L6>), [src/modello/motore.ts:430](<../../../src/modello/motore.ts#L430>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:22](<../../../docs/L01-struttura_e_task.md#L22>), [docs/L03-archivio.md:44](<../../../docs/L03-archivio.md#L44>), [docs/L04-aspetti_tecnici.md:26](<../../../docs/L04-aspetti_tecnici.md#L26>).

**Previsto:** Archivio integrale e persistente di ogni scambio.

**Effettivo:** fetch fire-and-forget, errori solo console, nessun retry/ack/coda; il lavoro prosegue anche se la scrittura fallisce.

**Divergenza:** Chat raw può perdere messaggi senza blocco o recupero.

**Impatto:** Conversazione non recuperabile dopo errore/reload; integrità non garantita.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Consegna affidabile con ID e coda/ack; segnalare e recuperare i salvataggi mancati.

<a id="a035"></a>
## A035 — Ordine cronologico della chat raw non garantito

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/archivio/chat-raw.ts:6](<../../../src/archivio/chat-raw.ts#L6>), [vite.config.ts:739](<../../../vite.config.ts#L739>).

**Riferimento documentale:** [docs/L03-archivio.md:44](<../../../docs/L03-archivio.md#L44>).

**Previsto:** Append cronologico dei messaggi originali.

**Effettivo:** Richieste concorrenti, timestamp dal client e append in ordine di arrivo senza sequenza/controllo.

**Divergenza:** Ordine cronologico della chat raw non garantito.

**Impatto:** Righe possono risultare temporalmente invertite.

**Evidenza:** http-test.log: due POST con timestamp decrescente accettati; file JSONL della copia conserva l’ordine inverso.

**Correzione necessaria:** Assegnare sequenza monotona e gestire riordino/duplicati definendo il contratto temporale.

<a id="a036"></a>
## A036 — Il testo originale viene normalizzato prima dell’archiviazione

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/main.ts:290](<../../../src/main.ts#L290>), [src/archivio/chat-raw.ts:3](<../../../src/archivio/chat-raw.ts#L3>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:26](<../../../docs/L04-aspetti_tecnici.md#L26>), [docs/L03-archivio.md:44](<../../../docs/L03-archivio.md#L44>).

**Previsto:** Conservare testo originale integrale.

**Effettivo:** Il campo tastiera è trim prima del turno; salvaMessaggio scarta testi vuoti.

**Divergenza:** Il testo originale viene normalizzato prima dell’archiviazione.

**Impatto:** Spazi iniziali/finali non sono conservati; definizione di originale violata o da precisare.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Separare testo grezzo registrato dal testo normalizzato per interpretazione.

<a id="a037"></a>
## A037 — Scrittura memoria HTTP attiva benché la memoria intelligente sia sospesa

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [vite.config.ts:781](<../../../vite.config.ts#L781>), [src/confini/disco.ts:97](<../../../src/confini/disco.ts#L97>), [src/archivio/archivio.ts:330](<../../../src/archivio/archivio.ts#L330>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>), [docs/L03-archivio.md:45](<../../../docs/L03-archivio.md#L45>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Prototipo basato su documenti preparati, non su memoria automatica già funzionante.

**Effettivo:** Endpoint POST crea/sovrascrive markdown; percorsi produttivi dell’Archivio sono invece no-op; contratto dell’API non documentato.

**Divergenza:** Scrittura memoria HTTP attiva benché la memoria intelligente sia sospesa.

**Impatto:** Superficie di mutazione reale scollegata dalle capacità dichiarate; ambiguità sulla persistenza.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere ed esplicitare l’API consentita; disattivare i percorsi non usati o documentarne scopo e limiti.

<a id="a038"></a>
## A038 — Stack React e Tailwind assente

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [package.json:1](<../../../package.json#L1>), [src/main.ts:1](<../../../src/main.ts#L1>), [src/aree/schermo.ts:1](<../../../src/aree/schermo.ts#L1>), [src/stile/base.css:1](<../../../src/stile/base.css#L1>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:29](<../../../docs/L04-aspetti_tecnici.md#L29>).

**Previsto:** Sito React, Vite e Tailwind.

**Effettivo:** Vite/TypeScript con costruzione imperativa del DOM e CSS manuale; React e Tailwind non sono dipendenze né componenti.

**Divergenza:** Stack React e Tailwind assente.

**Impatto:** Scelta architetturale centrale diversa dalla decisione di progetto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere migrazione allo stack prescritto; non dichiarare conforme lo stack esistente senza cambiare formalmente il requisito.

<a id="a039"></a>
## A039 — Build e preview non includono il backend del prototipo

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Alta · **Certezza:** forte evidenza

**File e posizione:** [package.json:7](<../../../package.json#L7>), [vite.config.ts:480](<../../../vite.config.ts#L480>), [vite.config.ts:713](<../../../vite.config.ts#L713>), [vite.config.ts:765](<../../../vite.config.ts#L765>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:26](<../../../docs/L04-aspetti_tecnici.md#L26>), [docs/L04-aspetti_tecnici.md:31](<../../../docs/L04-aspetti_tecnici.md#L31>).

**Previsto:** Accesso Node ai documenti e chat raw funzionanti nell’esecuzione supportata.

**Effettivo:** Tutti gli endpoint sono configureServer; dist è statico e configurePreviewServer manca.

**Divergenza:** Build e preview non includono il backend del prototipo.

**Impatto:** npm preview non offre archivio/AI/chat raw; il frontend degrada a default/finto o perde salvataggi.

**Evidenza:** Build tsc+Vite riuscita; analisi di tutti i plugin: nessun backend emesso o handler preview. Preview non testato via browser.

**Correzione necessaria:** Documentare ed implementare il runtime supportato dopo build; testare gli endpoint in quell’ambiente.

<a id="a040"></a>
## A040 — Node 24 non vincolato e script scenario dipendente da esbuild transitivo

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [package.json:1](<../../../package.json#L1>), [package.json:10](<../../../package.json#L10>), [package-lock.json:1](<../../../package-lock.json#L1>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:15](<../../../docs/L04-aspetti_tecnici.md#L15>).

**Previsto:** Runtime Node 24 riproducibile.

**Effettivo:** Nessun engines/version file; scenario invoca esbuild presente solo tramite Vite.

**Divergenza:** Node 24 non vincolato e script scenario dipendente da esbuild transitivo.

**Impatto:** Installazione/esecuzione possono usare runtime o toolchain diversi senza avviso.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Dichiarare requisito runtime e dipendenza diretta del comando di test.

<a id="a041"></a>
## A041 — Dipendenza phonemizer priva di riferimenti

**Categoria:** `DEAD_CODE` · **Severità:** Bassa · **Certezza:** forte evidenza

**File e posizione:** [package.json:22](<../../../package.json#L22>), [package-lock.json:1](<../../../package-lock.json#L1>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:44](<../../../docs/L04-aspetti_tecnici.md#L44>).

**Previsto:** Dipendenze motivate da funzionalità previste.

**Effettivo:** phonemizer presente nel manifest/lock ma nessun import o riferimento operativo nei sorgenti/script; fonemizzazione usa espeak-ng.

**Divergenza:** Dipendenza phonemizer priva di riferimenti.

**Impatto:** Superficie e manutenzione non giustificate.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Confermare uso esterno non presente nel repo oppure rimuovere la dipendenza.

<a id="a042"></a>
## A042 — Ramo provider nativo irraggiungibile e commenti multi-provider obsoleti

**Categoria:** `DEAD_CODE` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [vite.config.ts:140](<../../../vite.config.ts#L140>), [vite.config.ts:259](<../../../vite.config.ts#L259>), [vite.config.ts:541](<../../../vite.config.ts#L541>), [src/ai-engine/finto.ts:3](<../../../src/ai-engine/finto.ts#L3>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:19](<../../../docs/L04-aspetti_tecnici.md#L19>).

**Previsto:** OpenRouter unico provider del prototipo; altri provider futuri.

**Effettivo:** nativo sempre false, ramo betas/fallback/effort morto; commenti dichiarano ANTHROPIC_API_KEY/provider diretto ancora attivo.

**Divergenza:** Ramo provider nativo irraggiungibile e commenti multi-provider obsoleti.

**Impatto:** Fa credere disponibili fallback e provider inesistenti; aumenta costo di manutenzione.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Rimuovere o separare sperimentazioni non attive e correggere i commenti. SDK Anthropic usato con OpenRouter non è di per sé un provider aggiuntivo.

<a id="a043"></a>
## A043 — Parametri e API del motore non specificati nei documenti attuali

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/strumenti.ts:1](<../../../src/ai-engine/strumenti.ts#L1>), [src/modello/motore.ts:36](<../../../src/modello/motore.ts#L36>), [vite.config.ts:188](<../../../vite.config.ts#L188>), [vite.config.ts:280](<../../../vite.config.ts#L280>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>), [docs/L04-aspetti_tecnici.md:19](<../../../docs/L04-aspetti_tecnici.md#L19>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Grammatica chiusa prevista, ma scelte concrete devono essere giustificate dalla documentazione.

**Effettivo:** Decine di tool/permessi, gruppi/lotti, rinvio fisso 2h, massimo 10 passi, cache 1h, max_tokens4000 e scelta modello/dialetto sono definiti solo da codice/env e riferimenti rimossi.

**Divergenza:** Parametri e API del motore non specificati nei documenti attuali.

**Impatto:** Non è determinabile quali dettagli siano autorizzati e quali residui legacy.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Approvare un contratto API e un registro dei parametri; rimuovere le estensioni non adottate. Non si propone di inventare valori alternativi.

<a id="a044"></a>
## A044 — Diagnostica e fixture di sviluppo incluse nel prodotto senza separazione di build

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/main.ts:38](<../../../src/main.ts#L38>), [src/main.ts:175](<../../../src/main.ts#L175>), [src/aree/schermo.ts:1090](<../../../src/aree/schermo.ts#L1090>), [src/prova/pedana.ts:1](<../../../src/prova/pedana.ts#L1>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:105](<../../../docs/design/L0 - Sistema.md#L105>), [docs/L04-aspetti_tecnici.md:7](<../../../docs/L04-aspetti_tecnici.md#L7>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Flusso tramite assistente; banco di taratura separato dal prodotto secondo strumenti/LEGGIMI.

**Effettivo:** Pedana, scia, reset, iniezione arrivi, salti temporali, toggle cassetto/frasi sono importati nell’entry point anche nella build.

**Divergenza:** Diagnostica e fixture di sviluppo incluse nel prodotto senza separazione di build.

**Impatto:** Modalità alternativa può cambiare mondo e regole; architettura di debug non definita in docs.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire perimetro demo e separare attivazione/artefatti di prova dal comportamento di prodotto.

<a id="a045"></a>
## A045 — Ricetta Liquid glass attuale non usata dall’applicazione

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/stile/base.css:1](<../../../src/stile/base.css#L1>), [src/stile/base.css:395](<../../../src/stile/base.css#L395>), [src/main.ts:1](<../../../src/main.ts#L1>).

**Riferimento documentale:** [docs/design/Liquid glass.md:7](<../../../docs/design/Liquid glass.md#L7>), [docs/design/liquid-glass.css:18](<../../../docs/design/liquid-glass.css#L18>), [docs/design/materiali.css:1](<../../../docs/design/materiali.css#L1>).

**Previsto:** Unica ricetta condivisa per bubble, chip, INPUT, Profilebar e Notificationbar.

**Effettivo:** App duplica gradienti/ombre ottiche precedenti; blur42 e film diversi, non importa liquid-glass/materiali/profilebar.

**Divergenza:** Ricetta Liquid glass attuale non usata dall’applicazione.

**Impatto:** Prototipo visivamente diverso dalle decisioni correnti e drift fra componenti.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Collegare token canonici e rimuovere duplicazioni; verifica visiva successiva sulle scene documentate.

<a id="a046"></a>
## A046 — Materiale scuro non implementato nell’applicazione

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/stile/tema.ts:21](<../../../src/stile/tema.ts#L21>), [src/main.ts:201](<../../../src/main.ts#L201>), [src/stile/base.css:1](<../../../src/stile/base.css#L1>).

**Riferimento documentale:** [docs/design/Liquid glass.md:76](<../../../docs/design/Liquid glass.md#L76>), [docs/design/L1 - Temi.dc.html:221](<../../../docs/design/L1 - Temi.dc.html#L221>).

**Previsto:** Tutti i componenti supportano vetro chiaro e scuro con inchiostri dedicati.

**Effettivo:** App imposta palette data-colori ma non il ramo materiale data-tema né materiali.css.

**Divergenza:** Materiale scuro non implementato nell’applicazione.

**Impatto:** Temi scuri documentati non corrispondono al sistema in esecuzione.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Implementare scelta e propagazione del materiale separatamente dalla tinta.

<a id="a047"></a>
## A047 — Override arbitrari dei colori semantici ammessi

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/stile/tema.ts:21](<../../../src/stile/tema.ts#L21>), [src/conoscenza/profilo.ts:222](<../../../src/conoscenza/profilo.ts#L222>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:164](<../../../docs/design/L0 - Sistema.md#L164>), [docs/design/L1 - Temi.dc.html:248](<../../../docs/design/L1 - Temi.dc.html#L248>).

**Previsto:** Colore esprime stato e tavolozze rispettano semantica invariata.

**Effettivo:** Il blocco tema può riscrivere salvia/ambra/rosso e relativi inchiostri; il controllo segnala solo accent color.

**Divergenza:** Override arbitrari dei colori semantici ammessi.

**Impatto:** Profilo locale può annullare il significato degli stati senza segnalazione.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Limitare override ai token consentiti dal contratto e validare palette/contrasti.

<a id="a048"></a>
## A048 — Geometria e contenuto della Profilebar non aggiornati

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:199](<../../../src/aree/schermo.ts#L199>), [src/stile/base.css:268](<../../../src/stile/base.css#L268>).

**Riferimento documentale:** [docs/design/Liquid glass.md:37](<../../../docs/design/Liquid glass.md#L37>), [docs/design/L2 - Profilebar.dc.html:55](<../../../docs/design/L2 - Profilebar.dc.html#L55>), [docs/design/profilebar.css:13](<../../../docs/design/profilebar.css#L13>).

**Previsto:** Altezza60, raggio30, padding8/12/8/24, gap16/12, avatar44; nessun punto mediano; bolla condivisa.

**Effettivo:** Velo legacy, padding e distanze diversi, ora/data unite da punto mediano; città e luogo ripetuti.

**Divergenza:** Geometria e contenuto della Profilebar non aggiornati.

**Impatto:** Componente identificativo non corrisponde alla tavola corrente.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Applicare geometria condivisa e separare gruppi di dati come nella tavola; WorkMode trattato in A031.

<a id="a049"></a>
## A049 — Sidebar tronca oltre quattro elementi senza +N

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:299](<../../../src/aree/schermo.ts#L299>).

**Riferimento documentale:** [docs/design/L2 - Sidebar.dc.html:205](<../../../docs/design/L2 - Sidebar.dc.html#L205>), [docs/L02-componenti.md:34](<../../../docs/L02-componenti.md#L34>).

**Previsto:** Quattro chip visibili e indicazione +N dei restanti.

**Effettivo:** slice(0,4) scarta il resto senza overflow numerico.

**Divergenza:** Sidebar tronca oltre quattro elementi senza +N.

**Impatto:** L’utente non può capire quanti task sono fuori vista.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Mostrare +N e percorso conversazionale per accedere al resto.

<a id="a050"></a>
## A050 — Sidebar attenuata per qualsiasi focus anziché per raccolta

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:306](<../../../src/aree/schermo.ts#L306>), [src/stile/base.css:1](<../../../src/stile/base.css#L1>).

**Riferimento documentale:** [docs/design/L2 - Sidebar.dc.html:204](<../../../docs/design/L2 - Sidebar.dc.html#L204>).

**Previsto:** Attenuazione45% quando la raccolta chiede attenzione.

**Effettivo:** Classe attenuata legata a aFuoco e opacity diversa; compare anche nel lavoro ordinario.

**Divergenza:** Sidebar attenuata per qualsiasi focus anziché per raccolta.

**Impatto:** Gerarchia visiva non corrispondente alla situazione semantica prevista.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Collegare attenuazione allo stato della raccolta e usare il valore documentato.

<a id="a051"></a>
## A051 — Bolle con geometria e gerarchia testuale precedenti

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/stile/base.css:386](<../../../src/stile/base.css#L386>), [src/stile/base.css:490](<../../../src/stile/base.css#L490>), [src/aree/scrivania.ts:94](<../../../src/aree/scrivania.ts#L94>).

**Riferimento documentale:** [docs/design/L2 - Bubble.dc.html:138](<../../../docs/design/L2 - Bubble.dc.html#L138>), [docs/design/L0 - Sistema.md:222](<../../../docs/design/L0 - Sistema.md#L222>).

**Previsto:** Misure tipografiche e spazi della tavola corrente; dimensioni determinate dal contenuto.

**Effettivo:** Padding22/24, titoli16/corpo12/frasi12; larghezze fisse388/452/560 secondo fuoco.

**Divergenza:** Bolle con geometria e gerarchia testuale precedenti.

**Impatto:** Densità, leggibilità e spazio assegnato cambiano in base al focus invece del contenuto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Allineare misure non ambigue; risolvere il conflitto L0/L2 sui pesi prima di fissare la tipografia.

<a id="a052"></a>
## A052 — Max due punti colorati non garantito

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Bassa · **Certezza:** forte evidenza

**File e posizione:** [src/aree/schermo.ts:1](<../../../src/aree/schermo.ts#L1>), [src/stile/base.css:1](<../../../src/stile/base.css#L1>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:174](<../../../docs/design/L0 - Sistema.md#L174>).

**Previsto:** Non più di due punti colorati nello schermo.

**Effettivo:** Ogni task/chip/targa riceve la tinta dal proprio stato indipendentemente dagli altri.

**Divergenza:** Max due punti colorati non garantito.

**Impatto:** Più task in attesa/lavoro producono simultaneamente più richiami cromatici.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire priorità visiva globale coerente con la legge, senza perdere stato accessibile.

<a id="a053"></a>
## A053 — Contenuti lunghi e apertura interna non seguono il contratto di una sola cosa

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/aree/schermo.ts:430](<../../../src/aree/schermo.ts#L430>), [src/stile/base.css:480](<../../../src/stile/base.css#L480>), [src/stile/base.css:699](<../../../src/stile/base.css#L699>).

**Riferimento documentale:** [docs/design/L2 - Bubble.dc.html:138](<../../../docs/design/L2 - Bubble.dc.html#L138>), [docs/design/L2 - Bubble.dc.html:604](<../../../docs/design/L2 - Bubble.dc.html#L604>), [docs/design/L2 - INPUT.dc.html:556](<../../../docs/design/L2 - INPUT.dc.html#L556>).

**Previsto:** Corpo breve, lettura estesa controllata; INPUT solo parole/raccolta/scambio.

**Effettivo:** Vista interna aggiunge testo esteso e separatori al corpo già presente; INPUT ha altezza massima con overflow hidden senza garanzia di accesso agli scambi lunghi.

**Divergenza:** Contenuti lunghi e apertura interna non seguono il contratto di una sola cosa.

**Impatto:** Duplicazione e contenuti potenzialmente tagliati; limite quantitativo non gestito.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Unica proiezione del contenuto, overflow/scorrimento e promozione al desk coerenti con il contratto.

<a id="a054"></a>
## A054 — Timer di uscita può eliminare una bolla tornata attiva

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/aree/schermo.ts:352](<../../../src/aree/schermo.ts#L352>), [src/aree/schermo.ts:375](<../../../src/aree/schermo.ts#L375>).

**Riferimento documentale:** [docs/design/L2 - Bubble.dc.html:882](<../../../docs/design/L2 - Bubble.dc.html#L882>).

**Previsto:** Richiamo ripristina il task nella scrivania e conserva posizione quando possibile.

**Effettivo:** Un nodo in uscita viene riusato prima dei700/1500ms; dataset.uscita e timeout non annullati, Scrivania.togli già eseguito.

**Divergenza:** Timer di uscita può eliminare una bolla tornata attiva.

**Impatto:** La bolla richiamata può sparire dal DOM pur essendo attiva nel modello.

**Evidenza:** Sequenza statica togli→timer remove→querySelector riusa nodo; non verificata con browser.

**Correzione necessaria:** Annullare uscita/timer al rientro e riallineare modello geometrico e nodo.

<a id="a055"></a>
## A055 — Tempi di conclusione e riposo automatico della bolla mancanti

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:36](<../../../src/modello/motore.ts#L36>), [src/aree/schermo.ts:352](<../../../src/aree/schermo.ts#L352>).

**Riferimento documentale:** [docs/design/L2 - Bubble.dc.html:583](<../../../docs/design/L2 - Bubble.dc.html#L583>), [docs/design/L2 - Bubble.dc.html:850](<../../../docs/design/L2 - Bubble.dc.html#L850>).

**Previsto:** La tavola descrive conclusione visibile6s e riposo dopo30min; invio comunque soggetto al Delay normativo.

**Effettivo:** Non esistono timer6s/30min; solo90s,60min,120min e timer animazioni.

**Divergenza:** Tempi di conclusione e riposo automatico della bolla mancanti.

**Impatto:** Ciclo di presenza della bolla non segue la specifica visiva.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Riconciliare prima la sequenza conclusione/Delay nei documenti, poi implementare timer e riposo; non copiare l’invio anticipato della vecchia tavola.

<a id="a056"></a>
## A056 — INPUT mostra spinner e varianti di frasi non previste dall’ultima revisione

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:773](<../../../src/aree/schermo.ts#L773>), [src/main.ts:444](<../../../src/main.ts#L444>), [src/prova/pedana.ts:69](<../../../src/prova/pedana.ts#L69>).

**Riferimento documentale:** [docs/design/L2 - INPUT.dc.html:548](<../../../docs/design/L2 - INPUT.dc.html#L548>), [docs/design/L2 - INPUT.dc.html:556](<../../../docs/design/L2 - INPUT.dc.html#L556>).

**Previsto:** Nell’ultima revisione INPUT raccoglie parole, raccolta e scambio; nessun avanzamento task o frasi operative.

**Effettivo:** gira durante il pensiero; banco può spostare frasi/task in INPUT, mantenendo varianti precedenti.

**Divergenza:** INPUT mostra spinner e varianti di frasi non previste dall’ultima revisione.

**Impatto:** Una stessa area assume contratti incompatibili.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Adottare revisione finale e isolare le varianti storiche dal prodotto.

<a id="a057"></a>
## A057 — Raccolta limitata a nomi già noti e senza selezione completa documentata

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/aree/raccolta.ts:43](<../../../src/aree/raccolta.ts#L43>), [src/aree/schermo.ts:690](<../../../src/aree/schermo.ts#L690>).

**Riferimento documentale:** [docs/design/L2 - INPUT.dc.html:194](<../../../docs/design/L2 - INPUT.dc.html#L194>), [docs/design/L2 - INPUT.dc.html:349](<../../../docs/design/L2 - INPUT.dc.html#L349>).

**Previsto:** Raccolta di contenuti agganciati allo scambio, con limiti/selezione/anteprima descritti nelle proposte di interazione.

**Effettivo:** Ricerca per sottostringa in task/memoria/rubrica; nessuna raccolta di file da filesystem né percorso completo dei gruppi/recupero scarti.

**Divergenza:** Raccolta limitata a nomi già noti e senza selezione completa documentata.

**Impatto:** Le scene esplorative non sono realizzate dal riconoscimento di nomi.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere quali idee di raccolta sono requisiti approvati; implementare quelle adottate, non considerare tutte le proposte obbligatorie.

<a id="a058"></a>
## A058 — Sì e prima frase verde hanno effetti diversi nella composizione

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/motore.ts:1533](<../../../src/modello/motore.ts#L1533>), [src/ai-engine/regole.ts:150](<../../../src/ai-engine/regole.ts#L150>), [src/main.ts:301](<../../../src/main.ts#L301>).

**Riferimento documentale:** [docs/design/L2 - Bubble.dc.html:175](<../../../docs/design/L2 - Bubble.dc.html#L175>).

**Previsto:** La prima frase è quella probabile, seguita dal sì/azione primaria indicata.

**Effettivo:** Prima frase aggiunge un cuore; sì invia. La domanda Vuoi che lo invii non ha una frase di invio fra le quattro.

**Divergenza:** Sì e prima frase verde hanno effetti diversi nella composizione.

**Impatto:** Azioni suggerite e conferma verbale non sono equivalenti.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Allineare domanda, prima frase e conferma al medesimo intento.

<a id="a059"></a>
## A059 — Controllo microfono reso interattivo ma non gestito e fuori scope

**Categoria:** `LEGACY_OR_UNKNOWN` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:273](<../../../src/aree/schermo.ts#L273>), [src/main.ts:355](<../../../src/main.ts#L355>), [src/conoscenza/canali.ts:1](<../../../src/conoscenza/canali.ts#L1>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:16](<../../../docs/L04-aspetti_tecnici.md#L16>), [docs/design/L2 - Systembar.dc.html:119](<../../../docs/design/L2 - Systembar.dc.html#L119>).

**Previsto:** Prototipo soltanto tastiera; indicazione SCRIVI coerente con l’assenza di ricezione vocale.

**Effettivo:** UI può mostrare SOLO TU e premi per tornare a voce, ma il data-microfono non ha handler; identità dell’ascoltatore simulata influenza l’accettazione dell’input.

**Divergenza:** Controllo microfono reso interattivo ma non gestito e fuori scope.

**Impatto:** Controllo non funzionante e capacità di riconoscimento implicita inesistente.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Rimuovere/segregare simulazione di ascolto e mantenere percorso tastiera; non aggiungere ora Whisper.

<a id="a060"></a>
## A060 — Timeline sceglie task conclusi e misura durata dall’ultimo tocco

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/aree/timeline.ts:52](<../../../src/aree/timeline.ts#L52>), [src/aree/timeline.ts:60](<../../../src/aree/timeline.ts#L60>), [src/aree/timeline.ts:206](<../../../src/aree/timeline.ts#L206>), [src/modello/motore.ts:898](<../../../src/modello/motore.ts#L898>).

**Riferimento documentale:** [docs/design/L2 - TIMELINE.dc.html:229](<../../../docs/design/L2 - TIMELINE.dc.html#L229>), [docs/design/L2 - TIMELINE.dc.html:335](<../../../docs/design/L2 - TIMELINE.dc.html#L335>).

**Previsto:** Mostrare lavoro attuale, prossimo impegno valido e tempo libero corretto.

**Effettivo:** inCorso prende il primo, ilDopo considera ogni task con ora futura anche concluso; durata usa tocco aggiornato dai cambi di focus.

**Divergenza:** Timeline sceglie task conclusi e misura durata dall’ultimo tocco.

**Impatto:** Agenda o tempo libero falsi; attività pare ricominciare semplicemente richiamandola.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Filtrare lifecycle e distinguere inizio lavoro da ultimo cambio vista; definire scelta fra lavori concorrenti.

<a id="a061"></a>
## A061 — Timeline disegna marcatori vecchi nell’inizio della giornata

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/aree/timeline.ts:134](<../../../src/aree/timeline.ts#L134>), [src/aree/timeline.ts:161](<../../../src/aree/timeline.ts#L161>).

**Riferimento documentale:** [docs/design/L2 - TIMELINE.dc.html:229](<../../../docs/design/L2 - TIMELINE.dc.html#L229>).

**Previsto:** Niente passato nella rappresentazione descritta.

**Effettivo:** tratti include attese con ora passata e blocchi senza controllo di giornata; px li clampa al bordo0.

**Divergenza:** Timeline disegna marcatori vecchi nell’inizio della giornata.

**Impatto:** Impegni vecchi possono sembrare eventi odierni.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Filtrare intervallo temporale prima della proiezione e distinguere arretrati se richiesti.

<a id="a062"></a>
## A062 — Voce di sistema e voce maschile sono alternative non documentate a Serena HIGH

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/voce/lettura.ts:27](<../../../src/voce/lettura.ts#L27>), [src/voce/bocca.ts:43](<../../../src/voce/bocca.ts#L43>), [src/voce/piper.ts:28](<../../../src/voce/piper.ts#L28>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:44](<../../../docs/L04-aspetti_tecnici.md#L44>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Voce dell’assistente Piper Serena HIGH.

**Effettivo:** Browser TTS parla finché Piper non è pronto o fallisce; scelta maschile Riccardo; scoring privilegia voci online.

**Divergenza:** Voce di sistema e voce maschile sono alternative non documentate a Serena HIGH.

**Impatto:** Identità/qualità voce variabili; possibile uso di sintesi non locale da decidere.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire esplicitamente fallback e privacy oppure limitare al percorso previsto. Non è stato verificato traffico di sintesi online.

<a id="a063"></a>
## A063 — Coda vocale omette risposte e può ripartire dopo silenzio

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/voce/turno.ts:75](<../../../src/voce/turno.ts#L75>), [src/voce/turno.ts:112](<../../../src/voce/turno.ts#L112>), [src/voce/lettura.ts:77](<../../../src/voce/lettura.ts#L77>), [src/modello/motore.ts:663](<../../../src/modello/motore.ts#L663>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>), [docs/design/L2 - INPUT.dc.html:548](<../../../docs/design/L2 - INPUT.dc.html#L548>).

**Previsto:** Canale vocale coerente con lo scambio scritto; comando di silenzio effettivo.

**Effettivo:** riepiloga tiene solo ultimo testo/domanda; lettura controlla accesa solo in ingresso. giro può superare viaLibera dopo svuota e chiamare comunque dillo.

**Divergenza:** Coda vocale omette risposte e può ripartire dopo silenzio.

**Impatto:** Risposte perse in voce, audio residuo dopo spegnimento.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Associare coda ai turni, rivalutare accesa e cancellazione prima di parlare, esplicitare eventuale sintesi delle risposte.

<a id="a064"></a>
## A064 — Campanello punta a un asset inesistente e ignora system-storage

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/voce/suono.ts:16](<../../../src/voce/suono.ts#L16>), [src/conoscenza/profilo.ts:261](<../../../src/conoscenza/profilo.ts#L261>), [vite.config.ts:687](<../../../vite.config.ts#L687>).

**Riferimento documentale:** [docs/L03-archivio.md:38](<../../../docs/L03-archivio.md#L38>).

**Previsto:** Suono predefinito Archivio/system-storage/campanello.mp3.

**Effettivo:** Default /media/suoni/notifica.mp3 assente; endpoint archivio rifiuta system-storage; errori audio assorbiti.

**Divergenza:** Campanello punta a un asset inesistente e ignora system-storage.

**Impatto:** Nessun campanello nella configurazione predefinita.

**Evidenza:** http-test.log: default restituisce HTML, non audio; /archivio/system-storage/campanello.mp3 restituisce400.

**Correzione necessaria:** Servire in modo esplicito il solo asset di sistema previsto e usarlo come default.

<a id="a065"></a>
## A065 — Download vocale non fissato a revisione e caricamento anche con lettura spenta

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/voce/piper.ts:40](<../../../src/voce/piper.ts#L40>), [src/voce/piper.ts:76](<../../../src/voce/piper.ts#L76>), [src/voce/lettura.ts:65](<../../../src/voce/lettura.ts#L65>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:44](<../../../docs/L04-aspetti_tecnici.md#L44>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Piper documentato; politiche di acquisizione modello e avvio da definire.

**Effettivo:** Modelli scaricati da Hugging Face resolve/main; prepara chiamato sempre, senza condizione lettura.

**Divergenza:** Download vocale non fissato a revisione e caricamento anche con lettura spenta.

**Impatto:** Dipendenza di rete/versione implicita e costo di caricamento anche quando la voce non serve.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Documentare/distribuire versione e politica cache/caricamento; validare gli errori HTTP.

<a id="a066"></a>
## A066 — Banco d’ascolto bloccato da errore di sintassi

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [strumenti/banco-ascolto.html:311](<../../../strumenti/banco-ascolto.html#L311>).

**Riferimento documentale:** [strumenti/LEGGIMI.md:11](<../../../strumenti/LEGGIMI.md#L11>).

**Previsto:** Banco apribile e funzionante per confrontare voci.

**Effettivo:** Stringa single-quoted contiene backslash duplicato prima dell’apostrofo, termina la stringa e produce SyntaxError.

**Divergenza:** Banco d’ascolto bloccato da errore di sintassi.

**Impatto:** Nessuno script del banco viene eseguito.

**Evidenza:** script-check.json: node --check sullo script estratto, Unexpected identifier è; altri3 script sintatticamente validi.

**Correzione necessaria:** Correggere quoting e aggiungere controllo sintattico degli script delle pagine.

<a id="a067"></a>
## A067 — Preparazione voce dichiara successo anche con binari mancanti

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [strumenti/prepara-voce.mjs:23](<../../../strumenti/prepara-voce.mjs#L23>).

**Riferimento documentale:** [pubblico/LEGGIMI.md:1](<../../../pubblico/LEGGIMI.md#L1>), [docs/L04-aspetti_tecnici.md:44](<../../../docs/L04-aspetti_tecnici.md#L44>).

**Previsto:** Asset necessari presenti per voce funzionante.

**Effettivo:** File assenti saltati con continue e uscita0; stampa pronta anche con0 file.

**Divergenza:** Preparazione voce dichiara successo anche con binari mancanti.

**Impatto:** Installazione incompleta apparentemente riuscita; guasto scoperto soltanto al runtime.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Verificare tutti gli asset richiesti, fallire o dichiarare stato parziale. Nella copia audit sono stati copiati correttamente5 file.

<a id="a068"></a>
## A068 — Test codificano il modello legacy e la suite fallisce

**Categoria:** `TEST_MISMATCH` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/prova/scenario.ts:1](<../../../src/prova/scenario.ts#L1>), [src/prova/stato.ts:1](<../../../src/prova/stato.ts#L1>), [src/prova/alfabeto.ts:1](<../../../src/prova/alfabeto.ts#L1>), [src/prova/flussi.ts:1](<../../../src/prova/flussi.ts#L1>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:38](<../../../docs/L01-struttura_e_task.md#L38>), [docs/L01-struttura_e_task.md:58](<../../../docs/L01-struttura_e_task.md#L58>), [docs/L04-aspetti_tecnici.md:23](<../../../docs/L04-aspetti_tecnici.md#L23>).

**Previsto:** Test derivati dai requisiti attuali, incluso invio differito e percorsi attuali.

**Effettivo:** Test basati su CARTA/MEMORIA/ORARIO, invio prima di undo, seme e storage precedenti;3 verifiche falliscono.

**Divergenza:** Test codificano il modello legacy e la suite fallisce.

**Impatto:** Una suite verde dopo correzioni cosmetiche potrebbe ancora proteggere comportamenti non conformi.

**Evidenza:** scenario.log e scenario-npm.log:2 errori seme e1 path Windows atteso storage/foresta.jpg contro /archivio/user_123/filesystem/Home/foresta.jpg.

**Correzione necessaria:** Ricostruire matrice requisiti-test e sostituire aspettative obsolete; coprire Delay, confini e concorrenza.

<a id="a069"></a>
## A069 — Scia attribuisce ai cambiamenti la mossa precedente

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/prova/scia.ts:51](<../../../src/prova/scia.ts#L51>), [src/ai-engine/ai-engine.ts:145](<../../../src/ai-engine/ai-engine.ts#L145>), [src/modello/motore.ts:448](<../../../src/modello/motore.ts#L448>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>).

**Previsto:** Diagnostica deve rappresentare causalità reale; nessun contratto attuale della scia in docs.

**Effettivo:** chiama modifica e notifica prima di m.segna; Scia legge il registro precedente. Oltre24 mosse la lunghezza non cresce più.

**Divergenza:** Scia attribuisce ai cambiamenti la mossa precedente.

**Impatto:** Il banco fornisce evidenze di causalità ingannevoli.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Registrare ID/evento causale con la transizione, senza inferirlo dalla lunghezza di una coda limitata.

<a id="a070"></a>
## A070 — Prove interattive non attendono il turno AI

**Categoria:** `TEST_MISMATCH` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [src/main.ts:323](<../../../src/main.ts#L323>), [src/prova/alfabeto.ts:84](<../../../src/prova/alfabeto.ts#L84>), [src/prova/pedana.ts:135](<../../../src/prova/pedana.ts#L135>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:73](<../../../docs/L01-struttura_e_task.md#L73>).

**Previsto:** Verifiche valutano l’esito dopo completamento della richiesta.

**Effettivo:** dillo è void e avvia turno asincrono; verifiche del banco leggono mosse/stato subito, mentre scenario usa turnoSubito.

**Divergenza:** Prove interattive non attendono il turno AI.

**Impatto:** Stessa prova può fallire o leggere esiti precedenti soltanto nel browser.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Restituire/attendere completamento con ID del turno; distinguere verifiche sincrone e asincrone.

<a id="a071"></a>
## A071 — Riferimenti documentali rimossi usati come autorità nei commenti

**Categoria:** `LEGACY_OR_UNKNOWN` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/modello/tipi.ts:1](<../../../src/modello/tipi.ts#L1>), [src/ai-engine/finto.ts:3](<../../../src/ai-engine/finto.ts#L3>), [src/archivio/archivio.ts:1](<../../../src/archivio/archivio.ts#L1>), [strumenti/LEGGIMI.md:37](<../../../strumenti/LEGGIMI.md#L37>).

**Riferimento documentale:** [README.md:11](<../../../README.md#L11>).

**Previsto:** docs attuali fonte di verità; riferimenti risolvibili.

**Effettivo:** 243 occorrenze candidate di docs numerati/percorsi non presenti; interi contratti citano docs/01-modello,07-memoria,08-voce ecc.

**Divergenza:** Riferimenti documentali rimossi usati come autorità nei commenti.

**Impatto:** Manutentore e test possono seguire decisioni non più disponibili.

**Evidenza:** broken-doc-refs.json conserva file/riga/target di ogni occorrenza; lista euristica da verificare per singolo link, non243 bug distinti.

**Correzione necessaria:** Mappare/rimuovere riferimenti dopo riallineamento; non ripristinare vecchie regole automaticamente.

<a id="a072"></a>
## A072 — Funzioni/stub legacy mantenuti senza consumatori di prodotto

**Categoria:** `LEGACY_OR_UNKNOWN` · **Severità:** Bassa · **Certezza:** forte evidenza

**File e posizione:** [src/conoscenza/profilo.ts:356](<../../../src/conoscenza/profilo.ts#L356>), [src/archivio/archivio.ts:330](<../../../src/archivio/archivio.ts#L330>), [src/confini/disco.ts:97](<../../../src/confini/disco.ts#L97>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:33](<../../../docs/L04-aspetti_tecnici.md#L33>), [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>).

**Previsto:** Un solo utente e memoria documentale nel prototipo.

**Effettivo:** utenteChiesto restituisce sempre undefined; salva/rilegge di Archivio no-op; API Disco di scrittura scollegata dal flusso Archivio corrente.

**Divergenza:** Funzioni/stub legacy mantenuti senza consumatori di prodotto.

**Impatto:** Nomi e interfacce suggeriscono capacità assenti.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Inventariare consumatori esterni prima di rimuovere; semplificare il contratto e distinguere stub futuri da funzionalità reali.

<a id="a073"></a>
## A073 — Orario lavorativo, profilo e filtri hardcoded fuori dalle preferenze

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/conoscenza/contesto.ts:23](<../../../src/conoscenza/contesto.ts#L23>), [src/confini/filtro.ts:20](<../../../src/confini/filtro.ts#L20>), [src/modello/motore.ts:276](<../../../src/modello/motore.ts#L276>).

**Riferimento documentale:** [docs/L03-archivio.md:49](<../../../docs/L03-archivio.md#L49>), [docs/L02-componenti.md:22](<../../../docs/L02-componenti.md#L22>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Preferenze e contesto dell’utente determinano funzionamento; dettagli non definiti richiedono decisione.

**Effettivo:** 8–19, progetti Acme/Aurora, criteri perTe/azionabile e tetto carte guidano filtro e memoria conversazionale; non derivano da focuses.

**Divergenza:** Orario lavorativo, profilo e filtri hardcoded fuori dalle preferenze.

**Impatto:** Perdita/visibilità del contesto e notifiche dipendono da regole non approvate.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire regole del prototipo e ricavarle dalla fonte prevista; non usare esempi di tavola come business rule.

<a id="a074"></a>
## A074 — Controlli cliccabili privi di semantica e accesso tastiera proprio

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:273](<../../../src/aree/schermo.ts#L273>), [src/aree/schermo.ts:640](<../../../src/aree/schermo.ts#L640>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:16](<../../../docs/L04-aspetti_tecnici.md#L16>), [docs/design/L0 - Sistema.md:112](<../../../docs/design/L0 - Sistema.md#L112>).

**Previsto:** Tastiera supportata; controlli interattivi identificabili e azionabili.

**Effettivo:** Indicatori e campanella sono div con click/dataset, senza ruolo/button/tabindex/key handler dedicato.

**Divergenza:** Controlli cliccabili privi di semantica e accesso tastiera proprio.

**Impatto:** Navigazione Tab e tecnologie assistive non identificano/azionano questi controlli; comandi testuali parziali non equivalgono al controllo.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Usare controlli semantici conservando il disegno e verificare tastiera; audit non certifica WCAG.

<a id="a075"></a>
## A075 — URL immagine interpolato in HTML senza escape dell’attributo

**Categoria:** `SECURITY` · **Severità:** Bassa · **Certezza:** forte evidenza

**File e posizione:** [src/conoscenza/profilo.ts:306](<../../../src/conoscenza/profilo.ts#L306>), [src/aree/schermo.ts:207](<../../../src/aree/schermo.ts#L207>), [src/aree/schermo.ts:923](<../../../src/aree/schermo.ts#L923>).

**Riferimento documentale:** [docs/L03-archivio.md:49](<../../../docs/L03-archivio.md#L49>), [docs/L04-aspetti_tecnici.md:31](<../../../docs/L04-aspetti_tecnici.md#L31>).

**Previsto:** Dati del profilo rappresentati come dati, non markup eseguibile.

**Effettivo:** nomeFile accetta stringhe http e src è interpolato senza esc; virgolette interne possono chiudere l’attributo.

**Divergenza:** URL immagine interpolato in HTML senza escape dell’attributo.

**Impatto:** Possibile HTML injection da file preferenze alterato; richiede controllo locale del documento, non è provata una via remota.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Creare nodo e assegnare src via proprietà con URL validato oppure escape corretto.

<a id="a076"></a>
## A076 — Payload HTTP senza limiti e classificazione errori troppo generica

**Categoria:** `BUG` · **Severità:** Media · **Certezza:** forte evidenza

**File e posizione:** [vite.config.ts:497](<../../../vite.config.ts#L497>), [vite.config.ts:722](<../../../vite.config.ts#L722>), [vite.config.ts:795](<../../../vite.config.ts#L795>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:31](<../../../docs/L04-aspetti_tecnici.md#L31>).

**Previsto:** Contratti validati; errori distinguibili. I limiti numerici non sono definiti dai docs.

**Effettivo:** Body accumulato senza limite; JSON/shape errati spesso diventano500/502; sincrone letture/scritture bloccano event loop su contenuti grandi.

**Divergenza:** Payload HTTP senza limiti e classificazione errori troppo generica.

**Impatto:** Esaurimento memoria/blocco del server locale con input grande; diagnosi errata degli errori client.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire limiti e schema degli endpoint; errori400/413 coerenti e I/O proporzionato.

<a id="a077"></a>
## A077 — Log secondario del testo conversazionale non documentato

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [vite.config.ts:605](<../../../vite.config.ts#L605>).

**Riferimento documentale:** [docs/L03-archivio.md:44](<../../../docs/L03-archivio.md#L44>), [docs/L04-aspetti_tecnici.md:26](<../../../docs/L04-aspetti_tecnici.md#L26>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Chat raw archivio esplicito degli scambi; altre destinazioni non definite.

**Effettivo:** console.info stampa frase integrale a ogni passo insieme ai contatori.

**Divergenza:** Log secondario del testo conversazionale non documentato.

**Impatto:** Copie del contenuto nei log terminale/host con durata e accesso non stabiliti.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere politica diagnostica e minimizzazione del testo; documentare l’eventuale copia.

<a id="a078"></a>
## A078 — Copia multipla di asset e strumenti non elencati coerentemente

**Categoria:** `LEGACY_OR_UNKNOWN` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [pubblico/volto.png:1](<../../../pubblico/volto.png#L1>), [docs/design/volto.png:1](<../../../docs/design/volto.png#L1>), [strumenti/LEGGIMI.md:3](<../../../strumenti/LEGGIMI.md#L3>), [strumenti/banco-voci.html:136](<../../../strumenti/banco-voci.html#L136>).

**Riferimento documentale:** [docs/L03-archivio.md:38](<../../../docs/L03-archivio.md#L38>), [strumenti/LEGGIMI.md:9](<../../../strumenti/LEGGIMI.md#L9>).

**Previsto:** Asset di sistema e strumenti chiaramente inventariati.

**Effettivo:** Volto duplicato; campanello duplicato nel public con nome diverso; LEGGIMI parla di due pagine ma ne elenca tre ed esiste anche banco-voci.

**Divergenza:** Copia multipla di asset e strumenti non elencati coerentemente.

**Impatto:** Ambiguità su asset canonico e strumenti supportati.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Indicare asset canonici, copie intenzionali e inventario aggiornato; nessuna cancellazione automatica durante audit.

<a id="a079"></a>
## A079 — Legge delle bolle contraddetta dalla Timeline e da descrizioni residue

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L0 - Sistema.md:60](<../../../docs/design/L0 - Sistema.md#L60>), [docs/design/L0 - Sistema.md:263](<../../../docs/design/L0 - Sistema.md#L263>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:60](<../../../docs/design/L0 - Sistema.md#L60>), [docs/design/L0 - Sistema.md:263](<../../../docs/design/L0 - Sistema.md#L263>), [docs/design/L2 - Bubble.dc.html:33](<../../../docs/design/L2 - Bubble.dc.html#L33>).

**Previsto:** Legge0: ogni contenuto leggibile in bolla, sola eccezione Systembar.

**Effettivo:** Lo stesso L0 definisce Timeline inchiostro diretto; Bubble conserva eccezioni mondo/cornice antecedenti alla revisione glass.

**Divergenza:** Legge delle bolle contraddetta dalla Timeline e da descrizioni residue.

**Impatto:** Non si può certificare conformità della Timeline rispetto a entrambe le regole.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere l’eccezione e aggiornare la norma o il componente. Il codice non decide la precedenza interna a L0.

<a id="a080"></a>
## A080 — Autonomia dei componenti incompatibile con la guida verticale condivisa

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L0 - Sistema.md:247](<../../../docs/design/L0 - Sistema.md#L247>), [src/aree/schermo.ts:157](<../../../src/aree/schermo.ts#L157>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:247](<../../../docs/design/L0 - Sistema.md#L247>), [docs/design/L0 - Sistema.md:263](<../../../docs/design/L0 - Sistema.md#L263>), [docs/design/L2 - Profilebar.dc.html:80](<../../../docs/design/L2 - Profilebar.dc.html#L80>).

**Previsto:** Niente contenitori/colonne condivise, scomparsa di un componente non muove altri.

**Effettivo:** L0 chiede anche Profilebar/Systembar che seguono l’altezza della Timeline a22px; codice implementa una guida flex.

**Divergenza:** Autonomia dei componenti incompatibile con la guida verticale condivisa.

**Impatto:** Impossibile soddisfare simultaneamente indipendenza e propagazione delle quote.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Specificare quali ancoraggi sono autonomi e quali dipendono dalla Timeline; non classificare la colonna automaticamente conforme.

<a id="a081"></a>
## A081 — Quote e posizioni discordanti fra norme, testo e scene

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L2 - Sidebar.dc.html:130](<../../../docs/design/L2 - Sidebar.dc.html#L130>), [docs/design/L2 - INPUT.dc.html:32](<../../../docs/design/L2 - INPUT.dc.html#L32>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:275](<../../../docs/design/L0 - Sistema.md#L275>), [docs/design/L0 - Sistema.md:291](<../../../docs/design/L0 - Sistema.md#L291>), [docs/design/L2 - Sidebar.dc.html:130](<../../../docs/design/L2 - Sidebar.dc.html#L130>), [docs/design/L2 - Sidebar.dc.html:150](<../../../docs/design/L2 - Sidebar.dc.html#L150>), [docs/design/L2 - INPUT.dc.html:32](<../../../docs/design/L2 - INPUT.dc.html#L32>), [docs/design/L0 - Sistema.md:285](<../../../docs/design/L0 - Sistema.md#L285>).

**Previsto:** Un ancoraggio verificabile per componente.

**Effettivo:** Sidebar132 nel testo e180 nella scena/L0; Systembar126 insieme a guida dinamica; INPUT centrato nel titolo ma a sinistra in L0/scene.

**Divergenza:** Quote e posizioni discordanti fra norme, testo e scene.

**Impatto:** Controlli al pixel senza criterio unico.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Tabella finale delle quote e marcatura delle scene superate; applicare gerarchia L0 dove risolve, segnalare conflitti interni.

<a id="a082"></a>
## A082 — Tipografia e icone: campioni non coerenti con leggi superiori

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L1 - Icone.dc.html:1](<../../../docs/design/L1 - Icone.dc.html#L1>), [docs/design/L2 - Bubble.dc.html:138](<../../../docs/design/L2 - Bubble.dc.html#L138>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:197](<../../../docs/design/L0 - Sistema.md#L197>), [docs/design/L0 - Sistema.md:206](<../../../docs/design/L0 - Sistema.md#L206>), [docs/design/L2 - Bubble.dc.html:138](<../../../docs/design/L2 - Bubble.dc.html#L138>), [docs/design/L2 - Profilebar.dc.html:70](<../../../docs/design/L2 - Profilebar.dc.html#L70>).

**Previsto:** Lucide14–16 e Manrope200/300/500; eccezione Deep600 esplicita.

**Effettivo:** Campioni/header usano19px e titoli600/27px; vecchie scene conservano pesi/misure diversi.

**Divergenza:** Tipografia e icone: campioni non coerenti con leggi superiori.

**Impatto:** Non tutte le misure del mockup possono essere considerate normative contemporaneamente.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Riconciliare campioni e regole; catalogare eccezioni esplicite senza estenderle ad altri testi.

<a id="a083"></a>
## A083 — Tavolozza descritta sia irrisolta sia già riconciliata

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L0 - Sistema.md:177](<../../../docs/design/L0 - Sistema.md#L177>), [docs/design/L1 - Moodboard.dc.html:163](<../../../docs/design/L1 - Moodboard.dc.html#L163>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:177](<../../../docs/design/L0 - Sistema.md#L177>), [docs/design/L1 - Moodboard.dc.html:163](<../../../docs/design/L1 - Moodboard.dc.html#L163>), [docs/design/Liquid glass.md:24](<../../../docs/design/Liquid glass.md#L24>).

**Previsto:** Un’unica palette approvata.

**Effettivo:** L0 rimanda a docs/11-aperte inesistente e palette vivida; Moodboard/revisioni la danno riconciliata.

**Divergenza:** Tavolozza descritta sia irrisolta sia già riconciliata.

**Impatto:** Dubbio sull’autorità degli override ancora implementati.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Rimuovere avviso superato o riaprire formalmente decisione con riferimenti esistenti.

<a id="a084"></a>
## A084 — Flusso visivo consegna/undo conserva la semantica precedente al Delay

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L2 - Bubble.dc.html:583](<../../../docs/design/L2 - Bubble.dc.html#L583>), [docs/design/L3 - Flusso task.dc.html:178](<../../../docs/design/L3 - Flusso task.dc.html#L178>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:58](<../../../docs/L01-struttura_e_task.md#L58>), [docs/design/L0 - Sistema.md:153](<../../../docs/design/L0 - Sistema.md#L153>), [docs/design/L2 - Bubble.dc.html:583](<../../../docs/design/L2 - Bubble.dc.html#L583>), [docs/design/L3 - Flusso task.dc.html:178](<../../../docs/design/L3 - Flusso task.dc.html#L178>).

**Previsto:** Delay prima della chiamata; nessuna promessa di ritiro dopo consegna reale.

**Effettivo:** Scene raccontano fatto6s e chip undo90s dopo consegna. La gerarchia risolve a favore del requisito superiore ma le scene restano fuorvianti.

**Divergenza:** Flusso visivo consegna/undo conserva la semantica precedente al Delay.

**Impatto:** Una realizzazione fedele alle scene riproduce il difetto A001.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Ridisegnare la sequenza visiva con conclusione, attesa Delay, invio e irrevocabilità distinti.

<a id="a085"></a>
## A085 — Focus mentre si parla contraddice l’ultima revisione INPUT

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L2 - Bubble.dc.html:768](<../../../docs/design/L2 - Bubble.dc.html#L768>), [docs/design/L2 - INPUT.dc.html:548](<../../../docs/design/L2 - INPUT.dc.html#L548>).

**Riferimento documentale:** [docs/design/L0 - Sistema.md:217](<../../../docs/design/L0 - Sistema.md#L217>), [docs/design/L2 - Bubble.dc.html:768](<../../../docs/design/L2 - Bubble.dc.html#L768>), [docs/design/L2 - INPUT.dc.html:548](<../../../docs/design/L2 - INPUT.dc.html#L548>).

**Previsto:** Durante acquisizione cambiano solo parole/raccolta; azioni dopo interpretazione.

**Effettivo:** Bubble/L3 descrivono fuoco immediato e aumento50% durante parola; INPUT finale dice nessuna bolla/fuoco prima del turno.

**Divergenza:** Focus mentre si parla contraddice l’ultima revisione INPUT.

**Impatto:** Timing e geometria non certificabili contro entrambe le scene.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Marcare superata la sequenza anticipata e uniformare le animazioni all’ultima decisione.

<a id="a086"></a>
## A086 — Notifiche future ancora descritte nel cassetto dopo trasferimento in Sidebar

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L2 - Notificationbar.dc.html:136](<../../../docs/design/L2 - Notificationbar.dc.html#L136>), [docs/design/L2 - Sidebar.dc.html:114](<../../../docs/design/L2 - Sidebar.dc.html#L114>).

**Riferimento documentale:** [docs/design/L2 - Notificationbar.dc.html:46](<../../../docs/design/L2 - Notificationbar.dc.html#L46>), [docs/design/L2 - Notificationbar.dc.html:136](<../../../docs/design/L2 - Notificationbar.dc.html#L136>), [docs/design/L2 - Sidebar.dc.html:114](<../../../docs/design/L2 - Sidebar.dc.html#L114>), [docs/L02-componenti.md:34](<../../../docs/L02-componenti.md#L34>).

**Previsto:** Notificationbar=mondo esterno, rinvii dell’utente in sidebar.

**Effettivo:** Regole residue del cassetto continuano a includere eventi futuri nella stessa lista.

**Divergenza:** Notifiche future ancora descritte nel cassetto dopo trasferimento in Sidebar.

**Impatto:** Due percorsi possibili, uno ancora implementato.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Distinguere evento esterno futuro da task rinviato e aggiornare testo, scene e casi di selezione.

<a id="a087"></a>
## A087 — Criteri di memoria selettiva e contratti tecnici restano da decidere

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [docs/L01-struttura_e_task.md:11](<../../../docs/L01-struttura_e_task.md#L11>), [docs/L05-design.md:1](<../../../docs/L05-design.md#L1>).

**Riferimento documentale:** [docs/L01-struttura_e_task.md:11](<../../../docs/L01-struttura_e_task.md#L11>), [docs/L03-archivio.md:45](<../../../docs/L03-archivio.md#L45>), [docs/L04-aspetti_tecnici.md:3](<../../../docs/L04-aspetti_tecnici.md#L3>).

**Previsto:** Le lacune devono essere dichiarate, senza usare implementazione come specifica.

**Effettivo:** Confine conoscenza utile esplicitamente aperto; L05 vuoto; mancano schemi API/errori, idempotenza, sovrapposizioni WorkMode, calendario, timezone, distribuzione e recupero chat.

**Divergenza:** Criteri di memoria selettiva e contratti tecnici restano da decidere.

**Impatto:** Diverse scelte del codice sono non determinabili e non automaticamente corrette.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decisioni umane e contratti minimi per prototipo; non segnalare come obbligatorie feature future non decise.

<a id="a088"></a>
## A088 — Generatore temi citato ma assente

**Categoria:** `DOC_MISSING_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [docs/design/temi.css:23](<../../../docs/design/temi.css#L23>), [docs/design/L1 - Temi.dc.html:87](<../../../docs/design/L1 - Temi.dc.html#L87>).

**Riferimento documentale:** [docs/design/L1 - Temi.dc.html:87](<../../../docs/design/L1 - Temi.dc.html#L87>), [docs/design/temi.css:23](<../../../docs/design/temi.css#L23>).

**Previsto:** Token rigenerabili con il generatore indicato dalla tavola.

**Effettivo:** strumenti/genera-temi.py non esiste fra file tracciati/non tracciati.

**Divergenza:** Generatore temi citato ma assente.

**Impatto:** Ricetta di generazione non riproducibile; CSS può divergere dalle tabelle.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Ripristinare il generatore o documentare correttamente il processo manuale approvato.

<a id="a089"></a>
## A089 — Fallback opaco dei mockup non copre il ramo scuro

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** forte evidenza

**File e posizione:** [docs/design/liquid-glass.css:42](<../../../docs/design/liquid-glass.css#L42>), [docs/design/materiali.css:13](<../../../docs/design/materiali.css#L13>).

**Riferimento documentale:** [docs/design/Liquid glass.md:16](<../../../docs/design/Liquid glass.md#L16>).

**Previsto:** In assenza backdrop o con trasparenza ridotta, fallback opaco coerente per i materiali.

**Effettivo:** Fallback modifica token su root; data-tema=scuro nei contenitori ridefinisce film trasparenti e ottiche.

**Divergenza:** Fallback opaco dei mockup non copre il ramo scuro.

**Impatto:** Scene scure ignorano fallback ereditato; documentazione eseguibile diversa dalla regola.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Applicare fallback anche ai rami materiale; verificare la cascata con media/supports simulati.

<a id="a090"></a>
## A090 — Interprete finto invia il task precedente anziché quello nominato

**Categoria:** `BUG` · **Severità:** Alta · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/finto.ts:77](<../../../src/ai-engine/finto.ts#L77>), [src/ai-engine/regole.ts:224](<../../../src/ai-engine/regole.ts#L224>), [src/ai-engine/regole.ts:264](<../../../src/ai-engine/regole.ts#L264>).

**Riferimento documentale:** [docs/L00-lo_scopo.md:42](<../../../docs/L00-lo_scopo.md#L42>), [docs/L01-struttura_e_task.md:23](<../../../docs/L01-struttura_e_task.md#L23>).

**Previsto:** Il destinatario dell’azione coincide con il task indicato dall’utente.

**Effettivo:** Accoda al_centro sul task nominato ma interpreta prima di eseguirlo, quindi consegna contiene l’ID del vecchio focus.

**Divergenza:** Interprete finto invia il task precedente anziché quello nominato.

**Impatto:** Invio del contenuto sbagliato quando è attivo il fallback.

**Evidenza:** races.log: manda Messaggio mamma produce al_centro t1 e consegna t2, con named=t1 e focused=t2.

**Correzione necessaria:** Risolvere il bersaglio esplicito prima della traduzione; evitare dipendenza dall’esecuzione futura di al_centro.

<a id="a091"></a>
## A091 — Servizi simulati assumono date e identità delle operazioni non presenti nel contratto

**Categoria:** `UNDOCUMENTED_IMPLEMENTATION` · **Severità:** Media · **Certezza:** fatto verificato

**File e posizione:** [src/confini/calendario.ts:68](<../../../src/confini/calendario.ts#L68>), [src/confini/promemoria.ts:110](<../../../src/confini/promemoria.ts#L110>), [src/confini/contatti.ts:35](<../../../src/confini/contatti.ts#L35>), [src/confini/note.ts:1](<../../../src/confini/note.ts#L1>).

**Riferimento documentale:** [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>), [docs/L03-archivio.md:48](<../../../docs/L03-archivio.md#L48>).

**Base autorizzativa:** i riferimenti definiscono il perimetro funzionale, non autorizzano il dettaglio descritto. Nessun contratto specifico rintracciato nel corpus attuale `docs/`; commenti legacy e test non sono stati usati come autorizzazione.

**Previsto:** Simulazione basata sui documenti; semantica delle future operazioni da definire.

**Effettivo:** Calendario registra consegna all’istante corrente; promemoria uguaglia testi per inclusione; contatti aggiunti senza recapito; note appendono stringhe.

**Divergenza:** Servizi simulati assumono date e identità delle operazioni non presenti nel contratto.

**Impatto:** Le risposte fatto non equivalgono a creare l’evento/data/contatto richiesto; fixture diventano regole implicite.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Definire il contratto minimo delle simulazioni e distinguere dimostrazione, lettura contesto e operazione futura.

<a id="a092"></a>
## A092 — Documenti utente tracciati senza distinzione operativa fra fixture e dati reali

**Categoria:** `DOCUMENTATION_AMBIGUITY` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [.gitignore:12](<../../../.gitignore#L12>), [Archivio/users/user_123/preferences.txt:1](<../../../Archivio/users/user_123/preferences.txt#L1>).

**Riferimento documentale:** [docs/L03-archivio.md:41](<../../../docs/L03-archivio.md#L41>), [docs/L03-archivio.md:49](<../../../docs/L03-archivio.md#L49>), [docs/L04-aspetti_tecnici.md:22](<../../../docs/L04-aspetti_tecnici.md#L22>).

**Previsto:** Dati fittizi del prototipo distinti da dati locali reali; password locale non inviata all’AI.

**Effettivo:** File profilo/sistema/servizi/media sono tracciati; soltanto chat-raw è ignorata. Non è specificato come sostituire fixture con dati personali evitando commit.

**Divergenza:** Documenti utente tracciati senza distinzione operativa fra fixture e dati reali.

**Impatto:** Uso successivo può introdurre dati locali nel repository; nessuna esposizione reale è stata dedotta dai valori fittizi.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Decidere politica fixture/locali e procedura di personalizzazione. Nessun valore di password è riportato negli artefatti audit.

<a id="a093"></a>
## A093 — Nomi chip non vincolati a due parole e dato non protetto dall’overflow

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/aree/schermo.ts:318](<../../../src/aree/schermo.ts#L318>), [src/modello/motore.ts:346](<../../../src/modello/motore.ts#L346>), [src/stile/base.css:342](<../../../src/stile/base.css#L342>).

**Riferimento documentale:** [docs/design/L2 - Sidebar.dc.html:55](<../../../docs/design/L2 - Sidebar.dc.html#L55>), [docs/design/L2 - Sidebar.dc.html:64](<../../../docs/design/L2 - Sidebar.dc.html#L64>).

**Previsto:** Nome massimo due parole; se lungo, tagliare il dato e non il nome.

**Effettivo:** Template mostra nome integrale non normalizzato; fixture contengono più parole; nessuna politica dedicata di overflow del dato.

**Divergenza:** Nomi chip non vincolati a due parole e dato non protetto dall’overflow.

**Impatto:** Chip possono invadere spazio riservato; denominazione non segue il vocabolario breve richiesto.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Generare nome breve separato dal titolo completo e applicare overflow al solo dato.

<a id="a094"></a>
## A094 — Systembar mono10px contro misura dichiarata11px

**Categoria:** `DOC_CODE_MISMATCH` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/stile/base.css:309](<../../../src/stile/base.css#L309>).

**Riferimento documentale:** [docs/design/L2 - Systembar.dc.html:30](<../../../docs/design/L2 - Systembar.dc.html#L30>).

**Previsto:** Valori Systembar in monospaziato11px.

**Effettivo:** CSS applica10px; la tavola Timeline usa a sua volta10px, ulteriore incoerenza fra campioni.

**Divergenza:** Systembar mono10px contro misura dichiarata11px.

**Impatto:** Piccola divergenza di leggibilità/scala.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Allineare tavole e misura canonica prima della correzione; non dedurre11 dal codice.

<a id="a095"></a>
## A095 — Raccontami chi sono non dispone della vista profilo descritta

**Categoria:** `PARTIAL_IMPLEMENTATION` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [src/ai-engine/strumenti.ts:67](<../../../src/ai-engine/strumenti.ts#L67>), [src/aree/schermo.ts:430](<../../../src/aree/schermo.ts#L430>).

**Riferimento documentale:** [docs/design/L2 - Profilebar.dc.html:80](<../../../docs/design/L2 - Profilebar.dc.html#L80>).

**Previsto:** Profilo esteso raccontato in una bolla Desk con ritratto54px.

**Effettivo:** Risposta testuale generica possibile via parla, ma nessun task/vista dedicata al profilo né anatomia ritratto54.

**Divergenza:** Raccontami chi sono non dispone della vista profilo descritta.

**Impatto:** La scena/azione documentata non è realizzata; qualità del testo AI non verificata.

**Evidenza:** Analisi statica dei punti indicati; confronto con il contratto citato.

**Correzione necessaria:** Implementare la presentazione prevista o qualificare esplicitamente la scena come futura.

<a id="a096"></a>
## A096 — Due dichiarazioni CSS delle tavole sono sintatticamente invalide

**Categoria:** `BUG` · **Severità:** Bassa · **Certezza:** fatto verificato

**File e posizione:** [docs/design/L2 - Sidebar.dc.html:192](<../../../docs/design/L2 - Sidebar.dc.html#L192>), [docs/design/L2 - INPUT.dc.html:507](<../../../docs/design/L2 - INPUT.dc.html#L507>).

**Riferimento documentale:** [docs/design/L2 - Sidebar.dc.html:192](<../../../docs/design/L2 - Sidebar.dc.html#L192>), [docs/design/L2 - INPUT.dc.html:507](<../../../docs/design/L2 - INPUT.dc.html#L507>).

**Previsto:** Campioni renderizzabili secondo le misure indicate.

**Effettivo:** margin-bottom:15px, 0 0 0 18px rgba(...), e margin-top:14px, 0 0 0 16px rgba(...) usano valori da ombra non ammessi nei margini.

**Divergenza:** Due dichiarazioni CSS delle tavole sono sintatticamente invalide.

**Impatto:** Browser scarta le dichiarazioni; scena non rappresenta l’intenzione del markup.

**Evidenza:** Estrazione completa degli attributi style: html-style-values.json; valori individuati nelle due righe originali.

**Correzione necessaria:** Separare margin e box-shadow nei due attributi; verificare layout.
