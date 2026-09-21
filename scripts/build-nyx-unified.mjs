import {dressingCSS,GLASS_VIDEO} from '../packages/neuroforge-core/dressings.mjs';
import {icons} from 'lucide-react';
import {readFileSync,writeFileSync} from 'node:fs';
import {catalogueSources} from '../packages/neuroforge-core/integration.mjs';
import {unifiedRuntime} from '../packages/neuroforge-core/nyx-unified.mjs';
import {mountUX} from '../packages/neuroforge-core/ux-blocks.mjs';
import {validSession} from '../packages/neuroforge-core/compositions.mjs';
const original=catalogueSources(readFileSync('public/moteur-ux.html','utf8')).find(s=>s.id==='integrated').html;
const re=/<script type="__bundler\/template">([\s\S]*?)<\/script>/;
let template=JSON.parse(original.match(re)[1]);
function patch(from,to){if(!template.includes(from))throw Error('Nyx source drift: '+from.slice(0,60));template=template.replace(from,to);}
patch('  componentDidMount() {','  componentDidMount() {\n    window.NyxShell=this;\n    try{const s=JSON.parse(window.NyxStore.getItem("shell")||"null");if(s?.tabs?.length)this.setState(s);}catch{}');
patch('  componentDidUpdate() { this.refreshIcons(); }','  componentDidUpdate() { this.refreshIcons(); window.NyxStore.setItem("shell",JSON.stringify(this.state)); }');
patch('bladeItems: [','bladeItems: [{icon:"library",label:"Bibliothèque",color:"var(--ic-blue)",installed:true},');
patch("tabs: [", "tabs: [{label:'Bibliothèque',kind:'ux',focusedPane:'ux-root',zoomedPane:null,columns:[]},");
patch('activeTab: 0,','activeTab: 1,');
patch('<div style="{{ rootStyle }}">','<div class="nyx-shell" style="{{ rootStyle }}">');
patch('<div style="height:40px;','<div class="nyx-toolbar" style="height:40px;');
patch('<div style="height:34px;','<div class="nyx-tabs" style="height:34px;');
patch('<div style="flex:1; display:flex; min-height:0;">','<div class="nyx-body" style="flex:1; display:flex; min-height:0;">');
patch('<div style="width: {{ sidebarWidth }};','<div class="nyx-sidebar" style="width: {{ sidebarWidth }};');
patch('<div style="font-weight:600; font-size:13px;">Nyx</div>','<div data-nyx-product style="font-weight:600; font-size:13px;white-space:nowrap;">Nyx</div>');
patch('sidebarCollapsed: false,','sidebarCollapsed: window.innerWidth < 700,');
patch('width:100px; overflow-x:auto; padding:2px 0;','width:100px; overflow-x:auto; padding:2px 0; display:none;');
patch('onClick: () => this.setState({ themeIndex: i })','onClick: () => window.NyxSelectThemeName(t.name)');
patch('showOriginalWorkspace: !["documents","registry"].includes(tab.kind),','showUXWorkspace: tab.kind === "ux", showOriginalWorkspace: !["documents","registry","ux"].includes(tab.kind),');
patch('<sc-if value="{{ showRegistryWorkspace }}"','<sc-if value="{{ showUXWorkspace }}" hint-placeholder-val="{{ false }}"><div id="nyx-blocks-slot" style="flex:1;min-width:0;min-height:0;overflow:auto"></div></sc-if><sc-if value="{{ showRegistryWorkspace }}"');
// Keep locally retained documents reachable after their last visible tab closes.
patch('<button id="nd-new">Nouvelle note</button>','<button id="nd-new">Nouvelle note</button><select id="nd-saved" aria-label="Documents conservés" style="max-width:240px"></select>');
patch("function render(){$('nd-tree')",`function render(){const saved=$('nd-saved');if(saved){saved.replaceChildren(new Option('Documents conservés ('+Object.keys(state.docs).length+')',''),...Object.values(state.docs).map(d=>new Option(d.name,d.id)));saved.onchange=()=>{const id=saved.value;if(!state.docs[id])return;const p=find(focus)||leaves()[0];if(!p.tabs.includes(id))p.tabs.push(id);p.active=id;p.collapsed=false;focus=p.id;save();render();};}$('nd-tree')`);
patch('function mountRegistry(){','let registryFrame=null;function mountRegistry(){');
// Preserve one Registry document across tab switches, just like Documents.
patch('  if(!slot)return;\n  let frame=slot.querySelector', '  if(!slot){const existing=registryFrame;if(existing){existing.hidden=true;if(existing.parentNode!==document.body)document.body.append(existing);}return;}\n  let frame=document.querySelector');
patch("let frame=document.querySelector('iframe[data-nyx-registry]');","let frame=registryFrame;");
patch("frame=document.createElement('iframe');","frame=document.createElement('iframe');registryFrame=frame;");
patch('    slot.replaceChildren(frame);','    slot.replaceChildren(frame);');
patch('    frame.srcdoc=registrySrcDoc;', '    frame.srcdoc=registrySrcDoc.replace("<head>","<head><script>window.NyxStore=parent.NyxStore;<\\/script>");');
patch('  }\n}\nconst obs=new MutationObserver(mountRegistry);','  }\n  frame.hidden=false;if(frame.parentNode!==slot)slot.append(frame);\n}\nconst obs=new MutationObserver(mountRegistry);');
const registryPattern=/const registrySrcDoc=("[^\n]*");/;
const registryMatch=template.match(registryPattern);
if(!registryMatch)throw Error('Registry source missing');
let registry=JSON.parse(registryMatch[1]);
registry=registry.replace('render();\n</script>',`window.applyNyxProject=(project,skins)=>{state.product.name=project.project.name;state.product.skin=project.theme.name;render();const n=document.getElementById('product-name');if(n){n.readOnly=true;n.title='Identité partagée avec le projet';}const s=document.getElementById('product-skin');if(s){s.replaceChildren(...skins.map(item=>{const o=document.createElement('option');o.value=item.name;o.textContent=item.name;return o;}));s.value=project.theme.name;s.oninput=()=>parent.NyxSelectThemeName(s.value);}save();};\nrender();\n</script>`);
template=template.replace(registryPattern,()=> 'const registrySrcDoc='+JSON.stringify(registry).replace(/<\//g,'<\\/')+';');
template=template.replace(/\blocalStorage\b/g,'window.NyxStore').replaceAll('autosave window.NyxStore','sauvegarde locale');
const iconNodes={};for(const [name,Icon] of Object.entries(icons)){const kebab=name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/([a-z])([0-9])/g,'$1-$2').toLowerCase();if(template.includes(kebab))try{iconNodes[kebab]=Icon.render({},null).props.iconNode;}catch{}}
iconNodes.filter=icons.Funnel.render({},null).props.iconNode;iconNodes['split-square-horizontal']=icons.SquareSplitHorizontal.render({},null).props.iconNode;
const dressingRuntime='const dressingCSS='+dressingCSS.toString()+';const GLASS_VIDEO='+JSON.stringify(GLASS_VIDEO)+';';
const runtime='<script id="nyx-unified-runtime">'+dressingRuntime+'window.__NYX_ICON_NODES='+JSON.stringify(iconNodes)+';const validSession='+validSession.toString()+';window.__NYX_MOUNT_BLOCKS='+mountUX.toString()+';('+unifiedRuntime.toString()+')();</script>';
// Initialize storage and protocol before the bundled component executes.
template=template.replace('<body>','<body>'+runtime);
const output=original.replace(re,()=>'<script type="__bundler/template">'+JSON.stringify(template).replace(/<\//g,'<\\/')+'</script>');
writeFileSync('public/nyx-unified.html',output);
console.log('Nyx intégré preserved and extended:',output.length,'bytes');
