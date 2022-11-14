import { TimeService } from "../adapters/timeService"
import Redis from "ioredis"

export const EchoInTimeService = (timeService: TimeService, redis: Redis) => {
    // start async task to fetch and print msg
    const interval = setInterval(async () => {
        if (redis.status !== "ready") {
            return
        }
        const date: Date = await timeService.getTime()
        const zrange = await redis.zrange('echoInTime', 0, date.getTime())

        if (zrange.length > 0) {
            // TODO: Here impl lock
            redis.zrem('echoInTime', zrange.at(0))
            console.log(JSON.parse(zrange.at(0)).message)
        }
    }, 300)
    
    return {
        addToPrintQueue: ({ message, time }: { message: string, time: number }) => {
            return redis.zadd('echoInTime', "NX", time, JSON.stringify({ message, time }))
        },
        stopPolling() {
            clearInterval(interval)
        }
    }
}
