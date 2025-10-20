const InvariantError = require('../exceptions/InvariantError');

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const { playlistId, userId } = payload;

    if (!playlistId || !userId) {
      throw new InvariantError('Gagal menambahkan kolaborator. Mohon isi playlistId dan userId');
    }

    if (typeof playlistId !== 'string' || typeof userId !== 'string') {
      throw new InvariantError('Gagal menambahkan kolaborator. Tipe data tidak sesuai');
    }
  },
};

module.exports = CollaborationsValidator;
