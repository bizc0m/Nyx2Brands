'use client';
import {memo,useEffect,useRef} from 'react';
import {uxHTML} from '../packages/neuroforge-core/ux-blocks.mjs';
import {validSession} from '../packages/neuroforge-core/compositions.mjs';
function UXPreview({project,onSession,title,className}){
 const frame=useRef(null);
 // Session messages must not reload the iframe. A structural/theme change rebuilds
 // the document using the latest session, so every layout keeps the same actions.
 const html=uxHTML(project);
 useEffect(()=>{const receive=event=>{if(event.source===frame.current?.contentWindow&&event.data?.type==='nyx-ux-session'&&validSession(event.data.state))onSession(event.data.state);};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[onSession]);
 return <iframe ref={frame} className={className} title={title} sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox" srcDoc={html}/>;
}

// A session-only update is already present inside the running iframe. Avoid a
// navigation; the next theme/layout render receives the latest project session.
const signature=({project,title,className})=>JSON.stringify({title,className,...project,integration:{...project.integration,session:undefined}});
export default memo(UXPreview,(before,after)=>signature(before)===signature(after));
