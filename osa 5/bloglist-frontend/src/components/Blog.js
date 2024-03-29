import { useState } from 'react'

const Blog = ({ blog, handleLikes, deleteBlog, user }) => {
  //console.log('blogusername: ', blog.user.name)
  //console.log('user: ', user)
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    fontWeight: 'normal',
    fontSize: 18
  }

  const [show, toggleShow] = useState(false)
  const [like, setLike] = useState(blog.likes)
  const [showRemove, setShowRemove] = useState(false)

  const addLike = () => {
    const updateBlog = { ...blog }
    //console.log('blogToUpdate: ', updateBlog)
    //console.log('blog: ', blog)
    handleLikes(updateBlog)
    //console.log('button clicked')
    //console.log(like)
    setLike(like + 1)
  }

  const handleShow = () => {
    toggleShow(!show)

    if (user.username === blog.user.username) setShowRemove(!showRemove)
  }

  const removeSelected = () => {
    const remove = { ...blog }
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(remove)
    }
  }

  return (
    <div className="blog" style={blogStyle}>
      <div>
        <p>
          {blog.title}
          <button onClick={handleShow}>{show ? 'hide' : 'view'}</button>
        </p>
      </div>
      {show && blog.url}
      {show && (
        <div className="toggleview">
          <p>
            likes: {like} <button onClick={addLike}>like</button>
          </p>
          <p className="showUser">{blog.user.name}</p>
        </div>
      )}
      <div className="remove">
        {showRemove && (
          <p>
            <button onClick={removeSelected}>remove </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Blog
