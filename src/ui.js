(function(global){
  'use strict';
  const UI={};
  UI.score=function(el,label){
    return {
      set(value,best){
        el.textContent=label+': '+value+(best!=null?' (лучший: '+best+')':'');
      }
    };
  };
  UI.makeToast=function(el){
    return function(text){
      el.textContent=text;
      el.style.display='block';
      setTimeout(()=>{el.style.display='none';},2000);
    };
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
    return setBtn;
  };
  global.UI=UI;
})(this);
