const redis = require('redis');

class RedisService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER || 'localhost',
      },
    });

    this._isConnected = false;

    this._client.on('error', (error) => {
      console.error('❌ Redis Client Error:', error.message);
      this._isConnected = false;
    });

    this._client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this._isConnected = true;
    });

    this._client.on('ready', () => {
      console.log('✅ Redis is ready');
      this._isConnected = true;
    });

    // Connect with error handling
    this._client.connect().catch((error) => {
      console.error('❌ Redis connection failed:', error.message);
      console.log('⚠️  Server will continue without caching');
      this._isConnected = false;
    });
  }

  async set(key, value, expirationInSeconds = 3600) {
    if (!this._isConnected) {
      return null;
    }

    try {
      await this._client.set(key, value, {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error('Redis set error:', error.message);
    }
  }

  async get(key) {
    if (!this._isConnected) {
      return null;
    }

    try {
      const result = await this._client.get(key);
      return result;
    } catch (error) {
      console.error('Redis get error:', error.message);
      return null;
    }
  }

  async delete(key) {
    if (!this._isConnected) {
      return null;
    }

    try {
      await this._client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error.message);
    }
  }
}

module.exports = RedisService;
