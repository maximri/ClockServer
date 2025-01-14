import { TimeService } from '../adapters/timeService'
import Redis from 'ioredis'

export const EchoInTimeService = (timeService: TimeService, redis: Redis) => {
  // start async task to fetch and print msg
  const interval = setInterval(async () => {
    if (redis.status !== 'ready') {
      return
    }
    const date = await timeService.getDate()

    // min -> max is the number of elements for the sorted query not the SCORE!
    const zrange = await redis.zrange('echoInTime', 0, 100)
    const elementsToPrint = zrange.map(element => JSON.parse(element))
      .filter(element => {
        return element.time < date.getTime()
      })

    elementsToPrint
      .map(element => {
        // TODO: Here impl lock
        redis.zrem('echoInTime', JSON.stringify(element))
        console.log(element.message)
      })
  }, 300)

  return {
    addToPrintQueue: ({ message, time }: { message: string, time: number }) => {
      return redis.zadd('echoInTime', 'NX', time, JSON.stringify({ message, time }))
    },
    stopPolling() {
      clearInterval(interval)
    }
  }
}
