import './audio.js';
import './icons.js';
import { t } from './i18n.js';
import { initSettings } from './settings.js';

(function(){
      'use strict';
      const $ = (s,p=document)=>p.querySelector(s);
      const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
      const nickDisplay = $('#nickDisplay');
      const avatarCanvas = $('#avatarCanvas');
      const avatarBtn = $('#avatarBtn');
      const avatarOverlay = $('#avatarOverlay');
      const reel = $('.reel');
      const tiles = $$('.reel .tile');
      const indicator = $('.indicator');
      const gameOverlay = $('#gameOverlay');
      const screenEl = $('.screen');
      const preloaded={};
      tiles.forEach(t=>{
        const src=t.dataset.game;
        const iframe=document.createElement('iframe');
        iframe.src=src;
        iframe.style.display='none';
        document.body.appendChild(iframe);
        preloaded[src]=iframe;
      });
      let DUR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur'));

      // блокируем двойные касания и прокрутку страницы
      addEventListener('dblclick', e=> e.preventDefault(), {passive:false});
      let lastTouch=0;
      addEventListener('touchend', e=>{
        const now=Date.now();
        if(now-lastTouch<400){ e.preventDefault(); }
        lastTouch=now;
      }, {passive:false});
      addEventListener('touchmove', e=> e.preventDefault(), {passive:false});
      addEventListener('scroll', ()=> window.scrollTo(0,0));

      /* ---------- Пиксель-рисовалки (пастель) ---------- */
      function px(ctx,x,y,s=2,c='#fff'){ ctx.fillStyle=c; ctx.fillRect(x*s,y*s,s,s); }
      function clear(ctx){ ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); }
      const gearCtx = $('#settingsCanvas').getContext('2d',{alpha:false});
      gearCtx.imageSmoothingEnabled=false;
      (function drawGear(){
        const S=2; clear(gearCtx); gearCtx.fillStyle='#2d1600';
        const g=[[3,0],[4,0],[5,0],[6,0],[7,1],[8,2],[9,3],[9,4],[9,5],[8,6],[7,7],[6,8],[5,8],[4,9],[3,9],[2,8],[1,7],[0,6],[0,5],[0,4],[0,3],[1,2],[2,1]];
        g.forEach(([x,y])=>px(gearCtx,x,y,S,'#2d1600'));
        ['#ffca3a'].forEach(c=>{
          px(gearCtx,4,4,S,c); px(gearCtx,5,4,S,c); px(gearCtx,4,5,S,c); px(gearCtx,5,5,S,c);
        });
      })();

      // Значки отрисовываются из набора кадров в icons.js
      const drawers=['music','snake','cards','rain','breakout','anim','rogue','pong','rhythm','tower','arena'];

      /* ---------- Профиль ---------- */
      function loadProfile(){
        const ctx = avatarCanvas.getContext('2d',{alpha:false});
        ctx.imageSmoothingEnabled=false;
        const data = localStorage.getItem('profileAvatar');
        if(data){
          const img = new Image();
          img.onload=()=>ctx.drawImage(img,0,0,48,48);
          img.src=data;
        }else{
          ctx.clearRect(0,0,48,48);
        }
        nickDisplay.textContent = localStorage.getItem('profileNick') || t('player');
      }
      avatarBtn.addEventListener('click',()=>{ avatarOverlay.classList.add('show'); });
      loadProfile();
      avatarOverlay.addEventListener('click', e=>{ if(e.target===avatarOverlay) avatarOverlay.classList.remove('show'); });
      window.addEventListener('message', e=>{ if(e.data && e.data.type==='avatarSaved'){ avatarOverlay.classList.remove('show'); loadProfile(); } });

      initSettings(ms=>{ DUR = ms; });

      // инициализация анимированных значков
      tiles.forEach((tile, i)=>{
        const cv = tile.querySelector('canvas');
        Icons.animate(cv, drawers[i%drawers.length]);
      });

      /* ---------- Барабан и навигация ---------- */
      const total = tiles.length;
      const cols = 2;
      const rows = Math.ceil(total/cols);
      indicator.innerHTML = '<i></i>'.repeat(rows);
      const dots = [...indicator.children];
      let colIdx = 0;
      let index = 0; // верхний видимый ряд
      let frac = 0;  // прогресс анимации
      let stepX, STEP, R, isSmall;
      let activeRow = 0; // подсвечиваемый ряд

      function recalcSteps(){
        const r = reel.getBoundingClientRect();
        const gap = 14;
        const size = Math.min((r.width - gap*(cols+1))/cols, (r.height - gap*3)/2);
        isSmall = window.innerWidth <= 600;
        const overlap = size * (isSmall ? 0.03 : 0.2); // ещё меньше перекрытие на телефонах
        stepX = size + gap;
        STEP = size - overlap;                    // шаг меньше размера => перекрытие
        R = STEP * (isSmall ? 1.6 : 1.4);         // ещё глубже на телефонах
        for(let i=0;i<tiles.length;i++){
          tiles[i].style.setProperty('--size', size + 'px');
        }
        render();
      }

      function render(){
        const center = index + frac;
        for(let i=0;i<tiles.length;i++){
          const t = tiles[i];
          const col = i % cols;
          const row = Math.floor(i/cols);
          let delta = row - center;
          delta = ((delta % rows) + rows) % rows;
          if(delta > rows/2) delta -= rows;
          const theta = delta * (STEP / R);
          const y = R * Math.sin(theta);
          const z = R * (1 - Math.cos(theta));
          const x = (col - (cols-1)/2) * stepX;
          const scale = 1 - Math.min(Math.abs(delta)*0.06, 0.18);
          const blur = Math.min(
            Math.abs(delta) * (isSmall ? 0.5 : 0.8),
            isSmall ? 0.8 : 1.2
          );
          const bright = 1 - Math.min(Math.abs(delta)*0.25, .35);
          t.style.setProperty('--slotX', x+'px');
          t.style.setProperty('--slotY', y+'px');
          t.style.setProperty('--slotZ', (-z)+'px');
          t.style.setProperty('--slotScale', scale);
          t.style.setProperty('--slotBright', bright);
          t.style.setProperty('--slotBlur', blur+'px');
          t.style.setProperty('--slotRot', theta+'rad');
          t.style.zIndex = (1000 - z) | 0;         // корректный порядок перекрытия
          const glow = (row === activeRow) ? 1 - Math.min(Math.abs(delta),1) : 0;
          t.style.setProperty('--glow', glow);
          t.dataset.active = glow>0 ? '1':'0';
        }
        const active = Math.round((center % rows + rows) % rows);
        for(let i=0;i<dots.length;i++){
          dots[i].classList.toggle('active', i===active);
        }
      }

      let snapping = false;
      let pending=0, scheduled=false;
      function enqueue(delta){
        pending+=delta;
        if(!scheduled){
          scheduled=true;
          requestAnimationFrame(()=>{
            const d=pending; pending=0; scheduled=false;
            if(d) snap(d);
          });
        }
      }
      function snap(dist){
        if(snapping) return;
        snapping = true;
        activeRow = (index + dist + rows) % rows;
        render();
        const start = frac;
        const end = start + dist;
        const t0 = performance.now();
        const dur = DUR * Math.max(1, Math.abs(dist));
        function step(t){
          const p = Math.min(1,(t - t0)/dur);
          const e = (p<1) ? (1.15*p - 0.15*Math.sin(Math.PI*p)) : 1;
          frac = start + (end-start)*e;
          render();
          if(p<1) requestAnimationFrame(step); else{
            index = (Math.round(index + dist) % rows + rows) % rows;
            frac = 0;
            snapping = false;
            render();
            focusTile();
          }
        }
        requestAnimationFrame(step);
        Sound.fx('move');
        if(navigator.userActivation?.isActive) navigator.vibrate?.(10);
      }

      function moveH(dir){
        colIdx = dir === 'right' ? (colIdx + 1) % cols : (colIdx - 1 + cols) % cols;
        render();
        focusTile();
        Sound.fx('move');
      }

      addEventListener('keydown', e=>{
        if(e.key === 'Enter'){ selectCurrent(); }
        if(e.key === 'ArrowDown') enqueue(1);
        if(e.key === 'ArrowUp') enqueue(-1);
        if(e.key === 'ArrowRight') moveH('right');
        if(e.key === 'ArrowLeft') moveH('left');
      });

      reel.addEventListener('wheel', e=>{
        e.preventDefault();
        enqueue(e.deltaY>0?-1:1);
      }, {passive:false});

      let touchStartX=0, touchStartY=0, touchStartT=0;
      reel.addEventListener('touchstart',e=>{
        const t=e.touches[0];
        touchStartX=t.clientX; touchStartY=t.clientY; touchStartT=performance.now();
      },{passive:true});
      reel.addEventListener('touchmove',e=>{
        const t=e.touches[0];
        const dx=t.clientX-touchStartX;
        const dy=t.clientY-touchStartY;
        const dt=performance.now()-touchStartT;
        if(Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>20){
          let steps=Math.round(Math.abs(dy)/STEP + Math.abs(dy)/dt*0.3);
          steps=Math.max(1,Math.min(steps,5));
          enqueue(dy<0?steps:-steps);
          touchStartY=t.clientY; touchStartT=performance.now();
        }else if(Math.abs(dx)>20){
          moveH(dx>0?'right':'left');
          touchStartX=t.clientX; touchStartT=performance.now();
        }
        e.preventDefault();
      },{passive:false});

      tiles.forEach((t,i)=>{
        t.addEventListener('click',()=>{
          const row = Math.floor(i/cols);
          colIdx = i % cols;
          let diff = row - index;
          diff = ((diff % rows) + rows) % rows;
          if(diff > rows/2) diff -= rows;
          if(diff) snap(diff);
          selectCurrent();
          if(t.dataset.game){ openGame(t); }
        });
      });

      function focusTile(){
        const idx = (Math.round(index)%rows)*cols + colIdx;
        tiles[idx]?.focus();
      }

      recalcSteps();
      focusTile();
      addEventListener('resize', ()=> requestAnimationFrame(recalcSteps));

      function selectCurrent(){
        const idx = (Math.round(index)%rows)*cols + colIdx;
        const tile = tiles[idx];
        tile.classList.add('flash');
        setTimeout(()=>tile.classList.remove('flash'),300);
        Sound.fx("select");
      }

      function openGame(tile){
        const gameSrc = tile.dataset.game;
        const frame = preloaded[gameSrc];
        const rect = tile.getBoundingClientRect();
        const srect = screenEl.getBoundingClientRect();
        const canvas = tile.querySelector('canvas');
        const clone = canvas.cloneNode(true);
        clone.getContext('2d').drawImage(canvas,0,0);
        gameOverlay.innerHTML='';
        gameOverlay.appendChild(clone);
        gameOverlay.style.display='block';
        const scaleX = rect.width/srect.width;
        const scaleY = rect.height/srect.height;
        const offsetX = rect.left - srect.left;
        const offsetY = rect.top - srect.top;
        gameOverlay.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scaleX},${scaleY})`;
        requestAnimationFrame(()=>{ gameOverlay.style.transform='translate(0px,0px) scale(1)'; });
        gameOverlay.addEventListener('transitionend', function handler(){
          gameOverlay.removeEventListener('transitionend', handler);
          gameOverlay.innerHTML='';
          frame.style.display='block';
          gameOverlay.appendChild(frame);
          const close=document.createElement('button');
          close.className='pbtn close';
          close.id='gameClose';
          close.textContent='×';
          gameOverlay.appendChild(close);
          $('#gameClose').addEventListener('click', closeGame);
        }, {once:true});
      }

      function closeGame(){
        const frame=gameOverlay.querySelector('iframe');
        if(frame){
          frame.style.display='none';
          document.body.appendChild(frame);
        }
        gameOverlay.style.display='none';
        gameOverlay.innerHTML='';
        gameOverlay.style.transform='';
      }

      // стартовая подсказка

      // DPI-фикс для чёткого пикселя
      function fixDPR(){
        const dpr = Math.max(1, window.devicePixelRatio||1);
        const cvs = [...tiles.map(t=>t.querySelector('canvas')), avatarCanvas];
        cvs.forEach(cv=>{
          const cssW = Math.max(1, parseInt(getComputedStyle(cv).width,10));
          const cssH = Math.max(1, parseInt(getComputedStyle(cv).height,10));
          if(cv.width !== cssW*dpr || cv.height !== cssH*dpr){
            cv.width = cssW*dpr; cv.height = cssH*dpr;
            const ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=false; ctx.setTransform(dpr,0,0,dpr,0,0);
          }
        });
        // перерисовать
        Icons.redraw();
        recalcSteps();
        render();
      }
      addEventListener('resize', fixDPR, {passive:true});
      // чуть позже, чтобы успели примениться CSS-размеры
      requestAnimationFrame(fixDPR);
      setTimeout(fixDPR, 60);
    })();
