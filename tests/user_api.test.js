const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const helper = require("./test_helper")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany()

    const passwordHash = await bcrypt.hash("irene", 10)
    const user = new User({
      username: "Irene",
      passwordHash,
      name: "Bae Joo Hyun",
    })

    await user.save()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  test("new User created successfully!", async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: "Seulgi",
      name: "Kang Seulgi",
      password: "seulgi",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test("Invalid users are not created", async () => {
    const usersAtStart = await helper.usersInDb()
    const existingUser = {
      username: "Irene",
      password: "irene",
      name: "Bae Joo Hyun",
    }

    const result = await api
      .post("/api/users")
      .send(existingUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(result.body.error).toContain("expected `username` to be unique")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test("Invalid add user operation returns a suitable status code and error message", async () => {
    const usersAtStart = await helper.usersInDb()
    const invalidUsername = {
      username: "Ir",
      password: "irene",
      name: "Bae Joo Hyun",
    }

    const resultOne = await api
      .post("/api/users")
      .send(invalidUsername)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(resultOne.body.error).toContain("Username must be at least 3 characters long!")

    const invalidPassword = {
      username: "Irene",
      password: "i",
      name: "Bae Joo Hyun",
    }

    const resultTwo = await api
      .post("/api/users")
      .send(invalidPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    expect(resultTwo.body.error).toContain("Password must be at least 3 characters long!")

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})
