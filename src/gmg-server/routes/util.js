const gmg = require('gmg-client')
const errors = gmg.Errors

module.exports.routeHandler = (handler) => {
   return async (req, res, next) => {
      try {
         await handler(req, res)
      } catch (err) {
         if (err instanceof errors.InvalidCommand) {
            res.status(400).send(err.message)
         }
         else {
            next(err)
         }
      }
   }
}