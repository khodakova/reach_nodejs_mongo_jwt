const ApiError = require('../exceptions/api_error');
const tokenService = require('../services/token_service');

module.exports = function (req, res, next) {
  try {
    // вытаскиваем токен, указанный в заголовке Authorization
    const authorizationHeader = req.headers.authorization;
    // если этого токена нет, пробрасываем ошибку
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    // получем токен доступа (по типу Bearer superpupertoken)
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    // проверяем токен доступа на валидность
    const userData = tokenService.validateAccessToken(accessToken);
    // если при валидации произошла ошибка
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    // если все нормально, помещаем пользоватея в запрос
    req.user = userData;
    // передаем управление следующему middleware
    next();
  } catch (e) {
    // пробрасываем ошибку не авторизован, если что-то пошло не так
    return next(ApiError.UnauthorizedError());
  }
};
