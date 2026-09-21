// La tavolozza in prova.
//
// I colori sono **design**, e il design vive di là (CLAUDE.md): `base.css` non decide
// niente, trascrive. Questo file non cambia quella regola — la mette su un banco.
//
// Il profilo può proporre una tavolozza — `ambiente/impostazioni.txt`, blocco `tema` —
// e qui si applica alle variabili di `:root`. Serve a una cosa sola: **guardarla sul vetro vero,
// alla misura vera, prima di decidere**. Una tavolozza che sopravvive alla prova va
// riportata nei documenti di design; una che vive solo qui è un debito, e sta scritto
// nella coda di `docs/11-aperte`.
//
// Il limite è la legge 04: gli stati sono tre — salvia, ambra, rosso terra — e il colore
// è stato, mai categoria. Si possono cambiare le tinte; non se ne può aggiungere una
// quarta, e infatti qui sotto non c'è un posto dove metterla.

/**
 * Da come si chiama nel profilo a come si chiama in `:root`. È una tabella e non una
 * regola perché i due vocabolari sono nati in due posti diversi — quello del profilo
 * viene dalla consolle dei colori — e fingere che coincidano li farebbe divergere in
 * silenzio.
 */
const NOMI: Record<string, string> = {
  // gli stati (legge 04)
  salvia: '--salvia',
  ambra: '--ambra',
  rosso: '--rosso',
  'ink-salvia': '--ink-salvia',
  'ink-ambra': '--ink-ambra',
  'ink-rosso': '--ink-rosso',
  'punto-salvia': '--punto-salvia',
  'punto-ambra': '--punto-ambra',
  'punto-rosso': '--punto-rosso',

  // gli inchiostri
  inchiostro: '--inchiostro',
  'ink-tenue2': '--inchiostro-tenue',
  'ink-corpo2': '--inchiostro-corpo',
  'ink-fioco2': '--inchiostro-fioco',

  // il fondo del sistema operativo, dall'alto in basso
  f1: '--f1',
  f2: '--f2',
  f3: '--f3',
  f4: '--f4',

  // quanto si vede la tua immagine sotto, e come
  'sfondo-quanto': '--sfondo-quanto',
  'sfondo-sat': '--sfondo-sat',
  'sfondo-luce': '--sfondo-luce',
  'sfondo-contrasto': '--sfondo-contrasto',
  velo: '--velo',

  // il film di vetro della bolla: quanto è latte in alto e in basso
  'film-alto': '--film-alto',
  'film-basso': '--film-basso',
};

/**
 * Applicare la tavolozza. Quello che non si riconosce si lascia cadere: un profilo
 * scritto a mano ha sempre una riga di troppo, e non deve rompere niente.
 *
 * Torna i nomi che ha buttato, così chi chiama può dirlo invece di tacere.
 */
export function applicaTema(tema: Readonly<Record<string, string>>): readonly string[] {
  const radice = document.documentElement;
  const caduti: string[] = [];
  for (const [chiave, valore] of Object.entries(tema)) {
    const quale = NOMI[chiave];
    if (!quale) {
      caduti.push(chiave);
      continue;
    }
    radice.style.setProperty(quale, valore);
  }
  return caduti;
}
