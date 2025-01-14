import { mock } from 'jest-mock-extended'
import { TimeService } from '../../../src/adapters/timeService'
import { GreetingsService, GreetingsServiceFactory } from '../../../src/services/greetingsService'

describe('greetings service unit test', () => {
  // unit test example usage of fake
  test('should greet with good evening when server time is between 7-8pm', async () => {
    const timeService: TimeService = { getDate: () => (Promise.resolve(new Date('2017-01-01 19:30:00'))) }
    const greetingService: GreetingsService = GreetingsServiceFactory(timeService)
    const res = await greetingService.greet('max')
    expect(res).toBe('Good evening max')
  })

  // unit test example usage of mock
  test('should greet with go to sleep when server time is between 1-6am', async () => {
    const timeService = mock<TimeService>()
    timeService.getDate.mockResolvedValue(new Date('2017-01-01 02:30:00'))

    const greetingService: GreetingsService = GreetingsServiceFactory(timeService)
    const res = await greetingService.greet('max')
    expect(res).toBe('Go to sleep max')
  })
})



