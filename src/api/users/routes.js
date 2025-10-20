const UsersHandler = require('./handler');

const routes = (service) => {
  const handler = new UsersHandler(service);

  return [
    {
      method: 'POST',
      path: '/users',
      handler: handler.postUserHandler,
    },
  ];
};

module.exports = routes;
