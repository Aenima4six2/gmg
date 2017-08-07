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
  render() {
    return (
      <div>
        <Toolbar style={{ height: '65px' }}>
          <ToolbarGroup>
            <IconButton
              tooltip={this.props.fanModeOn ? 'Grill cannot be powered on during fan mode!' : ''}
              style={styles.powerIcon}
              disabled={this.props.isLoading || this.props.fanModeOn}
              onTouchTap={this.props.onPowerTouchTap}>
              <FontIcon
                color={getButtonColor(this.props.powerOn)}
                className="fa fa-power-off big"/>
            </IconButton>
            <span style={styles.powerLabel}>Power</span>
            <IconButton
              style={styles.timersIcon}
              disabled={this.props.isLoading}
              onTouchTap={this.props.onTimersTouchTap}>
              <FontIcon
                color={getButtonColor(this.props.timersOn)}
                className="fa fa-clock-o big"/>
            </IconButton>
            <span style={styles.timersLabel}>Timers</span>
          </ToolbarGroup>
          <ToolbarGroup>
            <IconButton
              tooltip={this.props.isConnected ? 'The grill is connected!' : ''}
              disabled={this.props.isLoading || !this.props.isConnected}
              disableTouchRipple={true}>
              <FontIcon
                hoverColor={getWifiColor(this.props.isConnected)}
                color={getWifiColor(this.props.isConnected)}
                className="fa fa-wifi"/>
            </IconButton>
            <IconButton
              tooltip={this.props.fanModeOn ? 'Fan mode is active!' : ''}
              disabled={this.props.isLoading || !this.props.fanModeOn}
              disableTouchRipple={true}>
              <FontIcon
                hoverColor={getAlertColor(this.props.fanModeOn)}
                color={getAlertColor(this.props.fanModeOn)}
                className="fa fa-exclamation-triangle"/>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
        {this.props.isLoading && <LinearProgress mode="indeterminate"/>}
      </div>
    )
  }
}

HomeControls.propTypes = {
  powerOn: PropTypes.bool,
  onPowerTouchTap: PropTypes.func,
  timersOn: PropTypes.bool,
  onTimersTouchTap: PropTypes.func,
  isLoading: PropTypes.bool,
  fanModeOn: PropTypes.bool,
  isConnected: PropTypes.bool
}

HomeControls.defaultProps = {
  isLoading: true
}
