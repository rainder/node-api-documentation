'use strict';

const _ = require('lodash');
const util = require('util');
const tokenizer = require('./tokenizer');

module.exports = {
  parse
};

function parse(fileData) {
  const result = {};

  for (let file of fileData) {
    let lastIndex = 0;

    while (true) {
      const indexes = findIndexes(file.contents, lastIndex);

      if (!indexes.found) {
        break;
      }

      lastIndex = indexes.end;

      const comment = file.contents.substr(indexes.start, indexes.end - indexes.start);

      if (!isApiDocumentationComment(comment)) {
        continue;
      }
      const documentationType = getApiDocumentationType(comment);

      const data = parseComment(comment);
      data['@metadata'] = file.metadata;

      result[documentationType] = result[documentationType] || [];
      result[documentationType].push(data);
    }
  }

  return result;
}

/**
 *
 */
function findIndexes(string, fromIndex = 0) {
  const result = {
    found: false,
    start: null,
    end: null
  };
  result.start = string.indexOf('/**', fromIndex);
  if (result.start !== -1) {
    result.end = string.indexOf('*/', result.start);

    if (result.end !== -1) {
      result.end += 2;
      result.found = true;
    }
  }

  return result;
}

/**
 *
 * @param comment
 * @returns {boolean}
 */
function isApiDocumentationComment(comment) {
  return comment.toLowerCase().indexOf('@api-documentation') !== -1;
}

/**
 *
 * @param comment
 * @returns {*}
 */
function getApiDocumentationType(comment) {
  const match = comment.match(/@api-documentation *([^ \n\r\t]+)/)
  if (!match) {
    throw new Error('@api-documentation {type} is required');
  }

  return match[1];
}

function parseComment(comment) {
  comment = comment.replace(/^ *\*[ \/]?/mg, '');
  const indexes = [];
  const parts = [];

  comment.replace(/^ *@/gm, function (m, index) {
    indexes.push(index);
  });

  indexes.reduce((a, b) => {
    parts.push(comment.substr(a, b - a).trim());
    return b;
  });

  parts.push(comment.substr(indexes[indexes.length - 1]).trim());

  return parts.reduce(reduceMatches, {});

  /**
   *
   * @param result
   * @param item
   * @returns {*}
   */
  function reduceMatches(result, item) {
    const match = item.match(/^@([a-zA-Z-_]+)(\[\])?/);
    const name = match[1].trim();

    if (match[2] === '[]') {
      const value = item.substr(name.length + 3).trim();
      result[name] = result[name] || [];
      result[name].push(tokenizer.process(name, value));
    }

    if (match[2] === undefined) {
      const value = item.substr(name.length + 1).trim();
      result[name] = tokenizer.process(name, value);
    }

    return result;
  }
}