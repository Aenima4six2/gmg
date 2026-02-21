import React, { Component } from 'react'
import './index.css'
import '@fontsource/roboto'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import gmgTheme from '../../theme/gmgTheme'
import Home from '../Home'
// import AppBar from '@mui/material/AppBar'
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
      <ThemeProvider theme={gmgTheme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          action={(snackbarId) => (
            <IconButton size="small" color="inherit" onClick={() => closeSnackbar(snackbarId)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        >
          <div className="app">
            {/* <AppBar className="app-logo" iconStyleLeft={{ visibility: 'hidden' }} /> */}
            {this.renderCards()}
            <Navigation
              onSelectedIndexChanged={this.selectedNavigationIndexChanged}
              selectedIndex={this.selectedNavigationIndex}
            />
          </div>
        </SnackbarProvider>
      </ThemeProvider>
    )
  }
}
