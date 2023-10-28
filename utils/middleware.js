const logger = require("./logger")
const jwt = require("jsonwebtoken")

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  logger.info(error.name)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "invalid token" })
  }

  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization")

  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "")
    next()
  } else {
    res.status(401).json({ error: "Unauthorized" })
  }
}

const userExtractor = (req, res, next) => {
  const userFromToken = jwt.verify(req.token, process.env.SECRET)
  if (userFromToken.id) {
    req.user = userFromToken
    next()
  } else {
    res.status(401).json({ error: "Unauthorized" })
  }
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
