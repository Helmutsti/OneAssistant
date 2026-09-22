# La cartella dell'audit

```
audit/
  AUDIT.md          ← il registro unico: 119 finding, F-001…F-119. È questo da leggere.
  fonti/
    claude/
      AUDIT.md          rapporto del ramo CLAUDE · 53 finding (AUD-01…AUD-53)
      DIVERGENZE.md     primo registro · 69 voci (D-xx, N-xx, A-xx)
    chatgpt/
      AUDIT.md          rapporto del ramo CHATGPT · indice e limiti
      finding.md        96 finding (A001…A096), campi completi
      inventario.md     inventario file per file
      matrice-*.md      tracciabilità nei due versi
      evidenze/         log di build, suite, riproduzioni, sonde HTTP
      *.csv, *.json     gli stessi dati in forma filtrabile
```

## Cosa leggere

**`AUDIT.md`**, e basta. È la fusione dei tre audit: ogni anomalia compare una volta sola,
con i codici di tutte le fonti che l'hanno trovata. Le tabelle di corrispondenza in §3
permettono di risalire da qualunque codice vecchio.

## Perché le fonti restano

Tre ragioni, e nessuna è archivistica:

1. **`fonti/chatgpt/evidenze/` è l'unica prova eseguita.** Build, suite, riproduzioni
   isolate e sonde HTTP contro il dev server. Il registro unico le cita; qui ci sono i log.
2. **`fonti/claude/DIVERGENZE.md` è l'unica fonte delle misure grafiche** componente per
   componente (`D-07`…`D-26`). Il registro le raggruppa in cinque voci tematiche.
3. **Sono la prova di cosa era noto, quando, e con quale metodo.** Due delle tre fonti
   hanno dichiarato conforme qualcosa che non lo era — la Funzione Delay in `DIVERGENZE.md`,
   il confine `/archivio` nel rapporto CLAUDE. Le due voci sono annullate dal registro
   unico, ma restano leggibili nell'originale insieme alla spiegazione di come l'errore è
   stato commesso.

**Le fonti non vanno aggiornate.** Quando una voce si chiude, si spunta in `AUDIT.md` e si
motiva in `tasks/storico.md`.

## Perimetro

Tutti e tre gli audit hanno letto lo stesso codice (`07d64e1`, 22 settembre 2026) e
**nessuno ha modificato un file di codice**. Il controllo di immutabilità di CG è in
`fonti/chatgpt/evidenze/verifica-immutabilita.json`.
