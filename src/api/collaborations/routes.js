const CollaborationsHandler = require('./handler');

const routes = (collaborationsService, playlistsService) => {
  const handler = new CollaborationsHandler(collaborationsService, playlistsService);

  return [
    {
      method: 'POST',
      path: '/collaborations',
      handler: handler.postCollaborationHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/collaborations',
      handler: handler.deleteCollaborationHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
  ];
};

module.exports = routes;
