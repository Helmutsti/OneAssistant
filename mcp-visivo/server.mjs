import { readFile, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, resolve, isAbsolute, extname, sep } from 'node:path';
import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';

const port = Number(process.env.ONEASSISTANT_PORT || 4318);
const host = '127.0.0.1';
const stdioMode = process.argv.includes('--stdio');
const here = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(here, 'public');
// Le immagini si possono indicare con un percorso locale, purché stia sotto una di queste radici.
const repoRoot = resolve(here, '..');
const imageRoots = [repoRoot, ...(process.env.ONEASSISTANT_IMAGE_ROOTS || '').split(':').filter(Boolean)].map(root => resolve(root));
const imageTypes = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.svg':'image/svg+xml', '.avif':'image/avif' };
const listeners = new Set();
const log = (...parts) => console.error(...parts);

const pileObject = z.enum(['Immagine','File','Documento','Cartella','Posizione','Email','Evento','Messaggio','Nota vocale','Contatto','In arrivo','Mancante']);
const photo = z.object({ imageUrl: z.string().optional(), title: z.string().describe('Nome del file o della foto.'), detail: z.string().optional().describe('Data, luogo o cartella.'), selected: z.boolean().optional().describe('Già scelta dall\'utente: il numero diventa blu.') });
const item = z.object({ type: z.enum(['Testo','Lista numerata','Lista puntata','Checklist','Card contenuto','Immagine','Griglia foto','File','Cartella','Documento','Posizione','Contatto','Pila']).describe('Immagine = una foto sola. Griglia foto = più foto fra cui scegliere, numerate 1, 2, 3… (usala in una Bubble Focus). Pila = una raccolta riassunta a pallini, senza anteprime.'), text: z.string().optional(), title: z.string().optional(), detail: z.string().optional(), meta: z.string().optional(), entries: z.array(z.string()).optional(), entryStates: z.array(z.enum(['Completato','In corso','Da fare'])).optional(), objects: z.array(pileObject).optional().describe('Solo per Pila: un tipo per oggetto; oltre cinque compare «+n». In arrivo e Mancante servono nelle raccolte.'), photos: z.array(photo).optional().describe('Solo per Griglia foto.'), imageUrl: z.string().optional().describe('URL http(s), data: oppure percorso locale assoluto di un file immagine del repository OneAssistant.') });
const bubble = z.object({ id: z.string().min(1), title: z.string().min(1), subtitle: z.string().optional(), icon: z.string().default('mail').describe('Una fra: mail, calendar, file, folder, image, location, contact, message.'), state: z.enum(['Base','In corso','In attesa','Completato','Errore']).default('Base'), size: z.enum(['Task','Focus','Zen']).default('Task').describe('Task è la Bubble normale; Focus è più grande e mostra subtitle e panel; usane al massimo una.'), items: z.array(item).default([]), suggestions: z.object({ primary: z.string(), alternatives: z.array(z.string()).default([]) }).optional().describe('Risposte che l\'utente può dare a voce, mostrate sotto la Bubble. Non sono pulsanti.'), panel: z.object({ open: z.boolean().default(true), sections: z.array(z.object({ title: z.string(), items: z.array(item) })) }).optional() });
const sceneSchema = z.object({
  sceneId: z.string().min(1), revision: z.number().int().nonnegative().optional().describe('Facoltativa: se manca o è già superata, il server usa la successiva.'), theme: z.enum(['Chiaro','Scuro']).default('Chiaro'), bubbles: z.array(bubble).default([]).describe('Tutte le Bubble della scena. Quelle non elencate in tray.ids sono visibili sulla scrivania.'),
  tray: z.object({ orientation: z.enum(['Orizzontale','Verticale']).default('Orizzontale'), style: z.enum(['Contorno','Pieno']).default('Contorno'), ids: z.array(z.string()).max(5).default([]).describe('ID delle Bubble MESSE DA PARTE: spariscono dalla scrivania e restano solo come piccolo Chip. Lascia vuoto per mostrare tutte le Bubble.') }).default({orientation:'Orizzontale',style:'Contorno',ids:[]}),
  timeline: z.object({ state: z.enum(['In corso','Preavviso','Libero']).default('Libero'), now: z.string().default('Nessuna attività'), next: z.string().default('') }).default({state:'Libero',now:'Nessuna attività',next:''}),
  profile: z.object({ place: z.string().default('Casa'), mode: z.string().default(''), initials: z.string().default('M') }).default({place:'Casa',mode:'',initials:'M'}),
  system: z.object({mic:z.enum(['Scrivi','In ascolto']).default('Scrivi'),volume:z.number().min(0).max(100).default(40),muted:z.boolean().default(false),wifi:z.string().default('Senza rete'),battery:z.number().min(0).max(100).default(55)}).default({mic:'Scrivi',volume:40,muted:false,wifi:'Senza rete',battery:55}),
  notifications: z.array(z.object({ id:z.string(),meta:z.string(),title:z.string(),text:z.string() })).default([]), notificationsOpen: z.boolean().default(false)
});
let scene = sceneSchema.parse({sceneId:'inizio',revision:0});

function broadcast() { const message=`event: scene\ndata: ${JSON.stringify(scene)}\n\n`; for(const response of listeners) response.write(message); }
const failure = text => ({isError:true,content:[{type:'text',text}]});

function isInsideRoots(path) { return imageRoots.some(root => path === root || path.startsWith(root + sep)); }

// Converte un percorso locale nell'URL /file servito da questo server; lascia intatti gli URL veri.
function resolveImage(url) {
  if(!url || /^(https?:|data:)/i.test(url) || url.startsWith('/file?')) return url;
  let path = url.startsWith('file://') ? fileURLToPath(url) : url.replace(/^~(?=\/)/, homedir());
  path = isAbsolute(path) ? resolve(path) : resolve(repoRoot, path);
  if(!isInsideRoots(path)) throw new Error(`Immagine fuori dalle cartelle consentite: ${url}`);
  if(!imageTypes[extname(path).toLowerCase()]) throw new Error(`Formato immagine non supportato: ${url}`);
  if(!existsSync(path)) throw new Error(`Immagine non trovata: ${url}`);
  return `/file?path=${encodeURIComponent(path)}`;
}
const withImages = items => items.map(entry => ({...entry, ...(entry.imageUrl && {imageUrl: resolveImage(entry.imageUrl)}), ...(entry.photos && {photos: entry.photos.map(p => p.imageUrl ? {...p, imageUrl: resolveImage(p.imageUrl)} : p)})}));

// Le regole di composizione del file Figma (01 · Bubble): chi le viola riceve un avviso nella risposta.
function semanticNotes(next) {
  const notes = [], onDesk = next.bubbles.filter(b => !next.tray.ids.includes(b.id));
  const focus = onDesk.filter(b => b.size === 'Focus');
  if(focus.length > 1) notes.push('più di una Bubble Focus: il focus è uno solo');
  const lone = onDesk.filter(b => b.items.length === 1 && ['Immagine','File','Documento'].includes(b.items[0].type));
  if(lone.length >= 2) notes.push(`${lone.length} Bubble contengono un solo risultato ciascuna: se sono i risultati dello stesso task vanno in UNA Bubble (Griglia foto per le immagini, Pila o più item per i file)`);
  if(focus.length && onDesk.length > 1) notes.push('con una Bubble Focus le altre vanno nel Vassoio (tray.ids)');
  for(const b of onDesk) {
    if(b.title.length > 32) notes.push(`titolo di «${b.id}» oltre 32 caratteri`);
    if(b.suggestions && 1 + b.suggestions.alternatives.length > 4) notes.push(`«${b.id}» ha più di 4 frasi`);
    if(b.suggestions && b.state !== 'In attesa') notes.push(`«${b.id}» propone frasi ma non è In attesa`);
  }
  return notes;
}

function applyScene(input) {
  let next;
  try {
    next = sceneSchema.parse(input);
    next.bubbles = next.bubbles.map(b => ({...b, items: withImages(b.items), panel: b.panel && {...b.panel, sections: b.panel.sections.map(s => ({...s, items: withImages(s.items)}))}}));
  } catch(error) { return failure(`Scena non valida: ${error.message}`); }
  const notes = [];
  if(next.sceneId === scene.sceneId && (next.revision === undefined || next.revision <= scene.revision)) {
    if(next.revision !== undefined) notes.push(`revisione ${next.revision} già superata, usata ${scene.revision + 1}`);
    next.revision = scene.revision + 1;
  }
  next.revision ??= 1;
  const byId = new Map(next.bubbles.map(b => [b.id, b]));
  if(byId.size !== next.bubbles.length) { next.bubbles = [...byId.values()]; notes.push('Bubble con ID duplicato: tenuta l\'ultima'); }
  const missing = next.tray.ids.filter(id => !byId.has(id));
  if(missing.length) { next.tray.ids = next.tray.ids.filter(id => byId.has(id)); notes.push(`Chip senza Bubble ignorati: ${missing.join(', ')}`); }
  const visible = next.bubbles.length - next.tray.ids.length;
  notes.push(...semanticNotes(next));
  if(next.bubbles.length && !visible) notes.push('ATTENZIONE: tutte le Bubble sono nel Vassoio, la scrivania è vuota; togli da tray.ids quelle da mostrare');
  scene = next; broadcast();
  const text = `Scena ${scene.sceneId} aggiornata alla revisione ${scene.revision}, ${visible} Bubble visibili` + (notes.length ? ` (${notes.join('; ')}).` : '.') + ` Bubble: ${scene.bubbles.map(b => b.id + (scene.tray.ids.includes(b.id) ? ' (Vassoio)' : '')).join(', ') || 'nessuna'}. Finestre collegate: ${listeners.size}.`;
  return {content:[{type:'text',text}],structuredContent:{sceneId:scene.sceneId,revision:scene.revision,windows:listeners.size}};
}

// Modifiche parziali: il modello scrive solo ciò che cambia, non l'intera scena. Meno testo da generare, render più rapido.
const bubbleFields = z.object({ title: z.string().min(1).optional(), subtitle: z.string().nullable().optional().describe('null per toglierlo.'), icon: z.string().optional(), state: bubble.shape.state.unwrap().optional(), size: bubble.shape.size.unwrap().optional(), suggestions: bubble.shape.suggestions.unwrap().nullable().optional().describe('null per toglierle.'), panel: bubble.shape.panel.unwrap().nullable().optional().describe('null per toglierlo.') });
const operation = z.discriminatedUnion('op', [
  z.object({ op: z.literal('add'), bubble: bubble.describe('Bubble completa: se l\'ID esiste la sostituisce, altrimenti la aggiunge sulla scrivania.') }),
  z.object({ op: z.literal('patch'), id: z.string(), fields: bubbleFields.describe('Solo i campi da cambiare.') }),
  z.object({ op: z.literal('set_items'), id: z.string(), items: z.array(item).describe('Sostituisce tutti gli item della Bubble.') }),
  z.object({ op: z.literal('add_items'), id: z.string(), items: z.array(item).describe('Aggiunti in fondo agli item esistenti.') }),
  z.object({ op: z.literal('remove'), id: z.string().describe('Toglie la Bubble del tutto (anche dal Vassoio).') }),
  z.object({ op: z.literal('to_tray'), id: z.string().describe('Mette da parte la Bubble: resta solo come Chip nel Vassoio.') }),
  z.object({ op: z.literal('from_tray'), id: z.string().describe('Riporta la Bubble sulla scrivania.') }),
  z.object({ op: z.literal('set_bars'), theme: sceneSchema.shape.theme.unwrap().optional(), timeline: sceneSchema.shape.timeline.unwrap().partial().optional(), profile: sceneSchema.shape.profile.unwrap().partial().optional(), system: sceneSchema.shape.system.unwrap().partial().optional(), notifications: sceneSchema.shape.notifications.unwrap().optional(), notificationsOpen: z.boolean().optional() }).describe('Barre e tema: solo i campi da cambiare.')
]);
const patchSchema = z.object({ ops: z.array(operation).min(1).describe('Applicate in ordine, tutte o nessuna.') });

function applyOps(input) {
  let ops;
  try { ({ops} = patchSchema.parse(input)); } catch(error) { return failure(`Modifica non valida: ${error.message}`); }
  const next = structuredClone(scene);
  const find = id => { const found = next.bubbles.find(b => b.id === id); if(!found) throw new Error(`Bubble «${id}» non presente; ID attuali: ${next.bubbles.map(b => b.id).join(', ') || 'nessuno'}`); return found; };
  try {
    for(const o of ops) {
      if(o.op === 'add') { const i = next.bubbles.findIndex(b => b.id === o.bubble.id); if(i >= 0) next.bubbles[i] = o.bubble; else next.bubbles.push(o.bubble); }
      else if(o.op === 'patch') { const b = find(o.id); for(const [key, value] of Object.entries(o.fields)) { if(value === null) delete b[key]; else if(value !== undefined) b[key] = value; } }
      else if(o.op === 'set_items') find(o.id).items = o.items;
      else if(o.op === 'add_items') find(o.id).items.push(...o.items);
      else if(o.op === 'remove') { find(o.id); next.bubbles = next.bubbles.filter(b => b.id !== o.id); next.tray.ids = next.tray.ids.filter(id => id !== o.id); }
      else if(o.op === 'to_tray') { find(o.id); if(!next.tray.ids.includes(o.id)) next.tray.ids.push(o.id); }
      else if(o.op === 'from_tray') { find(o.id); next.tray.ids = next.tray.ids.filter(id => id !== o.id); }
      else if(o.op === 'set_bars') { const {op, ...bars} = o; for(const [key, value] of Object.entries(bars)) if(value !== undefined) next[key] = value && typeof value === 'object' && !Array.isArray(value) ? {...next[key], ...value} : value; }
    }
  } catch(error) { return failure(`Modifica non applicata: ${error.message}`); }
  delete next.revision;
  return applyScene(next);
}

// Più host (una chat nuova, un secondo client) avviano ciascuno un processo: solo il primo tiene la porta
// e la finestra; gli altri inoltrano le scene a lui. Se il titolare si chiude, il primo che se ne accorge subentra.
const app = createMcpExpressApp({host});
let owner = false;
function listen() {
  return new Promise((done, fail) => {
    const listener = app.listen(port, host);
    listener.once('listening', () => { owner = true; log(`OneAssistant: finestra su http://${host}:${port}/`); done(true); });
    listener.once('error', error => error.code === 'EADDRINUSE' ? done(false) : fail(error));
  });
}
async function forward(args, route, apply) {
  if(owner) return apply(args);
  try {
    const response = await fetch(`http://${host}:${port}${route}`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(args)});
    if(!response.ok) return failure(`La porta ${port} è occupata da un altro programma (risposta ${response.status}).`);
    return await response.json();
  } catch {
    if(await listen()) return apply(args);
    return failure(`La finestra OneAssistant non è raggiungibile su ${host}:${port}.`);
  }
}

function makeMcpServer() {
  const server=new McpServer({name:'oneassistant-visual',version:'0.4.0'});
  const rules=[
    'Regole (dal file Figma dei componenti):',
    '- Una Bubble = un task. Un task non si spezza: i risultati di una ricerca, la domanda che ne segue e le frasi possibili stanno nella STESSA Bubble.',
    '- Quando serve una risposta dell\'utente: state «In attesa», il titolo È la domanda (max 32 caratteri, es. «Quale foto cercavi?»), subtitle con il contesto (es. «Repository OneAssistant · 3 immagini»), suggestions con la frase più probabile in primary e al massimo 3 alternative.',
    '- Più foto fra cui scegliere: una Bubble Focus con un item «Griglia foto»; le foto sono numerate, quindi le frasi possono essere «La 1», «La 2». Una foto sola: item «Immagine».',
    '- Una raccolta da riassumere senza anteprime: item «Pila».',
    '- Al massimo una Bubble Focus; quando c\'è, le altre Bubble vanno nel Vassoio. Stati: Base, In corso (sto lavorando), In attesa (tocca all\'utente), Completato, Errore (bloccato: il perché nel testo).',
    '- imageUrl accetta un percorso locale assoluto di un file del repository.',
    '- Leggi gli avvisi nella risposta: indicano una regola violata da correggere con un nuovo invio.'
  ];
  server.registerTool('update_scene',{title:'Modifica OneAssistant',description:[
    'Modifica la scena della finestra OneAssistant (http://127.0.0.1:'+port+'/) inviando SOLO ciò che cambia. È il modo normale di aggiornare la finestra: più veloce di render_scene perché non si riscrive la scena intera.',
    'La finestra è la superficie della conversazione: nessun elemento è cliccabile, l\'utente risponde a voce o per iscritto.',
    'Operazioni, applicate in ordine: add (Bubble nuova o sostituita per intero), patch (solo alcuni campi: state, title, suggestions…), set_items / add_items, remove, to_tray / from_tray (Vassoio), set_bars (tema, Timeline, Profilebar, Systembar, notifiche).',
    'Esempio: una Bubble finisce e ne arriva una nuova → [{op:"patch",id:"mail",fields:{state:"Completato"}},{op:"to_tray",id:"mail"},{op:"add",bubble:{…}}].',
    'Se un ID non esiste la modifica non viene applicata e la risposta elenca gli ID presenti.',
    ...rules
  ].join('\n'),inputSchema:patchSchema.shape},args=>forward(args,'/patch',applyOps));
  server.registerTool('render_scene',{title:'Sostituisci la scena OneAssistant',description:[
    'Sostituisce l\'intera scena della finestra OneAssistant. Usalo solo per la prima scena di una conversazione o per ripartire da zero; per tutto il resto usa update_scene, che è più veloce.',
    '- Invia tutte le Bubble che devono restare, mantieni lo stesso sceneId; revision è facoltativa. Le Bubble messe da parte vanno in tray.ids.',
    ...rules
  ].join('\n'),inputSchema:sceneSchema.shape},args=>forward(args,'/scene',applyScene));
  return server;
}

app.post('/mcp',async(request,response)=>{const server=makeMcpServer();const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});try{await server.connect(transport);await transport.handleRequest(request,response,request.body)}catch(error){log('MCP:',error);if(!response.headersSent)response.status(500).json({error:'Errore MCP'})}finally{response.on('close',()=>{transport.close();server.close()})}});
app.get('/mcp',(_request,response)=>response.sendStatus(405));
app.delete('/mcp',(_request,response)=>response.sendStatus(405));
app.post('/scene',(request,response)=>response.json(applyScene(request.body)));
app.post('/patch',(request,response)=>response.json(applyOps(request.body)));
app.get('/state',(_request,response)=>response.json(scene));
app.get('/events',(_request,response)=>{response.setHeader('Content-Type','text/event-stream');response.setHeader('Cache-Control','no-cache');response.setHeader('Connection','keep-alive');response.flushHeaders();listeners.add(response);response.write(`event: scene\ndata: ${JSON.stringify(scene)}\n\n`);response.on('close',()=>listeners.delete(response))});
app.get('/file',async(request,response)=>{
  try{
    const path=await realpath(String(request.query.path||''));
    const type=imageTypes[extname(path).toLowerCase()];
    if(!type||!isInsideRoots(path))return response.sendStatus(403);
    response.type(type).send(await readFile(path));
  }catch{response.sendStatus(404)}
});
for(const [route,file,type] of [['/','index.html','text/html'],['/bubble.js','bubble.js','text/javascript'],['/bubble.css','bubble.css','text/css'],['/style.css','style.css','text/css'],['/profile-volto.png','profile-volto.png','image/png'],['/sfondo.jpg','sfondo.jpg','image/jpeg']]) app.get(route,async(_request,response)=>{try{response.type(type).send(await readFile(join(publicDir,file)))}catch{response.sendStatus(404)}});

try{
  if(!await listen()){
    if(!stdioMode){log(`OneAssistant: la porta ${port} è già in uso.`);process.exit(1)}
    log(`OneAssistant: la finestra è già aperta da un altro processo su ${host}:${port}, inoltro le scene a lui.`);
  }
}catch(error){
  log('OneAssistant HTTP:',error);
  process.exit(1);
}
if(stdioMode){
  const server=makeMcpServer();
  const transport=new StdioServerTransport();
  await server.connect(transport);
  // Chiusa la chat che l'ha avviato, il processo deve liberare la porta: un altro subentrerà.
  process.stdin.once('close',()=>process.exit(0));
}else console.log(`OneAssistant MCP: http://${host}:${port}/mcp`);
