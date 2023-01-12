import { server } from '../../src/app'
import request from 'supertest'
import { TimeServerDriver } from '../utils/timeServerDriver'

describe('Clock Server when accessing /greeting', () => {
  const timeServerUrl = 'http://exampleURL'

  const appServer = server({ appServerPort: 3002, timeServerUrl })
  const requestFor = request(appServer)

  const { givenHourIs } = TimeServerDriver(timeServerUrl)

  afterAll(async () => {
    await requestFor.post('/tearDown')
    await appServer.close()
  })

  test('should return a greeting with your name from the query param', async () => {
    givenHourIs(new Date('2017-01-01 17:00:00'))

    const userName = 'shay'
    const response = await requestFor.get('/greeting?name=' + userName)

    expect(response.status).toBe(200)
    expect(response.body.message).toBe(`Greetings ${userName}!`)
  })

  test('should return a greeting with your name from the the query param, also for max', async () => {
    givenHourIs(new Date('2017-01-01 17:00:00'))
    const response = await requestFor.get('/greeting?name=max')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Greetings max!')
  })

  test('should return zzz when server time is between 2-4pm', async () => {
    givenHourIs(new Date('2017-01-01 15:00:00'))
    const response = await requestFor.get('/greeting?name=max')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('zzz')
  })
})

