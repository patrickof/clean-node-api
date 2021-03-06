const validator = require('validator')
const EmailValidator = require('./email-validator')

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('Should return true if validator returns true', () => {
    const sut = makeSut()
    const emailIsValid = sut.isValid('valid_email@mail.com')

    expect(emailIsValid).toBe(true)
  })

  test('Should return false if validator returns false', () => {
    const sut = makeSut()
    validator.isEmailValid = false
    const emailIsValid = sut.isValid('invalid_email@mail.com')

    expect(emailIsValid).toBe(false)
  })

  test('Should call validator with correct email', () => {
    const sut = makeSut()
    sut.isValid('any_email@mail.com')

    expect(validator.email).toBe('any_email@mail.com')
  })
})
