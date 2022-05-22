import {GreetingsService, GreetingsServiceFactory, TimeService} from '../src/services'
import {mock} from 'jest-mock-extended'

describe('greetings service unit test', () => {
  // unit test example usage of fake
  test("Should greet with good evening when server time is between 7-8pm", async () => {
    const timeService: TimeService = { getTime: () => (Promise.resolve(new Date("2017-01-01 19:30:00"))) }
    const greetingService: GreetingsService = GreetingsServiceFactory(timeService)
    const res = await greetingService.greet('max')
    expect(res).toBe('Good evening max')
  })

  // unit test example usage of mock
  test("Should greet with go to sleep when server time is between 1-6am", async () => {
    const timeService = mock<TimeService>()
    timeService.getTime.mockResolvedValue(new Date("2017-01-01 02:30:00"))

    const greetingService: GreetingsService = GreetingsServiceFactory(timeService)
    const res = await greetingService.greet('max')
    expect(res).toBe('Go to sleep max')
  })
})



