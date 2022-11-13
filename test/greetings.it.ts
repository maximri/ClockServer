import { server } from "../src/app"
import nock from 'nock'
import request from 'supertest'

const timeServerUrl = 'http://exampleURL'
const appServer = server({ appServerPort: 3000, timeServerUrl })
const myServer = request(appServer)

describe('Clock Server when accessing /greeting', () => {
  beforeEach (() => {
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 17:00:00") } })
  })
  
  afterAll(()=> {
    appServer.close()
  })

  test("should return a greeting with your name from the query param", async () => {
    const userName = 'shay'
    const response = await myServer.get('/greeting?name=' + userName)
  
    expect(response.status).toBe(200)
    expect(response.body.message).toBe(`Greetings ${userName}!`)
  })
  
  test("should return a greeting with your name from the the query param, also for max", async () => {
    const response = await myServer.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Greetings max!')
  })

  test("should return zzz when server time is between 2-4pm", async () => {
    nock.cleanAll()
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date("2017-01-01 15:00:00") } })
    const response = await myServer.get('/greeting?name=max')
    
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('zzz')
  })
})

