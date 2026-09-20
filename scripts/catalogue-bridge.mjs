export function connectCatalogue(html) {
  if (html.includes('id="nyx-studio-bridge"')) return html;
  const bridge = `<script id="nyx-studio-bridge">
if (window.parent !== window) {
  let receiving = false;
  const originalUpdate = update;
  update = function () {
    originalUpdate();
    if (!receiving) window.parent.postMessage({type:'nyx-functions-changed', features:[...selected]}, window.location.origin);
  };
  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'nyx-functions-set' || !Array.isArray(event.data.features)) return;
    if (event.data.features.some(id => !valid.has(id))) return;
    receiving = true;
    selected = new Set(event.data.features);
    renderFeatures(); update();
    receiving = false;
  });
}
</script>`;
  return html.replace(/<\/html>\s*$/i, bridge + '\n</html>');
}
