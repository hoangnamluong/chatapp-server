const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
    algorithm: "HS512",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
    algorithm: "HS512",
  });
};

//@desc Login
//@route POST /api/auth
//@access PUBLIC
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username }).lean().exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const access_token = createAccessToken({
    _id: foundUser._id,
    username: foundUser.username,
    roles: foundUser.roles,
    avatar: foundUser.avatar,
  });

  const refreshToken = createRefreshToken({
    username: foundUser.username,
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ access_token });
};

//@desc Signup
//@route POST /api/auth/signup
//@access PUBLIC
const signup = async (req, res) => {
  const { username, password, avatar } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await User.findOne({ username }).lean().exec();

  if (exists) {
    return res.status(409).json({ message: "Username exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const userObject = { username, password: hash, avatar };

  const user = await User.create(userObject);

  if (user) {
    const access_token = createAccessToken({
      _id: user._id,
      username: user.username,
      roles: user.roles,
      avatar: user.avatar,
    });

    const refreshToken = createRefreshToken({
      username: user.username,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ access_token });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
};

//@desc Refresh
//@route GET /api/auth/refresh
//@access PRIVATE
const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const foundUser = await User.findOne({ username: decoded.username });

      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const access_token = createAccessToken({
        _id: foundUser._id,
        username: foundUser.username,
        roles: foundUser.roles,
        avatar: foundUser.avatar,
      });

      res.json({ access_token });
    }
  );
};

//@desc Logout
//@route GET /api/auth/logout
//@access PRIVATE
const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.status(204);
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Cookie Cleared" });
};

module.exports = {
  login,
  signup,
  refresh,
  logout,
};
