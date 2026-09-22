import { Motore } from './repo/src/modello/motore.ts';
import { Orologio } from './repo/src/modello/tempo.ts';
import { Archivio } from './repo/src/archivio/archivio.ts';
import { Disco } from './repo/src/confini/disco.ts';
import { Contatti } from './repo/src/confini/contatti.ts';
import { chiama } from './repo/src/ai-engine/api.ts';
import { leggiProfilo } from './repo/src/conoscenza/profilo.ts';
import { readFileSync } from 'node:fs';
const flush=()=>new Promise(r=>setImmediate(r));
function banco(){let calls=0;const pending:Array<()=>void>=[];const o=new Orologio(new Date(2026,8,22,10));const contatti=new Contatti();const servizio={nome:'posta',osserva(){},leggi(){return[]},consegna(){calls++;return new Promise<void>(r=>pending.push(r));}};const m=new Motore(o,{posta:servizio,contatti},new Archivio(new Disco(),'Audit'));m.esegui({tipo:'componi',a:'mamma',richiesta:'ciao'});return {m,o,pending,get calls(){return calls}}}
const out=[];
let b=banco();const id=b.m.task[0]!.id;b.m.esegui({tipo:'consegna',task:id});out.push({test:'delay_before_90_seconds',calls:b.calls,elapsed:b.o.ms});b.m.esegui({tipo:'consegna',task:id});out.push({test:'duplicate_send_while_pending',calls:b.calls});b.m.esegui({tipo:'lascia',task:id});b.pending.forEach(r=>r());await flush();out.push({test:'completion_after_leave',state:b.m.task[0]!.avanzamento,place:b.m.task[0]!.luogo,calls:b.calls});b.o.salta(91000);b.m.esegui({tipo:'annulla',task:id});out.push({test:'undo_after_91_seconds',state:b.m.task[0]!.avanzamento,place:b.m.task[0]!.luogo,calls:b.calls,response:b.m.ultimaRisposta});
b=banco();b.m.esegui({tipo:'rimanda',task:b.m.task[0]!.id});b.o.salta(121*60000);out.push({test:'postpone_after_due',state:b.m.task[0]!.avanzamento,place:b.m.task[0]!.luogo});
b=banco();out.push({test:'fractional_tool_index',result:chiama({nome:'scegli',argomenti:{indice:1.5}},b.m,b.o)});try{chiama({nome:'parla',argomenti:null} as any,b.m,b.o);out.push({test:'null_arguments',threw:false})}catch(e){out.push({test:'null_arguments',threw:true,message:String(e)})}
const c=new Contatti();out.push({test:'contact_substring',giuliano:c.cerca('Giuliano')?.nome,capolavoro:c.cerca('capolavoro')?.nome,marco:c.cerca('Marco')?.nome??null});
const pref=readFileSync(new URL('./repo/Archivio/users/user_123/preferences.txt',import.meta.url),'utf8');const system=readFileSync(new URL('./repo/Archivio/users/user_123/system.txt',import.meta.url),'utf8');const p=leggiProfilo(pref+'\n'+system);out.push({test:'current_preferences_parser',assistant:p.assistente,place:p.luogo,machine:{microphone:p.macchina.microfono,volume:p.macchina.volume}});const off=leggiProfilo('assitant:\n  reading: off\n');out.push({test:'documented_reading_off',reading:off.assistente.lettura});
console.log(JSON.stringify(out,null,2));
