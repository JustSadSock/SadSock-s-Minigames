const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles/main.css', 'utf8');
const main = fs.readFileSync('src/main.js', 'utf8');

if(!/class="reel"/.test(html)){
  throw new Error('Reel container missing');
}

if(!/grid-template-columns:repeat\(auto-fill,16px\)/.test(css)){
  throw new Error('Icon grid missing');
}

if(!/@keyframes iconHop/.test(css)){
  throw new Error('Icon hover animation missing');
}

if(!/reel.classList.add\('zoom'\)/.test(main)){
  throw new Error('Zoom effect missing');
}

const tileCount = (html.match(/class="tile"/g)||[]).length;
if(tileCount !== 11){
  throw new Error('Expected 11 tiles');
}

console.log('All tests passed');
