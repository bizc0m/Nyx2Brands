import test from 'node:test';import assert from 'node:assert/strict';
import {codepenReferences,codepenSkins} from '../packages/neuroforge-core/codepen-skins.mjs';
import {newProject,parseProject,themeCSS,validate} from '../packages/neuroforge-core/index.mjs';
import {visualTokens} from '../packages/neuroforge-core/visual-style.mjs';
import {integrationFiles} from '../packages/neuroforge-core/integration.mjs';
test('twenty attributed references with twenty portable adaptations',()=>{
 assert.equal(codepenReferences.length,20);assert.equal(Object.keys(codepenSkins).length,20);assert.equal(codepenReferences.filter(r=>r.status==='unavailable').length,0);
 for(const r of codepenReferences.filter(r=>r.theme)){const p=newProject();p.theme=r.theme;assert.deepEqual(validate(p).errors,[],r.name);assert.deepEqual(parseProject(JSON.stringify(p)).theme,r.theme);assert.match(themeCSS(p),/data-nf-panel/);assert.ok(visualTokens(r.theme)['--nf-shadow']);}
});
test('visual styles reject CSS injection and retain source in integration exports',()=>{
 const p=newProject();p.theme=structuredClone(codepenReferences[0].theme);p.integration={features:['documents-0'],path:'/test/app',technology:'Web / HTML',notes:''};
 const files=integrationFiles(p,[{id:'documents',html:'<main>Source</main>'},{id:'nyx-blanc',html:'<main>Layout</main>'}]);assert.match(files['SKIN-SOURCE.md'],/gestok/);assert.match(files['adapter-web.mjs'],/function visualTokens/);
 p.theme.visual.radius='1px;display:none';assert.ok(validate(p).errors.length);assert.throws(()=>themeCSS(p));
});
