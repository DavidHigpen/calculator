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
    'maroon': {
      name: 'Aggie Maroon',
      vars: {
        '--bg': '#1a0404',
        '--text': '#ffffff',
        '--text-muted': '#d8b4b4',
        '--btn-bg': '#500000',
        '--btn-text': '#ffffff',
        '--btn-pressed': '#732020',
        '--btn-filled': '#ffffff',
        '--btn-filled-text': '#500000',
        '--btn-filled-pressed': '#e8d6d6',
        '--accent': '#ffffff',
        '--panel-bg': '#240808',
        '--panel-border': '#4a1212',
        '--preview-text': '#d8b4b4',
      },
    },
    'maroon-light': {
      name: 'Aggie Light',
      vars: {
        '--bg': '#ffffff',
        '--text': '#3c0000',
        '--text-muted': '#6e4a4a',
        '--btn-bg': '#f2e6e6',
        '--btn-text': '#500000',
        '--btn-pressed': '#e2cccc',
        '--btn-filled': '#500000',
        '--btn-filled-text': '#ffffff',
        '--btn-filled-pressed': '#6e1414',
        '--accent': '#500000',
        '--panel-bg': '#faf5f5',
        '--panel-border': '#e8d8d8',
        '--preview-text': '#6e4a4a',
      },
    },
    'amethyst': {
      name: 'Amethyst',
      vars: {
        '--bg': '#120b20',
        '--text': '#f3edff',
        '--text-muted': '#b9a9dc',
        '--btn-bg': '#271a44',
        '--btn-text': '#f3edff',
        '--btn-pressed': '#3d2b66',
        '--btn-filled': '#b794ff',
        '--btn-filled-text': '#170d2e',
        '--btn-filled-pressed': '#cdb3ff',
        '--accent': '#b794ff',
        '--panel-bg': '#1a1130',
        '--panel-border': '#33245a',
        '--preview-text': '#b9a9dc',
      },
    },
    'lavender': {
      name: 'Lavender',
      vars: {
        '--bg': '#f7f4ff',
        '--text': '#2a1650',
        '--text-muted': '#5f5383',
        '--btn-bg': '#e9e2fb',
        '--btn-text': '#2a1650',
        '--btn-pressed': '#d6caf5',
        '--btn-filled': '#6236c9',
        '--btn-filled-text': '#ffffff',
        '--btn-filled-pressed': '#7a50dc',
        '--accent': '#6236c9',
        '--panel-bg': '#ffffff',
        '--panel-border': '#e0d8f5',
        '--preview-text': '#5f5383',
      },
    },
    'synthwave': {
      name: 'Synthwave',
      vars: {
        '--bg': '#0f0a1e',
        '--text': '#fdf0ff',
        '--text-muted': '#c9a4e0',
        '--btn-bg': '#24163d',
        '--btn-text': '#fdf0ff',
        '--btn-pressed': '#3a2560',
        '--btn-filled': '#ff4fa8',
        '--btn-filled-text': '#14051c',
        '--btn-filled-pressed': '#ff7cbf',
        '--accent': '#2de2e6',
        '--panel-bg': '#170f2b',
        '--panel-border': '#33204f',
        '--preview-text': '#2de2e6',
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
    'aurora': {
      name: 'Aurora',
      vars: {
        '--bg': '#061a1c',
        '--text': '#dcfbf7',
        '--text-muted': '#86bdb6',
        '--btn-bg': '#0f2e31',
        '--btn-text': '#dcfbf7',
        '--btn-pressed': '#1c4a4e',
        '--btn-filled': '#2ee6c5',
        '--btn-filled-text': '#03201b',
        '--btn-filled-pressed': '#62f0d6',
        '--accent': '#2ee6c5',
        '--panel-bg': '#0b2326',
        '--panel-border': '#1c3d40',
        '--preview-text': '#86bdb6',
      },
    },
    'glacier': {
      name: 'Glacier',
      vars: {
        '--bg': '#eef4f9',
        '--text': '#0e2233',
        '--text-muted': '#4b6175',
        '--btn-bg': '#dbe7f1',
        '--btn-text': '#0e2233',
        '--btn-pressed': '#c3d6e6',
        '--btn-filled': '#1d5f99',
        '--btn-filled-text': '#ffffff',
        '--btn-filled-pressed': '#2a73b3',
        '--accent': '#1d5f99',
        '--panel-bg': '#ffffff',
        '--panel-border': '#d3e0eb',
        '--preview-text': '#4b6175',
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
    'espresso': {
      name: 'Espresso',
      vars: {
        '--bg': '#17110d',
        '--text': '#f5e9dc',
        '--text-muted': '#bfa78f',
        '--btn-bg': '#2c211a',
        '--btn-text': '#f5e9dc',
        '--btn-pressed': '#45352a',
        '--btn-filled': '#d9a066',
        '--btn-filled-text': '#1d140d',
        '--btn-filled-pressed': '#e8b884',
        '--accent': '#d9a066',
        '--panel-bg': '#201812',
        '--panel-border': '#3a2d24',
        '--preview-text': '#bfa78f',
      },
    },
    'rose': {
      name: 'Rosé',
      vars: {
        '--bg': '#fff5f7',
        '--text': '#4a1027',
        '--text-muted': '#7a4a5c',
        '--btn-bg': '#fbe1e8',
        '--btn-text': '#4a1027',
        '--btn-pressed': '#f4c7d4',
        '--btn-filled': '#c2185b',
        '--btn-filled-text': '#ffffff',
        '--btn-filled-pressed': '#a3134b',
        '--accent': '#c2185b',
        '--panel-bg': '#ffffff',
        '--panel-border': '#f3d3dd',
        '--preview-text': '#7a4a5c',
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
