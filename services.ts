const fetch = require("node-fetch")

export type TimeService = { getTime: () => Promise<Date>}
export type GreetingsService = { greet: (name: string) => Promise<string> }

export const TimeServiceFactory = (timeServerUrl: string): TimeService => {
    const timeService: TimeService = {
        getTime: async () => {
          const {
            data: { time },
          } = await fetch(timeServerUrl).then((result: any) => result.json())
          return new Date(time)
        },
      }

      return timeService
}

export const GreetingsServiceFactory: (
  timeService: TimeService
) => GreetingsService = (timeService: TimeService) => {
    const greetingService: GreetingsService = {
        greet: async (name: string) => {
          const currentTime = await timeService.getTime()
          if (currentTime.getHours() < 16 && currentTime.getHours() >= 14) {
            return "zzz"
          }
          if (currentTime.getHours() < 20 && currentTime.getHours() >= 19) {
            return `Good evening ${name}`
          }
          if (currentTime.getHours() < 6 && currentTime.getHours() >= 1) {
            return `Go to sleep ${name}`
          }
          return `Greetings ${name}!`
        }
    } 

    return greetingService
}

