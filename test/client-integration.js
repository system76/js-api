import test from 'ava'
import fetchMock from 'fetch-mock'

import Client from '../src/client.js'

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
