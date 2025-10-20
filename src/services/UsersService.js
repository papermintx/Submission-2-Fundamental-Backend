const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const DatabaseService = require('./DatabaseService');
const InvariantError = require('../exceptions/InvariantError');

class UsersService extends DatabaseService {
  constructor() {
    super();
  }

  async addUser({ username, password, fullname }) {
    // Verify username uniqueness
    await this.verifyNewUsername(username);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const id = `user-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.query(query.text, query.values);

    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new InvariantError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
