const CollaborationsValidator = require('../../validator/collaborations');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    CollaborationsValidator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: ownerId } = request.auth.credentials;

    // CRITICAL: Verify that authenticated user is the playlist OWNER
    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    // Add collaborator
    const collaborationId = await this._collaborationsService.addCollaborator(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    CollaborationsValidator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { userId: ownerId } = request.auth.credentials;

    // CRITICAL: Verify that authenticated user is the playlist OWNER
    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    // Delete collaborator
    await this._collaborationsService.deleteCollaborator(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborator berhasil dihapus.',
    };
  }
}

module.exports = CollaborationsHandler;
