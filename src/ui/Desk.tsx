// DESK: le bolle, su una scrivania e non su una griglia (`docs/design/L0` leggi 09 e 10).
//
// Una bolla prende posto quando entra in DESK, nel punto più libero, e ci resta: un task
// non si sposta perché stai parlando (legge 08). La dimensione racconta il contenuto, non
// il rango. Quando una bolla esce svanisce sul posto: non si contrae e non migra.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Bolla as TBolla, Task } from '../modello/tipi.ts';
import { Icona, colore, targaDi, tinta, useAdesso, useFotografia, useMotore } from './comune.tsx';

interface Posto {
  x: number;
  y: number;
}

/** Larghezza della taglia Task: 348–452, secondo quanto c'è da leggere (`docs/design/L0` §Le quattro taglie). */
function larghezza(b: TBolla): number {
  const testo = `${b.nome} ${b.genere === 'task' ? (b.corpo ?? '') : b.contenuto.valore.slice(0, 200)}`;
  return Math.round(Math.min(452, Math.max(348, 300 + testo.length * 1.1)));
}

/** Un numero stabile da un id: le posizioni sono irregolari per natura, non a caso. */
function seme(id: string): number {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

function sovrapposizione(a: DOMRectLike, b: DOMRectLike): number {
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return w * h;
}

interface DOMRectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Il punto più libero dell'area, per una bolla nuova. */
function trovaPosto(id: string, w: number, area: DOMRectLike, occupati: DOMRectLike[]): Posto {
  const h = 170;
  const s = seme(id);
  let meglio: Posto = { x: area.x, y: area.y };
  let costo = Infinity;
  const passiX = 9;
  const passiY = 7;
  for (let i = 0; i < passiX; i++) {
    for (let j = 0; j < passiY; j++) {
      const x = area.x + ((area.w - w) * (i + 0.5 * s)) / (passiX - 0.5);
      const y = area.y + ((area.h - h) * (j + 0.5 * ((s * 7) % 1))) / (passiY - 0.5);
      const r = { x, y, w, h };
      // Meno sovrapposizione possibile, e a parità vicino al centro dell'area.
      const c =
        occupati.reduce((t, o) => t + sovrapposizione(r, o), 0) +
        Math.hypot(x + w / 2 - (area.x + area.w * 0.42), y + h / 2 - (area.y + area.h * 0.45)) * 2;
      if (c < costo) {
        costo = c;
        meglio = { x: Math.max(area.x, Math.min(x, area.x + area.w - w)), y: Math.max(area.y, Math.min(y, area.y + area.h - h)) };
      }
    }
  }
  return meglio;
}

/** Lo spazio che resta alla DESK: fuori dai margini, dalla pila di destra e da INPUT. */
function areaDesk(): DOMRectLike {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return { x: 44 + 60, y: 90, w: Math.max(400, W - 44 - 60 - 470), h: Math.max(240, H - 90 - 200) };
}

export function Desk() {
  const f = useFotografia();
  const posti = useRef(new Map<string, Posto>());
  const [uscenti, setUscenti] = useState<TBolla[]>([]);
  const prima = useRef<readonly TBolla[]>([]);
  const inDesk = f.bolle.filter((b) => b.luogo === 'DESK' && b.id !== f.focus);

  // Chi esce da DESK in qualsiasi modo svanisce sul posto; chi ci torna riprende il suo posto.
  useLayoutEffect(() => {
    const ora = new Set(inDesk.map((b) => b.id));
    const usciti = prima.current.filter((b) => !ora.has(b.id) && b.id !== f.focus);
    if (usciti.length) {
      setUscenti((u) => [...u, ...usciti]);
      setTimeout(() => setUscenti((u) => u.filter((x) => !usciti.includes(x))), 340);
    }
    prima.current = inDesk;
  });

  const area = areaDesk();
  for (const b of inDesk) {
    if (!posti.current.has(b.id)) {
      const occupati = [...posti.current.entries()]
        .filter(([id]) => inDesk.some((x) => x.id === id))
        .map(([id, p]) => ({ ...p, w: larghezza(inDesk.find((x) => x.id === id)!), h: 170 }));
      posti.current.set(b.id, trovaPosto(b.id, larghezza(b), area, occupati));
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {uscenti.map((b) => (
        <Posata key={`u-${b.id}`} posto={posti.current.get(b.id)} classe="svanisce">
          <Bolla b={b} active={false} />
        </Posata>
      ))}
      {inDesk.map((b) => (
        <Posata key={b.id} posto={posti.current.get(b.id)} classe="nasce">
          <Bolla b={b} active={f.active === b.id} />
        </Posata>
      ))}
      {f.focus && <Focus id={f.focus} />}
    </div>
  );
}

function Posata({ posto, classe, children }: { posto?: Posto; classe: string; children: React.ReactNode }) {
  if (!posto) return null;
  return (
    <div className={`absolute ${classe}`} style={{ left: posto.x, top: posto.y }}>
      {children}
    </div>
  );
}

/** La barra vive nella bolla piena, non nel chip: solo quando il dato è una frazione. */
function Frazione({ dato }: { dato?: string }) {
  const m = dato?.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) return null;
  const quota = Math.min(1, Number(m[1]) / Math.max(1, Number(m[2])));
  return (
    <div className="mt-3 h-[3px] rounded-full" style={{ background: 'rgba(148,150,142,.35)' }}>
      <div className="h-full rounded-full" style={{ width: `${quota * 100}%`, background: 'var(--azzurro)' }} />
    </div>
  );
}

/** La bolla, taglia Task. Contesto e corpo; le frasi stanno in INPUT (`L2 - Bubble`, `L3 - Flusso task`). */
export function Bolla({ b, active }: { b: TBolla; active: boolean }) {
  const m = useMotore();
  const adesso = useAdesso(m, 5000);
  const c = colore(b, adesso);
  const corpo = b.genere === 'task' ? (b.corpo ?? (b.stato === 'T_LAVORAZIONE' ? undefined : b.richiesta)) : b.contenuto.valore;
  const lavora = b.genere === 'task' && b.stato === 'T_LAVORAZIONE';
  return (
    <div
      className={`${active ? 'vetro-fuoco' : 'vetro'} ${lavora ? 'lavora' : ''} rounded-[26px] px-[22px] py-5`}
      style={{ width: larghezza(b) }}
    >
      <div className="flex items-center gap-2" style={{ color: tinta(c) }}>
        {active && <span className="pallino" aria-label="active" />}
        <Icona tipo={b.tipo} />
        <span className="targa">{targaDi(b, adesso)}</span>
      </div>
      <div className="mt-3 truncate text-[21px] font-semibold leading-tight tracking-[-0.02em]" style={{ color: 'var(--i)' }}>
        {b.nome}
      </div>
      {corpo && (
        <div className="mt-2 line-clamp-2 text-[15.5px] leading-[1.45]" style={{ color: 'var(--i)', opacity: 0.7 }}>
          {corpo}
        </div>
      )}
      {b.genere === 'task' && <Frazione dato={b.dato} />}
    </div>
  );
}

/** La bolla in focus: tutta la DESK, e cambia scala anche dentro (`L2 - Bubble` §La bolla focus). */
function Focus({ id }: { id: string }) {
  const f = useFotografia();
  const m = useMotore();
  const adesso = useAdesso(m, 5000);
  const b = f.bolle.find((x) => x.id === id);
  if (!b) return null;
  const c = colore(b, adesso);
  const task = b.genere === 'task' ? (b as Task) : undefined;
  const corpo = b.genere === 'task' ? (b.corpo ?? b.richiesta) : b.contenuto.valore;
  const destinatario = task?.uscita ? ` · per ${task.uscita.a}` : '';
  return (
    <div
      className="vetro-fuoco nasce pointer-events-auto absolute flex flex-col overflow-hidden rounded-[30px] px-[42px] py-[38px]"
      style={{
        left: 44,
        top: 40,
        width: 'min(920px, calc(100vw - 44px - 476px))',
        height: 'min(690px, calc(100vh - 40px - 170px))',
      }}
    >
      <div className="flex items-center gap-2" style={{ color: tinta(c) }}>
        {f.active === b.id && <span className="pallino" aria-label="active" />}
        <Icona tipo={b.tipo} misura={16} />
        <span className="targa text-[11px]">
          {targaDi(b, adesso)}
          {destinatario}
        </span>
      </div>
      <div className="mt-4 truncate text-[46px] font-extralight leading-[1.1] tracking-[-0.035em]">{b.nome}</div>
      <div className="mt-6 flex min-h-0 flex-1 gap-10">
        <div className="min-w-0 flex-1 overflow-auto whitespace-pre-line text-[19px] font-light leading-[1.6]" style={{ opacity: 0.8 }}>
          {b.genere === 'documento' && b.contenuto.forma === 'immagine' ? (
            <img src={b.contenuto.valore} alt={b.nome} className="max-h-full rounded-2xl" style={{ filter: 'saturate(.6)' }} />
          ) : (
            corpo
          )}
        </div>
        {task && task.contesto.length > 0 && (
          <div className="flex w-[340px] flex-none flex-col gap-3">
            {task.contesto.map((e, i) => (
              <div key={i} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[14px]" style={{ background: 'var(--tessera)' }}>
                <Icona tipo={e.tipo} />
                <span className="truncate">{e.nome}</span>
                {e.dato && <span className="mono ml-auto text-[12px]" style={{ color: 'var(--i-fioco)' }}>{e.dato}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Tiene la posizione aggiornata al ridimensionamento: le aree rispondono allo schermo (legge 08). */
export function useRidisegnaAlRidimensionamento(): void {
  const [, set] = useState(0);
  useEffect(() => {
    const fn = () => set((x) => x + 1);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
}
