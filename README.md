<div align="center">
  <h1>@system76/js-api</h1>
  <h3>JavaScript fetch wrapper for Elixir Phoenix APIs</h3>
  <br>
  <br>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@system76/js-api/">
    <img src="https://img.shields.io/npm/v/@system76/js-api.svg" alt="npm">
  </a>

  <a href="https://github.com/system76/js-api/releases">
    <img src="https://img.shields.io/github/release-date/system76/js-api.svg" alt="release">
  </a>

  <a href="https://dependabot.com/">
    <img src="https://img.shields.io/badge/dependabot-configured-success.svg" alt="dependabot">
  </a>

  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="standard">
  </a>
</p>

---

This package is a simple wrapper around
[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make it
easier to interact with [Elixir Phoenix](https://phoenixframework.org/) APIs.

While this package can be used in any JS project, it is designed with Vue (and
Nuxt.JS) specifically in mind.

## Using

This package uses ESM modules! You will need to configure your project to
transpile this package if you are not running a newer version of node.

### Regular JS

```
npm install --save @system76/js-api
```

```js
import { Client } from '@system76/js-api'

const api = () => new Client({
  baseUrl: 'https://api-v2.system76.com',
  token: () => 'testingtoken'
})

const { data } = await api().get('/catalog/products').jsonApi()
```

### Nuxt

Add these fields to your `nuxt.config.js` file:

```js
export default {
  plugins: [
    `~/plugins/api`
  ]
}
```

Put this in your `~/plugins/api.js`:

```js
import { Client } from '@system76/js-api'

export default function (ctx, inject) {
  const api = () => new Client({
    baseUrl: 'https://api-v2.system76.com',
    token: () => `Token ${ctx.store.getters.token}`
  })

  inject('api', () => api())
}
```

Then you can use `$api` in the nuxt context. For instance, in a component you
can do:

```js
export default {
  asyncData: async ({ $api }) => ({
    products: await $api().get('/catalog/products').jsonApi().flatten()
  })
}
```

or:

```js
export default {
  methods: {
    async create () {
      const { data: products } = await $api().get('/catalog/products')
        .jsonApi()
        .page(2)
    }
  }
}
```

### Client

This is your main client used for making requests. All methods return the client
again, so it's easily chainable.

```js
// Adds an include statement to the request. Useful for JSON API endpoints
client.include('products.options.components')

// Adds a header to the request
client.header('Accept', 'application/json')

// Adds an authentication header
client.authentication('token abc123')

// Adds a parameter to the URL
client.parameter('filter[status]', 'awesome')

// Adds pagination page parameter
client.page(1)

// Adds pagination page size parameter
client.size(100)

// Adds a no cache or cache header to the request (defaults to true)
client.cache()
client.cache(false)

// Adds JSON API headers and changes the request form a bit to match
client.jsonApi()

// Adds body data to the request. Does not work with HEAD or GET requests. Gets
// JSON.stringify-ed
client.body({ data: { attributes: { key: 'value' }}})

// Sets the method and path for the request.
client.get('/products')
client.post('/products')
client.patch('/products')
client.put('/products')
client.delete('/products/2')

// Makes the return value of the request _just_ the body data. This is similar
// to doing `(await client.get()).body` but less verbose
client.flatten()
```

### ApiError

This is the error thrown if the response is not ok. It has a bunch of helpers
to assist in parsing the error data.

```js
// Mapped for use in Nuxt. If the API returns a 500, your app returns a 500
error.status // 500
error.statusCode // 500

// A simple array of error data found
error.errors // ['Not authorized']
error.errors // ['email has already been taken']

// An object of validation errors from the server
error.fields.email // ['has already been taken']
error.fields.password // null
```

## Development

1) Download the repository

2) Run `npm ci`

3) Start hacking

4) Run `npm test` to make sure you didn't break anything

5) Submit a PR!

## Deployment

To [trigger a release](https://semantic-release.gitbook.io/semantic-release/#triggering-a-release),
push a commit to the `master` branch in the
[Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
format.
