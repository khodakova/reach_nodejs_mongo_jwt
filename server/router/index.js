const Router = require('express');
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middlewares/auth_middleware');

const router = new Router();
const {body} = require('express-validator');

// сопоставление каждому endpoint функции в контроллере
router.post('/registration',
  body('email').isEmail(),  // валидируем e-mail
  body('password').isLength({min: 4, max: 32}),   // валидируем пароль
  userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
// передаем authMiddleware для проверки запросов на авторизованность пользователя
router.get('/users', authMiddleware, userController.getUsers);

module.exports = router;
