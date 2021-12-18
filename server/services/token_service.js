const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token_model');

class Token_service {
  /**
   * генерация токенов
   * @param payload
   * @returns {{accessToken: *, refreshToken: *}}
   */
  generateToken(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'});
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
    return { accessToken, refreshToken }
  }

  /**
   * Сохранение refresh токен в базу
   * @param userId
   * @param refreshToken
   * @returns {Promise<this|void|*>}
   */
  async saveToken(userId, refreshToken) {
    // сначала ищем пользователя в бд
    const tokenData = await tokenModel.findOne({user: userId});
    // если пользователь найден, перезаписываем у него refresh токен
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    // если пользователь не найден, создаем запись в бд с нужными данными
    const token = await tokenModel.create({user: userId, refreshToken});
    return token;
  }

  /**
   * Удаление рефреш токена из БД
   * @param refreshToken
   * @returns {Promise<*>}
   */
  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({refreshToken});
    return tokenData;
  }

  /**
   * Поиск токена в бд
   * @param refreshToken
   * @returns {Promise<*>}
   */
  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({refreshToken});
    return tokenData;
  }

  /**
   * Проверка токена доступа на валидность
   * @param token
   * @returns {null|*}
   */
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  /**
   * Проверка рефреш токена на валидность
   * @param token
   * @returns {null|*}
   */
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
}

module.exports = new Token_service();
