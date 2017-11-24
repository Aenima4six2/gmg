const express = require('express')
const gmg = require('gmg-client')
const errors = gmg.Errors
const router = express.Router()
const clientFactory = require('../grill')

router.get('/status', async (req, res, next) => {
  try {
    const client = clientFactory.createClient()
    const result = await client.getGrillStatus()
    res.json(result)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/powertoggle', async (req, res, next) => {
  try {
    const client = clientFactory.createClient()
    await client.powerToggleGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/poweron', async (req, res, next) => {
  try {
    const client = clientFactory.createClient()
    await client.powerOnGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/poweroff', async (req, res, next) => {
  try {
    const client = clientFactory.createClient()
    await client.powerOffGrill()
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

router.put('/temperature/grill/:tempF', async (req, res, next) => {
  try {
    const client = clientFactory.createClient()
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
    const client = clientFactory.createClient()
    const temperature = req.params.tempF
    await client.setFoodTemp(temperature)
    res.sendStatus(200)
  } catch (err) {
    if (err instanceof errors.InvalidCommand) res.status(400).send(err.message)
    else next(err)
  }
})

module.exports = router