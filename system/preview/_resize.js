/* Auto-resize helper for preview iframes.
   Each preview measures its own content height and posts it to the parent
   (design-system.html), which sets the iframe's height to match.
   Listens for resize/font-load/DOM mutations so the iframe never clips.
   ---------------------------------------------------------------------- */
(() => {
  if (window.top === window) return;            // only when embedded
  const params = new URLSearchParams(location.search);
  // Parent can request light mode by adding ?theme=light to the iframe src.
  // We toggle the class on <html> at script-eval time, before paint.
  if (params.get('theme') === 'light') document.documentElement.classList.remove('dark');
  const id = params.get('id') || location.pathname.split('/').pop();
  let last = 0;
  function send() {
    const b = document.body;
    const h = Math.max(
      b.scrollHeight, b.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
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
