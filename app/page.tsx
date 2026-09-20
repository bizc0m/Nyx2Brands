'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import NextImage from 'next/image';
import { Check, Clipboard, Download, FileJson, ImagePlus, Layers3, Palette, RotateCcw, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

type SkinId = 'nyx-core' | 'neon-grid' | 'obsidian-luxe' | 'signal-light';
type BrandState = { clientName: string; projectName: string; sector: string; audience: string; tone: string; requirements: string; skin: SkinId; primary: string; accent: string; radius: string; logo: string; logoName: string };

const skins: Record<SkinId, { name: string; description: string; primary: string; accent: string; surface: string; canvas: string; foreground: string; muted: string; border: string; radius: string; motif: string }> = {
  'nyx-core': { name: 'NYX Core', description: 'Workbench sombre, dense et précis.', primary: '#0A84FF', accent: '#64D2FF', surface: '#16161E', canvas: '#07070B', foreground: '#F2F2F5', muted: '#8E8E93', border: '#2C2C3A', radius: '6', motif: 'Grid / macOS' },
  'neon-grid': { name: 'Neon Grid', description: 'Énergie nocturne et signalétique vive.', primary: '#B8FF32', accent: '#B65CFF', surface: '#141A17', canvas: '#080B09', foreground: '#F4FFE8', muted: '#90A08D', border: '#33402E', radius: '2', motif: 'Scanlines / signal' },
  'obsidian-luxe': { name: 'Obsidian Luxe', description: 'Contraste feutré et finition premium.', primary: '#D8B46B', accent: '#FFF1C9', surface: '#191713', canvas: '#0B0A08', foreground: '#FFF9ED', muted: '#A69B87', border: '#3A3429', radius: '12', motif: 'Editorial / métal' },
  'signal-light': { name: 'Signal Light', description: 'Clarté opérationnelle et rythme éditorial.', primary: '#1447E6', accent: '#F05223', surface: '#FFFFFF', canvas: '#EEF1F5', foreground: '#111827', muted: '#667085', border: '#CBD2DC', radius: '8', motif: 'Editorial / utility' },
};

const initialBrand: BrandState = { clientName: 'Nom du client', projectName: 'Expérience NYX', sector: 'Services numériques', audience: 'Utilisateurs professionnels', tone: 'Précis, premium, direct', requirements: 'Interface responsive, accessible WCAG 2.2 AA, mode sombre et états complets.', skin: 'nyx-core', primary: skins['nyx-core'].primary, accent: skins['nyx-core'].accent, radius: skins['nyx-core'].radius, logo: '', logoName: '' };
const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

async function extractLogoColors(dataUrl: string) {
  const image = new Image(); image.src = dataUrl; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 48;
  const context = canvas.getContext('2d', { willReadFrequently: true }); if (!context) return [];
  context.drawImage(image, 0, 0, 48, 48);
  const pixels = context.getImageData(0, 0, 48, 48).data; const buckets = new Map<string, number>();
  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index + 3] < 180) continue;
    const rgb = [pixels[index], pixels[index + 1], pixels[index + 2]]; const lightness = rgb.reduce((a, b) => a + b, 0) / 3;
    if (lightness < 22 || lightness > 238 || Math.max(...rgb) - Math.min(...rgb) < 22) continue;
    const color = `#${rgb.map((value) => Math.min(255, Math.round(value / 32) * 32).toString(16).padStart(2, '0')).join('')}`;
    buckets.set(color, (buckets.get(color) ?? 0) + 1);
  }
  return [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([color]) => color);
}

export default function Home() {
  const [brand, setBrand] = useState<BrandState>(() => {
    if (typeof window === 'undefined') return initialBrand;
    const stored = window.localStorage.getItem('nyx-white-label-studio');
    if (!stored) return initialBrand;
    try { return { ...initialBrand, ...JSON.parse(stored) }; } catch { window.localStorage.removeItem('nyx-white-label-studio'); return initialBrand; }
  }); const [copied, setCopied] = useState(false); const [saved, setSaved] = useState(false); const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const skinIds = Object.keys(skins) as SkinId[];
    const registration = modelContext.registerTool({
      name: 'configure_nyx_white_label',
      title: 'Configurer une marque blanche NYX',
      description: 'Configure le client, le projet et la Skin dans le studio NYX, puis met à jour l’aperçu et le prompt visibles.',
      inputSchema: {
        type: 'object',
        properties: {
          clientName: { type: 'string', minLength: 1 },
          projectName: { type: 'string', minLength: 1 },
          sector: { type: 'string' },
          audience: { type: 'string' },
          tone: { type: 'string' },
          skin: { type: 'string', enum: skinIds },
          primary: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
          accent: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        },
        required: ['clientName', 'projectName', 'skin'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== 'object') throw new Error('Configuration invalide.');
        const value = input as Partial<BrandState>;
        if (!value.clientName?.trim() || !value.projectName?.trim() || !value.skin || !skinIds.includes(value.skin)) throw new Error('Client, projet ou Skin invalide.');
        if (value.primary && !isHex(value.primary)) throw new Error('La couleur principale doit être au format HEX.');
        if (value.accent && !isHex(value.accent)) throw new Error('La couleur d’accent doit être au format HEX.');
        const selected = skins[value.skin];
        setBrand((current) => ({ ...current, ...value, primary: value.primary ?? selected.primary, accent: value.accent ?? selected.accent, radius: selected.radius }));
        return { status: 'configured', clientName: value.clientName, projectName: value.projectName, skin: value.skin };
      },
    }, { signal: lifecycle.signal });
    Promise.resolve(registration).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);
  const skin = skins[brand.skin]; const primary = isHex(brand.primary) ? brand.primary : skin.primary; const accent = isHex(brand.accent) ? brand.accent : skin.accent;
  const cssTokens = useMemo(() => `:root,
[data-nyx-brand="${brand.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"] {
  --nyx-brand-primary: ${primary};
  --nyx-brand-accent: ${accent};
  --nyx-brand-canvas: ${skin.canvas};
  --nyx-brand-surface: ${skin.surface};
  --nyx-brand-foreground: ${skin.foreground};
  --nyx-brand-muted: ${skin.muted};
  --nyx-brand-border: ${skin.border};
  --nyx-brand-radius: ${brand.radius}px;
}`, [accent, brand.clientName, brand.radius, primary, skin]);
  const generatedPrompt = useMemo(() => `Tu es directeur artistique senior et product designer. Crée une déclinaison en marque blanche du système NYX sans modifier son architecture UX ni sa logique métier.

IDENTITÉ CLIENT
- Client : ${brand.clientName}
- Projet : ${brand.projectName}
- Secteur : ${brand.sector}
- Public : ${brand.audience}
- Ton : ${brand.tone}
- Logo : ${brand.logoName ? `utiliser le fichier joint « ${brand.logoName} » comme référence visuelle principale` : 'logo à fournir avant production'}

SKIN NYX
- Base : ${skin.name}
- Intention : ${skin.description}
- Motif visuel : ${skin.motif}
- Couleur principale : ${primary}
- Accent : ${accent}
- Rayon des composants : ${brand.radius}px

CONTRAINTES
- Conserver NYX Core : topbar, navigation, sidebar, onglets, panneaux, actions, états et contrats Blade.
- Appliquer la marque uniquement via des design tokens sémantiques.
- Ne jamais coder le logo, une couleur ou une police directement dans un composant.
- Prévoir les états hover, focus, actif, désactivé, erreur et chargement.
- Garantir un contraste WCAG 2.2 AA, une navigation clavier et une mise en page responsive.
- Décliner la Skin au-delà des couleurs : typographie, densité, bordures, surfaces, iconographie et mouvement.

BESOINS SPÉCIFIQUES
${brand.requirements || 'Aucun besoin supplémentaire.'}

LIVRABLES
1. Direction artistique résumée en cinq principes.
2. Design tokens complets et variables CSS.
3. Règles d’intégration du logo et zones de protection.
4. Spécifications des composants NYX principaux.
5. Exemple d’un écran desktop et de son adaptation mobile.
6. Checklist de conformité NYX Core et accessibilité.

TOKENS DE DÉPART
${cssTokens}`, [accent, brand, cssTokens, primary, skin]);
  const previewStyle = { '--preview-primary': primary, '--preview-accent': accent, '--preview-canvas': skin.canvas, '--preview-surface': skin.surface, '--preview-foreground': skin.foreground, '--preview-muted': skin.muted, '--preview-border': skin.border, '--preview-radius': `${brand.radius}px` } as CSSProperties;
  const update = <K extends keyof BrandState>(key: K, value: BrandState[K]) => { setBrand((current) => ({ ...current, [key]: value })); setSaved(false); };
  const selectSkin = (nextSkin: SkinId) => { const theme = skins[nextSkin]; setBrand((current) => ({ ...current, skin: nextSkin, primary: theme.primary, accent: theme.accent, radius: theme.radius })); setSaved(false); };
  async function handleLogo(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file?.type.startsWith('image/')) return; const reader = new FileReader(); reader.onload = async () => { if (typeof reader.result !== 'string') return; const logo = reader.result; const colors = await extractLogoColors(logo); setBrand((current) => ({ ...current, logo, logoName: file.name, primary: colors[0] ?? current.primary, accent: colors[1] ?? current.accent })); setSaved(false); }; reader.readAsDataURL(file); }
  async function copyPrompt() { await navigator.clipboard.writeText(generatedPrompt); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  function saveLocally() { window.localStorage.setItem('nyx-white-label-studio', JSON.stringify(brand)); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  function exportJson() { downloadFile(`${brand.clientName.replace(/\s+/g, '-').toLowerCase()}-nyx-pack.json`, JSON.stringify({ schema: 'nyx-white-label/v1', exportedAt: new Date().toISOString(), brand, tokens: cssTokens, prompt: generatedPrompt }, null, 2), 'application/json'); }
  function importJson(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result !== 'string') return; try { const parsed = JSON.parse(reader.result); setBrand({ ...initialBrand, ...(parsed.brand ?? parsed) }); } catch { window.alert('Ce fichier ne contient pas une configuration NYX valide.'); } }; reader.readAsText(file); }

  return <main className="nyx-app min-h-screen">
    <header className="nyx-topbar"><div className="flex min-w-0 items-center gap-3"><div className="nyx-mark" aria-hidden="true">N</div><div className="min-w-0"><p className="truncate text-sm font-semibold tracking-tight text-white">NYX White Label Studio</p><p className="truncate text-xs text-[#8E8E93]">Core stable · Skins modulaires · Marques autonomes</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="hidden border-[#2C2C3A] text-[#B8B8BE] sm:flex"><ShieldCheck data-icon="inline-start" /> local-first</Badge><Button variant="outline" size="sm" onClick={saveLocally} className="border-[#2C2C3A] bg-[#16161E] text-[#F2F2F5] hover:bg-[#1F1F2A]">{saved ? <Check /> : <Download />} {saved ? 'Sauvegardé' : 'Sauvegarder'}</Button></div></header>
    {/* Relative URL also supports the static GitHub Pages subpath. */}
    {/* oxlint-disable-next-line next/no-html-link-for-pages */}
    <div style={{padding:"12px 20px",borderBottom:"1px solid #2c2c3a"}}><a href="./forge/" style={{color:"#bddd9b"}}>Ouvrir NeuroForge — applications, langues, identité et exports →</a></div>
    <div className="studio-grid">
      <aside className="control-panel" aria-label="Configuration de la marque">
        <section className="panel-section"><div className="section-heading"><Layers3 /><div><span>01</span><h2>Skin de départ</h2></div></div><div className="skin-grid">{(Object.keys(skins) as SkinId[]).map((id) => <button key={id} type="button" className={`skin-choice ${brand.skin === id ? 'is-active' : ''}`} onClick={() => selectSkin(id)} aria-pressed={brand.skin === id}><span className="skin-swatch" style={{ background: `linear-gradient(135deg, ${skins[id].primary}, ${skins[id].accent})` }} /><span><strong>{skins[id].name}</strong><small>{skins[id].motif}</small></span>{brand.skin === id && <Check aria-hidden="true" />}</button>)}</div></section>
        <section className="panel-section"><div className="section-heading"><ImagePlus /><div><span>02</span><h2>Identité client</h2></div></div><Label htmlFor="logo" className="logo-drop"><input id="logo" type="file" accept="image/*" onChange={handleLogo} className="sr-only" />{brand.logo ? <NextImage src={brand.logo} width={100} height={35} unoptimized alt={`Logo ${brand.clientName}`} /> : <Upload aria-hidden="true" />}<span>{brand.logoName || 'Importer le logo'}</span><small>PNG, JPG ou SVG · palette détectée</small></Label><div className="form-grid"><div className="field"><Label htmlFor="client">Client</Label><Input id="client" value={brand.clientName} onChange={(event) => update('clientName', event.target.value)} /></div><div className="field"><Label htmlFor="project">Projet</Label><Input id="project" value={brand.projectName} onChange={(event) => update('projectName', event.target.value)} /></div><div className="field"><Label htmlFor="sector">Secteur</Label><Input id="sector" value={brand.sector} onChange={(event) => update('sector', event.target.value)} /></div><div className="field"><Label htmlFor="audience">Public</Label><Input id="audience" value={brand.audience} onChange={(event) => update('audience', event.target.value)} /></div><div className="field field-wide"><Label htmlFor="tone">Ton de marque</Label><Input id="tone" value={brand.tone} onChange={(event) => update('tone', event.target.value)} /></div></div></section>
        <section className="panel-section"><div className="section-heading"><Palette /><div><span>03</span><h2>Tokens de marque</h2></div></div><div className="token-row"><Label htmlFor="primary">Principale</Label><input type="color" value={primary} onChange={(event) => update('primary', event.target.value)} aria-label="Sélectionner la couleur principale" /><Input id="primary" value={brand.primary} onChange={(event) => update('primary', event.target.value)} aria-invalid={!isHex(brand.primary)} /></div><div className="token-row"><Label htmlFor="accent">Accent</Label><input type="color" value={accent} onChange={(event) => update('accent', event.target.value)} aria-label="Sélectionner la couleur d’accent" /><Input id="accent" value={brand.accent} onChange={(event) => update('accent', event.target.value)} aria-invalid={!isHex(brand.accent)} /></div><div className="token-row"><Label htmlFor="radius">Rayon</Label><NativeSelect id="radius" value={brand.radius} onChange={(event) => update('radius', event.target.value)} className="col-span-2 w-full">{[['0','0 px · strict'],['4','4 px · précis'],['6','6 px · NYX'],['8','8 px · équilibré'],['12','12 px · souple'],['18','18 px · expressif']].map(([value,label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}</NativeSelect></div><div className="field mt-3"><Label htmlFor="requirements">Contraintes et besoins</Label><Textarea id="requirements" rows={4} value={brand.requirements} onChange={(event) => update('requirements', event.target.value)} /></div></section>
      </aside>
      <section className="preview-column" aria-label="Prévisualisation de la Skin"><div className="column-title"><div><span>APERÇU ACTIF</span><h1>{brand.clientName}</h1></div><Badge style={{ backgroundColor: `${primary}22`, color: primary, borderColor: `${primary}55` }} variant="outline">{skin.name}</Badge></div>
        <div className="brand-preview" style={previewStyle}><div className="preview-topbar"><div className="preview-dots"><i /><i /><i /></div><div className="preview-logo">{brand.logo ? <NextImage src={brand.logo} width={26} height={26} unoptimized alt="" /> : <span>{brand.clientName.slice(0, 1).toUpperCase()}</span>}<strong>{brand.clientName}</strong></div><span className="status-pill"><i /> système actif</span></div><div className="preview-shell"><nav className="preview-sidebar" aria-label="Navigation simulée"><small>ESPACE</small>{['Cockpit', 'Projets', 'Bibliothèque', 'Réglages'].map((item, index) => <span className={index === 0 ? 'active' : ''} key={item}><i />{item}</span>)}<div className="sidebar-meter"><small>CAPACITÉ</small><div><i /></div><b>68% utilisé</b></div></nav><div className="preview-workspace"><div className="preview-heading"><div><small>{brand.sector}</small><h2>{brand.projectName}</h2></div><button type="button">Nouvelle action</button></div><div className="metrics"><article><small>PROJETS</small><strong>12</strong><span>+3 cette semaine</span></article><article><small>ACTIFS</small><strong>08</strong><span>Flux nominal</span></article><article><small>SIGNAL</small><strong>96%</strong><span>Qualité élevée</span></article></div><article className="activity-panel"><header><div><small>ACTIVITÉ</small><strong>Dernières opérations</strong></div><span>Tout afficher</span></header>{['Système de marque initialisé', 'Tokens synchronisés', 'Contrôle accessibilité validé'].map((item, index) => <div className="activity-row" key={item}><i /><span><strong>{item}</strong><small>{index + 2} min · NYX Core</small></span><b>{['PRÊT', 'SYNC', 'AA'][index]}</b></div>)}</article></div></div></div>
        <div className="architecture-strip"><span><i>1</i><b>NYX Core</b><small>Structure stable</small></span><em>+</em><span><i>2</i><b>{skin.name}</b><small>Univers visuel</small></span><em>+</em><span><i>3</i><b>{brand.clientName}</b><small>Identité client</small></span></div>
      </section>
      <aside className="output-panel" aria-label="Prompt généré"><div className="column-title"><div><span>SORTIE</span><h2>Prompt de production</h2></div><Sparkles className="text-[#64D2FF]" /></div><div className="prompt-meta"><Badge variant="outline">Logo {brand.logo ? 'joint' : 'manquant'}</Badge><Badge variant="outline">Tokens inclus</Badge><Badge variant="outline">WCAG AA</Badge></div><Textarea className="prompt-output" value={generatedPrompt} readOnly aria-label="Prompt généré" /><div className="output-actions"><Button onClick={copyPrompt} className="primary-action">{copied ? <Check /> : <Clipboard />} {copied ? 'Prompt copié' : 'Copier le prompt'}</Button><Button variant="outline" onClick={exportJson}><FileJson /> Pack JSON</Button><Button variant="outline" onClick={() => downloadFile('nyx-brand-tokens.css', cssTokens, 'text/css')}><Download /> CSS</Button></div><div className="import-box"><input ref={importRef} type="file" accept="application/json" onChange={importJson} className="sr-only" /><Button variant="ghost" onClick={() => importRef.current?.click()}><Upload /> Importer un pack</Button><Button variant="ghost" onClick={() => setBrand(initialBrand)}><RotateCcw /> Réinitialiser</Button></div><p className="privacy-note"><ShieldCheck /> Le logo et les réglages restent dans ce navigateur. Aucun fichier n’est envoyé.</p></aside>
    </div>
  </main>;
}
