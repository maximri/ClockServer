import express from 'express'
import { TimeServiceFactory } from "./adapters/timeService"
import { GreetingsServiceFactory } from "./services/greetingsService"
import bodyParser from "body-parser"
import Redis from 'ioredis'
import { EchoInTimeService } from "./services/echoInTime"

const app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))


export type AppInitConfig = {
  appServerPort: number, timeServerUrl: string, redisPort?: number, redisHost?: string }

export const server = ({ timeServerUrl, appServerPort, redisPort, redisHost }: AppInitConfig) => {

  const redisConnection: Redis = new Redis(redisPort, redisHost)
  
  
  const timeService = TimeServiceFactory(timeServerUrl)
  const greetingsService = GreetingsServiceFactory(timeService)

  const echoInTimeService = EchoInTimeService(timeService, redisConnection)

  app.get("/greeting", async (req: express.Request, res: express.Response) => {
    const message = await greetingsService.greet(req.query.name as string)

    return res.json({ message })
  })

  app.post("/echoInTime", async (req: express.Request, res: express.Response) => {
    const message = await echoInTimeService.addToPrintQueue(req.body)
    return res.json({ message })
  })

  return app.listen(appServerPort, () =>
      console.log(`Server is listening on port ${appServerPort}!`),
  )
}
