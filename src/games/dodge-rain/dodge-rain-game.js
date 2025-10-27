import { BaseGame } from '../../core/game/base-game.js';

function drawSprite(ctx, sprite, x, y, scale, palette) {
  for (let j = 0; j < sprite.length; j++) {
    for (let i = 0; i < sprite[j].length; i++) {
      const v = sprite[j][i];
      if (v !== '0') {
        ctx.fillStyle = palette[parseInt(v, 10)];
        ctx.fillRect(x + i * scale, y + j * scale, scale, scale);
      }
    }
  }
}

const PLAYER_SPRITE = [
  '00100',
  '01210',
  '11111',
  '01010',
  '10101'
];

const DROP_SPRITES = [
  [
    '00100',
    '01110',
    '11111',
    '01110',
    '00100'
  ],
  [
    '00000',
    '00100',
    '01110',
    '00100',
    '00000'
  ]
];

const PLAYER_SPEED = 120; // pixels per second
const PLAYER_WIDTH = 10;
const PLAYER_HEIGHT = 10;
const CANVAS_WIDTH = 120;
const CANVAS_HEIGHT = 160;
const DROP_SIZE = 5;

export class DodgeRainGame extends BaseGame {
  constructor(options) {
    super({ ...options, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, gameId: 'rain' });
    this.palette = null;
    this.padActive = false;
  }

  getStyles() {
    const root = getComputedStyle(document.documentElement);
    return {
      bg: root.getPropertyValue('--bg2'),
      playerPrimary: root.getPropertyValue('--pastel-peach'),
      playerAccent: root.getPropertyValue('--pastel-blue'),
      drops: ['--pastel-peach', '--pastel-mint', '--pastel-blue', '--pastel-pink'].map(key => root.getPropertyValue(key).trim())
    };
  }

  reset() {
    const { width, height } = this.dimensions;
    this.state = {
      player: { x: (width - PLAYER_WIDTH) / 2, y: height - PLAYER_HEIGHT - 12, w: PLAYER_WIDTH, h: PLAYER_HEIGHT },
      objects: [],
      spawnTimer: 0,
      difficulty: 1
    };
    this.setScore(0);
    this.palette = this.getStyles();
  }

  start() {
    super.start();
    this.setScore(0);
  }

  update({ dt, keys }) {
    if (dt <= 0) return;
    const { player } = this.state;
    const move = PLAYER_SPEED * dt;
    if (keys.left) player.x = Math.max(0, player.x - move);
    if (keys.right) player.x = Math.min(CANVAS_WIDTH - player.w, player.x + move);

    this.state.spawnTimer += dt;
    this.state.difficulty += dt * 0.06;

    const spawnInterval = Math.max(5 / 60, (20 - this.state.difficulty * 2) / 60);
    if (this.state.spawnTimer >= spawnInterval) {
      this.spawnObject();
      this.state.spawnTimer = 0;
    }

    const stillFalling = [];
    for (const drop of this.state.objects) {
      drop.y += drop.vy * this.state.difficulty * dt * 60;
      drop.anim += dt * 6;
      if (drop.y > CANVAS_HEIGHT) {
        const newScore = this.currentScore + 1;
        this.setScore(newScore);
        if (typeof globalThis.Sound?.fx === 'function') {
          globalThis.Sound.fx('coin');
        }
      } else {
        stillFalling.push(drop);
      }
    }
    this.state.objects = stillFalling;

    for (const drop of this.state.objects) {
      if (this.collides(drop, player)) {
        if (typeof globalThis.Sound?.fx === 'function') {
          globalThis.Sound.fx('error');
        }
        this.gameOver({ score: this.currentScore, message: this.describeScore() });
        this.reset();
        break;
      }
    }
  }

  collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  spawnObject() {
    const palette = this.palette || this.getStyles();
    const vy = 1 + Math.random();
    this.state.objects.push({
      x: Math.random() * (CANVAS_WIDTH - DROP_SIZE),
      y: -DROP_SIZE,
      w: DROP_SIZE,
      h: DROP_SIZE,
      vy,
      color: palette.drops[Math.floor(Math.random() * palette.drops.length)],
      anim: 0
    });
    if (this.state.objects.length > 50) {
      this.state.objects.shift();
    }
  }

  draw(ctx) {
    if (!this.palette) {
      this.palette = this.getStyles();
    }
    ctx.fillStyle = this.palette.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const playerPalette = [null, this.palette.playerPrimary, this.palette.playerAccent];
    drawSprite(ctx, PLAYER_SPRITE, this.state.player.x, this.state.player.y, 2, playerPalette);

    for (const drop of this.state.objects) {
      const frame = DROP_SPRITES[Math.floor(drop.anim) % DROP_SPRITES.length];
      drawSprite(ctx, frame, drop.x, drop.y, 1, [null, drop.color]);
    }
  }

  describeScore() {
    return `${globalThis.i18n?.t('score') ?? 'Score'}: ${this.currentScore}`;
  }

  onPadInput(dir, val) {
    if (!val) return;
    this.padActive = true;
    if (dir === 'left') {
      this.state.player.x = Math.max(0, this.state.player.x - PLAYER_WIDTH);
    } else if (dir === 'right') {
      this.state.player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, this.state.player.x + PLAYER_WIDTH);
    }
  }

  movePlayerTo(x) {
    const half = this.state.player.w / 2;
    this.state.player.x = Math.min(Math.max(x - half, 0), CANVAS_WIDTH - this.state.player.w);
  }
}
