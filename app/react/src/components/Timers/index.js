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

export default class Timers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      desiredCountDown: 0,
      desiredCountDownError: ''
    }
  }

  handleOpen = () => this.setState({ open: true })
  handleCancel = () => this.setState({ open: false, desiredCountDown: 0 })
  handleSubmit = () => {
    this.setState({ open: false })
  }

  handleDesiredCountDown = () => {

  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        label="Set"
        primary={true}
        keyboardFocused={true}
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
            > Timer 00:00:00
            </ListItem>
          </List>
          <CardActions>
            <Button
              onTouchTap={this.handleOpen}
              disabled={!this.props.isEnabled}
              label="Start"/>
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
            > Countdown 00:00:00
            </ListItem>
          </List>
          <CardActions>
            <Button
              onTouchTap={this.handleOpen}
              disabled={!this.props.isEnabled}
              label="Countdown"/>
          </CardActions>
          <Dialog
            title="Set the countdown time"
            actions={actions}
            modal={true}
            open={this.state.open}
            onRequestClose={this.handleSubmit}
          >
            <TextField
              id="desired-countdown"
              value={this.state.desiredCountDown || ''}
              onChange={this.handleDesiredCountDown}
              errorText={this.state.desiredCountDownError}
              keyboardFocused={true}
              hintText="Set countdown"
              floatingLabelText="1:30:00"
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