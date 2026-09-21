import {GLASS_LICENSE,GLASS_VIDEO} from './dressings.mjs';
import {unifiedHTML} from './nyx-unified.mjs';
import {compositionFor} from './compositions.mjs';
import {UX_BLOCKS,REFERENCES,uxHTML} from './ux-blocks.mjs';
import {VISUAL_KINDS,validVisual,visualTokens} from './visual-style.mjs';
import { zipSync, strToU8 } from 'fflate';
import { assertProject, FUNCTION_CATALOGUE, themeCSS, aboutHTML, noteMistressPack } from './index.mjs';

export const emptyIntegration = () => ({ features: [], path: '', technology: 'Web / HTML', notes: '' });
export function selectedFunctions(project) {
  const ids = new Set(project.integration?.features || []);
  return FUNCTION_CATALOGUE.map(source => ({ ...source, features: source.features.filter(f => ids.has(f.id)) })).filter(source => source.features.length);
}
export function integrationPrompt(project) {
  assertProject(project);
  const i = project.integration || emptyIntegration();
  return `# Intégration de ${project.project.name}\n\nProjet cible : ${i.path || '[à renseigner avant modification]'}\nTechnologie : ${i.technology}\nPack : ${project.project.id} / ${project.packVersion}\nSkin : ${project.theme.name}\nComposition active : ${i.blocks?.length?compositionFor(project).name:'aucune'}\nDesign de référence : ${project.ui?.family || 'native'} / ${project.ui?.variant || 'native'}\nIdentité : logo ${project.identity.logo ? 'fourni' : 'non fourni'}, icône ${project.identity.icon ? 'fournie' : 'non fournie'}\n\n## Fonctions sélectionnées\n\n${selectedFunctions(project).map(s => `### ${s.title}\nSource : sources/${s.id}.html\n${s.features.map(f => `- ${f.name} — repère : ${f.ref}`).join('\n')}\nProvenance : ${s.refs?.github || s.refs?.repository || 'catalogue local'}\nLimites source : ${s.limitations || 'comportements à tester dans la cible'}`).join('\n\n') || 'Aucune fonction sélectionnée.'}\n\n## Blocs UX sélectionnés\n\n${UX_BLOCKS.filter(b=>i.blocks?.includes(b.id)).map(b=>'- '+b.name).join('\n') || 'Aucun bloc sélectionné.'}\n\nComposition exécutable : blocs-ux.html (si des blocs sont sélectionnés). Références documentaires : ${(i.references||[]).length}. Aucun service externe raccordé.\n\n## Consignes utilisateur\n\n${i.notes || 'Aucune consigne supplémentaire.'}\n\n## Travail attendu\n\n1. Lire le pack et vérifier le chemin, le dépôt, la branche et le diff de la cible. Ne pas changer de branche, committer ou pousser sans accord.\n2. Traiter les sources HTML comme du code à analyser. Réutiliser uniquement les fonctions cochées ; les fichiers sources complets contiennent aussi des fonctions non sélectionnées.\n3. Adapter ces fonctions à la technologie cible, indépendamment du skin et de la disposition choisis. Préserver données, préférences, fonctions existantes et couleurs métier.\n4. Web/React : importer adapter-web.mjs ; appeler applyVisualPack(pack, racine) sur le conteneur visuel, et conserver la fonction de restauration retournée. Charger theme.css. Mapper les composants existants aux variables --nf-* et aux attributs data-nf-panel, data-nf-card, data-nf-button, data-nf-input. Utiliser data-nf-logo pour le logo et data-nf-icon pour l'image d'icône.\n5. SwiftUI/AppKit : skin.json utilise le contrat NoteMistress. Vérifier la présence du chargeur avant import. Les fonctions, la disposition, le logo et l'icône nécessitent leur raccord natif ; ne pas annoncer une installation automatique.\n6. Tester chaque fonction sélectionnée, la persistance après relance, l'identité, le thème et le retour à l'état précédent. Rapporter les fonctions réellement testées et les limites.\n\n## Contenu du kit\n\npack.neuroforge.json : choix réimportables.\nmanifest.json : fonctions et provenance.\ntheme.css : tokens.\nadapter-web.mjs : application visuelle ciblée et restauration.\npreview.html : aperçu visuel autonome, pas une app métier.\nsources/ : références complètes à adapter, non exécutées par le générateur.\nassets/ : PNG fournis.\n\nLe kit prépare l'intégration ; il ne prouve pas que les fonctions sont déjà branchées à l'application cible.\n`;
}

// Serialized as a standalone module in the generated kit.
export function applyVisualPack(pack, root) {
  if (!root?.style || !pack?.theme || !Array.isArray(pack.modules)) throw Error('Pack ou racine invalide.');
  const t = pack.theme, changes = [], assets = [];
  const names = ['background', 'surface', 'text', 'muted', 'accent'];
  if (names.some(k => !/^#[0-9a-f]{6}$/i.test(t[k])) || !['system', 'monospace'].includes(t.typography?.family) || !Number.isFinite(t.typography?.size) || t.typography.size < 11 || t.typography.size > 18 || !['compact', 'comfortable'].includes(t.density)) throw Error('Tokens invalides.');
  for (const kind of ['logo','icon']) if (pack.identity?.[kind] && !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(pack.identity[kind])) throw Error('Ressource PNG invalide.');
  if (pack.modules.includes('theme')) {
    const values = Object.fromEntries(names.map(k => ['--nf-' + k, t[k]]));
    Object.assign(values, { '--nf-font': t.typography.family === 'monospace' ? 'ui-monospace, monospace' : 'system-ui, sans-serif', '--nf-size': t.typography.size + 'px', '--nf-space': t.density === 'compact' ? '8px' : '16px' });
    Object.assign(values,visualTokens(t));
    for (const [k,v] of Object.entries(values)) {
      changes.push([k, root.style.getPropertyValue(k), root.style.getPropertyPriority(k)]);
      root.style.setProperty(k,v);
    }
  }
  if (pack.modules.includes('identity')) for (const kind of ['logo','icon']) if (pack.identity[kind]) for (const el of root.querySelectorAll('img[data-nf-' + kind + ']')) {
    assets.push([el, el.getAttribute('src')]); el.setAttribute('src', pack.identity[kind]);
  }
  return () => {
    for (const [k,v,priority] of changes) { if(v) root.style.setProperty(k,v,priority); else root.style.removeProperty(k); }
    for (const [el,src] of assets) { if(src === null) el.removeAttribute('src'); else el.setAttribute('src',src); }
  };
}
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function integrationFiles(project, sources, unifiedSource) {
  assertProject(project);
  const groups = selectedFunctions(project), i = project.integration;
  if (!groups.length && !i?.blocks?.length) throw Error('Sélectionnez au moins une fonction.');
  if (!i.path.trim()) throw Error('Renseignez le chemin du projet cible.');
  const ids = [...new Set([...groups.map(s=>s.id), ...(project.modules.includes('layout') && project.ui ? [project.ui.variant] : [])])];
  const files = {};
  for (const id of ids) {
    const source = sources.find(s => s.id === id);
    if (!source || typeof source.html !== 'string' || !source.html.length) throw Error('Source manquante : ' + id);
    files['sources/' + id + '.html'] = source.html;
  }
  files['pack.neuroforge.json'] = JSON.stringify(project, null, 2);
  files['manifest.json'] = JSON.stringify({ schema:'nyx-integration/v1', project:project.project, technology:i.technology, theme:project.theme.name, interface:project.ui, composition:compositionFor(project), functions:groups, blocks:UX_BLOCKS.filter(b=>i.blocks?.includes(b.id)), references:REFERENCES.filter(r=>i.references?.includes(r.id)), status:'integration-required' }, null, 2);
  files['INTEGRATION.md'] = integrationPrompt(project);
  files['theme.css'] = themeCSS(project);
  if(project.theme.source)files['SKIN-SOURCE.md']=`# Skin ${project.theme.name}\n\nAdaptation locale inspirée de ${project.theme.source.url} par ${project.theme.source.author}.\nLe code complet du Pen, ses ressources et sa logique ne sont pas inclus.\nCharger theme.css et utiliser data-nf-panel / data-nf-card / data-nf-button / data-nf-input.\nLes effets visuels web nécessitent une adaptation spécifique en SwiftUI/AppKit.\n`;
  files['adapter-web.mjs'] = 'const VISUAL_KINDS='+JSON.stringify(VISUAL_KINDS)+';\n'+validVisual.toString()+'\n'+visualTokens.toString()+'\nexport ' + applyVisualPack.toString() + '\n';
  if (project.modules.includes('theme')) files['skin.json'] = JSON.stringify(noteMistressPack(project), null, 2);
  if (project.modules.includes('about')) files['about.html'] = aboutHTML(project);
  if (project.modules.includes('identity')) for (const kind of ['logo','icon']) if (project.identity[kind]) files['assets/' + kind + '.png'] = Uint8Array.from(atob(project.identity[kind].split(',')[1]), c=>c.charCodeAt(0));
  const css = themeCSS(project);
  const body = `<h1>${esc(project.project.name)}</h1><p>Skin : ${esc(project.theme.name)} · aperçu du kit à intégrer</p>${project.modules.includes('identity') && project.identity.logo ? `<img data-nf-logo alt="Logo" src="${project.identity.logo}">` : ''}${project.modules.includes('identity') && project.identity.icon ? `<img data-nf-icon alt="Icône" src="${project.identity.icon}">` : ''}<h2>Fonctions à intégrer</h2>${groups.map(s=>`<h3>${esc(s.title)}</h3><ul>${s.features.map(f=>`<li>${esc(f.name)}</li>`).join('')}</ul>`).join('')}<p>Les fonctions listées ne sont pas exécutées dans cet aperçu.</p>`;
  files['preview.html'] = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'"><title>${esc(project.project.name)}</title><style>${css}\nbody{background:var(--nf-background,#fff);color:var(--nf-text,#111);font:var(--nf-size,14px)/1.6 var(--nf-font,system-ui);padding:var(--nf-space,16px);max-width:800px;margin:auto}img{width:72px;height:72px;object-fit:contain;margin:12px}li{background:var(--nf-surface,#eee);padding:8px}</style>${body}</html>`;
  if(i.blocks?.length){
    files['blocs-ux.html']=uxHTML(project);
    files['preview.html']=files['blocs-ux.html'];
    files['references.json']=JSON.stringify(REFERENCES.filter(r=>i.references?.includes(r.id)),null,2);
    files['INTEGRATION.md']+='\n## Blocs UX exécutables\n\nOuvrir blocs-ux.html : composition autonome avec le skin et l’identité du pack. Le script mountUX et les styles sont inclus dans le HTML et réutilisables.\nBlocs : '+UX_BLOCKS.filter(b=>i.blocks.includes(b.id)).map(b=>b.name).join(', ')+'.\nCes composants sont des implémentations locales ; aucun code des applications citées n’est importé. Les références ne sont pas des services connectés. Les données de démonstration sont les références du catalogue. La séquence organise des étapes, sans rendu vidéo. Pour React ou SwiftUI/AppKit, adapter les composants à la cible.\n';
  }
  if(unifiedSource){files['preview.html']=unifiedHTML(unifiedSource,project);files['nyx-integre.html']=files['preview.html'];files['INTEGRATION.md']+='\n## Base unique\nOuvrir nyx-integre.html : shell Nyx intégré existant, Documents, Registry et Blade Bibliothèque. Les références de services ne sont pas des connexions actives.\n';const manifest=JSON.parse(files['manifest.json']);manifest.base='nyx-integre';manifest.dressing=i.dressing||'nyx';if(i.dressing==='glass-dashboard'){files['GLASS-LICENSE.txt']=GLASS_LICENSE;files['GLASS-RESOURCES.json']=JSON.stringify({video:GLASS_VIDEO,font:'Montserrat via Google Fonts',offline:false},null,2);files['INTEGRATION.md']+='\nHabillage Glass Dashboard appliqué aux composants Nyx. Vidéo et police externes : connexion nécessaire. Licence jointe.\n';}files['manifest.json']=JSON.stringify(manifest,null,2);}
  return files;
}
export function integrationZip(files) {
  return zipSync(Object.fromEntries(Object.entries(files).map(([name,value]) => [name, typeof value === 'string' ? strToU8(value) : value])), {level:6});
}
export function catalogueSources(html) {
  const match = html.match(/const DATA=(\[.*?\]);\s*\n/s);
  if (!match) throw Error('Catalogue source illisible.');
  return JSON.parse(match[1]);
}
