const test = require('ava')

const ApiError = require('../src/error')

test.beforeEach((t) => {
  t.context.response = {
    headers: new Headers({
      'content-type': 'application/json'
    }),
    status: 500,
    statusText: 'Internal Server Error'
  }

  t.context.jsonResponse = {
    headers: new Headers({
      'content-type': 'application/vnd.api+json'
    }),
    status: 500,
    statusText: 'Internal Server Error'
  }

  t.context.body = {}
})

test('takes status from api response', (t) => {
  const error = new ApiError({ status: 404 })
  t.is(error.status, 404)
  t.is(error.statusCode, 404)
})

test('message returns first form error if error exists', (t) => {
  const error = new ApiError(t.context.response, {
    errors: { email: ['has already been taken'] }
  })

  t.is(error.message, 'email has already been taken')
})

test('message returns default status text if no body', (t) => {
  const error = new ApiError(t.context.response)
  t.is(error.message, 'Internal Server Error')
})

test('errors is an empty array if no body is given', (t) => {
  const error = new ApiError(t.context.jsonResponse, null)
  t.deepEqual(error.errors, [])
})

test('errors includes errors without a source', (t) => {
  const error = new ApiError(t.context.jsonResponse, {
    errors: [{
      title: 'Not authorized'
    }]
  })

  t.deepEqual(error.errors, ['Not authorized'])
})

test('errors includes errors from a default phoenix project', (t) => {
  const error = new ApiError(t.context.jsonResponse, {
    errors: {
      detail: 'Unauthorized'
    }
  })

  t.deepEqual(error.fields, {})
  t.deepEqual(error.errors, ['Unauthorized'])
})

test('errors flattens field errors', (t) => {
  const error = new ApiError(t.context.jsonResponse, {
    errors: [{
      title: 'has already been taken',
      detail: 'Email has already been taken',
      source: {
        pointer: '/data/attributes/email'
      }
    }]
  })

  t.deepEqual(error.errors, ['email has already been taken'])
})

test('formErrors maps errors from regular API', (t) => {
  const error = new ApiError(t.context.response, {
    errors: {
      email: ['has already been taken']
    }
  })

  t.deepEqual(error.fields, {
    email: ['has already been taken']
  })
})

test('formErrors maps all JSON API errors', (t) => {
  const error = new ApiError(t.context.jsonResponse, {
    errors: [{
      title: 'has already been taken',
      detail: 'Email has already been taken',
      source: {
        pointer: '/data/attributes/email'
      }
    }]
  })

  t.deepEqual(error.fields, {
    email: ['has already been taken']
  })
})

test('formErrors does not choke on general errors', (t) => {
  const error = new ApiError(t.context.jsonResponse, {
    errors: [{
      title: 'Not authorized'
    }]
  })

  t.deepEqual(error.fields, {})
})

test('formErrors returns an empty object with no body', (t) => {
  const error = new ApiError(t.context.response)
  t.deepEqual(error.fields, {})
})
