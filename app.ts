// const express = require('express')
import express = require('express')
const app = express()

app.get("/greeting", async (req: express.Request, res: express.Response) => {
  res.json({ message: "Greetings shay!" })
})

module.exports = app
