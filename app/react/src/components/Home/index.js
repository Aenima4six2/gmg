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
      commandsPending: 0,
      currentGrillTemp: 0,
      desiredGrillTemp: 0,
      currentFoodTemp: 0,
      desiredFoodTemp: 0,
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

  powerToggle = async () => {
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
            onPowerTouchTap={this.powerToggle}
            onTimersTouchTap={this.timerToggle}
            isLoading={this.state.loading}
            fanModeOn={this.state.fanModeActive}
            isConnected={this.state.connected}
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