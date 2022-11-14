import { Chance } from 'chance'
import { server } from "../src/app"
import request from 'supertest'
import { RedisMemoryServer } from 'redis-memory-server'
import eventually from "wix-eventually"
import { TimeServerDriver } from "./timeServerDriver"

const chance = new Chance()

describe('Server should use Redis',  () => {
  let redisServer: RedisMemoryServer

  const timeServerUrl = 'http://exampleURL'
  const redisPort = 3010
  const redisHost = '127.0.0.1'
  const appServerPort = 3000

  const appServer = server({ appServerPort, timeServerUrl, redisPort, redisHost })
  const requestFor = request(appServer)

  const { givenHourIsAlways, clearTimeSetting } = TimeServerDriver(timeServerUrl)
  
  beforeAll(async () => {
    redisServer = new RedisMemoryServer({ instance: { port: redisPort } })
    await redisServer.start()
  })
  
  beforeEach(() => {
    clearTimeSetting()
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
    // not a big fan of using jest mock/spy capabilities in it tests, but the side effect is console.log
    const consoleSpy = jest.spyOn(console, 'log')
    const time = Date.now()
    givenHourIsAlways(new Date(time))

    const message = `Hello ${chance.name()}`
    const response = await requestFor.post('/echoInTime').send({
      message,
      time: time - 5000
    })

    expect(response.status).toBe(200)

    await eventually(() => {
      expect(consoleSpy).toHaveBeenCalledWith(message)
    })
  }, 5000)

  test("and support console output when accessing /echoInTime " +
      "with a message printTime is in the future", async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    const time = Date.now()
    givenHourIsAlways(new Date(time))

    const message = `Hello ${chance.name()}`
    const response = await requestFor.post('/echoInTime').send({
      message,
      time: time + 500
    })

    expect(response.status).toBe(200)

    await eventually(() => {
      expect(consoleSpy).not.toHaveBeenCalledWith(message)
    }, { timeout: 1500 })

    clearTimeSetting()
    givenHourIsAlways(new Date(time + 2000))

    await eventually(() => {
      expect(consoleSpy).toHaveBeenCalledWith(message)
    }, { timeout: 1500 })
  }, 5000)

  test("and support multiple console output when accessing /echoInTime ", async () => {
    const consoleSpy = jest.spyOn(console, 'log')
    const time = Date.now()
    givenHourIsAlways(new Date(time))

    const message1 = `Hello ${chance.name()}`
    const response1 = await requestFor.post('/echoInTime').send({
      message: message1,
      time: time + 5000
    })

    const message2 = `Hello ${chance.name()}`
    const response2 = await requestFor.post('/echoInTime').send({
      message: message2,
      time: time + 5000
    })

    expect(response1.status).toBe(200)
    expect(response2.status).toBe(200)

    clearTimeSetting()
    givenHourIsAlways(new Date(time + 10000))

    await eventually(() => {
      expect(consoleSpy).toHaveBeenCalledWith(message1)
      expect(consoleSpy).toHaveBeenCalledWith(message2)
    }, { timeout: 1500 })

  }, 5000)
})

