const { authorize } = require('./middleware/authorize');
const { authenticate } = require('./middleware/authenticate');
require('dotenv').config();

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

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

app.use(
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,

    pathFilter: ['/api/auth/**'],

    timeout: 10000,
    proxyTimeout: 10000,

    on: {
      proxyReq: (proxyReq, req) => {
        console.log(
          `[Gateway] ${req.method} ${req.originalUrl} -> ${AUTH_SERVICE_URL}${req.originalUrl}`
        );
      },

      error: (err, req, res) => {
        console.error('[Gateway Proxy Error]', err.message);

        if (!res.headersSent) {
          res.status(502).json({
            message: 'Bad Gateway',
            error: err.message
          });
        }
      }
    }
  })
);

app.listen(PORT, () => {
  console.log(`api-gateway listening on port ${PORT}`);
  console.log(`auth-service target: ${AUTH_SERVICE_URL}`);
});