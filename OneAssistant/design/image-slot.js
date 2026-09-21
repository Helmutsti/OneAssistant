// `<image-slot>`: il riquadro dove, di là, si trascinava un'immagine. Qui mostra quella
// che c'è e, quando non c'è, dice cosa dovrebbe esserci — un documento con dei buchi
// dichiarati è più onesto di uno con dei riquadri grigi senza nome.

customElements.define('image-slot', class extends HTMLElement {
  connectedCallback() {
    const src = this.getAttribute('src');
    const tondo = this.getAttribute('shape') === 'circle';
    const raggio = tondo ? '50%' : `${this.getAttribute('radius') ?? 14}px`;
    this.style.display = 'block';
    this.style.overflow = 'hidden';
    this.style.borderRadius = raggio;
    if (src) {
      this.innerHTML = `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`;
      return;
    }
    const detto = this.getAttribute('placeholder') ?? 'immagine';
    this.style.border = '1px dashed rgba(26,28,25,0.28)';
    this.style.background = 'rgba(26,28,25,0.04)';
    this.style.boxSizing = 'border-box';
    this.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
      font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;
      color:rgba(26,28,25,0.42);text-align:center;padding:12px;box-sizing:border-box">${detto}</div>`;
  }
});
