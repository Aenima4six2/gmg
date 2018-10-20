const express = require('express')
const router = express.Router()
const dbFactory = require('../data')
const clientFactory = require('../grill')
const util = require('./util')

router.get('/status', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    const result = await client.getGrillStatus()
    res.json(result)
}))

router.put('/powertoggle', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    await client.powerToggleGrill()
    res.sendStatus(200)
}))

router.put('/poweron', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    await client.powerOnGrill()
    res.sendStatus(200)
}))

router.put('/poweroff', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    await client.powerOffGrill()
    res.sendStatus(200)
}))

router.put('/temperature/grill/:tempF', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    const temperature = req.params.tempF
    await client.setGrillTemp(temperature)
    res.sendStatus(200)
}))

router.put('/temperature/food/:tempF', util.routeHandler(async (req, res) => {
    const client = clientFactory.createClient()
    const temperature = req.params.tempF
    await client.setFoodTemp(temperature)
    res.sendStatus(200)
}))

router.get('/temperature/history', util.routeHandler(async (req, res) => {
    const db = await dbFactory.createDb()

    const rows = await db.all(`
        SELECT temperature_log_id, timestamp, grill_temperature, food_temperature
        FROM temperature_log
        WHERE timestamp >= ?;
    `, parseInt(req.query.since, 10))

    res.json(rows)
}))

module.exports = router