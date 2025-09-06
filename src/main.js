import './audio.js';
import './icons.js';
import './ui.js';
import { t } from './i18n.js';
import { initSettings } from './settings.js';

(function(){
      'use strict';
      const sandboxMsg='You are using an unsupported command-line flag: --no-sandbox';
      function hideSandbox(){
        document.querySelectorAll('div').forEach(el=>{
          if(el.textContent&&el.textContent.trim().startsWith(sandboxMsg)) el.remove();
        });
      }
      hideSandbox();
      new MutationObserver(hideSandbox).observe(document.documentElement,{childList:true,subtree:true});
      const $ = (s,p=document)=>p.querySelector(s);
      const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
      const nickDisplay = $('#nickDisplay');
      const avatarCanvas = $('#avatarCanvas');
      avatarCanvas.width = avatarCanvas.height = 48;
      const avatarBtn = $('#avatarBtn');
      const avatarOverlay = $('#avatarOverlay');
      const reel = $('.reel');
      const allTiles = $$('.reel .tile');
      const catBtns = $$('#catNav p-button');
      const gameOverlay = $('#gameOverlay');
      const screenEl = $('.screen');
      let currentTile=null;
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
      const settingsCanvas = $('#settingsCanvas');
      settingsCanvas.width = settingsCanvas.height = 32;
      const gearCtx = settingsCanvas.getContext('2d',{alpha:false});
      gearCtx.imageSmoothingEnabled=false;
      (function drawGear(){
        const S=2; clear(gearCtx); gearCtx.fillStyle='#2d1600';
        const g=[[3,0],[4,0],[5,0],[6,0],[7,1],[8,2],[9,3],[9,4],[9,5],[8,6],[7,7],[6,8],[5,8],[4,9],[3,9],[2,8],[1,7],[0,6],[0,5],[0,4],[0,3],[1,2],[2,1]];
        g.forEach(([x,y])=>px(gearCtx,x,y,S,'#2d1600'));
        ['#ffca3a'].forEach(c=>{
          px(gearCtx,4,4,S,c); px(gearCtx,5,4,S,c); px(gearCtx,4,5,S,c); px(gearCtx,5,5,S,c);
        });
      })();

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

      /* ---------- Витрина и навигация ---------- */
      const tiles = allTiles;

      function switchCategory(cat){
        catBtns.forEach(b=>b.classList.toggle('active', b.dataset.cat===cat));
        allTiles.forEach(t=>{ t.style.display = t.dataset.cat===cat ? '' : 'none'; });
      }

      switchCategory('game');
      catBtns.forEach(btn=>{
        btn.addEventListener('click',()=>{
          if(btn.dataset.cat==='settings'){ $('#settingsBtn').click(); return; }
          switchCategory(btn.dataset.cat);
        });
      });

      tiles.forEach(t=>{
        t.addEventListener('click',()=>{
          if(t.dataset.game){ openGame(t); }
        });
      });

      async function openGame(tile){
        try{ Sound.fx('select'); }catch(e){}
        currentTile = tile;
        const gameSrc = tile.dataset.game;
        reel.classList.add('zoom');

        function startExpand(){
          reel.removeEventListener('transitionend', startExpand);
          const rect = tile.getBoundingClientRect();
          const srect = screenEl.getBoundingClientRect();
          const canvas = tile.querySelector('canvas');
          const clone = canvas.cloneNode(true);
          clone.getContext('2d').drawImage(canvas,0,0);
          tile.style.visibility='hidden';
          gameOverlay.innerHTML='';
          gameOverlay.appendChild(clone);
          gameOverlay.classList.add('show');
          const scaleX = rect.width/srect.width;
          const scaleY = rect.height/srect.height;
          const offsetX = rect.left - srect.left;
          const offsetY = rect.top - srect.top;
          gameOverlay.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scaleX},${scaleY})`;
          requestAnimationFrame(()=>{ gameOverlay.style.transform='translate(0px,0px) scale(1)'; });
          let started=false;
          async function launch(){
            if(started) return;
            started=true;
            gameOverlay.removeEventListener('transitionend', launch);
            gameOverlay.innerHTML='';
            await loadGame(gameSrc);
            const close=document.createElement('p-button');
            close.className='pbtn close';
            close.id='gameClose';
            close.dataset.i18n='home';
            close.textContent=t('home');
            gameOverlay.appendChild(close);
            $('#gameClose').addEventListener('click', closeGame);
            screenEl.classList.add('playing');
          }
          gameOverlay.addEventListener('transitionend', launch);
          setTimeout(launch, DUR+50);
        }

        reel.addEventListener('transitionend', startExpand);
        setTimeout(startExpand, DUR+50);
      }

      function loadGame(src){
        return new Promise(res=>{
          const frame=document.createElement('iframe');
          frame.src=src;
          frame.addEventListener('load', res, {once:true});
          gameOverlay.appendChild(frame);
        });
      }

      function closeGame(){
        screenEl.classList.remove('playing');
        const tile=currentTile;
        if(tile){
          const rect = tile.getBoundingClientRect();
          const srect = screenEl.getBoundingClientRect();
          const canvas = tile.querySelector('canvas');
          const clone = canvas.cloneNode(true);
          clone.getContext('2d').drawImage(canvas,0,0);
          gameOverlay.innerHTML='';
          gameOverlay.appendChild(clone);
          const scaleX = rect.width/srect.width;
          const scaleY = rect.height/srect.height;
          const offsetX = rect.left - srect.left;
          const offsetY = rect.top - srect.top;
          gameOverlay.style.transform='translate(0px,0px) scale(1)';
          requestAnimationFrame(()=>{
            gameOverlay.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scaleX},${scaleY})`;
          });
          let finished=false;
          function end(){
            if(finished) return;
            finished=true;
            gameOverlay.removeEventListener('transitionend', end);
            gameOverlay.classList.remove('show');
            gameOverlay.style.transform='';
            gameOverlay.innerHTML='';
            tile.style.visibility='';
            currentTile=null;
          }
          gameOverlay.addEventListener('transitionend', end);
          setTimeout(end, DUR+50);
        }else{
          gameOverlay.classList.remove('show');
          gameOverlay.innerHTML='';
          gameOverlay.style.transform='';
        }
        requestAnimationFrame(()=> reel.classList.remove('zoom'));
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
      }
      addEventListener('resize', fixDPR, {passive:true});
      // чуть позже, чтобы успели примениться CSS-размеры
      requestAnimationFrame(fixDPR);
      setTimeout(fixDPR, 60);
    })();
