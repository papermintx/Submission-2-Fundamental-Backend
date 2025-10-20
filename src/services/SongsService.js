const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const DatabaseService = require('./DatabaseService');

class SongsService {
  constructor() {
    this._db = new DatabaseService();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration || null, albumId || null, createdAt, updatedAt],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new Error('Failed to add song');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let query = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];
    let valueIndex = 1;

    if (title) {
      conditions.push(`title ILIKE $${valueIndex}`);
      values.push(`%${title}%`);
      valueIndex++;
    }

    if (performer) {
      conditions.push(`performer ILIKE $${valueIndex}`);
      values.push(`%${performer}%`);
      valueIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await this._db.query(query, values);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, genre, performer, duration, album_id as "albumId" FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration || null, albumId || null, updatedAt, id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update song. Song not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete song. Song not found');
    }
  }
}

module.exports = SongsService;
