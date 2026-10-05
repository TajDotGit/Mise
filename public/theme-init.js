// Applies the saved theme before first paint to avoid a light flash in dark mode.
// Kept as an external file (not inline) so a strict Content-Security-Policy works.
(function () {
  var pref = 'system';
  try {
    pref = localStorage.getItem('mise.theme') || 'system';
  } catch (e) {
    /* storage unavailable: fall back to system */
  }
  var dark = pref === 'dark' || (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
