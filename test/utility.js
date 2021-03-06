const test = require('ava')

const utility = require('../src/utility')

test('snake case does not seperate numbers from text', (t) => {
  t.is(utility.snakeCase('testValue123'), 'test_value123')
})

test('recursive modifies key values deep in an object', (t) => {
  const input = {
    key: {
      deep_key: {
        deepist_key: 'test'
      }
    }
  }

  t.deepEqual(utility.recursive(input, (k) => 'test'), {
    test: {
      test: {
        test: 'test'
      }
    }
  })
})

test('combinePaths strips duplicate slashes', (t) => {
  t.is(utility.combinePaths('/test/', '/more/', '/stuff/'), '/test/more/stuff/')
})

test('combinePaths removes null values', (t) => {
  t.is(utility.combinePaths('/test/', null, '/value/'), '/test/value/')
})

test('objectNotation converts dots to objects', (t) => {
  t.deepEqual(utility.objectNotation(['a.b.c', 'a.f.g', 'a.b.e.l']), {
    a: {
      b: {
        c: {},
        e: {
          l: {}
        }
      },
      f: {
        g: {}
      }
    }
  })
})
