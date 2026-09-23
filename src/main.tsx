// L'avvio: si leggono i documenti dell'utente attivo dalla porta dell'archivio, si mettono
// in piedi il motore, l'AI e la chat raw, e si disegna lo schermo.

import './ui/stile.css';
import '../docs/design/profilebar.css';
import { createRoot } from 'react-dom/client';
import { Motore } from './modello/motore.ts';
import { orologioVero } from './modello/orologio.ts';
import { consegna } from './servizi/servizi.ts';
import { ChatRaw } from './archivio/chatRaw.ts';
import { portaAi } from './ai/porta.ts';
import { Turni } from './ai/turno.ts';
import { leggiOrario, leggiPreferenze, leggiSistema } from './conoscenza/profilo.ts';
import { App } from './ui/App.tsx';
import { Voce } from './voce/voce.ts';

const CASA = '/archivio/user_123';

async function leggi(percorso: string): Promise<string> {
  const r = await fetch(`${CASA}/${percorso}`);
  return r.ok ? r.text() : '';
}

async function esiste(percorso: string): Promise<string | undefined> {
  const r = await fetch(`${CASA}/${percorso}`, { method: 'GET' });
  return r.ok ? `${CASA}/${percorso}` : undefined;
}

/**
 * Le notifiche del prototipo.
 *
 * Nel prototipo i servizi sono documenti di contesto e non mandano niente da sé: le righe
 * «ricevuta» dello storico di `services/email.txt` diventano notifiche all'avvio, tutte
 * promosse (storico §135).
 */
function notificheDallaPosta(testo: string, m: Motore): void {
  for (const riga of testo.split(/\r?\n/)) {
    const [quando, verso, mittente, oggetto, corpo] = riga.split('|').map((x) => x.trim());
    if (verso !== 'ricevuta' || !mittente || !oggetto) continue;
    const ms = Date.parse((quando ?? '').replace(' ', 'T'));
    m.arriva({
      tipo: 'email',
      servizio: 'email',
      mittente,
      oggetto,
      testo: corpo ?? '',
      promossa: true,
      quando: Number.isNaN(ms) ? undefined : ms,
    });
  }
}

async function avvia(): Promise<void> {
  const [preferenze, sistema, memoria, posta, avatar] = await Promise.all([
    leggi('preferences.txt'),
    leggi('system.txt'),
    leggi('memory/general.txt'),
    leggi('services/email.txt'),
    esiste('filesystem/Home/avatar.jpg'),
  ]);
  const p = leggiPreferenze(preferenze);
  const ambiente = { preferenze: p, macchina: leggiSistema(sistema), orario: leggiOrario(memoria), avatar };

  // Il tema si sceglie nel profilo, e niente lo sceglie dal dispositivo (`docs/L04`).
  const radice = document.documentElement;
  // I due materiali stanno in `docs/design/materiali.css` e `temi.css`, e si sceglie con
  // `material` nel profilo (`docs/L03`, storico §137).
  radice.dataset.tema = p.material === 'dark' ? 'scuro' : 'chiaro';
  if (p.theme) radice.dataset.colori = p.theme;
  // Il fondo è quello del tema, `--f1 … --f4`: `wallpaper.jpg` non lo è (storico §135).
  radice.lang = p.utente.language === 'english' ? 'en' : 'it';

  const motore = new Motore(orologioVero, consegna);
  // Un errore di formato nel profilo va detto, non ignorato in silenzio (`docs/L03`).
  if (p.errori.length) motore.segnalaGuasto('profilo', `preferences.txt: ${p.errori.join('; ')}`);
  const chat = new ChatRaw((t) => motore.segnalaGuasto('chat-raw', t));
  const turni = new Turni(motore, portaAi, chat);
  notificheDallaPosta(posta, motore);
  setInterval(() => motore.batti(), 1000);

  // La voce legge le risposte, se il profilo lo vuole e la bocca non è muta.
  let muta = ambiente.macchina.volume === 0;
  const voce = new Voce(
    p.assistente.voice,
    () => (ambiente.macchina.volume ?? 40) / 100,
    () => p.assistente.reading && !muta,
    (t) => motore.segnalaGuasto('voce', t),
  );
  let letta: string | undefined;
  motore.ascolta(() => {
    const r = motore.fotografia().scambio?.risposta;
    if (r && r !== letta) voce.di(r);
    letta = r;
  });

  createRoot(document.getElementById('palco')!).render(
    <App
      motore={motore}
      ambiente={ambiente}
      suFrase={(t) => void turni.conversa(t)}
      suMuta={(si) => {
        muta = si;
        if (si) voce.zitta();
      }}
    />,
  );
}

void avvia();
