// const express = require('express')
import express = require('express')
const app = express()

app.get("/greeting", async (req: express.Request, res: express.Response) => {
    const name = req.query.name
    res.json({ message: `Greetings ${name}!`})
})

module.exports = app
