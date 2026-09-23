// INPUT: l'unica via di scambio fra sistema e utente (`docs/L02` §INPUT). Due bolle,
// ancorate in basso a sinistra: sotto INPUT, dove si scrive e dove compare la risposta;
// sopra la dropzone, che c'è solo quando un task si sta componendo e ne mostra uno alla
// volta. INPUT non si occupa mai: qualunque cosa ci sia nella dropzone, resta pronta per la
// frase successiva. Solo tastiera: la voce è una fase futura.

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CircleHelp, Keyboard, TriangleAlert } from 'lucide-react';
import type { Task } from '../modello/tipi.ts';
import { Icona, useFotografia, useMotore } from './comune.tsx';

/** Dopo quanto lo scambio lascia lo schermo, se non ha più niente da offrire. */
const RESTA_MS = 12_000;

export function Input({ suFrase }: { suFrase: (testo: string) => void }) {
  const m = useMotore();
  const f = useFotografia();
  const [testo, setTesto] = useState('');
  const campo = useRef<HTMLTextAreaElement>(null);
  const frasi = m.frasiInput();
  const bozza = f.bolle.find((b): b is Task => b.genere === 'task' && b.luogo === 'DROPZONE');

  // Lo scambio resta finché serve, poi lascia lo schermo: resta integralmente nella chat raw.
  const [scambioVisibile, setScambioVisibile] = useState(true);
  useEffect(() => {
    setScambioVisibile(true);
    if (!f.scambio?.risposta || f.scambio.frasi?.length) return;
    const id = setTimeout(() => setScambioVisibile(false), RESTA_MS);
    return () => clearTimeout(id);
  }, [f.scambio]);

  // La tastiera è sempre sua: ovunque tu sia, quello che scrivi entra qui.
  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.activeElement === campo.current) return;
      if (e.key.length === 1) campo.current?.focus();
    };
    window.addEventListener('keydown', fn);
    campo.current?.focus();
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // La bolla cresce sul posto mentre scrivi: in larghezza fino a un tetto, poi in altezza.
  useEffect(() => {
    const c = campo.current;
    if (!c) return;
    c.style.height = '0px';
    c.style.height = `${c.scrollHeight}px`;
  }, [testo]);

  const manda = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    const t = testo.trim();
    if (!t) return;
    setTesto('');
    suFrase(t);
  };

  const domanda = frasi.da === 'domanda';
  const risposta = !domanda && scambioVisibile ? f.scambio?.risposta : undefined;
  const mostraFrasi = frasi.frasi.length > 0 && (frasi.da !== 'scambio' || scambioVisibile);
  const larghezza = Math.min(560, Math.max(200, 60 + testo.length * 8.2));

  return (
    <div className="absolute bottom-[44px] left-[44px] flex flex-col items-start gap-3">
      {bozza && <Dropzone t={bozza} />}
      <div className="relative flex items-end">
        {/* L'ascolto è spento nel prototipo: niente pallino fuori, e l'icona della
            tastiera dentro la bolla (`L2 - INPUT` §Variante senza ascolto). Con una
            domanda aperta il punto diventa un anello che aspetta. */}
        {domanda && <span className="absolute bottom-[15px] -left-[24px] h-[11px] w-[11px] rounded-full border-2" style={{ borderColor: 'var(--ambra)' }} />}
        <div className="vetro flex max-w-[600px] flex-col rounded-[22px]" style={{ minWidth: larghezza }}>
          {domanda && (
            <div className="px-[18px] pt-[14px]">
              <div className="targa flex items-center gap-2 text-[11px]" style={{ color: 'var(--ambra)' }}>
                <CircleHelp size={14} /> ti sto chiedendo
              </div>
              <div className="mt-2 text-[16px] leading-6">{frasi.domanda}</div>
            </div>
          )}
          {risposta && <div className="px-[18px] pt-[14px] text-[16px] leading-6">{risposta}</div>}
          {f.guasto && (
            <div className="flex items-start gap-2 px-[18px] pt-[14px] text-[14.5px] leading-6" style={{ color: 'var(--i)' }}>
              <span className="mt-[5px] flex" style={{ color: 'var(--ambra)' }}>
                <TriangleAlert size={14} />
              </span>
              {f.guasto}
            </div>
          )}
          {mostraFrasi && (
            <>
              {(domanda || risposta) && <div className="incisione mt-3" />}
              <div className="flex flex-wrap items-center gap-x-[14px] gap-y-1 px-[18px] pb-1 pt-[10px] text-[14.5px]" style={{ color: 'var(--i-corpo)' }}>
                {frasi.frasi.map((x, i) => (
                  <span key={x} className="flex items-center gap-2" style={{ color: 'var(--i)' }}>
                    {frasi.pallino && i === 0 && <span className="pallino" />}«{x}»
                  </span>
                ))}
              </div>
            </>
          )}
          <label className="flex items-start gap-[9px] px-4 py-[9px]">
            <span className="mt-[3px] flex flex-none" style={{ color: 'var(--i-fioco)' }}>
              <Keyboard size={14} />
            </span>
            <textarea
              ref={campo}
              rows={1}
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              onKeyDown={manda}
              placeholder="scrivi"
              aria-label="scrivi"
              className="block w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[21px] outline-none placeholder:text-[var(--i-fioco)]"
              style={{ color: 'var(--i)', fontFamily: 'inherit' }}
            />
          </label>
          {f.pensa && (
            <div className="flex items-center gap-2 px-4 pb-[10px] text-[13.5px]" style={{ color: 'var(--i-tenue)' }}>
              <span className="anello" /> sto pensando
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Quante tessere si vedono prima del «+N». */
const TESSERE = 4;

/** La dropzone: la bozza in `T_DRAFT` con le cose che ha agganciato (`L2 - INPUT`). */
function Dropzone({ t }: { t: Task }) {
  const viste = t.contesto.slice(0, TESSERE);
  const resto = t.contesto.length - viste.length;
  return (
    <div className="vetro nasce max-w-[600px] rounded-[22px] px-[14px] py-3">
      <div className="flex items-center gap-2" style={{ color: 'var(--grigio)' }}>
        <Icona tipo={t.tipo} />
        <span className="truncate text-[15px] font-medium" style={{ color: 'var(--i)' }}>{t.nome}</span>
        <span className="text-[12.5px]" style={{ color: 'var(--i-fioco)' }}>Bozza</span>
      </div>
      {(viste.length > 0 || t.uscita) && (
        <div className="mt-[10px] flex flex-wrap gap-2">
          {t.uscita && !t.contesto.some((e) => e.nome === t.uscita!.a) && (
            <Tessera tipo="contatto" nome={t.uscita.a} etichetta={t.uscita.servizio} />
          )}
          {viste.map((e, i) => (
            <Tessera key={i} tipo={e.tipo} nome={e.nome} etichetta={e.tipo} dato={e.dato} />
          ))}
          {resto > 0 && (
            <span className="mono flex items-center rounded-[12px] px-[11px] py-[7px] text-[12px]" style={{ color: 'var(--i-tenue)', background: 'var(--tessera)' }}>
              +{resto}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Tessera({ tipo, nome, etichetta, dato }: { tipo: Task['contesto'][number]['tipo']; nome: string; etichetta: string; dato?: string }) {
  return (
    <span className="flex items-center gap-2 rounded-[12px] px-[11px] py-[7px]" style={{ background: 'var(--tessera)' }}>
      <Icona tipo={tipo} />
      <span className="flex flex-col gap-[2px] leading-none">
        <span className="text-[13.5px] font-medium">{nome}</span>
        <span className="mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color: 'var(--i-fioco)' }}>{etichetta}</span>
      </span>
      {dato && <span className="mono ml-1 text-[12px]" style={{ color: 'var(--i-tenue)' }}>{dato}</span>}
    </span>
  );
}
