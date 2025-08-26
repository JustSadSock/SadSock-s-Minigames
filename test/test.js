const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const audio = fs.readFileSync('audio.js', 'utf8');
const retro = fs.readFileSync('retrofx.js','utf8');

if(!/class="reel"/.test(html)){
  throw new Error('Reel container missing');
}

if(!/function render\(\)/.test(html)){
  throw new Error('Missing render logic');
}
if(!/function snap\(dir\)/.test(html)){
  throw new Error('Missing snap function');
}

if(/class="panel"/.test(html)){
  throw new Error('Panel should be removed');
}

if(/class="dpad"/.test(html)){
  throw new Error('D-pad should be removed');
}

if(/id="scrollUp"/.test(html) || /id="scrollDown"/.test(html)){
  throw new Error('Scroll arrows should be removed');
}

if(!/class="static"/.test(html)){
  throw new Error('Static overlay missing');
}

if(/crtFlicker/.test(html)){
  throw new Error('CRT flicker should be removed');
}

if(!/calc\(-50% \+ var\(--slotY\)\)/.test(html)){
  throw new Error('Tiles not centered');
}

if(!/var\(--slotRot\)/.test(html)){
  throw new Error('Rotation variable missing');
}

if(!/const cols = 2/.test(html)){
  throw new Error('Reel should use two columns');
}

if(!/--slotBlur/.test(html)){
  throw new Error('Blur variable missing');
}

if(!/rgba\(255,255,255,.10\)/.test(html)){
  throw new Error('Mobile scanline gradient missing');
}

if(!/blur\(.5px\)/.test(html)){
  throw new Error('Inactive tile blur missing');
}

if(!/mask-image:linear-gradient\(to bottom, transparent 0%, rgba\(0,0,0,.85\) 10%, rgba\(0,0,0,1\) 90%, transparent 100%\)/.test(html)){
  throw new Error('Reel mask missing');
}
if(!/perspective:var\(--persp\)/.test(html)){
  throw new Error('Perspective variable missing');
}

if(!/id="settingsBtn"/.test(html)){
  throw new Error('Settings button missing');
}

if(!/id="settingsMenu"/.test(html)){
  throw new Error('Settings menu missing');
}

if(!/id="volume"/.test(html)){
  throw new Error('Volume slider missing');
}

if(!/id="fullscreenBtn"/.test(html)){
  throw new Error('Fullscreen button missing');
}

if(!/width:320px/.test(html)){
  throw new Error('Menu width not expanded');
}

if(!/MAX_PARTICLES=100/.test(retro)){
  throw new Error('Particle cap missing');
}

if(!/grid-template-columns:80px 24px 1fr 24px/.test(html)){
  throw new Error('Avatar arrow alignment grid missing');
}

if(!/setVolume\(v\)/.test(audio)){
  throw new Error('setVolume not implemented');
}

const tileCount = (html.match(/class="tile"/g)||[]).length;
if(tileCount !== 16){
  throw new Error('Expected 16 tiles');
}

console.log('All tests passed');
