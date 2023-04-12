const router = require("express").Router();
const verifyJwt = require("../middlewares/verifyJwt");

const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageController/messageController");

router.use(verifyJwt);

router.route("/").post(sendMessage);
router.route("/:chatId").get(getAllMessages);

module.exports = router;
