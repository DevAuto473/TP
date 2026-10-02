const fs = require('fs');
const path = 'src/styles.css';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

for (let i = 50; i < lines.length; i++) {
  lines[i] = lines[i].replace(/font-weight:\s*(500|600|700|800|900|bold)/g, 'font-weight: 400');
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Bold weights removed successfully!');
