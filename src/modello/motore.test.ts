import { describe, expect, it } from 'vitest';
import { Motore, Rifiuto } from './motore.ts';
import { OrologioFermo } from './orologio.ts';
import { DELAY_MS, colore, type Uscita } from './tipi.ts';

const MAIL: Uscita = { servizio: 'email', a: 'Elena Sarti', attraversaConfine: true };

function banco() {
  const orologio = new OrologioFermo(Date.parse('2026-09-23T09:00:00Z'));
  const chiamate: Array<{ a: string; cosa: string }> = [];
  let fallisci: string | undefined;
  const m = new Motore(orologio, async (u, cosa) => {
    if (fallisci) throw new Error(fallisci);
    chiamate.push({ a: u.a, cosa });
  });
  const salta = async (ms: number) => {
    orologio.salta(ms);
    m.batti();
    await Promise.resolve();
    await Promise.resolve();
  };
  return { m, orologio, chiamate, salta, falliscono: (p: string | undefined) => (fallisci = p) };
}

/** Una mail a Elena, pronta e in attesa del sì: la battuta 7 di `L3 - Flusso task`. */
function mailPronta(m: Motore) {
  const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena che venerdì non ci sono', uscita: MAIL, frasi: ['vai', 'cambia'] });
  m.conferma(t.id);
  m.pronto(t.id, 'Cara Elena, venerdì non sarò in ufficio.', ['manda la mail', 'leggila']);
  return t;
}

describe('la bozza', () => {
  it('nasce in T_DRAFT nella dropzone, grigia, e non parte da sola', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena' });
    expect(t.stato).toBe('T_DRAFT');
    expect(t.luogo).toBe('DROPZONE');
    expect(colore(t, m.adesso())).toBe('grigio');
  });

  it('alla conferma lascia la dropzone ed entra in DESK, azzurra', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena' });
    m.conferma(t.id);
    expect(t.stato).toBe('T_LAVORAZIONE');
    expect(t.luogo).toBe('DESK');
    expect(m.bozzaInDropzone()).toBeUndefined();
    expect(colore(t, m.adesso())).toBe('azzurro');
  });

  it('scartata non lascia traccia', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'scrivi a Elena' });
    m.scarta(t.id);
    expect(m.fotografia().bolle).toHaveLength(0);
  });

  it('la dropzone ne mostra una alla volta: la seconda manda la prima in SIDEBAR, ancora bozza', () => {
    const { m } = banco();
    const a = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a' });
    const b = m.componi({ tipo: 'email', nome: 'Scrivere a Marco', richiesta: 'b' });
    expect(a.luogo).toBe('SIDEBAR');
    expect(a.stato).toBe('T_DRAFT');
    expect(b.luogo).toBe('DROPZONE');
    m.richiama(a.id);
    expect(a.luogo).toBe('DROPZONE');
    expect(b.luogo).toBe('SIDEBAR');
  });

  it('una bozza in SIDEBAR non si conferma senza richiamarla', () => {
    const { m } = banco();
    const a = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a' });
    m.mettiDaParte(a.id);
    expect(() => m.conferma(a.id)).toThrow(Rifiuto);
  });

  it('il nome sta in 32 caratteri, su una riga, senza puntini', () => {
    const { m } = banco();
    expect(() => m.componi({ tipo: 'email', nome: 'x'.repeat(33), richiesta: 'a' })).toThrow(/32/);
    expect(() => m.componi({ tipo: 'email', nome: 'Mail…', richiesta: 'a' })).toThrow(/puntini/);
  });
});

describe('la Funzione Delay', () => {
  it('nessuna chiamata al servizio prima dei novanta secondi, una sola dopo', async () => {
    const { m, chiamate, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    expect(t.luogo).toBe('SIDEBAR');
    expect(t.stato).toBe('T_LAVORAZIONE');
    expect(colore(t, m.adesso())).toBe('azzurro');
    await salta(DELAY_MS - 1);
    expect(chiamate).toHaveLength(0);
    await salta(1);
    expect(chiamate).toHaveLength(1);
    expect(m.fotografia().bolle).toHaveLength(0);
  });

  it('«no, aspetta» dentro la finestra impedisce davvero la chiamata, e il task si può modificare', async () => {
    const { m, chiamate, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    await salta(30_000);
    m.annullaInvio(t.id);
    await salta(DELAY_MS * 2);
    expect(chiamate).toHaveLength(0);
    expect(t.stato).toBe('T_ATTESA');
    expect(colore(t, m.adesso())).toBe('ambra');
    expect(t.frasi).toContain('manda la mail');
    // Dirlo è richiamarlo: torna in DESK da solo, ed è la active.
    expect(t.luogo).toBe('DESK');
    expect(m.fotografia().active).toBe(t.id);
  });

  it('«no, aspetta, lasciala lì» lo tiene in SIDEBAR', () => {
    const { m } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    m.annullaInvio(t.id, true);
    expect(t.luogo).toBe('SIDEBAR');
    expect(colore(t, m.adesso())).toBe('ambra');
  });

  it('fuori finestra «no, aspetta» non dichiara il falso', async () => {
    const { m, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    await salta(DELAY_MS);
    expect(() => m.annullaInvio(t.id)).toThrow();
  });

  it('un secondo «manda» non fa un secondo invio', async () => {
    const { m, chiamate, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    expect(() => m.invia(t.id)).toThrow(/già un invio/);
    await salta(DELAY_MS);
    expect(chiamate).toHaveLength(1);
  });

  it('il bypass esplicito parte subito, ed è definitivo', async () => {
    const { m, chiamate, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id, true);
    await salta(0);
    expect(chiamate).toHaveLength(1);
    expect(() => m.annullaInvio(t.id)).toThrow();
  });

  it('«manda subito» dentro la finestra fa partire lo stesso invio, una volta sola', async () => {
    const { m, chiamate, salta } = banco();
    const t = mailPronta(m);
    m.invia(t.id);
    m.invia(t.id, true);
    await salta(DELAY_MS * 2);
    expect(chiamate).toHaveLength(1);
  });

  it('il bypass vale solo per quell\'invio', async () => {
    const { m, chiamate, salta } = banco();
    const a = mailPronta(m);
    m.invia(a.id, true);
    await salta(0);
    const b = mailPronta(m);
    m.invia(b.id);
    await salta(DELAY_MS - 1);
    expect(chiamate).toHaveLength(1);
  });

  it('un invio che fallisce lascia il task fermo, ambra, e lo dice', async () => {
    const { m, salta, falliscono } = banco();
    falliscono('il server non risponde');
    const t = mailPronta(m);
    m.invia(t.id);
    await salta(DELAY_MS);
    expect(t.stato).toBe('T_ATTESA');
    expect(t.attesa).toBe('fermo');
    expect(t.corpo).toMatch(/non risponde/);
    expect(colore(t, m.adesso())).toBe('ambra');
  });

  it('INPUT offre «manda subito» e «no, aspetta» mentre l\'invio aspetta', () => {
    const { m } = banco();
    const t = mailPronta(m);
    m.dici('manda la mail');
    m.invia(t.id);
    expect(m.frasiInput().frasi).toEqual(['manda subito', 'no, aspetta']);
  });

  it('salvare in locale non attraversa il confine, e parte subito', async () => {
    const { m, chiamate, salta } = banco();
    const t = m.componi({
      tipo: 'contatto', nome: 'Salvare Paolo', richiesta: 'salva Paolo',
      uscita: { servizio: 'contatti', a: 'Paolo', attraversaConfine: false },
    });
    m.conferma(t.id);
    m.concludi(t.id);
    await salta(0);
    expect(chiamate).toHaveLength(1);
  });
});

describe('le attese', () => {
  it('una domanda porta il task ad ambra e la mette in INPUT, senza pallino', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a' });
    m.conferma(t.id);
    m.chiedi(t.id, 'Le dico anche del lunedì?', ['sì, anche lunedì', 'no, solo venerdì']);
    expect(colore(t, m.adesso())).toBe('ambra');
    const f = m.frasiInput();
    expect(f.da).toBe('domanda');
    expect(f.pallino).toBe(false);
    m.rispondiDomanda('no, solo venerdì');
    expect(t.stato).toBe('T_LAVORAZIONE');
    expect(m.fotografia().domanda).toBeUndefined();
  });

  it('una domanda aperta alla volta', () => {
    const { m } = banco();
    const a = m.componi({ tipo: 'email', nome: 'A', richiesta: 'a' });
    m.conferma(a.id);
    const b = m.componi({ tipo: 'email', nome: 'B', richiesta: 'b' });
    m.conferma(b.id);
    m.chiedi(a.id, 'Prima?', ['sì']);
    m.chiedi(b.id, 'Seconda?', ['sì']);
    expect(m.fotografia().domanda?.testo).toBe('Prima?');
    m.rispondiDomanda('sì');
    expect(m.fotografia().domanda?.testo).toBe('Seconda?');
  });

  it('pronto: la bolla diventa la active, e non cambia posto', () => {
    const { m } = banco();
    const t = mailPronta(m);
    expect(m.fotografia().active).toBe(t.id);
    expect(t.luogo).toBe('DESK');
    expect(m.frasiInput().frasi).toContain('manda la mail');
  });

  it('quando la active è ambra, INPUT propone di metterla da parte', () => {
    const { m } = banco();
    mailPronta(m);
    expect(m.frasiInput().frasi).toContain('mettila da parte');
  });

  it('il rimandato va in SIDEBAR senza colore, e allo scadere diventa ambra dove si trova', async () => {
    const { m, salta } = banco();
    const t = mailPronta(m);
    m.rimanda(t.id, m.adesso() + 60_000);
    expect(t.luogo).toBe('SIDEBAR');
    expect(colore(t, m.adesso())).toBe('nessuno');
    await salta(60_000);
    expect(t.luogo).toBe('SIDEBAR');
    expect(colore(t, m.adesso())).toBe('ambra');
  });

  it('un task con un\'ora futura aspetta in SIDEBAR alla conferma', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'sveglia', nome: 'Richiamare Elena', richiesta: 'ricordami di richiamare Elena', ora: m.adesso() + 3_600_000 });
    m.conferma(t.id);
    expect(t.luogo).toBe('SIDEBAR');
    expect(t.perOra).toBe('programmato');
  });

  it('un sotto-task nasce già in T_LAVORAZIONE', () => {
    const { m } = banco();
    const g = m.componi({ tipo: 'email', nome: 'Scrivere a Marco', richiesta: 'a' });
    m.conferma(g.id);
    const s = m.sottotask(g.id, { tipo: 'documento', nome: 'Cercare il preventivo', richiesta: 'cerca' });
    expect(s.stato).toBe('T_LAVORAZIONE');
    expect(s.genitore).toBe(g.id);
  });

  it('un task concluso senza invio svanisce e non diventa memoria', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'documento', nome: 'Leggere il verbale', richiesta: 'a' });
    m.conferma(t.id);
    m.concludi(t.id);
    expect(m.fotografia().bolle).toHaveLength(0);
  });
});

describe('dove stanno le cose', () => {
  it('il focus manda le altre bolle di DESK in SIDEBAR, e all\'uscita tornano', () => {
    const { m } = banco();
    const a = mailPronta(m);
    const b = m.componi({ tipo: 'documento', nome: 'Leggere il verbale', richiesta: 'a' });
    m.conferma(b.id);
    m.apriFocus(a.id);
    expect(b.luogo).toBe('SIDEBAR');
    expect(m.fotografia().focus).toBe(a.id);
    m.esciFocus();
    expect(b.luogo).toBe('DESK');
  });

  it('un task sta in un posto solo', () => {
    const { m } = banco();
    const a = mailPronta(m);
    m.mettiDaParte(a.id);
    expect(m.fotografia().bolle.filter((b) => b.id === a.id)).toHaveLength(1);
    expect(m.fotografia().active).toBeUndefined();
  });

  it('la bolla documento si apre al centro, è la active, e si chiude o si assorbe', () => {
    const { m } = banco();
    const d = m.mostraDocumento({ tipo: 'documento', nome: 'Verbale', contenuto: { forma: 'testo', valore: '…' } });
    expect(d.luogo).toBe('DESK');
    expect(m.fotografia().active).toBe(d.id);
    expect(colore(d, m.adesso())).toBe('nessuno');
    const t = mailPronta(m);
    m.assorbi(d.id, t.id);
    expect(t.contesto.map((e) => e.nome)).toContain('Verbale');
    expect(m.fotografia().bolle.some((b) => b.id === d.id)).toBe(false);
  });
});

describe('le notifiche', () => {
  it('il badge conta solo quelle promosse e nuove, e il cassetto lo azzera', () => {
    const { m } = banco();
    m.arriva({ tipo: 'email', servizio: 'email', mittente: 'Andrea Riva', oggetto: 'Proposta Acme', testo: '…', promossa: true });
    m.arriva({ tipo: 'email', servizio: 'email', mittente: 'Newsletter', oggetto: 'Tendenze', testo: '…', promossa: false });
    expect(m.badge()).toBe(1);
    m.apriCassetto();
    expect(m.badge()).toBe(0);
    expect(m.fotografia().notifiche).toHaveLength(2);
  });

  it('«me ne occupo» fa una bozza nella dropzone, sposta quella in corso, e richiude il cassetto', () => {
    const { m } = banco();
    const prima = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a' });
    const n = m.arriva({ tipo: 'email', servizio: 'email', mittente: 'Andrea Riva', oggetto: 'Proposta Acme', testo: '…', promossa: true });
    m.apriCassetto();
    const t = m.occupatene(n.id, { nome: 'Rispondere ad Andrea', richiesta: 'rispondere sulla proposta' });
    expect(t.stato).toBe('T_DRAFT');
    expect(t.luogo).toBe('DROPZONE');
    expect(prima.luogo).toBe('SIDEBAR');
    expect(m.fotografia().cassettoAperto).toBe(false);
    expect(m.fotografia().notifiche).toHaveLength(0);
  });
});

describe('la coda di lavoro', () => {
  it('conferma, risposta e ripresa mettono il task in coda, una volta per volta', () => {
    const { m } = banco();
    const t = m.componi({ tipo: 'email', nome: 'Scrivere a Elena', richiesta: 'a' });
    m.conferma(t.id);
    expect(m.prendiLavoro()?.id).toBe(t.id);
    expect(m.prendiLavoro()).toBeUndefined();
    m.chiedi(t.id, 'Anche lunedì?', ['sì', 'no']);
    expect(m.prendiLavoro()).toBeUndefined();
    m.rispondiDomanda('no');
    expect(m.prendiLavoro()?.note).toEqual(['Domanda: Anche lunedì? Risposta: no']);
    m.pronto(t.id, 'Cara Elena', ['manda la mail']);
    m.riprendi(t.id, 'cambia il venerdì in giovedì');
    expect(m.prendiLavoro()?.id).toBe(t.id);
  });
});
