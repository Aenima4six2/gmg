import React, { Component } from 'react'
import './Container.css'
import 'typeface-roboto'
import { Tab, Tabs } from 'material-ui/Tabs'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'
import io from 'socket.io-client'

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
      <div className="Container">
        <Tabs>
          <Tab label="Home">
            <div className="Card-Container ">
              <GrillTemperature grillTemp={this.state.grillTemp}/>
            </div>
            <div className="Card-Container ">
              <FoodTemperature foodTemp={this.state.foodTemp}/>
            </div>
          </Tab>
          <Tab label="Profiles">
            <div>
              <h2 className="Headline">Tab Two</h2>
              <p>
                This is another example tab.
              </p>
            </div>
          </Tab>
          <Tab label="Settings">
            <div>
              <h2 className="Headline">Tab Three</h2>
              <p>
                This is a third example tab.
              </p>
            </div>
          </Tab>
        </Tabs>
      </div>
    )
  }
}