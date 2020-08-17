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

test('200 with empty body returns null data', async (t) => {
  fetchMock.get(t.context.url, {
    body: '',
    status: 200
  })

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
    included: [{
      type: 'accounts-user',
      id: '123',
      attributes: {
        'tax-exempt': false,
        'stripe-id': 'cus_XXX',
        'phone-number': '1234567890',
        newsletter: true,
        'last-name': 'User',
        'first-name': 'Test',
        email: 'test@example.com',
        'company-name': null,
        'account-type': 'individual'
      }
    }],
    data: [{
      type: 'fulfillment-order-note',
      relationships: {
        user: {
          data: {
            type: 'accounts-user',
            id: '123'
          }
        }
      },
      id: '1',
      attributes: {
        note: 'testing notes!'
      }
    }, {
      type: 'fulfillment-order-note',
      relationships: {
        user: {
          data: {
            type: 'accounts-user',
            id: '123'
          }
        }
      },
      id: '2',
      attributes: {
        note: 'more!!!!!'
      }
    }]
  }

  fetchMock.get(`${t.context.url}?include=user`, {
    body: response,
    status: 200
  })

  const res = await t.context.client
    .get(t.context.path)
    .include('user')
    .jsonApi()

  t.deepEqual(res.raw, response.data)
  t.deepEqual(res.data, [{
    id: '1',
    type: 'fulfillment-order-note',
    note: 'testing notes!',
    user: {
      type: 'accounts-user',
      id: '123',
      taxExempt: false,
      stripeId: 'cus_XXX',
      phoneNumber: '1234567890',
      newsletter: true,
      lastName: 'User',
      firstName: 'Test',
      email: 'test@example.com',
      companyName: null,
      accountType: 'individual'
    }
  }, {
    id: '2',
    type: 'fulfillment-order-note',
    note: 'more!!!!!',
    user: {
      type: 'accounts-user',
      id: '123',
      taxExempt: false,
      stripeId: 'cus_XXX',
      phoneNumber: '1234567890',
      newsletter: true,
      lastName: 'User',
      firstName: 'Test',
      email: 'test@example.com',
      companyName: null,
      accountType: 'individual'
    }
  }])
})

test('throws an ApiError with bad response', async (t) => {
  fetchMock.get(t.context.url, { status: 500 })

  await t.throwsAsync(t.context.client.get(t.context.path), {
    instanceOf: ApiError,
    message: 'Internal Server Error'
  })
})
