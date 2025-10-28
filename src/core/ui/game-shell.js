const DEFAULT_THEME = 'sunset';
const THEMES = new Set(['sunset', 'ocean', 'forest', 'violet', 'ember', 'neon']);
const LEGACY_THEMES = {
  'theme-blue': 'ocean',
  'theme-green': 'forest',
  'theme-pink': 'violet',
  'theme-purple': 'violet',
  'theme-red': 'ember',
  'theme-orange': 'ember',
  'theme-gold': 'sunset',
  'theme-lime': 'forest'
};

function parseAspect(value, fallback) {
  if (!value) return fallback;
  if (value.includes('/')) {
    const [w, h] = value.split('/').map(Number);
    if (Number.isFinite(w) && Number.isFinite(h) && h !== 0) {
      return w / h;
    }
  }
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function collectSlot(container, slotName) {
  return container.querySelector(`[data-shell-slot="${slotName}"]`);
}

function createResizeController(viewport, canvas, aspectRatio) {
  if (!viewport || !canvas) {
    return { disconnect() {}, refresh() {} };
  }

  const computedRatio = aspectRatio || (() => {
    const w = Number(canvas.getAttribute('width'));
    const h = Number(canvas.getAttribute('height'));
    if (Number.isFinite(w) && Number.isFinite(h) && h > 0) {
      return w / h;
    }
    const rect = canvas.getBoundingClientRect();
    return rect.height > 0 ? rect.width / rect.height : 4 / 3;
  })();

  canvas.dataset.aspectRatio = computedRatio;
  canvas.style.maxWidth = '100%';
  canvas.style.maxHeight = '100%';
  canvas.style.width = 'auto';
  canvas.style.height = 'auto';

  function resize() {
    const styles = getComputedStyle(viewport);
    const paddingX = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0');
    const paddingY = parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');

    const availableWidth = Math.max(viewport.clientWidth - paddingX, 120);
    const availableHeight = Math.max(viewport.clientHeight - paddingY, 120);

    const desiredWidth = availableHeight * computedRatio;
    const desiredHeight = availableWidth / computedRatio;

    let width;
    let height;
    if (desiredWidth <= availableWidth) {
      width = desiredWidth;
      height = availableHeight;
    } else {
      width = availableWidth;
      height = desiredHeight;
    }

    canvas.style.width = `${Math.floor(width)}px`;
    canvas.style.height = `${Math.floor(height)}px`;
  }

  const observer = new ResizeObserver(() => resize());
  observer.observe(viewport);
  window.addEventListener('orientationchange', resize);
  window.addEventListener('resize', resize);
  requestAnimationFrame(resize);

  return {
    refresh: resize,
    disconnect() {
      observer.disconnect();
      window.removeEventListener('orientationchange', resize);
      window.removeEventListener('resize', resize);
    }
  };
}

function applyTheme(container, theme) {
  const chosen = THEMES.has(theme) ? theme : DEFAULT_THEME;
  container.dataset.theme = chosen;
}

function initShell(container, options = {}) {
  const root = container;
  root.classList.add('game-shell');
  root.dataset.shellReady = 'true';

  const theme = options.theme || root.dataset.theme;
  applyTheme(root, theme);

  const headerSlot = collectSlot(root, 'header');
  const hudSlot = collectSlot(root, 'hud');
  const bodySlot = collectSlot(root, 'body');
  const viewportSlot = collectSlot(root, 'viewport') || root.querySelector('[data-shell-canvas]')?.parentElement;
  const controlsSlot = collectSlot(root, 'controls');
  const footerSlot = collectSlot(root, 'footer');

  if (headerSlot) headerSlot.classList.add('game-shell__header');
  if (hudSlot) hudSlot.classList.add('game-shell__hud');

  if (bodySlot) {
    bodySlot.classList.add('game-shell__body');
  } else {
    const createdBody = document.createElement('div');
    createdBody.className = 'game-shell__body';
    const viewportCandidate = viewportSlot ?? collectSlot(root, 'viewport');
    if (viewportCandidate) {
      createdBody.appendChild(viewportCandidate);
    }
    if (controlsSlot) {
      createdBody.appendChild(controlsSlot);
    }
    root.insertBefore(createdBody, footerSlot ?? null);
  }

  const viewport = collectSlot(root, 'viewport') || root.querySelector('[data-shell-viewport]');
  if (viewport) viewport.classList.add('game-shell__viewport');

  const controls = collectSlot(root, 'controls');
  if (controls) controls.classList.add('game-shell__controls');

  if (footerSlot) footerSlot.classList.add('game-shell__footer');

  const canvas = root.querySelector('[data-shell-canvas]') || viewport?.querySelector('canvas');
  const aspectRatio = options.aspectRatio || parseAspect(root.dataset.aspect, undefined);
  const resizer = createResizeController(viewport, canvas, aspectRatio);

  return {
    root,
    canvas,
    header: headerSlot,
    hud: hudSlot,
    viewport,
    controls,
    footer: footerSlot,
    refresh() {
      resizer.refresh();
    },
    destroy() {
      resizer.disconnect();
      root.dataset.shellReady = 'false';
    }
  };
}

function themeFromBody(optionsTheme) {
  if (optionsTheme) return optionsTheme;
  const body = document.body;
  if (!body) return DEFAULT_THEME;
  for (const cls of body.classList) {
    if (LEGACY_THEMES[cls]) {
      return LEGACY_THEMES[cls];
    }
  }
  return DEFAULT_THEME;
}

function toArray(nodes) {
  return Array.from(nodes || []);
}

function moveChildren(source, target, filter = () => true) {
  if (!source || !target) return;
  toArray(source.childNodes).forEach(node => {
    if (filter(node)) {
      target.appendChild(node);
    }
  });
}

function markDataCanvas(canvas) {
  if (canvas && !canvas.hasAttribute('data-shell-canvas')) {
    canvas.setAttribute('data-shell-canvas', 'true');
  }
}

const OVERLAY_SELECTORS = ['#toast', '.toast', '[data-overlay]', '.start-screen', '#startScreen', '.modal', '.dialog', '.overlay', '.overlay-layer'];
const CONTROL_SELECTORS = ['#startBtn', '.start-btn', '.start-button', '.control-bar', '.controls', '.actions'];

function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function bootstrapFromStructure(structure) {
  const { container, icon, title, theme, footerSource } = structure;
  if (!container) return null;

  const body = document.body;
  body.classList.add('game-surface');

  const shell = createElement('div', 'game-shell');
  if (theme) shell.dataset.theme = theme;
  body.appendChild(shell);

  const header = createElement('header', 'game-shell__header');
  const identity = createElement('div', 'game-shell__identity');
  if (icon) identity.appendChild(icon);
  if (title) identity.appendChild(title);
  header.appendChild(identity);

  const settingsBtn = container.querySelector('#settingsBtn');
  if (settingsBtn) {
    settingsBtn.classList.add('pill');
    header.appendChild(settingsBtn);
  }
  shell.appendChild(header);

  const hudSource = container.querySelector('.hud');
  let hud = null;
  if (hudSource && hudSource.childNodes.length) {
    hud = createElement('section', 'game-shell__hud');
    moveChildren(hudSource, hud, node => node.nodeType === Node.ELEMENT_NODE);
    shell.appendChild(hud);
    hudSource.remove();
  }

  const bodyWrap = createElement('div', 'game-shell__body');
  shell.appendChild(bodyWrap);

  const viewport = createElement('div', 'game-shell__viewport');
  bodyWrap.appendChild(viewport);

  const overlay = createElement('div', 'game-shell__overlay');
  viewport.appendChild(overlay);

  let canvas = container.querySelector('canvas:not(.icon)');
  if (!canvas) {
    // Some layouts keep the game canvas as the first canvas inside container.
    const candidates = toArray(container.querySelectorAll('canvas')).filter(el => !el.classList.contains('icon'));
    canvas = candidates[0] || null;
  }
  if (canvas) {
    markDataCanvas(canvas);
    viewport.appendChild(canvas);
  }

  const overlayNodes = new Set();
  OVERLAY_SELECTORS.forEach(selector => {
    toArray(container.querySelectorAll(selector)).forEach(el => {
      if (!overlayNodes.has(el) && el !== canvas) {
        overlayNodes.add(el);
        overlay.appendChild(el);
      }
    });
  });

  const controls = createElement('aside', 'game-shell__controls');
  bodyWrap.appendChild(controls);

  CONTROL_SELECTORS.forEach(selector => {
    toArray(container.querySelectorAll(selector)).forEach(el => {
      if (!controls.contains(el)) {
        controls.appendChild(el);
      }
    });
  });

  const pad = container.querySelector('#pad');
  if (pad && !controls.contains(pad)) {
    controls.appendChild(pad);
  }

  // Any remaining buttons that are not part of HUD or header go to controls.
  toArray(container.querySelectorAll('button')).forEach(button => {
    if (button.closest('.hud') || button.id === 'settingsBtn') return;
    if (controls.contains(button)) return;
    controls.appendChild(button);
  });

  if (!controls.childElementCount) {
    controls.remove();
  }

  const footer = createElement('footer', 'game-shell__footer');
  const hint = container.querySelector('.hint');
  if (hint) {
    footer.appendChild(hint);
  }
  if (footerSource) {
    moveChildren(footerSource, footer, node => node.nodeType === Node.ELEMENT_NODE);
  }
  const footerHasContent = footer.childElementCount > 0;
  if (footerHasContent) {
    shell.appendChild(footer);
  }

  if (container !== footerSource) {
    container.remove();
  }
  if (footerSource && footerSource !== container) {
    footerSource.remove();
  }

  return shell;
}

function bootstrapLegacyShell(options = {}) {
  const theme = themeFromBody(options.theme);
  const play = document.querySelector('.play');
  const cabinet = document.querySelector('.cabinet');

  if (play) {
    const icon = document.querySelector('canvas.icon');
    const title = document.querySelector('h1');
    return bootstrapFromStructure({ container: play, icon, title, theme });
  }

  if (cabinet) {
    const icon = cabinet.querySelector('canvas.icon');
    let title = cabinet.querySelector('h1');
    if (!title) {
      const label = cabinet.querySelector('.label');
      if (label) {
        title = createElement('h1');
        title.textContent = label.textContent || '';
      }
    }
    const inner = cabinet.querySelector('.inner') || cabinet;
    const footer = cabinet.querySelector('.footer');
    return bootstrapFromStructure({ container: inner, icon, title, theme, footerSource: footer });
  }

  return null;
}

export function initGameShell(options = {}) {
  let container = options.container || document.querySelector('[data-game-shell]');
  if (!container) {
    container = bootstrapLegacyShell(options);
  }
  if (!container) {
    throw new Error('No game shell container found');
  }
  return initShell(container, options);
}

export function initAllGameShells() {
  const results = [];
  const explicit = toArray(document.querySelectorAll('[data-game-shell]'));
  explicit.forEach(el => results.push(initShell(el)));
  if (!explicit.length) {
    const legacy = bootstrapLegacyShell({});
    if (legacy) {
      results.push(initShell(legacy));
    }
  }
  return results;
}
