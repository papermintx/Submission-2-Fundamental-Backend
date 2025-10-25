require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./PlaylistsService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  const listener = new Listener(playlistsService, mailSender);

  console.log('🔌 Connecting to RabbitMQ...');
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlist', {
    durable: true,
  });

  console.log('✅ Consumer connected to RabbitMQ');
  console.log('⏳ Waiting for messages in queue: export:playlist');

  channel.consume('export:playlist', listener.listen, { noAck: true });
};

init().catch((error) => {
  console.error('❌ Failed to start consumer:', error.message);
  process.exit(1);
});
