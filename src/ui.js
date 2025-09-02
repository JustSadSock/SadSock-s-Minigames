(function(global){
  'use strict';
  const UI={};
  UI.score=function(el,label,bestLabel){
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
  UI.attachDPad=function(pad,cb){
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
    UI.autoHidePad(pad);
    return setBtn;
  };
  global.UI=UI;
})(this);
