// Adaptation of gestok's MIT-licensed Glassmorphism Dashboard to Nyx's live DOM.
// Original geometry/tints: vendor/codepen/YzLBVOp/original.css. No demo data/JS.
export const DRESSINGS=['nyx','glass-dashboard','noteplan-style-v2'];
export const GLASS_VIDEO='https://user-images.githubusercontent.com/30212452/203724691-9e93bf50-df02-4034-9743-dfe32d18bf58.mp4';
export function dressingCSS(dressing,settings={},theme){
 if(dressing==='noteplan-style-v2')return `
 body{background:#f4f5f7!important;color:#202124!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif!important}
 .nyx-shell{grid-template-columns:205px minmax(0,1fr)!important;grid-template-rows:42px 30px minmax(0,1fr)!important;background:#fff!important;color:#202124!important;border:1px solid #dfe1e5!important;border-radius:6px!important;box-shadow:0 8px 28px #1f293714!important;overflow:hidden}
 .nyx-shell[data-sidebar-collapsed=true]{grid-template-columns:0 minmax(0,1fr)!important}
 .nyx-toolbar{background:#fff!important;border-color:#e4e6e9!important;padding:0 12px!important;min-height:42px!important}.nyx-toolbar [data-nyx-product]{font-size:14px!important;font-weight:650!important;letter-spacing:-.01em!important}
 .nyx-tabs{background:#fafafa!important;border-color:#e4e6e9!important;min-height:30px!important}.nyx-tabs button{font-size:11px!important}
 .nyx-sidebar{width:205px!important;background:#f5f5f6!important;border-color:#dfe1e5!important;padding:8px!important}.nyx-shell[data-sidebar-collapsed=true] .nyx-sidebar{width:0!important;padding:0!important;border:0!important}
 #nyx-documents-slot,#nyx-registry-slot,#nyx-blocks-slot{background:#eef0f2!important;padding:8px!important}
 #nd{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif!important}#nd .bar,#nd footer{background:#fff!important;border-color:#dedfe2!important}#nd aside{background:#f6f6f7!important}#nd .content,#nd .workspace{background:#eceef0!important}
 #nd .pane{background:#fff!important;border:1px solid #d9dadd!important;border-radius:5px!important;box-shadow:0 1px 3px #00000010!important}#nd .head,#nd .tabs,#nd .properties{background:#fafafa!important;border-color:#e3e4e7!important}#nd textarea{background:#fff!important;line-height:1.55!important;padding:14px!important}
 #nd button,#nd input,#nd select,#nyx-block-root button,#nyx-block-root input,#nyx-block-root textarea{border-radius:4px!important;border-color:#d5d7db!important;background:#fff!important;color:#202124!important}
 #nyx-block-root{background:#eef0f2!important;color:#202124!important;padding:8px!important}#nyx-block-root section,#nyx-block-root article{background:#fff!important;border-color:#d9dadd!important;border-radius:5px!important;box-shadow:none!important}
 body[data-nyx-registry]{--bg:#eef0f2!important;--panel:#fff!important;--ink:#202124!important;--muted:#697078!important;--soft:#f6f6f7!important;--line:#d9dadd!important}body[data-nyx-registry] header,body[data-nyx-registry] aside,body[data-nyx-registry] .right{background:#fff!important}body[data-nyx-registry] .card,body[data-nyx-registry] .item{background:#fff!important;border-color:#d9dadd!important;border-radius:5px!important}
 @media(max-width:700px){.nyx-shell{grid-template-columns:52px minmax(0,1fr)!important;grid-template-rows:42px 30px minmax(0,1fr)!important}.nyx-sidebar{width:52px!important}#nyx-documents-slot,#nyx-registry-slot,#nyx-blocks-slot{padding:4px!important}}
 `;
 if(dressing!=='glass-dashboard')return '';
 const blur=Number.isFinite(settings.blur)?Math.max(0,Math.min(24,settings.blur)):16;
 let result=`
 body{background:transparent!important;color:#fefefe!important;font-family:Montserrat,system-ui,sans-serif!important}
 .nyx-shell *{box-sizing:border-box}
 *{--muted:#d3e6ee!important;--text:#fefefe!important;--ink:#fefefe!important;--ink-0:transparent!important;--ink-1:#40688260!important;--ink-2:#0004!important;--ink-3:#6998ab60!important;--ink-4:#b1d0e050!important;--bone-0:#fefefe!important;--bone-1:#fefefe!important;--bone-2:#d3e6ee!important;--bone-3:#b1d0e0!important}
 #nyx-glass-video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none}
 #dc-root{box-sizing:border-box;overflow:hidden;position:relative;z-index:1;height:100vh;display:flex;align-items:center;justify-content:center;padding:12px}
 #dc-root>div:not(.nyx-shell){width:100%;height:100%!important;min-width:0;min-height:0}.nyx-shell{box-sizing:border-box;min-height:0;position:relative;display:grid!important;grid-template-columns:220px minmax(0,1fr);grid-template-rows:60px 36px minmax(0,1fr);width:100%;max-width:1400px;height:100%!important;border:1px solid #b1d0e050;border-radius:10px;overflow:hidden;background:transparent!important;font-family:Montserrat,system-ui,sans-serif!important;color:#fefefe!important}
 .nyx-shell[data-sidebar-collapsed=true]{grid-template-columns:0 minmax(0,1fr)!important}
 .nyx-toolbar{overflow-x:auto;flex-wrap:nowrap;grid-area:1/2;height:auto!important;background:#40688260!important;backdrop-filter:blur(${blur}px);padding:0 25px!important;border-color:#b1d0e050!important}
 .nyx-toolbar [data-nyx-product]{font-size:20px!important;font-weight:700!important;color:#b1d0e0}
 .nyx-tabs{white-space:nowrap;overflow-x:auto;grid-area:2/2;background:#40688260!important;backdrop-filter:blur(${blur}px);border-color:#b1d0e050!important}
 .nyx-body{display:contents!important}.nyx-body>*:not(.nyx-sidebar){grid-area:3/2;min-width:0;min-height:0}
 .nyx-sidebar{overflow-x:hidden!important;grid-area:1/1/4/2;z-index:3;width:220px!important;height:100%;padding:12px!important;background:#40688260!important;backdrop-filter:blur(${blur}px);border-right:1px solid #b1d0e050!important;transition:width .3s ease!important}
 .nyx-shell[data-sidebar-collapsed=true] .nyx-sidebar{width:0!important;padding:0!important;border:0!important}
 .nyx-sidebar>div{width:100%!important;min-width:0}.nyx-sidebar [data-lucide]{color:#b1d0e0!important}.nyx-sidebar [data-nyx-logo]{display:block;width:36px;height:36px;object-fit:contain;border-radius:50%;margin-bottom:12px}
 #nyx-documents-slot,#nyx-registry-slot,#nyx-blocks-slot{padding:20px!important;background:#6998ab60!important;overflow:auto}
 iframe[data-nyx-registry]{background:transparent!important}
 #nd{height:100%;background:transparent!important;color:#fefefe!important;font-family:Montserrat,system-ui,sans-serif!important}
 #nd .bar,#nd footer{background:transparent!important;color:#d3e6ee!important;border-color:#b1d0e050!important}
 #nd .workspace,#nd .content,#nd aside{background:transparent!important;color:#fefefe!important}
 #nd .pane,#nyx-block-root section,.card{background:#40688290!important;backdrop-filter:blur(${blur}px);border:1px solid #b1d0e050!important;border-radius:10px!important;box-shadow:0 4px 12px #0003}
 #nd .head strong{color:#f3f8fb!important}
 #nd .head,#nd .tabs,#nd .properties{background:#b1d0e040!important;color:#d3e6ee!important;border-color:#b1d0e050!important}
 #nd textarea,#nd input,#nd button,#nd select,#nyx-block-root button,#nyx-block-root input,#nyx-block-root textarea,input,textarea,select{background:#0004!important;color:#fefefe!important;border-color:#b1d0e050!important;border-radius:10px!important}
 #nd textarea{background:transparent!important;border:0!important}#nd .empty,#nd .muted,#nd .tools{color:#d3e6ee!important}
 #nd button:hover,#nyx-block-root button:hover{background:#40688290!important}#nd button:focus-visible{outline:2px solid var(--sel-blue)}
 #nyx-block-root{background:transparent!important;color:#fefefe!important;font-family:Montserrat,system-ui,sans-serif!important;padding:0!important}#nyx-block-root article{background:#0004;border-color:#b1d0e050;border-radius:10px}
 body[data-nyx-registry]{--bg:transparent!important;--panel:#40688260!important;--ink:#fefefe!important;--muted:#d3e6ee!important;--soft:#0004!important;--line:#b1d0e050!important}
 body[data-nyx-registry] *{--bg:transparent!important;--panel:#40688260!important;--ink:#fefefe!important;--muted:#d3e6ee!important;--soft:#0004!important;--line:#b1d0e050!important}
 body[data-nyx-registry] header,body[data-nyx-registry] aside,body[data-nyx-registry] .right{background:#40688260!important;color:#fefefe!important;backdrop-filter:blur(${blur}px)}
 body[data-nyx-registry] .card,body[data-nyx-registry] .item,body[data-nyx-registry] button,body[data-nyx-registry] .badge{background:#0004!important;color:#fefefe!important;border-color:#b1d0e050!important}
 body[data-nyx-registry] .app{grid-template-columns:160px minmax(0,1fr) 280px;grid-template-rows:auto minmax(0,1fr)}
 body[data-nyx-registry] header{min-height:46px;flex-wrap:wrap;padding:8px 12px}body[data-nyx-registry] .grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
 @media(max-width:1100px){body[data-nyx-registry] .app{grid-template-columns:140px minmax(0,1fr);grid-template-rows:auto minmax(180px,1fr) minmax(100px,30%)}body[data-nyx-registry] .right{grid-column:1/3}}
 @media(max-width:600px){body[data-nyx-registry] .app{display:block;overflow:auto}body[data-nyx-registry] .nav{flex-direction:row;flex-wrap:wrap}body[data-nyx-registry] .right{max-height:240px}body[data-nyx-registry] .split{grid-template-columns:1fr}}
 #nyx-glass-video[hidden]{display:none!important}
 @media(max-width:700px){#dc-root{padding:0}.nyx-shell{height:100vh!important;border-radius:0;border:0;grid-template-columns:52px minmax(0,1fr);grid-template-rows:48px 36px minmax(0,1fr)}.nyx-toolbar{padding:0 10px!important}.nyx-toolbar [data-nyx-product]{font-size:14px!important}#nyx-documents-slot,#nyx-registry-slot,#nyx-blocks-slot{padding:8px!important}}
 @media(max-width:700px){#nd .tools,#nd .head{flex-wrap:nowrap!important;overflow-x:auto;flex-shrink:0}#nd .tools>*{white-space:nowrap;flex-shrink:0}#nd .head strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}#nd .bar{flex-wrap:nowrap!important;overflow-x:auto;flex-shrink:0}#nd .bar>*{white-space:nowrap;flex-shrink:0}#nd .pane{min-width:260px!important}#nd .workspace{overflow:auto}.nyx-toolbar>*{flex-shrink:0}.nyx-sidebar{width:52px!important;padding:10px!important}.nyx-sidebar *{font-size:0!important}.nyx-toolbar [data-nyx-product]{font-size:14px!important}}
 @media(prefers-reduced-motion:reduce){.nyx-sidebar{transition:none!important}}
 `;
 const palette=settings.palette??(theme&&theme.name!=='Nyx Blanc');
 if(palette&&theme&&['surface','background','text','muted'].every(k=>/^#[0-9a-f]{6}$/i.test(theme[k]))){
  const map={'#406882':theme.surface,'#6998ab':theme.background,'#b1d0e0':theme.muted,'#fefefe':theme.text,'#f3f8fb':theme.text,'#d3e6ee':theme.muted,'#0004':theme.text+'18'};
  result=result.replace(/#406882|#6998ab|#b1d0e0|#fefefe|#f3f8fb|#d3e6ee|#0004/g,color=>map[color]);
  result+='body{background:'+theme.background+'!important}#nyx-glass-video{opacity:.2}#nd .pane{background:'+theme.surface+'e8!important}';
 }
 return result;
}

export const GLASS_LICENSE="MIT License\n\nCopyright CodePen author gestok\nSource: https://codepen.io/gestok/pen/YzLBVOp\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n";
