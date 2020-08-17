const ApiError = require('./error')
const { normalize } = require('./js-api')
const {
  camelCase,
  combinePaths,
  defaultsDeep,
  kebabCase,
  recursive,
  snakeCase
} = require('./utility.js')

const JSON_HEADER = 'application/json'
const JSON_API_HEADER = 'application/vnd.api+json'
const DEFAULT_USER_AGENT = 'js-api (https://github.com/system76/js-api)'

async function decodeResponse (response) {
  const contentType = response.headers.get('content-type') || []
  const isJson = (
    contentType.includes(JSON_HEADER) ||
    contentType.includes(JSON_API_HEADER)
  )

  if (response.body == null || response.body === '') {
    return null
  } else if (isJson) {
    return response.json()
  } else {
    return response.text()
  }
}

module.exports = class Client {
  constructor (options) {
    this._baseUrl = new URL(options.baseUrl)

    this._method = 'GET'
    this._path = '/'

    this._cache = true
    this._isJsonApi = false
    this._token = options.token
    this._headers = {
      Accept: JSON_HEADER,
      'Content-Type': JSON_HEADER,
      'User-Agent': options.userAgent || DEFAULT_USER_AGENT
    }

    this._parameters = {}
    this._includes = []
    this._body = null

    this._flatten = false
  }

  include (include) {
    this._includes = this._includes
      .filter((i) => !include.startsWith(i))

    if (!this._includes.find((r) => r.startsWith(include))) {
      this._includes.push(include)
    }

    return this
  }

  header (key, value) {
    if (value == null) {
      delete this._headers[key]
    } else {
      this._headers[key] = value
    }

    return this
  }

  authentication (value) {
    this._token = value
  }

  parameter (key, value) {
    if (value === undefined) {
      delete this._parameters[key]
    } else if (value === null) {
      this._parameters[key] = ''
    } else {
      this._parameters[key] = value
    }

    return this
  }

  page (number) {
    return this.parameter('page[number]', number)
  }

  size (size) {
    return this.parameter('page[size]', size)
  }

  cache (value = true) {
    this._cache = value

    return this
  }

  jsonApi (value = true) {
    this._isJsonApi = value

    return this
  }

  body (value) {
    this._body = value

    return this
  }

  get (path) {
    this._method = 'GET'
    this._path = path

    return this
  }

  post (path) {
    this._method = 'POST'
    this._path = path

    return this
  }

  patch (path) {
    this._method = 'PATCH'
    this._path = path

    return this
  }

  put (path) {
    this._method = 'PUT'
    this._path = path

    return this
  }

  delete (path) {
    this._method = 'DELETE'
    this._path = path

    return this
  }

  flatten (value = true) {
    this._flatten = value

    return this
  }

  createIncludes () {
    const params = new URLSearchParams()

    if (this._isJsonApi) {
      const values = this._includes
        .map((v) => v.split('.').map(kebabCase).join('.'))
        .map(encodeURIComponent)
        .join(',')

      params.set('include', values)
    } else {
      this._includes
        .map(snakeCase)
        .forEach((v) => params.set('include[]', v))
    }

    return params
  }

  createParameters () {
    const params = new URLSearchParams()

    Object.keys(this._parameters).forEach((key) => {
      params.set(key, this._parameters[key])
    })

    return params
  }

  createUrl () {
    const url = (this._baseUrl.pathname === '/')
      ? new URL(this._path, this._baseUrl)
      : new URL(combinePaths(this._baseUrl.pathname, this._path), this._baseUrl)

    const params = new URLSearchParams()

    if (this._includes.length > 0) {
      for (var [ik, iv] of this.createIncludes().entries()) {
        params.set(ik, iv)
      }
    }

    if (Object.keys(this._parameters).length > 0) {
      for (var [pk, pv] of this.createParameters().entries()) {
        params.set(pk, pv)
      }
    }

    url.search = params.toString()
    return url.toString()
  }

  createHeaders () {
    const headers = new Headers(this._headers)

    if (this._token) {
      const token = (typeof this._token === 'function') ? this._token() : this._token

      if (token != null) {
        headers.append('authorization', token)
      }
    }

    if (this._isJsonApi) {
      headers.set('accept', JSON_API_HEADER)
      headers.set('content-type', JSON_API_HEADER)
    }

    return headers
  }

  createBody () {
    if (this._body == null) {
      return null
    } else if (typeof this._body === 'object') {
      if (this._isJsonApi) {
        return JSON.stringify(recursive(this._body, kebabCase))
      } else {
        return JSON.stringify(recursive(this._body, snakeCase))
      }
    } else {
      return this._body
    }
  }

  createRequest () {
    const req = {
      method: this._method.toUpperCase(),
      headers: this.createHeaders(),
      cache: (this._cache) ? 'default' : 'no-cache',
      redirect: 'follow'
    }

    if (!['HEAD', 'GET'].includes(req.method)) {
      req.body = this.createBody()
    }

    return req
  }

  then (resolve, reject) {
    return fetch(this.createUrl(), this.createRequest())
      .then(this.parseResponse.bind(this))
      .then((res) => (this._flatten) ? res.data : res)
      .then(resolve, reject)
  }

  parseHeaders (response) {
    return {
      pagination: {
        page: Number(response.headers.get('page-number') || '1'),
        perPage: Number(response.headers.get('per-page') || '1'),
        total: Number(response.headers.get('total') || '1'),
        totalPages: Number(response.headers.get('total-pages') || '1')
      }
    }
  }

  async parseBody (response) {
    const headersBody = this.parseHeaders(response)
    let body = await decodeResponse(response)

    if (body != null && typeof body === 'object') {
      body = recursive(body, camelCase)
    }

    if (this._isJsonApi) {
      body.raw = body.data
      body.data = normalize(body.data, body.included || [], this._includes)
    }

    return (this._isJsonApi)
      ? defaultsDeep({}, body, headersBody)
      : defaultsDeep({}, { data: body }, headersBody)
  }

  async parseResponse (response) {
    const body = this.parseBody(response)

    if (response.ok) {
      return body
    } else {
      throw new ApiError(response, body)
    }
  }
}
