const DEFAULT_MAX = 1;

function clampScale(value){
  if(Number.isNaN(value) || !Number.isFinite(value)){
    return 1;
  }
  return Math.max(0.1, value);
}

export function applyScale({
  baseWidth,
  baseHeight,
  property = '--ui-scale',
  margin = 0,
  maxScale = DEFAULT_MAX,
  root = document.documentElement,
} = {}){
  if(!baseWidth || !baseHeight){
    throw new Error('applyScale requires baseWidth and baseHeight');
  }
  const cleanMargin = Math.max(0, margin);
  const compute = () => {
    const vw = Math.max(0, window.innerWidth - cleanMargin * 2);
    const vh = Math.max(0, window.innerHeight - cleanMargin * 2);
    const scaleX = vw / baseWidth;
    const scaleY = vh / baseHeight;
    const scale = Math.min(maxScale, scaleX, scaleY);
    root.style.setProperty(property, clampScale(scale).toFixed(4));
  };
  compute();
  const opts = { passive: true };
  window.addEventListener('resize', compute, opts);
  window.addEventListener('orientationchange', compute, opts);
  return () => {
    window.removeEventListener('resize', compute);
    window.removeEventListener('orientationchange', compute);
  };
}
