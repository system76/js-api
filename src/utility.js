import camelCase from 'lodash/camelCase.js'
import isPlainObject from 'lodash/isPlainObject.js'
import kebabCase from 'lodash/kebabCase.js'
import lodashSnakeCase from 'lodash/snakeCase.js'

export { camelCase, kebabCase }

// Fixes converting `testValue23` to `test_value23` instead of `test_value_23`
export function snakeCase (str) {
  return str
    .split('.')
    .map(lodashSnakeCase)
    .join('.')
    .replace(/_([0-9]+)/igm, '$1')
}

export function recursive (obj, fn) {
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

export function combinePaths (...paths) {
  return paths
    .filter((p) => (p != null))
    .map((p) => p.trim())
    .map((p, i) => (i !== 0) ? p.replace(/^[/]+/, '') : p)
    .map((p, i, a) => (i !== a.length - 1) ? p.replace(/[/]+$/, '') : p)
    .join('/')
}
