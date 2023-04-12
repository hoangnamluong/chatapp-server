const User = require("../models/User");

//@desc Get All Users
//@route POST /api/user
//@access PRIVATE
const getAllUsers = async (req, res) => {
  const { kw } = req.body;

  let crit = {};

  if (kw) {
    {
      crit = {
        ...crit,
        username: {
          $regex: kw,
          $options: "i",
        },
      };
    }
  }

  const users = await User.find(crit)
    .find({ _id: { $ne: req.user } })
    .select("-password -active -createdAt -updatedAt -roles")
    .lean()
    .exec();

  if (!users.length || !users) {
    return res.status(204).json({ message: "No Content" });
  }

  res.status(200).json({ users });
};

//@desc Get Users Outside Group
//@route POST /api/user/outside-group
//@access PRIVATE
const getUsersOutsideGroup = async (req, res) => {
  const { usersIds, kw } = req.body;
  let crit = {};

  if (kw) {
    {
      crit = {
        ...crit,
        username: {
          $regex: kw,
          $options: "i",
        },
      };
    }
  }

  if (!usersIds) {
    return res.status(400).json({ message: "Users must not be empty" });
  }

  try {
    const users = await User.find({
      _id: {
        $nin: usersIds,
      },
    })
      .find(crit)
      .select("-password -active -createdAt -updatedAt -roles")
      .lean()
      .exec();

    if (!users.length || !users) {
      return res.status(204).json({ message: "No Content" });
    }

    res.status(200).json(users);
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUsersOutsideGroup,
};
