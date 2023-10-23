const blogsRouter = require("express").Router()
const Blog = require("../models/Blog")

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({})

  if (blogs) {
    res.json(blogs)
  } else {
    res.status(404).end()
  }
})

blogsRouter.post("/", async (req, res) => {
  const { body } = req
  const blog = new Blog(body)

  if (!body.title || !body.url) {
    res.status(400).json({
      error: "Blog data is missing!",
    })
  }

  const savedBlog = await blog.save()

  res.status(201).json(savedBlog)
})

blogsRouter.put("/:id", async (req, res) => {
  const { body } = req

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, body, {
    new: true,
  })

  res.json(updatedBlog)
})

blogsRouter.delete("/:id", async(req, res) => {
  await Blog.findByIdAndRemove(req.params.id)

  res.status(204).end()
})

module.exports = blogsRouter
