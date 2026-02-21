import React, { Component } from 'react'
import { Card, CardActions, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import logo from './logo.png'
import PropTypes from 'prop-types'
import './index.css'

const regex = /(\d{1,2}):(\d{1,2}):(\d{1,2}):(\d{1,2})/g
const conversions = {
  SECONDS_IN_DAYS: 86400,
  SECONDS_IN_HOURS: 3600,
  SECONDS_IN_MIN: 60,
  SECONDS_IN_SECONDS: 1
}

export default class Timers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      desiredCountDown: '00:00:00:00',
      desiredCountDownError: '',
      countDown: 0,
      countDownActive: false,
      countUp: 0,
      countUpActive: false
    }
  }

  componentWillUnmount() {
    if (this.countDownSchedule) clearInterval(this.countDownSchedule)
    if (this.countUpSchedule) clearInterval(this.countUpSchedule)
  }

  handleOpen = () => this.setState({ open: true })
  handleCancel = () => this.setState({ open: false, desiredCountDown: 0 })
  handleSubmit = () => {
    try {
      const seconds = this.computeSeconds(this.state.desiredCountDown)
      this.setState({ open: false })
      this.countDown(seconds)
    }
    catch (ex) {
      this.setState({ desiredCountDownError: 'Invalid input' })
    }

  }

  handleDesiredCountDownChange = (event) => {
    this.setState({
      desiredCountDown: event.target.value,
      desiredCountDownError: ''
    })
  }

  countDown = (seconds) => {
    this.setState({ countDownActive: true, countDown: seconds })
    this.countDownSchedule = setInterval(() => {
      if (this.state.countDownActive && this.state.countDown > 0) {
        this.setState({ countDown: this.state.countDown - 1 })
      }
      else {
        clearInterval(this.countDownSchedule)
      }
    }, 1000)
  }

  cancelCountDown = () => this.setState({ countDownActive: false, countDown: 0 })

  countUp = () => {
    this.setState({ countUpActive: true })
    this.countUpSchedule = setInterval(() => {
      if (this.state.countUpActive) {
        this.setState({ countUp: this.state.countUp + 1 })
      }
      else {
        clearInterval(this.countUpSchedule)
      }
    }, 1000)
  }

  cancelCountUp = () => this.setState({ countUpActive: false, countUp: 0 })

  computeSeconds = (input) => {
    let result = 0
    const parseResult = (matches) => {
      if (matches.index === regex.lastIndex) regex.lastIndex++
      matches.filter((match, groupIndex) => groupIndex > 0).forEach((match, groupIndex) => {
        const key = Object.keys(conversions)[groupIndex]
        const conversion = conversions[key]
        result += conversion * parseInt(match, 10)
      })
    }

    if (!input.includes(':') && !isNaN(parseInt(input, 10))) {
      result = parseInt(input, 10)
    }
    else {
      let matches = regex.exec(input)
      while (matches !== null) {
        parseResult(matches)
        matches = regex.exec(input)
      }
    }

    if (!result) throw new Error('Input could not be parsed!')
    return result
  }

  formatSeconds = (seconds) => {
    const days = Math.trunc(seconds / conversions.SECONDS_IN_DAYS)
    seconds -= conversions.SECONDS_IN_DAYS * days

    const hours = Math.trunc(seconds / conversions.SECONDS_IN_HOURS)
    seconds -= conversions.SECONDS_IN_HOURS * hours

    const mins = Math.trunc(seconds / conversions.SECONDS_IN_MIN)
    seconds -= conversions.SECONDS_IN_MIN * mins

    const pad = (num, size) => {
      var s = num + ""
      while (s.length < size) s = "0" + s
      return s
    }

    return `${pad(days, 2)}:${pad(hours, 2)}:${pad(mins, 2)}:${pad(seconds, 2)}`
  }

  render() {
    return (
      <Card>
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={logo}
            alt=""
            sx={{ width: '100%', display: 'block' }}
          />
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.54)',
            px: 2,
            py: 1
          }}>
            <Typography variant="h5" color="white">Timers</Typography>
            <Typography variant="body2" color="grey.400">Set a grilling stopwatch or countdown timer.</Typography>
          </Box>
        </Box>
        <CardContent className="controls">
          <List disablePadding>
            <ListItem dense>
              <ListItemAvatar>
                <Avatar>
                  <AccessTimeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Timer: ${this.formatSeconds(this.state.countUp)}`} />
            </ListItem>
          </List>
          <CardActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => this.state.countUpActive ? this.cancelCountUp() : this.countUp()}
              disabled={!this.props.isEnabled}>
              {this.state.countUpActive ? "Cancel" : "Start"}
            </Button>
          </CardActions>
          <List disablePadding>
            <ListItem dense>
              <ListItemAvatar>
                <Avatar>
                  <ArrowCircleDownIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Countdown: ${this.formatSeconds(this.state.countDown)}`} />
            </ListItem>
          </List>
          <CardActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => this.state.countDownActive ? this.cancelCountDown() : this.handleOpen()}
              disabled={!this.props.isEnabled}>
              {this.state.countDownActive ? "Cancel" : "Start"}
            </Button>
          </CardActions>
        </CardContent>
        <Dialog
          open={this.state.open}
          disableEscapeKeyDown>
          <DialogTitle>Set the countdown time (dd:hh:mm:ss)</DialogTitle>
          <DialogContent>
            <TextField
              id="desired-countdown"
              value={this.state.desiredCountDown || ''}
              onChange={this.handleDesiredCountDownChange}
              error={!!this.state.desiredCountDownError}
              helperText={this.state.desiredCountDownError}
              placeholder="Set countdown"
              label="00:01:30:00"
              margin="dense"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="text"
              color="primary"
              onClick={this.handleCancel}>
              Cancel
            </Button>
            <Button
              variant="text"
              color="primary"
              disabled={!!this.state.desiredCountDownError}
              onClick={this.handleSubmit}>
              Set
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    )
  }
}

Timers.propTypes = {
  isEnabled: PropTypes.bool
}
