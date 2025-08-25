const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

if(!/@media \(orientation:portrait\)[^}]*\{[^}]*\.grid\{[^}]*grid-template-columns:1fr 1fr;/.test(html)){
  throw new Error('Portrait layout must have two grid columns');
}

if(!/\.screen::before/.test(html)){
  throw new Error('Missing screen glare effect');
}

console.log('All tests passed');
