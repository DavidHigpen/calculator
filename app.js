// Main calculator app
(function () {
  'use strict';

  const state = {
    tokens: [],
    cursor: 0,
    angleMode: 'rad',
    inv: false,
    history: [],
    afterEquals: false,
  };

  const HISTORY_KEY = 'calc-history';
  const ANGLE_KEY = 'calc-angle';
  const SCI_KEY = 'calc-sci-expanded';

  const $ = (id) => document.getElementById(id);
  const exprEl = $('expression');
  const previewEl = $('preview');
  const angleBtn = $('angleBtn');
  const invBtn = $('invBtn');

  const historyBtn = $('historyBtn');
  const historyPanel = $('historyPanel');
  const historyList = $('historyList');
  const closeHistoryBtn = $('closeHistoryBtn');
  const clearHistoryBtn = $('clearHistoryBtn');

  const menuBtn = $('menuBtn');
  const menuPopup = $('menuPopup');
  const settingsPanel = $('settingsPanel');
  const closeSettingsBtn = $('closeSettingsBtn');
  const themeGrid = $('themeGrid');
  const customColorsEl = $('customColors');
  const resetCustomBtn = $('resetCustomBtn');

  const chevronBtn = $('chevronBtn');
  const sciGrid = $('sciGrid');

  const calcView = $('calcView');
  const converterView = $('converterView');
  const convBackBtn = $('convBackBtn');
  const backdrop = $('backdrop');

  // ============ Persisted state ============
  try { state.history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (e) { state.history = []; }
  state.angleMode = localStorage.getItem(ANGLE_KEY) || 'rad';

  // ============ Operators and tokens ============
  const BINARY_OPS = ['+', '−', '×', '÷'];
  function isBinaryOp(t) { return BINARY_OPS.includes(t); }
  function isTrailingUnfinished(t) {
    return ['+', '−', '×', '÷', '^', '.', 'E'].includes(t);
  }

  // ============ Insert / delete ============
  function insertTokens(toks) {
    if (!toks.length) return;

    // After-equals: digit starts fresh; operator continues from result
    if (state.afterEquals) {
      const first = toks[0];
      if (first && (isBinaryOp(first) || first === '^' || first === '%' || first === '!' || first === '²' || first === '³' || first === '⁻¹')) {
        state.afterEquals = false;
      } else {
        state.tokens = [];
        state.cursor = 0;
        state.afterEquals = false;
      }
    }

    // Smart operator replacement
    if (toks.length === 1 && isBinaryOp(toks[0]) && state.cursor === state.tokens.length && state.tokens.length > 0) {
      const last = state.tokens[state.tokens.length - 1];
      if (isBinaryOp(last)) {
        // Allow unary minus after × or ÷
        if (toks[0] === '−' && (last === '×' || last === '÷')) {
          // append
        } else {
          state.tokens[state.tokens.length - 1] = toks[0];
          render();
          return;
        }
      }
    }

    state.tokens.splice(state.cursor, 0, ...toks);
    state.cursor += toks.length;
    render();
  }

  function deleteToken() {
    if (state.afterEquals) {
      state.tokens = [];
      state.cursor = 0;
      state.afterEquals = false;
      render();
      return;
    }
    if (state.cursor === 0) return;
    state.tokens.splice(state.cursor - 1, 1);
    state.cursor--;
    render();
  }

  function clearAll() {
    state.tokens = [];
    state.cursor = 0;
    state.afterEquals = false;
    render();
  }

  // ============ Evaluator ============
  const funcs = {
    PI: Math.PI, E: Math.E,
    sqrt: Math.sqrt, cbrt: Math.cbrt,
    ln: Math.log, log: Math.log10,
    sin: (x) => state.angleMode === 'deg' ? Math.sin(x * Math.PI / 180) : Math.sin(x),
    cos: (x) => state.angleMode === 'deg' ? Math.cos(x * Math.PI / 180) : Math.cos(x),
    tan: (x) => state.angleMode === 'deg' ? Math.tan(x * Math.PI / 180) : Math.tan(x),
    asin: (x) => state.angleMode === 'deg' ? Math.asin(x) * 180 / Math.PI : Math.asin(x),
    acos: (x) => state.angleMode === 'deg' ? Math.acos(x) * 180 / Math.PI : Math.acos(x),
    atan: (x) => state.angleMode === 'deg' ? Math.atan(x) * 180 / Math.PI : Math.atan(x),
    fact: (n) => {
      if (!isFinite(n) || n < 0 || n !== Math.floor(n) || n > 170) return NaN;
      let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
    },
  };

  function findAtomStart(s, pos) {
    if (pos === 0) return 0;
    let i = pos - 1;
    if (s[i] === ')') {
      let depth = 1; i--;
      while (i >= 0 && depth > 0) {
        if (s[i] === ')') depth++;
        else if (s[i] === '(') { depth--; if (depth === 0) break; }
        i--;
      }
      let j = i - 1;
      while (j >= 0 && /[A-Za-z0-9_.]/.test(s[j])) j--;
      return j + 1;
    } else if (/[A-Za-z0-9_.]/.test(s[i])) {
      while (i >= 0 && /[A-Za-z0-9_.]/.test(s[i])) i--;
      return i + 1;
    }
    return pos;
  }

  function applyPostfix(s, sym, wrap) {
    while (true) {
      const idx = s.indexOf(sym);
      if (idx < 0) break;
      const start = findAtomStart(s, idx);
      const atom = s.substring(start, idx);
      if (!atom) {
        s = s.substring(0, idx) + s.substring(idx + sym.length);
        continue;
      }
      s = s.substring(0, start) + wrap(atom) + s.substring(idx + sym.length);
    }
    return s;
  }

  function tokensToJs(tokens) {
    let s = tokens.join('');
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
         .replace(/√\(/g, 'sqrt(').replace(/∛\(/g, 'cbrt(')
         .replace(/\^/g, '**').replace(/%/g, '/100');
    s = s.replace(/π/g, '(PI)');
    s = s.replace(/(?<![A-Za-z])e(?![A-Za-z])/g, '(E)');
    s = s.replace(/(\d|\))(?=\(|[a-z])/g, '$1*');
    s = applyPostfix(s, '²', (a) => '((' + a + ')**2)');
    s = applyPostfix(s, '³', (a) => '((' + a + ')**3)');
    s = applyPostfix(s, '⁻¹', (a) => '((' + a + ')**(-1))');
    s = applyPostfix(s, '!', (a) => 'fact(' + a + ')');
    return s;
  }

  function evaluate(tokens) {
    if (!tokens.length) return null;
    const expr = tokensToJs(tokens);
    const names = Object.keys(funcs);
    const vals = names.map((k) => funcs[k]);
    const fn = new Function(...names, 'return (' + expr + ');');
    const r = fn(...vals);
    if (typeof r !== 'number') throw new Error('non-numeric');
    return r;
  }

  function addThousands(s) {
    const neg = s.startsWith('-');
    if (neg) s = s.slice(1);
    const [a, b] = s.split('.');
    const grouped = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + grouped + (b !== undefined ? '.' + b : '');
  }

  function formatResult(n) {
    if (n == null) return '';
    if (!isFinite(n)) return 'Error';
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e13 || abs < 1e-6) {
      let s = n.toExponential(8).replace(/\.?0+e/, 'e');
      s = s.replace('e+', 'E').replace('e-', 'E−').replace('e', 'E');
      return s;
    }
    let s = n.toPrecision(12);
    if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
    return addThousands(s);
  }

  function tryPreview() {
    if (!state.tokens.length) return '';
    let trimmed = state.tokens.slice();
    while (trimmed.length && isTrailingUnfinished(trimmed[trimmed.length - 1])) trimmed.pop();
    if (!trimmed.length) return '';
    let open = 0, close = 0;
    for (const t of trimmed) {
      if (t.endsWith('(')) open++;
      else if (t === ')') close++;
    }
    for (let i = 0; i < open - close; i++) trimmed.push(')');
    try {
      const r = evaluate(trimmed);
      if (r == null || !isFinite(r)) return '';
      const resStr = formatResult(r);
      const display = state.tokens.join('');
      if (display === resStr || display === resStr.replace(/,/g, '')) return '';
      return resStr;
    } catch (e) { return ''; }
  }

  // ============ Rendering ============
  function render() {
    exprEl.innerHTML = '';
    for (let i = 0; i < state.tokens.length; i++) {
      const span = document.createElement('span');
      span.className = 'tok';
      span.dataset.idx = String(i);
      span.textContent = state.tokens[i];
      exprEl.appendChild(span);
    }
    const caret = document.createElement('span');
    caret.className = 'caret';
    exprEl.appendChild(caret);

    positionCaret();

    previewEl.textContent = tryPreview();
    if (angleBtn) angleBtn.textContent = state.angleMode === 'deg' ? 'Rad' : 'Deg';
  }

  function positionCaret() {
    const caret = exprEl.querySelector('.caret');
    if (!caret) return;
    const toks = exprEl.querySelectorAll('.tok');
    let left;
    if (toks.length === 0) {
      left = exprEl.clientWidth - 2;
    } else if (state.cursor <= 0) {
      left = toks[0].offsetLeft;
    } else if (state.cursor >= toks.length) {
      const t = toks[toks.length - 1];
      left = t.offsetLeft + t.offsetWidth;
    } else {
      left = toks[state.cursor].offsetLeft;
    }
    caret.style.left = left + 'px';

    // Scroll into view
    requestAnimationFrame(() => {
      const row = exprEl.parentElement;
      if (!row) return;
      const caretRect = caret.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (caretRect.right > rowRect.right - 8) {
        row.scrollLeft += caretRect.right - rowRect.right + 20;
      } else if (caretRect.left < rowRect.left + 8) {
        row.scrollLeft -= rowRect.left + 20 - caretRect.left;
      }
    });
  }

  // Tap on expression to move caret
  exprEl.addEventListener('click', (e) => {
    const target = e.target.closest('.tok');
    if (!target) {
      state.cursor = state.tokens.length;
    } else {
      const idx = parseInt(target.dataset.idx, 10);
      const rect = target.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      state.cursor = e.clientX < mid ? idx : idx + 1;
    }
    // Caret-only re-position: don't rebuild tokens, avoids any shift
    positionCaret();
  });

  // ============ Actions ============
  function doEquals() {
    if (!state.tokens.length) return;
    let trimmed = state.tokens.slice();
    while (trimmed.length && isTrailingUnfinished(trimmed[trimmed.length - 1])) trimmed.pop();
    if (!trimmed.length) return;
    let open = 0, close = 0;
    for (const t of trimmed) {
      if (t.endsWith('(')) open++;
      else if (t === ')') close++;
    }
    for (let i = 0; i < open - close; i++) trimmed.push(')');
    try {
      const r = evaluate(trimmed);
      if (r == null || !isFinite(r)) {
        previewEl.textContent = 'Error';
        return;
      }
      const exprStr = state.tokens.join('');
      const resStr = formatResult(r);
      state.history.unshift({ expr: exprStr, result: resStr, raw: r });
      if (state.history.length > 200) state.history.pop();
      saveHistory();
      renderHistory();
      state.tokens = resStr.split('');
      state.cursor = state.tokens.length;
      state.afterEquals = true;
      render();
    } catch (e) {
      previewEl.textContent = 'Error';
    }
  }

  function doParen() {
    // Count unmatched open parens up to cursor
    let open = 0;
    for (let i = 0; i < state.cursor; i++) {
      const t = state.tokens[i];
      if (t && t.endsWith('(')) open++;
      else if (t === ')') open--;
    }
    const prev = state.tokens[state.cursor - 1];
    const canClose = open > 0 && prev && /[0-9)]/.test(prev);
    insertTokens([canClose ? ')' : '(']);
  }

  function handleAction(action) {
    switch (action) {
      case 'back': deleteToken(); break;
      case 'clear': clearAll(); break;
      case 'equals': doEquals(); break;
      case 'paren': doParen(); break;
      case 'angle':
        state.angleMode = state.angleMode === 'deg' ? 'rad' : 'deg';
        localStorage.setItem(ANGLE_KEY, state.angleMode);
        render();
        break;
      case 'inv':
        state.inv = !state.inv;
        updateInvSwaps();
        break;
    }
  }

  // ============ Buttons ============
  function wireButtons() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('inv-swap')) {
          const spec = state.inv ? JSON.parse(btn.dataset.secondary) : JSON.parse(btn.dataset.primary);
          insertTokens([spec.insert]);
          return;
        }
        if (btn.dataset.action) { handleAction(btn.dataset.action); return; }
        if (btn.dataset.insert) { insertTokens([btn.dataset.insert]); }
      });
    });
    // Press-hold visual state for all pressable things
    document.querySelectorAll('.btn, .icon-btn, .text-btn, .chevron-btn, .conv-swap, .menu-item, .history-item').forEach(attachPressState);
  }

  function attachPressState(el) {
    const on = () => el.classList.add('pressed');
    const off = () => el.classList.remove('pressed');
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }

  function updateInvSwaps() {
    document.querySelectorAll('.inv-swap').forEach((btn) => {
      const spec = state.inv ? JSON.parse(btn.dataset.secondary) : JSON.parse(btn.dataset.primary);
      btn.textContent = spec.label;
    });
    if (invBtn) invBtn.classList.toggle('inv-active', state.inv);
  }

  // ============ Chevron scientific toggle ============
  function initChevron() {
    const expanded = localStorage.getItem(SCI_KEY) === '1';
    if (expanded) {
      sciGrid.classList.add('expanded');
      chevronBtn.classList.add('expanded');
    }
    chevronBtn.addEventListener('click', () => {
      const now = sciGrid.classList.toggle('expanded');
      chevronBtn.classList.toggle('expanded', now);
      localStorage.setItem(SCI_KEY, now ? '1' : '0');
    });
  }

  // ============ History ============
  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)); } catch (e) {}
  }
  function renderHistory() {
    historyList.innerHTML = '';
    if (!state.history.length) {
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.textContent = 'No history yet';
      historyList.appendChild(empty);
      return;
    }
    for (const item of state.history) {
      const row = document.createElement('div');
      row.className = 'history-item';
      const e = document.createElement('div');
      e.className = 'hist-expr';
      e.textContent = item.expr;
      const r = document.createElement('div');
      r.className = 'hist-result';
      r.textContent = '= ' + item.result;
      row.appendChild(e);
      row.appendChild(r);
      row.addEventListener('click', () => {
        const s = formatResult(item.raw).replace(/,/g, '').replace(/−/g, '−');
        if (state.afterEquals) {
          state.cursor = state.tokens.length;
          state.afterEquals = false;
        }
        state.tokens.splice(state.cursor, 0, ...s.split(''));
        state.cursor += s.length;
        render();
        closePanels();
      });
      attachPressState(row);
      historyList.appendChild(row);
    }
  }

  function openHistory() {
    historyPanel.classList.add('open');
    historyPanel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('show');
    renderHistory();
  }
  function openSettings() {
    settingsPanel.classList.add('open');
    settingsPanel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('show');
    renderSettings();
  }
  function openConverter() {
    calcView.classList.remove('active');
    converterView.classList.add('active');
  }
  function closeConverter() {
    converterView.classList.remove('active');
    calcView.classList.add('active');
  }
  function closePanels() {
    historyPanel.classList.remove('open');
    historyPanel.setAttribute('aria-hidden', 'true');
    settingsPanel.classList.remove('open');
    settingsPanel.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('show');
  }

  historyBtn.addEventListener('click', openHistory);
  closeHistoryBtn.addEventListener('click', closePanels);
  clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    saveHistory();
    renderHistory();
  });
  closeSettingsBtn.addEventListener('click', closePanels);
  backdrop.addEventListener('click', () => { closePanels(); closeMenu(); });
  convBackBtn.addEventListener('click', closeConverter);

  // ============ Menu popup ============
  function openMenu() { menuPopup.classList.add('show'); menuPopup.setAttribute('aria-hidden', 'false'); }
  function closeMenu() { menuPopup.classList.remove('show'); menuPopup.setAttribute('aria-hidden', 'true'); }
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPopup.classList.contains('show') ? closeMenu() : openMenu();
  });
  document.addEventListener('click', (e) => {
    if (!menuPopup.contains(e.target) && e.target !== menuBtn) closeMenu();
  });
  menuPopup.addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    closeMenu();
    const kind = item.dataset.menu;
    if (kind === 'converter') openConverter();
    else if (kind === 'settings') openSettings();
  });

  // ============ Settings UI ============
  function renderSettings() {
    themeGrid.innerHTML = '';
    const activeId = window.Themes.getSavedThemeId();
    for (const [id, theme] of Object.entries(window.Themes.THEMES)) {
      const tile = document.createElement('button');
      tile.className = 'theme-tile' + (id === activeId ? ' active' : '');
      const preview = document.createElement('div');
      preview.className = 'theme-preview';
      const swatches = ['--bg', '--btn-bg', '--btn-filled', '--accent'];
      for (const key of swatches) {
        const sw = document.createElement('span');
        sw.style.background = theme.vars[key];
        preview.appendChild(sw);
      }
      const name = document.createElement('div');
      name.textContent = theme.name;
      tile.appendChild(preview);
      tile.appendChild(name);
      tile.addEventListener('click', () => {
        window.Themes.saveTheme(id);
        window.Themes.saveCustom({});
        window.Themes.applyTheme(id, {});
        renderSettings();
      });
      attachPressState(tile);
      themeGrid.appendChild(tile);
    }

    customColorsEl.innerHTML = '';
    const current = window.Themes.getSavedCustom();
    const base = window.Themes.THEMES[activeId].vars;
    for (const { key, label } of window.Themes.COLOR_KEYS) {
      const wrap = document.createElement('label');
      wrap.className = 'color-field';
      const lab = document.createElement('span');
      lab.textContent = label;
      const input = document.createElement('input');
      input.type = 'color';
      input.value = toHex(current[key] || base[key]);
      input.addEventListener('input', () => {
        const overrides = window.Themes.getSavedCustom();
        overrides[key] = input.value;
        window.Themes.saveCustom(overrides);
        window.Themes.applyTheme(activeId, overrides);
      });
      wrap.appendChild(lab);
      wrap.appendChild(input);
      customColorsEl.appendChild(wrap);
    }
  }

  function toHex(c) {
    if (!c) return '#000000';
    c = c.trim();
    if (c.startsWith('#')) {
      if (c.length === 4) return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      return c.slice(0, 7);
    }
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(',').map((v) => parseInt(v.trim(), 10));
      return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    return '#000000';
  }

  resetCustomBtn.addEventListener('click', () => {
    window.Themes.saveCustom({});
    window.Themes.applyTheme(window.Themes.getSavedThemeId(), {});
    renderSettings();
  });

  // ============ Keyboard support ============
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { insertTokens([k]); e.preventDefault(); return; }
    if (k === '.') { insertTokens(['.']); e.preventDefault(); return; }
    if (k === '+') { insertTokens(['+']); e.preventDefault(); return; }
    if (k === '-') { insertTokens(['−']); e.preventDefault(); return; }
    if (k === '*') { insertTokens(['×']); e.preventDefault(); return; }
    if (k === '/') { insertTokens(['÷']); e.preventDefault(); return; }
    if (k === '(' || k === ')') { doParen(); e.preventDefault(); return; }
    if (k === '%') { insertTokens(['%']); e.preventDefault(); return; }
    if (k === '^') { insertTokens(['^']); e.preventDefault(); return; }
    if (k === 'Enter' || k === '=') { doEquals(); e.preventDefault(); return; }
    if (k === 'Backspace') { deleteToken(); e.preventDefault(); return; }
    if (k === 'Delete') { clearAll(); e.preventDefault(); return; }
    if (k === 'ArrowLeft') { if (state.cursor > 0) state.cursor--; positionCaret(); e.preventDefault(); return; }
    if (k === 'ArrowRight') { if (state.cursor < state.tokens.length) state.cursor++; positionCaret(); e.preventDefault(); return; }
    if (k === 'Home') { state.cursor = 0; positionCaret(); e.preventDefault(); return; }
    if (k === 'End') { state.cursor = state.tokens.length; positionCaret(); e.preventDefault(); return; }
  });

  // ============ Zoom lock on iOS Safari ============
  // Block pinch-zoom; double-tap zoom is handled by CSS touch-action: manipulation.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // ============ Boot ============
  wireButtons();
  initChevron();
  updateInvSwaps();
  render();
  renderHistory();
  if (window.Units) window.Units.init();
})();
