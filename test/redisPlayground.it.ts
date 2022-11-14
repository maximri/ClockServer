import { server } from "../src/app"
import request from 'supertest'
import { RedisMemoryServer } from 'redis-memory-server'
import eventually from "wix-eventually"
import { TimeServerDriver } from "./timeServerDriver"

describe('Server should use Redis',  () => {
  let redisServer: RedisMemoryServer

  const timeServerUrl = 'http://exampleURL'
  const redisPort = 3010
  const redisHost = '127.0.0.1'
  const appServerPort = 3000

  const appServer = server({ appServerPort, timeServerUrl, redisPort, redisHost })
  const requestFor = request(appServer)

  const { givenHourIsAlways } = TimeServerDriver(timeServerUrl)
  
  beforeAll(async () => {
    redisServer = new RedisMemoryServer({ instance: { port: redisPort } })
    await redisServer.start()
  })

  afterAll(async () => {
    await requestFor.post('/tearDown')
    if (redisServer) {
      await redisServer.stop()
    }
    await appServer.close()
  })

  test("and support console output when accessing /echoInTime " +
      "with a message printTime is in the past", async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    const time = Date.now()
    givenHourIsAlways(new Date(time))

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

