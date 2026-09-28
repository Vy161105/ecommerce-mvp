const express = require('express');
const dotenv = require('dotenv');

const { authenticate } = require('./middleware/authenticate');
const { authorize } = require('./middleware/authorize');
const { rateLimit } = require('./middleware/rateLimit');

const {
  getProductsFromCache,
  cacheProducts,
  invalidateProductsCache
} = require('./middleware/productCache');

const { connectRedis } = require('./infrastructure/redis');

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3000);

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

const SHIPMENT_SERVICE_URL =
  process.env.SHIPMENT_SERVICE_URL || 'http://localhost:3004';


// ====================
// Middleware
// ====================

app.use(express.json());

app.use(rateLimit);


// ====================
// Logging
// ====================

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;

    console.log(
      `[Gateway] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${duration}ms`
    );
  });

  next();
});


// ====================
// Health
// ====================

app.get('/health', (_req, res) => {
  return res.status(200).json({
    service: 'api-gateway',
    status: 'UP'
  });
});


// ====================
// Admin test
// ====================

app.get(
  '/api/test/admin',
  authenticate,
  authorize(2),
  (req, res) => {
    return res.status(200).json({
      message: 'Admin access granted',
      user: req.user
    });
  }
);


// ====================
// Auth - ADMIN update membership points
// ====================

app.patch(
  '/api/auth/users/:id/membership-points',
  authenticate,
  authorize(2),
  async (req, res) => {
    try {
      const response = await fetch(
        `${AUTH_SERVICE_URL}/api/auth/users/${req.params.id}/membership-points`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req.body)
        }
      );

      const text = await response.text();

      res.status(response.status);

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Auth Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'auth-service'
      });
    }
  }
);


// ====================
// Auth Service
// ====================

app.use('/api/auth', async (req, res) => {
  try {
    const url = `${AUTH_SERVICE_URL}${req.originalUrl}`;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body:
        ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : JSON.stringify(req.body)
    });

    const text = await response.text();

    res.status(response.status);

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (error) {
    console.error(
      '[Gateway Auth Error]',
      error.message
    );

    return res.status(502).json({
      message: 'Bad Gateway',
      service: 'auth-service'
    });
  }
});


// ====================
// Product - GET public
// ====================

app.get(
  '/api/products',
  getProductsFromCache,
  async (_req, res) => {
    try {
      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/products`
      );

      const text = await response.text();

      if (!response.ok) {
        res.status(response.status);

        try {
          return res.json(JSON.parse(text));
        } catch {
          return res.send(text);
        }
      }

      let products;

      try {
        products = JSON.parse(text);
      } catch {
        return res.status(response.status).send(text);
      }

      await cacheProducts(products);

      return res.status(response.status).json(products);
    } catch (error) {
      console.error(
        '[Gateway Product Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await fetch(
      `${PRODUCT_SERVICE_URL}/products/${req.params.id}`
    );

    const text = await response.text();

    res.status(response.status);

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (error) {
    console.error(
      '[Gateway Product Error]',
      error.message
    );

    return res.status(502).json({
      message: 'Bad Gateway',
      service: 'product-service'
    });
  }
});


// ====================
// Product - ADMIN only
// ====================

app.post(
  '/api/products',
  authenticate,
  authorize(2),
  async (req, res) => {
    try {
      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req.body)
        }
      );

      const text = await response.text();

      if (response.ok) {
        await invalidateProductsCache();
      }

      res.status(response.status);

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Product Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


app.put(
  '/api/products/:id',
  authenticate,
  authorize(2),
  async (req, res) => {
    try {
      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/products/${req.params.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req.body)
        }
      );

      const text = await response.text();

      if (response.ok) {
        await invalidateProductsCache();
      }

      res.status(response.status);

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Product Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


app.delete(
  '/api/products/:id',
  authenticate,
  authorize(2),
  async (req, res) => {
    try {
      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/products/${req.params.id}`,
        {
          method: 'DELETE'
        }
      );

      const text = await response.text();

      if (response.ok) {
        await invalidateProductsCache();
      }

      res.status(response.status);

      if (!text) {
        return res.end();
      }

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Product Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


// ====================
// Order Service
// ====================

app.use(
  '/api/orders',
  authenticate,
  async (req, res) => {
    try {
      const orderPath = req.originalUrl.replace(
        /^\/api\/orders/,
        ''
      );

      const url =
        ORDER_SERVICE_URL +
        '/api/orders' +
        orderPath;

      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': req.user.uid
        },
        body:
          ['GET', 'HEAD'].includes(req.method)
            ? undefined
            : JSON.stringify(req.body)
      });

      const text = await response.text();

      res.status(response.status);

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Order Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'order-service'
      });
    }
  }
);


// ====================
// Shipment Service
// ====================

app.use(
  '/api/shipments',
  authenticate,

  // PATCH /api/shipments/:id/status
  // chỉ ADMIN (2) hoặc SHIPMENT_STAFF (3)
  (req, res, next) => {
    if (
      req.method === 'PATCH' &&
      /^\/api\/shipments\/[^/]+\/status$/.test(req.originalUrl)
    ) {
      return authorize(2, 3)(req, res, next);
    }

    next();
  },

  async (req, res) => {
    try {
      const shipmentPath = req.originalUrl.replace(
        /^\/api\/shipments/,
        ''
      );

      const url =
        SHIPMENT_SERVICE_URL +
        '/api/shipments' +
        shipmentPath;

      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': req.user.uid
        },
        body:
          ['GET', 'HEAD'].includes(req.method)
            ? undefined
            : JSON.stringify(req.body)
      });

      const text = await response.text();

      res.status(response.status);

      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.send(text);
      }
    } catch (error) {
      console.error(
        '[Gateway Shipment Error]',
        error.message
      );

      return res.status(502).json({
        message: 'Bad Gateway',
        service: 'shipment-service'
      });
    }
  }
);


// ====================
// 404
// ====================

app.use((req, res) => {
  return res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});


// ====================
// Start
// ====================

async function start() {
  try {
    await connectRedis();

    console.log('[Gateway] Redis connected');

    app.listen(PORT, () => {
      console.log(
        `api-gateway listening on port ${PORT}`
      );

      console.log(
        `auth-service target: ${AUTH_SERVICE_URL}`
      );

      console.log(
        `product-service target: ${PRODUCT_SERVICE_URL}`
      );

      console.log(
        `order-service target: ${ORDER_SERVICE_URL}`
      );

      console.log(
        `shipment-service target: ${SHIPMENT_SERVICE_URL}`
      );

      console.log(
        `redis target: ${
          process.env.REDIS_URL ||
          'redis://localhost:6379'
        }`
      );
    });
  } catch (error) {
    console.error(
      '[Gateway] Failed to start:',
      error
    );

    process.exit(1);
  }
}

start();