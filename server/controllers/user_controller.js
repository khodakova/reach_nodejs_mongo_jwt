const userService = require('../services/user_service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api_error');

class UserController {
  /**
   * Регистрация с получением access и refresh токенов
   * @param req - запрос, содержащий почту и пароль пользоватея
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  async registration(req, res, next) {
    try {
      // проверка валидации
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return  next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      const {email, password} = req.body;
      // передаем почту и пароль в функцию регистрации
      const userData = await userService.registration(email, password);
      // сохраняем рефреш токен в куки
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      // отдаем клиенту информацию по пользователю
      return await res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Вход в приложение с получением токенов
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  async login(req, res, next) {
    try {
      const {email, password} = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return await res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Выход из приложения с очищением данных по рефреш токену из бд и куков
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  async logout(req, res, next) {
    try {
      const {refreshToken} = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Активация профиля по ссылке
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|Response>}
   */
  async activate(req, res, next) {
    try {
      // получаем из запроса ссылку активации
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      // redirect на фронт
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Обновление refresh токена
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  async refresh(req, res, next) {
    try {
      // достаем рефреш токен
      const {refreshToken} = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return await res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Получение списка пользователей
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  async getUsers(req, res, next) {
    try {
      // достаем всех пользователей
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
