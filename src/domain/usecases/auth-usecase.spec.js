const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (hashedPassword, password) {
      this.hashedPassword = hashedPassword
      this.password = password

      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare (hashedPassword, password) {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      throw Error()
    }
  }
  return new TokenGeneratorSpy()
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }
  return loadUserByEmailRepositorySpy
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      throw new Error()
    }
  }
  return new LoadUserByEmailRepositorySpy()
}
const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }

  return new UpdateAccessTokenRepositorySpy()
}

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      throw new Error()
    }
  }

  return new UpdateAccessTokenRepositorySpy()
}
const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const tokenGeneratorSpy = makeTokenGenerator()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  })
  return { loadUserByEmailRepositorySpy, sut, encrypterSpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@mail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut()
    sut.auth('any_email@mail.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com')
  })

  test('Should return null if an invalid email is provided', async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'any_password')
    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should call UpdateAccessTokenRepository with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy } = makeSut()

    await sut.auth('valid_email@mail.com', 'valid_password')

    expect(updateAccessTokenRepositorySpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(tokenGeneratorSpy.accessToken)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth('valid_email@mail.com', 'valid_password')
    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}

    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({
        loadUserByEmailRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: encrypter,
        tokenGenerator: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: encrypter,
        tokenGenerator: tokenGenerator,
        updateAccessTokenRepository: invalid
      })
    )

    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()

    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError()
      })
    )

    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })
})
