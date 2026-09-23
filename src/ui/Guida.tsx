// La pila di destra: TIMELINE, PROFILEBAR, SYSTEMBAR, SIDEBAR, ancorata in alto a destra e
// impilata con 22 px d'aria. Se un componente cresce, quelli sotto si muovono con lui; se
// uno scompare, la pila si richiude (`docs/design/L0` legge 11).

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Battery, House, MapPin, Mic, MicOff, Volume2, VolumeX, Wifi, WifiOff, Briefcase } from 'lucide-react';
import { PREAVVISO_MS, type Bolla, type Task } from '../modello/tipi.ts';
import type { Luogo, Macchina, Preferenze } from '../conoscenza/profilo.ts';
import { Icona, colore, ora, tinta, useAdesso, useFotografia, useMotore, velo } from './comune.tsx';

export interface Ambiente {
  readonly preferenze: Preferenze;
  readonly macchina: Macchina;
  readonly orario: ReadonlyArray<{ da: number; a: number }>;
  readonly avatar?: string;
}

export function Guida({ ambiente, muta, suMuta }: { ambiente: Ambiente; muta: boolean; suMuta: () => void }) {
  return (
    <div className="pointer-events-none absolute right-[44px] top-[40px] flex flex-col items-end gap-[22px]">
      <Timeline orario={ambiente.orario} />
      <Profilebar ambiente={ambiente} />
      <Systembar macchina={ambiente.macchina} muta={muta} suMuta={suMuta} />
      <Sidebar />
    </div>
  );
}

// ─── TIMELINE ───────────────────────────────────────────────────────

function durata(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return `${h === 1 ? 'un’ora' : `${h} ore`}${r ? ` e ${r}` : ''}`;
}

function breve(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60_000));
  return min < 60 ? `${min} min` : `${Math.round(min / 60)} h`;
}

/** Minuti dall'inizio del giorno, all'ora locale. */
function minuti(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

/**
 * Dove sei dentro la giornata: cosa stai facendo e da quanto, cosa viene dopo e fra quanto,
 * e il filo della giornata di lavoro (`docs/L02` §TIMELINE, `L2 - TIMELINE`). Inchiostro
 * diretto sul fondo, nessuna bolla; non si apre, non si contrae, non si preme.
 */
function Timeline({ orario }: { orario: ReadonlyArray<{ da: number; a: number }> }) {
  const m = useMotore();
  const f = useFotografia();
  const adesso = useAdesso(m, 15_000);

  // Da quanto ci stai: da quando la bolla è diventata la active.
  const dalla = useRef<{ id?: string; da: number }>({ da: adesso });
  if (dalla.current.id !== f.active) dalla.current = { id: f.active, da: adesso };

  const active = f.bolle.find((b) => b.id === f.active);
  const programmati = f.bolle
    .filter((b): b is Task => b.genere === 'task' && b.attesa === 'ora' && b.ora !== undefined && b.ora > adesso)
    .sort((a, b) => a.ora! - b.ora!);
  const dopo = programmati[0];
  const vicino = dopo && dopo.ora! - adesso <= PREAVVISO_MS;

  // Il tempo libero: fino alla prossima cosa, o alla fine della fascia di lavoro in corso.
  const oraMin = minuti(adesso);
  const fascia = orario.find((x) => oraMin >= x.da && oraMin < x.a);
  const fineFascia = fascia ? adesso + (fascia.a - oraMin) * 60_000 : undefined;
  const libero = Math.min(dopo?.ora ?? Infinity, fineFascia ?? Infinity) - adesso;

  // Il filo: la giornata di lavoro in 242 px.
  const inizio = orario[0]?.da ?? 9 * 60;
  const fine = orario.at(-1)?.a ?? 18 * 60;
  const x = (min: number) => Math.max(0, Math.min(242, ((min - inizio) / (fine - inizio)) * 242));
  const daMin = minuti(dalla.current.da);

  return (
    <div className="flex flex-col items-end gap-[6px] text-right">
      {active ? (
        <>
          <span className="targa text-[10px]" style={{ color: tinta(colore(active, adesso)) }}>
            adesso · da {breve(adesso - dalla.current.da)}
          </span>
          {/* 20/600: il peso che la legge 07 ammette per l'«adesso» (storico §142). */}
          <span className="max-w-[300px] truncate text-[20px] font-semibold tracking-[-0.02em]">{active.nome}</span>
        </>
      ) : (
        <>
          <span className="targa text-[10px]" style={{ color: 'var(--i-fioco)' }}>libero</span>
          <span className="text-[18px] font-medium tracking-[-0.02em]">
            {Number.isFinite(libero) ? durata(libero) : 'fuori orario'}
          </span>
        </>
      )}
      <span className="targa mt-1 text-[10px]" style={{ color: vicino ? 'var(--ambra)' : 'var(--i-fioco)' }}>
        dopo{dopo ? ` · fra ${breve(dopo.ora! - adesso)}` : ''}
      </span>
      <span
        className="max-w-[300px] truncate text-[20px] font-medium tracking-[-0.02em]"
        style={{ color: vicino ? 'var(--i)' : 'var(--i-corpo)' }}
      >
        {dopo ? dopo.nome : 'niente in programma'}
      </span>
      <svg width="250" height="12" className="mt-2" aria-hidden>
        <rect x="4" y="4.5" width="242" height="3" rx="1.5" fill="rgba(148,150,142,.45)" />
        {active && (
          <rect x={4 + x(daMin)} y="4.5" width={Math.max(0, x(oraMin) - x(daMin))} height="3" rx="1.5" fill={tinta(colore(active, adesso))} />
        )}
        {active && <circle cx={4 + x(daMin)} cy="6" r="4.5" fill={tinta(colore(active, adesso))} stroke="rgba(255,255,255,.8)" strokeWidth="1.5" />}
        {dopo && (
          <circle
            cx={4 + x(minuti(dopo.ora!))}
            cy="6"
            r="4.5"
            fill={vicino ? 'var(--ambra)' : 'var(--grigio)'}
            stroke="rgba(255,255,255,.8)"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
}

// ─── PROFILEBAR ─────────────────────────────────────────────────────

/** Il luogo conosciuto per la posizione GPS, se il profilo lo nomina (`docs/L02` §PROFILEBAR). */
function luogoConosciuto(posizione: string | undefined, focuses: readonly Luogo[]): Luogo | undefined {
  if (!posizione) return undefined;
  const p = posizione.toLowerCase();
  return focuses.find((l) => l.indirizzo.toLowerCase() === p || p.includes(l.indirizzo.toLowerCase()));
}

/**
 * Quando sono, dove sono, chi sono. È una bolla, e si stringe sul suo contenuto
 * (`docs/design/profilebar.css`).
 *
 * Il WorkMode non compare: `docs/L02` dice che GPS e data e ora contribuiscono a
 * definirlo, ma non come, e finché non è scritto non si inventa (storico §135).
 */
function Profilebar({ ambiente }: { ambiente: Ambiente }) {
  const m = useMotore();
  const adesso = useAdesso(m, 10_000);
  const d = new Date(adesso);
  const luogo = luogoConosciuto(ambiente.macchina.posizione, ambiente.preferenze.focuses);
  const casa = luogo && /casa/i.test(luogo.nome);
  return (
    <div className="profile-veil">
      <div className="profile-context">
        <div className="profile-date">
          <time className="mono">{ora(adesso)}</time>
          <span>{d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
        {(luogo || ambiente.macchina.posizione) && (
          <div className="profile-location">
            <span className="profile-place">
              {luogo ? casa ? <House size={14} /> : <Briefcase size={14} /> : <MapPin size={14} />}
              {luogo?.nome ?? ambiente.macchina.posizione}
            </span>
          </div>
        )}
      </div>
      {ambiente.avatar && <img className="profile-avatar" src={ambiente.avatar} alt={ambiente.preferenze.utente.name ?? ''} />}
    </div>
  );
}

// ─── SYSTEMBAR ──────────────────────────────────────────────────────

/**
 * La macchina: chi ti sente, quanto suona, com'è la rete, quanta batteria resta. Ordine
 * fisso, il microfono sempre per primo; il colore qui significa privacy. Inchiostro diretto
 * sul fondo (`docs/L02` §SYSTEMBAR, `L2 - Systembar`).
 *
 * Il microfono dice quello che scrive `system.txt`, e premerlo non fa niente: l'ascolto è
 * una fase futura (`docs/L04`, storico §138, `tasks/future.md`). Spento dice SCRIVI, in ambra.
 */
function Systembar({ macchina, muta, suMuta }: { macchina: Macchina; muta: boolean; suMuta: () => void }) {
  const aperto = macchina.microfono === 'acceso';
  const rete = macchina.rete?.match(/"([^"]+)"/)?.[1] ?? macchina.rete;
  return (
    <div className="mono flex items-center gap-4 text-[11px] uppercase tracking-[0.08em]" style={{ color: 'var(--i-corpo)' }}>
      <span className="flex items-center gap-[6px]" style={{ color: aperto ? 'var(--verde)' : 'var(--ambra)' }}>
        {aperto ? <Mic size={14} /> : <MicOff size={14} />}
        {aperto ? 'solo tu' : 'scrivi'}
      </span>
      <button
        type="button"
        onClick={suMuta}
        className="pointer-events-auto flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 uppercase"
        style={{ color: 'inherit', font: 'inherit', letterSpacing: 'inherit' }}
        aria-label={muta ? 'riaccendi la voce' : 'spegni la voce'}
      >
        {muta ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {muta ? 'muta' : (macchina.volume ?? '—')}
      </button>
      <span className="flex items-center gap-[6px]">
        {rete ? <Wifi size={14} /> : <WifiOff size={14} />}
        {rete ?? 'senza rete'}
      </span>
      {macchina.batteria !== undefined && (
        <span className="flex items-center gap-[6px]">
          <Battery size={14} />
          {macchina.batteria}%
        </span>
      )}
    </div>
  );
}

// ─── SIDEBAR ────────────────────────────────────────────────────────

/** Un chip è alto 30, e fra l'uno e l'altro ci sono 10 px. */
const PASSO = 40;
/** Sopra la campanella, 44 dal fondo e alta 44, resta l'aria della guida: 22. */
const FINO_ALLA_CAMPANELLA = 44 + 44 + 22;

/**
 * I chip: le bolle tolte dalla DESK, i rimandati, le bozze sganciate. L'ambra sta in cima;
 * gli altri seguono nell'ordine in cui sono arrivati (`docs/L02` §SIDEBAR).
 *
 * Non c'è un tetto: se ne mostrano quanti ne entrano fino alla campanella, e quelli che non
 * entrano diventano un numero, senza colore (storico §145).
 */
function Sidebar() {
  const m = useMotore();
  const f = useFotografia();
  const adesso = useAdesso(m, 5000);
  const pila = useRef<HTMLDivElement>(null);
  const [posti, setPosti] = useState(Infinity);
  useLayoutEffect(() => {
    const misura = () => {
      const cima = pila.current?.getBoundingClientRect().top;
      if (cima === undefined) return;
      setPosti(Math.max(1, Math.floor((window.innerHeight - FINO_ALLA_CAMPANELLA - cima + 10) / PASSO)));
    };
    misura();
    window.addEventListener('resize', misura);
    return () => window.removeEventListener('resize', misura);
  });
  const chip = f.bolle
    .filter((b) => b.luogo === 'SIDEBAR')
    .sort((a, b) => {
      const aa = colore(a, adesso) === 'ambra' ? 0 : 1;
      const bb = colore(b, adesso) === 'ambra' ? 0 : 1;
      return aa - bb || a.arrivo - b.arrivo;
    });
  if (!chip.length) return null;
  const visti = chip.length > posti ? chip.slice(0, posti - 1) : chip;
  const resto = chip.length - visti.length;
  return (
    <div ref={pila} className="flex flex-col items-end gap-[10px]">
      {visti.map((b) => (
        <Chip key={b.id} b={b} adesso={adesso} />
      ))}
      {resto > 0 && (
        <div className="vetro flex h-[30px] items-center rounded-[20px] px-[14px]">
          <span className="mono text-[12px]" style={{ color: 'var(--i-corpo)' }}>+{resto}</span>
        </div>
      )}
    </div>
  );
}

function datoDelChip(b: Bolla, adesso: number): string | undefined {
  if (b.genere !== 'task') return undefined;
  // L'invio in Delay: azzurro, e il dato dice che il lavoro è fatto (`L2 - Sidebar` §Finita).
  if (b.invio) return 'fatto';
  if (b.attesa === 'ora' && b.ora !== undefined && b.ora > adesso) return ora(b.ora);
  if (b.stato === 'T_DRAFT') return 'bozza';
  return b.dato;
}

/** Un chip è una bolla che si è stretta: icona di tipo, nome, un dato solo. Alto 30, raggio 20. */
function Chip({ b, adesso }: { b: Bolla; adesso: number }) {
  const c = colore(b, adesso);
  const rimandato = b.genere === 'task' && b.attesa === 'ora' && (b.ora ?? 0) > adesso;
  const dato = datoDelChip(b, adesso);
  const tintaVetro = velo(c);
  return (
    <div
      className={`${rimandato ? 'vetro-quieto' : 'vetro'} ${c === 'azzurro' ? 'lavora' : ''} nasce flex h-[30px] max-w-[320px] items-center gap-[9px] rounded-[20px] px-[14px]`}
      style={tintaVetro ? { background: `${tintaVetro}, var(--liquid-film)` } : undefined}
    >
      <span style={{ color: 'var(--i)' }} className="flex">
        <Icona tipo={b.tipo} />
      </span>
      <span className="truncate text-[14px] leading-none">{b.nome}</span>
      {dato && (
        <span className="mono flex-none text-[11px] leading-none" style={{ color: 'var(--i-corpo)' }}>
          {dato}
        </span>
      )}
    </div>
  );
}

/** Per il suono delle notifiche e per la voce: la bocca si spegne e si riaccende premendola. */
export function useVoceMuta(iniziale: boolean): [boolean, () => void] {
  const [muta, set] = useState(iniziale);
  useEffect(() => set(iniziale), [iniziale]);
  return [muta, () => set((x) => !x)];
}

