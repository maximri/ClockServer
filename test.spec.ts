import { sum } from "./main"
import {  TimeService, GreetingsService, GreetingsServiceFactory } from './services'
const nock = require("nock")
const supertest = require('supertest')
const server = require('./app')
const timeServerUrl = 'http://exampleURL'

const request = supertest(server(timeServerUrl))
test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3)
})
describe('greetings server', () => {
  beforeEach (() => {
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 17:00:00") } });
  })
  test("Should print your name", async () => {
    const response = await request.get('/greeting?name=shay')
  
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Greetings shay!')
  })
  
  test("Should print your name, also for max", async () => {
    const response = await request.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Greetings max!')
  })

  test("Should print zzz when server time is between 2-4pm", async () => {
    nock.cleanAll()
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 15:00:00") } });
    const response = await request.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('zzz')
  })
})
describe('greetings service', () => {
  test("Should greet with good evening when server time is between 7-8pm", async () => {
    const timeService: TimeService = { getTime: () => (Promise.resolve(new Date("2017-01-01 19:30:00"))) }
    const greetingService: GreetingsService = GreetingsServiceFactory(timeService)
    const res = await greetingService.greet('max')
    expect(res).toBe('Good evening max')
  })
})
