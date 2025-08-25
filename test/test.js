const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

if(!/class="reel"/.test(html)){
  throw new Error('Reel container missing');
}

if(!/function updateReel\(\)/.test(html)){
  throw new Error('Missing updateReel logic');
}

if(!/class="panel"/.test(html)){
  throw new Error('Panel missing');
}

if(!/class="slot"/.test(html)){
  throw new Error('Coin slot missing');
}

if(!/class="static"/.test(html)){
  throw new Error('Static overlay missing');
}

if(!/calc\(-50% \+ var\(--slotY\)\)/.test(html)){
  throw new Error('Tiles not centered');
}

if(!/var\(--slotX\)/.test(html)){
  throw new Error('Missing slotX variable');
}

const tileCount = (html.match(/class="tile"/g)||[]).length;
if(tileCount !== 12){
  throw new Error('Expected 12 tiles');
}

if(!/id="scrollUp"/.test(html) || !/id="scrollDown"/.test(html)){
  throw new Error('Scroll arrows missing');
}

console.log('All tests passed');
