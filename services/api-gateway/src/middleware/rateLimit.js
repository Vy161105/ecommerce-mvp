const { redisClient } = require('../infrastructure/redis');

const WINDOW_SECONDS = Number(
  process.env.RATE_LIMIT_WINDOW_SECONDS || 60
);

const MAX_REQUESTS = Number(
  process.env.RATE_LIMIT_MAX_REQUESTS || 30
);

async function rateLimit(req, res, next) {
  const forwardedFor = req.headers['x-forwarded-for'];

  const ip =
    forwardedFor?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const key = `rate-limit:${ip}`;

  try {
    if (!redisClient.isReady) {
      console.error('[RateLimit] Redis is not ready');

      return res.status(503).json({
        message: 'Rate limiting service unavailable'
      });
    }

    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(
        key,
        WINDOW_SECONDS
      );
    }

    res.setHeader(
      'X-RateLimit-Limit',
      String(MAX_REQUESTS)
    );

    res.setHeader(
      'X-RateLimit-Remaining',
      String(
        Math.max(MAX_REQUESTS - count, 0)
      )
    );

    if (count > MAX_REQUESTS) {
      res.setHeader(
        'Retry-After',
        String(WINDOW_SECONDS)
      );

      return res.status(429).json({
        message: 'Too many requests',
        retryAfterSeconds: WINDOW_SECONDS
      });
    }

    next();
  } catch (error) {
    console.error(
      '[RateLimit Error]',
      error
    );

    return res.status(503).json({
      message: 'Rate limiting service unavailable'
    });
  }
}

module.exports = {
  rateLimit
};
