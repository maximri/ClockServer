import express from 'express'
import { TimeServiceFactory } from "./adapters/timeService"
import { GreetingsServiceFactory } from "./services/greetingsService"
import bodyParser from "body-parser"
import Redis from 'ioredis'
import { EchoInTimeService } from "./services/echoInTime"
import { AcmeServiceFactory } from "./services/acmeService"

const app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))

export const server = ({ timeServerUrl, appServerPort, redisPort, redisHost }: {
  appServerPort: number, timeServerUrl?: string, redisPort?: number, redisHost?: string
}) => {

  const redisConnection: Redis = (() => {
    if (redisPort && redisHost) return new Redis(redisPort, redisHost)
    else {
      return FakeRedisWithDisconnect
    }
  })()
  
  const timeService = TimeServiceFactory(timeServerUrl ? timeServerUrl : 'http://exampleURL')
  const greetingsService = GreetingsServiceFactory(timeService)
  const echoInTimeService = EchoInTimeService(timeService, redisConnection)
  const acmeService = AcmeServiceFactory()
  
  app.get("/greeting", async (req: express.Request, res: express.Response) => {
    const message = await greetingsService.greet(req.query.name as string)

    return res.json({ message })
  })

  app.post("/echoInTime", async (req: express.Request, res: express.Response) => {
    const message = await echoInTimeService.addToPrintQueue(req.body)
    return res.json({ message })
  })

  app.post("/processSingleLog", async (req: express.Request, res: express.Response) => {
    const message = await acmeService.processSingleLog(req.body.log)
    return res.json({ message })
  })

  app.post("/newCloudService", (req: express.Request, res: express.Response) => {
    acmeService.addCloudService(req.body)
    return res.json({ message: 'done' })
  })

  app.get("/getInternalIPs", (req: express.Request, res: express.Response) => {
    return res.json({ message: JSON.stringify(acmeService.getInternalIPs()) })
  })

  app.post("/tearDown",  (req: express.Request, res: express.Response) => {
    echoInTimeService.stopPolling()
    redisConnection.disconnect()
    return res.json({ message: 'tearDown done' })
  })

  return app.listen(appServerPort, () =>
      console.log(`Server is listening on port ${appServerPort}!`),
  )
}

// this hack is for tests that don't use redis and cause open handlers
const FakeRedisWithDisconnect = ({
  disconnect: () => {
    return
  }
}) as Redis
