// server/src/config/redis.js
// Singleton Redis client — connects once, shared across the whole process.

const { createClient } = require("redis");

let client = null;

// --------------------------------------------------------------------------
// Bootstrap: create the client, wire event listeners, and connect.
// Called once from index.js during server startup.
// --------------------------------------------------------------------------
async function handleRedisCaching() {
  console.log("[Redis] DEBUG REDIS_URL:", process.env.REDIS_URL || "(not set)");
  console.log("[Redis] DEBUG NODE_ENV :", process.env.NODE_ENV  || "(not set)");

  const redisHost = process.env.REDIS_HOST || "127.0.0.1";
  const redisPort = process.env.REDIS_PORT || "6379";
  const redisUrl  = process.env.REDIS_URL  || `redis://${redisHost}:${redisPort}`;

  try {
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            console.warn("[Redis] Maximum connection retries exceeded. Halting reconnect.");
            return false; // Stop reconnecting
          }
          return Math.min(retries * 200, 1000);
        },
      },
    });

    client.on("error", (err) => console.error("[Redis] Client error →", err.message));
    client.on("connect", () => console.log("[Redis] Connected to Redis successfully!"));
    client.on("reconnecting", () => console.warn("[Redis] Reconnecting to Redis..."));

    await client.connect();
    console.log("[Redis] Client ready.");
    return client;
  } catch (err) {
    console.warn(`[Redis] ⚠️ Could not connect to Redis at ${redisUrl}: ${err.message}`);
    console.warn("[Redis] ⚠️ Running in cache-bypass mode (direct DB/API queries).");
    try {
      if (client) await client.disconnect();
    } catch (_) {}
    client = null;
    return null;
  }
}

// --------------------------------------------------------------------------
// Accessor — returns the initialized singleton client, or null if offline.
// --------------------------------------------------------------------------
function getRedisClient() {
  return client;
}

// Support both object destructuring and direct function import
handleRedisCaching.handleRedisCaching = handleRedisCaching;
handleRedisCaching.getRedisClient = getRedisClient;

module.exports = {
  handleRedisCaching,
  getRedisClient,
};
