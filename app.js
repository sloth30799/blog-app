const express = require("express")
const app = express()
require('express-async-errors')
const cors = require("cors")
const morgan = require("morgan")
const mongoose = require("mongoose")
const config = require("./utils/config")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")
const blogsRouter = require("./controllers/blogs")

mongoose.set("strictQuery", false)

logger.info("connecting to", config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB")
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message)
  })

morgan.token("body", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : null
)

app.use(cors())
app.use(express.static("dist"))
app.use(express.json())
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ")
  })
)

app.use("/api/blogs", blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
