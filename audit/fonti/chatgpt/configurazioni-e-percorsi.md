# Configurazioni, percorsi alternativi e dipendenze

Questa vista registra valori effettivi, non li promuove a requisiti. Costanti puramente implementative non sono automaticamente bug; quando manca una motivazione documentale lo stato resta non determinabile/richiede decisione (A043).

| Area | Configurazione effettiva | Posizione | Giustificazione/stato | Finding |
| --- | --- | --- | --- | --- |
| Utente | user_123 fisso | [vite.config.ts:48](<../../../vite.config.ts#L48>) | L04:33; conforme al perimetro, vincolo path non corretto | [A032](<finding.md#a032>) |
| Provider | OPENROUTER_API_KEY da .env/process.env | [vite.config.ts:211](<../../../vite.config.ts#L211>) | L04:19; unico provider attivo | [A042](<finding.md#a042>) |
| Modello | OPENROUTER_MODEL, default anthropic/claude-opus-5 | [vite.config.ts:188](<../../../vite.config.ts#L188>) | Provider previsto; modello/default non deciso in docs | [A043](<finding.md#a043>) |
| Dialetto | Prefisso anthropic/→messages; altri→chat/completions | [vite.config.ts:245](<../../../vite.config.ts#L245>) | Dettaglio di trasporto non formalizzato; remoto non verificato | [A043](<finding.md#a043>) |
| Cache/output AI | TTL1h, max_tokens4000 | [vite.config.ts:280](<../../../vite.config.ts#L280>) | Parametri non presenti nel contratto attuale | [A043](<finding.md#a043>) |
| Fallback AI | 503→finto permanente;3 errori→finto permanente | [src/ai-engine/ai-engine.ts:188](<../../../src/ai-engine/ai-engine.ts#L188>) | Non autorizzato dai docs della fase corrente | [A019](<finding.md#a019>) |
| Budget turno | 10 passi, nessun esito esplicito al limite | [src/ai-engine/ai-engine.ts:56](<../../../src/ai-engine/ai-engine.ts#L56>) | Non documentato; silenzio al limite | [A020](<finding.md#a020>) [A043](<finding.md#a043>) |
| Notifiche | conCassetto=false, toggle nel banco | [src/modello/motore.ts:109](<../../../src/modello/motore.ts#L109>) | Default opposto al componente documentato | [A006](<finding.md#a006>) [A007](<finding.md#a007>) |
| Varianti frasi | sotto/input/input-fisso; default sotto | [src/prova/pedana.ts:78](<../../../src/prova/pedana.ts#L78>) | Revisione INPUT esclude frasi operative interne | [A044](<finding.md#a044>) [A056](<finding.md#a056>) |
| Debug | Pedana, soloAdesso, blocco banco, scia, reset e iniezioni | [src/prova/pedana.ts:55](<../../../src/prova/pedana.ts#L55>) | Infrastruttura di prova inclusa nel bootstrap; scope non formalizzato | [A044](<finding.md#a044>) [A069](<finding.md#a069>) [A070](<finding.md#a070>) |
| Tempo Delay | 90s dopo consegna | [src/modello/motore.ts:42](<../../../src/modello/motore.ts#L42>) | Durata corretta, posizione del timer errata | [A001](<finding.md#a001>) [A013](<finding.md#a013>) |
| Tempo rinvio | 120min e preavviso15min | [src/modello/motore.ts:44](<../../../src/modello/motore.ts#L44>) | Rinvio previsto,2h non deliberate; ripresa assente | [A011](<finding.md#a011>) [A043](<finding.md#a043>) |
| Arrivo abbandonato | CARTA dopo60min→ORARIO | [src/modello/motore.ts:38](<../../../src/modello/motore.ts#L38>) | Meccanismo legacy non autorizzato | [A011](<finding.md#a011>) |
| Conversazione | 30s visibilità,6 scambi visibili; potatura per giornata/orario | [src/modello/motore.ts:87](<../../../src/modello/motore.ts#L87>) | 30s previsto; altri criteri non formalizzati | [A015](<finding.md#a015>) [A073](<finding.md#a073>) |
| Registro mosse | Massimo24 record, shift | [src/modello/motore.ts:448](<../../../src/modello/motore.ts#L448>) | Non documentato; rompe attribuzione Scia | [A069](<finding.md#a069>) |
| Abitudini | 3 prove; revoca/conferma; estratto max8 righe | [src/archivio/archivio.ts:67](<../../../src/archivio/archivio.ts#L67>) | Selezione automatica futura non ancora definita | [A026](<finding.md#a026>) |
| Profilo | Fallback Manuel/luogo/default macchina; parser chiavi libere | [src/conoscenza/profilo.ts:100](<../../../src/conoscenza/profilo.ts#L100>) | Fonte prevista preferences/system, default impliciti | [A029](<finding.md#a029>) [A030](<finding.md#a030>) [A073](<finding.md#a073>) |
| Orario | 8–19 e progetti Acme/Aurora nel contesto | [src/conoscenza/contesto.ts:30](<../../../src/conoscenza/contesto.ts#L30>) | Esempi non autorizzano business rule generalizzata | [A073](<finding.md#a073>) |
| Voce | Piper Serena HIGH; Riccardo maschile; browser fallback | [src/voce/piper.ts:28](<../../../src/voce/piper.ts#L28>) | Solo Serena HIGH esplicitamente prevista | [A062](<finding.md#a062>) |
| Acquisizione voce | Modelli Hugging Face resolve/main; eSpeak/ONNX | [src/voce/piper.ts:40](<../../../src/voce/piper.ts#L40>) | Piper previsto, download/versione e policy impliciti | [A065](<finding.md#a065>) |
| Campanello | /media/suoni/notifica.mp3;900ms antiripetizione;2.5s sblocco | [src/voce/suono.ts:16](<../../../src/voce/suono.ts#L16>) | Asset canonico diverso; soglie non documentate | [A064](<finding.md#a064>) [A043](<finding.md#a043>) |
| Layout fisico | Molle0.05, smorzamento0.67, repulsione0.18; memoria posizione1h | [src/aree/scrivania.ts:107](<../../../src/aree/scrivania.ts#L107>) | Memoria1h prevista, coefficienti implementativi non motivati come tali | [A051](<finding.md#a051>) [A043](<finding.md#a043>) |
| Larghezze | 388 riposo,452 focus,560 dentro | [src/aree/scrivania.ts:95](<../../../src/aree/scrivania.ts#L95>) | Conflitto con dimensioni da contenuto e scene +50% | [A051](<finding.md#a051>) [A085](<finding.md#a085>) |
| Animazioni DOM | Nascita520ms, rimozione700/1500ms, top volo132px | [src/aree/schermo.ts:352](<../../../src/aree/schermo.ts#L352>) | Coreografia/quote divergenti; timeout non invalidato | [A054](<finding.md#a054>) [A081](<finding.md#a081>) |
| Tema | data-colori + override CSS da tema; niente materiale scuro app | [src/stile/tema.ts:21](<../../../src/stile/tema.ts#L21>) | 12 palette sì; materiale/colore semantico parziali | [A045](<finding.md#a045>) [A046](<finding.md#a046>) [A047](<finding.md#a047>) |
| Server | Plugin configureServer; publicDir pubblico; target esnext | [vite.config.ts:882](<../../../vite.config.ts#L882>) | Vite previsto; runtime post-build non definito/implementato | [A039](<finding.md#a039>) |
| File archivio | GET lista memory/file; POST .md sovrascrive | [vite.config.ts:765](<../../../vite.config.ts#L765>) | Lettura entro utente prevista; API di scrittura non definita | [A032](<finding.md#a032>) [A033](<finding.md#a033>) [A037](<finding.md#a037>) |
| Chat raw | POST timestamp/role/text; giorno Europe/Rome; append sincrono | [vite.config.ts:713](<../../../vite.config.ts#L713>) | JSONL quotidiano previsto; timezone/ordine/error recovery non decisi | [A034](<finding.md#a034>) [A035](<finding.md#a035>) [A076](<finding.md#a076>) |
| Font | Google Fonts via index.html e tavole | [index.html:1](<../../../index.html#L1>) | Famiglie previste; dipendenza di rete non contrattualizzata | [A043](<finding.md#a043>) |
| Taratura | localStorage materia/taratura, clipboard, voci browser | [strumenti/taratura-materia.html:566](<../../../strumenti/taratura-materia.html#L566>) | Esplicitamente strumenti di prova; non autorità normativa | [A078](<finding.md#a078>) |

## Dipendenze dirette

| Pacchetto | Vincolo | Uso osservato | Base e stato |
| --- | --- | --- | --- |
| @anthropic-ai/sdk | ^0.126.0 | Messages API via OpenRouter; ramo provider nativo spento | Connettore OpenRouter previsto; SDK non è prova di integrazione diretta Anthropic |
| espeak-ng | ^1.0.2 | Fonemizzazione Piper, WASM | Supporto tecnico alla voce; verificati import e build |
| onnxruntime-web | ^1.30.0 | Inferenza vocale ONNX/WASM | Supporto a Piper; qualità/browser non verificati |
| phonemizer | ^1.2.1 | Nessun riferimento operativo trovato | A041: candidato rimozione dopo conferma |
| typescript | ^5.6.3 | Controlli strict/noEmit | Scelta tecnica di supporto non esplicitata nei docs |
| vite | ^5.4.10 | Dev/build, middleware Node, esbuild transitivo | Esplicitamente previsto; backend preview assente |

Lockfile:86 entry pacchetti oltre la radice, incluse varianti opzionali per piattaforme. `npm ci` nella copia ha installato39 pacchetti per questa macchina. Non sono state modificate versioni né lockfile. Nessun audit CVE remoto eseguito. Assenti React/Tailwind, deliberati da L04 (A038).

## Endpoint effettivi

| Endpoint | Contratto osservato | Stato |
| --- | --- | --- |
| POST /ai-engine | frase, passato, prima, profilo, chi; ritorna chiamate/detto/perche; chiave soltanto Node | Schema runtime parziale; tool eseguiti nel browser; nessun test provider reale |
| POST /chat-raw | timestamp ISO, role user/assistant, text;204 o400/500 | Writer reale JSONL, no idempotenza/ordine affidabile |
| GET /archivio/user_123/memory | Listing ricorsivo dei documenti txt/md | Serve contesto al Disco; API non documentata formalmente |
| GET /archivio/user_123/... | File MIME ammessi o404 | Confinamento vulnerabile a .. e possibile symlink |
| POST /archivio/user_123/memory | percorso .md e testo; mkdir/writeFileSync | Sovrascrittura reale, traversal riprodotto |
| /ort/* | Asset voce, query rimossa dal middleware | Solo dev middleware; script copia asset |

## Rischi residui da verificare, non promossi a fatti

- Comportamento reale del provider per il modello scelto: nessuna prova remota.
- Effetto visivo finale di race DOM/collisioni, molto testo, resize e geometrie dense: forte evidenza statica dove indicato, senza riproduzione browser.
- Qualità e privacy della voce online selezionata dal browser: dipende dalle voci installate; non accertato alcun trasferimento di testo durante audit.
- Sfruttamento remoto delle vulnerabilità locali: audit prova il confine HTTP locale con dati sintetici, non una catena da origine esterna.
