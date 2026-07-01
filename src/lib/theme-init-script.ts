// Plain data (no JSX/React) so this can be imported both by the client
// component that injects it (ThemeProvider) and by next.config.ts, which
// hashes it to pin an exact CSP script-src source instead of 'unsafe-inline'.
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;
