const camelCase = require('lodash/camelCase')
const defaultsDeep = require('lodash/defaultsDeep')
const get = require('lodash/get')
const isPlainObject = require('lodash/isPlainObject')
const kebabCase = require('lodash/kebabCase')
const set = require('lodash/set')
const lodashSnakeCase = require('lodash/snakeCase')

// Fixes converting `testValue23` to `test_value23` instead of `test_value_23`
function snakeCase (str) {
  return str
    .split('.')
    .map(lodashSnakeCase)
    .join('.')
    .replace(/_([0-9]+)/igm, '$1')
}

function recursive (obj, fn) {
  if (isPlainObject(obj) === false) {
    return obj
  }

  const out = {}

  for (const key of Object.keys(obj)) {
    const newKey = fn(key)

    if (isPlainObject(obj[key])) {
      out[newKey] = recursive(obj[key], fn)
    } else if (Array.isArray(obj[key])) {
      out[newKey] = obj[key].map((v) => recursive(v, fn))
    } else {
      out[newKey] = obj[key]
    }
  }

  return out
}

function combinePaths (...paths) {
  return paths
    .filter((p) => (p != null))
    .map((p) => p.trim())
    .map((p, i) => (i !== 0) ? p.replace(/^[/]+/, '') : p)
    .map((p, i, a) => (i !== a.length - 1) ? p.replace(/[/]+$/, '') : p)
    .join('/')
}

function objectNotation (dots = []) {
  return dots.reduce((obj, dot) => {
    if (get(obj, dot) == null) {
      set(obj, dot, {})
    }

    return obj
  }, {})
}

module.exports = {
  camelCase,
  get,
  defaultsDeep,
  kebabCase,
  snakeCase,
  recursive,
  combinePaths,
  objectNotation
}
