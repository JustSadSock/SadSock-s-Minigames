(function(global){
  'use strict';
  const UI={};
  UI.score=function(el,label,bestLabel){
    if(el) el.classList.add('counter');
    return {
      set(value,best){
        const bl = bestLabel || (global.i18n ? i18n.t('best') : 'best');
        el.textContent=label+': '+value+(best!=null?' ('+bl+': '+best+')':'');
      }
    };
  };
  UI.makeToast=function(el){
    let timer;
    return function(text){
      el.textContent=text;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
      clearTimeout(timer);
      timer=setTimeout(()=>el.classList.remove('show'),2000);
    };
  };
  UI.alert=function(text){
    const wrap=document.createElement('div');
    wrap.className='popup';
    const box=document.createElement('div');
    box.className='box';
    const p=document.createElement('p');
    p.textContent=text;
    const btn=document.createElement('button');
    btn.className='btn';
    btn.textContent=global.i18n ? i18n.t('close') : 'OK';
    btn.dataset.i18n='close';
    if(global.i18n) i18n.applyTranslations(btn);
    btn.addEventListener('click',()=>wrap.remove());
    box.appendChild(p);
    box.appendChild(btn);
    wrap.appendChild(box);
    document.body.appendChild(wrap);
    void wrap.offsetWidth;
    wrap.classList.add('show');
    btn.focus();
  };
    UI.tabs=function(nav,sections){
      const btns=nav.querySelectorAll('[data-tab]');
      const panels=Array.from(sections);
      function activate(id){
        btns.forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
        panels.forEach(p=>p.classList.toggle('active',p.id===id));
      }
      btns.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.tab)));
      if(btns[0]) activate(btns[0].dataset.tab);
    };
    UI.autoHidePad=function(pad){
    if(!pad) return;
    const toggle=document.createElement('button');
    toggle.className='btn pad-toggle';
    toggle.dataset.i18n='showDPad';
    pad.parentElement.appendChild(toggle);
    if(global.i18n) i18n.applyTranslations(toggle);
    const show=()=>{ pad.classList.remove('hidden'); toggle.classList.remove('show'); };
    const hide=()=>{ if(pad.classList.contains('hidden')) return; pad.classList.add('hidden'); toggle.classList.add('show'); };
    toggle.addEventListener('click',e=>{ e.stopPropagation(); show(); });
    addEventListener('keydown',hide);
    addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse' && !pad.contains(e.target) && !toggle.contains(e.target)) hide(); });
  };
  UI.attachDPad=function(pad,cb,surface=document){
    const setBtn=(dir,val)=>{
      const btn=pad.querySelector(`[data-dir="${dir}"]`);
      if(btn) btn.classList.toggle('down',val);
    };
    pad.querySelectorAll('[data-dir]').forEach(btn=>{
      const dir=btn.dataset.dir;
      const on=e=>{e.preventDefault();cb(dir);setBtn(dir,true);};
      const off=e=>{e.preventDefault();setBtn(dir,false);};
      btn.addEventListener('touchstart',on,{passive:false});
      btn.addEventListener('touchend',off,{passive:false});
      btn.addEventListener('touchcancel',off,{passive:false});
      btn.addEventListener('mousedown',on);
      addEventListener('mouseup',off);
      btn.addEventListener('mouseleave',off);
    });
    let sx=0, sy=0;
    surface.addEventListener('touchstart',e=>{
      const t=e.changedTouches[0];
      sx=t.clientX; sy=t.clientY;
    },{passive:true});
    surface.addEventListener('touchend',e=>{
      const t=e.changedTouches[0];
      const dx=t.clientX-sx, dy=t.clientY-sy;
      const ax=Math.abs(dx), ay=Math.abs(dy);
      if(Math.max(ax,ay)<30) return;
      if(ax>ay) cb(dx>0?'right':'left'); else cb(dy>0?'down':'up');
    },{passive:true});
    UI.autoHidePad(pad);
    return setBtn;
  };
  global.UI=UI;
})(this);
