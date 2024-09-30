const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.replicate.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/v1/predictions', // réécrit l'URL
      },
    })
  );
};
