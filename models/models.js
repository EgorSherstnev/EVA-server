const sequelize = require('../db')
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
   id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
   userName: {type: DataTypes.STRING, allowNull: false},
   company: {type: DataTypes.STRING},
   email: {type: DataTypes.STRING, unique: true, allowNull: false},
   password: {type: DataTypes.STRING, allowNull: false},
   role: {type: DataTypes.STRING, defaultValue: "USER"},
   isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
   activationLink: {type: DataTypes.STRING},
})

const Token = sequelize.define('token', {
   userId: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } },
   refreshToken: {type: DataTypes.STRING, allowNull: false},
})

User.hasOne(Token)
Token.belongsTo(User)

module.exports = {
   User,
   Token
}