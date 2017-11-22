import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './index.css'
import 'typeface-roboto'
import IconButton from 'material-ui/IconButton'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import FontIcon from 'material-ui/FontIcon'
import LinearProgress from 'material-ui/LinearProgress'
import styles from './styles'

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
        <Toolbar style={{ height: '5rem' }}>
          <ToolbarGroup>
            <IconButton
              tooltip={this.props.fanModeActive ? 'Grill cannot be powered on during fan mode!' : ''}
              style={styles.powerIcon}
              disabled={this.props.disabled}
              onTouchTap={this.props.onPowerTouchTap}>
              <FontIcon
                color={getButtonColor(this.props.powerOn)}
                className="fa fa-power-off big" />
            </IconButton>
            <span style={styles.powerLabel}>Power</span>
            <IconButton
              style={styles.timersIcon}
              disabled={this.props.loading}
              onTouchTap={this.props.onTimersTouchTap}>
              <FontIcon
                color={getButtonColor(this.props.timersOn)}
                className="fa fa-clock-o big" />
            </IconButton>
            <span style={styles.timersLabel}>Timers</span>
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton
              tooltip={this.props.connected ? 'The grill is connected!' : ''}
              disabled={!this.props.connected}
              disableTouchRipple={true}>
              <FontIcon
                hoverColor={getWifiColor(this.props.connected)}
                color={getWifiColor(this.props.connected)}
                className="fa fa-wifi" />
            </IconButton>
            <IconButton
              tooltip={this.getAlert()}
              disabled={!this.getAlert()}
              disableTouchRipple={true}>
              <FontIcon
                hoverColor={getAlertColor(this.getAlert())}
                color={getAlertColor(this.getAlert())}
                className="fa fa-exclamation-triangle" />
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
        {this.props.loading && <LinearProgress mode="indeterminate" />}
      </div>
    )
  }
}

HomeControls.propTypes = {
  powerOn: PropTypes.bool,
  onPowerTouchTap: PropTypes.func,
  timersOn: PropTypes.bool,
  onTimersTouchTap: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fanModeActive: PropTypes.bool,
  lowPelletAlarmActive: PropTypes.bool,
  connected: PropTypes.bool
}

HomeControls.defaultProps = {
  loading: true
}
