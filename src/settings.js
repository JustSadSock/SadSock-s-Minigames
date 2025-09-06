import { setLang, getLang, applyTranslations } from './i18n.js';
import './pixel-widgets.js';

// Apply saved preferences early
const savedTheme = localStorage.getItem('theme');
if(savedTheme){
  document.documentElement.dataset.theme = savedTheme;
}
const savedDur = localStorage.getItem('scrollDur');
if(savedDur){
  document.documentElement.style.setProperty('--dur', savedDur + 'ms');
}

export function initSettings(onSpeedChange){
  const menu = document.createElement('div');
  menu.id = 'settingsMenu';
  menu.className = 'menu';
  menu.setAttribute('role', 'dialog');
  menu.dataset.i18nAriaLabel = 'settings';
  menu.innerHTML = `
    <div class="row wide">
      <span data-i18n="volume"></span>
      <pixel-range><input id="volume" type="range" min="0" max="1" step="0.05" value="0.3" data-i18n-aria-label="volume" /></pixel-range>
    </div>
    <div class="row wide">
      <span data-i18n="music"></span>
      <p-button id="musicBtn" class="pbtn" data-i18n="musicOn" data-i18n-aria-label="music"></p-button>
    </div>
    <div class="row wide">
      <span data-i18n="screen"></span>
      <p-button id="fullscreenBtn" class="pbtn" data-i18n="fullscreen" data-i18n-aria-label="fullscreen">Fullscreen</p-button>
    </div>
    <div class="row wide">
      <label for="langSelect" data-i18n="language"></label>
      <pixel-select><select id="langSelect">
        <option value="en" data-i18n="selectEnglish">English</option>
        <option value="ru" data-i18n="selectRussian">Русский</option>
        <option value="uk" data-i18n="selectUkrainian">Українська</option>
      </select></pixel-select>
    </div>
    <div class="row wide">
      <label for="themeSelect" data-i18n="theme"></label>
      <pixel-select><select id="themeSelect">
        <option value="auto" data-i18n="themeAuto">Auto</option>
        <option value="light" data-i18n="themeLight">Light</option>
        <option value="dark" data-i18n="themeDark">Dark</option>
      </select></pixel-select>
    </div>
    <div class="row wide">
      <span data-i18n="scrollSpeed"></span>
      <pixel-range><input id="speed" type="range" min="100" max="500" step="20" value="180" data-i18n-aria-label="scrollSpeed" /></pixel-range>
    </div>
    <div style="text-align:center"><p-button id="settingsOk" class="pbtn" data-i18n="ok" data-i18n-aria-label="close">OK</p-button></div>
  `;
  document.body.appendChild(menu);
  applyTranslations(menu);

  const settingsBtn = document.getElementById('settingsBtn');
  const volumeSlider = menu.querySelector('#volume');
  const musicBtn = menu.querySelector('#musicBtn');
  const fullscreenBtn = menu.querySelector('#fullscreenBtn');
  const settingsOk = menu.querySelector('#settingsOk');
  const langSelect = menu.querySelector('#langSelect');
  const themeSelect = menu.querySelector('#themeSelect');
  const speedSlider = menu.querySelector('#speed');

  if(onSpeedChange){
    const cur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur'));
    onSpeedChange(cur);
  }

  settingsBtn.addEventListener('click',()=>{
    const show = menu.classList.toggle('show');
    if(show){
      volumeSlider.value = Sound.getVolume();
      langSelect.value = getLang();
      themeSelect.value = document.documentElement.dataset.theme || 'auto';
      speedSlider.value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur'));
    }
    Sound.fx(show?'open':'close');
  });

  settingsOk.addEventListener('click',()=>{
    menu.classList.remove('show');
    Sound.fx('select');
  });

  const savedVolume = localStorage.getItem('volume');
  if(savedVolume!==null){ Sound.setVolume(parseFloat(savedVolume)); }
  volumeSlider.value = Sound.getVolume();
  volumeSlider.addEventListener('input',e=>{
    Sound.setVolume(parseFloat(e.target.value));
    localStorage.setItem('volume', e.target.value);
  });

  let musicEnabled = localStorage.getItem('music') !== 'off';
  function updateMusic(){
    musicBtn.dataset.i18n = musicEnabled ? 'musicOn' : 'musicOff';
    applyTranslations(musicBtn);
    if(musicEnabled) Sound.start(); else Sound.stop();
  }
  musicBtn.addEventListener('click',()=>{
    musicEnabled = !musicEnabled;
    localStorage.setItem('music', musicEnabled ? 'on' : 'off');
    updateMusic();
    Sound.fx('option');
  });
  updateMusic();

  fullscreenBtn.addEventListener('click',()=>{
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen();
    }else{
      document.exitFullscreen();
    }
    Sound.fx('option');
  });

  langSelect.addEventListener('change', e=>{
    setLang(e.target.value);
  });

  themeSelect.addEventListener('change', e=>{
    const val = e.target.value;
    if(val === 'auto'){
      delete document.documentElement.dataset.theme;
      localStorage.removeItem('theme');
    }else{
      document.documentElement.dataset.theme = val;
      localStorage.setItem('theme', val);
    }
  });

  speedSlider.addEventListener('input', e=>{
    const ms = parseInt(e.target.value,10);
    document.documentElement.style.setProperty('--dur', ms + 'ms');
    if(onSpeedChange) onSpeedChange(ms);
  });
  speedSlider.addEventListener('change', e=>{
    localStorage.setItem('scrollDur', e.target.value);
  });
}
