# Liquid glass

Revisione del solo materiale dei componenti originali. Nessuna nuova composizione: la geometria originale delle bolle resta invariata. La successiva rifinitura di Profilebar, richiesta esplicitamente, modifica solo la spaziatura interna e il trattamento del profilo, conservando ancoraggio, altezza, raggio e diametro del volto.

## Materiale

La fonte comune è `liquid-glass.css`, usata dai componenti L2 e dalle loro occorrenze in L3 e L4, oltre che dai campioni delle icone e dalla moodboard.

- Film cristallino multistrato: riflessi radiali negli angoli, una lama diagonale di luce e centro molto più trasparente. Il film di base scende all’8% nel centro; il livello a fuoco mantiene il 22–26% prima dei riflessi.
- Sfocatura ridotta da 24 a 12 px, saturazione 1,65 e luminosità 1,06: il fondo si riconosce attraverso il materiale, con meno effetto satinato.
- Doppio bordo ottico: filo bianco, micro-ombra interna e riflesso inferiore concentrato suggeriscono uno spessore curvo. Sono gradienti e ombre, senza aggiungere bordi che alterino le dimensioni.
- Ombra di contatto corta e due ombre diffuse separano il vetro dal fondo. I riflessi restano statici, senza distrarre dalla lettura.
- Tre densità: `--liquid-focus`, `--liquid-film`, `--liquid-quiet`. Conservano le differenze già presenti nei campioni originali.
- Nessun movimento, deformazione o ingrandimento al passaggio del mouse.

È una resa CSS del liquid glass, non una simulazione fisica della rifrazione. Non introduce filtri SVG sul testo. Il fallback per browser senza backdrop-filter e la preferenza di trasparenza ridotta usano superfici opache.

## Confini

La cornice di sistema conserva la sua assenza di bolla. Le cartine delle notifiche restano opache; non diventano task di vetro. Fondo, colori di stato, immagini, forme, ordine e posizioni non cambiano.

Questa revisione sostituisce le vecchie ricette di blur, film e ombra nei campioni attivi. Le annotazioni storiche con valori precedenti nei documenti vanno lette come descrizione del materiale di partenza; per il materiale corrente prevalgono questi token. La legge 05 di L0 rimanda a questa revisione per le densità del film; tutte le regole geometriche restano in vigore.

## Anteprima

Aprire `L4 - Schermate.dc.html`: le quattro composizioni originali sono inalterate. Le tavole mantengono intenzionalmente la dimensione originale 1440 × 900 anche su schermi piccoli: si esplorano scorrendo, senza ricomporre i componenti.

## Rifinitura approvata: ombra e Profilebar

Le bolle hanno un poco più di ombra diffusa (14/30 e 30/56 px), mantenendo i riflessi invariati. Profilebar usa un velo più leggero, privo dell'ombra profonda dei task. Il padding diventa 7/10/7/20 px e la distanza tra testo e volto 16 px. Le due righe hanno gap 4 e interlinea 18; data e luogo hanno una gerarchia di contrasto più chiara. L'altezza resta 58 px, il raggio 29 e il volto 44. Il ritratto locale `volto.png` sostituisce il segnaposto. Gli stessi tre stili sono condivisi da L2 e dalle quattro scene L4.


## Situazioni del profilo

La tavola L2 aggiunge quattro esempi: Genova / Via Garibaldi 12, Milano / Corso Buenos Aires 18, posizione in aggiornamento e posizione non disponibile. Sono dati dimostrativi: nessuna richiesta di permesso e nessuna lettura del GPS. La seconda scena L4 mostra anche il caso con indirizzo. Il pin accompagna il luogo; il profilo conserva foto, data e ancoraggio. Questi sono stati visivi, non nuove regole di geolocalizzazione.


## Varianti definitive del profilo

Scelte Eclisse (scuro) e Luna (chiaro), raccolte nella tavola `L2 - Profilebar.dc.html` e definite una sola volta in `profilebar.css`. Luna è applicata ai contesti L2 e alle scene L4 esistenti. Eclisse è la variante scura esplicita, senza selezione automatica del tema del dispositivo.

Questa revisione sostituisce la spaziatura del profilo descritta sopra: padding 8/12/8/20, gap testo-volto 16, distanza tra gruppi 12, tra righe e icona-testo 4. Il volto resta 44; l’altezza passa a 60 e il raggio a 30 per accogliere il padding richiesto. Ancoraggio e ordine sono invariati. Ora/data e città/luogo sono gruppi separati da spazi reali, senza middledot. Le due varianti condividono esattamente la stessa geometria.


## Luogo e modalità attiva

I due campioni Eclisse e Luna mostrano «Casa» con la sola icona del luogo e «Deep» in semibold 600. Gap 12 px, nessun badge o separatore. Casa resta in peso 400; Genova non viene ripetuta per la postazione registrata. Il campione anatomico mostra il caso senza modalità, senza lasciare spazi vuoti. La scena L4 al lavoro riprende Casa + Deep. Gli indirizzi locali mostrano la via; l’esempio fuori città mantiene Milano per orientare.

Deep è un esempio visivo di modalità attiva, non un’automazione implementata né dedotta dal luogo. Il peso 600 è l’eccezione tipografica esplicitamente scelta per questo indicatore.


## Tavola essenziale e padding sinistro

La tavola Profilebar conserva Eclisse, Luna e un solo esempio con via generica, seguito dall’anatomia del componente. Rimossi i quattro casi ridondanti in fondo. Il padding corrente è **8/12/8/24 px**: 4 px aggiuntivi a sinistra, condivisi anche dalle schermate L4. Le altre misure restano invariate. Questo valore sostituisce il precedente padding sinistro di 20 px.


## Leggibilità di Luna

Film chiaro portato all’84–94% di opacità, blur 24 px. Inchiostro principale `#142538`, secondario `#293E50`: data, luogo e indirizzo mantengono un contrasto più forte anche sullo sfondo scuro della tavola. Il bordo conserva i riflessi precedenti. Correzione condivisa dal campione Luna, dalla via generica e dai profili Luna delle scene L4. Eclisse, padding e geometria invariati.

## Il 19 settembre 2026 · quattro cose cadute

Questo documento è il registro del materiale, e quattro cose scritte sopra non valgono più.
Restano dov'erano — servono a sapere cosa si è provato — ma vanno lette al passato.

**Le ombre non sono più verdi.** Erano `rgb(35,53,43)`, `rgb(43,59,48)` e `rgb(28,40,32)`:
un verde oliva che sporgeva di 14 punti sulla media di rosso e blu. Adesso sono neutre —
`rgb(48,48,48)`, `rgb(55,55,55)`, `rgb(37,37,37)` — a **luminanza identica**: cambia la
tinta, non quanto pesa l'ombra.

Provandole si è imparata una cosa che vale più della scelta: a quelle opacità — 48%, 12%,
32% su pochi pixel di contorno — **la tinta dell'ombra quasi non si vede**. Il verde che si
notava veniva in gran parte dal *fondo* della moodboard, che è verde di suo, moltiplicato
da `saturate(1.65)`. Se torna, si guarda il fondo prima del menisco (`L1 - Temi`).

**Luna ed Eclisse non sono più varianti della Profilebar.** Quel componente aveva un
materiale suo finché era una cornice senza contenitore; adesso è **una bolla**, e i due veli
sono diventati il vetro chiaro e il vetro scuro **di tutti**. Il documento che li governa è
`L1 - Temi`, e `profilebar.css` tiene solo la geometria.

**La cartina non esiste.** C'era una quarta forma, opaca, per dire «questa cosa non è
nostra». Il materiale non era il posto dove dirlo: una cosa arrivata da fuori resta di
qualcun altro anche vista attraverso il vetro. I banner del cassetto sono bolle come le
altre, e a dire che non sono tue restano il contenuto e il comportamento.

**Ci sono dodici temi di colore.** Cambiano fondo e inchiostro, mai gli stati e mai le
ombre, e valgono in chiaro e in scuro insieme: un tema è una tinta, non un materiale
(`L1 - Temi`).
