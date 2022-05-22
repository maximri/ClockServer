import express from 'express'
import {
  DefaultBrexService,
  GreetingsService,
  GreetingsServiceFactory,
  TimeService,
  TimeServiceFactory
} from "./src/services"

// used in yarn start
const fakeEveningTimeService: TimeService = {
  getTime: () => (Promise.resolve(new Date("2017-01-01 19:30:00")))
}

let greetingsService: GreetingsService = GreetingsServiceFactory(fakeEveningTimeService)

const app = express()

app.get("/greeting", async (req: express.Request, res: express.Response) => {
  const message = await greetingsService.greet(req.query.name as string)
  
  return res.json({ message })
})

app.get("/brex", async (req: express.Request, res: express.Response) => {
  const brexService = DefaultBrexService()
  return res.json({data: await brexService.parseDatesFromSample()})

  // const message = await greetingsService.greet(req.query.name as string)
  // return res.json({ message: 'test' })
})

app.listen(3000, () =>
    console.log('Clock server listening on port 3000!'),
)

export const myServer = (urlFromConfig: string) => {
  greetingsService = GreetingsServiceFactory(TimeServiceFactory(urlFromConfig))

  return app
}
