const client = require('./GMGClient')
const AppError = require('./AppError')
const InvalidCommand = require('./InvalidCommand')

module.exports = {
  GMGClient: client,
  Errors: {
    AppError,
    InvalidCommand
  }
}