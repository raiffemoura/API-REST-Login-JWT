const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loginValidate, registerValidate } = require("./validate");

const userController = {
  register: async (req, res) => {
    const { error } = registerValidate(req.body);
    if (error) {
      return res.status(400).send(error.message);
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User with that email already exists." });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    try {
      const savedUser = await user.save();
      res.send(savedUser);
    } catch (error) {
      res.status(400).send(error);
    }
  },
  login: async (req, res) => {
    const { error } = loginValidate(req.body);
    if (error) {
      return res.status(400).send(error.message);
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res
        .status(400)
        .send({ message: "Wrong email or password. Please try again." });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .send({ message: "Wrong email or password. Please try again." });
    }

    const token = jwt.sign(
      { _id: existingUser._id, admin: existingUser.admin },
      process.env.TOKEN_SECRET
    );
    res.header("auth-token", token);
    return res.send("User logged in successfully");
  },
};

module.exports = userController;
