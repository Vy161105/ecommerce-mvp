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
// Auth Service Proxy
// ====================

app.use('/api/auth', async (req, res) => {
  try {
    const url =
      `${AUTH_SERVICE_URL}${req.originalUrl}`;

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
    console.error(
      '[Gateway Auth Error]',
      error.message
    );

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'auth-service'
    });
  }
});


// ====================
// Product Service
// ====================

app.use('/api/products', async (req, res) => {
  try {
    const productPath =
      req.originalUrl.replace(
        /^\/api\/products/,
        '/products'
      );

    const url =
      `${PRODUCT_SERVICE_URL}${productPath}`;

    console.log(
      `[Gateway] ${req.method} ${req.originalUrl} -> ${url}`
    );

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
    console.error(
      '[Gateway Product Error]',
      error.message
    );

    res.status(502).json({
      message: 'Bad Gateway',
      service: 'product-service',
      error: error.message
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
  console.log(
    `api-gateway listening on port ${PORT}`
  );

  console.log(
    `auth-service target: ${AUTH_SERVICE_URL}`
  );

  console.log(
    `product-service target: ${PRODUCT_SERVICE_URL}`
  );
});