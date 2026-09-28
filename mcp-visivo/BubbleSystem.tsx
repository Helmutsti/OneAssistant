import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { arco, CONTRAZIONE_MS, CURVA, fermo, MIGRAZIONE_MS, NASCITA_MS, ONDA, RIENTRO, SFALSAMENTO_MS, USCITA_MS } from './movimento.ts';

type Box = { x:number; y:number; w:number; h:number };
type Place = Box;
export type Snapshot = { bubbles:Map<string,{box:Box;clone:HTMLElement}>; chips:Map<string,Box> };

export function captureSnapshot():Snapshot {
  const bubbles=new Map<string,{box:Box;clone:HTMLElement}>();
  const chips=new Map<string,Box>();
  document.querySelectorAll<HTMLElement>('[data-bubble-id]').forEach(element=>{
    const r=element.getBoundingClientRect();
    bubbles.set(element.dataset.bubbleId!,{box:{x:r.left,y:r.top,w:r.width,h:r.height},clone:element.cloneNode(true) as HTMLElement});
  });
  document.querySelectorAll<HTMLElement>('[data-chip-id]').forEach(element=>{
    const r=element.getBoundingClientRect();
    chips.set(element.dataset.chipId!,{x:r.left,y:r.top,w:r.width,h:r.height});
  });
  return {bubbles,chips};
}

function seed(id:string):number {let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0)/4294967295}
function overlap(a:Box,b:Box):number {return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))}
function clamp(v:number,min:number,max:number):number {return Math.max(min,Math.min(v,max))}
function findPlace(id:string,w:number,h:number,area:Box,occupied:Place[]):Place {
  const s=seed(id),candidates:Place[]=[];
  for(let i=0;i<9;i++)for(let j=0;j<7;j++){
    const jitterX=((s*17+i*0.37+j*0.11)%1-.5)*26;
    const jitterY=((s*11+j*0.43+i*0.07)%1-.5)*22;
    candidates.push({x:clamp((area.w-w)*(i+.5*s)/8.5+jitterX,0,Math.max(0,area.w-w)),y:clamp((area.h-h)*(j+.5*((s*7)%1))/6.5+jitterY,0,Math.max(0,area.h-h)),w,h});
  }
  return candidates.reduce((best,candidate)=>{
    const targetX=(area.w-w)*(.1+.8*s);
    const targetY=(area.h-h)*(.1+.8*((s*5.73)%1));
    const cost=(p:Place)=>occupied.reduce((sum,o)=>sum+overlap({x:p.x-12,y:p.y-12,w:p.w+24,h:p.h+24},o)*1000,0)+Math.hypot(p.x-targetX,p.y-targetY)*2;
    return cost(candidate)<cost(best)?candidate:best;
  },candidates[0]);
}
function center(p:Box){return{x:p.x+p.w/2,y:p.y+p.h/2}}
function closest(point:{x:number;y:number},places:Map<string,Place>,exclude:string){return [...places.entries()].filter(([id])=>id!==exclude).map(([id,p])=>{const c=center(p),d=Math.hypot(c.x-point.x,c.y-point.y)||1;return{id,p,d,ux:(c.x-point.x)/d,uy:(c.y-point.y)/d}}).sort((a,b)=>a.d-b.d).slice(0,3)}
function viewportBox(element:HTMLElement):Box {const r=element.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}}

function flyOut(id:string,old:{box:Box;clone:HTMLElement},toTray:boolean){
  if(fermo())return;
  const surface=document.querySelector<HTMLElement>('.surface');
  if(!surface)return;
  const ghost=old.clone;
  ghost.classList.add('bubble-ghost');
  Object.assign(ghost.style,{position:'fixed',left:`${old.box.x}px`,top:`${old.box.y}px`,width:`${old.box.w}px`,height:`${old.box.h}px`,zIndex:'100',pointerEvents:'none',margin:'0'});
  surface.appendChild(ghost);
  const finish=()=>ghost.remove();
  const chip=toTray?document.querySelector<HTMLElement>(`[data-chip-id="${CSS.escape(id)}"]`):null;
  if(!chip){ghost.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.94)'}],{duration:USCITA_MS,easing:CURVA}).finished.then(finish,finish);return}
  chip.style.visibility='hidden';
  const card=ghost.querySelector<HTMLElement>('.bubble-card');
  const shrink=(card||ghost).animate([{height:`${old.box.h}px`},{height:'38px'}],{duration:CONTRAZIONE_MS,easing:CURVA,fill:'forwards'});
  shrink.finished.then(()=>{
    const target=viewportBox(chip),dx=target.x-old.box.x,dy=target.y-old.box.y,s=target.w/Math.max(old.box.w,1);
    ghost.animate([{transform:'none',opacity:1},{transform:`translate(${dx/2}px,${dy/2-60}px) scale(${(1+s)/2})`,opacity:.9,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${s})`,opacity:0}],{duration:MIGRAZIONE_MS,easing:CURVA}).finished.then(()=>{chip.style.visibility='';finish()},()=>{chip.style.visibility='';finish()});
  },()=>{chip.style.visibility='';finish()});
}

export function BubbleSystem<T extends {id:string;size:string}>({bubbles,trayIds,snapshot,revision,renderBubble}:{bubbles:T[];trayIds:string[];snapshot:Snapshot|null;revision:number;renderBubble:(bubble:T)=>React.ReactNode}){
  const desk=useRef<HTMLDivElement>(null);
  const places=useRef(new Map<string,Place>());
  const lastArea=useRef<{w:number;h:number}|null>(null);
  const [layoutVersion,setLayoutVersion]=useState(0);
  const observer=useRef<ResizeObserver|null>(null);
  useEffect(()=>{
    if(!desk.current)return;
    observer.current=new ResizeObserver(()=>setLayoutVersion(version=>version+1));
    observer.current.observe(desk.current);
    return()=>observer.current?.disconnect();
  },[]);
  // Anche le bolle cambiano misura dopo la nascita (un'immagine che finisce di caricare): si riposizionano.
  useEffect(()=>{desk.current?.querySelectorAll('[data-bubble-id]').forEach(element=>observer.current?.observe(element))},[bubbles]);
  useLayoutEffect(()=>{
    const container=desk.current;if(!container)return;
    const area={x:0,y:0,w:container.clientWidth,h:container.clientHeight};
    const resized=!!lastArea.current&&(lastArea.current.w!==area.w||lastArea.current.h!==area.h);
    lastArea.current={w:area.w,h:area.h};
    const currentRects=new Map<string,Box>();
    container.querySelectorAll<HTMLElement>('[data-bubble-id]').forEach(element=>currentRects.set(element.dataset.bubbleId!,viewportBox(element)));
    const current=new Set(bubbles.map(b=>b.id));
    const previous=places.current;
    const departing=[...previous.entries()].filter(([id])=>!current.has(id));
    const next=new Map(resized?[]:[...previous.entries()].filter(([id])=>current.has(id)));
    const added:string[]=[];
    const waves=new Map<string,{peakX:number;peakY:number;delay:number}>();
    for(const bubble of bubbles){
      const element=container.querySelector<HTMLElement>(`[data-bubble-id="${CSS.escape(bubble.id)}"]`);
      if(!element)continue;
      const w=element.offsetWidth,h=element.offsetHeight;
      const old=next.get(bubble.id);
      // Figma, Focus: la bolla a fuoco sta al centro della scrivania.
      if(bubble.size!=='Task'){next.set(bubble.id,{x:Math.max(0,(area.w-w)/2),y:Math.max(0,(area.h-h)/2),w,h});if(!old)added.push(bubble.id)}
      else if(old){next.set(bubble.id,{x:clamp(old.x,0,Math.max(0,area.w-w)),y:clamp(old.y,0,Math.max(0,area.h-h)),w,h})}
      else{next.set(bubble.id,findPlace(bubble.id,w,h,area,[...next.values()]));added.push(bubble.id)}
    }
    if(!resized)for(const id of added){const p=next.get(id)!;const around=closest(center(p),next,id);around.forEach((v,i)=>{
      if(added.includes(v.id))return;
      const amount=ONDA[i]*(1-RIENTRO);
      v.p.x=clamp(v.p.x+v.ux*amount,0,Math.max(0,area.w-v.p.w));
      v.p.y=clamp(v.p.y+v.uy*amount,0,Math.max(0,area.h-v.p.h));
      const prior=waves.get(v.id)||{peakX:0,peakY:0,delay:Infinity};
      waves.set(v.id,{peakX:prior.peakX+v.ux*(ONDA[i]-amount),peakY:prior.peakY+v.uy*(ONDA[i]-amount),delay:Math.min(prior.delay,NASCITA_MS*.5+i*SFALSAMENTO_MS)});
    })}
    for(const [id,p] of departing){const around=closest(center(p),next,id);around.forEach(v=>{const distance=Math.max(0,v.d-(p.w+v.p.w)/2);const amount=Math.min(24,distance*RIENTRO);v.p.x=clamp(v.p.x-v.ux*amount,0,Math.max(0,area.w-v.p.w));v.p.y=clamp(v.p.y-v.uy*amount,0,Math.max(0,area.h-v.p.h))})}
    places.current=next;
    const deskRect=container.getBoundingClientRect();
    for(const [id,p] of next){
      const element=container.querySelector<HTMLElement>(`[data-bubble-id="${CSS.escape(id)}"]`)!;
      Object.assign(element.style,{left:`${p.x}px`,top:`${p.y}px`,visibility:'visible'});
      if(fermo())continue;
      const old=resized?currentRects.get(id):snapshot?.bubbles.get(id)?.box;
      if(old){
        const dx=old.x-(deskRect.left+p.x),dy=old.y-(deskRect.top+p.y),wave=waves.get(id);
        if(Math.abs(dx)+Math.abs(dy)>1){
          const frames=wave?[{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${wave.peakX}px,${wave.peakY}px)`,offset:.45},{transform:'none'}]:[{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}];
          element.animate(frames,{duration:NASCITA_MS,easing:CURVA,delay:wave?.delay||0,fill:'backwards'});
        }
      }
      else if(added.includes(id)){
        const from=snapshot?.chips.get(id)||{x:deskRect.left+12,y:deskRect.bottom-40,w:56,h:38};
        element.animate(arco(from,{x:deskRect.left+p.x,y:deskRect.top+p.y,w:p.w,h:p.h}),{duration:NASCITA_MS,easing:CURVA});
      }
    }
    if(snapshot)for(const [id] of departing){const old=snapshot.bubbles.get(id);if(old)flyOut(id,old,trayIds.includes(id))}
  },[revision,bubbles,snapshot,trayIds,layoutVersion]);
  return <div ref={desk} className="desk">{bubbles.map(bubble=><div className="bubble-position" data-bubble-id={bubble.id} key={bubble.id}>{renderBubble(bubble)}</div>)}</div>;
}
