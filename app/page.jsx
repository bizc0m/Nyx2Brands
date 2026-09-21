'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import UXWorkshop from './ux-workshop.jsx';
import {UX_BLOCKS,REFERENCES} from '../packages/neuroforge-core/ux-blocks.mjs';
import {COMPOSITIONS} from '../packages/neuroforge-core/compositions.mjs';
import NyxPreview from './nyx-preview.jsx';
import NextImage from 'next/image';
import { Check, Clipboard, Download, FileJson, RotateCcw, Upload, FileCode2 } from 'lucide-react';
import {
  FUNCTION_CATALOGUE,
  TECHNOLOGIES,
  INTERFACE_FAMILIES,
  aboutHTML,
  decodeImages,
  newProject,
  noteMistressPack,
  parseProject,
  readme,
  siteHTML,
  themeCSS,
  validate,
} from '../packages/neuroforge-core/index.mjs';

import { catalogueThumbnails } from '../packages/neuroforge-core/design-preview.mjs';
import { emptyIntegration, integrationPrompt, integrationFiles, integrationZip, catalogueSources, selectedFunctions } from '../packages/neuroforge-core/integration.mjs';

import {recoveredSkins, generateSkin, validatePersonalSkins, SKIN_LIBRARY_STORAGE} from '../packages/neuroforge-core/skins.mjs';

import {codepenSkins,codepenReferences} from '../packages/neuroforge-core/codepen-skins.mjs';

const STORAGE = 'neuroforge-skin-studio-v2';
const clone = (value) => JSON.parse(JSON.stringify(value));
const skinIds = ['nyx-blanc', 'moteur-ux', 'nyx-core', 'neon-grid', 'obsidian-luxe', 'signal-light', ...Object.keys(recoveredSkins),...Object.keys(codepenSkins)];
const skins = {
  'nyx-blanc': {name:'Nyx Blanc',note:'Interface blanche compacte',background:'#FFFFFF',surface:'#FFFFFF',text:'#202124',muted:'#60646C',accent:'#245CDD',signal:'#245CDD',appearance:'light',radius:4,typography:{family:'system',size:12},density:'compact'},
  ...recoveredSkins,
  ...codepenSkins,
  'moteur-ux': { name: 'Moteur UX', note: 'Sauge, crème et atelier éditorial', background: '#F3F4EF', surface: '#FAFBF7', text: '#24302C', muted: '#697268', accent: '#244D3A', signal: '#8AAD75', appearance: 'light', radius: 6 },
  'nyx-core': { name: 'NYX Core', note: 'Workbench sombre et précis', background: '#07070B', surface: '#16161E', text: '#F2F2F5', muted: '#8E8E93', accent: '#0A84FF', signal: '#64D2FF', appearance: 'dark', radius: 6 },
  'neon-grid': { name: 'Neon Grid', note: 'Signal nocturne et électrique', background: '#080B09', surface: '#141A17', text: '#F4FFE8', muted: '#90A08D', accent: '#B8FF32', signal: '#B65CFF', appearance: 'dark', radius: 2 },
  'obsidian-luxe': { name: 'Obsidian Luxe', note: 'Métal, contraste et calme', background: '#0B0A08', surface: '#191713', text: '#FFF9ED', muted: '#A69B87', accent: '#D8B46B', signal: '#FFF1C9', appearance: 'dark', radius: 12 },
  'signal-light': { name: 'Signal Light', note: 'Clair, éditorial et direct', background: '#EEF1F5', surface: '#FFFFFF', text: '#111827', muted: '#596170', accent: '#1447E6', signal: '#F05223', appearance: 'light', radius: 8 },
};
const targets = {
  notemistress: { label: 'NoteMistress', tech: 'AppKit', status: 'adaptateur thème', id: 'notemistress' },
  'nyx-ux': { label: 'Nyx UX', tech: 'Web', status: 'adaptateur web', id: 'nyx-ux' },
  future: { label: 'Mon application', tech: 'Pack commun', status: 'prête à raccorder', id: 'future-app' },
};
const labels = {
  fr: { description: 'Description', purpose: 'À quoi sert cette application ?', audience: 'Pour qui ?', limits: 'Limites connues' },
  en: { description: 'Description', purpose: 'What is this application for?', audience: 'Who is it for?', limits: 'Known limitations' },
};
const FUNCTION_SOURCES = FUNCTION_CATALOGUE.filter(source => source.id !== 'noteplan-style-v2');
const DRESSING_NAMES = {nyx:'Nyx intégré','glass-dashboard':'Glass Dashboard','noteplan-style-v2':'NotePlan Style Simulator'};

function seedProject() {
  const project = newProject('my-app');
  project.project.name = 'Mon application';
  project.project.version = '0.1.0';
  project.packVersion = '0.1.0';
  project.theme = {
    name: skins['nyx-blanc'].name,
    appearance: skins['nyx-blanc'].appearance,
    background: skins['nyx-blanc'].background,
    surface: skins['nyx-blanc'].surface,
    text: skins['nyx-blanc'].text,
    muted: skins['nyx-blanc'].muted,
    accent: skins['nyx-blanc'].accent,
    typography: { family: 'system', size: 12 },
    density: 'compact',
  };
  project.translations.fr = {
    description: 'Un espace de notes concentré, personnel et portable.',
    purpose: 'Capturer, organiser et retrouver les idées sans casser le flux.',
    audience: 'Auteurs, chercheurs et équipes qui travaillent avec leurs propres données.',
    limits: 'Le thème ne modifie ni les données, ni les couleurs métier, ni les fonctions de l’application.',
  };
  project.translations.en = {
    description: 'A focused, personal and portable note workspace.',
    purpose: 'Capture, organise and retrieve ideas without breaking the flow.',
    audience: 'Writers, researchers and teams working with their own data.',
    limits: 'The theme does not alter data, business colours or application features.',
  };
  return project;
}

const defaultInterface = { family: INTERFACE_FAMILIES[0].id, variant: INTERFACE_FAMILIES[0].variants[0][0] };
const interfaceFor = (project) => project.ui || defaultInterface;

function loadStored() {
  const fallback = { project: seedProject(), target: 'future', skinId: 'nyx-blanc', signal: skins['nyx-blanc'].signal, radius: skins['nyx-blanc'].radius };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    let old = {};
    try { old = JSON.parse(window.localStorage.getItem('nyx-moteur-ux-atelier-v1') || '{}') || {}; } catch { /* Keep the current pack when the old catalogue is unreadable. */ }
    const valid = new Set(FUNCTION_CATALOGUE.flatMap(source => source.features.map(f => f.id)));
    const legacy = {...emptyIntegration(), features: [...new Set((Array.isArray(old.selected) ? old.selected : []).filter(id => valid.has(id)))], path: typeof old.target === 'string' ? old.target.slice(0,1000) : '', notes: typeof old.notes === 'string' ? old.notes.slice(0,8000) : ''};
    if (old.stack === 'React' || old.stack === 'SwiftUI / AppKit') legacy.technology = old.stack;
    if (!raw) return {...fallback, project: {...fallback.project, integration: legacy}};
    const stored = JSON.parse(raw);
    const restored = parseProject(JSON.stringify(stored.project));
    if (!restored.integration) restored.integration = legacy;
    return {
      project: restored,
      preview: stored.preview === 'blocks' && restored.integration?.blocks?.length ? 'blocks' : 'app',
      target: targets[stored.target] ? stored.target : fallback.target,
      skinId: skinIds.includes(stored.skinId) ? stored.skinId : fallback.skinId,
      signal: /^#[0-9a-f]{6}$/i.test(stored.signal) ? stored.signal : fallback.signal,
      radius: Number.isFinite(stored.radius) ? stored.radius : fallback.radius,
    };
  } catch {
    return fallback;
  }
}

function download(name, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function Home() {
  const [project, setProject] = useState(seedProject);
  const [target, setTarget] = useState('future');
  const [workspace, setWorkspace] = useState('studio');
  const [step, setStep] = useState('design');
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [previousDressing,setPreviousDressing]=useState(null);
  function chooseDressing(value){setPreviousDressing(project.integration?.dressing||'nyx');updateIntegration('dressing',value);setPreview('app');}
  const [catalogue, setCatalogue] = useState({sources: [], thumbnails: {}});
  const [, setCatalogueError] = useState('');
  const [, setPreviewMode] = useState('original');
  const [nativeRevision,setNativeRevision]=useState(0);
  const [projectLoaded,setProjectLoaded]=useState(false);
  const [preview, setPreview] = useState('app');
  useEffect(()=>{if(!settingsOpen)return;const close=e=>{if(e.key==='Escape'){setSettingsOpen(false);setPreview('app');}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[settingsOpen]);

  const [output, setOutput] = useState('pack');
  const [packText,setPackText]=useState('');
  const [locale, setLocale] = useState('fr');
  const [skinId, setSkinId] = useState('nyx-blanc');
  const [signal, setSignal] = useState(skins['nyx-blanc'].signal);
  const [radius, setRadius] = useState(skins['nyx-blanc'].radius);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const importRef = useRef(null);
  const catalogueRef = useRef(null);
  const [featureSearch, setFeatureSearch] = useState('');
  const [generating, setGenerating] = useState(false);
  const [personalSkins,setPersonalSkins]=useState([]);
  const [skinName,setSkinName]=useState('Mon skin');
  const [skinHue,setSkinHue]=useState(210);
  const [skinMode,setSkinMode]=useState('dark');
  const [skinSearch,setSkinSearch]=useState('');
  const [libraryError,setLibraryError]=useState('');
  const availableSkins={...skins,...Object.fromEntries(personalSkins.map(item=>[item.id,{...item.theme,group:'Mes skins',signal:item.theme.accent,radius:6}]))};
  function savePersonalSkin(){
    try {
      if(libraryError)throw Error(libraryError);
      if(!skinName.trim()||skinName.trim().length>64)throw Error('Donnez un nom de 1 à 64 caractères.');
      if(personalSkins.some(item=>item.theme.name.toLowerCase()===skinName.trim().toLowerCase()))throw Error('Ce nom existe déjà. Choisissez un autre nom pour conserver les deux skins.');
      const theme={...clone(project.theme),name:skinName.trim()};
      const next=validatePersonalSkins([...personalSkins,{id:'personal-'+crypto.randomUUID(),theme}]);
      localStorage.setItem(SKIN_LIBRARY_STORAGE,JSON.stringify(next));setPersonalSkins(next);
      update(draft=>{draft.theme=theme;});setSkinId(next.at(-1).id);
      setMessage('Skin « '+theme.name+' » enregistré dans Mes skins.');
    } catch(error){setMessage(error.message);}
  }
  function createSkin(){try{const theme=generateSkin(skinName,skinHue,skinMode);update(draft=>{draft.theme=theme;});setPreviewMode('skin');setPreview('app');}catch(error){setMessage(error.message);}}


  useEffect(() => {
    const timer = window.setTimeout(() => {
      try{setPersonalSkins(validatePersonalSkins(JSON.parse(localStorage.getItem(SKIN_LIBRARY_STORAGE)||'[]')));}catch{setLibraryError('La bibliothèque locale ne peut pas être lue. Elle est conservée sans modification.');}
      const stored = loadStored();
      setProject({...stored.project,ui:{family:'integrated-family',variant:'integrated'},integration:{...(stored.project.integration||emptyIntegration()),blocks:stored.project.integration?.blocks||UX_BLOCKS.map(b=>b.id),references:stored.project.integration?.references||REFERENCES.map(r=>r.id)}});
      setPreview('app');
      setTarget(stored.target);
      setSkinId(stored.skinId);
      setSignal(stored.signal);
      setRadius(stored.radius);
      setProjectLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const validation = useMemo(() => validate(project), [project]);
  const selectedInterface = interfaceFor(project);
  const selectedFamily = INTERFACE_FAMILIES.find((item) => item.id === selectedInterface.family) || INTERFACE_FAMILIES[0];
  const selectedVariant = selectedFamily.variants.find(([id]) => id === selectedInterface.variant) || selectedFamily.variants[0];
  const html = useMemo(() => {
    if (validation.errors.length || !project.modules.includes('about')) return '';
    try { return aboutHTML(project, locale); } catch { return ''; }
  }, [locale, project, validation.errors.length]);
  const integration = project.integration || emptyIntegration();
  const chosenFunctions = selectedFunctions(project);
  const prompt = useMemo(() => {
    try { return integrationPrompt(project); } catch { return 'Corrigez les erreurs du pack pour générer les instructions.'; }
  }, [project]);
  useEffect(() => {
    function receive(event) {
      if (event.origin !== window.location.origin || event.source !== catalogueRef.current?.contentWindow || event.data?.type !== 'nyx-functions-changed') return;
      const valid = new Set(FUNCTION_CATALOGUE.flatMap(s => s.features.map(f => f.id)));
      if (!Array.isArray(event.data.features) || event.data.features.some(id => !valid.has(id))) return;
      setProject(current => ({...current, integration: {...(current.integration || emptyIntegration()), features: [...new Set(event.data.features)]}}));
      setSaved(false);
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  function syncCatalogue() {
    catalogueRef.current?.contentWindow?.postMessage({type: 'nyx-functions-set', features: integration.features}, window.location.origin);
  }
  function toggleNavigation(){document.querySelector('iframe[title="Nyx intégré — application unifiée"]')?.contentWindow?.postMessage({type:'nyx-layout',action:'sidebar'},window.location.origin);}
  function updateIntegration(key, value) {
    update(draft => { draft.integration = {...(draft.integration || emptyIntegration()), [key]: value}; });
  }
  function toggleFunction(id, checked) {
    updateIntegration('features', checked ? [...new Set([...integration.features, id])] : integration.features.filter(value => value !== id));
  }
  async function generateIntegration() {
    setGenerating(true);
    try {
      await decodeImages(parseProject(JSON.stringify(project)));
      const response = await fetch('./moteur-ux.html');
      if (!response.ok) throw Error('Catalogue indisponible.');
      const baseResponse=await fetch('./nyx-unified.html');if(!baseResponse.ok)throw Error('Base Nyx intégré indisponible.');
      const files = integrationFiles(project, catalogueSources(await response.text()),await baseResponse.text());
      download(`${project.project.id}-integration.zip`, integrationZip(files), 'application/zip');
      setMessage(`Kit généré : ${integration.features.length} fonctions et ${integration.blocks?.length||0} blocs UX, skin ${project.theme.name}, identité et ${Object.keys(files).length} fichiers. Décompressez le ZIP puis suivez INTEGRATION.md.`);
    } catch (error) { setMessage(`Génération refusée : ${error.message}`); }
    finally { setGenerating(false); }
  }



  function update(mutator) {
    setProject((current) => { const next = clone(current); mutator(next); return next; });
    setSaved(false);
    setMessage('');
  }

  function chooseTarget(next) {
    setTarget(next);
    update((draft) => {
      draft.project.id = targets[next].id;
      draft.project.name = targets[next].label;
      draft.integration = {...(draft.integration || emptyIntegration()), technology: next === 'notemistress' ? 'SwiftUI / AppKit' : 'Web / HTML'};
    });
  }

  function chooseSkin(id) {
    const skin = availableSkins[id];
    if (!skin) return;
    setSkinName(skin.name);
    setPreview('app');
    setSkinId(id);
    setSignal(skin.signal);
    setRadius(skin.radius);
    update((draft) => {
      draft.integration={...(draft.integration||emptyIntegration()),dressingSettings:{blur:16,...draft.integration?.dressingSettings,palette:true}};
      const baseTheme={...draft.theme};delete baseTheme.visual;delete baseTheme.source;
      draft.theme = {
        ...baseTheme,
        ...(skin.visual?{visual:clone(skin.visual)}:{}),
        ...(skin.source?{source:clone(skin.source)}:{}),
        name: skin.name,
        typography: skin.typography || {family:'system',size:13},
        density: skin.density || 'comfortable',
        appearance: skin.appearance,
        background: skin.background,
        surface: skin.surface,
        text: skin.text,
        muted: skin.muted,
        accent: skin.accent,
      };
    });
  }

  function receiveSession(session){
    setProject(current=>{
      if(JSON.stringify(current.integration?.session)===JSON.stringify(session))return current;
      const next={...current,integration:{...(current.integration||emptyIntegration()),session}};
      try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved?.project?.project?.id===current.project.id){saved.project.integration={...(saved.project.integration||emptyIntegration()),session};localStorage.setItem(STORAGE,JSON.stringify(saved));}}catch{/* In-memory state and export remain available. */}
      return next;
    });
  }
  function receiveNativeState(nativeState){
    setProject(current=>{if(JSON.stringify(current.integration?.nativeState)===JSON.stringify(nativeState))return current;try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved?.project?.project?.id===current.project.id){saved.project.integration={...(saved.project.integration||emptyIntegration()),nativeState};localStorage.setItem(STORAGE,JSON.stringify(saved));}}catch{}return {...current,integration:{...(current.integration||emptyIntegration()),nativeState}};});
  }
  const activeSource = catalogue.sources.find(source => source.id === selectedVariant[0]);
  const themePreviewSource = integration.dressing === 'noteplan-style-v2' ? catalogue.sources.find(source => source.id === 'noteplan-style-v2') : null;
  useEffect(() => {
    const controller = new AbortController();
    fetch('./moteur-ux.html', {signal: controller.signal}).then(response => {
      if (!response.ok) throw Error('Catalogue indisponible.');
      return response.text();
    }).then(html => setCatalogue({sources: catalogueSources(html), thumbnails: catalogueThumbnails(html)})).catch(error => {
      if (error.name !== 'AbortError') setCatalogueError('Les aperçus ne sont pas disponibles. Rechargez la page ; vos choix sont conservés.');
    });
    return () => controller.abort();
  }, []);

  async function image(event, kind) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.type !== 'image/png' || file.size > 4194304) throw Error('PNG uniquement, 4 Mio maximum.');
      const value = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(Error('Lecture impossible.'));
        reader.readAsDataURL(file);
      });
      const next = clone(project);
      next.identity[kind] = value;
      await decodeImages(parseProject(JSON.stringify(next)));
      setProject(next);
      setMessage(`${kind === 'logo' ? 'Logo' : 'Icône'} intégré au pack.`);
    } catch (error) {
      setMessage(`Image refusée : ${error.message}`);
    }
    event.target.value = '';
  }

  function clearIdentityAssets() {
    update((draft) => {
      draft.identity.logo = '';
      draft.identity.icon = '';
    });
    setMessage('Logo et icône retirés du pack.');
  }

  async function importPackText(text) {
    if(text.length>12000000)throw Error('12 Mo maximum.');
    const incoming=await decodeImages(parseProject(text));
    setProject({...incoming,ui:{family:'integrated-family',variant:'integrated'}});
    setNativeRevision(v=>v+1);setPreview('app');setSaved(false);setLocale(incoming.defaultLocale);setMessage('Pack importé et validé.');
  }
  async function importPack(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 12000000) throw Error('12 Mo maximum.');
      await importPackText(await file.text());
    } catch (error) {
      setMessage(`Import refusé : ${error.message}`);
    }
    event.target.value = '';
  }

  function save() {
    if (validation.errors.length) {
      setMessage('Corrigez le pack avant de l’enregistrer.');
      return;
    }
    window.localStorage.setItem(STORAGE, JSON.stringify({ project, target, skinId, signal, radius, preview }));
    setSaved(true);
    setMessage('Pack enregistré dans ce navigateur.');
  }

  function reset() {
    const next = seedProject();
    setProject(next);
    setTarget('future');
    setSkinId('nyx-core');
    setSignal(skins['nyx-blanc'].signal);
    setRadius(skins['nyx-blanc'].radius);
    setLocale('fr');
    window.localStorage.removeItem(STORAGE);
    setMessage('Pack de départ restauré.');
  }

  async function exportFile(kind) {
    try {
      await decodeImages(parseProject(JSON.stringify(project)));
      const id = project.project.id;
      if (kind === 'pack') download(`${id}.neuroforge.json`, JSON.stringify(project, null, 2));
      if (kind === 'css') download(`${id}.css`, themeCSS(project), 'text/css');
      if (kind === 'about') download(`${id}-about-${locale}.html`, aboutHTML(project, locale), 'text/html');
      if (kind === 'readme') download(`README.${locale}.md`, readme(project, locale), 'text/markdown');
      if (kind === 'site') download('index.html', siteHTML(project, locale), 'text/html');
      if (kind === 'native') download('skin.json', JSON.stringify(noteMistressPack(project), null, 2));
      setMessage(`Export ${kind} préparé localement.`);
    } catch (error) {
      setMessage(`Export refusé : ${error.message}`);
    }
  }

  const steps = [['design','Design & skin'],['blocks','Blocs & références'],['functions','Fonctions'],['identity','Identité'],['export','Intégration']];
  return <main className={'atelier nyx-app '+(settingsOpen?'settings-open':'')}>
    <header className="nyx-appbar">
      <div className="nyx-app-title"><strong>{project.project.name}</strong></div>
      <div className="nyx-app-actions">
        <label className="quick-control"><span>Themes</span><select className="quick-theme" aria-label="Themes" value={integration.dressing||'nyx'} onChange={e=>chooseDressing(e.target.value)}><option value="nyx">Nyx intégré</option><option value="glass-dashboard">Glass Dashboard</option><option value="noteplan-style-v2">NotePlan Style Simulator</option></select></label>
        <div className="quick-control"><span>Skin</span><details className="skin-popover"><summary aria-label="Visualiser et sélectionner un skin"><i className="quick-skin-preview" aria-hidden="true">{['background','surface','text','accent'].map(key=><b key={key} style={{background:project.theme[key]}}/>)}</i><strong>{project.theme.name}</strong></summary><div className="skin-popover-grid">{Object.entries(availableSkins).map(([id,skin])=><button key={id} aria-label={`${skin.name} · ${skin.density==='compact'?'compact':'standard'}`} aria-pressed={project.theme.name===skin.name} onClick={event=>{chooseSkin(id);event.currentTarget.closest('details')?.removeAttribute('open');}}><span className="color-samples">{['background','surface','text','accent'].map(key=><i key={key} style={{background:skin[key]}}/>)}</span><strong>{skin.name}</strong><small>{skin.density==='compact'?'Compact':'Standard'}</small></button>)}</div></details></div>
        <button className="edit-app" aria-expanded={settingsOpen&&step==='identity'} onClick={()=>{setStep('identity');setSettingsOpen(true);setWorkspace('studio');setPreview('app');}}>Éditer l’app</button>
        <button aria-expanded={settingsOpen&&step==='design'} aria-controls="theme-choices" onClick={()=>{const closing=settingsOpen&&step==='design';setStep('design');setPreview('app');setWorkspace('studio');setSettingsOpen(!closing);}}>Personnaliser</button>
        <button onClick={()=>{setStep('export');setSettingsOpen(true);setWorkspace('studio');}}>Exporter</button>
        <button className="save-project" onClick={save} aria-label="Enregistrer le projet"><Check size={15}/><span>{saved?'Enregistré':'Enregistrer'}</span></button>
        <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importPack}/>
      </div>
    </header>
    {workspace==='catalogue' && <button onClick={()=>setWorkspace('studio')}>Retour à Nyx intégré</button>}
    {workspace === 'catalogue' ? <section className="legacy-composer"><iframe ref={catalogueRef} onLoad={syncCatalogue} src="./moteur-ux.html" title="Composeur avancé Moteur UX" /></section> : <div className={'atelier-workbench '+(step === 'design' ? 'design-layout' : step === 'export' ? 'export-layout' : '')}>
      <section id="theme-choices" className="selection-panel" aria-label="Réglages du projet" hidden={!settingsOpen}>
        <div className="settings-heading"><div><small>Modifications visibles en direct</small><h2>{step==='identity'?'Éditer l’application':'Personnaliser Nyx'}</h2></div><button aria-label="Fermer les réglages" onClick={()=>{setSettingsOpen(false);setPreview('app');}}>×</button></div>
        <nav className="settings-tabs" aria-label="Réglages">{steps.map(([id,label])=><button key={id} aria-pressed={step===id} onClick={()=>{setStep(id);setPreview('app');setWorkspace('studio');}}>{label}</button>)}</nav>
        {step==='identity' && <div className="identity-views"><button onClick={()=>setPreview('app')}>Application</button><button onClick={()=>setPreview('icon')}>Logo & icône</button><button onClick={()=>setPreview('about')}>About</button></div>}<div className="settings-utilities"><button onClick={()=>importRef.current?.click()}>Importer un pack</button><button onClick={()=>setWorkspace('catalogue')}>Sources & composeur ↗</button></div>
      {step === 'blocks' && <UXWorkshop embedded project={project} onSession={receiveSession} onApply={()=>{setStep('design');setMessage('Blocs appliqués dans la Blade Bibliothèque de Nyx intégré.');}} onChange={next=>update(draft=>{draft.integration=next;})}/>}
      {step === 'design' && <>

        <section className="original-design-card"><span>Theme de l’application</span><h2>{DRESSING_NAMES[integration.dressing||'nyx']}</h2><label>Structure et surfaces<select aria-label="Habillage dans les réglages" value={integration.dressing||'nyx'} onChange={e=>chooseDressing(e.target.value)}><option value="nyx">Nyx intégré · base</option><option value="glass-dashboard">Glass Dashboard · gestok</option><option value="noteplan-style-v2">NotePlan Style Simulator</option></select></label><p>Vos documents, onglets et fonctions restent ouverts. Le theme change la présentation de l’application sans remplacer son moteur.</p>{integration.dressing==='glass-dashboard'&&<label>Flou du verre · {integration.dressingSettings?.blur??16} px<input aria-label="Flou du verre" type="range" min="0" max="24" value={integration.dressingSettings?.blur??16} onChange={e=>updateIntegration('dressingSettings',{...integration.dressingSettings,blur:Number(e.target.value)})}/></label>}{integration.dressing==='glass-dashboard'&&<button onClick={()=>updateIntegration('dressingSettings',{blur:16,palette:false})}>Couleurs originales de Glass</button>}<h3>Disposition</h3><button onClick={toggleNavigation}>Afficher / masquer la navigation</button><p>Les commandes de la barre Nyx replient la navigation. Les commandes ↔ et ↕ de chaque panneau Documents divisent l’espace ; ses séparateurs se redimensionnent directement.</p><button disabled={previousDressing===null} onClick={()=>{updateIntegration('dressing',previousDressing);setPreviousDressing(null);}}>Annuler le changement de theme</button>{integration.dressing==='glass-dashboard'&&<details><summary>Comparer avec la référence originale</summary><p>Référence de gestok, avec données de démonstration.</p><button onClick={()=>{setPreview('codepen');setSettingsOpen(false);}}>Voir la référence</button><a href="https://codepen.io/gestok/pen/YzLBVOp" target="_blank" rel="noreferrer">Source et attribution ↗</a></details>}</section>
        <div className="palette-heading"><h2>Skins · palettes de couleurs</h2><small>Indépendante du design</small></div>
        <label className="search-field"><span>Rechercher un skin</span><input type="search" value={skinSearch} onChange={event=>setSkinSearch(event.target.value)} placeholder="Graphite, Crimson, mes skins…"/></label>
        <div className="skin-library">{['NYX Studio','Nyx-Ux','Dashboard original','NeuroForge','CodePen · adaptations','Mes skins'].map(group=>{const entries=Object.entries(availableSkins).filter(([,skin])=>(skin.group||'NYX Studio')===group && `${skin.name} ${group}`.toLowerCase().includes(skinSearch.toLowerCase()));return entries.length ? <section key={group}><h3>{group} <small>{entries.length}</small></h3><div className="palette-gallery">{entries.map(([id,skin])=><button key={id} aria-pressed={project.theme.name===skin.name} onClick={()=>{chooseSkin(id);setPreviewMode('skin');}} className={project.theme.name===skin.name?'selected':''}><span className="color-samples">{['background','surface','text','accent'].map(key=><i key={key} style={{background:skin[key]}}/>)}</span><strong>{skin.name}</strong><small>{skin.appearance==='dark'?'Sombre':'Clair'}</small></button>)}</div></section>:null;})}</div>
        <div className="skin-source-info"><p>CodePen : 20 références conservées. Les palettes ci-dessus ne sont pas leurs designs complets. Glass Dashboard et NotePlan Style Simulator sont disponibles dans Themes.</p>{project.theme.source && <a href={project.theme.source.url} target="_blank" rel="noreferrer">Référence : {project.theme.source.author} ↗</a>}<details><summary>Les 20 références et leur statut</summary>{codepenReferences.map(r=><p key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.name} · {r.author} ↗</a> — {r.status==='adapted'?'Palette inspirée de la référence':'Source inaccessible · non intégré'}</p>)}</details></div>
        {libraryError && <p role="alert">{libraryError}</p>}
        <section className="skin-generator" aria-label="Créer un skin"><h3>Créer mon skin</h3><p>Générez une palette ou enregistrez vos réglages actuels.</p><label className="full-field">Nom du skin<input value={skinName} maxLength={64} onChange={event=>setSkinName(event.target.value)}/></label><div className="form-grid"><label>Teinte · {skinHue}°<input aria-label="Teinte du skin" type="range" min="0" max="360" value={skinHue} onChange={event=>setSkinHue(Number(event.target.value))}/></label><label>Mode<select value={skinMode} onChange={event=>setSkinMode(event.target.value)}><option value="dark">Sombre</option><option value="light">Clair</option></select></label></div><div className="skin-actions"><button onClick={createSkin}>Générer et prévisualiser</button><button onClick={savePersonalSkin}>Enregistrer dans Mes skins</button><button onClick={()=>exportFile('pack')}>Exporter le pack du skin</button></div><p>Les couleurs secondaires sont ajustées si nécessaire pour rester lisibles. Importer un pack, puis l’enregistrer ici, ajoute aussi son skin à votre bibliothèque.</p></section>
        <details className="advanced-settings"><summary>Personnaliser couleurs, police et densité</summary><div className="token-grid">{[['background','Fond'],['surface','Surface'],['text','Texte'],['muted','Secondaire'],['accent','Accent']].map(([key,label]) => <label key={key}>{label}<div><input aria-label={label+' couleur'} type="color" value={project.theme[key]} onChange={event => update(draft=>{draft.theme[key]=event.target.value;})}/><input aria-label={label+' code'} value={project.theme[key]} onChange={event => update(draft=>{draft.theme[key]=event.target.value;})}/></div></label>)}</div><div className="form-grid"><label>Police<select value={project.theme.typography.family} onChange={event=>update(draft=>{draft.theme.typography.family=event.target.value;})}><option value="system">Système</option><option value="monospace">Monospace</option></select></label><label>Densité<select value={project.theme.density} onChange={event=>update(draft=>{draft.theme.density=event.target.value;})}><option value="comfortable">Confortable</option><option value="compact">Compacte</option></select></label></div></details>
      </>}
      {step === 'functions' && <>
        <div className="panel-title"><h2>Bibliothèque de fonctions</h2><span>{integration.features.length} sélectionnées</span></div>
        <label className="search-field"><span>Rechercher une fonction</span><input type="search" value={featureSearch} onChange={event=>setFeatureSearch(event.target.value)} placeholder="Importer, onglets, recherche…" /></label>
        <div className="function-library">{FUNCTION_SOURCES.map(source => {const visible = source.features.filter(f=>`${source.title} ${f.name}`.toLowerCase().includes(featureSearch.toLowerCase()));const count=source.features.filter(f=>integration.features.includes(f.id)).length;return visible.length ? <details key={source.id + (featureSearch ? '-search' : '')} open={featureSearch ? true : undefined} className={count ? 'has-selection' : ''}><summary><span>{source.title}</span><b>{count ? count+' / ' : ''}{source.features.length}</b></summary><div>{visible.map(f=><label className="function-choice" key={f.id}><input type="checkbox" checked={integration.features.includes(f.id)} onChange={event=>toggleFunction(f.id,event.target.checked)}/><span>{f.name}</span></label>)}<button className="source-link" onClick={()=>{setWorkspace('catalogue');}}>Voir ce design ↗</button>{source.limitations && <p className="source-limit">{source.limitations}</p>}</div></details> : null;})}</div>
        {!FUNCTION_SOURCES.some(source => source.features.some(f=>`${source.title} ${f.name}`.toLowerCase().includes(featureSearch.toLowerCase()))) && <p className="empty-message">Aucune fonction trouvée.</p>}
      </>}
        {step === 'identity' && <section className="editor-section"><label className="full-field">Application cible<select value={target} onChange={event => chooseTarget(event.target.value)}>{Object.entries(targets).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></label>
          <div className="section-label"><span>01</span><b>Application</b></div>
          <div className="form-grid"><label>Nom<input value={project.project.name} onChange={(event) => update((draft) => { draft.project.name = event.target.value; })} /></label><label>Identifiant<input value={project.project.id} onChange={(event) => update((draft) => { draft.project.id = event.target.value; })} /></label><label>Version<input value={project.project.version} onChange={(event) => update((draft) => { draft.project.version = event.target.value; })} /></label><label>Version pack<input value={project.packVersion} onChange={(event) => update((draft) => { draft.packVersion = event.target.value; })} /></label></div>
          <div className="section-label"><span>02</span><b>Ressources du pack</b></div>
          <div className="asset-grid">{['logo', 'icon'].map((kind) => <label className="asset-card" key={kind}>{project.identity[kind] ? <NextImage src={project.identity[kind]} width={52} height={52} unoptimized alt={kind === 'logo' ? 'Logo' : 'Icône'} /> : <Upload />}<strong>{kind === 'logo' ? 'Logo' : 'Icône app'}</strong><small>PNG · 4 Mio max.</small><input type="file" accept="image/png" onChange={(event) => image(event, kind)} /></label>)}</div>
          {(project.identity.logo || project.identity.icon) && <button className="asset-preset" onClick={clearIdentityAssets}>Retirer le logo et l’icône</button>}
          <label className="full-field">Signature<input value={project.identity.signature} onChange={(event) => update((draft) => { draft.identity.signature = event.target.value; })} /></label>
          <div className="form-grid"><label>Dépôt GitHub<input placeholder="https://github.com/..." value={project.project.repository} onChange={(event) => update((draft) => { draft.project.repository = event.target.value; })} /></label><label>Licence<input placeholder="MIT" value={project.project.license} onChange={(event) => update((draft) => { draft.project.license = event.target.value; })} /></label></div>
        </section>}

        {step === 'identity' && <section className="editor-section">
          <div className="language-head"><div className="section-label"><span>01</span><b>Textes du About</b></div><div className="language-toggle"><button className={locale === 'fr' ? 'active' : ''} onClick={() => setLocale('fr')}>FR</button><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button></div></div>
          <label className="full-field">Langue de repli<select value={project.defaultLocale} onChange={(event) => update((draft) => { draft.defaultLocale = event.target.value; })}><option value="fr">Français</option><option value="en">English</option></select></label>
          {Object.entries(labels[locale]).map(([key, label]) => <label className="full-field" key={key}>{label}<textarea rows={key === 'description' ? 2 : 3} value={project.translations[locale][key]} onChange={(event) => update((draft) => { draft.translations[locale][key] = event.target.value; })} /></label>)}
        </section>}

      {step === 'export' && <div className="export-panel">        <section className="integration-generator" aria-label="Générateur final">
          <h3>Générateur final</h3>
          <p>{integration.features.length} fonctions + {integration.blocks?.length||0} blocs UX + {project.theme.name} + identité</p>
          <label className="full-field">Chemin du projet cible<input value={integration.path} placeholder="/chemin/vers/mon-app" onChange={event => updateIntegration('path',event.target.value)} /></label>
          <label className="full-field">Technologie d’intégration<select value={integration.technology} onChange={event => updateIntegration('technology',event.target.value)}>{TECHNOLOGIES.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="full-field">Consignes d’intégration<textarea value={integration.notes} onChange={event => updateIntegration('notes',event.target.value)} placeholder="Fonctions à préserver, contraintes…" /></label>
          <button className="primary-export" disabled={generating || validation.errors.length > 0 || (!integration.features.length && !integration.blocks?.length) || !integration.path.trim()} onClick={generateIntegration}><Download />{generating ? 'Génération…' : 'Générer le kit d’intégration ZIP'}</button>
          <p className="integration-help">{!integration.features.length && !integration.blocks?.length ? 'Choisissez au moins une fonction ou un bloc. ' : ''}{!integration.path.trim() ? 'Renseignez le chemin cible. ' : ''}Le ZIP contient le pack réimportable, les sources, le skin, les images, un adaptateur web et INTEGRATION.md. L’intégration des fonctions à l’app cible reste à exécuter.</p>
        </section>
        <nav className="output-tabs"><button className={output === 'pack' ? 'active' : ''} onClick={() => setOutput('pack')}>Pack</button><button className={output === 'prompt' ? 'active' : ''} onClick={() => setOutput('prompt')}>Prompt adaptateur</button></nav>

        {output === 'pack' ? <>
          <div className="pack-card"><div className="pack-icon"><FileJson /></div><div><strong>{project.project.id}.neuroforge.json</strong><span>Contrat {project.schema} · v{project.packVersion}</span></div><span className={validation.errors.length ? 'bad' : ''}>{validation.errors.length ? 'À corriger' : 'Prêt'}</span></div>
          <div className="pack-map"><span><b>THÈME</b><i>{project.theme.name}</i></span><span><b>INTERFACE</b><i>{selectedFamily.name} · {selectedVariant[1]}</i></span><span><b>IDENTITÉ</b><i>{project.identity.logo || project.identity.icon ? 'ressources jointes' : 'à compléter'}</i></span><span><b>LANGUES</b><i>FR + EN · repli {project.defaultLocale.toUpperCase()}</i></span><span><b>ABOUT</b><i>généré depuis le pack</i></span><span><b>CIBLE</b><i>{targets[target].label}</i></span></div>
          <button className="primary-export" disabled={validation.errors.length > 0} onClick={() => exportFile('pack')}><Download />Exporter le pack commun</button>
          <details className="pack-transfer"><summary>Transférer le pack par texte JSON</summary><p>Alternative au téléchargement : préparez le pack, copiez son texte et importez-le dans un autre espace.</p><button onClick={()=>setPackText(JSON.stringify(project,null,2))}>Préparer le JSON du pack</button><label>Pack JSON<textarea aria-label="Pack JSON" value={packText} onChange={e=>setPackText(e.target.value)} spellCheck={false}/></label><button disabled={!packText} onClick={async()=>{try{await importPackText(packText);}catch(error){setMessage('Import refusé : '+error.message);}}}>Importer ce JSON</button></details><div className="export-grid"><button onClick={() => exportFile('css')}><FileCode2 />CSS</button><button onClick={() => exportFile('about')}><FileCode2 />About</button><button onClick={() => exportFile('readme')}><FileCode2 />README</button><button onClick={() => exportFile('native')}><Download />NoteMistress</button></div>
          <div className="import-row"><button onClick={() => importRef.current?.click()}><Upload />Importer un pack</button><button onClick={reset}><RotateCcw />Réinitialiser</button></div>
        </> : <>
          <textarea aria-label="Instructions finales d’intégration" className="prompt-output" readOnly value={prompt} />
          <button className="primary-export" onClick={async () => { await navigator.clipboard.writeText(prompt); setMessage('Prompt adaptateur copié.'); }}><Clipboard />Copier le prompt</button>
        </>}

        <div className={`validation-card ${validation.errors.length ? 'has-errors' : ''}`}><strong>{validation.errors.length ? `${validation.errors.length} erreur(s)` : 'Contrat valide'}</strong>{validation.errors.slice(0, 3).map((error) => <p key={error}>{error}</p>)}{!validation.errors.length && <p>Identité, version, thème, interface, ressources, validation, persistance et repli sont présents.</p>}{validation.warnings.length > 0 && <small>{validation.warnings.length} avertissement(s) de compatibilité ou de repli.</small>}</div>

</div>}
      </section>
      <aside id="live-preview" className="result-panel" aria-label="Aperçu et sélection">
        <div className="preview-toolbar"><div><span>THEME ACTIF</span><h2>{DRESSING_NAMES[integration.dressing||'nyx']}</h2></div><nav aria-label="Aperçu"><button aria-pressed={preview==='app'} onClick={()=>setPreview('app')}>Application</button><button aria-pressed={preview==='icon'} onClick={()=>setPreview('icon')}>Identité</button><button aria-pressed={preview==='about'} onClick={()=>setPreview('about')}>About</button></nav></div>
        <div hidden={preview!=='app'}>{projectLoaded && (integration.dressing==='noteplan-style-v2' ? (themePreviewSource ? <iframe className="design-preview nyx-unified-preview" title="NotePlan Style Simulator — aperçu du theme" srcDoc={themePreviewSource.html} sandbox="allow-scripts allow-forms allow-modals"/> : <p>{catalogueError||'Chargement de NotePlan Style Simulator…'}</p>) : <NyxPreview key={nativeRevision} project={project} skins={availableSkins} onTheme={chooseSkin} onSession={receiveSession} onNativeState={receiveNativeState}/>)}<p className="preview-caption">{integration.dressing==='noteplan-style-v2'?'Simulateur NotePlan complet dans la preview du Theme. L’interface globale Nyx UX reste inchangée.':'Base existante Nyx intégré. Les thèmes s’appliquent au shell, à Documents et à Registry. Les nouveaux blocs sont dans la Blade Bibliothèque.'}</p></div>
        {preview==='codepen' && <section className="original-design-view"><header><div><strong>Glass Dashboard</strong><small>Original de gestok · contenu démo</small></div><button onClick={()=>setPreview('app')}>Retour à mon application</button><a href="/codepen/YzLBVOp/index.html" target="_blank" rel="noreferrer">Plein écran ↗</a></header><iframe title="Glass Dashboard — design original CodePen" src="/codepen/YzLBVOp/index.html" sandbox="allow-scripts" allow="autoplay"/><footer>HTML, CSS et interactions d’origine. Les documents Nyx restent conservés dans votre application.</footer></section>}
        {preview === 'icon' && <div className="identity-preview" style={{background:project.theme.background,color:project.theme.text}}><div>{['logo','icon'].map(kind=><figure key={kind}>{project.identity[kind] ? <NextImage src={project.identity[kind]} width={112} height={112} unoptimized alt={kind === 'logo' ? 'Logo' : 'Icône'}/> : <span>{project.project.name.slice(0,1)}</span>}<figcaption>{kind==='logo'?'Logo':'Icône app'}</figcaption></figure>)}</div><h2>{project.project.name}</h2><p>{project.identity.signature}</p></div>}
        {preview === 'about' && (html ? <iframe className="design-preview" title="Aperçu About" sandbox="" srcDoc={html}/> : <p className="empty-message">Complétez les réglages du pack pour afficher le About.</p>)}
        <section className="selection-summary"><div className="panel-title"><h2>Votre combinaison</h2><span>{integration.features.length} fonctions</span></div><div className="selection-design"><span><b>{preview==='blocks'?(COMPOSITIONS.find(c=>c.id===integration.composition)?.name||'Cockpit Glass'):activeSource?.title || selectedVariant[1]}</b><small>{preview==='blocks'?'Thème complet':'Référence'}</small></span><span className="summary-plus">+</span><span><b>{project.theme.name}</b><small>Skin</small></span><span className="summary-plus">+</span><span><b>{project.project.name}</b><small>Identité</small></span></div>{chosenFunctions.length ? <div className="selected-functions">{chosenFunctions.map(source=><div key={source.id}><strong>{source.title}</strong>{source.features.map(f=><button key={f.id} aria-label={'Retirer '+f.name} onClick={()=>toggleFunction(f.id,false)}>{f.name}<span>×</span></button>)}</div>)}</div> : <button className="selection-empty" onClick={()=>setStep('functions')}>+ Choisir les fonctions de mon app</button>}{activeSource?.limitations && <details className="advanced-settings"><summary>À savoir sur cette référence</summary><p>{activeSource.limitations}</p></details>}</section>
      </aside>
    </div>}
    <footer className="nyx-statusbar"><span>{project.theme.name}</span><span>{integration.blocks?.length||0} blocs</span><output aria-live="polite">{message || (validation.errors.length ? validation.errors[0] : 'Local · données conservées dans ce navigateur')}</output></footer>
  </main>;
}
