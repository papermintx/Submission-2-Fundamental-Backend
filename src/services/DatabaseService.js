const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this._pool = new Pool();
  }

  async query(text, params) {
    return this._pool.query(text, params);
  }
}

module.exports = DatabaseService;
