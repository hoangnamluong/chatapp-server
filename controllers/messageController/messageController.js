const { default: mongoose } = require("mongoose");
const Message = require("../../models/Message");
const Chat = require("../../models/Chat");

//@desc Send Message
//@route POST /api/message/
//@access PRIVATE
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: "Content and Chat Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Chat Id is not valid" });
  }

  const chat = await Chat.findOne({ _id: chatId }).exec();

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const newMessage = {
    user: req.user,
    content: content,
    chat: chatId,
  };

  try {
    const message = await Message.create(newMessage);

    const messagePopulate = await message.populate([
      {
        path: "user",
        select: "username avatar",
      },
      {
        path: "chat",
      },
    ]);

    chat.latest = message._id;

    await chat.save();

    res.status(201).json(messagePopulate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//@desc Get All Messages
//@route GET /api/message/:chatId
//@access PRIVATE
const getAllMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res
      .status(400)
      .json({ message: "Content and Chat Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Chat Id is not valid" });
  }

  const chat = await Chat.findOne({ _id: chatId }).exec();

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  try {
    const messages = await Message.find({ chat: chatId }).populate([
      { path: "user", select: "username avatar" },
      { path: "chat" },
    ]);

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
};
