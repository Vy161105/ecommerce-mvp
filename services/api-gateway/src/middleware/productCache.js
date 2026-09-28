const { redisClient } = require('../infrastructure/redis');

const CACHE_KEY = 'products:all';

const CACHE_TTL_SECONDS = Number(
  process.env.PRODUCT_CACHE_TTL_SECONDS || 30
);

async function getProductsFromCache(req, res, next) {
  try {
    if (!redisClient.isReady) {
      return next();
    }

    const cached = await redisClient.get(CACHE_KEY);

    if (cached) {
      console.log('[Product Cache] HIT');

      res.setHeader('X-Cache', 'HIT');

      return res.status(200).json(
        JSON.parse(cached)
      );
    }

    console.log('[Product Cache] MISS');

    res.setHeader('X-Cache', 'MISS');

    return next();
  } catch (error) {
    console.error(
      '[Product Cache Error]',
      error
    );

    return next();
  }
}

async function cacheProducts(products) {
  if (!redisClient.isReady) {
    return;
  }

  await redisClient.set(
    CACHE_KEY,
    JSON.stringify(products),
    {
      EX: CACHE_TTL_SECONDS
    }
  );

  console.log(
    `[Product Cache] SET (${CACHE_TTL_SECONDS}s)`
  );
}

async function invalidateProductsCache() {
  if (!redisClient.isReady) {
    return;
  }

  await redisClient.del(CACHE_KEY);

  console.log('[Product Cache] INVALIDATED');
}

module.exports = {
  getProductsFromCache,
  cacheProducts,
  invalidateProductsCache
};
