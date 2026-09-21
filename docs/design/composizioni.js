// Il selettore della tavola L4: gira **il tema**, non il materiale di un componente.
//
// Girava le varianti del solo Profilebar — `profile-veil--luna` e `--eclipse` — finché
// quel componente aveva un materiale suo. Dal 19 settembre 2026 è una bolla come le
// altre, e il tema vale per tutto: si scrive `data-tema` sulla radice, esattamente come
// fa il prototipo (`src/prova/pedana.ts`).
const bottoni = document.querySelectorAll('[data-profile-theme]');
bottoni.forEach((bottone) => {
  bottone.addEventListener('click', () => {
    const scuro = bottone.dataset.profileTheme === 'scuro';
    document.querySelectorAll('.fondo, .angolo, [data-scena]').forEach((scena) => {
      scena.toggleAttribute('data-tema', scuro);
      if (scuro) scena.setAttribute('data-tema', 'scuro');
    });
    document.documentElement.toggleAttribute('data-tema', scuro);
    if (scuro) document.documentElement.setAttribute('data-tema', 'scuro');
    bottoni.forEach((b) => b.setAttribute('aria-pressed', String(b === bottone)));
  });
});
