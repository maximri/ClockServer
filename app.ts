import express = require("express")
import { GreetingsServiceFactory, TimeServiceFactory, GreetingsService } from "./services"
const nock = require("nock")

let greetingsService: GreetingsService

const app = express()

app.get("/greeting", async (req: express.Request, res: express.Response) => {
  const name: string = req.query.name as string
  
  const message = await greetingsService.greet(name)
  
  return res.json({ message })
})

const server = (url: string) => {
  const timeService = TimeServiceFactory(url)
  greetingsService = GreetingsServiceFactory(timeService)

  return app
}

module.exports = server
