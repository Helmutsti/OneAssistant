// I documenti dell'utente attivo: `preferences.txt` e `system.txt` (`docs/L03`).
//
// `preferences.txt` ha un formato scritto in `docs/L03`: in inglese, indentato a
// tabulazione, due punti fra chiave e valore. Quello che il file non dichiara resta al
// valore predefinito; una chiave che il file scrive e il sistema non conosce **non viene
// ignorata in silenzio**: è un errore di formato, e va detto.
//
// Il campo `password` è soltanto un dato locale: non è autenticazione e non raggiunge il
// provider AI. Per questo non esce mai da `leggiPreferenze` verso il prompt.

export interface Luogo {
  readonly indirizzo: string;
  readonly nome: string;
}

export interface Preferenze {
  readonly utente: {
    readonly name?: string;
    readonly datebirth?: string;
    readonly sex?: 'female' | 'male';
    readonly language: 'italian' | 'english';
  };
  readonly focuses: readonly Luogo[];
  readonly theme?: string;
  /** Il vetro chiaro o il vetro scuro. Se manca, chiaro (`docs/L03`). */
  readonly material: 'light' | 'dark';
  readonly assistente: {
    readonly reading: boolean;
    readonly voice: 'femminile' | 'maschile';
    readonly name?: string;
    readonly gender?: 'female' | 'male';
    readonly copione?: string;
  };
  /** Gli errori di formato, uno per riga. Vanno mostrati, non taciuti. */
  readonly errori: readonly string[];
}

interface Riga {
  readonly livello: number;
  readonly testo: string;
  readonly numero: number;
}

function righe(testo: string): Riga[] {
  return testo
    .split(/\r?\n/)
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.trim() && !r.trim().startsWith('#'))
    .map(({ r, i }) => ({
      livello: (r.match(/^\t*/)?.[0].length ?? 0),
      testo: r.trim(),
      numero: i + 1,
    }));
}

/** Chiave e valore, oppure solo la chiave se la riga è un titolo di sezione. */
function spezza(t: string): { chiave: string; valore: string } {
  const i = t.indexOf(':');
  if (i < 0) return { chiave: t.trim(), valore: '' };
  return { chiave: t.slice(0, i).trim(), valore: t.slice(i + 1).trim() };
}

const SEZIONI: Record<string, readonly string[]> = {
  Utente: ['name', 'datebirth', 'sex', 'language', 'password'],
  'System preferences': ['focuses', 'theme', 'material'],
  assistant: ['reading', 'settings', 'copione'],
};
const SETTINGS = ['voice', 'name', 'assistant gender'];

export function leggiPreferenze(testo: string): Preferenze {
  const errori: string[] = [];
  const v: Record<string, string> = {};
  const focuses: Luogo[] = [];
  const copione: string[] = [];
  let sezione: string | undefined;
  let blocco: 'focuses' | 'copione' | 'settings' | undefined;

  for (const r of righe(testo)) {
    if (r.livello === 0) {
      const { chiave } = spezza(r.testo);
      if (!(chiave in SEZIONI)) errori.push(`riga ${r.numero}: sezione sconosciuta «${chiave}»`);
      sezione = chiave in SEZIONI ? chiave : undefined;
      blocco = undefined;
      continue;
    }
    if (!sezione) continue;
    if (r.livello === 1) {
      const { chiave, valore } = spezza(r.testo);
      blocco = undefined;
      if (!SEZIONI[sezione]!.includes(chiave)) {
        errori.push(`riga ${r.numero}: chiave sconosciuta «${chiave}» in ${sezione}`);
        continue;
      }
      if (chiave === 'focuses' || chiave === 'copione' || chiave === 'settings') {
        blocco = chiave;
        if (valore) (chiave === 'copione' ? copione : []).push(valore);
        continue;
      }
      v[`${sezione}.${chiave}`] = valore;
      continue;
    }
    // Livello 2 e oltre: dentro un blocco.
    if (blocco === 'copione') copione.push(r.testo);
    else if (blocco === 'focuses') {
      const i = r.testo.lastIndexOf(' - ');
      if (i < 0) errori.push(`riga ${r.numero}: un luogo si scrive «indirizzo - nome del luogo»`);
      else focuses.push({ indirizzo: r.testo.slice(0, i).trim(), nome: r.testo.slice(i + 3).trim() });
    } else if (blocco === 'settings') {
      const { chiave, valore } = spezza(r.testo);
      if (!SETTINGS.includes(chiave)) errori.push(`riga ${r.numero}: chiave sconosciuta «${chiave}» in settings`);
      else v[`settings.${chiave}`] = valore;
    } else {
      errori.push(`riga ${r.numero}: riga fuori posto «${r.testo}»`);
    }
  }

  const fra = <T extends string>(chiave: string, ammessi: readonly T[], predefinito?: T): T | undefined => {
    const x = v[chiave];
    if (x === undefined || x === '') return predefinito;
    if ((ammessi as readonly string[]).includes(x)) return x as T;
    errori.push(`«${chiave.split('.').pop()}» vale «${x}», ma può valere solo ${ammessi.join(' | ')}`);
    return predefinito;
  };

  return {
    utente: {
      name: v['Utente.name'] || undefined,
      datebirth: v['Utente.datebirth'] || undefined,
      sex: fra('Utente.sex', ['female', 'male'] as const),
      language: fra('Utente.language', ['italian', 'english'] as const, 'italian')!,
    },
    focuses,
    theme: v['System preferences.theme'] || undefined,
    material: fra('System preferences.material', ['light', 'dark'] as const, 'light')!,
    assistente: {
      reading: fra('assistant.reading', ['on', 'off'] as const, 'on') === 'on',
      voice: fra('settings.voice', ['femminile', 'maschile'] as const, 'femminile')!,
      name: v['settings.name'] || undefined,
      gender: fra('settings.assistant gender', ['female', 'male'] as const),
      copione: copione.join('\n').trim() || undefined,
    },
    errori,
  };
}

/**
 * `system.txt`: lo stato simulato della macchina, aggiornato a mano (`docs/L03`). Il file
 * non ha un formato dichiarato oltre a «chiave: valore»; si leggono le righe così.
 */
export interface Macchina {
  readonly microfono?: 'acceso' | 'spento';
  readonly batteria?: number;
  readonly rete?: string;
  readonly volume?: number;
  readonly posizione?: string;
}

export function leggiSistema(testo: string): Macchina {
  const v: Record<string, string> = {};
  for (const r of testo.split(/\r?\n/)) {
    const { chiave, valore } = spezza(r);
    if (chiave && valore) v[chiave.toLowerCase()] = valore;
  }
  const numero = (x?: string) => (x && /\d/.test(x) ? Number(x.replace(/[^\d.]/g, '')) : undefined);
  const microfono = v['microfono']?.toLowerCase();
  return {
    microfono: microfono === 'acceso' || microfono === 'spento' ? microfono : undefined,
    batteria: numero(v['batteria']),
    rete: v['wifi'] ?? (v['ethernet'] && v['ethernet'] !== 'off' ? `ethernet ${v['ethernet']}` : undefined),
    volume: numero(v['volume']),
    posizione: v['gps'],
  };
}

/**
 * L'orario di lavoro, dal documento di contesto della memoria (`docs/L02` §TIMELINE): nel
 * prototipo è un valore di prova, «dalle 9 alle 13 e dalle 14 alle 18». Si leggono le
 * coppie «dalle X alle Y» nell'ordine in cui sono scritte.
 */
export function leggiOrario(memoria: string): Array<{ da: number; a: number }> {
  const fasce: Array<{ da: number; a: number }> = [];
  for (const m of memoria.matchAll(/dalle\s+(\d{1,2})(?:[:.](\d{2}))?\s+alle\s+(\d{1,2})(?:[:.](\d{2}))?/gi)) {
    fasce.push({ da: Number(m[1]) * 60 + Number(m[2] ?? 0), a: Number(m[3]) * 60 + Number(m[4] ?? 0) });
  }
  return fasce;
}
