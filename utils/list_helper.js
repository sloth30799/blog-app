const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((t, blog) => (t += blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  let favorite = blogs[0]

  blogs.forEach((blog) => {
    if (favorite.likes < blog.likes) {
      favorite = blog
    }
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
