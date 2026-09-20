'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileCode2,
  FileJson,
  ImagePlus,
  Languages,
  Monitor,
  PackageOpen,
  Palette,
  PanelsTopLeft,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
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

const STORAGE = 'neuroforge-skin-studio-v2';
const clone = (value) => JSON.parse(JSON.stringify(value));
const skinIds = ['moteur-ux', 'nyx-core', 'neon-grid', 'obsidian-luxe', 'signal-light'];
const skins = {
  'moteur-ux': { name: 'Moteur UX', note: 'Sauge, crème et atelier éditorial', background: '#F3F4EF', surface: '#FAFBF7', text: '#24302C', muted: '#697268', accent: '#244D3A', signal: '#8AAD75', appearance: 'light', radius: 6 },
  'nyx-core': { name: 'NYX Core', note: 'Workbench sombre et précis', background: '#07070B', surface: '#16161E', text: '#F2F2F5', muted: '#8E8E93', accent: '#0A84FF', signal: '#64D2FF', appearance: 'dark', radius: 6 },
  'neon-grid': { name: 'Neon Grid', note: 'Signal nocturne et électrique', background: '#080B09', surface: '#141A17', text: '#F4FFE8', muted: '#90A08D', accent: '#B8FF32', signal: '#B65CFF', appearance: 'dark', radius: 2 },
  'obsidian-luxe': { name: 'Obsidian Luxe', note: 'Métal, contraste et calme', background: '#0B0A08', surface: '#191713', text: '#FFF9ED', muted: '#A69B87', accent: '#D8B46B', signal: '#FFF1C9', appearance: 'dark', radius: 12 },
  'signal-light': { name: 'Signal Light', note: 'Clair, éditorial et direct', background: '#EEF1F5', surface: '#FFFFFF', text: '#111827', muted: '#667085', accent: '#1447E6', signal: '#F05223', appearance: 'light', radius: 8 },
};
const targets = {
  notemistress: { label: 'NoteMistress', tech: 'AppKit', status: 'adaptateur thème', id: 'notemistress' },
  'nyx-ux': { label: 'Nyx UX', tech: 'Web', status: 'adaptateur web', id: 'nyx-ux' },
  future: { label: 'Future app', tech: 'Pack commun', status: 'prête à raccorder', id: 'future-app' },
};
const labels = {
  fr: { description: 'Description', purpose: 'À quoi sert cette application ?', audience: 'Pour qui ?', limits: 'Limites connues' },
  en: { description: 'Description', purpose: 'What is this application for?', audience: 'Who is it for?', limits: 'Known limitations' },
};

function seedProject() {
  const project = newProject('notemistress');
  project.project.name = 'NoteMistress';
  project.project.version = '0.1.0';
  project.packVersion = '0.1.0';
  project.theme = {
    name: skins['nyx-core'].name,
    appearance: skins['nyx-core'].appearance,
    background: skins['nyx-core'].background,
    surface: skins['nyx-core'].surface,
    text: skins['nyx-core'].text,
    muted: skins['nyx-core'].muted,
    accent: skins['nyx-core'].accent,
    typography: { family: 'system', size: 13 },
    density: 'comfortable',
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
  const fallback = { project: seedProject(), target: 'notemistress', skinId: 'nyx-core', signal: skins['nyx-core'].signal, radius: skins['nyx-core'].radius };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return fallback;
    const stored = JSON.parse(raw);
    return {
      project: parseProject(JSON.stringify(stored.project)),
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
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Home() {
  const [project, setProject] = useState(seedProject);
  const [target, setTarget] = useState('notemistress');
  const [workspace, setWorkspace] = useState('skins');
  const [editor, setEditor] = useState('skin');
  const [preview, setPreview] = useState('app');
  const [output, setOutput] = useState('pack');
  const [locale, setLocale] = useState('fr');
  const [skinId, setSkinId] = useState('nyx-core');
  const [signal, setSignal] = useState(skins['nyx-core'].signal);
  const [radius, setRadius] = useState(skins['nyx-core'].radius);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadStored();
      setProject(stored.project);
      setTarget(stored.target);
      setSkinId(stored.skinId);
      setSignal(stored.signal);
      setRadius(stored.radius);
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
  const prompt = useMemo(() => `Crée l’adaptateur visuel de ${project.project.name} à partir du pack NeuroForge joint.\n\nCONTRAT\n- Conserver la logique métier, les données et les couleurs d’état de l’application.\n- Appliquer les tokens de thème séparément de la disposition d’interface.\n- Adapter la famille d’interface seulement si la cible déclare cette capacité ; sinon conserver sa disposition native.\n- Respecter le repli de langue ${project.defaultLocale}.\n- Valider le pack avant application et restaurer le thème natif si un token est invalide.\n\nCIBLE\n- Application : ${targets[target].label}\n- Technologie : ${targets[target].tech}\n- Pack : ${project.project.id} ${project.packVersion}\n- Thème : ${project.theme.name}\n- Interface : ${selectedFamily.name} / ${selectedVariant[1]}\n- Type : ${selectedFamily.kind}\n- Modules : ${project.modules.join(', ')}\n\nPREUVE ATTENDUE\nImporter exactement le même fichier .neuroforge.json dans deux applications, afficher son identifiant et sa version, puis démontrer le repli vers leur thème et disposition natifs.`, [project, selectedFamily, selectedVariant, target]);

  const previewStyle = {
    '--pv-bg': project.theme.background,
    '--pv-surface': project.theme.surface,
    '--pv-text': project.theme.text,
    '--pv-muted': project.theme.muted,
    '--pv-accent': project.theme.accent,
    '--pv-signal': signal,
    '--pv-radius': `${radius}px`,
    '--pv-space': project.theme.density === 'compact' ? '10px' : '16px',
    '--pv-font': project.theme.typography.family === 'monospace' ? 'var(--font-geist-mono)' : 'var(--font-geist-sans)',
  };

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
    });
  }

  function chooseSkin(id) {
    const skin = skins[id];
    setSkinId(id);
    setSignal(skin.signal);
    setRadius(skin.radius);
    update((draft) => {
      draft.theme = {
        ...draft.theme,
        name: skin.name,
        appearance: skin.appearance,
        background: skin.background,
        surface: skin.surface,
        text: skin.text,
        muted: skin.muted,
        accent: skin.accent,
      };
    });
  }

  function chooseInterfaceFamily(id) {
    const family = INTERFACE_FAMILIES.find((item) => item.id === id);
    if (!family) return;
    update((draft) => {
      draft.ui = { family: family.id, variant: family.variants[0][0] };
      if (!draft.modules.includes('layout')) draft.modules.push('layout');
    });
  }

  function chooseInterfaceVariant(id) {
    if (!selectedFamily.variants.some(([variant]) => variant === id)) return;
    update((draft) => {
      draft.ui = { family: selectedFamily.id, variant: id };
      if (!draft.modules.includes('layout')) draft.modules.push('layout');
    });
  }

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

  async function useNeuroForgeAssets() {
    try {
      const values = await Promise.all(['logo', 'icon'].map(async (name) => {
        const response = await fetch(`./neuroforge/${name}.png`);
        if (!response.ok) throw Error('Ressource NeuroForge introuvable.');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }));
      const next = clone(project);
      next.identity.logo = values[0];
      next.identity.icon = values[1];
      await decodeImages(parseProject(JSON.stringify(next)));
      setProject(next);
      setMessage('Logo et icône NeuroForge chargés.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function importPack(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 12000000) throw Error('12 Mo maximum.');
      const incoming = await decodeImages(parseProject(await file.text()));
      setProject(incoming);
      setLocale(incoming.defaultLocale);
      setMessage('Pack importé et validé.');
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
    window.localStorage.setItem(STORAGE, JSON.stringify({ project, target, skinId, signal, radius }));
    setSaved(true);
    setMessage('Pack enregistré dans ce navigateur.');
  }

  function reset() {
    const next = seedProject();
    setProject(next);
    setTarget('notemistress');
    setSkinId('nyx-core');
    setSignal(skins['nyx-core'].signal);
    setRadius(skins['nyx-core'].radius);
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

  return <main className="studio-app">
    <header className="studio-topbar">
      <div className="studio-brand"><div className="studio-mark">N</div><div><strong>NYX × NEURO FORGE</strong><span>Skin Studio</span></div></div>
      <div className="target-switcher">
        <span>CIBLE</span>
        <label><select value={target} onChange={(event) => chooseTarget(event.target.value)}>{Object.entries(targets).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><ChevronDown /></label>
        <em>{targets[target].tech} · {targets[target].status}</em>
      </div>
      <div className="top-actions"><span className={`contract-state ${validation.errors.length ? 'is-error' : ''}`}><i />{workspace === 'skins' ? (validation.errors.length ? `${validation.errors.length} erreur` : 'Pack valide') : '9 familles · 13 références'}</span>{workspace === 'skins' && <button className="ghost-button" onClick={save}>{saved ? <Check /> : <ShieldCheck />}{saved ? 'Enregistré' : 'Enregistrer'}</button>}</div>
    </header>

    <nav className="workflow-nav" aria-label="Workflow NeuroForge">
      <button className={workspace === 'skins' ? 'active' : ''} onClick={() => setWorkspace('skins')}><Palette /><span><b>1 · Pack visuel</b><small>Thème, interface, identité, langues, About</small></span></button>
      <button className={workspace === 'interfaces' ? 'active' : ''} onClick={() => setWorkspace('interfaces')}><PanelsTopLeft /><span><b>2 · Interfaces & composition</b><small>Moteur UX existant · 9 familles</small></span></button>
      <p>Choisir l’apparence, puis composer l’interface de {project.project.name}.</p>
    </nav>

    {workspace === 'skins' ? <div className="studio-layout">
      <aside className="studio-controls">
        <div className="panel-intro"><span>CRÉER LE PACK</span><h1>{project.project.name}</h1><p>Une seule source pour le thème, l’interface, l’identité et les langues.</p></div>
        <nav className="editor-tabs" aria-label="Sections du pack">
          <button className={editor === 'skin' ? 'active' : ''} onClick={() => setEditor('skin')}><Palette />Skin</button>
          <button className={editor === 'interface' ? 'active' : ''} onClick={() => setEditor('interface')}><PanelsTopLeft />Interface</button>
          <button className={editor === 'identity' ? 'active' : ''} onClick={() => setEditor('identity')}><ImagePlus />Identité</button>
          <button className={editor === 'languages' ? 'active' : ''} onClick={() => setEditor('languages')}><Languages />Langues</button>
        </nav>

        {editor === 'skin' && <section className="editor-section">
          <div className="section-label"><span>01</span><b>Direction visuelle</b></div>
          <div className="skin-list">{skinIds.map((id) => <button key={id} className={skinId === id ? 'active' : ''} onClick={() => chooseSkin(id)}><i style={{ background: `linear-gradient(135deg, ${skins[id].accent}, ${skins[id].signal})` }} /><span><strong>{skins[id].name}</strong><small>{skins[id].note}</small></span>{skinId === id && <Check />}</button>)}</div>
          <div className="section-label"><span>02</span><b>Tokens partagés</b></div>
          <div className="token-grid">{[
            ['background', 'Fond'], ['surface', 'Surface'], ['text', 'Texte'], ['muted', 'Secondaire'], ['accent', 'Accent'],
          ].map(([key, label]) => <label key={key}><span>{label}</span><div><input type="color" value={project.theme[key]} onChange={(event) => update((draft) => { draft.theme[key] = event.target.value; })} /><input value={project.theme[key]} onChange={(event) => update((draft) => { draft.theme[key] = event.target.value; })} /></div></label>)}</div>
          <div className="compact-fields"><label>Densité<select value={project.theme.density} onChange={(event) => update((draft) => { draft.theme.density = event.target.value; })}><option value="comfortable">Confortable</option><option value="compact">Compacte</option></select></label><label>Police<select value={project.theme.typography.family} onChange={(event) => update((draft) => { draft.theme.typography.family = event.target.value; })}><option value="system">Système</option><option value="monospace">Monospace</option></select></label></div>
        </section>}

        {editor === 'interface' && <section className="editor-section">
          <div className="section-label"><span>01</span><b>Familles Moteur UX</b></div>
          <p className="interface-count">9 familles · 13 références · interface séparée du thème</p>
          <div className="interface-list">{INTERFACE_FAMILIES.map((family) => <button key={family.id} className={selectedFamily.id === family.id ? 'active' : ''} onClick={() => chooseInterfaceFamily(family.id)}><span><strong>{family.name}</strong><small>{family.description}</small></span><em>{family.variants.length} {family.variants.length > 1 ? 'variantes' : 'référence'}</em>{selectedFamily.id === family.id && <Check />}</button>)}</div>
          <label className="full-field">Variante<select value={selectedVariant[0]} onChange={(event) => chooseInterfaceVariant(event.target.value)}>{selectedFamily.variants.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          <button className="catalog-button" onClick={() => setWorkspace('interfaces')}><PanelsTopLeft />Voir les 13 aperçus et le composeur</button>
          {selectedFamily.kind === 'effects' && <p className="interface-warning">FX Composer reste un prototype de catalogue : ses moteurs d’effets ne sont pas intégrés.</p>}
        </section>}

        {editor === 'identity' && <section className="editor-section">
          <div className="section-label"><span>01</span><b>Application</b></div>
          <div className="form-grid"><label>Nom<input value={project.project.name} onChange={(event) => update((draft) => { draft.project.name = event.target.value; })} /></label><label>Identifiant<input value={project.project.id} onChange={(event) => update((draft) => { draft.project.id = event.target.value; })} /></label><label>Version<input value={project.project.version} onChange={(event) => update((draft) => { draft.project.version = event.target.value; })} /></label><label>Version pack<input value={project.packVersion} onChange={(event) => update((draft) => { draft.packVersion = event.target.value; })} /></label></div>
          <div className="section-label"><span>02</span><b>Ressources du pack</b></div>
          <button className="asset-preset" onClick={useNeuroForgeAssets}><Sparkles />Utiliser l’identité NeuroForge</button>
          <div className="asset-grid">{['logo', 'icon'].map((kind) => <label className="asset-card" key={kind}>{project.identity[kind] ? <NextImage src={project.identity[kind]} width={52} height={52} unoptimized alt={kind === 'logo' ? 'Logo' : 'Icône'} /> : <Upload />}<strong>{kind === 'logo' ? 'Logo' : 'Icône app'}</strong><small>PNG · 4 Mio max.</small><input type="file" accept="image/png" onChange={(event) => image(event, kind)} /></label>)}</div>
          <label className="full-field">Signature<input value={project.identity.signature} onChange={(event) => update((draft) => { draft.identity.signature = event.target.value; })} /></label>
          <div className="form-grid"><label>Dépôt GitHub<input placeholder="https://github.com/..." value={project.project.repository} onChange={(event) => update((draft) => { draft.project.repository = event.target.value; })} /></label><label>Licence<input placeholder="MIT" value={project.project.license} onChange={(event) => update((draft) => { draft.project.license = event.target.value; })} /></label></div>
        </section>}

        {editor === 'languages' && <section className="editor-section">
          <div className="language-head"><div className="section-label"><span>01</span><b>Textes du About</b></div><div className="language-toggle"><button className={locale === 'fr' ? 'active' : ''} onClick={() => setLocale('fr')}>FR</button><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button></div></div>
          <label className="full-field">Langue de repli<select value={project.defaultLocale} onChange={(event) => update((draft) => { draft.defaultLocale = event.target.value; })}><option value="fr">Français</option><option value="en">English</option></select></label>
          {Object.entries(labels[locale]).map(([key, label]) => <label className="full-field" key={key}>{label}<textarea rows={key === 'description' ? 2 : 3} value={project.translations[locale][key]} onChange={(event) => update((draft) => { draft.translations[locale][key] = event.target.value; })} /></label>)}
        </section>}
      </aside>

      <section className="studio-preview" aria-label="Aperçu du pack">
        <div className="preview-heading"><div><span>APERÇU VIVANT</span><h2>{project.project.name}</h2></div><nav><button className={preview === 'app' ? 'active' : ''} onClick={() => setPreview('app')}><Monitor />App</button><button className={preview === 'icon' ? 'active' : ''} onClick={() => setPreview('icon')}><ImagePlus />Icône</button><button className={preview === 'about' ? 'active' : ''} onClick={() => setPreview('about')}><FileCode2 />About</button></nav></div>

        {preview === 'app' && <div className="app-preview" style={previewStyle}>
          <div className="app-chrome"><div><i /><i /><i /></div><span>{project.identity.logo ? <NextImage src={project.identity.logo} width={24} height={24} unoptimized alt="" /> : <b>{project.project.name.slice(0, 1)}</b>}{project.project.name}</span><em><i /> pack {project.packVersion}</em></div>
          <div className="app-shell"><nav><small>WORKSPACE</small>{['Cockpit', 'Projets', 'Bibliothèque', 'Réglages'].map((item, index) => <span className={index === 0 ? 'active' : ''} key={item}><i />{item}</span>)}<div className="capacity"><small>CAPACITÉ</small><i><b /></i><span>68% utilisé</span></div></nav><div className="app-content"><header><div><small>{targets[target].label} · {targets[target].tech}</small><h3>{project.translations[locale].purpose || project.project.name}</h3></div><button>Nouvelle action</button></header><div className="metrics"><article><small>PROJETS</small><strong>12</strong><span>+3 cette semaine</span></article><article><small>ACTIFS</small><strong>08</strong><span>Flux nominal</span></article><article><small>SIGNAL</small><strong>96%</strong><span>Qualité élevée</span></article></div><article className="activity"><header><div><small>ACTIVITÉ</small><strong>Dernières opérations</strong></div><span>Tout afficher</span></header>{['Pack chargé', 'Tokens appliqués', 'Repli vérifié'].map((item, index) => <div key={item}><i /><span><strong>{item}</strong><small>{index + 2} min · moteur commun</small></span><b>{['PRÊT', 'SYNC', 'OK'][index]}</b></div>)}</article></div></div>
        </div>}

        {preview === 'icon' && <div className="icon-preview" style={previewStyle}><div className="icon-stage">{project.identity.icon ? <NextImage src={project.identity.icon} width={112} height={112} unoptimized alt="Icône de l’application" /> : <span>{project.project.name.slice(0, 1)}</span>}<i className="icon-glow" /></div><h3>{project.project.name}</h3><p>L’icône voyage dans le pack. L’adaptateur de chaque app décide comment l’installer.</p><div><span><i style={{ background: project.theme.accent }} />Accent</span><span><i style={{ background: signal }} />Signal</span><span><i style={{ background: project.theme.surface }} />Surface</span></div></div>}

        {preview === 'about' && <div className="about-preview">{html ? <iframe title="Aperçu About" sandbox="" srcDoc={html} /> : <div><FileCode2 /><strong>About indisponible</strong><span>Corrigez les erreurs du pack.</span></div>}</div>}

        <div className="engine-strip"><span><i>1</i><b>Pack commun</b><small>{project.project.id}</small></span><em>→</em><span><i>2</i><b>Adaptateur</b><small>{targets[target].tech}</small></span><em>→</em><span><i>3</i><b>Application</b><small>métier préservé</small></span></div>
      </section>

      <aside className="studio-output">
        <div className="output-heading"><div><span>LIVRER</span><h2>Un pack, plusieurs apps</h2></div><PackageOpen /></div>
        <nav className="output-tabs"><button className={output === 'pack' ? 'active' : ''} onClick={() => setOutput('pack')}>Pack</button><button className={output === 'prompt' ? 'active' : ''} onClick={() => setOutput('prompt')}>Prompt adaptateur</button></nav>

        {output === 'pack' ? <>
          <div className="pack-card"><div className="pack-icon"><FileJson /></div><div><strong>{project.project.id}.neuroforge.json</strong><span>Contrat {project.schema} · v{project.packVersion}</span></div><span className={validation.errors.length ? 'bad' : ''}>{validation.errors.length ? 'À corriger' : 'Prêt'}</span></div>
          <div className="pack-map"><span><b>THÈME</b><i>{project.theme.name}</i></span><span><b>INTERFACE</b><i>{selectedFamily.name} · {selectedVariant[1]}</i></span><span><b>IDENTITÉ</b><i>{project.identity.logo || project.identity.icon ? 'ressources jointes' : 'à compléter'}</i></span><span><b>LANGUES</b><i>FR + EN · repli {project.defaultLocale.toUpperCase()}</i></span><span><b>ABOUT</b><i>généré depuis le pack</i></span><span><b>CIBLE</b><i>{targets[target].label}</i></span></div>
          <button className="primary-export" disabled={validation.errors.length > 0} onClick={() => exportFile('pack')}><Download />Exporter le pack commun</button>
          <div className="export-grid"><button onClick={() => exportFile('css')}><FileCode2 />CSS</button><button onClick={() => exportFile('about')}><FileCode2 />About</button><button onClick={() => exportFile('readme')}><FileCode2 />README</button><button onClick={() => exportFile('native')}><Download />NoteMistress</button></div>
          <div className="import-row"><button onClick={() => importRef.current?.click()}><Upload />Importer un pack</button><button onClick={reset}><RotateCcw />Réinitialiser</button><input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importPack} /></div>
        </> : <>
          <textarea className="prompt-output" readOnly value={prompt} />
          <button className="primary-export" onClick={async () => { await navigator.clipboard.writeText(prompt); setMessage('Prompt adaptateur copié.'); }}><Clipboard />Copier le prompt</button>
        </>}

        <div className={`validation-card ${validation.errors.length ? 'has-errors' : ''}`}><strong>{validation.errors.length ? `${validation.errors.length} erreur(s)` : 'Contrat valide'}</strong>{validation.errors.slice(0, 3).map((error) => <p key={error}>{error}</p>)}{!validation.errors.length && <p>Identité, version, thème, interface, ressources, validation, persistance et repli sont présents.</p>}{validation.warnings.length > 0 && <small>{validation.warnings.length} avertissement(s) de compatibilité ou de repli.</small>}</div>
        <output className="studio-status" aria-live="polite">{message}</output>
      </aside>
    </div> : <section className="ux-workspace" aria-label="Moteur UX intégré">
      <header><div><span>BIBLIOTHÈQUE EXISTANTE</span><h1>Moteur UX</h1><p>Catalogue, sélection de fonctions, interface unifiée et composeur conservés dans le même workflow.</p></div><div><b>9</b><small>familles</small><b>13</b><small>références</small></div></header>
      <iframe src="./moteur-ux.html" title="Moteur UX — bibliothèque et composeur" />
    </section>}
  </main>;
}
