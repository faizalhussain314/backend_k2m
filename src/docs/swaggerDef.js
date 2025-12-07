const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'node-express',
    version,
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  servers: [
    {
      url: 'https://testdata-x7qx.onrender.com/v1',
    },
    {
      url: 'http://localhost:1234/v1',
    },
    {
      url: 'http://69.62.84.189:1234/v1',
    },
  ],
};

module.exports = swaggerDef;
