require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// Services
const AlbumsService = require('./services/AlbumsService');
const SongsService = require('./services/SongsService');
const UsersService = require('./services/UsersService');
const AuthenticationsService = require('./services/AuthenticationsService');
const PlaylistsService = require('./services/PlaylistsService');

// Routes
const albumsRoutes = require('./api/albums/routes');
const songsRoutes = require('./api/songs/routes');
const usersRoutes = require('./api/users/routes');
const authenticationsRoutes = require('./api/authentications/routes');
const playlistsRoutes = require('./api/playlists/routes');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register JWT plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Define JWT authentication strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  // Register routes
  server.route(albumsRoutes(albumsService));
  server.route(songsRoutes(songsService));
  server.route(usersRoutes(usersService));
  server.route(authenticationsRoutes(authenticationsService, usersService));
  server.route(playlistsRoutes(playlistsService, songsService));

  // Error handling extension
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Handle client errors (validation, not found)
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Handle server errors
      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'An internal server error occurred',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
