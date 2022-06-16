const fs = require('node:fs');
const path = require('node:path');

const readdir = fs.promises.readdir;
const files = readdir(path.join(__dirname, './secret-folder'), { "withFileTypes": true });
files.then(filesArray => {
  for (const file of filesArray){
    if(!file.isFile()) continue;
    const [name, type] = file.name.split('.');
    fs.stat(path.join(__dirname, './secret-folder', file.name), (err, stats) => {
      console.log(`${name} - ${type} - ${stats.size} bytes`);
    })   
  }
})


