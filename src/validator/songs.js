const InvariantError = require('../exceptions/InvariantError');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const { title, year, genre, performer, duration, albumId } = payload;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new InvariantError('Song title is required and must be a non-empty string');
    }

    if (!year || typeof year !== 'number') {
      throw new InvariantError('Song year is required and must be a number');
    }

    if (!genre || typeof genre !== 'string' || genre.trim() === '') {
      throw new InvariantError('Song genre is required and must be a non-empty string');
    }

    if (!performer || typeof performer !== 'string' || performer.trim() === '') {
      throw new InvariantError('Song performer is required and must be a non-empty string');
    }

    // Optional fields validation
    if (duration !== undefined && typeof duration !== 'number') {
      throw new InvariantError('Song duration must be a number');
    }

    if (albumId !== undefined && (typeof albumId !== 'string' || albumId.trim() === '')) {
      throw new InvariantError('Song albumId must be a non-empty string');
    }
  },
};

module.exports = SongsValidator;
