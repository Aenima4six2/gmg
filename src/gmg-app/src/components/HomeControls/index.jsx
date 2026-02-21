import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { IconButton, Toolbar, LinearProgress, Box, Tooltip } from '@mui/material'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HistoryIcon from '@mui/icons-material/History'
import WifiIcon from '@mui/icons-material/Wifi'
import WarningIcon from '@mui/icons-material/Warning'
import styles from './styles'
import './index.css'

const getButtonColor = (enabled) => enabled ? '#00ff00' : 'rgb(238, 238, 238)'
const getWifiColor = (enabled) => enabled ? '#00ff00' : 'rgb(113, 113, 113)'
const getAlertColor = (enabled) => enabled ? 'rgb(255, 204, 0)' : 'rgb(113, 113, 113)'

export default class HomeControls extends Component {
  getAlert = () => {
    if (this.props.fanModeActive) return 'Fan mode is active!'
    if (this.props.lowPelletAlarmActive) return 'Low Pellet alarm is active!'
    return ''
  }

  render() {
    return (
      <div>
        <Toolbar sx={{ height: '5rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={this.props.fanModeActive ? 'Grill cannot be powered on during fan mode!' : ''}>
              <span>
                <IconButton
                  style={styles.powerIcon}
                  disabled={!this.props.grillConnected || this.props.fanModeActive}
                  onClick={this.props.onPowerTouchTap}>
                  <PowerSettingsNewIcon
                    sx={{ color: getButtonColor(this.props.powerOn) }}
                    className="big" />
                </IconButton>
              </span>
            </Tooltip>
            <span style={styles.powerLabel}>Power</span>
            <Tooltip title="">
              <span>
                <IconButton
                  style={styles.timersIcon}
                  disabled={this.props.loading}
                  onClick={this.props.onTimersTouchTap}>
                  <AccessTimeIcon
                    sx={{ color: getButtonColor(this.props.timersOn) }}
                    className="big" />
                </IconButton>
              </span>
            </Tooltip>
            <span style={styles.timersLabel}>Timers</span>
            <Tooltip title="">
              <span>
                <IconButton
                  style={styles.historyIcon}
                  disabled={this.props.loading}
                  onClick={this.props.onHistoryTouchTap}>
                  <HistoryIcon
                    sx={{ color: getButtonColor(this.props.historyOn) }}
                    className="big" />
                </IconButton>
              </span>
            </Tooltip>
            <span style={styles.historyLabel}>History</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <Tooltip title={this.props.grillConnected
              ? 'The grill is connected!'
              : `The grill is not connected! 
              The application will continue trying to connect in the background .`}>
              <IconButton
                disableRipple={true}>
                <WifiIcon
                  sx={{ color: getWifiColor(this.props.grillConnected) }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={this.getAlert()}>
              <span>
                <IconButton
                  disabled={!this.getAlert()}
                  disableRipple={true}>
                  <WarningIcon
                    sx={{ color: getAlertColor(this.getAlert()) }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
        {this.props.loading && <LinearProgress />}
      </div>
    )
  }
}

HomeControls.propTypes = {
  powerOn: PropTypes.bool,
  onPowerTouchTap: PropTypes.func,
  timersOn: PropTypes.bool,
  historyOn: PropTypes.bool,
  onTimersTouchTap: PropTypes.func,
  onHistoryTouchTap: PropTypes.func,
  loading: PropTypes.bool,
  fanModeActive: PropTypes.bool,
  lowPelletAlarmActive: PropTypes.bool,
  grillConnected: PropTypes.bool
}

HomeControls.defaultProps = {
  loading: true
}
