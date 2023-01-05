import { TimeService } from '../adapters/timeService'

export interface GreetingsService {
    greet: (name: string) => Promise<string>
}

export const GreetingsServiceFactory: (
  timeService: TimeService
) => GreetingsService = (timeService: TimeService) => {
  const greetingService: GreetingsService = {
    greet: async (name: string) => {
      const currentDate = await timeService.getDate()
      const currentTimeHours = currentDate.getHours()

      if (currentTimeHours < 16 && currentTimeHours >= 14) {
        return 'zzz'
      }
      if (currentTimeHours < 20 && currentTimeHours >= 19) {
        return `Good evening ${name}`
      }
      if (currentTimeHours < 6 && currentTimeHours >= 1) {
        return `Go to sleep ${name}`
      }
      return `Greetings ${name}!`
    }
  }

  return greetingService
}

