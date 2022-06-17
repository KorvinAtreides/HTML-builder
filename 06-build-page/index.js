const fs = require('node:fs');
const path = require('node:path');

const readdir = fs.promises.readdir;
const mkdir = fs.promises.mkdir;
const copyFile = fs.promises.copyFile;
const unlink = fs.promises.unlink;

const projectDir = path.join(__dirname, 'project-dist');

// remove all files and sub-folders from folder
function deleteDir(folderPath) {
  return new Promise ((res) => {
    const oldFiles = readdir(folderPath, { 'withFileTypes': true });
    oldFiles.then(filesArray => {
      for (const file of filesArray) {
        if(file.isFile()) unlink(path.join(folderPath, file.name));
        if(file.isDirectory()) {
          deleteDir(path.join(folderPath, file.name)).then(() => {
            fs.rmdir(path.join(folderPath, file.name), (error) => {});
          })        
        }
      }
      res();
    });
  })
}

// copy all files and sub-folders to another folder
function copyDir(src, dist) {
  return new Promise ((res) => {
    const oldFiles = readdir(src, { 'withFileTypes': true });
    oldFiles.then(filesArray => {
      for (const file of filesArray) {
        if(file.isFile()) {
          copyFile(
            path.join(src, file.name),
            path.join(dist, file.name),
            fs.constants.COPYFILE_FICLONE,
          );
        }
        if(file.isDirectory()){
          mkdir(path.join(dist, file.name), { 'recursive': true }).then(() =>{
            copyDir(path.join(src, file.name), path.join(dist, file.name));
          })
        } 
      }
      res();
    });
  })
}

// replace all components in html
function replaceString(string) {
  return new Promise((res, rej) => {
    let posStart = string.indexOf('{{', 0);
    if (posStart !== -1) {
    let posEnd = string.indexOf('}}', posStart);
      let componentName = string.slice(posStart+2, posEnd);
      const readComponent = fs.createReadStream(
        path.join(__dirname, 'components' ,`${componentName}.html`), { "encoding": "utf-8" }
      );
      readComponent.on('data', (compData) => {
        finalString = string.replace(`{{${componentName}}}`, compData);
        posStart = finalString.indexOf('{{', 0);
        if(posStart === -1) {
          res(finalString);
        } else replaceString(finalString).then((replacedString)=> res(replacedString));
      })
    }
  })
}

mkdir(projectDir, { 'recursive': true });
deleteDir(projectDir).then(() => {

  // add all styles to styles.css
  const writeableStream = fs.createWriteStream(path.join(projectDir, 'style.css'));
  const files = readdir(path.join(__dirname, 'styles'), { 'withFileTypes': true });
  files.then(filesArray => {
    for (const file of filesArray) {
      if(!file.isFile()) continue;
      const nameArray = file.name.split('.');
      if (nameArray[nameArray.length-1] !== 'css') continue;
      const readableStream = fs.createReadStream(path.join(__dirname, 'styles', file.name));
      readableStream.pipe(writeableStream);
    }
  });

  // copy assets
  const assetsDir = path.join(__dirname, 'project-dist', 'assets');
  mkdir(assetsDir, { 'recursive': true }).then(() => copyDir(path.join(__dirname,'assets'), assetsDir));

  // create html file
  const writeableHTMLStream = fs.createWriteStream(path.join(projectDir, 'index.html'));
  const readable = fs.createReadStream(path.join(__dirname, 'template.html'), { "encoding": "utf-8" });
  readable.on('data', (chunk) => {
    let finalString = chunk;
    let posStart = chunk.indexOf('{{', 0);
    if(posStart !== -1) {
      const replacePromise = replaceString(finalString);
      replacePromise.then((replacedString) => {
        finalString = replacedString;
        writeableHTMLStream.write(finalString);
      });
    }
  });
})
