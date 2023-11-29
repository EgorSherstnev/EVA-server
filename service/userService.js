const ApiError = require("../error/ApiError")
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mailService')
const { User } = require('../models/models')
const tokenService = require('./tokenService')
const UserDto = require('../dtos/user-dto')

class UserService {
   async registration (userName, company, email, password, role) {
      const candidate = await User.findOne({where: {email}})
      if(candidate) {
         return ApiError.badRequest(`Пользователь с таким почтовым адресом ${email} уже существует`)
      }
      const hashPassword = await bcrypt.hash(password, 5)
      const activationLink = uuid.v4()
      const user = await User.create({userName, company, email, password:hashPassword, role, activationLink})
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);

      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async activate(activationLink) {
      console.log(`Ссылка ${activationLink} пришла в usersevice`)
      const user = await User.findOne({where:{activationLink}})
      if (!user) {
         return ApiError.badRequest('Некорректная ссылка активации')
      }
      user.isActivated = true;
      await user.save();
   }

   async login(email, password) {
      const user = await User.findOne({where: {email}})
      if (!user) {
         throw ApiError.badRequest('Пользователь с таким email не найден')
      }
      const comparePassword = bcrypt.compareSync(password, user.password)
      if (!comparePassword) {
         throw ApiError.badRequest('Указан неверный пароль')
      }
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async logout (refreshToken) {
      const token = await tokenService.removeToken(refreshToken)
      return token;
   }

   async refresh (refreshToken) {
      if (!refreshToken) {
         throw ApiError.UnauthorizedError()
      }
      const userData = tokenService.validateRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findToken(refreshToken)
      if (!userData || !tokenFromDb) {
         throw ApiError.UnauthorizedError()
      }
      const user = await User.findByPk(userData.id)
      const userDto = new UserDto(user)
      const tokens = tokenService.generateTokens({...userDto})
      await tokenService.saveToken(userDto.id, tokens.refreshToken)

      return {...tokens, user: userDto}
   }

   async resetPassword (email) {
      const user = await User.findOne({where: {email}})
      if (!user) {
         throw ApiError.badRequest(`Пользователь с email: ${email} не найден `)
      }
      await mailService.sendResetPasswordMail(email, `${process.env.CLIENT_URL}/update-password/${user.activationLink}`); 
   }

   async updatePassword (password, activationLink) {
      const user = await User.findOne({where: {activationLink}})
      if (!user) {
         throw ApiError.badRequest(`Пользователь не найден `)
      }
      const hashPassword = await bcrypt.hash(password, 5)
      user.password = hashPassword;
      await user.save();
   }

   async getAllUsers() {
      const users = await User.findAll()
      return users
   }
}

module.exports = new UserService();