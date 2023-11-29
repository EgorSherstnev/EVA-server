//const ApiError = require("../error/ApiError")
//const bcrypt = require('bcrypt')
//const jwt = require('jsonwebtoken')
//const { User } = require('../models/models')
const userService = require('../service/userService')
const {validationResult} = require('express-validator')

const express = require('express');
const ApiError = require('../error/ApiError');

const generateJwt = (id, email, role) => {
   return jwt.sign(
      {id, email, role}, 
      process.env.SECRET_KEY,
      {expiresIn: '24h'}
   )
}

class UserController {
   async registration(req,res,next) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return next(ApiError.badRequest('Ошибка при валидации', errors.array()))
         }
         const { userName, company, email, password, role } = req.body
         const userData = await userService.registration(userName, company, email, password, role)
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 25 * 60 * 60 * 1000, httpOnly: true})
         return res.json(userData)
      } catch(e) {
         next(e)
      }

      /*const { userName, company, email, password, role } = req.body
      if (!email || !password) {
         return next(ApiError.badRequest('Некорректный email или password'))
      }
      const candidate = await User.findOne({where: {email}})
      if (candidate) {
         return next(ApiError.badRequest('Пользователь с таким email уже существует'))
      }
      const hashPassword = await bcrypt.hash(password, 5)
      const user = await User.create({userName, company, email, role, password:hashPassword})
      const token = generateJwt(user.id, user.email, user.role)
      return res.json({token})*/
   }

   async login(req,res,next) {
      /*const {email, password} = req.body
      const user = await User.findOne({where: {email}})
      if (!user) {
         return next(ApiError.internal('Пользователь не найден'))
      }
      let comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
         return next(ApiError.internal('Указан неверный пароль'))
      }
      const token = generateJwt(user.id, user.email, user.role)
      return res.json({token})*/

      try {
         const {email, password} = req.body;
         const userData = await userService.login(email, password)
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 25 * 60 * 60 * 1000, httpOnly: true})
         return res.json(userData)
      } catch (e) {
         next(e)
      }
   }

   async check(req, res, next) {
      const token = generateJwt(req.user.id, req.user.email, req.user.role)
      return res.json({token})
   }
   
   async logout(req, res, next) {
      try {
         const {refreshToken} = req.cookies;
         const token = await userService.logout(refreshToken)
         res.clearCookie('refreshToken');
         return res.json(token)
      } catch (e) {
         next(e)
      }
   }

   async activate(req, res, next) {
      try {
         const activationLink = req.params.link;
         await userService.activate(activationLink);
         return res.status(302).redirect(process.env.CLIENT_URL)
      } catch (e) {
         next(e)
      }
   }
   
   async refresh(req, res, next) {
      try {
         const { refreshToken } = req.cookies;
         const userData = await userService.refresh(refreshToken)
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 25 * 60 * 60 * 1000, httpOnly: true})
         return res.json(userData)
      } catch (e) {
         next(e)
      }
   }

   async resetPassword(req, res, next) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return next(ApiError.badRequest('Ошибка при валидации', errors.array()))
         }
         const {email} = req.body;
         await userService.resetPassword(email)
         return res.status(200).json({ message: 'Письмо для сброса пароля направлено на почту' });
      } catch (e) {
         next(e)
      }
   }

   async updatePassword(req, res, next) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return next(ApiError.badRequest('Ошибка при валидации', errors.array()))
         }
         const {password, activationLink} = req.body;
         await userService.updatePassword(password, activationLink)
         return res.status(200).json({ message: 'Пароль обновлен' });
      } catch (e) {
         next(e)
      }
   }

   async getUsers(req, res, next) {
      try {
         const users = await userService.getAllUsers();
         return res.json(users)
      } catch (e) {
         next(e)
      }
   }
}

module.exports = new UserController()