import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {newProject,parseProject} from '../packages/neuroforge-core/index.mjs';
import {catalogueSources,emptyIntegration,integrationFiles} from '../packages/neuroforge-core/integration.mjs';
import {unifiedHTML} from '../packages/neuroforge-core/nyx-unified.mjs';
const read=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
const source=read('nyx-unified.html');
const sources=catalogueSources(read('moteur-ux.html'));
const template=html=>JSON.parse(html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/)[1]);
test('unified export preserves the original asset bundle and embeds the actual Nyx shell',()=>{
 const p=newProject();p.ui={family:'integrated-family',variant:'integrated'};p.integration={...emptyIntegration(),path:'/test/nyx',blocks:['library'],references:[],nativeState:{shell:JSON.stringify({tabs:[{label:'Documents',kind:'documents'}],activeTab:0})}};
 const files=integrationFiles(p,sources,source);
 assert.equal(files['preview.html'],files['nyx-integre.html']);
 assert.equal(JSON.parse(files['manifest.json']).base,'nyx-integre');
 assert.deepEqual(parseProject(files['pack.neuroforge.json']),p);
 assert.match(files['preview.html'],/window.__NYX_INITIAL=/);
 const original=sources.find(s=>s.id==='integrated').html;
 const manifest=html=>html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/)[1];
 assert.equal(manifest(source),manifest(original));
 const t=template(source);
 for(const id of ['nyx-documents-slot','nyx-registry-slot','nyx-blocks-slot','nyx-shared-settings'])assert.ok(t.includes(id),id);
 const runtime=t.match(/<script id="nyx-unified-runtime">([\s\S]*?)<\/script>/)[1];
 assert.doesNotThrow(()=>new Script(runtime));
 assert.throws(()=>unifiedHTML(original,p),/absente/);
});
test('workspace snapshot rejects oversized and non-string storage before importing',()=>{
 const p=newProject();p.integration={...emptyIntegration(),nativeState:{docs:'[]'}};
 assert.deepEqual(parseProject(JSON.stringify(p)).integration.nativeState,{docs:'[]'});
 for(const state of [{docs:{}},{docs:'x'.repeat(3000001)},Array(2).fill('x')]){p.integration.nativeState=state;assert.throws(()=>parseProject(JSON.stringify(p)));}
});
test('Glass pack roundtrip retains document content, selection, panels and Registry',()=>{
 const p=newProject();
 p.ui={family:'integrated-family',variant:'integrated'};
 p.integration={...emptyIntegration(),path:'/test/nyx',blocks:['library'],dressing:'glass-dashboard',dressingSettings:{blur:9},nativeState:{shell:JSON.stringify({activeTab:1,tabs:[{label:'Documents',kind:'documents'},{label:'Registry',kind:'registry'}],sidebarCollapsed:true}), 'nyx-documents-v1':JSON.stringify({documents:[{name:'preuve.md',content:'# Texte conservé'}],panels:[{id:'left',selected:'preuve.md'},{id:'right'}]}), registry:JSON.stringify({modules:['documents','web']})}};
 const snapshot=structuredClone(p.integration.nativeState);
 const files=integrationFiles(p,sources,source),restored=parseProject(files['pack.neuroforge.json']);
 assert.deepEqual(restored,p);assert.equal(JSON.parse(files['manifest.json']).dressing,'glass-dashboard');
 assert.match(files['GLASS-LICENSE.txt'],/gestok/);assert.equal(JSON.parse(files['GLASS-RESOURCES.json']).offline,false);
 for(const dressing of ['nyx','glass-dashboard']){restored.integration.dressing=dressing;assert.deepEqual(parseProject(JSON.stringify(restored)).integration.nativeState,snapshot);}
 p.integration.dressing='unknown';assert.throws(()=>parseProject(JSON.stringify(p)),/Habillage/);
 p.integration.dressing='glass-dashboard';p.integration.dressingSettings.blur=99;assert.throws(()=>parseProject(JSON.stringify(p)),/verre/);
});
test('Glass applies a chosen palette and keeps an explicit original-colors option',async()=>{
 const {dressingCSS}=await import('../packages/neuroforge-core/dressings.mjs');
 const light={name:'Light',surface:'#FFFFFF',background:'#F4F4F4',text:'#222222',muted:'#666666'};
 const dark={name:'Dark',surface:'#111111',background:'#000000',text:'#EEEEEE',muted:'#AAAAAA'};
 const a=dressingCSS('glass-dashboard',{blur:8,palette:true},light);
 const b=dressingCSS('glass-dashboard',{blur:8,palette:true},dark);
 assert.match(a,/background:#FFFFFFe8!important/);assert.match(a,/color:#222222!important/);assert.match(b,/background:#111111e8!important/);assert.notEqual(a,b);
 assert.match(dressingCSS('glass-dashboard',{palette:false},light),/#406882/);
 const p=newProject();p.integration={...emptyIntegration(),dressing:'glass-dashboard',dressingSettings:{blur:8,palette:true}};assert.deepEqual(parseProject(JSON.stringify(p)),p);
});
test('NotePlan Style is a valid theme dressing with its own live Nyx presentation',async()=>{
 const {DRESSINGS,dressingCSS}=await import('../packages/neuroforge-core/dressings.mjs');
 assert.ok(DRESSINGS.includes('noteplan-style-v2'));
 const css=dressingCSS('noteplan-style-v2',{},{});
 assert.match(css,/SF Pro Text/);
 assert.match(css,/\.nyx-shell/);
 const p=newProject();p.integration={...emptyIntegration(),dressing:'noteplan-style-v2'};
 assert.deepEqual(parseProject(JSON.stringify(p)),p);
});
