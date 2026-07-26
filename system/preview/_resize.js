/* Auto-resize helper for preview iframes.
   Each preview measures its own content height and posts it to the parent
   (design-system.html), which sets the iframe's height to match.
   Listens for resize/font-load/DOM mutations so the iframe never clips.
   ---------------------------------------------------------------------- */
(() => {
  if (window.top === window) return;            // only when embedded
  const params = new URLSearchParams(location.search);
  // Initial theme — applied at script-eval time, before paint.
  // The parent can also flip the theme at runtime via postMessage:
  //   { type: '__theme', theme: 'light' | 'dark' }
  // Same DOM, same components — only the .dark class on <html> changes.
  function applyTheme(t) {
    if (t === 'light') document.documentElement.classList.remove('dark');
    else                document.documentElement.classList.add('dark');
  }
  // The bootstrap in <head> already resolved theme from lock / localStorage /
  // URL. Re-apply ONLY the URL override here, and ONLY if not locked, so a
  // URL theme param can't override <html data-theme-lock>.
  if (!document.documentElement.getAttribute('data-theme-lock')) {
    if      (params.get('theme') === 'light') applyTheme('light');
    else if (params.get('theme') === 'dark')  applyTheme('dark');
  }
  const id = params.get('id') || location.pathname.split('/').pop();

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (d && d.type === '__theme') {
      // Files marked <html data-theme-lock="..."> are fixed-mode product
      // mockups (e.g. the dark-only TV surfaces) and ignore parent broadcasts.
      if (document.documentElement.getAttribute('data-theme-lock')) return;
      applyTheme(d.theme === 'light' ? 'light' : 'dark');
    }
  });
  // Tell the parent we're alive so it can push the current theme.
  try { parent.postMessage({ type: '__preview_ready', id }, '*'); } catch {}
  let last = 0;
  function send() {
    const b = document.body;
    if (!b) return;
    // Use body's own content height, not documentElement — the html element
    // grows to fill the iframe's viewport, which would lock us at the parent's
    // CSS default and never shrink.
    const h = Math.max(b.scrollHeight, b.offsetHeight);
    if (h <= 0) return;
    if (Math.abs(h - last) < 2) return;
    last = h;
    try { parent.postMessage({ type: '__preview_h', id, h }, '*'); } catch {}
  }
  const ro = new ResizeObserver(send);
  document.addEventListener('DOMContentLoaded', () => ro.observe(document.body));
  if (document.readyState !== 'loading') ro.observe(document.body);
  window.addEventListener('load', send);
  document.fonts && document.fonts.ready.then(send);
  setTimeout(send, 100);
  setTimeout(send, 600);
  setTimeout(send, 1500);
})();
