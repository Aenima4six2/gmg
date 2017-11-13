const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const api = require('./routes/api')

module.exports.create = ({ client }) => {
  // view engine setup
  const app = express()
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  // Other middleware
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Static content
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(express.static(path.resolve(path.join(__dirname, '../app/react/build'))))

  // Routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Methods', 'POST, PUT, DELETE, PATCH, GET, OPTIONS')
    next()
  })

  app.use('/api', api.create({ client }))

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

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })

  return app
}
