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

console.log('All tests passed');
