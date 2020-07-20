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

const api = new Client({
  baseUrl: 'https://api-v2.system76.com',
  token: () => 'testingtoken'
})

const { data } = await api.get('/catalog/products').jsonApi()
```

### Nuxt

Add these fields to your `nuxt.config.js` file:

```js
export default {
  build: {
    transpile: [
      '@system76/js-api'
    ]
  },

  plugins: [
    `~/plugins/api`
  ]
}
```

Put this in your `~/plugins/api.js`:

```js
import { Client } from '@system76/js-api'

export default function (ctx, inject) {
  const api = new Client({
    baseUrl: 'https://api-v2.system76.com',
    token: () => ctx.store.getters.token
  })

  inject('api', api)
}
```

Then you can use `$api` in the nuxt context. For instance, in a component you
can do:

```js
export default {
  asyncData: async ({ $api }) => ({
    products: await $api.get('/catalog/products').jsonApi().flatten()
  })
}
```

or:

```js
export default {
  methods: {
    async create () {
      const { data: products } = await $api.get('/catalog/products')
        .jsonApi()
        .page(2)
    }
  }
}
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
