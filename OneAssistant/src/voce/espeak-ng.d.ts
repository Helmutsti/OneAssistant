// Il pacchetto non porta i tipi: quello che ci serve è due cose sole.
declare module 'espeak-ng' {
  interface Istanza {
    FS: { readFile(percorso: string, opzioni: { encoding: 'utf8' }): string };
  }
  export default function ESpeakNg(opzioni: {
    arguments: string[];
    locateFile?: (file: string) => string;
  }): Promise<Istanza>;
}
