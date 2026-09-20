import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {unzipSync,strFromU8} from 'fflate';
import {newProject,parseProject,FUNCTION_CATALOGUE} from '../packages/neuroforge-core/index.mjs';
import {emptyIntegration,integrationFiles,integrationZip,catalogueSources,applyVisualPack} from '../packages/neuroforge-core/integration.mjs';
const sources=catalogueSources(readFileSync(new URL('../public/moteur-ux.html',import.meta.url),'utf8'));
const project=()=>{const p=newProject();p.integration={...emptyIntegration(),features:['documents-0','green-terminal-0'],path:'/test/my-app'};return p;};
test('mixed sources, skin and identity contract survive ZIP and reimport',()=>{
 const p=project();p.theme.name='Independent skin';const files=integrationFiles(p,sources);const zip=unzipSync(integrationZip(files));
 assert.deepEqual(parseProject(strFromU8(zip['pack.neuroforge.json'])),p);
 assert.equal(strFromU8(zip['sources/documents.html']),sources.find(s=>s.id==='documents').html);
 assert.ok(zip['sources/green-terminal.html']);assert.ok(zip['sources/nyx-blanc.html']);
 const manifest=JSON.parse(strFromU8(zip['manifest.json']));assert.equal(manifest.functions.length,2);assert.equal(manifest.theme,'Independent skin');
 assert.match(strFromU8(zip['INTEGRATION.md']),/Importer Markdown/);assert.match(strFromU8(zip['INTEGRATION.md']),/adapter-web.mjs/);
 assert.ok(!zip['sources/fx.html']);
});
test('generator refuses missing path, selection, source and forged functions',()=>{
 for(const mutate of [p=>p.integration.path='',p=>p.integration.features=[],p=>p.integration.features=['unknown'],p=>p.integration.features.push('documents-0'),p=>p.integration.technology='other']){const p=project();mutate(p);assert.throws(()=>integrationFiles(p,sources));}
 assert.throws(()=>integrationFiles(project(),[]));
});
test('old packs remain valid, catalogue metadata matches actual sources',()=>{
 assert.doesNotThrow(()=>parseProject(JSON.stringify(newProject())));
 assert.equal(FUNCTION_CATALOGUE.length,sources.length);
 for(const source of sources)assert.deepEqual(FUNCTION_CATALOGUE.find(s=>s.id===source.id).features,source.features);
});
test('scoped adapter applies tokens and restores priority, assets and business state',()=>{
 const p=project();p.identity.logo='data:image/png;base64,AAAA';const values=new Map([['--nf-accent',['red','important']],['--danger',['red','']],['width',['300px','']]]);
 const attrs=new Map([['src','old.png']]);const img={getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)};
 const root={style:{getPropertyValue:k=>values.get(k)?.[0]||'',getPropertyPriority:k=>values.get(k)?.[1]||'',setProperty:(k,v,priority='')=>values.set(k,[v,priority]),removeProperty:k=>values.delete(k)},querySelectorAll:s=>s==='img[data-nf-logo]'?[img]:[]};
 const before=[...values],undo=applyVisualPack(p,root);assert.equal(values.get('--nf-accent')[0],p.theme.accent);assert.equal(attrs.get('src'),p.identity.logo);assert.deepEqual(values.get('--danger'),['red','']);undo();assert.deepEqual([...values],before);assert.equal(attrs.get('src'),'old.png');
 const bad=project();bad.theme.accent='url(https://example.com)';assert.throws(()=>applyVisualPack(bad,root));assert.deepEqual([...values],before);
});

import {catalogueThumbnails,designPreview} from '../packages/neuroforge-core/design-preview.mjs';
test('gallery includes existing thumbnails and rejects remote image URLs',()=>{
 const html=readFileSync(new URL('../public/moteur-ux.html',import.meta.url),'utf8');
 const thumbnails=catalogueThumbnails(html);
 for(const source of sources)assert.ok(thumbnails[source.id],source.id);
 assert.deepEqual(catalogueThumbnails('const THUMBNAILS={"remote":"https://example.org/image.png"};'),{});
});
test('design preview isolates storage and preserves semantic colors',()=>{
 const p=project();const preview=designPreview('<html><head></head><body><script>localStorage.setItem("x","y");</script><style>:root{--danger:red}</style></body></html>',p);
 assert.match(preview,/connect-src 'none'/);assert.match(preview,/script-src 'unsafe-inline' 'unsafe-eval' blob:/);assert.match(preview,/window.__nyxPreviewStorage.setItem/);assert.match(preview,/--danger:red/);assert.match(preview,/--accent:#64D2FF!important/);
 assert.doesNotMatch(designPreview('<h1>original</h1>'),/--accent:/);
});
