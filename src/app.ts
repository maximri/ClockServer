import express from 'express'
import { TimeServiceFactory } from "./adapters/timeService"
import { GreetingsServiceFactory } from "./services/greetingsService"

const app = express()

export const server = ({ timeServerUrl,
                         appServerPort }: { appServerPort: number, timeServerUrl:  string }) => {
  const greetingsService = GreetingsServiceFactory(TimeServiceFactory(timeServerUrl))

  app.get("/greeting", async (req: express.Request, res: express.Response) => {
    const message = await greetingsService.greet(req.query.name as string)

    return res.json({ message })
  })


  return app.listen(appServerPort, () =>
      console.log(`Server is listening on port ${appServerPort}!`),
  )
}
