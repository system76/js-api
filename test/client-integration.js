const test = require('ava')
const fetchMock = require('fetch-mock')

const Client = require('../src/client')
const ApiError = require('../src/error')

const HOST = 'http://example.com'

test.beforeEach((t) => {
  t.context.path = `/${Math.random().toString(36).substring(2, 15)}`
  t.context.url = `${HOST}${t.context.path}`

  t.context.client = new Client({ baseUrl: HOST })
})

test('token option can be a function to get resolved', async (t) => {
  fetchMock.get({
    url: t.context.url,
    headers: { authorization: 'test' }
  }, 200)

  const client = new Client({
    baseUrl: HOST,
    token: () => 'test'
  })

  await t.notThrowsAsync(() => client.get(t.context.path))
})

test('202 status codes return null data', async (t) => {
  fetchMock.get(t.context.url, 202)
  const res = await t.context.client.get(t.context.path)
  t.is(res.data, null)
})

test('200 with no body returns null data', async (t) => {
  fetchMock.get(t.context.url, 200)
  const res = await t.context.client.get(t.context.path)
  t.is(res.data, null)
})

test('200 returns text for non json responses', async (t) => {
  fetchMock.get(t.context.url, {
    body: 'test',
    status: 200
  })

  const res = await t.context.client.get(t.context.path)
  t.is(res.data, 'test')
})

test('200 returns JSON object response', async (t) => {
  fetchMock.get(t.context.url, {
    body: { type: 'test' },
    status: 200
  })

  const res = await t.context.client.get(t.context.path)
  t.is(res.data.type, 'test')
})

test('camel cases response json', async (t) => {
  fetchMock.get(t.context.url, {
    body: {
      'test-key-value-prop-test': 'test',
      test_even_more_types: 'test'
    },
    status: 200
  })

  const res = await t.context.client.get(t.context.path)
  t.is(res.data.testKeyValuePropTest, 'test')
  t.is(res.data.testEvenMoreTypes, 'test')
})

test('flatten returns the data on async', async (t) => {
  fetchMock.get(t.context.url, {
    body: { key: 'value' },
    status: 200
  })

  const res = await t.context.client.get(t.context.path).flatten()
  t.is(res.key, 'value')
})

test('adds pagination from headers to response', async (t) => {
  fetchMock.get(t.context.url, {
    body: {},
    status: 200,
    headers: {
      'page-number': '5',
      'per-page': '100',
      total: '1000',
      'total-pages': '100'
    }
  })

  const res = await t.context.client.get(t.context.path)
  t.is(res.pagination.page, 5)
  t.is(res.pagination.perPage, 100)
  t.is(res.pagination.total, 1000)
  t.is(res.pagination.totalPages, 100)
})

test('flattens JSON API response', async (t) => {
  const response = {
    data: {
      id: '1',
      type: 'test',
      relationships: {
        nested: {
          data: {
            id: '2',
            type: 'test'
          }
        }
      }
    },
    included: [{
      id: '2',
      type: 'test'
    }]
  }

  fetchMock.get(`${t.context.url}?include=nested`, {
    body: response,
    status: 200
  })

  const res = await t.context.client
    .get(t.context.path)
    .include('nested')
    .jsonApi()

  t.deepEqual(res.raw, response.data)
  t.deepEqual(res.data, {
    id: '1',
    type: 'test',
    nested: {
      id: '2',
      type: 'test'
    }
  })
})

test('throws an ApiError with bad response', async (t) => {
  fetchMock.get(t.context.url, { status: 500 })

  await t.throwsAsync(t.context.client.get(t.context.path), {
    instanceOf: ApiError,
    message: 'Internal Server Error'
  })
})
