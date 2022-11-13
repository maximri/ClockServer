import { server } from "../src/app"
import nock from 'nock'
import request from 'supertest'

const timeServerUrl = 'http://exampleURL'
const appServer = server({ appServerPort: 3000, timeServerUrl })
const timeServer = request(appServer)

describe('greetings server', () => {
  beforeEach (() => {
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 17:00:00") } })
  })
  
  afterAll(()=> {
    appServer.close()
  })

  test("Should print your name", async () => {
    const userName = 'shay'
    const response = await timeServer.get('/greeting?name=' + userName)
  
    expect(response.status).toBe(200)
    expect(response.body.message).toBe(`Greetings ${userName}!`)
  })
  
  test("Should print your name, also for max", async () => {
    const response = await timeServer.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Greetings max!')
  })

  test("Should print zzz when server time is between 2-4pm", async () => {
    nock.cleanAll()
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 15:00:00") } })
    const response = await timeServer.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('zzz')
  })
})

