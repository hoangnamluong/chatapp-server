const { default: mongoose } = require("mongoose");
const Chat = require("../../models/Chat");
const User = require("../../models/User");

//@desc Create Group Chat
//@route POST /api/chat/group
//@access Private
const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: "All fields must be filled" });
  }

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "2 users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      name,
      users,
      isGroupChat: true,
      admin: req.user,
    });

    const getCreatedGroupChat = await Chat.findOne({
      _id: groupChat._id,
    }).populate([
      { path: "users", select: "-password -active" },
      { path: "admin", select: "-password -active" },
    ]);

    res.status(201).json(getCreatedGroupChat);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

//@desc Rename Group Name
//@route POST /api/chat/group/rename
//@access Private
const renameGroupChat = async (req, res) => {
  const { _id, name } = req.body;

  if (!_id) {
    res.status(400).json({ message: "Id must not be empty" });
  }

  if (!name) {
    res.status(400).json({ message: "Name must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    res.status(400).json({ message: "Id not valid" });
  }

  try {
    const groupChat = await Chat.findOne({ _id }).exec();

    if (!groupChat) {
      return res.status(400).json({ message: "Chat not found" });
    }

    groupChat.name = name;

    let updatedChat = await groupChat.save();

    updatedChat = await User.populate(updatedChat, [
      { path: "users", select: "-password -active" },
      { path: "admin", select: "-password -active" },
    ]);

    res.status(200).json(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

//@desc Add User To Group
//@route POST /api/chat/group/add-user
//@access Private
const addUsersToGroup = async (req, res) => {
  const { _id, users } = req.body;

  if (!_id) {
    res.status(400).json({ message: "Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    res.status(400).json({ message: "Id not valid" });
  }

  try {
    const getChat = await Chat.findOne({ _id }).exec();

    if (!getChat) {
      return res.status(400).json({ message: "Chat not found" });
    }

    users.forEach((user) => {
      getChat.users.push(user);
    });

    let getAddUserGroupChat = await getChat.save();

    getAddUserGroupChat = await User.populate(getAddUserGroupChat, [
      { path: "users", select: "-password -active" },
      { path: "admin", select: "-password -active" },
    ]);

    res.status(200).json(getAddUserGroupChat);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

//@desc Remove User From Group
//@route POST /api/chat/group/remove-user
//@access Private
const removeUserFromGroup = async (req, res) => {
  const { _id, usersIds } = req.body;

  if (!_id) {
    res.status(400).json({ message: "Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    res.status(400).json({ message: "Id not valid" });
  }

  try {
    let getChat = await Chat.findOne({ _id }).exec();

    if (!getChat) {
      return res.status(400).json({ message: "Chat not found" });
    }

    if (getChat.users.length <= 3) {
      return res.status(400).json({ message: "Group reachs minimun Members" });
    }

    usersIds.forEach((id) => {
      getChat.users.pull({ _id: id });
    });

    let removeUserFromChat = await getChat.save();

    removeUserFromChat = await User.populate(removeUserFromChat, [
      { path: "users", select: "-password -active" },
      { path: "admin", select: "-password -active" },
    ]);

    res.status(200).json(removeUserFromChat);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

//@desc Leave Group Chat
//@route PATCH /api/chat/group/leave
//@access Private
const leaveGroup = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    res.status(400).json({ message: "Id must not be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    res.status(400).json({ message: "Id not valid" });
  }

  try {
    const getChat = await Chat.findOne({
      _id,
    });

    if (!getChat) {
      return res.status(400).json({ message: "Forbidden" });
    }

    if (getChat.users.length === 1) {
      const deletedChat = await getChat.deleteOne();

      return res.status(200).json(deletedChat);
    } else {
      const filteredUsers = getChat.users.filter(
        (user) => user.toString() !== req.user
      );

      if (getChat.admin.toString() === req.user) {
        getChat.admin = filteredUsers[0];
      }

      getChat.users = filteredUsers;

      const updatedChat = await getChat.save();

      return res.status(200).json(updatedChat);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
module.exports = {
  createGroupChat,
  renameGroupChat,
  addUsersToGroup,
  removeUserFromGroup,
  leaveGroup,
};
