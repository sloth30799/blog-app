const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/Blog")
const helper = require("./test_helper")
const User = require("../models/User")

const api = supertest(app)
let token = ""

beforeEach(async () => {
  const response = await api.post("/api/login").send({
    username: "Irene",
    password: "irene",
  })

  token = response.body.token

  await Blog.deleteMany()

  const user = await User.findOne({ username: "Irene" })
  for (let blog of helper.testBlogs) {
    blog.user = user._id.toString()
    let blogObj = new Blog(blog)
    await blogObj.save()
  }
})

afterAll(async () => {
  await mongoose.connection.close()
})

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .expect("Content-Type", /application\/json/)
}, 100000)

test("all blogs are returned", async () => {
  const response = await api
    .get("/api/blogs")
    .set("Authorization", `Bearer ${token}`)

  expect(response.body).toHaveLength(helper.testBlogs.length)
})

test("verifies that unique identifier of blogs is named id", async () => {
  const response = await api
    .get("/api/blogs")
    .set("Authorization", `Bearer ${token}`)

  expect(response.body[0].id).toBeDefined()
})

test("successfully creates a new blog post", async () => {
  const newBlog = {
    title: "What A Chill Kill",
    author: "Red Velvet",
    url: "/red-velvet",
    likes: 12,
  }

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  const blogs = await helper.blogsInDb()
  expect(blogs).toHaveLength(helper.testBlogs.length + 1)

  const blogContents = blogs.map((b) => b.title)
  expect(blogContents).toContain("What A Chill Kill")
})

test("fails if there is no token", async () => {
  const newBlog = {
    title: "What A Chill Kill",
    author: "Red Velvet",
    url: "/red-velvet",
    likes: 12,
  }

  const res = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
    .expect("Content-Type", /application\/json/)

  expect(res.body.error).toContain("Unauthorized")
})

test("default to the value 0 if the likes property is missing from the request", async () => {
  const newBlog = {
    title: "By My Side",
    author: "Taeyeon",
    url: "/taeyeon",
  }

  const response = await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)

  expect(response.body.likes).toBe(0)
})

test("if the title or url properties are missing, status code 400", async () => {
  const blogWithoutTitle = {
    author: "Taeyeon",
    url: "/taeyeon",
  }

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(blogWithoutTitle)
    .expect(400)

  const blogWithoutURL = {
    title: "By My Side",
    author: "Taeyeon",
  }

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(blogWithoutURL)
    .expect(400)
})

test("update a blog", async () => {
  const updateBlog = {
    title: "The Art of Blogging",
    likes: 20,
  }

  const blogs = await helper.blogsInDb()
  const blogToUpdate = blogs.find((b) => b.title === updateBlog.title)

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updateBlog)

  expect(response.body.likes).toBe(updateBlog.likes)
})

test("delete a single blog", async () => {
  const blogs = await helper.blogsInDb()
  const blogToDelete = blogs[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204)

  const blogsAfterDelete = await helper.blogsInDb()
  expect(blogsAfterDelete).toHaveLength(helper.testBlogs.length - 1)
})
