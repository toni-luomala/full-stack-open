const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('return right amount of blogs', async () => {
  const response = await api.get('/api/blogs')
  const blogsAtEnd = await helper.blogsInDb()
  expect(response.body.length).toBe(blogsAtEnd.length)
})

test('returned blogs are JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('returned blogs has field "id"', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'testing',
    author: 'tester',
    url: 'jippii.fi',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})

test('likes with empty string is null', async () => {
  const newBlog = {
    title: 'newBlog',
    author: 'mySelf',
    url: 'justtesting.com'
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const lastObject = blogsAtEnd.pop()

  expect(lastObject.likes).toBe(0)
})

test('title and url are required', async () => {
  const newBlog = {
    author: 'mySelf',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

  const authors = blogsAtEnd.map((r) => r.author)

  expect(authors).not.toContain(blogToDelete.author)
})

test('likes of a blog can be updated', async () => {
  const updatedBlog = {
    likes: 10
  }

  const blogsAtStart = await helper.blogsInDb()
  const idOfUpdated = blogsAtStart[0].id
  console.log('idOfUpdated', idOfUpdated)

  await api
    .put(`/api/blogs/${idOfUpdated}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(updatedBlog.likes).toEqual(blogsAtEnd[0].likes)
})

test('invalid username or password is not accepted', async () => {
  const login = {
    username: 'to',
    password: 'lu'
  }
  const blogsAtStart = await helper.blogsInDb()

  await api
    .post('/api/users')
    .send(login)
    .expect(403)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtStart).toEqual(blogsAtEnd)
})

test
afterAll(async () => {
  await mongoose.connection.close()
})
