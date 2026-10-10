// server/src/config/redis.js
// Singleton Redis client — connects once, shared across the whole process.
// Exporting the promise lets callers await initialization before use.

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

  client = createClient({ url: redisUrl });

  // Surface any background errors so they don't silently swallow problems.
  client.on("error",   (err) => console.error("[Redis] Client error →", err));
  client.on("connect", ()    => console.log("[Redis] Connected to Redis successfully!"));
  client.on("reconnecting", () => console.warn("[Redis] Reconnecting..."));

  await client.connect();
  console.log("[Redis] Client ready.");
  return client;
}

// --------------------------------------------------------------------------
// Accessor — every other module calls this instead of requiring the client
// directly.  Throws if the server hasn't bootstrapped Redis yet (fast-fail
// is better than mysterious null-dereference errors deep in a request).
// --------------------------------------------------------------------------
function getRedisClient() {
  if (!client) {
    throw new Error(
      "[Redis] Client requested before initialization. " +
      "Ensure handleRedisCaching() has resolved in index.js."
    );
  }
  return client;
}

module.exports = { handleRedisCaching, getRedisClient };
