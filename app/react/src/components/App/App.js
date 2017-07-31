import React, { Component } from 'react'
import './App.css'
import 'typeface-roboto'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import gmgTheme from '../../theme/gmgTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Container from '../Container'
import AppBar from 'material-ui/AppBar';

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(gmgTheme)}>
        <div className="App">
          <AppBar
            className="App-logo"
          />
          <Container/>
        </div>

      </MuiThemeProvider>
    )
  }
}

export default App
