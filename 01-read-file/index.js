const fs = require('node:fs');
const path = require('node:path');

const readable = fs.createReadStream(path.join(__dirname, './text.txt'));
readable.on('data', (chunk) => {
  console.log(`${chunk}`);
});