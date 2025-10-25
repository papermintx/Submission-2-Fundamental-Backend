const amqp = require('amqplib');

async function testConnection() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    console.log('✅ RabbitMQ connected successfully!');
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();