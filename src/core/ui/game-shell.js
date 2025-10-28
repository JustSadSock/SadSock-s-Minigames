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
  let bodySlot = collectSlot(root, 'body');
  const initialViewportSlot = collectSlot(root, 'viewport') || root.querySelector('[data-shell-canvas]')?.parentElement;
  const sidebarSlot = collectSlot(root, 'sidebar');
  const controlsSlot = collectSlot(root, 'controls');
  const footerSlot = collectSlot(root, 'footer');

  if (headerSlot) headerSlot.classList.add('game-shell__header');

  if (bodySlot) {
    bodySlot.classList.add('game-shell__body');
  }

  let viewport = collectSlot(root, 'viewport') || root.querySelector('[data-shell-viewport]') || initialViewportSlot;
  if (viewport) {
    viewport.classList.add('game-shell__viewport');
    if (bodySlot && viewport.parentElement !== bodySlot) {
      bodySlot.appendChild(viewport);
    }
  }

  if (!bodySlot) {
    bodySlot = document.createElement('div');
    bodySlot.className = 'game-shell__body';
    root.insertBefore(bodySlot, footerSlot ?? null);
    if (viewport) {
      bodySlot.appendChild(viewport);
    }
  }

  let leftDock = bodySlot.querySelector('.game-shell__dock--left');
  if (!leftDock) {
    leftDock = document.createElement('div');
    leftDock.className = 'game-shell__dock game-shell__dock--left';
    if (viewport) {
      bodySlot.insertBefore(leftDock, viewport);
    } else {
      bodySlot.insertBefore(leftDock, bodySlot.firstChild);
    }
  }

  let rightDock = bodySlot.querySelector('.game-shell__dock--right');
  if (!rightDock) {
    rightDock = document.createElement('div');
    rightDock.className = 'game-shell__dock game-shell__dock--right';
    if (viewport && viewport.nextSibling) {
      bodySlot.insertBefore(rightDock, viewport.nextSibling);
    } else {
      bodySlot.appendChild(rightDock);
    }
  }

  let leftPinned = leftDock.querySelector('.game-shell__pinned--left');
  if (!leftPinned) {
    leftPinned = document.createElement('div');
    leftPinned.className = 'game-shell__pinned game-shell__pinned--left';
    leftDock.appendChild(leftPinned);
  }

  let rightPinned = rightDock.querySelector('.game-shell__pinned--right');
  if (!rightPinned) {
    rightPinned = document.createElement('div');
    rightPinned.className = 'game-shell__pinned game-shell__pinned--right';
    rightDock.appendChild(rightPinned);
  }

  if (headerSlot) {
    leftPinned.appendChild(headerSlot);
  }

  const canvas = root.querySelector('[data-shell-canvas]') || viewport?.querySelector('canvas');
  const aspectRatio = options.aspectRatio || parseAspect(root.dataset.aspect, undefined);
  const resizer = createResizeController(viewport, canvas, aspectRatio);

  const actions = ensureActionsContainer(headerSlot);
  const panels = new Map();
  const cleanups = [];

  function updateDockVisibility() {
    const leftPanels = toArray(leftDock?.querySelectorAll('.shell-panel'));
    const rightPanels = toArray(rightDock?.querySelectorAll('.shell-panel'));
    const hasLeftPinned = leftPinned && leftPinned.childElementCount > 0;
    const hasRightPinned = rightPinned && rightPinned.childElementCount > 0;

    if (leftPanels.length || hasLeftPinned) {
      root.dataset.leftVisible = 'true';
      const hasOpen = leftPanels.some(panel => panel.classList.contains('is-open'));
      root.dataset.leftState = hasOpen || hasLeftPinned ? 'open' : 'collapsed';
    } else {
      delete root.dataset.leftVisible;
      delete root.dataset.leftState;
    }

    if (rightPanels.length || hasRightPinned) {
      root.dataset.rightVisible = 'true';
      const hasOpen = rightPanels.some(panel => panel.classList.contains('is-open'));
      root.dataset.rightState = hasOpen || hasRightPinned ? 'open' : 'collapsed';
    } else {
      delete root.dataset.rightVisible;
      delete root.dataset.rightState;
    }
  }

  function attachPanel(slot, preset) {
    if (!slot || !preset) return;
    const meta = { ...preset };
    meta.slot = meta.slot || slot.dataset.shellSlot;
    let panelEntry = null;
    const decorated = decoratePanel(slot, meta, isOpen => {
      updateDockVisibility();
      resizer.refresh();
      if (panelEntry?.quickToggle) {
        panelEntry.quickToggle.classList.toggle('is-active', isOpen);
        panelEntry.quickToggle.setAttribute('aria-expanded', String(isOpen));
      }
    });
    if (!decorated) return;
    panelEntry = decorated;
    const dock = meta.side === 'left' ? leftPinned : rightPinned;
    if (dock) {
      dock.appendChild(decorated.slot);
    }
    panels.set(meta.name, decorated);
    cleanups.push(() => {
      decorated.toggle.removeEventListener('click', decorated.toggleHandler);
    });
  }

  attachPanel(hudSlot, PANEL_PRESETS.hud);
  attachPanel(sidebarSlot, PANEL_PRESETS.sidebar);
  attachPanel(controlsSlot, PANEL_PRESETS.controls);

  function setPanelState(name, open) {
    const entry = panels.get(name);
    if (!entry) return;
    entry.setOpen(Boolean(open));
  }

  function togglePanel(name) {
    const entry = panels.get(name);
    if (!entry) return;
    const isOpen = entry.slot.classList.contains('is-open');
    setPanelState(name, !isOpen);
  }

  if (actions) {
    panels.forEach((panel, name) => {
      const { meta } = panel;
      const quickToggle = createPanelToggle(meta);
      quickToggle.classList.add('shell-panel__toggle--small', 'pill');
      const quickToggleHandler = () => togglePanel(name);
      quickToggle.addEventListener('click', quickToggleHandler);
      const isOpen = panel.slot.classList.contains('is-open');
      quickToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      quickToggle.classList.toggle('is-active', isOpen);
      actions.appendChild(quickToggle);
      panel.quickToggle = quickToggle;
      panel.quickToggleHandler = quickToggleHandler;
      cleanups.push(() => quickToggle.removeEventListener('click', quickToggleHandler));
    });
  }

  updateDockVisibility();

  if (footerSlot) {
    rightPinned.appendChild(footerSlot);
  }

  updateDockVisibility();

  if (footerSlot) footerSlot.classList.add('game-shell__footer');

  return {
    root,
    canvas,
    header: headerSlot,
    hud: hudSlot,
    viewport,
    sidebar: sidebarSlot,
    controls: controlsSlot,
    footer: footerSlot,
    refresh() {
      resizer.refresh();
    },
    destroy() {
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (err) {
          // ignore cleanup errors
        }
      });
      panels.forEach(panel => {
        if (panel.quickToggle && panel.quickToggle.parentElement) {
          panel.quickToggle.parentElement.removeChild(panel.quickToggle);
        }
      });
      panels.clear();
      resizer.disconnect();
      root.dataset.shellReady = 'false';
    },
    openPanel(name) {
      setPanelState(name, true);
    },
    closePanel(name) {
      setPanelState(name, false);
    },
    togglePanel
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
const PANEL_PRESETS = {
  hud: {
    name: 'stats',
    icon: '🏆',
    label: 'shell.panelStats',
    fallback: 'Stats',
    side: 'left',
    defaultOpen: true
  },
  sidebar: {
    name: 'info',
    icon: 'ℹ️',
    label: 'shell.panelInfo',
    fallback: 'Info',
    side: 'left',
    defaultOpen: false
  },
  controls: {
    name: 'controls',
    icon: '🎮',
    label: 'shell.panelControls',
    fallback: 'Controls',
    side: 'right',
    defaultOpen: true
  }
};

function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function ensureActionsContainer(header) {
  if (!header) return null;
  let actions = header.querySelector('.game-shell__actions');
  if (!actions) {
    actions = document.createElement('div');
    actions.className = 'game-shell__actions';
    header.appendChild(actions);
  }
  return actions;
}

function createPanelToggle(meta) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'shell-panel__toggle';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'shell-panel__icon';
  iconSpan.textContent = meta.icon || '';
  button.appendChild(iconSpan);
  const labelSpan = document.createElement('span');
  labelSpan.className = 'shell-panel__label';
  labelSpan.textContent = meta.fallback || '';
  if (meta.label) {
    labelSpan.setAttribute('data-i18n', meta.label);
  }
  button.appendChild(labelSpan);
  return button;
}

function decoratePanel(slot, meta, onToggle) {
  if (!slot) return null;
  slot.classList.remove('game-shell__drawer', 'game-shell__drawer-content');
  slot.classList.add('shell-panel');
  slot.classList.add(`shell-panel--${meta.side || 'left'}`);
  slot.dataset.shellPanel = meta.name || meta.slot || '';

  const currentChildren = Array.from(slot.childNodes);
  const body = document.createElement('div');
  body.className = 'shell-panel__body';
  currentChildren.forEach(node => body.appendChild(node));

  const toggle = createPanelToggle(meta);
  slot.appendChild(body);
  slot.insertBefore(toggle, body);

  const defaultOpen = meta.defaultOpen !== false;

  function setOpen(open) {
    const willOpen = Boolean(open);
    slot.classList.toggle('is-open', willOpen);
    slot.classList.toggle('is-collapsed', !willOpen);
    body.hidden = !willOpen;
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (typeof onToggle === 'function') {
      onToggle(willOpen, slot, meta);
    }
  }

  setOpen(defaultOpen);

  const toggleHandler = () => {
    const willOpen = !slot.classList.contains('is-open');
    setOpen(willOpen);
  };

  toggle.addEventListener('click', toggleHandler);

  return { slot, toggle, body, meta, setOpen, toggleHandler };
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
  header.dataset.shellSlot = 'header';
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
    hud.dataset.shellSlot = 'hud';
    moveChildren(hudSource, hud, node => node.nodeType === Node.ELEMENT_NODE);
    shell.appendChild(hud);
    hudSource.remove();
  }

  const bodyWrap = createElement('div', 'game-shell__body');
  bodyWrap.dataset.shellSlot = 'body';
  shell.appendChild(bodyWrap);

  const viewport = createElement('div', 'game-shell__viewport');
  viewport.dataset.shellSlot = 'viewport';
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
  controls.dataset.shellSlot = 'controls';
  shell.appendChild(controls);

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
  footer.dataset.shellSlot = 'footer';
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
