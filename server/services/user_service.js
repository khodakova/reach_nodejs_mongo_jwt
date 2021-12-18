const UserModel = require('../models/user_model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail_service');
const tokenService = require('./token_service');
const UserDto = require('../dtos/user_dto');
const ApiError = require('../exceptions/api_error');


class UserService {
  /**
   * Регистрация пользователя
   * @param email
   * @param password
   * @returns {Promise<{accessToken: *, user: *, refreshToken: *}>}
   */
  async registration(email, password) {
    // проверяем, есть ли пользователь с указанной почтой в базе
    const candidate = await UserModel.findOne({email});
    // если есть, возвращаем ошибку
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с такой почтой существует`)
    }
    // вычисляем хэш введенного пароля
    const hashPassword = await bcrypt.hash(password, 3);
    // генерируем ссылку для активации аккаунта
    const activationLink = uuid.v4();
    // создаем пользователя
    const user = await UserModel.create({email, password: hashPassword, activationLink});
    // отправляем письмо для подтверждения на почту
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
    // payload для токенов (информация по пользователю без пароля)
    const userDto = new UserDto(user);
    // генерируем токены и сохраняем их
    const tokens = tokenService.generateToken({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto }
  }

  /**
   * Функция активации пользователя по ссылке
   * @param activationLink - ссылка активации
   * @returns {Promise<void>}
   */
  async activate(activationLink) {
    // ищем пользователя с указанной ссылкой активации
    const user = await UserModel.findOne({activationLink});
    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации')
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    // ищем пользователя
    const user = await UserModel.findOne({email});
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден')
    }
    // проверяем пароль
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    const userDto = new UserDto(user);
    // генерируем токены
    const tokens = tokenService.generateToken({...userDto});
    // сохраняем рефреш токен
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {...tokens, user: userDto};
  }

  /**
   * Выход из приложения с удалением токена из бд
   * @param refreshToken
   * @returns {Promise<*>}
   */
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  /**
   *
   * @param refreshToken
   * @returns {Promise<{accessToken: *, user: *, refreshToken: *}>}
   */
  async refresh(refreshToken) {
    // если рефреш токен не найден, то пробрасываем ошибку не авторизован
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    // проверяем токен на валидность
    const userData = tokenService.validateRefreshToken(refreshToken);
    // достаем токен из БД
    const tokenFromDb = await tokenService.findToken(refreshToken);
    // если токена в бд нет, пробрасываем ошибку
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    // заново вытаскиваем пользователя из БД на случай, если информация о нем в БД поменялась
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    // заново генерируем токены
    const tokens = tokenService.generateToken({...userDto});
    // сохраняем новый рефреш токен в бд
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {...tokens, user: userDto};
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
