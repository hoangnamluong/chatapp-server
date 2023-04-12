require("dotenv").config();
require("express-async-errors");

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const { logger, logEvent } = require("./middlewares/logEvent");
const errorHandler = require("./middlewares/errorHandler");

const corsOptions = require("./config/corsOptions");
const connectToDb = require("./config/dbConn");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const registerChatHandler = require("./socketHandler/chatHandler");
const registerMessageHandler = require("./socketHandler/messageHandler");
const registerMiscHandler = require("./socketHandler/miscHandler");

const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");

app.use(logger);

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(errorHandler);

connectToDb();

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CLIENT_ENVIRONMENT,
    },
  });

  const onConnection = (socket) => {
    socket.on("setup", (userId) => {
      socket.join(userId);
      socket.emit("connected");
    });

    registerChatHandler(io, socket);
    registerMiscHandler(io, socket);
    registerMessageHandler(io, socket);
  };

  io.on("connection", (socket) => {
    onConnection(socket);

    socket.off("setup", (userId) => {
      socket.leave(userId);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`connected to ${PORT}`);
  });
});

mongoose.connection.on("error", (error) => {
  console.log(error);

  logEvent(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
