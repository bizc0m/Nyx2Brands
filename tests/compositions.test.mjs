import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {newProject,parseProject,validate} from '../packages/neuroforge-core/index.mjs';
import {COMPOSITIONS,validSession} from '../packages/neuroforge-core/compositions.mjs';
import {codepenSkins} from '../packages/neuroforge-core/codepen-skins.mjs';
import {UX_BLOCKS,REFERENCES,uxHTML} from '../packages/neuroforge-core/ux-blocks.mjs';
import {integrationFiles,emptyIntegration} from '../packages/neuroforge-core/integration.mjs';
const session={selected:'ref-14',compare:['ref-14'],favorites:['ref-14'],notes:{'ref-14':'Conserver <script> cette note'},clips:[{name:'Introduction',duration:5}],query:'LAP',category:'',favOnly:false,list:false,position:2};
const make=()=>{const p=newProject();p.modules=p.modules.filter(m=>m!=='layout');p.integration={...emptyIntegration(),path:'/test',blocks:UX_BLOCKS.map(b=>b.id),references:REFERENCES.map(r=>r.id),session};return p;};
test('six distinct layouts reuse the same runtime and preserve state through export/import',()=>{
 assert.equal(new Set(COMPOSITIONS.map(c=>c.areas)).size,6);
 for(const composition of COMPOSITIONS){const p=make();p.integration.composition=composition.id;const {group:_group,signal:_signal,radius:_radius,...theme}=codepenSkins[composition.skin];p.theme=theme;assert.deepEqual(validate(p).errors,[]);const files=integrationFiles(p,[]);assert.equal(files['preview.html'],uxHTML(p));assert.match(files['preview.html'],new RegExp('data-composition="'+composition.id+'"'));assert.deepEqual(parseProject(files['pack.neuroforge.json']).integration.session,session);assert.equal(JSON.parse(files['manifest.json']).composition.id,composition.id);assert.doesNotThrow(()=>new Script(files['preview.html'].match(/<script>([\s\S]*)<\/script>/)[1]));}
});
test('session contract rejects executable, oversized and unknown state without affecting valid packs',()=>{assert.ok(validSession(session));for(const bad of [{...session,notes:{'not-ref':'x'}},{...session,clips:[{name:'a',duration:-1}]},{...session,query:'x'.repeat(201)},{...session,evil:'x'},{...session,compare:Array(5).fill('ref-01')}]){const p=make();p.integration.session=bad;assert.ok(validate(p).errors.length);}const p=make();p.integration.composition='unknown';assert.ok(validate(p).errors.length);});
