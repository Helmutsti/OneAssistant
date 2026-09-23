// NOTIFICATIONBAR: il mondo (`docs/L02` §NOTIFICATIONBAR, `L2 - Notificationbar`). Una
// campanella con un numero; il cassetto sale da sotto di lei e intorno si spegne tutto.
// Una notifica non è un task: lo diventa quando l'utente dice «me ne occupo».
//
// È l'unica posizione assoluta del sistema, perché il suo cassetto si apre sopra tutto
// il resto (`docs/design/L0` legge 11). La campanella si preme, ed è una delle due
// eccezioni dichiarate alla legge 01: ha anche una frase, «apri».

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Icona, ora, useFotografia, useMotore } from './comune.tsx';

export function Notificationbar({ suono }: { suono: () => void }) {
  const m = useMotore();
  const f = useFotografia();
  const badge = m.badge();
  const [squilla, setSquilla] = useState(false);
  const prima = useRef(badge);

  // All'arrivo di qualcosa che chiede, la campanella squilla una volta sola: 640 ms.
  useEffect(() => {
    if (badge > prima.current) {
      setSquilla(true);
      suono();
      const id = setTimeout(() => setSquilla(false), 700);
      prima.current = badge;
      return () => clearTimeout(id);
    }
    prima.current = badge;
  }, [badge, suono]);

  const aperto = f.cassettoAperto;
  const lista = [...f.notifiche].sort((a, b) => b.quando - a.quando);

  // In chiusura i ritardi si invertono (`L2 - Notificationbar` §L'apertura): il cassetto
  // resta a schermo il tempo di far rientrare le righe, dall'ultima alla prima.
  const [visibile, setVisibile] = useState(aperto);
  const [chiude, setChiude] = useState(false);
  const righe = Math.max(1, lista.length);
  useEffect(() => {
    if (aperto) {
      setVisibile(true);
      setChiude(false);
      return;
    }
    if (!visibile) return;
    setChiude(true);
    const id = setTimeout(() => {
      setVisibile(false);
      setChiude(false);
    }, 320 + 40 * (righe - 1));
    return () => clearTimeout(id);
  }, [aperto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Il velo: la luce della scrivania che cala, stessa curva e stesso tempo del cassetto. */}
      <div
        className="absolute inset-0 transition-all duration-[380ms]"
        style={{
          background: aperto ? 'var(--velo)' : 'transparent',
          backdropFilter: aperto ? 'saturate(.62) brightness(.86)' : 'none',
          pointerEvents: aperto ? 'auto' : 'none',
        }}
        onClick={() => m.chiudiCassetto()}
      />
      <div className="absolute bottom-[44px] right-[44px] flex flex-col items-end gap-3">
        {visibile && (
          <div
            className="flex max-h-[420px] w-[400px] flex-col gap-2 overflow-auto"
            style={{
              transformOrigin: 'bottom right',
              animation: chiude
                ? `rientra 320ms cubic-bezier(.22,1,.36,1) ${40 * (righe - 1)}ms both`
                : 'nasce 420ms cubic-bezier(.22,1,.36,1) both',
            }}
          >
            {lista.length === 0 && (
              <div className="vetro rounded-[20px] px-4 py-[13px] text-[15px]">Non è arrivato niente.</div>
            )}
            {lista.map((n, i) => (
              <div
                key={n.id}
                data-parte="banner"
                className="vetro rounded-[20px] px-4 py-[13px]"
                style={{
                  opacity: n.promossa ? 1 : 0.62,
                  animation: chiude
                    ? `rientra 320ms cubic-bezier(.22,1,.36,1) ${(lista.length - 1 - i) * 40}ms both`
                    : `nasce 320ms cubic-bezier(.22,1,.36,1) ${i * 40}ms both`,
                }}
              >
                <div className="flex items-center gap-2" style={{ color: 'var(--i-fioco)' }}>
                  <Icona tipo={n.tipo} misura={16} />
                  <span className="targa truncate text-[10px] font-normal tracking-[0.14em]">{n.mittente}</span>
                  <span className="mono ml-auto text-[10px]">{ora(n.quando)}</span>
                </div>
                <div className="mt-[6px] truncate text-[14px] leading-[1.35]" style={{ color: 'var(--testo-carta, var(--i))' }}>{n.oggetto}</div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          data-parte="campanella"
          aria-label={aperto ? 'chiudi le notifiche' : 'apri le notifiche'}
          onClick={() => (aperto ? m.chiudiCassetto() : m.apriCassetto())}
          className="vetro relative flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 p-0 transition-transform duration-[340ms]"
          style={{ transform: aperto ? 'scale(.94)' : 'none', color: 'var(--i)' }}
        >
          <span className={squilla ? 'squilla flex' : 'flex'}>
            <Bell size={16} strokeWidth={1.75} />
          </span>
          {badge > 0 && (
            <span
              data-parte="badge"
              className="mono absolute -right-[6px] -top-[6px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[11px] font-medium text-[#fbfaf7]"
              style={{ background: 'var(--ambra)' }}
            >
              {badge}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
