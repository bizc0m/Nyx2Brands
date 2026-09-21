'use client';
import {useEffect,useRef,useState} from 'react';
import {uxHTML,REFERENCES,UX_BLOCKS} from '../packages/neuroforge-core/ux-blocks.mjs';
import {unifiedHTML} from '../packages/neuroforge-core/nyx-unified.mjs';
import {validSession} from '../packages/neuroforge-core/compositions.mjs';
export default function NyxPreview({project,skins,onTheme,onSession,onNativeState}){
 const frame=useRef(null),latest=useRef(null),initialProject=useRef(project);
 const [html,setHTML]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let active=true;fetch('./nyx-unified.html').then(r=>{if(!r.ok)throw Error('Base Nyx intégré indisponible.');return r.text();}).then(source=>{if(active)setHTML(unifiedHTML(source,initialProject.current));}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 useEffect(()=>{const payload={type:'nyx-project',project,skins:Object.entries(skins).map(([id,s])=>({id,name:s.name})),blockHTML:uxHTML({...project,integration:{...project.integration,blocks:UX_BLOCKS.map(b=>b.id)}}),references:REFERENCES.filter(r=>project.integration?.references?.includes(r.id))};latest.current=payload;frame.current?.contentWindow?.postMessage(payload,location.origin);},[project,skins]);
 useEffect(()=>{const receive=e=>{if(e.source!==frame.current?.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='nyx-unified-ready'&&latest.current)frame.current.contentWindow.postMessage(latest.current,location.origin);if(e.data?.type==='nyx-theme-select'&&typeof e.data.id==='string')onTheme(e.data.id);if(e.data?.type==='nyx-ux-session'&&validSession(e.data.state))onSession(e.data.state);if(e.data?.type==='nyx-native-state'){const s=e.data.state;if(s&&typeof s==='object'&&!Array.isArray(s)&&Object.keys(s).length<=30&&Object.entries(s).every(([k,v])=>k.length<=160&&typeof v==='string'&&v.length<=3000000)&&JSON.stringify(s).length<=5000000)onNativeState(s);}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[onTheme,onSession,onNativeState]);
 if(error)return <p role="alert">{error}</p>;
 if(!html)return <p>Chargement de Nyx intégré…</p>;
 return <iframe ref={frame} className="design-preview nyx-unified-preview" title="Nyx intégré — application unifiée" srcDoc={html} sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"/>;
}
