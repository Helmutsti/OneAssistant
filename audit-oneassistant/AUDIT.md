# Audit OneAssist — distanza fra documentazione e implementazione

**Esito: implementazione sostanzialmente divergente dal contratto corrente.** Analisi statica del repository e riproduzioni locali completate sul perimetro sotto indicato. Non è una dichiarazione di verifica integrale del runtime o di assenza di altri difetti.

Snapshot: commit `07d64e17c854e6584a207314d851e348aeec4052`, 22 settembre 2026 (Europe/Rome). **106 file**, di cui **29 in docs/** e **45 in src/**; **96 finding**, **112 voci documentali**, **40 contratti tool**. Gravità: **24 alte, 48 medie, 24 basse**. Il conteggio è per anomalia/root cause, non per riga di codice; un finding può avere più manifestazioni esplicitate.

**Nessuna modifica al repository.** Installazione, build, prove e scritture sintetiche eseguite in `/tmp/oneassist-audit/repo`. Hash iniziali/finali e `git status` nel [controllo di immutabilità](<evidenze/verifica-immutabilita.json>). Nessuna chiamata OpenRouter o consegna a servizi esterni; nessun uso di chiavi API. Installate dipendenze npm solo nella copia, con script automatici inizialmente disabilitati; script voce revisionato ed eseguito successivamente nella copia.

## Documenti consultabili

- [Registro completo dei finding](<finding.md>) — tutti i campi richiesti, posizioni, evidenze, correzioni e certezza.
- [Matrice documentazione → codice](<matrice-documentazione-codice.md>) — requisiti, implementazioni, stato e finding.
- [Matrice codice → documentazione](<matrice-codice-documentazione.md>) — tutti i file e tutti i40 tool.
- [Inventario file per file](<inventario.md>) — responsabilità e tipo di verifica.
- [Configurazioni, dipendenze e percorsi alternativi](<configurazioni-e-percorsi.md>).
- Dati filtrabili: [finding.json](<finding.json>), [matrice-documentazione-codice.csv](<matrice-documentazione-codice.csv>), [matrice-codice-documentazione.csv](<matrice-codice-documentazione.csv>), [contratti-tool.csv](<contratti-tool.csv>), [inventario.csv](<inventario.csv>).

## Modello previsto, ricostruito prima del giudizio sul codice

Il prototipo è un sito React/Vite/Tailwind su Node24, per il solo utente `user_123`. Input da tastiera; OpenRouter interpreta il prompt. Memoria e servizi sono documenti fittizi dell’utente, non integrazioni reali o memoria selettiva automatica. La chat raw è invece persistenza reale, integrale, separata e giornaliera in JSONL. Password locale esclusa dal contesto AI. File accessibili tramite Node entro il perimetro dell’utente; filesystem sempre disponibile.

Per le richieste operative, richiesta e contesto danno origine a task con quattro stati: T_NUOVO → T_LAVORAZIONE → T_ATTESA/T_CONCLUSIONE; da attesa si riprende con input aggiornato. Possono nascere sotto-task autonomi. Una semplice domanda può restare uno scambio, secondo la revisione finale INPUT; non ogni frase deve produrre una bolla.

Ogni invio/pubblicazione verso servizi attende90 secondi prima della chiamata effettiva. Durante l’attesa l’utente può fermarlo e modificarlo. Bypass solo esplicito per quel singolo invio, immediato e definitivo. Le letture non sono soggette a Delay.

Task in Desk o Sidebar, notifiche esterne separate e promosse soltanto dall’utente. Timeline: lavoro attuale/prossimo e tempo libero. Profilebar: tempo, luogo e WorkMode. Systembar: stato simulato della macchina. INPUT: parole, raccolta e scambio. Il design usa ricetta Liquid glass condivisa, materiale chiaro/scuro, dodici tinte, geometrie e animazioni stabilite nelle tavole.

Gerarchia applicata: decisioni di scope correnti e norme L0, poi L1/L2/L3/L4; revisioni esplicite possono superare il contenuto storico della stessa tavola. Conflitti **interni** non risolti dal testo sono registrati, senza usare il codice come arbitro. `tasks/` è stato dei lavori, non fonte alternativa di requisiti. Commenti che rimandano ai documenti rimossi sono indizi di legacy, non autorizzazioni.

## Distanze principali

- **Invio e annullamento:** A001–A002, A012–A013. La chiamata avviene subito e il successivo annullamento può dichiarare falsamente che nulla è uscito.
- **Confine file:** A032–A033. Attraversamento dei percorsi confermato con dati sintetici oltre memory e oltre user_123.
- **Concorrenza e targeting:** A014 e A090. Risposte abbinate alla domanda sbagliata; interprete finto che invia il task precedentemente a fuoco.
- **Modello e notifiche:** A003–A011. Stati/luoghi legacy, notifiche automaticamente task, rinvii senza ripresa alla scadenza.
- **Fonte dei dati e configurazione:** A023–A031. Rubrica hardcoded distinta dai documenti; preferenze ignorate; filesystem e WorkMode incompleti.
- **Architettura e design:** A038, A045–A061. React/Tailwind assenti, materiale corrente non adottato, interazioni e viste non allineate.

## Verifiche eseguite

Istruzioni e condizioni delle riproduzioni: [LEGGIMI evidenze](<evidenze/LEGGIMI.md>).

| Verifica | Risultato | Evidenza |
| --- | --- | --- |
| Build TypeScript + Vite nella copia | Superata, con warning URL eSpeak, modulo Node esternalizzato e bundle623kB | [evidenze/build.log](<evidenze/build.log>) |
| Suite via npm run scenario | Fallita:3 asserzioni, due fixture seme obsolete e un percorso Windows precedente | [evidenze/scenario-npm.log](<evidenze/scenario-npm.log>) |
| Stessa suite via Node24 transform-types | Stessi3 fallimenti | [evidenze/scenario.log](<evidenze/scenario.log>) |
| Delay, duplicati, callback dopo abbandono, undo tardivo, rinvio, tool invalidi, contatti, preferenze | Riproduzioni isolate con servizi stub e orologio simulato | [evidenze/reproduce.json](<evidenze/reproduce.json>) |
| Turni concorrenti e task nominato vs focus precedente | Errori riprodotti | [evidenze/races.log](<evidenze/races.log>) |
| GET/POST archivio con percorsi sintetici |200 fuori perimetro; scritture verificate | [evidenze/http-test.log](<evidenze/http-test.log>) |
| Asset campanello | Default restituisce HTML; percorso canonico rifiutato | [evidenze/http-test.log](<evidenze/http-test.log>) |
| Chat raw | Due messaggi sintetici salvati; ordine timestamp non controllato | [evidenze/http-test.log](<evidenze/http-test.log>) |
| Script inline delle4 pagine strumenti |1 errore sintattico nel banco ascolto;3 validi | [evidenze/script-check.json](<evidenze/script-check.json>) |
| Preparazione voce | Copiati5 asset nella copia | [evidenze/voice-setup.log](<evidenze/voice-setup.log>) |
| TODO/FIXME/HACK/XXX | Nessuna occorrenza letterale nei file testuali cercati; questo non esclude debito tecnico | [evidenze/todo-scan.txt](<evidenze/todo-scan.txt>) |
| Riferimenti legacy ai documenti |243 occorrenze candidate registrate con file/riga | [evidenze/broken-doc-refs.json](<evidenze/broken-doc-refs.json>) |

Il primo tentativo npm con `--prefix` è fallito per risoluzione dell’installazione; il tentativo nel cwd corretto è stato bloccato dal DNS sandbox. L’installazione autorizzata nella copia è poi riuscita. **Non** sono stati classificati questi ostacoli ambientali come bug del lockfile. La build non prova correttezza funzionale. Nessun risultato positivo della suite è stato assunto come prova documentale.

## Seconda passata anti-omissione

Riesaminati inventario completo, riferimenti e confini fra file, percorsi default/alternativi, configurazioni, tutti i40 tool, errori/callback/timer, fixture/test, script e asset. Gli scanner di supporto sono [evidenze/second-pass-paths.txt](<evidenze/second-pass-paths.txt>) e [evidenze/symbols.txt](<evidenze/symbols.txt>); non sostituiscono la lettura e il confronto.

| Controllo | Esito tracciato |
| --- | --- |
| Requisiti senza implementazione | Bypass, T_NUOVO, sotto-task autonomi, filesystem assistente, WorkMode, materiale scuro, +N, timer e profilo esteso |
| Codice senza contratto | Regex fallback, abitudini/semantica temporanea, gruppi/lotti/parametri, POST memoria, diagnostica, fallback voce e log |
| Percorsi alternativi | conCassetto off/on, frasi sotto/input/input-fisso, sync/async, OpenRouter messages/chat/finto, Piper/browser |
| Configurazioni/feature flag | Registro separato; assenza di schema comune e valori impliciti documentati |
| Legacy/inutilizzato | Ramo nativo false, phonemizer, stub, seme nei commenti/test, vecchie quote e contratti rimossi |
| TODO/FIXME/HACK | Nessuna occorrenza letterale; legacy individuato anche senza marker |
| Test non documentati | Stato legacy, undo dopo consegna, banco asincrono, causa Scia |
| Integrazioni/dipendenze |86 entry dipendenza nel lock;4 dirette runtime,2 dev; nessuna integrazione esterna reale provata |
| Edge case | Concorrenza, consegne doppie/tardive, indici frazionari/null, substring contatti, ordine notifiche, percorsi traversali |
| Impliciti/fallback | Default profilo, voce browser, tre errori→finto permanente, ritardi fissi, perdita raw, errori soppressi |

La seconda passata ha corretto un sospetto iniziale: **general.txt è letto correttamente**. Il problema residuo riguarda l’indicizzazione della raccolta e i test che scrivono seme.txt. Ha inoltre aggiunto il targeting errato del fallback e due dichiarazioni CSS invalide nelle tavole. Nessun finding è basato sul presupposto che il codice corrente sia intenzionale.

## Implementazioni mancanti, extra, divergenze e bug

Gli elenchi qui sotto sono viste del registro unico, non finding aggiuntivi. Una anomalia può riguardare più dimensioni; categoria primaria e dettagli nel registro.

### Mancanti e parziali

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A002](<finding.md#a002>) | Alta | Bypass esplicito per singolo invio assente |
| [A004](<finding.md#a004>) | Alta | Richiesta e contesto non formano sistematicamente un task |
| [A010](<finding.md#a010>) | Media | Notifiche senza contratto completo di mittente, oggetto e ora |
| [A016](<finding.md#a016>) | Media | Aspetta non interrompe la lavorazione pendente |
| [A020](<finding.md#a020>) | Media | Turni senza risposta a limite passi, output vuoto o fetch sospeso |
| [A021](<finding.md#a021>) | Media | Secondari sempre simulati e non autonomi |
| [A025](<finding.md#a025>) | Alta | Filesystem obbligatorio non collegato al flusso dei servizi |
| [A028](<finding.md#a028>) | Alta | Contesto AI privo delle preferenze stabili dell’utente |
| [A031](<finding.md#a031>) | Media | WorkMode e riconoscimento dei luoghi registrati assenti |
| [A034](<finding.md#a034>) | Alta | Chat raw può perdere messaggi senza blocco o recupero |
| [A035](<finding.md#a035>) | Media | Ordine cronologico della chat raw non garantito |
| [A039](<finding.md#a039>) | Alta | Build e preview non includono il backend del prototipo |
| [A040](<finding.md#a040>) | Bassa | Node 24 non vincolato e script scenario dipendente da esbuild transitivo |
| [A046](<finding.md#a046>) | Media | Materiale scuro non implementato nell’applicazione |
| [A049](<finding.md#a049>) | Media | Sidebar tronca oltre quattro elementi senza +N |
| [A053](<finding.md#a053>) | Media | Contenuti lunghi e apertura interna non seguono il contratto di una sola cosa |
| [A055](<finding.md#a055>) | Media | Tempi di conclusione e riposo automatico della bolla mancanti |
| [A057](<finding.md#a057>) | Media | Raccolta limitata a nomi già noti e senza selezione completa documentata |
| [A088](<finding.md#a088>) | Bassa | Generatore temi citato ma assente |
| [A093](<finding.md#a093>) | Bassa | Nomi chip non vincolati a due parole e dato non protetto dall’overflow |
| [A095](<finding.md#a095>) | Bassa | Raccontami chi sono non dispone della vista profilo descritta |

### Implementazioni non documentate

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A019](<finding.md#a019>) | Alta | Fallback permanente e silenzioso a interprete finto |
| [A026](<finding.md#a026>) | Media | Memoria semantica temporanea e abitudini automatiche non autorizzate |
| [A037](<finding.md#a037>) | Media | Scrittura memoria HTTP attiva benché la memoria intelligente sia sospesa |
| [A043](<finding.md#a043>) | Media | Parametri e API del motore non specificati nei documenti attuali |
| [A044](<finding.md#a044>) | Media | Diagnostica e fixture di sviluppo incluse nel prodotto senza separazione di build |
| [A062](<finding.md#a062>) | Media | Voce di sistema e voce maschile sono alternative non documentate a Serena HIGH |
| [A065](<finding.md#a065>) | Bassa | Download vocale non fissato a revisione e caricamento anche con lettura spenta |
| [A073](<finding.md#a073>) | Media | Orario lavorativo, profilo e filtri hardcoded fuori dalle preferenze |
| [A077](<finding.md#a077>) | Bassa | Log secondario del testo conversazionale non documentato |
| [A091](<finding.md#a091>) | Media | Servizi simulati assumono date e identità delle operazioni non presenti nel contratto |

### Divergenze e implementazioni conflittuali

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A001](<finding.md#a001>) | Alta | Delay applicato dopo la consegna, annullamento soltanto locale |
| [A003](<finding.md#a003>) | Alta | Modello di stati e luoghi rimasto al contratto precedente |
| [A005](<finding.md#a005>) | Media | Task terminati conservati e richiamabili come archivio operativo |
| [A006](<finding.md#a006>) | Alta | Notifiche trasformate automaticamente in task; modello corretto dietro flag spento |
| [A007](<finding.md#a007>) | Media | Notifiche silenziose perse nel percorso predefinito |
| [A008](<finding.md#a008>) | Media | Promozione rimuove la notifica originale |
| [A023](<finding.md#a023>) | Alta | Rubrica e servizi operativi indipendenti dai documenti di contesto |
| [A027](<finding.md#a027>) | Media | Raccolta non indicizza le entità del documento general.txt |
| [A036](<finding.md#a036>) | Bassa | Il testo originale viene normalizzato prima dell’archiviazione |
| [A038](<finding.md#a038>) | Alta | Stack React e Tailwind assente |
| [A045](<finding.md#a045>) | Media | Ricetta Liquid glass attuale non usata dall’applicazione |
| [A047](<finding.md#a047>) | Media | Override arbitrari dei colori semantici ammessi |
| [A048](<finding.md#a048>) | Media | Geometria e contenuto della Profilebar non aggiornati |
| [A050](<finding.md#a050>) | Bassa | Sidebar attenuata per qualsiasi focus anziché per raccolta |
| [A051](<finding.md#a051>) | Media | Bolle con geometria e gerarchia testuale precedenti |
| [A052](<finding.md#a052>) | Bassa | Max due punti colorati non garantito |
| [A056](<finding.md#a056>) | Media | INPUT mostra spinner e varianti di frasi non previste dall’ultima revisione |
| [A058](<finding.md#a058>) | Media | Sì e prima frase verde hanno effetti diversi nella composizione |
| [A068](<finding.md#a068>) | Alta | Test codificano il modello legacy e la suite fallisce |
| [A070](<finding.md#a070>) | Media | Prove interattive non attendono il turno AI |
| [A094](<finding.md#a094>) | Bassa | Systembar mono10px contro misura dichiarata11px |

### Bug tecnici e sicurezza

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A009](<finding.md#a009>) | Alta | Ordinale delle notifiche diverso dall’ordine mostrato |
| [A011](<finding.md#a011>) | Alta | Rinvio e arrivi futuri non tornano al lavoro alla scadenza |
| [A012](<finding.md#a012>) | Alta | Invii duplicati e completamenti asincroni dopo abbandono |
| [A013](<finding.md#a013>) | Alta | Annullamento senza scadenza e timer di invii precedenti ancora validi |
| [A014](<finding.md#a014>) | Alta | Risposte assegnate al turno sbagliato in conversazioni concorrenti |
| [A015](<finding.md#a015>) | Media | Scadenza INPUT calcolata dall’invio dell’utente, non dall’ultimo scambio |
| [A017](<finding.md#a017>) | Alta | Validazione dei tool incompleta e valori malformati accettati |
| [A018](<finding.md#a018>) | Media | Risultato API fatto non riflette esito o mancata esecuzione |
| [A022](<finding.md#a022>) | Media | Deleghe: errori soppressi e risultati in ordine di completamento |
| [A024](<finding.md#a024>) | Alta | Ricerca contatti per sottostringa senza disambiguazione |
| [A029](<finding.md#a029>) | Alta | Parser preferenze incompatibile con il file distribuito |
| [A030](<finding.md#a030>) | Media | Valori di sistema mancanti o malformati trasformati in dati inventati |
| [A032](<finding.md#a032>) | Alta | Attraversamento dei percorsi oltre utente e oltre memory |
| [A033](<finding.md#a033>) | Media | Symlink non considerati dal controllo di confinamento |
| [A054](<finding.md#a054>) | Media | Timer di uscita può eliminare una bolla tornata attiva |
| [A060](<finding.md#a060>) | Media | Timeline sceglie task conclusi e misura durata dall’ultimo tocco |
| [A061](<finding.md#a061>) | Bassa | Timeline disegna marcatori vecchi nell’inizio della giornata |
| [A063](<finding.md#a063>) | Media | Coda vocale omette risposte e può ripartire dopo silenzio |
| [A064](<finding.md#a064>) | Media | Campanello punta a un asset inesistente e ignora system-storage |
| [A066](<finding.md#a066>) | Media | Banco d’ascolto bloccato da errore di sintassi |
| [A067](<finding.md#a067>) | Bassa | Preparazione voce dichiara successo anche con binari mancanti |
| [A069](<finding.md#a069>) | Bassa | Scia attribuisce ai cambiamenti la mossa precedente |
| [A074](<finding.md#a074>) | Bassa | Controlli cliccabili privi di semantica e accesso tastiera proprio |
| [A075](<finding.md#a075>) | Bassa | URL immagine interpolato in HTML senza escape dell’attributo |
| [A076](<finding.md#a076>) | Media | Payload HTTP senza limiti e classificazione errori troppo generica |
| [A089](<finding.md#a089>) | Bassa | Fallback opaco dei mockup non copre il ramo scuro |
| [A090](<finding.md#a090>) | Alta | Interprete finto invia il task precedente anziché quello nominato |
| [A096](<finding.md#a096>) | Bassa | Due dichiarazioni CSS delle tavole sono sintatticamente invalide |

### Codice morto, legacy e origine incerta

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A041](<finding.md#a041>) | Bassa | Dipendenza phonemizer priva di riferimenti |
| [A042](<finding.md#a042>) | Bassa | Ramo provider nativo irraggiungibile e commenti multi-provider obsoleti |
| [A059](<finding.md#a059>) | Media | Controllo microfono reso interattivo ma non gestito e fuori scope |
| [A071](<finding.md#a071>) | Media | Riferimenti documentali rimossi usati come autorità nei commenti |
| [A072](<finding.md#a072>) | Bassa | Funzioni/stub legacy mantenuti senza consumatori di prodotto |
| [A078](<finding.md#a078>) | Bassa | Copia multipla di asset e strumenti non elencati coerentemente |

### Ambiguità documentali

| ID | Severità | Anomalia |
| --- | --- | --- |
| [A079](<finding.md#a079>) | Media | Legge delle bolle contraddetta dalla Timeline e da descrizioni residue |
| [A080](<finding.md#a080>) | Media | Autonomia dei componenti incompatibile con la guida verticale condivisa |
| [A081](<finding.md#a081>) | Media | Quote e posizioni discordanti fra norme, testo e scene |
| [A082](<finding.md#a082>) | Bassa | Tipografia e icone: campioni non coerenti con leggi superiori |
| [A083](<finding.md#a083>) | Bassa | Tavolozza descritta sia irrisolta sia già riconciliata |
| [A084](<finding.md#a084>) | Alta | Flusso visivo consegna/undo conserva la semantica precedente al Delay |
| [A085](<finding.md#a085>) | Media | Focus mentre si parla contraddice l’ultima revisione INPUT |
| [A086](<finding.md#a086>) | Media | Notifiche future ancora descritte nel cassetto dopo trasferimento in Sidebar |
| [A087](<finding.md#a087>) | Media | Criteri di memoria selettiva e contratti tecnici restano da decidere |
| [A092](<finding.md#a092>) | Bassa | Documenti utente tracciati senza distinzione operativa fra fixture e dati reali |

## Limiti e aree non verificabili in questa esecuzione

- Nessuna richiesta a OpenRouter: disponibilità effettiva del modello predefinito, formato remoto, latenza, costi, policy/cache e qualità delle risposte restano **non verificati**. Non sono state inventate incompatibilità del provider sulla base della data o del nome modello.
- Nessuna integrazione reale email/calendario/contatti: esplicitamente fuori scope del prototipo. I bug di invio sono provati al confine Servizio con stub/fixture, non con email reali.
- UI esaminata staticamente in template, CSS, token e script; **non** eseguita una matrice browser/OS/viewport, confronto screenshot pixel per pixel, screen reader o percezione delle animazioni. Race DOM, layout con molti contenuti e fallback ottico indicati con certezza adeguata. Contrasto finale sul wallpaper e collisioni del motore fisico richiedono verifica visiva.
- Modello Piper non scaricato/ascoltato per test di qualità; sono verificati codice, riferimenti e preparazione dei5 binari. Autoplay, pronuncia, prestazioni ONNX e memoria su diversi browser restano non verificati.
-7 asset binari analizzati per hash/formato/dimensione/collocazione/riferimenti, senza giudizio percettivo su immagini/audio. I media e documenti utente non sono copiati nel rapporto.
- Dipendenze: manifest, lock e integrazione/build esaminati. Non audit riga per riga del sorgente dei pacchetti di terzi, né consultazione di un database CVE corrente; nessuna affermazione di assenza di vulnerabilità transitive.
- Failure di disco pieno, spegnimento improvviso, concorrenza multiprocesso, exploit da origine remota e catene symlink non eseguiti. Le rispettive garanzie non sono state certificate.
- Nessuna cronologia Git precedente analizzata per ricostruire requisiti: sarebbe una fonte diversa da docs correnti. Dati fuori dall’albero di progetto, runtime già aperti altrove e configurazioni private non fanno parte di questo snapshot.

## Decisioni umane richieste

1. Confermare una sequenza unica conclusione → Delay → invio per tutte le tavole, con UX del bypass e significato preciso di aspetta distinto da no, aspetta.
2. Eliminare o approvare formalmente il modello legacy e i suoi gruppi/lotti/luoghi; definire task autonomi e lavori concorrenti senza usare gli enum attuali come requisito.
3. Adottare React/Tailwind come già deliberato, oppure modificare prima la decisione architetturale. L’audit non sceglie al posto del progetto.
4. Quali capacità locali di AI finto sono autorizzate? Il fallback deve bloccare, dichiararsi o consentire un sottoinsieme esplicito?
5. Quali scritture reali, oltre chat raw, sono permesse nel prototipo? Tenere endpoint memory e abitudini automatiche richiede una decisione separata.
6. Qual è lo schema unico di preferences/system/services/filesystem, incluse lettura/voce, luoghi, WorkMode e sovrapposizioni?
7. Risolvere conflitti L0 sulle bolle/Timeline e autonomia/guida; congelare quote, pesi, eccezioni cliccabili e scene superate.
8. Quali proposte della raccolta sono approvate e quali soltanto esplorazioni? Non trattarle tutte automaticamente come requisiti mancanti.
9. Specificare ordinamento, conservazione e promozione delle notifiche, distinguendo eventi futuri esterni da task rinviati.
10. Definire runtime supportato dopo build, robustezza della chat raw, timezone/sequenza/idempotenza e gestione del fallimento di salvataggio.
11. Approvare o eliminare voce browser/Riccardo, download da rete e log integrale dei prompt; definire politica fixture rispetto ai dati personali.
12. Criteri di memoria permanente selettiva restano futuri/aperti: non implementare una politica deducendola dalle strutture temporanee correnti.

**Chiusura del perimetro:** tutti i106 file dell’albero tracciato sono inventariati e sottoposti al tipo di analisi dichiarato; documentazione corrente e implementazione sono confrontate nelle due direzioni. Le verifiche dinamiche elencate sono quelle realmente eseguite. Le aree sopra non verificate restano aperte; questo rapporto non attesta conformità completa del progetto.
