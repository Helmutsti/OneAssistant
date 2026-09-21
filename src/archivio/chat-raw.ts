export type RuoloChat = 'user' | 'assistant';

export function salvaMessaggio(role: RuoloChat, text: string): void {
  if (typeof window === 'undefined' || !text) return;

  void fetch('/chat-raw', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      role,
      text,
    }),
  }).then((risposta) => {
    if (!risposta.ok) console.error(`[chat-raw] salvataggio fallito: ${risposta.status}`);
  }).catch((errore: unknown) => {
    console.error('[chat-raw] salvataggio fallito', errore);
  });
}
