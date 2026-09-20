import {contrast,newProject,validate} from './index.mjs';

export const SKIN_LIBRARY_STORAGE = 'nyx-personal-skins-v1';
export function hslHex(h,s,l) {
  s/=100;l/=100;
  const a=s*Math.min(l,1-l), f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');};
  return '#'+f(0)+f(8)+f(4);
}
// Keep source colors except secondary text when its contrast is insufficient.
export function readableSkin(skin) {
  const result={...skin};
  if(['background','surface'].some(bg=>contrast(result.muted,result[bg])<4.5)) result.muted=result.text;
  return result;
}
export function generateSkin(name,hue,appearance='dark') {
  if(typeof name!=='string'||!name.trim()||name.trim().length>64||!Number.isFinite(hue)||hue<0||hue>360||!['dark','light'].includes(appearance)) throw Error('Nom, teinte ou mode invalide.');
  const dark=appearance==='dark';
  return readableSkin({name:name.trim(),appearance,background:hslHex(hue,dark?40:50,dark?5:100),surface:hslHex(hue,dark?35:45,dark?9:97),text:hslHex(hue,dark?15:45,dark?96:11),muted:hslHex(hue,dark?10:22,dark?60:43),accent:hslHex(hue,dark?85:75,dark?62:40),typography:{family:'system',size:13},density:'comfortable'});
}
const definitions=[['Crimson','dark',350],['Amber','dark',35],['Gold','dark',50],['Lime','dark',95],['Emerald','dark',150],['Teal','dark',175],['Cyan','dark',190],['Azure','dark',210],['Indigo','dark',245],['Violet','light',265],['Magenta','light',310],['Rose','light',340],['Orange','light',20],['Sage','light',120],['Slate Blue','light',220]];
export const recoveredSkins=Object.fromEntries([
 ...definitions.map(([name,mode,hue])=>['dashboard-'+name.toLowerCase().replaceAll(' ','-'),{...generateSkin(name,hue,mode),group:'Dashboard original'}]),
 ['macos-light',{name:'macOS Light',appearance:'light',background:'#E8E8ED',surface:'#FFFFFF',text:'#1D1D1F',muted:'#8A8A8E',accent:'#0A5FFF',group:'Dashboard original'}],
 ['nyx-ux',{name:'Nyx',appearance:'dark',background:'#07080b',surface:'#101116',text:'#f3f5f7',muted:'#8d939c',accent:'#48c7c2',group:'Nyx-Ux'}],
 ['graphite',{name:'Graphite',appearance:'dark',background:'#0a0a0a',surface:'#151515',text:'#f4f4f5',muted:'#92929a',accent:'#7dd3fc',density:'compact',group:'Nyx-Ux'}],
 ['daylight',{name:'Daylight',appearance:'light',background:'#e9edf2',surface:'#f8fafc',text:'#111827',muted:'#64748b',accent:'#2563eb',group:'Nyx-Ux'}],
 ['neuro-forge',{name:'Neuro Forge',appearance:'dark',background:'#050505',surface:'#161616',text:'#F7F3EA',muted:'#B8B2A9',accent:'#B11226',group:'NeuroForge'}]
].map(([id,skin])=>[id,{...readableSkin(skin),signal:skin.accent,radius:6}]));
export function validatePersonalSkins(value) {
 if(!Array.isArray(value)||value.length>100)throw Error('Bibliothèque de skins invalide.');
 const ids=new Set();
 return value.map(item=>{
  if(!item||typeof item.id!=='string'||!/^personal-[a-z0-9-]+$/.test(item.id)||ids.has(item.id))throw Error('Identifiant de skin invalide.');
  ids.add(item.id);const p=newProject();p.theme=item.theme;
  if(validate(p).errors.length)throw Error('Skin personnel invalide.');
  return {id:item.id,theme:JSON.parse(JSON.stringify(item.theme))};
 });
}
