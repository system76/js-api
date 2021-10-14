const test = require('ava')

const Client = require('../src/client')

test.beforeEach((t) => {
  t.context.client = new Client({ baseUrl: 'http://localhost' })
})

test.afterEach((t) => {
  t.log(t.context.client.createUrl())
})

test('constructor accepts protocol', (t) => {
  const client = new Client({ baseUrl: 'wss://localhost' })
  t.true(client.createUrl().includes('wss://'))
})

test('constructor accepts host', (t) => {
  const client = new Client({ baseUrl: 'https://example.com' })
  t.true(client.createUrl().includes('example.com'))
})

test('constructor accepts port', (t) => {
  const client = new Client({ baseUrl: 'https://localhost:1234' })
  t.true(client.createUrl().includes('1234'))
})

test('constructor accepts a url to prefix with', (t) => {
  const client = new Client({ baseUrl: 'https://example.com/api/v2/' })
  t.true(client.createUrl().includes('/api/v2'))
})

test('include only includes the longest relationship', (t) => {
  const client = t.context.client.include('test').include('test.product')
  t.true(client._includes.includes('test.product'))
  t.false(client._includes.includes('test'))
})

test('header sets a header key', (t) => {
  t.context.client.header('test', 'value!')
  t.is(t.context.client._headers.test, 'value!')
  t.context.client.header('test', null)
  t.is(t.context.client._headers.test, undefined)
})

test('authentication sets the token value', (t) => {
  t.context.client.authentication('testing')
  t.is(t.context.client._token, 'testing')
})

test('parameter sets parameters parameters', (t) => {
  t.context.client.parameter('testing[value]', 'test')
  t.true(t.context.client.createParameters().getAll('testing[value]').includes('test'))
  t.context.client.parameter('testing[value]', null)
  t.true(t.context.client.createParameters().getAll('testing[value]').includes(''))
  t.context.client.parameter('testing[value]', undefined)
  t.is(t.context.client.createParameters().get('testing[value]'), null)
})

test('body sets the request body', (t) => {
  t.context.client.body({ data: 'value' })
  t.is(t.context.client._body.data, 'value')
})

test('include adds an array field to url', (t) => {
  const client = t.context.client.include('product')
  t.true(client.createUrl().includes('include%5B%5D=product'))
})

test('include with JSON API adds dot notated string to url', (t) => {
  const client = t.context.client.jsonApi().include('test.productThing.Fun')
  t.true(client.createUrl().includes('include=test.product-thing.fun'))
})

test('get sets the method and path', (t) => {
  const client = t.context.client.get('/test')
  t.true(client.createUrl().endsWith('/test'))
  t.is(client.createRequest().method, 'GET')
})
