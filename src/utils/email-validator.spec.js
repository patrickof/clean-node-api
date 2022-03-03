const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

describe('Email Validator', () => {
  test('Should return true if validator returns true', () => {
    const sut = new EmailValidator()
    const emailIsValid = sut.isValid('valid_email@mail.com')

    expect(emailIsValid).toBe(true)
  })

  test('Should return false if validator returns false', () => {
    const sut = new EmailValidator()
    validator.isEmailValid = false
    const emailIsValid = sut.isValid('invalid_email@mail.com')

    expect(emailIsValid).toBe(false)
  })
})
