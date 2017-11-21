import React, { Component } from 'react'
import './index.css'
import 'typeface-roboto'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'
import Timers from "../Timers/index"
import HomeControls from '../HomeControls'
import io from 'socket.io-client'
import GrillClient from '../../utils/GrillClient'
import { ToastContainer } from "react-toastr"
import '../Shared/react-toastr.css'
import '../Shared/animate.css'

let toast
const client = new GrillClient(window.location.origin)
export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      currentGrillTemp: 0,
      desiredGrillTemp: 0,
      currentFoodTemp: 0,
      desiredFoodTemp: 0,
      commandsPending: 0,
      fanModeActive: false,
      loading: true,
      connected: false,
      showTimers: false,
      socket: io(window.location.origin)
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
      toast.warning(alert.reason, alert.name, {
        closeButton: true
      })
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
      await client.powerToggle()
    }
    catch (err) {
      toast.error(err.message, 'Error', { closeButton: true })
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
      await client.setDesiredGrillTemp(temperature)
    }
    catch (err) {
      toast.error(err.message)
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
      await client.setDesiredFoodTemp(temperature)
    }
    catch (err) {
      toast.error(err.message)
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
        <ToastContainer ref={ref => toast = ref} className="toast-top-right" />
        <div>
          <HomeControls
            disabled={!this.canExecuteCommand}
            onPowerTouchTap={this.powerToggle}
            onTimersTouchTap={this.timerToggle}
            loading={this.state.loading}
            fanModeActive={this.state.fanModeActive}
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