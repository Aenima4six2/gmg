import React, { Component } from 'react'
import { Card, CardActions, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography } from '@mui/material'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import logo from './logo.png'
import PropTypes from 'prop-types'
import './index.css'

export default class GrillTemperature extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      desiredGrillTemp: '',
      desiredGrillTempError: ''
    }
  }

  handleOpen = () => {
    if (this.props.isEnabled) {
      this.setState({ open: true })
    }
  }

  handleCancel = () => this.setState({ open: false, desiredGrillTemp: 0 })

  handleSubmit = () => {
    this.setState({ open: false })
    this.props.onSubmit(this.state.desiredGrillTemp)
  }

  handleDesiredGrillTempChange = (event) => {
    const value = event.target.value
    let error = ''
    if (isNaN(value)) error = 'Desired temperature must be a number!'
    else if (value < 0) error = 'Desired temperature must be greater than 0 ℉!'
    else if (value > 500) error = 'Desired temperature must be less than 500 ℉!'
    this.setState({
      desiredGrillTemp: value,
      desiredGrillTempError: error
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
            <Typography variant="h5" color="white">Grill Temp &#8457;</Typography>
            <Typography variant="body2" color="grey.400">Set the temperature of the grill</Typography>
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
              <ListItemText primary={`Current: ${this.props.currentGrillTemp} \u2109`} />
            </ListItem>
          </List>
          <List disablePadding>
            <ListItem dense>
              <ListItemAvatar>
                <Avatar>
                  <ThermostatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={this.props.desiredGrillTemp
                ? `Desired: ${this.props.desiredGrillTemp} \u2109`
                : 'Desired: Not set'} />
            </ListItem>
          </List>
          <CardActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={this.handleOpen}
              disabled={!this.props.isEnabled}>
              Set Grill Temperature
            </Button>
          </CardActions>
        </CardContent>
        <Dialog
          open={this.state.open}
          disableEscapeKeyDown>
          <DialogTitle>Set the desired grill temperature</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              id="desired-grill-temp"
              value={this.state.desiredGrillTemp || ''}
              onChange={this.handleDesiredGrillTempChange}
              error={!!this.state.desiredGrillTempError}
              helperText={this.state.desiredGrillTempError}
              placeholder="Grill temperature &#8457;"
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

GrillTemperature.propTypes = {
  currentGrillTemp: PropTypes.number,
  desiredGrillTemp: PropTypes.number,
  isEnabled: PropTypes.bool,
  onSubmit: PropTypes.func
}
