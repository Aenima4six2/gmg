const express = require('express')
const router = express.Router()
const config = require('config')
const options = config.get('grill')
const gmg = require('GMGClient')
const client = new gmg.GMGClient({ ...options })
const errors = gmg.Errors

router.get('/status', async (req, res, next) => {
  try {
    const result = await client.getGrillStatus()
    res.json(result)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/powertoggle', async (req, res, next) => {
  try {
    const result = await client.getGrillStatus()
    await result.isOn ? client.powerOffGrill() : client.powerOnGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/poweron', async (req, res, next) => {
  try {
    await client.powerOnGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/poweroff', async (req, res, next) => {
  try {
    await client.powerOffGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/temperature/grill/:tempF', async (req, res, next) => {
  try {
    const temperature = req.params.tempF
    await client.setGrillTemp(temperature)
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/temperature/food/:tempF', async (req, res, next) => {
  try {
    const temperature = req.params.tempF
    await client.setFoodTemp(temperature)
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

module.exports = router
