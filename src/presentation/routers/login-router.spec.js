class LoginRouter {
  rote (httpRequest) {
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
})
