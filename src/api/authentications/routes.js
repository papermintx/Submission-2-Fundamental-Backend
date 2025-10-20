const AuthenticationsHandler = require('./handler');

const routes = (authenticationsService, usersService) => {
  const handler = new AuthenticationsHandler(authenticationsService, usersService);

  return [
    {
      method: 'POST',
      path: '/authentications',
      handler: handler.postAuthenticationHandler,
    },
    {
      method: 'PUT',
      path: '/authentications',
      handler: handler.putAuthenticationHandler,
    },
    {
      method: 'DELETE',
      path: '/authentications',
      handler: handler.deleteAuthenticationHandler,
    },
  ];
};

module.exports = routes;
