// Theme definitions and management
(function () {
  const THEMES = {
    'noir': {
      name: 'Noir',
      vars: {
        '--bg': '#000000',
        '--text': '#f1f1f1',
        '--text-muted': '#a0a0a0',
        '--btn-bg': '#2e2e30',
        '--btn-text': '#f1f1f1',
        '--btn-pressed': '#4a4a4c',
        '--btn-filled': '#e9e9ea',
        '--btn-filled-text': '#0b0b0d',
        '--btn-filled-pressed': '#ffffff',
        '--accent': '#e9e9ea',
        '--panel-bg': '#0e0e0f',
        '--panel-border': '#26262a',
        '--preview-text': '#a0a0a0',
      },
    },
    'graphite': {
      name: 'Graphite',
      vars: {
        '--bg': '#141418',
        '--text': '#eaeaef',
        '--text-muted': '#9ea0a6',
        '--btn-bg': '#2a2d33',
        '--btn-text': '#eaeaef',
        '--btn-pressed': '#44474d',
        '--btn-filled': '#dde0e5',
        '--btn-filled-text': '#141418',
        '--btn-filled-pressed': '#f5f6fa',
        '--accent': '#9fb4ff',
        '--panel-bg': '#1a1c20',
        '--panel-border': '#2a2d33',
        '--preview-text': '#9ea0a6',
      },
    },
    'daylight': {
      name: 'Daylight',
      vars: {
        '--bg': '#f6f6f8',
        '--text': '#111115',
        '--text-muted': '#60636b',
        '--btn-bg': '#e4e5ea',
        '--btn-text': '#111115',
        '--btn-pressed': '#cfd1d8',
        '--btn-filled': '#111115',
        '--btn-filled-text': '#ffffff',
        '--btn-filled-pressed': '#2a2a30',
        '--accent': '#111115',
        '--panel-bg': '#ffffff',
        '--panel-border': '#e0e0e5',
        '--preview-text': '#60636b',
      },
    },
    'ocean': {
      name: 'Ocean',
      vars: {
        '--bg': '#0a1726',
        '--text': '#e3f0ff',
        '--text-muted': '#7fa0c0',
        '--btn-bg': '#15253a',
        '--btn-text': '#e3f0ff',
        '--btn-pressed': '#223a56',
        '--btn-filled': '#5aa5ff',
        '--btn-filled-text': '#06111c',
        '--btn-filled-pressed': '#7fbfff',
        '--accent': '#5aa5ff',
        '--panel-bg': '#122238',
        '--panel-border': '#223a56',
        '--preview-text': '#7fa0c0',
      },
    },
    'sunset': {
      name: 'Sunset',
      vars: {
        '--bg': '#1a0e12',
        '--text': '#ffecd8',
        '--text-muted': '#c3987f',
        '--btn-bg': '#2c1a1f',
        '--btn-text': '#ffecd8',
        '--btn-pressed': '#4a2e35',
        '--btn-filled': '#ff914d',
        '--btn-filled-text': '#1a0e12',
        '--btn-filled-pressed': '#ffb17a',
        '--accent': '#ff914d',
        '--panel-bg': '#241318',
        '--panel-border': '#3a2229',
        '--preview-text': '#c3987f',
      },
    },
    'forest': {
      name: 'Forest',
      vars: {
        '--bg': '#0a1a12',
        '--text': '#dff5e5',
        '--text-muted': '#7fa88f',
        '--btn-bg': '#172b20',
        '--btn-text': '#dff5e5',
        '--btn-pressed': '#294a37',
        '--btn-filled': '#4fd38a',
        '--btn-filled-text': '#0a1a12',
        '--btn-filled-pressed': '#6ee6a0',
        '--accent': '#4fd38a',
        '--panel-bg': '#132418',
        '--panel-border': '#223a2b',
        '--preview-text': '#7fa88f',
      },
    },
  };

  const COLOR_KEYS = [
    { key: '--bg', label: 'Background' },
    { key: '--text', label: 'Text' },
    { key: '--btn-bg', label: 'Button' },
    { key: '--btn-pressed', label: 'Button pressed' },
    { key: '--btn-filled', label: 'Filled button' },
    { key: '--btn-filled-text', label: 'Filled text' },
    { key: '--preview-text', label: 'Preview text' },
    { key: '--accent', label: 'Accent' },
  ];

  const STORAGE_KEY = 'calc-theme';
  const CUSTOM_KEY = 'calc-custom-colors';

  function applyVars(vars) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
    const bg = vars['--bg'];
    if (bg) {
      const meta = document.getElementById('themeColorMeta');
      if (meta) meta.setAttribute('content', bg);
    }
  }

  function applyTheme(themeId, overrides) {
    const theme = THEMES[themeId] || THEMES['noir'];
    const merged = { ...theme.vars, ...(overrides || {}) };
    applyVars(merged);
  }

  function getSavedThemeId() {
    const id = localStorage.getItem(STORAGE_KEY) || 'noir';
    return THEMES[id] ? id : 'noir';
  }
  function getSavedCustom() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveTheme(id) { localStorage.setItem(STORAGE_KEY, id); }
  function saveCustom(overrides) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(overrides || {})); }

  applyTheme(getSavedThemeId(), getSavedCustom());

  window.Themes = { THEMES, COLOR_KEYS, applyTheme, getSavedThemeId, getSavedCustom, saveTheme, saveCustom };
})();
