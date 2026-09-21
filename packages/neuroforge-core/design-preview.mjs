import {visualRules} from './visual-style.mjs';
import {assertProject} from './index.mjs';

export function catalogueThumbnails(html) {
  const match = html.match(/const THUMBNAILS=(\{[^\n]*\});/);
  if (!match) return {};
  const images = JSON.parse(match[1]);
  return Object.fromEntries(Object.entries(images).filter(([id,uri]) => /^[a-z0-9-]+$/.test(id) && typeof uri === 'string' && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(uri)));
}

// References run inside an opaque, network-isolated sandbox, with ephemeral storage.
export function designPreview(source, project = null) {
  if (typeof source !== 'string') throw Error('Référence absente.');
  let css = '';
  if (project) {
    assertProject(project);
    const t=project.theme;
    const font=t.typography.family==='monospace'?'ui-monospace,monospace':'system-ui,sans-serif';
    const tokens = {
      background:['--bg','--bg-0','--ink-0','--color-bg-app'],
      surface:['--surface','--panel','--bg-1','--ink-1','--ink-2','--color-bg-surface'],
      text:['--text','--fg','--bone-0','--bone-1','--color-text-primary'],
      muted:['--muted','--bone-2','--bone-3','--color-text-secondary'],
      accent:['--accent','--sel-blue','--color-primary']
    };
    // Define tokens on the actual consumers too: embedded runtimes define their
    // own variables on nested roots, which override inherited body variables.
    if (project.modules.includes('theme')) {
      css = '*{'+Object.entries(tokens).flatMap(([name,keys])=>keys.map(key=>`${key}:${t[name]}!important`)).join(';')+
        `;--ink-3:color-mix(in srgb,${t.surface} 88%,${t.text})!important;--ink-4:color-mix(in srgb,${t.surface} 75%,${t.text})!important;--accent-soft:${t.accent}22!important;--font-body:${font}!important;--font-ui:${font}!important;}html{color-scheme:${t.appearance};}body{background:${t.background}!important;color:${t.text}!important;font-family:${font}!important;}[style*="--ink-0"]{font-size:${t.typography.size}px!important;}`;
      // Documents uses literal colors rather than the shared theme tokens.
      css += `#nd{background:${t.background}!important;color:${t.text}!important;font-family:${font}!important;}#nd .bar,#nd .pane,#nd .head,#nd .tabs,#nd .properties,#nd footer,#nd textarea,#nd input,#nd button,#nd select{background:${t.surface}!important;color:${t.text}!important;border-color:color-mix(in srgb,${t.surface} 75%,${t.text})!important;}#nd .workspace,#nd aside,#nd .content{background:${t.background}!important;}#nd .muted,#nd .empty,#nd .tools,#nd .head strong,#nd aside h3{color:${t.muted}!important;}#nd .pane.active,#nd button:focus-visible{border-color:${t.accent}!important;}#nd .blue,#nd .tabs button.active{color:${t.accent}!important;background:${t.accent}22!important;}#nd .divider{background:color-mix(in srgb,${t.surface} 85%,${t.text})!important;}`;
      // NotePlan's simulator mixes custom properties with literal light colors.
      // Scope its adapter to that reference so other previews keep their own UI.
      if (/<title>NotePlan Style Simulator<\/title>/i.test(source)) {
        css += `:root{--window:${t.surface}!important;--glass:color-mix(in srgb,${t.surface} 88%,transparent)!important;--line:color-mix(in srgb,${t.text} 18%,${t.surface})!important;--orange:${t.accent}!important;--orange-soft:color-mix(in srgb,${t.accent} 18%,${t.surface})!important;--blue:${t.accent}!important;--shadow:0 18px 50px color-mix(in srgb,${t.text} 18%,transparent)!important;}body{background:color-mix(in srgb,${t.background} 88%,${t.text})!important}.mac,.editorpane,.rightbar{background:${t.surface}!important;color:${t.text}!important}.titlebar,.sidebar,.modebar,.calendar{background:color-mix(in srgb,${t.surface} 92%,transparent)!important;color:${t.text}!important;border-color:color-mix(in srgb,${t.text} 18%,${t.surface})!important}.search,.sideitem:hover{background:color-mix(in srgb,${t.text} 8%,${t.surface})!important}.sideitem.active,.event{background:color-mix(in srgb,${t.accent} 18%,${t.surface})!important}.windowtitle,.iconbtn,.week,.meta,.group,.chev,.folder,.count,.dow,.day.dim,.hour,.modebar button,.quote{color:${t.muted}!important}.calendaricon,.time,.link,.tag{color:${t.accent}!important}.check{border-color:${t.accent}!important}.task.done .check,.day.today{background:${t.accent}!important}.modebar button.active{background:${t.surface}!important;color:${t.text}!important}.slot{border-color:color-mix(in srgb,${t.text} 12%,${t.surface})!important}.editor{color:${t.text}!important}`;
      }
    }
  }
  if(project?.modules.includes('theme'))css+=visualRules(project.theme,true);
  const storage = `<script>window.__nyxPreviewStorage=(()=>{let s={};return{getItem:k=>s[k]??null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k],clear:()=>s={}}})();</script>`;
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
  let html = source.replace(/\blocalStorage\b/g,'window.__nyxPreviewStorage').replace(/\bsessionStorage\b/g,'window.__nyxPreviewStorage');
  // Bundled references replace their head/body at startup. Keep the skin in
  // the final document, rather than losing it with the bundler placeholder.
  const applySkin = css ? `<script>(()=>{const css=${JSON.stringify(css)};const apply=()=>{if(!document.head)return;let style=document.getElementById('__nyx_active_skin');if(!style){style=document.createElement('style');style.id='__nyx_active_skin';style.textContent=css;document.head.appendChild(style);}};new MutationObserver(apply).observe(document,{childList:true,subtree:true});apply();})();</script>` : '';
  const head = csp + storage + applySkin;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i,m=>m+head) : head+html;
  return html + `<style>${css}</style>`;
}
