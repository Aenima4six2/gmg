import React, { Component } from 'react'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'
import Timers from "../Timers/index"
import HomeControls from '../HomeControls'
import io from 'socket.io-client'
import GrillClient from '../../utils/GrillClient'
import Alert from 'react-s-alert'
import 'react-s-alert/dist/s-alert-default.css'
import 'react-s-alert/dist/s-alert-css-effects/bouncyflip.css'
import './index.css'
import 'typeface-roboto'

export default class Home extends Component {
  constructor() {
    super()
    this.client = new GrillClient(window.location.origin)
    this.state = {
      currentGrillTemp: 0,
      desiredGrillTemp: 0,
      currentFoodTemp: 0,
      desiredFoodTemp: 0,
      commandsPending: 0,
      lowPelletAlarmActive: false,
      fanModeActive: false,
      loading: true,
      connected: false,
      showTimers: false,
      socket: io(window.location.origin)
    }
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

  componentDidMount() {
    this.state.socket.on('status', status => {
      this.setState({
        ...status,
        connected: true,
        loading: !!this.state.commandsPending
      })
    })
    this.state.socket.on('alert', alert => {
      const message = `<h2>${alert.name}</h2> \n${alert.reason}`
      Alert.warning(message, this.getAlertOptions({ ...alert, html: true }))
    })
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners('status')
  }

  get canExecuteCommand() {
    return !this.state.loading && !this.state.fanModeActive && this.state.connected
  }

  powerToggle = async () => {
    if (!this.canExecuteCommand) return
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
    if (!this.canExecuteCommand) return
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
    if (!this.canExecuteCommand) return
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
    const commandsEnabled =
      this.state.connected &&
      this.state.isOn &&
      !this.state.loading &&
      !this.state.fanModeActive
    return (
      <div className="container">
        <Alert
          stack={{ limit: 3 }}
          beep={{ warning: 'alerts/warning.mp3' }}
        />
        <div>
          <HomeControls
            disabled={!this.canExecuteCommand}
            onPowerTouchTap={this.powerToggle}
            onTimersTouchTap={this.timerToggle}
            loading={this.state.loading}
            fanModeActive={this.state.fanModeActive}
            lowPelletAlarmActive={this.state.lowPelletAlarmActive}
            connected={this.state.connected}
            timersOn={this.state.showTimers}
            powerOn={this.state.isOn} />
        </div>
        <div className="card-container ">
          <GrillTemperature
            isEnabled={commandsEnabled}
            onSubmit={this.setDesiredGrillTemp}
            desiredGrillTemp={this.state.desiredGrillTemp}
            currentGrillTemp={this.state.currentGrillTemp} />
        </div>
        <div className="card-container ">
          <FoodTemperature
            isEnabled={commandsEnabled}
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