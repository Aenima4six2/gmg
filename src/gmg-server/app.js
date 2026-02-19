const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')

module.exports.create = () => {
  // Other middleware  
  const app = express()
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(cors())

  // Static content
  const publicPath = path.join(__dirname, 'public')
  app.use(express.static(publicPath))
  const appPath = path.join(__dirname, 'public/app')
  app.use(express.static(appPath))

  // Register routes
  app.use('/api', require('./routes/api'))

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500).send(err.message)
  })

  return app
}
