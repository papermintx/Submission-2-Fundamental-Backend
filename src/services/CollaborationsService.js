const { nanoid } = require('nanoid');
const DatabaseService = require('./DatabaseService');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class CollaborationsService extends DatabaseService {
  constructor() {
    super();
  }

  async addCollaborator(playlistId, userId) {
    // Check if user exists
    await this.verifyUserExists(userId);

    // Check if collaboration already exists
    const checkQuery = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const checkResult = await this.query(checkQuery.text, checkQuery.values);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Kolaborator sudah ditambahkan');
    }

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new InvariantError('Kolaborator gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaborator(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborator gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async verifyUserExists(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
