const process = require('node:process');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('readline');

const input = process.stdin;
const output = process.stdout;
let writeableStream = fs.createWriteStream(path.join(__dirname, './text.txt'));
console.log('Write text for file (for finishing use Ctrl+C or "exit"):');
const rl = readline.createInterface({ input, output });

rl.on('line', function (text) {
  if(text === 'exit') {
    rl.close();
  } else writeableStream.write(`${text}\n`);
});

rl.on('close', function () {
    console.log('Writing to file finished...');
});
