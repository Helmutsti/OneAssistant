// Lo schermo intero: le sette aree, ognuna col suo ancoraggio (`docs/design/L0` legge 11).
// Qui non si decide niente: si mettono in fila.

import { useCallback, useEffect } from 'react';
import type { Motore } from '../modello/motore.ts';
import { MotoreCtx } from './comune.tsx';
import { Desk, useRidisegnaAlRidimensionamento } from './Desk.tsx';
import { Guida, useVoceMuta, type Ambiente } from './Guida.tsx';
import { Input } from './Input.tsx';
import { Notificationbar } from './Notificationbar.tsx';

export function App({
  motore,
  ambiente,
  suFrase,
  suMuta: avvisaMuta,
}: {
  motore: Motore;
  ambiente: Ambiente;
  suFrase: (t: string) => void;
  suMuta: (muta: boolean) => void;
}) {
  useRidisegnaAlRidimensionamento();
  const [muta, suMuta] = useVoceMuta(ambiente.macchina.volume === 0);
  useEffect(() => avvisaMuta(muta), [muta, avvisaMuta]);
  const suono = useCallback(() => {
    if (muta) return;
    const a = new Audio('/sistema/notification.mp3');
    a.volume = Math.min(1, (ambiente.macchina.volume ?? 40) / 100);
    void a.play().catch(() => {});
  }, [muta, ambiente.macchina.volume]);
  return (
    <MotoreCtx.Provider value={motore}>
      <div className="relative h-full w-full overflow-hidden">
        <Desk />
        <Guida ambiente={ambiente} muta={muta} suMuta={suMuta} />
        <Input suFrase={suFrase} />
        <Notificationbar suono={suono} />
      </div>
    </MotoreCtx.Provider>
  );
}
