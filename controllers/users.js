const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/User")

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  })

  if (users) {
    res.json(users)
  } else {
    res.status(404).end()
  }
})

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body

  if (password.length < 3) {
    return res.status(400).json({
      error: "Password must be at least 3 characters long!",
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = usersRouter
