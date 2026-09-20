import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveredSkins,generateSkin,validatePersonalSkins} from '../packages/neuroforge-core/skins.mjs';
import {newProject,validate} from '../packages/neuroforge-core/index.mjs';
test('recovered skins and generated palettes satisfy the portable contract',()=>{
 assert.equal(Object.keys(recoveredSkins).length,20);
 for(const hue of [0,35,120,210,265,360])for(const mode of ['dark','light']){const p=newProject();p.theme=generateSkin('Test',hue,mode);assert.deepEqual(validate(p).errors,[]);}
 for(const skin of Object.values(recoveredSkins)){const p=newProject();for(const key of ['name','appearance','background','surface','text','muted','accent'])p.theme[key]=skin[key];assert.deepEqual(validate(p).errors,[],skin.name);}
});
test('personal library survives serialization and rejects invalid imports without mutation',()=>{
 const library=[{id:'personal-test',theme:generateSkin('My skin',150)}];
 assert.deepEqual(validatePersonalSkins(JSON.parse(JSON.stringify(library))),library);
 const invalid=structuredClone(library);invalid[0].theme.accent='url(x)';assert.throws(()=>validatePersonalSkins(invalid));
 assert.throws(()=>validatePersonalSkins([...library,...library]));assert.throws(()=>generateSkin('',150));
 assert.equal(library[0].theme.name,'My skin');
});
