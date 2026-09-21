# Liquid glass

Revisione del solo materiale dei componenti originali. Nessuna nuova composizione: la geometria originale delle bolle resta invariata. La successiva rifinitura di Profilebar, richiesta esplicitamente, modifica solo la spaziatura interna e il trattamento del profilo, conservando ancoraggio, altezza, raggio e diametro del volto.

## Materiale

La fonte comune è `liquid-glass.css`, usata dai componenti L1 e dalle loro occorrenze in L2 e L3, oltre che dai campioni delle icone e dalla moodboard.

- Film cristallino multistrato: riflessi radiali negli angoli, una lama diagonale di luce e centro molto più trasparente. Il film di base scende all’8% nel centro; il livello a fuoco mantiene il 22–26% prima dei riflessi.
- Sfocatura ridotta da 24 a 12 px, saturazione 1,65 e luminosità 1,06: il fondo si riconosce attraverso il materiale, con meno effetto satinato.
- Doppio bordo ottico: filo bianco, micro-ombra interna e riflesso inferiore concentrato suggeriscono uno spessore curvo. Sono gradienti e ombre, senza aggiungere bordi che alterino le dimensioni.
- Ombra di contatto corta e due ombre diffuse separano il vetro dal fondo. I riflessi restano statici, senza distrarre dalla lettura.
- Tre densità: `--liquid-focus`, `--liquid-film`, `--liquid-quiet`. Conservano le differenze già presenti nei campioni originali.
- Nessun movimento, deformazione o ingrandimento al passaggio del mouse.

È una resa CSS del liquid glass, non una simulazione fisica della rifrazione. Non introduce filtri SVG sul testo. Il fallback per browser senza backdrop-filter e la preferenza di trasparenza ridotta usano superfici opache.

## Confini

La cornice di sistema conserva la sua assenza di bolla. Le cartine delle notifiche restano opache; non diventano task di vetro. Fondo, colori di stato, immagini, forme, ordine e posizioni non cambiano. I documenti in `superati/` restano storici.

Questa revisione sostituisce le vecchie ricette di blur, film e ombra nei campioni attivi. Le annotazioni storiche con valori precedenti nei documenti vanno lette come descrizione del materiale di partenza; per il materiale corrente prevalgono questi token. La legge 05 di L0 rimanda a questa revisione per le densità del film; tutte le regole geometriche restano in vigore.

## Anteprima

Aprire `L3 - Schermate.dc.html`: le quattro composizioni originali sono inalterate. Le tavole mantengono intenzionalmente la dimensione originale 1440 × 900 anche su schermi piccoli: si esplorano scorrendo, senza ricomporre i componenti.

## Rifinitura approvata: ombra e Profilebar

Le bolle hanno un poco più di ombra diffusa (14/30 e 30/56 px), mantenendo i riflessi invariati. Profilebar usa un velo più leggero, privo dell'ombra profonda dei task. Il padding diventa 7/10/7/20 px e la distanza tra testo e volto 16 px. Le due righe hanno gap 4 e interlinea 18; data e luogo hanno una gerarchia di contrasto più chiara. L'altezza resta 58 px, il raggio 29 e il volto 44. Il ritratto locale `volto.png` sostituisce il segnaposto. Gli stessi tre stili sono condivisi da L1 e dalle quattro scene L3.


## Situazioni del profilo

La tavola L1 aggiunge quattro esempi: Genova / Via Garibaldi 12, Milano / Corso Buenos Aires 18, posizione in aggiornamento e posizione non disponibile. Sono dati dimostrativi: nessuna richiesta di permesso e nessuna lettura del GPS. La seconda scena L3 mostra anche il caso con indirizzo. Il pin accompagna il luogo; il profilo conserva foto, data e ancoraggio. Questi sono stati visivi, non nuove regole di geolocalizzazione.


## Varianti definitive del profilo

Scelte Eclisse (scuro) e Luna (chiaro), raccolte nella tavola `L1 - Profilebar.dc.html` e definite una sola volta in `profilebar.css`. Luna è applicata ai contesti L1 e alle scene L3 esistenti. Eclisse è la variante scura esplicita, senza selezione automatica del tema del dispositivo.

Questa revisione sostituisce la spaziatura del profilo descritta sopra: padding 8/12/8/20, gap testo-volto 16, distanza tra gruppi 12, tra righe e icona-testo 4. Il volto resta 44; l’altezza passa a 60 e il raggio a 30 per accogliere il padding richiesto. Ancoraggio e ordine sono invariati. Ora/data e città/luogo sono gruppi separati da spazi reali, senza middledot. Le due varianti condividono esattamente la stessa geometria.


## Luogo e modalità attiva

I due campioni Eclisse e Luna mostrano «Casa» con la sola icona del luogo e «Deep» in semibold 600. Gap 12 px, nessun badge o separatore. Casa resta in peso 400; Genova non viene ripetuta per la postazione registrata. Il campione anatomico mostra il caso senza modalità, senza lasciare spazi vuoti. La scena L3 al lavoro riprende Casa + Deep. Gli indirizzi locali mostrano la via; l’esempio fuori città mantiene Milano per orientare.

Deep è un esempio visivo di modalità attiva, non un’automazione implementata né dedotta dal luogo. Il peso 600 è l’eccezione tipografica esplicitamente scelta per questo indicatore.


## Tavola essenziale e padding sinistro

La tavola Profilebar conserva Eclisse, Luna e un solo esempio con via generica, seguito dall’anatomia del componente. Rimossi i quattro casi ridondanti in fondo. Il padding corrente è **8/12/8/24 px**: 4 px aggiuntivi a sinistra, condivisi anche dalle schermate L3. Le altre misure restano invariate. Questo valore sostituisce il precedente padding sinistro di 20 px.


## Leggibilità di Luna

Film chiaro portato all’84–94% di opacità, blur 24 px. Inchiostro principale `#142538`, secondario `#293E50`: data, luogo e indirizzo mantengono un contrasto più forte anche sullo sfondo scuro della tavola. Il bordo conserva i riflessi precedenti. Correzione condivisa dal campione Luna, dalla via generica e dai profili Luna delle scene L3. Eclisse, padding e geometria invariati.
