// DESK: le bolle, su una scrivania e non su una griglia (`docs/design/L0` leggi 09 e 10).
//
// Una bolla prende posto quando entra in DESK, nel punto più libero, e ci resta: un task
// non si sposta perché stai parlando (legge 08). La dimensione racconta il contenuto, non
// il rango. Quando una bolla esce svanisce sul posto: non si contrae e non migra.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Bolla as TBolla, Task } from '../modello/tipi.ts';
import { Icona, colore, targaDi, tinta, useAdesso, useFotografia, useMotore } from './comune.tsx';
import {
  CONTRAZIONE_MS,
  CURVA,
  MIGRAZIONE_MS,
  NASCITA_MS,
  ONDA,
  RIENTRO,
  SFALSAMENTO_MS,
  USCITA_MS,
  arco,
  arriva,
  fermo,
  parte,
  rettangolo,
  type Rettangolo,
} from './movimento.ts';

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

/** Quanto può salire la dropzone sopra INPUT, anche quando ancora non c'è. */
const RISERVA_DROPZONE = 160;

/**
 * Lo spazio che resta alla DESK (`docs/design/L0` legge 11): fuori dai margini, a sinistra
 * della pila di destra, e sopra la pila di INPUT con la sua dropzone, più l'aria di 22.
 */
function areaDesk(): DOMRectLike {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const input = document.querySelector('[data-parte=input]')?.getBoundingClientRect().top ?? H - 44 - 40;
  const guida = document.querySelector('[data-parte=guida]')?.getBoundingClientRect().left ?? W - 44 - 400;
  const fondo = input - RISERVA_DROPZONE - 22;
  return { x: 44, y: 40, w: Math.max(348, guida - 22 - 44), h: Math.max(170, fondo - 40) };
}

/** Un'uscita dalla scrivania: la bolla, dov'era, e dove va se va da qualche parte. */
interface Uscente {
  readonly b: TBolla;
  readonly posto: Posto;
  /** Il chip in cui si trasforma, per la messa da parte. Senza, svanisce sul posto. */
  readonly verso?: Rettangolo;
}

/** Le bolle più vicine a un punto, dalla più vicina, con la direzione che le allontana. */
function vicine(punto: { x: number; y: number }, altre: Array<{ id: string; r: Rettangolo }>) {
  return altre
    .map(({ id, r }) => {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const d = Math.hypot(cx - punto.x, cy - punto.y) || 1;
      return { id, r, d, ux: (cx - punto.x) / d, uy: (cy - punto.y) / d };
    })
    .sort((p, q) => p.d - q.d)
    .slice(0, ONDA.length);
}

export function Desk() {
  const f = useFotografia();
  const posti = useRef(new Map<string, Posto>());
  const [uscenti, setUscenti] = useState<Uscente[]>([]);
  const prima = useRef<{ bolle: readonly TBolla[]; dropzone?: Rettangolo; chip: Map<string, Rettangolo> }>({
    bolle: [],
    chip: new Map(),
  });
  const inDesk = f.bolle.filter((b) => b.luogo === 'DESK' && b.id !== f.focus);

  useLayoutEffect(() => {
    const ieri = prima.current;
    const eraInDesk = new Set(ieri.bolle.filter((b) => b.luogo === 'DESK').map((b) => b.id));
    const oraInDesk = new Set(inDesk.map((b) => b.id));
    const nodo = (id: string) => document.querySelector<HTMLElement>(`[data-posto="${CSS.escape(id)}"]`);
    const cornici = () =>
      inDesk
        .map((b) => ({ id: b.id, r: rettangolo(nodo(b.id)) }))
        .filter((x): x is { id: string; r: Rettangolo } => x.r !== undefined);

    // ─── chi arriva ─────────────────────────────────────────────
    for (const b of inDesk) {
      if (eraInDesk.has(b.id)) continue;
      const el = nodo(b.id);
      const qui = rettangolo(el);
      if (!el || !qui) continue;
      const daDove = ieri.bolle.find((x) => x.id === b.id)?.luogo;
      // Dalla dropzone vola lungo un arco (la nascita); da un chip risale dove stava (il
      // richiamo). Quello che compare dal niente — un documento, un sotto-task — sale appena.
      const da = daDove === 'DROPZONE' ? ieri.dropzone : daDove === 'SIDEBAR' ? ieri.chip.get(b.id) : undefined;
      if (!fermo()) {
        if (da) el.animate(arco(da, qui), { duration: NASCITA_MS, easing: CURVA });
        else {
          el.animate([{ opacity: 0, transform: 'translateY(8px) scale(.98)' }, { opacity: 1, transform: 'none' }], {
            duration: NASCITA_MS,
            easing: CURVA,
          });
        }
      }
      // E le vicine fanno spazio: si allontanano lungo la retta che le unisce al punto
      // d'arrivo, le più vicine di più, ognuna 40 ms dopo la precedente, e restano dove
      // l'onda le ha lasciate con un rientro del 40%.
      const centro = { x: qui.x + qui.w / 2, y: qui.y + qui.h / 2 };
      vicine(centro, cornici().filter((x) => x.id !== b.id && eraInDesk.has(x.id))).forEach((v, i) => {
        const spinta = ONDA[i]!;
        const resta = spinta * (1 - RIENTRO);
        const p = posti.current.get(v.id);
        const vn = nodo(v.id);
        if (!p || !vn) return;
        const dx = v.ux * resta;
        const dy = v.uy * resta;
        posti.current.set(v.id, { x: p.x + dx, y: p.y + dy });
        vn.style.left = `${p.x + dx}px`;
        vn.style.top = `${p.y + dy}px`;
        if (!fermo()) {
          vn.animate(
            [
              { transform: `translate(${-dx}px, ${-dy}px)` },
              { transform: `translate(${v.ux * (spinta - resta)}px, ${v.uy * (spinta - resta)}px)`, offset: 0.45 },
              { transform: 'none' },
            ],
            { duration: NASCITA_MS, easing: CURVA, delay: NASCITA_MS * 0.5 + i * SFALSAMENTO_MS, fill: 'backwards' },
          );
        }
      });
    }

    // ─── chi se ne va ────────────────────────────────────────────
    const nuovi: Uscente[] = [];
    for (const id of eraInDesk) {
      if (oraInDesk.has(id) || id === f.focus) continue;
      const vecchia = ieri.bolle.find((x) => x.id === id)!;
      const posto = posti.current.get(id);
      if (!posto) continue;
      const adesso = f.bolle.find((x) => x.id === id);
      if (adesso?.luogo === 'SIDEBAR') {
        // Messa da parte: il chip non compare finché la bolla non l'ha raggiunto.
        const chip = rettangolo(document.querySelector(`[data-parte=chip][data-id="${CSS.escape(id)}"]`));
        if (chip && !fermo()) parte(id);
        nuovi.push({ b: vecchia, posto, verso: chip });
      } else if (!adesso) {
        nuovi.push({ b: vecchia, posto });
        // Finita: svanisce sul posto, e le vicine si riavvicinano del 40% del vuoto.
        const w = larghezza(vecchia);
        const vuoto = { x: posto.x + w / 2, y: posto.y + 85 };
        vicine(vuoto, cornici()).forEach((v, i) => {
          const p = posti.current.get(v.id);
          const vn = nodo(v.id);
          if (!p || !vn) return;
          const distanza = Math.max(0, v.d - (w + v.r.w) / 2);
          const passo = Math.min(24, distanza * RIENTRO);
          const dx = -v.ux * passo;
          const dy = -v.uy * passo;
          posti.current.set(v.id, { x: p.x + dx, y: p.y + dy });
          vn.style.left = `${p.x + dx}px`;
          vn.style.top = `${p.y + dy}px`;
          if (!fermo()) {
            vn.animate([{ transform: `translate(${-dx}px, ${-dy}px)` }, { transform: 'none' }], {
              duration: USCITA_MS,
              easing: CURVA,
              delay: USCITA_MS * 0.5 + i * SFALSAMENTO_MS,
              fill: 'backwards',
            });
          }
        });
      }
    }
    if (nuovi.length) setUscenti((u) => [...u.filter((x) => !nuovi.some((n) => n.b.id === x.b.id)), ...nuovi]);

    // Quello che servirà al prossimo giro: dov'erano la dropzone e i chip.
    const chip = new Map<string, Rettangolo>();
    document.querySelectorAll<HTMLElement>('[data-parte=chip][data-id]').forEach((el) => {
      const r = rettangolo(el);
      if (r && el.dataset.id) chip.set(el.dataset.id, r);
    });
    prima.current = { bolle: f.bolle, dropzone: rettangolo(document.querySelector('[data-parte=dropzone]')), chip };
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
      {uscenti.map((u) => (
        <Uscita key={`u-${u.b.id}`} u={u} fine={() => setUscenti((x) => x.filter((y) => y !== u))} />
      ))}
      {inDesk.map((b) => (
        <Posata key={b.id} id={b.id} posto={posti.current.get(b.id)}>
          <Bolla b={b} active={f.active === b.id} />
        </Posata>
      ))}
      {f.focus && <Focus id={f.focus} />}
    </div>
  );
}

function Posata({ id, posto, children }: { id: string; posto?: Posto; children: React.ReactNode }) {
  if (!posto) return null;
  return (
    <div data-posto={id} className="absolute" style={{ left: posto.x, top: posto.y }}>
      {children}
    </div>
  );
}

/**
 * La bolla che lascia la scrivania. Se va in SIDEBAR si contrae — perde le righe dal basso,
 * restano nome e dato — e poi vola al suo chip lungo un arco. Se ha finito, sfuma sul
 * posto: film più trasparente, scala 94%, e non vola da nessuna parte.
 */
function Uscita({ u, fine }: { u: Uscente; fine: () => void }) {
  const nodo = useRef<HTMLDivElement>(null);
  const involucro = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = nodo.current;
    const dentro = involucro.current;
    if (!el || !dentro) return;
    const chiudi = () => {
      arriva(u.b.id);
      fine();
    };
    if (fermo()) {
      chiudi();
      return;
    }
    const verso = u.verso;
    if (verso) {
      const qui = rettangolo(el)!;
      const alta = Math.min(qui.h, 76);
      // Perde le righe dal basso: l'involucro si accorcia fino a nome e dato.
      const contrazione = dentro.animate([{ height: `${qui.h}px` }, { height: `${alta}px` }], {
        duration: CONTRAZIONE_MS,
        easing: CURVA,
        fill: 'forwards',
      });
      contrazione.onfinish = () => {
        const dx = verso.x - qui.x;
        const dy = verso.y - qui.y;
        const s = verso.w / qui.w;
        const volo = el.animate(
          [
            { transform: 'none', opacity: 1 },
            { transform: `translate(${dx / 2}px, ${dy / 2 - 60}px) scale(${(s + 1) / 2})`, opacity: 0.9, offset: 0.5 },
            { transform: `translate(${dx}px, ${dy}px) scale(${s}, ${verso.h / alta})`, opacity: 0 },
          ],
          { duration: MIGRAZIONE_MS, easing: CURVA, fill: 'forwards' },
        );
        volo.onfinish = chiudi;
      };
      return;
    }
    const via = el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], {
      duration: USCITA_MS,
      easing: CURVA,
      fill: 'forwards',
    });
    via.onfinish = chiudi;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={nodo} className="pointer-events-none absolute" style={{ left: u.posto.x, top: u.posto.y, transformOrigin: 'top left' }}>
      <div ref={involucro} className="overflow-hidden rounded-[26px]">
        <Bolla b={u.b} active={false} quieta={!u.verso} />
      </div>
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
export function Bolla({ b, active, quieta = false }: { b: TBolla; active: boolean; quieta?: boolean }) {
  const m = useMotore();
  const adesso = useAdesso(m, 5000);
  const c = colore(b, adesso);
  const corpo = b.genere === 'task' ? (b.corpo ?? (b.stato === 'T_LAVORAZIONE' ? undefined : b.richiesta)) : b.contenuto.valore;
  const lavora = b.genere === 'task' && b.stato === 'T_LAVORAZIONE';
  return (
    <div
      data-parte="bolla"
      className={`vetro-strati ${active ? 'active' : ''} ${lavora ? 'lavora' : ''} rounded-[26px] px-[22px] py-5`}
      style={{ width: larghezza(b) }}
    >
      <span className="strato" style={{ background: quieta ? 'var(--liquid-quiet)' : 'var(--liquid-film)', opacity: active ? 0 : 1 }} />
      <span className="strato" style={{ background: 'var(--liquid-focus)', opacity: active ? 1 : 0 }} />
      <div data-parte="bolla-targa" className="flex items-center gap-2" style={{ color: b.genere === 'documento' ? 'var(--i-fioco)' : tinta(c) }}>
        {active && <span className="pallino" aria-label="active" />}
        <Icona tipo={b.tipo} />
        <span className="targa">{targaDi(b, adesso)}</span>
      </div>
      <div data-parte="bolla-titolo" className="mt-3 truncate text-[21px] font-semibold leading-tight tracking-[-0.035em]" style={{ color: 'var(--i)' }}>
        {b.nome}
      </div>
      {corpo && (
        <div data-parte="bolla-corpo" className="mt-2 line-clamp-2 text-[15.5px] leading-[1.45]" style={{ color: 'var(--i)', opacity: 0.7 }}>
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
  // Il focus prende tutta la DESK, e la DESK finisce 22 sopra la pila di INPUT, dropzone
  // compresa: 690 a 1440 × 900 quando INPUT è a riposo, meno quando è cresciuto. Si misura
  // dopo il disegno, perché la pila cresce nello stesso giro in cui cambia la scena.
  const [altezza, setAltezza] = useState(690);
  useLayoutEffect(() => {
    const pila = document.querySelector('[data-parte=dropzone]') ?? document.querySelector('[data-parte=input]');
    const fondo = (pila?.getBoundingClientRect().top ?? window.innerHeight - 148) - 22;
    const h = Math.max(240, Math.min(690, fondo - 40));
    if (h !== altezza) setAltezza(h);
  });
  const b = f.bolle.find((x) => x.id === id);
  if (!b) return null;
  const c = colore(b, adesso);
  const task = b.genere === 'task' ? (b as Task) : undefined;
  const corpo = b.genere === 'task' ? (b.corpo ?? b.richiesta) : b.contenuto.valore;
  const destinatario = task?.uscita ? ` · per ${task.uscita.a}` : '';
  return (
    <div
      data-parte="focus"
      className="vetro-fuoco nasce pointer-events-auto absolute flex flex-col overflow-hidden rounded-[30px] px-[42px] py-[38px]"
      style={{
        left: 44,
        top: 40,
        width: 'min(920px, calc(100vw - 44px - 476px))',
        height: altezza,
      }}
    >
      <div className="flex items-center gap-2" style={{ color: b.genere === 'documento' ? 'var(--i-fioco)' : tinta(c) }}>
        {f.active === b.id && <span className="pallino" aria-label="active" />}
        <Icona tipo={b.tipo} misura={16} />
        <span data-parte="focus-targa" className="targa text-[11px]">
          {targaDi(b, adesso)}
          {destinatario}
        </span>
      </div>
      <div data-parte="focus-titolo" className="mt-4 truncate text-[46px] font-extralight leading-[1.1] tracking-[-0.035em]">{b.nome}</div>
      <div className="mt-6 flex min-h-0 flex-1 gap-10">
        <div data-parte="focus-corpo" className="min-w-0 flex-1 overflow-auto whitespace-pre-line text-[19px] font-light leading-[1.6]" style={{ opacity: 0.8 }}>
          {b.genere === 'documento' && b.contenuto.forma === 'immagine' ? (
            <img src={b.contenuto.valore} alt={b.nome} className="max-h-full rounded-2xl" style={{ filter: 'saturate(.6)' }} />
          ) : (
            corpo
          )}
        </div>
        {task && task.contesto.length > 0 && (
          <div data-parte="focus-colonna" className="flex w-[340px] flex-none flex-col gap-3">
            {task.contesto.map((e, i) => (
              <div key={i} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[13.5px] font-medium" style={{ background: 'var(--tessera)' }}>
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
