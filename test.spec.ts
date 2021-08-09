import { sum } from "./main"
const supertest = require('supertest')
const app = require('./app')

const request = supertest(app)
test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3)
})

test("Should print your name", async () => {
  const response = await request.get('/greeting?name=shay')
  
  expect(response.status).toBe(200)
  expect(response.body.message).toBe('Greetings shay!')
})
