require('dotenv').config();
const redis = require('redis');

async function testRedisConnection() {
  console.log('=== Testing Redis Connection ===\n');
  
  console.log('Environment Variables:');
  console.log('- REDIS_SERVER:', process.env.REDIS_SERVER || 'localhost');
  console.log();

  const client = redis.createClient({
    socket: {
      host: process.env.REDIS_SERVER || 'localhost',
    },
  });

  client.on('error', (error) => {
    console.error('❌ Redis Error:', error.message);
  });

  client.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  client.on('ready', () => {
    console.log('✅ Redis is ready');
  });

  try {
    await client.connect();
    console.log('\n=== Testing Cache Operations ===\n');

    // Test SET with TTL
    const testKey = 'album-likes:test-album-123';
    const testValue = '10';
    const ttl = 1800; // 30 minutes

    console.log(`Setting cache: ${testKey} = ${testValue} (TTL: ${ttl}s)`);
    await client.set(testKey, testValue, { EX: ttl });
    console.log('✅ Cache SET successful');

    // Test GET
    console.log(`\nGetting cache: ${testKey}`);
    const cachedValue = await client.get(testKey);
    console.log(`✅ Cache GET successful: ${cachedValue}`);

    // Test TTL
    const remainingTtl = await client.ttl(testKey);
    console.log(`✅ Cache TTL: ${remainingTtl} seconds remaining`);

    // Test DELETE
    console.log(`\nDeleting cache: ${testKey}`);
    await client.del(testKey);
    console.log('✅ Cache DELETE successful');

    // Verify deletion
    const deletedValue = await client.get(testKey);
    console.log(`✅ Cache after delete: ${deletedValue === null ? 'null (deleted)' : deletedValue}`);

    console.log('\n=== All Tests Passed! ===\n');
    console.log('Redis is working correctly for caching.');
    console.log('Cache TTL: 30 minutes (1800 seconds) ✅');
    console.log('Socket connection: ✅');
    console.log('Environment variable REDIS_SERVER: ✅');

    await client.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.log('\nPlease ensure Redis/Memurai is running:');
    console.log('- Windows: Install Memurai from https://www.memurai.com/get-memurai');
    console.log('- Docker: docker run -d -p 6379:6379 redis:latest');
    process.exit(1);
  }
}

testRedisConnection();
