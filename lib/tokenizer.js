'use strict';

const tokens = {
  request: reqres,
  response: reqres
};

module.exports = {
  process,
  tokens
};

/**
 *
 * @param name
 * @param value
 * @returns {*}
 */
function process(name, value) {
  if (tokens[name]) {
    return tokens[name](value);
  }

  return value || true;
}

/**
 *
 * @param value
 * @returns {{key: (string|*|void|XML), type: *, description: *, optional: boolean}}
 */
function reqres(value) {
  const [, matchedKey, matchedType, description] = value.match(/^([^ ]+) *({[^}]+})? *([\s\S\w\W]+)?/);
  const key = matchedKey.replace(/[\[\]]/g, '');
  const type = matchedType ? matchedType.replace(/[\{\}}]/g, '') : undefined;
  const optional = /^\[/.test(matchedKey);

  return { key, type, description, optional };
}