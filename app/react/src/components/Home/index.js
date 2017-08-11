import React, { Component } from 'react'
import './index.css'
import 'typeface-roboto'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'
import Timers from "../Timers/index"
import HomeControls from '../HomeControls'
import io from 'socket.io-client'
import GrillClient from '../../utils/GrillClient'

const client = new GrillClient('http://localhost:3001')

export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      currentGrillTemp: 0,
      desiredGrillTemp: 0,
      currentFoodTemp: 0,
      desiredFoodTemp: 0,
      loading: true,
      connected: false,
      showTimers: false,
      socket: io('http://localhost:3001')
    }
  }

  componentDidMount() {
    this.state.socket.on('status', status => {
      this.setState({ ...status, connected: true, loading: false })
    })
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners('status')
  }

  powerToggle = () => {
    this.setState({ loading: true })
    client.powerToggle()
  }

  timerToggle = () => {
    this.setState({ showTimers: !this.state.showTimers })
  }

  setDesiredGrillTemp = (temperature) => {
    this.setState({ loading: true })
    client.setDesiredGrillTemp(temperature)
  }

  setDesiredFoodTemp = (temperature) => {
    this.setState({ loading: true })
    client.setDesiredFoodTemp(temperature)
  }

  render() {
    const commandsEnabled =
      this.state.connected &&
      this.state.isOn &&
      !this.state.loading &&
      !this.state.fanModeActive
    return (
      <div className="container">
        <div>
          <HomeControls
            onPowerTouchTap={this.powerToggle}
            onTimersTouchTap={this.timerToggle}
            isLoading={this.state.loading}
            fanModeOn={this.state.fanModeActive}
            isConnected={this.state.connected}
            timersOn={this.state.showTimers}
            powerOn={this.state.isOn}/>
        </div>
        <div className="card-container ">
          <GrillTemperature
            isEnabled={commandsEnabled}
            onSubmit={this.setDesiredGrillTemp}
            desiredGrillTemp={this.state.desiredGrillTemp}
            currentGrillTemp={this.state.currentGrillTemp}/>
        </div>
        <div className="card-container ">
          <FoodTemperature
            isEnabled={commandsEnabled}
            onSubmit={this.setDesiredFoodTemp}
            desiredFoodTemp={this.state.desiredFoodTemp}
            currentFoodTemp={this.state.currentFoodTemp}/>
        </div>
        {this.state.showTimers &&
        <div className="card-container">
          <Timers
            isEnabled={commandsEnabled}/>
        </div>}
      </div>
    )
  }
}