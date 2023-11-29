const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const {body} = require('express-validator')

router.post('/registration', 
    body('email').isEmail(),
    body('password').isLength({min:3, max: 32}),
    userController.registration
);
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.post('/reset-password', 
    body('email').isEmail(),
    userController.resetPassword
);
router.post('/update-password', 
    body('password').isLength({min:3, max:32}),
    userController.updatePassword
)

router.get('/users', authMiddleware, userController.getUsers) //на Релизе убрать

module.exports = router;