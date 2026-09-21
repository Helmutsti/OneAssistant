# Riproducibilità delle evidenze

Gli script `reproduce.mts` e `races.mts` usano import relativi a una cartella `repo/` adiacente. Per rieseguirli, copiare gli script in una cartella temporanea e ricreare sotto `repo/` i file del commit `07d64e17c854e6584a207314d851e348aeec4052`. I sorgenti originali non sono stati modificati per le prove.

Comandi usati nella cartella temporanea:

```sh
node --experimental-transform-types reproduce.mts
node --experimental-transform-types races.mts
```

Con cwd nella copia `repo/`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run scenario
npm run voce
```

`http-test.py` usa deliberatamente il percorso fisso `/tmp/oneassist-audit/repo` e la porta locale5179. Va eseguito soltanto con il server della copia temporanea e dati sintetici: crea `audit_sibling`, due file di prova e due messaggi JSONL. Non è un test da lanciare contro il workspace reale o un server personale. Il server della prova è stato fermato al termine dell’audit.

```sh
npm run dev -- --host 127.0.0.1 --port 5179
```

I servizi usati da `reproduce.mts` sono stub senza rete; le promesse sono risolte manualmente e il tempo è simulato. `races.mts` controlla esplicitamente l’ordine delle risposte AI, senza provider. La rinomina del task nel test targeting è una fixture sintetica, non una modifica al codice.

`script-check.json` riporta `node --check` degli script estratti dai quattro HTML strumenti. L’errore a riga91 dello script estratto corrisponde a riga311 di `strumenti/banco-ascolto.html`.

`reproduce.log` conserva l’output originale con righe informative; `reproduce.json` contiene il solo array dei risultati. Warning Node transform-types presenti nei log non sono errori applicativi. Le scritture raw non sono state testate nella suite Node, dove `salvaMessaggio` non esegue fetch senza window; sono state controllate separatamente via HTTP.

Il manifest e l’inventario contengono hash per confrontare il commit analizzato. Gli artefatti non includono chiavi, password o copie dei dati utente. Le prove non costituiscono test di regressione aggiunti al progetto: sono evidenze esterne della fase di audit.
