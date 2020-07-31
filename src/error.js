const { snakeCase } = require('./utility.js')

module.exports = class ApiError extends Error {
  constructor (response, body) {
    super('ApiError')

    this.response = response
    this.body = body

    Object.defineProperty(this, 'message', {
      get () { return this.title }
    })
  }

  get status () {
    return this.response.status
  }

  get statusCode () {
    return this.response.status
  }

  get title () {
    if (this.errors.length > 0) {
      return this.errors[0]
    }

    switch (this.response.status) {
      case 403:
        return 'Not authorized'

      case 404:
        return 'Page not found'

      case 422:
        return 'Unable to process request'

      default:
        return this.response.statusText
    }
  }

  get errors () {
    const out = []

    Object.keys(this.fields).forEach((key) => {
      this.fields[key].forEach((err) => {
        out.push(`${key} ${err}`)
      })
    })

    if (this.body != null && Array.isArray(this.body.errors)) {
      this.body.errors.forEach((err) => {
        if (err.source == null || err.source.pointer == null) {
          out.push(err.title)
        }
      })
    }

    return out
  }

  get fields () {
    const errors = {}
    const bodyErrors = (this.body && this.body.errors) ? this.body.errors : []

    if (Array.isArray(bodyErrors)) {
      bodyErrors.forEach((error) => {
        if (error.source != null && error.source.pointer != null) {
          const field = snakeCase(error.source.pointer.replace('/data/attributes/', ''))

          if (errors[field] == null) {
            errors[field] = []
          }

          errors[field].push(error.title)
        }
      })
    }

    if (typeof bodyErrors === 'object' && !Array.isArray(bodyErrors)) {
      Object.keys(bodyErrors).forEach((key) => {
        const value = bodyErrors[key]

        if (errors[key] == null) {
          errors[key] = []
        }

        if (typeof value === 'string') {
          errors[key] = value
        } else if (Array.isArray(value)) {
          value.forEach((v) => errors[key].push(v))
        }
      })
    }

    return errors
  }
}
