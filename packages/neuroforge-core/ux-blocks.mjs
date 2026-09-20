import references from './references.json' with {type:'json'};
import {visualRules} from './visual-style.mjs';
export const REFERENCES=references;
export const UX_BLOCKS=[
 {id:'menus',name:'Menus dépliables',detail:'Actions organisées en sous-menus utilisables au clavier.',refs:['ref-26','ref-27']},
 {id:'tree',name:'Arborescence & espaces',detail:'Espaces et catégories qui filtrent la bibliothèque.',refs:['ref-06','ref-07','ref-08']},
 {id:'library',name:'Bibliothèque filtrable',detail:'Recherche, catégories, favoris, densité et grille/liste.',refs:['ref-14']},
 {id:'compare',name:'Comparaison à quatre panneaux',detail:'Sélectionnez jusqu’à quatre références et comparez leurs apports.',refs:['ref-14','ref-04','ref-05']},
 {id:'inspector',name:'Inspecteur & notes',detail:'Détails de la sélection et notes exportables.',refs:['ref-01','ref-07']},
 {id:'commands',name:'Commandes rapides',detail:'Palette Ctrl/Cmd K : rechercher une commande et naviguer.',refs:['ref-07','ref-15']},
 {id:'timeline',name:'Séquence créative',detail:'Ajouter, déplacer et retirer des étapes ; parcourir leur durée.',refs:['ref-03','ref-12']},
 {id:'sources',name:'Sources & provenance',detail:'Les 27 références, leur origine et leur fiche existante.',refs:['ref-15']},
];
export const validUXSelection=(value,items)=>Array.isArray(value)&&value.length<=items.length&&new Set(value).size===value.length&&value.every(id=>items.some(item=>item.id===id));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The same dependency-free runtime is used by the live preview and exported HTML.
export function mountUX(config){
 const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
 const refs=config.references,clips=[];let selected=refs[0]?.id,compare=[],favorites=[],notes={},query='',category='',favOnly=false;
 const stateKey='nyx-ux-demo:'+config.id;
 try{const state=JSON.parse(localStorage.getItem(stateKey)||'null');if(state){favorites=Array.isArray(state.favorites)?state.favorites.filter(id=>refs.some(r=>r.id===id)):[];notes=state.notes&&typeof state.notes==='object'?state.notes:{};}}catch{}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const say=s=>{$('#notice').textContent=s;};
 const persist=()=>{try{localStorage.setItem(stateKey,JSON.stringify({favorites,notes}));say('Favoris et notes enregistrés dans ce navigateur.');}catch{say('Aperçu isolé : notes en mémoire. Exportez la session pour les conserver.');}};
 const download=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({favorites,notes,clips},null,2)],{type:'application/json'}));a.href=url;a.download='session-ux.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Session exportée.');};
 const categories=[...new Set(refs.map(r=>r.category))];
 if($('#categories'))$('#categories').innerHTML='<option value="">Toutes les catégories</option>'+categories.map(c=>'<option>'+escape(c)+'</option>').join('');
 if($('#tree'))$('#tree').innerHTML='<button data-category="">Toutes les références</button>'+[...new Set(categories.map(c=>c.split(' / ')[0]))].map(group=>'<details><summary>'+escape(group)+'</summary>'+categories.filter(c=>c.split(' / ')[0]===group).map(c=>'<button data-category="'+escape(c)+'">'+escape(c)+'</button>').join('')+'</details>').join('');
 function render(){
 const visible=refs.filter(r=>(!category||r.category===category)&&(!favOnly||favorites.includes(r.id))&&(r.name+' '+r.idea).toLowerCase().includes(query.toLowerCase()));
 if($('#count'))$('#count').textContent=visible.length+' références';
 if($('#items'))$('#items').innerHTML=visible.map(r=>'<article data-nf-card><button class="item-select" data-select="'+r.id+'" aria-pressed="'+(selected===r.id)+'"><small>'+escape(r.category)+'</small><h3>'+escape(r.name)+'</h3><p>'+escape(r.idea)+'</p></button><div class="row"><button data-favorite="'+r.id+'" aria-label="Favori '+escape(r.name)+'" aria-pressed="'+favorites.includes(r.id)+'">'+(favorites.includes(r.id)?'★':'☆')+'</button>'+(config.blocks.includes('compare')?'<button data-compare="'+r.id+'" aria-pressed="'+compare.includes(r.id)+'">'+(compare.includes(r.id)?'Retirer':'Comparer')+'</button>':'')+'</div></article>').join('')||'<p>Aucun résultat. Modifiez les filtres.</p>';
 const ref=refs.find(r=>r.id===selected);
 if($('#inspector')&&ref){$('#inspector-title').textContent=ref.name;$('#inspector-detail').textContent=ref.idea;$('#reference-link').href=ref.url;$('#note').value=typeof notes[ref.id]==='string'?notes[ref.id]:'';}
 if($('#comparison'))$('#comparison').innerHTML=compare.map(id=>refs.find(r=>r.id===id)).filter(Boolean).map(r=>'<article data-nf-card><h3>'+escape(r.name)+'</h3><p>'+escape(r.category)+'</p><p>'+escape(r.idea)+'</p><button data-compare="'+r.id+'">Retirer '+escape(r.name)+'</button></article>').join('')||'<p>Utilisez « Comparer » dans la bibliothèque (4 maximum).</p>';
 if($('#sources'))$('#sources').innerHTML=refs.map(r=>'<details><summary>'+escape(r.name)+'</summary><p>'+escape(r.status)+'</p><a target="_blank" rel="noreferrer" href="'+escape(r.url)+'">Ouvrir la source ↗</a><p>'+escape(r.provenance)+'</p>'+(r.km?'<p>Fiche existante : '+escape(r.km)+'</p>':'')+'</details>').join('');
 }
 document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.select){selected=b.dataset.select;render();}
 if(b.dataset.favorite){const id=b.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];persist();render();}
 if(b.dataset.compare){const id=b.dataset.compare;if(compare.includes(id))compare=compare.filter(x=>x!==id);else if(compare.length<4)compare.push(id);else say('Quatre panneaux maximum. Retirez une référence pour en comparer une autre.');render();}
 if(b.hasAttribute('data-category')){category=b.dataset.category;if($('#categories'))$('#categories').value=category;render();}
 if(b.dataset.action==='all'){query='';category='';favOnly=false;if($('#search'))$('#search').value='';if($('#categories'))$('#categories').value='';if($('#favorites'))$('#favorites').setAttribute('aria-pressed','false');render();say('Toutes les références affichées.');}
 if(b.dataset.action==='export')download();
 if(b.dataset.action==='commands'){$('#commands').showModal();$('#command-search').focus();}
 if(b.dataset.action==='close')$('#commands').close();
 if(b.dataset.action==='list'){$('#items')?.classList.toggle('list');b.setAttribute('aria-pressed',String($('#items')?.classList.contains('list')));}
 if(b.dataset.action==='favorites'){favOnly=!favOnly;b.setAttribute('aria-pressed',String(favOnly));render();}
 if(b.dataset.command){if(b.dataset.command==='export')download();else if(b.dataset.command==='all'){category='';query='';favOnly=false;if($('#search'))$('#search').value='';if($('#categories'))$('#categories').value='';render();}else $(b.dataset.command)?.scrollIntoView({behavior:'auto'});$('#commands').close();}
 });
 $('#search')?.addEventListener('input',e=>{query=e.target.value;render();});
 $('#categories')?.addEventListener('change',e=>{category=e.target.value;render();});
 $('#density')?.addEventListener('input',e=>$('#items').style.setProperty('--tile',e.target.value+'px'));
 $('#note')?.addEventListener('input',e=>{notes[selected]=e.target.value;persist();});
 $('#command-search')?.addEventListener('input',e=>all('[data-command]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&$('#commands')){e.preventDefault();$('#commands').showModal();$('#command-search').focus();}});
 function renderClips(){if(!$('#clips'))return;$('#clips').innerHTML=clips.map((c,i)=>'<li><b>'+escape(c.name)+'</b> · '+c.duration+' s <button data-move="'+i+'" '+(i===0?'disabled':'')+' aria-label="Avancer '+escape(c.name)+'">←</button><button data-remove="'+i+'" aria-label="Retirer '+escape(c.name)+'">×</button></li>').join('');const total=clips.reduce((sum,c)=>sum+c.duration,0);$('#scrub').max=total;$('#scrub').value=Math.min(Number($('#scrub').value),total);$('#duration').textContent=total+' secondes';showFrame();}
 function showFrame(){const pos=Number($('#scrub').value);let end=0;const clip=clips.find(c=>{end+=c.duration;return pos<end;});$('#frame').textContent=clip?clip.name+' · '+pos+' s':clips.length?'Fin de la séquence':'Ajoutez une étape';}
 $('#add-clip')?.addEventListener('click',()=>{const name=$('#clip-name').value.trim();if(!name){say('Donnez un nom à l’étape.');return;}clips.push({name:name.slice(0,80),duration:Number($('#clip-duration').value)});renderClips();});
 $('#clips')?.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.remove!==undefined)clips.splice(Number(b.dataset.remove),1);if(b.dataset.move!==undefined){const i=Number(b.dataset.move);if(i>0)[clips[i-1],clips[i]]=[clips[i],clips[i-1]];}renderClips();});
 $('#scrub')?.addEventListener('input',showFrame);
 render();renderClips();
}
export function uxHTML(project){
 const t=project.theme,ids=project.integration?.blocks||[],has=id=>ids.includes(id),refs=REFERENCES.filter(r=>(project.integration?.references||[]).includes(r.id));
 const config={id:project.project.id,blocks:ids,references:refs};
 const panel=(id,title,body)=>has(id)?`<section data-nf-panel id="section-${id}"><h2>${title}</h2>${body}</section>`:'';
 return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'"><title>${esc(project.project.name)} · Blocs UX</title><style>
 :root{--nf-background:${t.background};--nf-surface:${t.surface};--nf-text:${t.text};--nf-muted:${t.muted};--nf-accent:${t.accent}}*{box-sizing:border-box}body{margin:0;background:var(--nf-background);color:var(--nf-text);font:${t.typography.size}px/1.5 ${t.typography.family==='monospace'?'ui-monospace':'system-ui'},sans-serif}header{padding:24px;border-bottom:1px solid var(--nf-muted)}h1{font-size:28px;margin:0}h2{font-size:17px}h3{font-size:15px}small,.muted{color:var(--nf-muted)}a{color:var(--nf-text);text-decoration:underline}button,input,select,textarea{font:inherit;color:inherit;background:var(--nf-surface);border:1px solid var(--nf-muted);border-radius:6px;padding:9px;max-width:100%}button{cursor:pointer}button:disabled{opacity:.4;cursor:default}button[aria-pressed=true],button:hover{outline:2px solid var(--nf-accent)}:focus-visible{outline:3px solid var(--nf-accent);outline-offset:3px}header img{width:40px;height:40px;object-fit:contain}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}main{display:grid;gap:16px;padding:16px}section{padding:18px;min-width:0;background:var(--nf-surface);border:1px solid var(--nf-muted);border-radius:10px}#tree{display:flex;gap:6px;flex-wrap:wrap}#items{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--tile,200px)),1fr));gap:12px;margin-top:16px}#items.list{grid-template-columns:1fr}article{border:1px solid var(--nf-muted);border-radius:8px;padding:12px;min-width:0}article .item-select{width:100%;text-align:left;border:0;background:transparent}#comparison{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px}textarea{width:100%;min-height:100px}details{padding:8px;border-bottom:1px solid var(--nf-muted)}summary{cursor:pointer}dialog{background:var(--nf-surface);color:var(--nf-text);border:1px solid var(--nf-muted);width:min(90vw,480px);border-radius:12px}dialog::backdrop{background:#0009}dialog input{width:100%;margin:12px 0}dialog button{margin:4px}#notice{display:block;padding:12px;border-top:1px solid var(--nf-muted)}#clips{padding:0;list-style:none;display:flex;gap:8px;flex-wrap:wrap}#clips li{padding:12px;border:1px solid var(--nf-accent)}#scrub{width:100%}#frame{padding:20px;border:1px dashed var(--nf-muted)}${visualRules(t)}
 </style></head><body><header><div class="row">${project.identity.logo?`<img alt="Logo" src="${esc(project.identity.logo)}">`:''}<div><small>COMPOSITION INTERACTIVE · ${esc(t.name)}</small><h1>${esc(project.project.name)}</h1></div></div><p class="muted">Blocs locaux sur les références sélectionnées. Aucun service externe connecté.</p>${has('menus')?'<nav aria-label="Actions"><details><summary>Projet & actions</summary><div class="row"><button data-action="all">Afficher tout</button><details><summary>Session</summary><button data-action="export">Exporter notes et favoris</button></details></div></details></nav>':''}${has('commands')?'<button data-action="commands">Commandes · ⌘ K</button>':''}</header><main>
 ${ids.length?'':'<p>Sélectionnez des blocs pour composer votre interface.</p>'}
 ${panel('tree','Espaces & navigation','<nav id="tree" aria-label="Catégories"></nav>')}
 ${panel('library','Bibliothèque','<div class="row"><input id="search" aria-label="Rechercher les références" placeholder="Rechercher…"><select id="categories" aria-label="Catégorie"></select><button id="favorites" data-action="favorites" aria-pressed="false">Favoris</button><button data-action="list" aria-pressed="false">Vue liste</button><label>Taille <input id="density" aria-label="Taille des cartes" type="range" min="150" max="340" value="200"></label></div><p id="count" aria-live="polite"></p><div id="items"></div>')}
 ${panel('compare','Comparer les références','<div id="comparison"></div>')}
 ${panel('inspector','Inspecteur','<div id="inspector"><h3 id="inspector-title"></h3><p id="inspector-detail"></p><a id="reference-link" target="_blank" rel="noreferrer">Source ↗</a><label><p>Mes notes</p><textarea id="note" aria-label="Notes sur la référence"></textarea></label></div>')}
 ${panel('timeline','Séquence créative','<p class="muted">Organiser des étapes et parcourir leur durée. Aucun montage ou rendu vidéo.</p><div class="row"><input id="clip-name" aria-label="Nom de l’étape" value="Introduction"><select id="clip-duration" aria-label="Durée de l’étape"><option value="5">5 s</option><option value="10">10 s</option><option value="30">30 s</option></select><button id="add-clip">Ajouter une étape</button></div><ol id="clips"></ol><div id="frame" aria-live="polite"></div><input id="scrub" aria-label="Position dans la séquence" type="range" value="0" min="0" max="0"><p id="duration"></p>')}
 ${panel('sources','Sources & provenance','<div id="sources"></div>')}
 </main><output id="notice" aria-live="polite">Prêt · ${refs.length} références</output>${has('commands')?'<dialog id="commands" aria-label="Commandes rapides"><div class="row"><strong>Commandes rapides</strong><button data-action="close">Fermer</button></div><input id="command-search" aria-label="Chercher une commande" placeholder="Rechercher une commande"><button data-command="all">Réinitialiser les filtres</button><button data-command="export">Exporter la session</button>'+[['library','Bibliothèque'],['compare','Comparaison'],['timeline','Séquence'],['sources','Sources']].filter(([id])=>has(id)).map(([id,label])=>'<button data-command="#section-'+id+'">Aller à '+label+'</button>').join('')+'</dialog>':''}<script>(${mountUX.toString()})(${JSON.stringify(config).replace(/</g,'\\u003c')});</script></body></html>`;
}
