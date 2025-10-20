const InvariantError = require('../exceptions/InvariantError');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const { username, password, fullname } = payload;

    if (!username || !password || !fullname) {
      throw new InvariantError('Gagal menambahkan user. Mohon isi semua field yang diperlukan');
    }

    if (typeof username !== 'string' || typeof password !== 'string' || typeof fullname !== 'string') {
      throw new InvariantError('Gagal menambahkan user. Tipe data tidak sesuai');
    }

    if (username.length === 0 || password.length === 0 || fullname.length === 0) {
      throw new InvariantError('Gagal menambahkan user. Field tidak boleh kosong');
    }
  },
};

module.exports = UsersValidator;
