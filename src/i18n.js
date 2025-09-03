const cache = {};
let currentLang = 'en';

export async function setLang(lang){
  if(cache[lang]){
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    applyTranslations();
    return;
  }
  const res = await fetch(`i18n/${lang}.json`);
  cache[lang] = await res.json();
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
}

export function t(key){
  return cache[currentLang]?.[key] ?? key;
}

export function applyTranslations(root=document){
  const dict = cache[currentLang];
  if(!dict) return;
  root.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.dataset.i18n;
    const txt = dict[key];
    if(txt !== undefined){
      if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
        el.value = txt;
      }else{
        el.textContent = txt;
      }
    }
  });
  root.querySelectorAll('*').forEach(el=>{
    for(const [k,v] of Object.entries(el.dataset)){
      if(k.startsWith('i18n') && k !== 'i18n'){
        const attr = k
          .slice(4)
          .replace(/^[A-Z]/, c => c.toLowerCase())
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase();
        const val = dict[v];
        if(val !== undefined){
          el.setAttribute(attr, val);
        }
      }
    }
  });
}

export function getLang(){
  return currentLang;
}

const init = localStorage.getItem('lang') || document.documentElement.lang || 'en';
setLang(init);

window.i18n = { t, setLang, applyTranslations, get lang(){ return currentLang; } };

