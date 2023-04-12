const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");

const logEvent = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  const logsPath = (filename) => {
    if (filename) {
      return path.join(__dirname, "..", "logs", filename);
    }
    return path.join(__dirname, "..", "logs");
  };

  try {
    if (!fs.existsSync(logsPath())) {
      await fsPromise.mkdir(logsPath());
    }
    await fsPromise.appendFile(logsPath(logFileName), logItem);
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  logEvent(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");

  next();
};

module.exports = { logEvent, logger };
