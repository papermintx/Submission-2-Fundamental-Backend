const PlaylistsValidator = require('../../validator/playlists');

class PlaylistsHandler {
  constructor(playlistsService, songsService) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    PlaylistsValidator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { userId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: userId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { userId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    // Verify ownership before deletion
    await this._playlistsService.verifyPlaylistOwner(id, userId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    PlaylistsValidator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { userId } = request.auth.credentials;

    // Verify ownership/access
    await this._playlistsService.verifyPlaylistOwner(id, userId);

    // Validate song exists
    await this._songsService.getSongById(songId);

    // Add song to playlist
    await this._playlistsService.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    // Verify ownership/access
    await this._playlistsService.verifyPlaylistOwner(id, userId);

    // Get playlist details
    const playlist = await this._playlistsService.getPlaylistById(id);

    // Get songs from playlist
    const songs = await this._playlistsService.getSongsFromPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler(request, h) {
    PlaylistsValidator.validatePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { userId } = request.auth.credentials;

    // Verify ownership/access
    await this._playlistsService.verifyPlaylistOwner(id, userId);

    // Delete song from playlist
    await this._playlistsService.deleteSongFromPlaylist(id, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
