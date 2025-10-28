import '../../ui.js';
import '../../audio.js';
import '../../scores.js';
import '../../icons.js';
import '../../i18n.js';
import { initSettings } from '../../settings.js';
import { initGameShell } from '../../core/ui/game-shell.js';
import { DodgeRainGame } from './dodge-rain-game.js';

initSettings();

const shell = initGameShell({ aspectRatio: 120 / 160 });

const canvas = shell.canvas || document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const toastEl = document.getElementById('toast');
const pad = document.getElementById('pad');
const scoreEl = document.getElementById('score');
const scoresBtn = document.getElementById('scoresBtn');

const toast = window.UI?.makeToast(toastEl) ?? (() => {});

const game = new DodgeRainGame({
  canvas,
  scoreboardElement: scoreEl,
  scoreboardLabel: window.i18n?.t('score') || 'Score',
  padElement: pad,
  toast
});

shell.refresh();


if (scoresBtn && game.scores) {
  scoresBtn.addEventListener('click', () => game.scores.show());
}

startBtn.addEventListener('click', () => {
  game.start();
  shell.refresh();
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
