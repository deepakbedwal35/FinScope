const { createClient } = require("redis");

async function handleRedisCaching() {
  
  console.log('DEBUG REDIS_URL:', process.env.REDIS_URL);
  console.log('DEBUG NODE_ENV:', process.env.NODE_ENV);
  
  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = process.env.REDIS_PORT || '6379';
  const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

  const client = createClient({ url: redisUrl });

  client.on('error', err => console.log('Redis Setup Error', err));
  client.on('connect', () => console.log('Connected to Redis successfully!'));

  await client.connect();

  return client;
}

module.exports = handleRedisCaching;