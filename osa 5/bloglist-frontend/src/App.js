import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import './styles/app.css'
import Error from './components/Error'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs.sort(sortByLikes)))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      //console.log('user: ', user)
      blogService.setToken(user.token)
      //console.log(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const user = await loginService.login({
        username,
        password
      })

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const addBlog = (blogObject) => {
    blogService.create(blogObject).then((returnedBlog) => {
      setBlogs(blogs.concat({ ...returnedBlog, user }))
      console.log('returnedblog: ', returnedBlog)

      setNotificationMessage(
        `a new blog ${blogObject.title} by ${blogObject.author} added`
      )
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    })
  }

  const handleLikes = (id) => {
    //console.log('id: ', id)
    const blog = blogs.find((b) => b.id === id)
    //console.log('blog: ', blog)
    const updatedBlog = { ...blog, likes: ++blog.likes }
    //console.log('updateBlog: ', updatedBlog)

    blogService.update(id, updatedBlog).then((response) => {
      console.log('response: ', response)
      // Tilan muuttuessa blogit järjestetään likejen mukaiseen järjestykseen. Tämä on toteutettu vain cypress testin helpottamiseksi.
      setBlogs(
        blogs
          .sort(sortByLikes)
          .map((blog) => (blog.id !== id ? blog : response))
      )

      setErrorMessage('Cannot add more likes')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    })
  }

  const sortByLikes = (a, b) => {
    return a.likes > b.likes ? -1 : 0
  }

  const deleteBlog = (id) => {
    blogService
      .remove(id)
      .then(() => {
        setBlogs(blogs.filter((b) => b.id !== id))
      })
      .catch((error) => {
        console.log('Delete failed')
      })
  }

  if (user === null) {
    return (
      <div className="Login">
        <h2>Log in to application</h2>
        <Error errorMessage={errorMessage} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              id="username"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              id="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const logout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  return (
    <div>
      <div>
        <h2>blogs</h2>
        <Notification notificationMessage={notificationMessage} />
        <p className="logged">
          {user.name} logged in <button onClick={logout}>logout</button>
        </p>
        <Togglable buttonLabel="create new blog" ref={blogFormRef}>
          <BlogForm createBlog={addBlog} />
        </Togglable>

        {blogs.map((blog) => (
          <Blog
            key={blog.title}
            blog={blog}
            handleLikes={() => handleLikes(blog.id)}
            deleteBlog={() => deleteBlog(blog.id)}
            user={user}
          />
        ))}
      </div>
    </div>
  )
}
export default App
