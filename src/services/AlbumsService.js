const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const DatabaseService = require('./DatabaseService');

class AlbumsService {
  constructor() {
    this._db = new DatabaseService();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums(id, name, year, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new Error('Failed to add album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover_url as "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }

    const album = result.rows[0];

    // Get associated songs
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._db.query(songsQuery.text, songsQuery.values);
    album.songs = songsResult.rows;

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album. Album not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album. Album not found');
    }
  }

  async updateAlbumCover(id, coverUrl) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album cover. Album not found');
    }
  }

  async getAlbumCoverUrl(id) {
    const query = {
      text: 'SELECT cover_url as "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }

    return result.rows[0].coverUrl;
  }
}

module.exports = AlbumsService;
