const router = require("express").Router();
const loginLimiter = require("../middlewares/loginLimiter");

const {
  login,
  signup,
  refresh,
  logout,
} = require("../controllers/authController");

router.route("/").post(loginLimiter, login);

router.route("/refresh").get(refresh);

router.route("/signup").post(signup);

router.route("/logout").post(logout);

module.exports = router;
