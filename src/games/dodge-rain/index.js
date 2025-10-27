import '../../ui.js';
import '../../audio.js';
import '../../scores.js';
import '../../icons.js';
import '../../i18n.js';
import { initSettings } from '../../settings.js';
import { DodgeRainGame } from './dodge-rain-game.js';

initSettings();

const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const toastEl = document.getElementById('toast');
const pad = document.getElementById('pad');
const scoreEl = document.getElementById('score');
const scoresBtn = document.getElementById('scoresBtn');
const playArea = document.querySelector('.play');

const toast = window.UI?.makeToast(toastEl) ?? (() => {});

const game = new DodgeRainGame({
  canvas,
  scoreboardElement: scoreEl,
  scoreboardLabel: window.i18n?.t('score') || 'Score',
  padElement: pad,
  toast
});

const aspectRatio = game.dimensions.width / game.dimensions.height;

function parsePixelValue(value) {
  const numeric = parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function fitGameCanvas() {
  if (!canvas || !playArea) return;

  const bodyStyle = getComputedStyle(document.body);
  const playStyle = getComputedStyle(playArea);

  const bodyHorizontalPadding = parsePixelValue(bodyStyle.paddingLeft) + parsePixelValue(bodyStyle.paddingRight);
  const availableWidth = Math.max(window.innerWidth - bodyHorizontalPadding, 120);

  const playRect = playArea.getBoundingClientRect();
  const availableHeight = window.innerHeight - playRect.top - parsePixelValue(bodyStyle.paddingBottom);

  const gap = parsePixelValue(playStyle.rowGap || playStyle.gap || 0);
  const paddingTop = parsePixelValue(playStyle.paddingTop);
  const paddingBottom = parsePixelValue(playStyle.paddingBottom);

  const flowChildren = Array.from(playArea.children).filter(child => {
    if (child === canvas) return true;
    if (child.id === 'toast') return false;
    const style = getComputedStyle(child);
    return style.position !== 'absolute' && style.display !== 'none';
  });

  const flowSiblings = flowChildren.filter(child => child !== canvas);
  const totalGap = gap * Math.max(flowChildren.length - 1, 0);

  let occupiedHeight = paddingTop + paddingBottom + totalGap;
  for (const child of flowSiblings) {
    occupiedHeight += child.offsetHeight;
  }

  const maxCanvasHeight = Math.max(availableHeight - occupiedHeight, 0);

  let displayWidth;
  let displayHeight;

  if (maxCanvasHeight <= 0) {
    displayWidth = Math.max(120, Math.min(availableWidth, window.innerHeight * aspectRatio));
    displayHeight = displayWidth / aspectRatio;
  } else {
    const widthFromHeight = maxCanvasHeight * aspectRatio;
    displayWidth = Math.min(availableWidth, widthFromHeight);
    displayHeight = displayWidth / aspectRatio;

    if (displayHeight > maxCanvasHeight) {
      displayHeight = maxCanvasHeight;
      displayWidth = displayHeight * aspectRatio;
    }
  }

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
}

fitGameCanvas();
window.addEventListener('resize', fitGameCanvas);
window.addEventListener('orientationchange', fitGameCanvas);
window.setTimeout(fitGameCanvas, 0);

if (scoresBtn && game.scores) {
  scoresBtn.addEventListener('click', () => game.scores.show());
}

startBtn.addEventListener('click', () => {
  game.start();
  if (typeof window.Sound?.fx === 'function') {
    window.Sound.fx('start');
  }
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  game.movePlayerTo(x);
});

canvas.addEventListener('touchstart', e => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  if (!touch) return;
  const x = touch.clientX - rect.left;
  game.movePlayerTo(x);
});

canvas.addEventListener('touchmove', e => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  if (!touch) return;
  const x = touch.clientX - rect.left;
  game.movePlayerTo(x);
});

window.addEventListener('blur', () => game.pause());
window.addEventListener('focus', () => game.resume());
