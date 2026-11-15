// Runs before the first paint, so the page never flashes the wrong theme while
// React loads. Mirrors src/shared/theme/theme.ts (same storage key, same default).
(function () {
  var theme = 'dark';
  try {
    var stored = window.localStorage.getItem('victvs-theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (error) {
    // Storage blocked: keep the default.
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
