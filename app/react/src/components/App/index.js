import React, { Component } from 'react'
import './index.css'
import 'typeface-roboto'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import gmgTheme from '../../theme/gmgTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import ControlContainer from '../ControlContainer'
import AppBar from 'material-ui/AppBar'
import Navi from '../Navi'

export default class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(gmgTheme)}>
        <div className="app">
          <AppBar className="app-logo"/>
          <ControlContainer/>
          <Navi/>
        </div>
      </MuiThemeProvider>
    )
  }
}