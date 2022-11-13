import express from 'express'
import { GreetingsService, GreetingsServiceFactory, TimeService, TimeServiceFactory } from "./src/services"

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


export const server = ({ timeServerUrl,
                         appServerPort }: { appServerPort: number, timeServerUrl:  string }) => {
  greetingsService = GreetingsServiceFactory(TimeServiceFactory(timeServerUrl))

  return app.listen(appServerPort, () =>
      console.log(`Server is listening on port ${appServerPort}!`),
  )
}
