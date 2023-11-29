const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')
const tokenService = require('../service/tokenService')

module.exports = function(req, res, next) {
   if (req.method === 'OPTIONS') {
      next()
   }
   try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
         return next(ApiError.UnauthorizedError());
      }

      const accessToken = authorizationHeader.split(' ')[1]
      if(!accessToken) {
         return next(ApiError.UnauthorizedError());
      }

      const userData = tokenService.validateAccessToken(accessToken)
      if (!userData) {
         return next(ApiError.UnauthorizedError());
      }

      req.user = userData;
      next();
      /*const token = req.headers.authorization.split(' ')[1] // Bearer <token>
      if (!token) {
         return res.status(401).json({message: "Не авторизован"})
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      req.user = decoded
      next()*/
   } catch (e) {
      return next(ApiError.UnauthorizedError());
   }
};