const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles/main.css','utf8');
const main = fs.readFileSync('src/main.js','utf8');
const audio = fs.readFileSync('src/audio.js', 'utf8');
const retro = fs.readFileSync('src/retrofx.js','utf8');
const icons = fs.readFileSync('src/icons.js','utf8');

if(!/class="reel"/.test(html)){
  throw new Error('Reel container missing');
}

if(!/function render\(\)/.test(main)){
  throw new Error('Missing render logic');
}
if(!/function snap\(dist\)/.test(main)){
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

if(!/calc\(-50% \+ var\(--slotY\)\)/.test(css)){
  throw new Error('Tiles not centered');
}

if(!/var\(--slotRot\)/.test(css)){
  throw new Error('Rotation variable missing');
}

if(!/const cols = 2/.test(main)){
  throw new Error('Reel should use two columns');
}

if(!/overlap/.test(main)){
  throw new Error('Overlap variable missing');
}

if(!/--slotBlur/.test(css)){
  throw new Error('Blur variable missing');
}
if(!/touchmove/.test(main)){
  throw new Error('touchmove handler missing');
}

if(!/rgba\(255,255,255,.10\)/.test(css)){
  throw new Error('Mobile scanline gradient missing');
}

if(!/blur\(.5px\)/.test(css)){
  throw new Error('Inactive tile blur missing');
}
if(/tile\[data-active="0"\][^}]*opacity/.test(css)){
  throw new Error('Inactive tile should not fade');
}

if(!/mask-image:linear-gradient\(to bottom, transparent 0%, rgba\(0,0,0,.85\) 10%, rgba\(0,0,0,1\) 90%, transparent 100%\)/.test(css)){
  throw new Error('Reel mask missing');
}
if(!/perspective:var\(--persp\)/.test(css)){
  throw new Error('Perspective variable missing');
}

if(!/id="settingsBtn"/.test(html)){
  throw new Error('Settings button missing');
}

// Settings UI is now injected dynamically, so only the button remains in HTML.

if(!/width:320px/.test(css)){
  throw new Error('Menu width not expanded');
}

if(!/MAX_PARTICLES=100/.test(retro)){
  throw new Error('Particle cap missing');
}


if(!/setVolume\(v\)/.test(audio)){
  throw new Error('setVolume not implemented');
}


if(!/touchStartT/.test(main)){
  throw new Error('Touch inertia timing missing');
}
if(!/index\s*=\s*\(Math\.round\(index \+ dist\) % rows \+ rows\) % rows;/.test(main)){
  throw new Error('Index wrap missing');
}

if(!/drawImage/.test(icons)){
  throw new Error('Icons should use cached drawImage');
}

// ensure icon canvases render as 16x16 sprites without distortion
if(!/cv\.width\s*=\s*16/.test(icons) || !/cv\.height\s*=\s*16/.test(icons)){
  throw new Error('Icon canvas dimensions incorrect');
}

const cssMin = css.replace(/\s+/g,'');
if(!/\.tilecanvas\{[^}]*width:calc\(100%-16px\);[^}]*height:calc\(100%-16px\);[^}]*margin:8px8px16px;/.test(cssMin)){
  throw new Error('Tile canvas styling broken');
}

// verify that all games referenced from the menu exist on disk
const gameFiles = [...html.matchAll(/data-game="([^"]+)"/g)].map(m=>m[1]);
for(const file of gameFiles){
  if(!fs.existsSync(file)){
    throw new Error(`Missing game file: ${file}`);
  }
  const content = fs.readFileSync(file, 'utf8');
  if(!/styles\/game.css/.test(content)){
    throw new Error(`Missing game.css link in ${file}`);
  }
  if(!/<canvas/i.test(content)){
    throw new Error(`Game ${file} missing canvas`);
  }
}
const tileCount = (html.match(/class="tile"/g)||[]).length;
if(tileCount !== 11){
  throw new Error('Expected 11 tiles');
}

console.log('All tests passed');