module.exports = (io, socket) => {
  const joinRoom = (room) => {
    socket.join(room);
  };

  socket.on("join room", joinRoom);
};
