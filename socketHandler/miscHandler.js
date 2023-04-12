module.exports = (io, socket) => {
  const typing = (room) => {
    socket.in(room).emit("typing", room);
  };
  const stopTyping = (room) => {
    socket.in(room).emit("stop typing", room);
  };

  socket.on("typing", typing);
  socket.on("stop typing", stopTyping);
};
