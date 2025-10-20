const InvariantError = require('../exceptions/InvariantError');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const { name } = payload;

    if (!name) {
      throw new InvariantError('Gagal menambahkan playlist. Mohon isi nama playlist');
    }

    if (typeof name !== 'string') {
      throw new InvariantError('Gagal menambahkan playlist. Tipe data tidak sesuai');
    }

    if (name.length === 0) {
      throw new InvariantError('Gagal menambahkan playlist. Nama tidak boleh kosong');
    }
  },

  validatePlaylistSongPayload: (payload) => {
    const { songId } = payload;

    if (!songId) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist. Mohon isi songId');
    }

    if (typeof songId !== 'string') {
      throw new InvariantError('Gagal menambahkan lagu ke playlist. Tipe data tidak sesuai');
    }
  },
};

module.exports = PlaylistsValidator;
