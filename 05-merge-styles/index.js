const fs = require('node:fs');
const path = require('node:path');

const readdir = fs.promises.readdir;
const unlink = fs.promises.unlink;
const bundlePath = path.join(__dirname, 'project-dist','bundle.css');

unlink(bundlePath).catch((error) => {}).finally(() =>{
  const writeableStream = fs.createWriteStream(bundlePath);
  const files = readdir(path.join(__dirname, 'styles'), { 'withFileTypes': true });
  files.then(filesArray => {
    for (const file of filesArray){
      if(!file.isFile()) continue;
      const nameArray = file.name.split('.');
      if (nameArray[nameArray.length-1] !== 'css') continue;
      const readableStream = fs.createReadStream(path.join(__dirname, 'styles', file.name));
      readableStream.pipe(writeableStream);
    }
  });
})
