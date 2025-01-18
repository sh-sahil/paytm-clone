const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../User");
const { Account } = require("../Account");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const authmiddleware = require("../middleware");

const router = express.Router();

const signupBody = {
  username: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
};

router.post("/signup", async (req, res) => {
  const { validInput } = signupBody.safeParse(req.body);
  if (!validInput) {
    return res.status(411).json({
      message: "Invalid Input",
    });
  }

  const { existingUser } = await User.findOne({ username: req.body.username });
  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const newUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const userId = newUser._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({ message: "User created", token });
});

const signinBody = {
  username: zod.string().email(),
  password: zod.string(),
};

router.post("/signin", async (req, res) => {
  const { validInput } = signinBody.safeParse(req.body);
  if (!validInput) {
    return res.status(411).json({
      message: "Invalid Input",
    });
  }

  const { existingUser } = await User.findOne({ username: req.body.username });
  if (!existingUser || existingUser.password !== req.body.password) {
    res.status(401).json({
      message: "Invalid Username or Password",
    });
  }

  const userId = existingUser._id;
  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({ message: "Signin Successful", token });
});

const updateBody = {
  password: zod.string().optional(),
  firstName: zod.string().optionl(),
  lastName: zod.string().optional(),
};

router.put("/", authmiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while Updatiing  Input",
    });
  }

  await User.updateOne({ _id: res.userId }, req.body);

  res.json({ message: "user updated" });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";
  const user = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map(user => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
module.exports = router;
