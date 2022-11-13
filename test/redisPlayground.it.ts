import { AppInitConfig, server } from "../src/app"
import request from 'supertest'
import { RedisMemoryServer } from 'redis-memory-server'
import nock from "nock"
import eventually from "wix-eventually"

const timeServerUrl = 'http://exampleURL'

describe('Server should use Redis',  () => {
  let redisServer: RedisMemoryServer

  const appInitConfig: AppInitConfig = {
    appServerPort: 3000, timeServerUrl, redisPort: 3010, redisHost: '127.0.0.1' }

  const appServer = server(appInitConfig)
  const requestFor = request(appServer)

  beforeAll(async () => {
    redisServer = new RedisMemoryServer({ instance: { port: 3010 } })
    await redisServer.start()
  })

  afterAll(async () => {
    appServer.close()
    if (redisServer) {
      await redisServer.stop()
    }
  })

  test("and support console output when accessing /echoInTime", async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    const time = Date.now()
    nock(timeServerUrl).get('/').reply(200, { data: { time: new Date(time) } }).persist()

    const message = "Hello echoInTime +123"
    const response = await requestFor.post('/echoInTime').send({
      message,
      time: time - 500
    })

    expect(response.status).toBe(200)

    await eventually(() => {
      expect(consoleSpy).toHaveBeenCalledWith(message)
    })
    
  }, 5000)
})

