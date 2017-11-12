import React, { Component } from 'react'
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Button from 'material-ui/RaisedButton'
import logo from './logo.png'
import PropTypes from 'prop-types'
import './index.css'
import '../../../node_modules/font-awesome/css/font-awesome.css'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import 'typeface-roboto'

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
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        disabled={!!this.state.desiredCountDownError}
        label="Set"
        primary={true}
        onTouchTap={this.handleSubmit}
      />,
    ]

    return (
      <Card>
        <CardMedia overlay={
          <CardTitle title="Timers" subtitle="Set a grilling stopwatch or countdown timer."/>
        }>
          <img src={logo} alt=""/>
        </CardMedia>
        <div className="controls">
          <List>
            <ListItem
              disabled={true}
              leftAvatar={
                <Avatar
                  icon={<FontIcon className="fa fa-clock-o"/>}
                  size={50}
                />
              }
            > Timer: {this.formatSeconds(this.state.countUp)}
            </ListItem>
          </List>
          <CardActions>
            <Button
              onTouchTap={() => this.state.countUpActive ? this.cancelCountUp() : this.countUp()}
              disabled={!this.props.isEnabled}
              label={this.state.countUpActive ? "Cancel" : "Start"}/>
          </CardActions>
          <List>
            <ListItem
              disabled={true}
              leftAvatar={
                <Avatar
                  icon={<FontIcon className="fa fa-arrow-circle-o-down"/>}
                  size={50}
                />
              }
            > Countdown: {this.formatSeconds(this.state.countDown)}
            </ListItem>
          </List>
          <CardActions>
            <Button
              onTouchTap={() => this.state.countDownActive ? this.cancelCountDown() : this.handleOpen()}
              disabled={!this.props.isEnabled}
              label={this.state.countDownActive ? "Cancel" : "Start"}/>
          </CardActions>
          <Dialog
            title="Set the countdown time (dd:hh:mm:ss)"
            actions={actions}
            modal={true}
            open={this.state.open}
            onRequestClose={this.handleSubmit}
          >
            <TextField
              id="desired-countdown"
              value={this.state.desiredCountDown || ''}
              onChange={this.handleDesiredCountDownChange}
              errorText={this.state.desiredCountDownError}
              hintText="Set countdown"
              floatingLabelText="00:01:30:00"
            />
          </Dialog>
        </div>
      </Card>
    )
  }
}

Timers.propTypes = {
  isEnabled: PropTypes.bool
}