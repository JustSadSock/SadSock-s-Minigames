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

console.log('All tests passed');
