const router = require("express").Router();
const verifyJwt = require("../middlewares/verifyJwt");
const {
  accessChat,
  fetchChats,
  fetchChatById,
} = require("../controllers/chatController/chatController");
const {
  createGroupChat,
  renameGroupChat,
  addUsersToGroup,
  leaveGroup,
  removeUserFromGroup,
} = require("../controllers/chatController/groupChatController");

router.use(verifyJwt);

router.route("/").post(accessChat).get(fetchChats);
router.route("/:chatId").get(fetchChatById);

router.route("/group").post(createGroupChat);
router.route("/group/rename").patch(renameGroupChat);
router.route("/group/leave").patch(leaveGroup);
router.route("/group/add-user").patch(addUsersToGroup);
router.route("/group/remove-user").patch(removeUserFromGroup);

module.exports = router;
