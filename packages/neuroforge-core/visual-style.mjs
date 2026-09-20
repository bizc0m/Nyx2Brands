export const VISUAL_KINDS=['glass','soft','brutal','retro','neon','minimal'];
export function validVisual(v){return v && Object.keys(v).every(k=>['kind','radius','border','depth'].includes(k))&&VISUAL_KINDS.includes(v.kind)&&Number.isInteger(v.radius)&&v.radius>=0&&v.radius<=24&&Number.isInteger(v.border)&&v.border>=0&&v.border<=4&&Number.isInteger(v.depth)&&v.depth>=0&&v.depth<=16;}
export function visualTokens(t){
 if(!t.visual)return {};
 if(!validVisual(t.visual))throw Error('Style visuel invalide.');
 const {kind,radius,border,depth}=t.visual;
 const shadows={glass:`0 ${depth}px ${depth*3}px #00000030`,soft:`${depth}px ${depth}px ${depth*2}px #00000025, -${depth}px -${depth}px ${depth*2}px #ffffff55`,brutal:`${depth}px ${depth}px 0 ${t.text}`,retro:'inset 2px 2px 0 #ffffff, inset -2px -2px 0 #555555',neon:`0 0 ${depth*2}px ${t.accent}66`,minimal:`0 ${depth}px ${depth*2}px #00000015`};
 return {'--nf-radius':radius+'px','--nf-border-width':border+'px','--nf-shadow':shadows[kind],'--nf-backdrop':kind==='glass'?'blur(14px)':'none','--nf-panel':kind==='glass'?`color-mix(in srgb, ${t.surface} 82%, transparent)`:t.surface,'--nf-border':kind==='brutal'?t.text:kind==='neon'?t.accent:`color-mix(in srgb, ${t.surface} 70%, ${t.text})`};
}
export function visualRules(t,preview=false){
 if(!t.visual)return '';
 const tokens=visualTokens(t);
 const root=preview?'*':':root';
 const panels=preview?':is(.pane,.card,.panel,[data-pane-id], [style*="flex-direction: column"][style*="box-shadow"])':':is([data-nf-panel],[data-nf-card])';
 const controls=preview?':is(button,input,select,textarea)':':is([data-nf-button],[data-nf-input])';
 return `${root}{${Object.entries(tokens).map(([k,v])=>`${k}:${v}${preview?'!important':''}`).join(';')}}${panels}{background:var(--nf-panel)!important;border:var(--nf-border-width) solid var(--nf-border)!important;border-radius:var(--nf-radius)!important;box-shadow:var(--nf-shadow)!important;backdrop-filter:var(--nf-backdrop)!important;} ${controls}{border-radius:var(--nf-radius)!important;border-width:var(--nf-border-width)!important;border-color:var(--nf-border)!important;} ${controls}:focus-visible{outline:2px solid ${t.accent};outline-offset:2px;}`;
}
