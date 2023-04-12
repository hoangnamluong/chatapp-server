const rateLimiter = require("express-rate-limit");
const { logEvent } = require("./logEvent");

const loginLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 1 minute",
  },
  handler: (req, res, next, options) => {
    logEvent(
      `Too many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );

    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: true,
});

module.exports = loginLimiter;
