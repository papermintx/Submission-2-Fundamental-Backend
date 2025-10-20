const PlaylistsValidator = require('../../validator/playlists');

class PlaylistsHandler {
  constructor(playlistsService, songsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._activitiesService = activitiesService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
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

    // Verify access (owner OR collaborator)
    await this._playlistsService.verifyPlaylistAccess(id, userId);

    // Validate song exists (must return 404 with specific message if not found)
    try {
      await this._songsService.getSongById(songId);
    } catch (error) {
      // If the song service throws NotFoundError, map message to Indonesian requirement
      if (error && error.name === 'NotFoundError') {
        const response = h.response({
          status: 'fail',
          message: 'Lagu tidak ditemukan',
        });
        response.code(404);
        return response;
      }
      // rethrow other errors
      throw error;
    }

    // Add song to playlist
    await this._playlistsService.addSongToPlaylist(id, songId);

    // Log activity
    await this._activitiesService.addActivity({
      playlistId: id,
      songId,
      userId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist.',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    // Verify access (owner OR collaborator)
    await this._playlistsService.verifyPlaylistAccess(id, userId);

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

    // Verify access (owner OR collaborator)
    await this._playlistsService.verifyPlaylistAccess(id, userId);

    // Delete song from playlist
    await this._playlistsService.deleteSongFromPlaylist(id, songId);

    // Log activity
    await this._activitiesService.addActivity({
      playlistId: id,
      songId,
      userId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist.',
    };
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    // Verify access (owner OR collaborator)
    await this._playlistsService.verifyPlaylistAccess(id, userId);

    // Get activities
    const activities = await this._activitiesService.getActivitiesByPlaylistId(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
