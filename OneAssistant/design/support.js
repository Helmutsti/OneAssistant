// Il minimo per far vedere un documento di design **fuori da Claude Design**.
//
// I documenti sono nati là e usano due elementi di quel runtime: `<x-dc>`, che li
// racchiude, e `<helmet>`, che tiene i font e gli stili da portare nel `<head>`. Qui
// dentro c'è solo quello che serve perché la stessa pagina si apra da sola, in locale,
// aprendo il file — niente rete, niente build, nessuna dipendenza.
//
// Se un giorno i documenti smetteranno di portarsi dietro `<x-dc>`, questo file sparisce
// e non cambia niente di quello che si vede.

customElements.define('x-dc', class extends HTMLElement {});

const stileBase = document.createElement('style');
stileBase.textContent = `
  x-dc { display: block; }
  helmet { display: none; }
  body { margin: 0; }
`;
document.head.appendChild(stileBase);

// `<helmet>` non è un contenitore: è una lista di cose che vanno nella testa del
// documento. Si svuota appena il DOM è pronto, e i suoi figli migrano — un `<link>` che
// resta nel body non carica il font.
function apriIlCasco() {
  for (const casco of document.querySelectorAll('helmet')) {
    for (const nodo of [...casco.children]) {
      // uno <script> spostato non si esegue se non lo si ricrea
      if (nodo.tagName === 'SCRIPT') {
        const nuovo = document.createElement('script');
        for (const a of nodo.attributes) nuovo.setAttribute(a.name, a.value);
        nuovo.textContent = nodo.textContent;
        document.head.appendChild(nuovo);
      } else {
        document.head.appendChild(nodo);
      }
    }
    casco.remove();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', apriIlCasco);
} else {
  apriIlCasco();
}
