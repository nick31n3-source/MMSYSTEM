const fs = require('fs');
const content = fs.readFileSync('src/components/MenuManagement.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Array.isArray(inventory)')) {
    console.log(`${i+1}: ${l}`);
  }
});
