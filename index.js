require('dotenv').config();
const express = require('express');
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandingMiddleware')
const path = require('path')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 7000

const app = express();
app.use(cors({
   credentials: true,
   origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

// app.get('/', (req, res) => {
//    res.send("Ева Работает")
// })

//Обработка ошибок, последний middleware
app.use(errorHandler)

const start = async () => {
   try {
      await sequelize.authenticate()
      await sequelize.sync()
      app.listen(PORT, () => console.log(`Server started on ${PORT}`))
   } catch (e) {
      console.log(e)
   }
}

start()