const test = require('ava')

const { normalize } = require('../src/js-api')

test('adds id and type to top level', (t) => {
  t.deepEqual(normalize({
    id: '1',
    type: 'test'
  }), {
    id: '1',
    type: 'test'
  })
})

test('returns just attributes if no relationships', (t) => {
  t.deepEqual(normalize({
    id: '1',
    type: 'test',
    attributes: { key: 'value' }
  }), {
    id: '1',
    type: 'test',
    key: 'value'
  })
})

test('includes an array of relationships', (t) => {
  const input = {
    id: '1',
    type: 'test',
    relationships: {
      nested: {
        data: [{
          id: '2',
          type: 'test'
        }, {
          id: '3',
          type: 'test'
        }]
      }
    }
  }

  const includes = [{
    id: '2',
    type: 'test'
  }, {
    id: '3',
    type: 'test'
  }]

  t.deepEqual(normalize(input, includes, ['nested']), {
    id: '1',
    type: 'test',
    nested: [{
      id: '2',
      type: 'test'
    }, {
      id: '3',
      type: 'test'
    }]
  })
})

test('includes deeply nested includes', (t) => {
  const input = {
    id: '1',
    type: 'test',
    relationships: {
      two: {
        data: {
          id: '2',
          type: 'test'
        }
      }
    }
  }

  const includes = [{
    id: '2',
    type: 'test',
    relationships: {
      three: {
        data: {
          id: '3',
          type: 'test'
        }
      }
    }
  }, {
    id: '3',
    type: 'test',
    attributes: {
      key: 'value'
    }
  }]

  t.deepEqual(normalize(input, includes, ['two.three']), {
    id: '1',
    type: 'test',
    two: {
      id: '2',
      type: 'test',
      three: {
        id: '3',
        type: 'test',
        key: 'value'
      }
    }
  })
})
