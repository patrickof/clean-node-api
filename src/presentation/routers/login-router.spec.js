class LoginRouter {
  rote (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return { statusCode: 500 }
    }
    if (!httpRequest.body.email || !httpRequest.body.password) {
      return { statusCode: 400 }
    }
  }
}

describe('Login Router', () => {
  test('Should return 400 if not email is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = sut.rote(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if not password is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'any_email'
      }
    }
    const httpResponse = sut.rote(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 500 if not httpRequest is provided', () => {
    const sut = new LoginRouter()
    const httpResponse = sut.rote()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if httpRequest has no body', () => {
    const sut = new LoginRouter()
    const httpResponse = sut.rote({})
    expect(httpResponse.statusCode).toBe(500)
  })
})
