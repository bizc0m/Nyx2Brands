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
