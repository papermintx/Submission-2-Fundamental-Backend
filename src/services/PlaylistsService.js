const { nanoid } = require('nanoid');
const DatabaseService = require('./DatabaseService');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService extends DatabaseService {
  constructor() {
    super();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new Error('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
             FROM playlists 
             LEFT JOIN users ON users.id = playlists.owner 
             WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this.query(query.text, query.values);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new Error('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer 
             FROM playlist_songs 
             JOIN songs ON songs.id = playlist_songs.song_id 
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.query(query.text, query.values);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
             FROM playlists 
             LEFT JOIN users ON users.id = playlists.owner 
             WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di playlist');
    }
  }
}

module.exports = PlaylistsService;
