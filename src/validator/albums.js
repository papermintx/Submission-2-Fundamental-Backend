const InvariantError = require('../exceptions/InvariantError');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const { name, year } = payload;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new InvariantError('Album name is required and must be a non-empty string');
    }

    if (!year || typeof year !== 'number') {
      throw new InvariantError('Album year is required and must be a number');
    }
  },
};

module.exports = AlbumsValidator;
