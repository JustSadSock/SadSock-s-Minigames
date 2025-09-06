import anim from './icon-data/anim.json';
import arena from './icon-data/arena.json';
import breakout from './icon-data/breakout.json';
import cards from './icon-data/cards.json';
import music from './icon-data/music.json';
import pong from './icon-data/pong.json';
import rain from './icon-data/rain.json';
import rhythm from './icon-data/rhythm.json';
import rogue from './icon-data/rogue.json';
import snake from './icon-data/snake.json';
import tower from './icon-data/tower.json';

const modules = { anim, arena, breakout, cards, music, pong, rain, rhythm, rogue, snake, tower };

(function(){
  'use strict';

  const cache = {}, items = [];
  let frame = 0, last = 0, fps = 6, animating = false;

  function load(name){
    if(cache[name]) return cache[name];
    const sets = (modules[name] || []).slice(0,3);
    const canvases = sets.map(data=>{
      const cv = document.createElement('canvas');
      cv.width = 16; cv.height = 16;
      const ctx = cv.getContext('2d',{alpha:false});
      ctx.imageSmoothingEnabled = false;
      let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
      data.forEach(p=>{ if(p.x<minX) minX=p.x; if(p.y<minY) minY=p.y; if(p.x>maxX) maxX=p.x; if(p.y>maxY) maxY=p.y; });
      const w=maxX-minX+1, h=maxY-minY+1;
      const offX=Math.floor((16-w)/2), offY=Math.floor((16-h)/2);
      data.forEach(p=>{ ctx.fillStyle=p.c; ctx.fillRect(p.x-minX+offX, p.y-minY+offY,1,1); });
      return cv;
    });
    if(canvases.length === 1) canvases.push(canvases[0]);
    cache[name] = canvases;
    return cache[name];
  }

  function draw(ctx,name,frame){
    const set = cache[name];
    if(!set) return;
    const img = set[frame % set.length];
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.drawImage(img,0,0,img.width,img.height,0,0,ctx.canvas.width,ctx.canvas.height);
  }

  function loop(t){
    if(t - last > 1000 / fps){
      frame++;
      items.forEach(it=>draw(it.ctx,it.name,frame));
      last = t;
    }
    requestAnimationFrame(loop);
  }

  function animate(canvas,name){
    const ctx = canvas.getContext('2d',{alpha:false});
    ctx.imageSmoothingEnabled = false;
    items.push({ctx,name});
    load(name);
    draw(ctx,name,frame);
    if(!animating){ animating = true; requestAnimationFrame(loop); }
  }

  function redraw(){ items.forEach(it=>draw(it.ctx,it.name,frame)); }
  function init(){
    document.querySelectorAll('canvas[data-icon]').forEach(cv=>{
      cv.width = cv.height = 16;
      animate(cv, cv.dataset.icon);
    });
  }

  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.Icons = { animate, redraw };
})();

