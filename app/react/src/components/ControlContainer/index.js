import React, { Component } from 'react'
import './index.css'
import 'typeface-roboto'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature/index'
import io from 'socket.io-client'
import IconButton from 'material-ui/IconButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import FontIcon from 'material-ui/FontIcon'

const styles = {
  power: {
    position: 'relative',
    right: '90px',
    top: '17px',
    color: 'rgb(238, 238, 238)',
    fontSize: '14px'
  },
  timers: {
    position: 'relative',
    right: '62px',
    top: '17px',
    color: 'rgb(238, 238, 238)',
    fontSize: '14px'
  }
}
export default class Container extends Component {
  constructor() {
    super()
    this.state = {
      grillTemp: 0,
      foodTemp: 0
    }
    this.createSocket()
  }

  createSocket() {
    const socket = io('http://localhost:3001')
    socket.on('status', status => {
      this.setState(status)
    })
  }

  render() {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarGroup/>
          <ToolbarGroup>
            <IconButton
              tooltipStyles={{ top: '60px', left: '0px' }} style={{
              width: 100,
              height: 100,
              bottom: 5,
              left: '-20px'
            }}>
              <FontIcon className="fa fa-power-off big"/>
            </IconButton>
            <span style={styles.power}>Power</span>
            <IconButton tooltipStyles={{ top: '60px', left: '25px' }} style={{
              width: 100,
              height: 100,
              bottom: 5,
              right: '-10px'
            }}>
              <FontIcon className="fa fa-clock-o big"/>
            </IconButton>
            <span style={styles.timers}>Timers</span>
          </ToolbarGroup>
          <ToolbarGroup/>
        </Toolbar>
        <div className="card-container ">
          <GrillTemperature grillTemp={this.state.grillTemp}/>
        </div>
        <div className="card-container ">
          <FoodTemperature foodTemp={this.state.foodTemp}/>
        </div>
      </div>
    )
  }
}