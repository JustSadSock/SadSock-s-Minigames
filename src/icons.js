(function(){
  'use strict';
  const cache={}, items=[];
  let frame=0,last=0,fps=12,animating=false;

  async function load(name){
    if(cache[name]) return cache[name];
    const res = await fetch(`src/icon-data/${name}.json`);
    const sets = await res.json();
    cache[name] = sets.map(data=>{
      const cv=document.createElement('canvas');
      cv.width=16; cv.height=16;
      const ctx=cv.getContext('2d',{alpha:false});
      ctx.imageSmoothingEnabled=false;
      let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
      data.forEach(p=>{ if(p.x<minX) minX=p.x; if(p.y<minY) minY=p.y; if(p.x>maxX) maxX=p.x; if(p.y>maxY) maxY=p.y; });
      const w=maxX-minX+1, h=maxY-minY+1;
      const offX=Math.floor((16-w)/2), offY=Math.floor((16-h)/2);
      data.forEach(p=>{
        ctx.fillStyle=p.c;
        ctx.fillRect(p.x-minX+offX, p.y-minY+offY,1,1);
      });
      return cv;
    });
    return cache[name];
  }

  function draw(ctx,name,frame){
    const set = cache[name];
    if(!set) return;
    const img=set[frame%set.length];
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.drawImage(img,0,0,img.width,img.height,0,0,ctx.canvas.width,ctx.canvas.height);
    const twX=frame%16, twY=((frame/16)|0)%16;
    ctx.fillStyle='#fff';
    ctx.fillRect(twX,twY,1,1);
  }

  function loop(t){
    if(t-last>1000/fps){
      frame++;
      items.forEach(it=>draw(it.ctx,it.name,frame));
      last=t;
    }
    requestAnimationFrame(loop);
  }

  function animate(canvas,name){
    const ctx=canvas.getContext('2d',{alpha:false});
    ctx.imageSmoothingEnabled=false;
    items.push({ctx,name});
    (cache[name] ? Promise.resolve(cache[name]) : load(name)).then(()=>draw(ctx,name,frame));
    if(!animating){ animating=true; requestAnimationFrame(loop); }
  }

  function redraw(){ items.forEach(it=>draw(it.ctx,it.name,frame)); }

  window.Icons={animate, redraw};
})();
