const { nanoid } = require('nanoid');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');
const DatabaseService = require('./DatabaseService');
const RedisService = require('./redis/RedisService');

class AlbumsService {
  constructor() {
    this._db = new DatabaseService();
    this._redis = new RedisService();
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

  async addAlbumLike(albumId, userId) {
    // Verify album exists
    await this.getAlbumById(albumId);

    // Check if user already liked this album
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkResult = await this._db.query(checkQuery.text, checkQuery.values);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('You have already liked this album');
    }

    const id = `like-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO user_album_likes(id, user_id, album_id, created_at) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, userId, albumId, createdAt],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to like album');
    }

    // Delete cache after like
    await this._redis.delete(`album-likes:${albumId}`);

    return result.rows[0].id;
  }

  async removeAlbumLike(albumId, userId) {
    // Verify album exists
    await this.getAlbumById(albumId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._db.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('You have not liked this album');
    }

    // Delete cache after unlike
    await this._redis.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikesCount(albumId) {
    // Verify album exists
    await this.getAlbumById(albumId);

    // Try to get from cache first
    try {
      const cacheKey = `album-likes:${albumId}`;
      const cachedLikes = await this._redis.get(cacheKey);

      if (cachedLikes !== null) {
        return {
          count: parseInt(cachedLikes, 10),
          source: 'cache',
        };
      }
    } catch (error) {
      console.error('Redis error:', error);
      // Continue to database if cache fails
    }

    // Get from database
    const query = {
      text: 'SELECT COUNT(*) as count FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._db.query(query.text, query.values);
    const count = parseInt(result.rows[0].count, 10);

    // Save to cache for 30 minutes (1800 seconds)
    try {
      const cacheKey = `album-likes:${albumId}`;
      await this._redis.set(cacheKey, count.toString(), 1800);
    } catch (error) {
      console.error('Redis error:', error);
      // Continue even if cache fails
    }

    return {
      count,
      source: 'database',
    };
  }
}

module.exports = AlbumsService;
