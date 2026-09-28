import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const port=Number(process.env.ONEASSISTANT_PORT||4318);
const client=new Client({name:'oneassistant-demo',version:'0.2.0'});
const transport=new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const id=`demo-${Date.now()}`;
const base={sceneId:id,theme:'Chiaro',tray:{orientation:'Orizzontale',style:'Contorno',ids:[]},timeline:{state:'In corso',now:'Preparazione proposta',next:'Revisione con Andrea'},profile:{place:'Casa',mode:'Deep',initials:'M'},system:{mic:'In ascolto',volume:40,muted:false,wifi:'TIM-CASA',battery:55},notifications:[{id:'n1',meta:'09:52 · Andrea Riva · Mail',title:'Proposta Acme',text:'Ti mando la proposta per Acme.'}],notificationsOpen:false};
async function render(revision,bubbles,extra={}){
  const result=await client.callTool({name:'render_scene',arguments:{...base,...extra,revision,bubbles}});
  if(result.isError)throw new Error(result.content?.[0]?.text);
  const state=await fetch(`http://127.0.0.1:${port}/state`).then(response=>response.json());
  if(state.sceneId!==id||state.revision!==revision||state.bubbles.length!==bubbles.length)throw new Error(`Scena ${revision} non applicata correttamente`);
  console.log(`Revisione ${revision} verificata: ${state.bubbles.length} Bubble, ${state.tray.ids.length} nel Vassoio.`);
}
try{
  await client.connect(transport);
  const mail={id:'mail-marco',title:'Email a Marco Rossi',icon:'mail',state:'Base',size:'Task',items:[{type:'Testo',text:'Preparo il messaggio con il preventivo aggiornato.'},{type:'File',title:'Preventivo_Acme_v3.pdf',detail:'File · PDF · 240 KB'}]};
  await render(1,[mail]);await pause(1100);
  await render(2,[{...mail,state:'In corso',items:[{type:'Testo',text:'Sto preparando la bozza del messaggio.'},{type:'File',title:'Preventivo_Acme_v3.pdf',detail:'File · PDF · 240 KB'}]}]);await pause(1400);
  await render(3,[{...mail,state:'In attesa',items:[{type:'Testo',text:'La bozza è pronta per la tua conferma.'},{type:'File',title:'Preventivo_Acme_v3.pdf',detail:'File · PDF · 240 KB'}],suggestions:{primary:'Invia',alternatives:['Più formale','Non inviarla']}}]);await pause(1600);
  await render(4,[{...mail,state:'In attesa',size:'Focus',subtitle:'La bozza è pronta per la tua conferma',items:[{type:'Testo',text:'Ciao Marco, ti invio la versione aggiornata del preventivo.'},{type:'File',title:'Preventivo_Acme_v3.pdf',detail:'File · PDF · 240 KB'}],suggestions:{primary:'Invia',alternatives:['Più formale','Non inviarla']},panel:{open:true,sections:[{title:'Dettagli',items:[{type:'Testo',text:'Preparata oggi alle 10:35'}]},{title:'Allegati',items:[{type:'File',title:'Preventivo_Acme_v3.pdf',detail:'File · PDF · 240 KB'}]}]}}]);await pause(1600);
  const calendar={id:'calendar-andrea',title:'Revisione con Andrea',icon:'calendar',state:'In corso',size:'Task',items:[{type:'Testo',text:'Domani alle 16:00, in videochiamata.'},{type:'Checklist',entries:['Contatto trovato','Preventivo allegato','Controllo il calendario'],entryStates:['Completato','Completato','In corso']}]};
  const folder={id:'folder-acme',title:'Progetto Acme',icon:'folder',state:'Completato',size:'Task',items:[{type:'Cartella',title:'Progetto Acme',detail:'24 elementi · modificata oggi'}]};
  const backup={id:'backup',title:'Backup non riuscito',icon:'file',state:'Errore',size:'Task',items:[{type:'Testo',text:'Il file non è stato salvato. Posso riprovare.'}]};
  await render(5,[{...mail,size:'Task'},calendar,folder,backup],{tray:{orientation:'Verticale',style:'Contorno',ids:[]},notificationsOpen:true});await pause(1600);
  await render(6,[{...mail,size:'Task'},calendar,folder,backup],{tray:{orientation:'Verticale',style:'Contorno',ids:['folder-acme']},notificationsOpen:true});await pause(1600);
  await render(7,[{...mail,size:'Task'},calendar,folder,backup],{tray:{orientation:'Verticale',style:'Contorno',ids:['folder-acme']},notificationsOpen:false});
  console.log('Demo terminata sulla scrivania: tre Bubble visibili, un Chip nel Vassoio.');
}finally{await client.close()}
