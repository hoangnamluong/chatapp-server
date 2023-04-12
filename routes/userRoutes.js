const router = require("express").Router();
const verifyJwt = require("../middlewares/verifyJwt");
const {
  getAllUsers,
  getUsersOutsideGroup,
} = require("../controllers/userController");

router.use(verifyJwt);

router.route("/").post(getAllUsers);
//   .post(getSingleUser)
//   .put(updateUser)
//   .delete(deleteUser);

router.route("/outside-group").post(getUsersOutsideGroup);

module.exports = router;
