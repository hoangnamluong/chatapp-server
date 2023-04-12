const { logEvent } = require("./logEvent");

const errorHandler = (error, req, res, next) => {
  logEvent(
    `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );

  console.log(error.stack);

  const status = res.statusCode ? res.statusCode : 500;

  res.status(status).json({ message: error.message });

  next();
};

module.exports = errorHandler;
