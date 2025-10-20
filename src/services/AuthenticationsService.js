const DatabaseService = require('./DatabaseService');
const InvariantError = require('../exceptions/InvariantError');

class AuthenticationsService extends DatabaseService {
  constructor() {
    super();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this.query(query.text, query.values);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this.query(query.text, query.values);
  }
}

module.exports = AuthenticationsService;
