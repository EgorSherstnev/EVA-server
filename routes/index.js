const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const sendfileRouter = require('./sendfileRouter')

router.use('/user', userRouter)
router.use('/sendfile', sendfileRouter)

module.exports = router;