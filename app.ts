const fetch = require("node-fetch")
import express = require("express")
const nock = require("nock")
let timeServerUrl: string

const app = express()

app.get("/greeting", async (req: express.Request, res: express.Response) => {
  const name = req.query.name
  const {
    data: { time },
  } = await fetch(timeServerUrl).then((result: any) => result.json())
  const currentTime = new Date(time)
  if (currentTime.getHours() < 16 && currentTime.getHours() >= 14) {
    return res.json({ message: "zzz" })
  }
  if (currentTime.getHours() < 20 && currentTime.getHours() >= 19) {
    return res.json({ message: `Good evening ${name}` })
  }
  res.json({ message: `Greetings ${name}!` })
})

const server = (url: string) => {
  timeServerUrl = url
  return app
}

module.exports = server
