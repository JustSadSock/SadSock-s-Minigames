export function createGameLoop(canvas, { width, height, update, draw }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;
  const keys = { left: false, right: false, up: false, down: false, a: false, b: false };
  const map = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    a: 'a', A: 'a', z: 'b', Z: 'b', w: 'up', W: 'up', s: 'down', S: 'down', d: 'right', D: 'right',
    ' ': 'a', Enter: 'b'
  };
  function key(e, val) {
    const k = map[e.key];
    if (k) { keys[k] = val; e.preventDefault(); }
  }
  window.addEventListener('keydown', e => key(e, true));
  window.addEventListener('keyup', e => key(e, false));
  function attachPad(pad, handler) {
    if (!pad || !window.UI) return () => {};
    return window.UI.attachDPad(pad, (dir, val) => {
      if (keys.hasOwnProperty(dir)) keys[dir] = val;
      if (handler) handler(dir, val);
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
  function loop(t) {
    const dt = (t - last) / 1000;
    last = t;
    update({ dt, keys, ctx, canvas });
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return { ctx, keys, attachPad, resize };
}
