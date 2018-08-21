import React, { Component } from 'react'
import { Card } from 'material-ui/Card'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'
import Timers from "../Timers/index"
import HomeControls from '../HomeControls'
import io from 'socket.io-client'
import GrillClient from '../../utils/GrillClient'
import Alert from 'react-s-alert'
import Connecting from './Connecting'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/bouncyflip.css'
import './index.css'
import 'typeface-roboto'
import { Line, Chart } from 'react-chartjs-2'
import 'chartjs-plugin-streaming'
import * as moment from 'moment'

const GRILL_TEMPERATURE_DATASET = 0
const FOOD_TEMPERATURE_DATASET = 1

export default class Home extends Component {
  constructor() {
    super()
    Chart.defaults.global.plugins.streaming.duration = 1000 * 60 * 30
    this.client = new GrillClient(window.location.origin)
    this.state = {
      datasets: [{
        label: 'Grill Temp',
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: false,
        pointRadius: 0,
        data: []
      }, {
        label: 'Food Temp',
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        fill: false,
        pointRadius: 0,
        data: []
      }],
      currentGrillTemp: 0,
      desiredGrillTemp: 0,
      currentFoodTemp: 0,
      desiredFoodTemp: 0,
      commandsPending: 0,
      lowPelletAlarmActive: false,
      fanModeActive: false,
      loading: false,
      grillConnected: false,
      socketConnected: false,
      showTimers: false
    }

    // Setup Socket.IO
    this.socket = io(window.location.origin)
    this.socket.on('connect', () => this.setState({ socketConnected: true }))
    this.socket.on('disconnect', () => this.setState({ socketConnected: false }))
  }

  getAlertOptions = (overrides = {}) => {
    return {
      position: 'top-right',
      effect: 'bouncyflip',
      timeout: 'none',
      offset: 10,
      ...overrides
    }
  }

  sendAlert = (alert) => {
    const message = `<h2>${alert.name}</h2> \n${alert.reason}`
    const options = this.getAlertOptions({ ...alert, html: true })
    switch (alert.level) {
      case 'error': {
        Alert.error(message, options)
        break
      }
      case 'warning': {
        Alert.warning(message, options)
        break
      }
      default: {
        Alert.info(message, options)
      }
    }
  }

  componentDidMount() {
    this.socket.on('status', status => {
      this.state.datasets[GRILL_TEMPERATURE_DATASET].data.push({
        x: Date.now(),
        y: status.currentGrillTemp,
      })

      this.state.datasets[FOOD_TEMPERATURE_DATASET].data.push({
        x: Date.now(),
        y: status.currentFoodTemp,
      })

      this.setState({
        ...status,
        grillConnected: true,
        loading: !!this.state.commandsPending
      })
    })

    this.socket.on('alert', alert => {
      this.sendAlert(alert)
    })

    this.client.getTemperatureHistory(moment().subtract(8, 'hours').unix(Number))
      .then(history => {
        if (history.length === 0) {
          return
        }

        this.setState({
          datasets: [{
            ...this.state.datasets[GRILL_TEMPERATURE_DATASET],
            data: history.map(d => ({ x: d.timestamp * 1000, y: d.grill_temperature }))
          }, {
            ...this.state.datasets[FOOD_TEMPERATURE_DATASET],
            data: history.map(d => ({ x: d.timestamp * 1000, y: d.food_temperature }))
          }]
        })
      })
  }

  componentWillUnmount() {
    this.socket.removeAllListeners('status')
  }

  get canChangeTemp() {
    return this.state.grillConnected &&
      this.state.isOn &&
      !this.state.loading &&
      !this.state.fanModeActive
  }

  get canPowerOn() {
    return this.state.grillConnected &&
      !this.state.loading &&
      !this.state.fanModeActive
  }

  powerToggle = async () => {
    if (!this.canPowerOn) return
    this.setState({
      loading: true,
      commandsPending: this.state.commandsPending + 1
    })
    try {
      await this.client.powerToggle()
    }
    catch (err) {
      Alert.error(err.message, this.getAlertOptions())
    }
    this.setState({
      loading: !!(this.state.commandsPending - 1),
      commandsPending: this.state.commandsPending - 1
    })
  }

  setDesiredGrillTemp = async (temperature) => {
    if (!this.canChangeTemp) return
    this.setState({
      loading: true,
      commandsPending: this.state.commandsPending + 1
    })
    try {
      await this.client.setDesiredGrillTemp(temperature)
    }
    catch (err) {
      Alert.error(err.message, this.getAlertOptions())
    }
    this.setState({
      loading: !!(this.state.commandsPending - 1),
      commandsPending: this.state.commandsPending - 1
    })
  }

  setDesiredFoodTemp = async (temperature) => {
    if (!this.canChangeTemp) return
    this.setState({
      loading: true,
      commandsPending: this.state.commandsPending + 1
    })
    try {
      await this.client.setDesiredFoodTemp(temperature)
    }
    catch (err) {
      Alert.error(err.message, this.getAlertOptions())
    }
    this.setState({
      loading: !!(this.state.commandsPending - 1),
      commandsPending: this.state.commandsPending - 1
    })
  }

  timerToggle = () => {
    if (this.state.loading) return
    this.setState({ showTimers: !this.state.showTimers })
  }

  render() {
    return (
      <div className="container">
        <Alert stack={{ limit: 3 }} />
        {!this.state.socketConnected && <Connecting />}
        <div>
          <HomeControls
            onPowerTouchTap={this.powerToggle}
            onTimersTouchTap={this.timerToggle}
            loading={this.state.loading}
            fanModeActive={this.state.fanModeActive}
            lowPelletAlarmActive={this.state.lowPelletAlarmActive}
            grillConnected={this.state.grillConnected}
            timersOn={this.state.showTimers}
            powerOn={this.state.isOn} />
        </div>
        <div className="card-container">
          <Card>
            <Line data={{
                datasets: this.state.datasets
              }}
              options={{
                scales: {
                  xAxes: [{
                    type: 'realtime',
                    time: { unit: 'minute' }
                  }],
                  tooltips: {
                    mode: 'nearest',
                    intersect: false
                  },
                  hover: {
                    mode: 'nearest',
                    intersect: false
                  },
                }
              }}
            />
          </Card>
        </div>
        <div className="card-container">
          <GrillTemperature
            isEnabled={this.canChangeTemp}
            onSubmit={this.setDesiredGrillTemp}
            desiredGrillTemp={this.state.desiredGrillTemp}
            currentGrillTemp={this.state.currentGrillTemp} />
        </div>
        <div className="card-container">
          <FoodTemperature
            isEnabled={this.canChangeTemp}
            onSubmit={this.setDesiredFoodTemp}
            desiredFoodTemp={this.state.desiredFoodTemp}
            currentFoodTemp={this.state.currentFoodTemp} />
        </div>
        {this.state.showTimers &&
          <div className="card-container">
            <Timers
              isEnabled={true} />
          </div>}
      </div>
    )
  }
}