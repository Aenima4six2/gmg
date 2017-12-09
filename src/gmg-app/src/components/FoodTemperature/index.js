import React, { Component } from 'react'
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Button from 'material-ui/RaisedButton'
import logo from './logo.png'
import PropTypes from 'prop-types'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import 'typeface-roboto'
import './index.css'
import '../../../node_modules/font-awesome/css/font-awesome.css'

export default class FoodTemperature extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      desiredFoodTemp: '',
      desiredFoodTempError: ''
    }
  }

  handleOpen = () => {
    if (this.props.isEnabled) {
      this.setState({ open: true })
    }    
  }

  handleCancel = () => this.setState({ open: false, desiredFoodTemp: 0 })

  handleSubmit = () => {
    this.setState({ open: false })
    this.props.onSubmit(this.state.desiredFoodTemp)
  }

  handleDesiredTempChange = (event) => {
    const value = event.target.value
    let error = ''
    if (isNaN(value)) error = 'Desired temperature must be a number!'
    else if (value < 0) error = 'Desired temperature must be greater than 0 ℉!'
    else if (value > 500) error = 'Desired temperature must be less than 500 ℉!'
    this.setState({
      desiredFoodTemp: value,
      desiredFoodTempError: error
    })
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
        onTouchTap={this.handleSubmit}
      />,
    ]

    return (
      <Card>
        <CardMedia overlay={
          <CardTitle title="Food Temp ℉" subtitle="Set the temperature of the food" />
        }>
          <img src={logo} alt="" />
        </CardMedia>
        <div className="controls">
          <List>
            <ListItem
              disabled={true}
              leftAvatar={
                <Avatar
                  icon={<FontIcon className="fa fa-thermometer-empty" />}
                  size={50}
                />
              }
            >
              Current: {this.props.currentFoodTemp} ℉
            </ListItem>
          </List>
          <List>
            <ListItem
              disabled={true}
              leftAvatar={
                <Avatar
                  icon={<FontIcon className="fa fa-thermometer-full" />}
                  size={50}
                />
              }
            >
              Desired: {this.props.desiredFoodTemp
                ? `${this.props.desiredFoodTemp} ℉`
                : 'Not set'}
            </ListItem>
          </List>
          <CardActions>
            <Button
              onTouchTap={this.handleOpen}
              disabled={!this.props.isEnabled}
              label="Set Food Temperature" />
          </CardActions>
          <Dialog
            title="Set the desired food temperature"
            actions={actions}
            modal={true}
            open={this.state.open}
            onRequestClose={this.handleSubmit}
          >
            <TextField
              autoFocus
              id="desired-food-temp"
              value={this.state.desiredFoodTemp || ''}
              onChange={this.handleDesiredTempChange}
              errorText={this.state.desiredFoodTempError}
              hintText="Grill temperature ℉"
              floatingLabelText="Example: 225"
            />
          </Dialog>
        </div>
      </Card>
    )
  }
}

FoodTemperature.propTypes = {
  currentFoodTemp: PropTypes.number,
  desiredFoodTemp: PropTypes.number,
  isEnabled: PropTypes.bool,
  onSubmit: PropTypes.func
}