const Chat = require("../../models/Chat");
const User = require("../../models/User");
const Message = require("../../models/Message");
const { default: mongoose } = require("mongoose");

//@desc Access Chat
//@route POST /api/chat
//@access PRIVATE
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User Id empty");
    return res.status(400).json({ message: "User Id empty" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate({ path: "users", select: "-password -active" })
    .populate({ path: "admin", select: "-password -active" })
    .populate({ path: "latest" });

  isChat = await User.populate(isChat, {
    path: "latest.sender",
  });

  const user = await User.findOne({ _id: userId }).lean().exec();

  if (isChat.length > 0) {
    res.status(200).json({ chat: isChat[0] });
  } else {
    try {
      const createdChat = await Chat.create({
        name: user.username,
        isGroupChat: false,
        users: [req.user, userId],
      });

      const getCreatedChat = await Chat.find({ _id: createdChat._id })
        .populate({ path: "users", select: "-password -active" })
        .populate({ path: "admin", select: "-password -active" });

      res.status(201).json({ chat: getCreatedChat });
    } catch (err) {
      res.status(400).json({ message: err });
      console.log(err);
    }
  }
};

//@desc Get All Chats
//@route GET /api/chat
//@access PRIVATE
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user } },
    })
      .sort({ updatedAt: -1 })
      .exec();

    chats = await User.populate(chats, [
      {
        path: "users",
        select: "-password -active",
      },
      {
        path: "admin",
        select: "-password -active",
      },
    ]);

    chats = await Message.populate(chats, [{ path: "latest" }]);

    chats = await User.populate(chats, {
      path: "latest.user",
      select: "-password -active",
    });

    if (!chats) {
      return res.status(400).json({ message: "Could not fetch Chats" });
    }

    res.status(200).json(chats);
  } catch (err) {
    res.status(400).json({ message: err });
    console.log(err);
  }
};

//@desc Get All Chats
//@route GET /api/chat
//@access PRIVATE
const fetchChatById = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).json({ message: "Chat Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    res.status(400).json({ message: "Chat Id not valid" });
  }

  try {
    let chat = await Chat.findOne({ _id: chatId }).exec();

    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }

    chat = await User.populate(chat, [
      {
        path: "users",
        select: "-password -active",
      },
      {
        path: "admin",
        select: "-password -active",
      },
    ]);

    chat = await Message.populate(chat, [{ path: "latest" }]);

    chat = await User.populate(chat, {
      path: "latest.user",
      select: "-password -active",
    });

    res.status(200).json(chat);
  } catch (err) {
    res.status(400).json({ message: err });
    console.log(err);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  fetchChatById,
};
