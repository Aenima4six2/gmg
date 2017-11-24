import React, { Component } from 'react'
import './index.css'
import 'typeface-roboto'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import gmgTheme from '../../theme/gmgTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Home from '../Home'
// import AppBar from 'material-ui/AppBar'
import Navigation from '../Navi'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedNavigationIndex: 0
    }
  }

  componentDidMount() {

  }

  selectedNavigationIndexChanged = (index) => {
    this.setState({ selectedNavigationIndex: index })
  }

  renderCards() {
    switch (this.state.selectedNavigationIndex) {
      case 1: {
        return null
      }
      case 2: {
        return null
      }
      default: {
        return <Home />
      }
    }
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(gmgTheme)}>
        <div className="app">
          {/* <AppBar className="app-logo" iconStyleLeft={{ visibility: 'hidden' }} /> */}
          {this.renderCards()}
          <Navigation
            onSelectedIndexChanged={this.selectedNavigationIndexChanged}
            selectedIndex={this.selectedNavigationIndex}
          />
        </div>
      </MuiThemeProvider>
    )
  }
}