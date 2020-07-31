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

  get isJsonApi () {
    const contentType = this.response.headers.get('Content-Type')
    return (contentType === 'application/vnd.api+json')
  }

  get status () {
    return this.response.status
  }

  get statusCode () {
    return this.response.status
  }

  get title () {
    if (Object.keys(this.fields).length !== 0) {
      const firstField = Object.keys(this.fields)[0]
      return `${firstField} ${this.fields[firstField][0]}`
    }

    switch (this.response.status) {
      case 403:
        return 'Unauthorized'

      case 404:
        return 'Page not found'

      case 422:
        return 'Unable to process request'

      default:
        return this.response.statusText
    }
  }

  get fields () {
    if (this.body == null) {
      return {}
    } else if (this.isJsonApi) {
      const errors = ((this.body || {}).errors || [])

      return errors.reduce((errors, error) => {
        const field = snakeCase(error.source.pointer.replace('/data/attributes/', ''))

        if (errors[field] == null) {
          errors[field] = []
        }

        errors[field].push(error.title)

        return errors
      }, {})
    } else {
      return (this.body.errors || {})
    }
  }
}
