const InvariantError = require('../exceptions/InvariantError');

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const { username, password } = payload;

    if (!username || !password) {
      throw new InvariantError('Gagal melakukan autentikasi. Mohon isi username dan password');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new InvariantError('Gagal melakukan autentikasi. Tipe data tidak sesuai');
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new InvariantError('Gagal memperbarui token. Mohon isi refresh token');
    }

    if (typeof refreshToken !== 'string') {
      throw new InvariantError('Gagal memperbarui token. Tipe data tidak sesuai');
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new InvariantError('Gagal menghapus token. Mohon isi refresh token');
    }

    if (typeof refreshToken !== 'string') {
      throw new InvariantError('Gagal menghapus token. Tipe data tidak sesuai');
    }
  },
};

module.exports = AuthenticationsValidator;
