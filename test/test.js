const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const audio = fs.readFileSync('audio.js', 'utf8');

if(!/class="reel"/.test(html)){
  throw new Error('Reel container missing');
}

if(!/function updateReel\(\)/.test(html)){
  throw new Error('Missing updateReel logic');
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

if(!/var\(--slotX\)/.test(html)){
  throw new Error('Missing slotX variable');
}

if(!/const cols = 2/.test(html)){
  throw new Error('Reel should use two columns');
}

if(!/--slotZ/.test(html)){
  throw new Error('Depth variable missing for tiles');
}

if(!/0 8px 0/.test(html)){
  throw new Error('Tile depth shadow missing');
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
