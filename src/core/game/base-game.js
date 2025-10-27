import { createGameLoop } from '../../game-loop.js';
import { createGameStorage } from '../storage/namespaced-storage.js';

function noop() {}

export class BaseGame {
  constructor({
    canvas,
    width,
    height,
    gameId,
    scoreboardElement,
    scoreboardLabel,
    padElement,
    toast,
    pauseOnBlur = true
  }) {
    if (!canvas) throw new Error('BaseGame requires a canvas element');
    if (!width || !height) throw new Error('BaseGame requires width and height');
    if (!gameId) throw new Error('BaseGame requires a game identifier');

    this.canvas = canvas;
    this.dimensions = { width, height };
    this.gameId = gameId;
    this.toast = toast || null;
    this.pauseOnBlur = pauseOnBlur;
    this.isRunning = false;
    this.currentScore = 0;

    this.storage = createGameStorage(gameId);
    this.bestScore = this.storage.getNumber('best', 0);

    this.scoreboard = scoreboardElement && globalThis.UI
      ? globalThis.UI.score(scoreboardElement, scoreboardLabel || 'Score')
      : null;
    if (this.scoreboard) {
      this.scoreboard.set(0, this.bestScore);
    }

    this.scores = typeof globalThis.Scores === 'function' ? globalThis.Scores(gameId) : null;

    this.loop = createGameLoop(canvas, {
      width,
      height,
      update: frame => this._onFrame(frame),
      draw: ctx => this.draw(ctx)
    });

    if (padElement && typeof this.loop.attachPad === 'function') {
      this.detachPad = this.loop.attachPad(padElement, (dir, val) => this.onPadInput(dir, val));
    } else {
      this.detachPad = noop;
    }

    if (this.pauseOnBlur) {
      this._visibilityHandler = () => this._handleVisibilityChange();
      document.addEventListener('visibilitychange', this._visibilityHandler);
    }
  }

  destroy() {
    this.detachPad();
    if (this.pauseOnBlur && this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
    }
    if (this.loop && typeof this.loop.destroy === 'function') {
      this.loop.destroy();
    }
  }

  _handleVisibilityChange() {
    if (document.hidden && this.isRunning) {
      this.pause();
    }
  }

  _onFrame(frame) {
    if (!this.isRunning) {
      this.updateIdle(frame);
      return;
    }
    this.update(frame);
  }

  updateIdle(/* frame */) {
    // Subclasses may override to implement attract modes.
  }

  start() {
    this.reset();
    this.isRunning = true;
    this.currentScore = 0;
    this.refreshScoreboard();
    if (typeof this.loop.resume === 'function') {
      this.loop.resume();
    }
  }

  pause() {
    this.isRunning = false;
    if (typeof this.loop.pause === 'function') {
      this.loop.pause();
    }
  }

  resume() {
    this.isRunning = true;
    if (typeof this.loop.resume === 'function') {
      this.loop.resume();
    }
  }

  gameOver({ score, message } = {}) {
    this.isRunning = false;
    if (typeof score === 'number') {
      this.currentScore = score;
      this.commitScore();
    }
    if (this.toast && message) {
      this.toast(message);
    }
  }

  setScore(value) {
    this.currentScore = value;
    this.refreshScoreboard();
  }

  refreshScoreboard() {
    if (this.scoreboard) {
      this.scoreboard.set(this.currentScore, this.bestScore);
    }
  }

  commitScore() {
    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
      this.storage.setNumber('best', this.currentScore);
    }
    if (this.scoreboard) {
      this.scoreboard.set(this.currentScore, this.bestScore);
    }
    if (this.scores) {
      this.scores.add(this.currentScore);
    }
  }

  onPadInput(/* dir, value */) {}

  reset() {
    throw new Error('reset() must be implemented by subclasses');
  }

  update() {
    throw new Error('update() must be implemented by subclasses');
  }

  draw() {
    throw new Error('draw() must be implemented by subclasses');
  }
}
