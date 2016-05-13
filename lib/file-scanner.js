'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  scan,
  readAll
};

/**
 *
 * @param dir
 * @returns {*[]}
 */
function *scan(dir) {
  const files = [].concat(...dir);

  for (let file of files) {
    const stat = yield cb => fs.stat(file, cb);

    if (stat.isDirectory()) {
      const filesInDir = yield cb => fs.readdir(file, cb)
      files.push(...filesInDir.map(s => path.resolve(file, s)));
    }
  }

  return files;
}

/**
 *
 * @param files
 * @returns {*}
 */
function *readAll(files) {
  const result = [];
  const options = {
    encoding: 'utf8'
  };

  for (let file of files) {
    const contents = yield cb => fs.readFile(file, options, cb);
    result[result.length] = { file, contents };
  }

  return result;
}