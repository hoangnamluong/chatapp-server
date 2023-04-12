module.exports = (io, socket) => {
  const newMessageReceived = (newMessage) => {
    const chat = newMessage.chat;

    if (!chat.users) return console.log("Chat.users error");

    chat.users.forEach((user) => {
      if (user === newMessage.user._id) return;

      socket.in(user).emit("message received", newMessage);
    });
  };

  socket.on("new message", newMessageReceived);
};
