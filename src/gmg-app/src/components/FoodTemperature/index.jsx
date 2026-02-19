import React, { Component } from 'react'
import { Card, CardActions, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import logo from './logo.png'
import PropTypes from 'prop-types'
import './index.css'

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
            <Typography variant="h5" color="white">Food Temp &#8457;</Typography>
            <Typography variant="body2" color="grey.400">Set the temperature of the food</Typography>
          </Box>
        </Box>
        <CardContent className="controls">
          <List disablePadding>
            <ListItem dense>
              <ListItemAvatar>
                <Avatar>
                  <ThermostatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`Current: ${this.props.currentFoodTemp} \u2109`} />
            </ListItem>
          </List>
          <List disablePadding>
            <ListItem dense>
              <ListItemAvatar>
                <Avatar>
                  <ThermostatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={this.props.desiredFoodTemp
                ? `Desired: ${this.props.desiredFoodTemp} \u2109`
                : 'Desired: Not set'} />
            </ListItem>
          </List>
          <CardActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={this.handleOpen}
              disabled={!this.props.isEnabled}>
              Set Food Temperature
            </Button>
          </CardActions>
        </CardContent>
        <Dialog
          open={this.state.open}
          disableEscapeKeyDown>
          <DialogTitle>Set the desired food temperature</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              id="desired-food-temp"
              value={this.state.desiredFoodTemp || ''}
              onChange={this.handleDesiredTempChange}
              error={!!this.state.desiredFoodTempError}
              helperText={this.state.desiredFoodTempError}
              placeholder="Food temperature &#8457;"
              label="Example: 225"
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
              autoFocus
              onClick={this.handleSubmit}>
              Set
            </Button>
          </DialogActions>
        </Dialog>
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
