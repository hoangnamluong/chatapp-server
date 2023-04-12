const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ENVIRONMENT,
];

module.exports = allowedOrigins;
