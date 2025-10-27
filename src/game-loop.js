export function createGameLoop(canvas, { width, height, update, draw, autoStart = true }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  const keys = { left: false, right: false, up: false, down: false, a: false, b: false };
  const map = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    a: 'a', A: 'a', z: 'b', Z: 'b', w: 'up', W: 'up', s: 'down', S: 'down', d: 'right', D: 'right',
    ' ': 'a', Enter: 'b'
  };

  const keyHandler = (val) => (e) => {
    const k = map[e.key];
    if (k) { keys[k] = val; e.preventDefault(); }
  };
  const downListener = keyHandler(true);
  const upListener = keyHandler(false);

  window.addEventListener('keydown', downListener);
  window.addEventListener('keyup', upListener);

  function attachPad(pad, handler) {
    if (!pad || !window.UI) return () => {};
    return window.UI.attachDPad(pad, (dir, val) => {
      const pressed = val !== false;
      if (keys.hasOwnProperty(dir)) keys[dir] = pressed;
      if (handler) handler(dir, pressed);
    });
  }

  function resize() {
    const pr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = width * pr; canvas.height = height * pr;
    ctx.setTransform(pr, 0, 0, pr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  let running = !!autoStart;

  function loop(t) {
    const elapsed = (t - last) / 1000;
    last = t;
    const dt = running ? elapsed : 0;
    update({ dt, rawDt: elapsed, keys, ctx, canvas, isPaused: !running });
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    ctx,
    keys,
    attachPad,
    resize,
    pause() {
      running = false;
    },
    resume() {
      running = true;
      last = performance.now();
    },
    destroy() {
      window.removeEventListener('keydown', downListener);
      window.removeEventListener('keyup', upListener);
      window.removeEventListener('resize', resize);
    }
  };
}
