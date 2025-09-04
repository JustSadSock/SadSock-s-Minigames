(function(){
  function show(){
    const msg=document.createElement('div');
    msg.textContent='Failed to load scripts. Run "npm run dev" and open via http://localhost:5173/';
    msg.style.cssText='position:fixed;top:0;left:0;width:100%;padding:1rem;background:#300;color:#ffca3a;font-family:sans-serif;text-align:center';
    document.body.innerHTML='';
    document.body.appendChild(msg);
  }
  if(location.protocol==='file:'){
    show();
  }
  window.addEventListener('error', e=>{
    if(e.target && e.target.tagName==='SCRIPT'){
      show();
    }
  }, true);
  window.addEventListener('unhandledrejection', e=>{
    const msgText=e.reason && e.reason.message || '';
    if(msgText.includes('Failed to fetch') || msgText.includes('module')){
      show();
    }
  });
})();
