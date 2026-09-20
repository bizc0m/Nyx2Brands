import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Glass Dashboard preview retains original CSS, JS, body and attribution',()=>{
 const root='vendor/codepen/YzLBVOp/';const meta=JSON.parse(read(root+'source.json'));
 for(const [file,hash] of Object.entries(meta.sha256))assert.equal(createHash('sha256').update(read(root+file)).digest('hex'),hash,file);
 const preview=read('public/codepen/YzLBVOp/index.html');
 assert.ok(preview.includes('<style>'+read(root+'original.css')+'</style>'));
 assert.ok(preview.includes('<script>'+read(root+'original.js')+'</script>'));
 assert.ok(preview.includes(read(root+'original.html').replace('</body>','<script>'+read(root+'original.js')+'</script></body>')));
 assert.match(read('public/codepen/YzLBVOp/LICENSE'),/gestok/);
 assert.doesNotMatch(preview,/stopExecutionOnTimeout/);
});
