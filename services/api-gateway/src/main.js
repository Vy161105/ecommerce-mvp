const express = require('express');
const dotenv = require('dotenv');

const { authenticate } = require('./middleware/authenticate');
const { authorize } = require('./middleware/authorize');

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

app.use(express.json());


// ====================
// Health
// ====================

app.get('/health', (_req, res) => {
  res.json({
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
  authorize(1),
  (req, res) => {
    res.status(200).json({
      message: 'Admin access granted',
      user: req.user
    });
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
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error('[Gateway Auth Error]', error.message);

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'auth-service'
    });
  }
});


// ====================
// Product - GET public
// ====================

app.get('/api/products', async (req, res) => {
  try {
    const response = await fetch(
      `${PRODUCT_SERVICE_URL}/products`
    );

    const text = await response.text();

    res.status(response.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error('[Gateway Product Error]', error.message);

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'product-service'
    });
  }
});


app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await fetch(
      `${PRODUCT_SERVICE_URL}/products/${req.params.id}`
    );

    const text = await response.text();

    res.status(response.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error('[Gateway Product Error]', error.message);

    res.status(502).json({
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
  authorize(1),
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

      res.status(response.status);

      try {
        res.json(JSON.parse(text));
      } catch {
        res.send(text);
      }
    } catch (error) {
      console.error('[Gateway Product Error]', error.message);

      res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


app.put(
  '/api/products/:id',
  authenticate,
  authorize(1),
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

      res.status(response.status);

      try {
        res.json(JSON.parse(text));
      } catch {
        res.send(text);
      }
    } catch (error) {
      console.error('[Gateway Product Error]', error.message);

      res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


app.delete(
  '/api/products/:id',
  authenticate,
  authorize(1),
  async (req, res) => {
    try {
      const response = await fetch(
        `${PRODUCT_SERVICE_URL}/products/${req.params.id}`,
        {
          method: 'DELETE'
        }
      );

      const text = await response.text();

      res.status(response.status);

      if (text) {
        try {
          res.json(JSON.parse(text));
        } catch {
          res.send(text);
        }
      } else {
        res.end();
      }
    } catch (error) {
      console.error('[Gateway Product Error]', error.message);

      res.status(502).json({
        message: 'Bad Gateway',
        service: 'product-service'
      });
    }
  }
);


// ====================
// Order Service - AUTH required
// ====================

app.use('/api/orders', authenticate, async (req, res) => {
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
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body)
    });

    const text = await response.text();

    res.status(response.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error('[Gateway Order Error]', error.message);

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'order-service'
    });
  }
});


// ====================
// Shipment Service - AUTH required
// ====================

app.use('/api/shipments', authenticate, async (req, res) => {
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
        'Content-Type': 'application/json'
      },
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body)
    });

    const text = await response.text();

    res.status(response.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error('[Gateway Shipment Error]', error.message);

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'shipment-service'
    });
  }
});


// ====================
// 404
// ====================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});


// ====================
// Start
// ====================

app.listen(PORT, () => {
  console.log(`api-gateway listening on port ${PORT}`);
  console.log(`auth-service target: ${AUTH_SERVICE_URL}`);
  console.log(`product-service target: ${PRODUCT_SERVICE_URL}`);
  console.log(`order-service target: ${ORDER_SERVICE_URL}`);
  console.log(`shipment-service target: ${SHIPMENT_SERVICE_URL}`);
});