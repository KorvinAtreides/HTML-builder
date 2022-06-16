const fs = require('node:fs');
const path = require('node:path');

const readdir = fs.promises.readdir;
const mkdir = fs.promises.mkdir;
const copyFile = fs.promises.copyFile;
const unlink = fs.promises.unlink;

mkdir(path.join(__dirname, 'files-copy'), {"recursive": true} );
const oldFiles = readdir(path.join(__dirname, './files-copy'), { "withFileTypes": true });
oldFiles.then(filesArray => {
  for (const file of filesArray) unlink(path.join(__dirname, './files-copy', file.name))
});

const files = readdir(path.join(__dirname, 'files'), { "withFileTypes": true });
files.then(filesArray => {
  for (const file of filesArray){
    copyFile(
      path.join(__dirname, 'files', file.name),
      path.join(__dirname, 'files-copy', file.name),
      fs.constants.COPYFILE_FICLONE,
    );
  }
});
