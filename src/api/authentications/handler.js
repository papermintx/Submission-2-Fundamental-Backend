const AuthenticationsValidator = require('../../validator/authentications');
const TokenManager = require('../../tokenize/TokenManager');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    AuthenticationsValidator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    // Verify credentials
    const userId = await this._usersService.verifyUserCredential(username, password);

    // Generate tokens
    const accessToken = TokenManager.generateAccessToken({ userId });
    const refreshToken = TokenManager.generateRefreshToken({ userId });

    // Store refresh token in database
    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    AuthenticationsValidator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    // Verify refresh token signature
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { userId } = TokenManager.verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = TokenManager.generateAccessToken({ userId });

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    AuthenticationsValidator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;

    // Verify and delete refresh token
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
