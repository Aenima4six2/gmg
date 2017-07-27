class InvalidCommand extends require('./AppError') {
  constructor(message) {
     super(message || 'Invalid Command', 400)
  }
}

module.exports = InvalidCommand