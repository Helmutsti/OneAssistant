// I pezzi che tutte le aree usano: le icone, il colore di uno stato, le parole della targa,
// e l'aggancio al motore.

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import {
  AlarmClock,
  Calendar,
  FileText,
  Folder,
  Image,
  Mail,
  MapPin,
  MessageCircle,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Fotografia, Motore } from '../modello/motore.ts';
import { colore, type Bolla, type Colore, type Elemento } from '../modello/tipi.ts';

/** Le icone di tipo (`docs/design/L0` legge 06), dalla famiglia Lucide. */
export const ICONE: Record<Elemento['tipo'], LucideIcon> = {
  email: Mail,
  cartella: Folder,
  documento: FileText,
  contatto: User,
  persone: Users,
  conversazione: MessageCircle,
  immagine: Image,
  sveglia: AlarmClock,
  indirizzo: MapPin,
  appuntamento: Calendar,
  task: FileText,
};

export function Icona({ tipo, misura = 14, colore: c }: { tipo: Elemento['tipo']; misura?: number; colore?: string }) {
  const I = ICONE[tipo];
  return <I size={misura} strokeWidth={1.75} color={c ?? 'currentColor'} className="flex-none" aria-hidden />;
}

/** Il valore di un colore di stato. «Nessuno» è l'inchiostro. */
export function tinta(c: Colore): string {
  return c === 'nessuno' ? 'var(--i)' : `var(--${c})`;
}

/**
 * La tinta velata del chip: ambra al 30%, azzurro al 22% (`docs/design/L0` §SIDEBAR). Una
 * bozza prende il colore della bozza (storico §138).
 *
 * DA DEFINIRE: il velo del grigio. `L0` dà solo quelli dell'ambra e dell'azzurro; qui è al
 * 22% come l'azzurro, che sta alla stessa luminanza (legge 04), finché non è scritto.
 */
export function velo(c: Colore): string | undefined {
  if (c === 'ambra') return 'linear-gradient(rgba(237,163,28,.30), rgba(237,163,28,.30))';
  if (c === 'azzurro') return 'linear-gradient(rgba(0,157,214,.22), rgba(0,157,214,.22))';
  if (c === 'grigio') return 'linear-gradient(rgba(148,150,142,.22), rgba(148,150,142,.22))';
  return undefined;
}

const ora = (ms: number) => new Date(ms).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

/** Le parole della targa: nascono dallo stato. La bolla documento dice tipo e provenienza. */
export function targaDi(b: Bolla, adesso: number): string {
  if (b.genere === 'documento') return `${b.tipo}${b.provenienza ? ` · da ${b.provenienza}` : ''}`;
  if (b.invio) return 'sto mandando';
  switch (b.stato) {
    case 'T_DRAFT':
      return 'bozza';
    case 'T_LAVORAZIONE':
      return 'ci sto lavorando';
    case 'T_ATTESA':
      if (b.attesa === 'risposta') return 'ti sto chiedendo';
      if (b.attesa === 'ora' && b.ora !== undefined && b.ora > adesso) {
        return `${b.perOra === 'programmato' ? 'programmata' : 'rimandata'} · ${ora(b.ora)}`;
      }
      if (b.attesa === 'fermo') return 'fermo · aspetta te';
      return 'aspetta te';
    case 'T_CONCLUSIONE':
      return 'fatto';
  }
}

export { colore, ora };

// ─── l'aggancio al motore ───────────────────────────────────────────

export const MotoreCtx = createContext<Motore | null>(null);

export function useMotore(): Motore {
  const m = useContext(MotoreCtx);
  if (!m) throw new Error('manca il motore');
  return m;
}

export function useFotografia(): Fotografia {
  const m = useMotore();
  return useSyncExternalStore(
    (fn) => m.ascolta(fn),
    () => m.fotografia(),
  );
}

/** L'ora che cammina, per chi la mostra. Un battito al secondo basta. */
export function useAdesso(m: Motore, ogni = 1000): number {
  const [t, setT] = useState(() => m.adesso());
  useEffect(() => {
    const id = setInterval(() => setT(m.adesso()), ogni);
    return () => clearInterval(id);
  }, [m, ogni]);
  return t;
}
