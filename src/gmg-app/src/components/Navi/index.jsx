import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import './index.css'

export default class Navigation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedIndex: props.selectedIndex || 0
    }
  }

  select = (index) => {
    if (this.props.onSelectedIndexChanged) {
      this.props.onSelectedIndexChanged(index)
    }
    return this.setState({ selectedIndex: index })
  }

  updateDimensions = () => {
    this.setState({ selectedIndex: this.state.selectedIndex })
  }

  componentDidMount = () => {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions)
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions)
  }

  render() {
    return (
      <div className="navi">
        <Paper elevation={1}>
          <BottomNavigation value={this.state.selectedIndex}>
            <BottomNavigationAction
              label="Home"
              icon={<HomeIcon />}
              onClick={() => this.select(0)}
            />
            {/* <BottomNavigationAction
              label="Profiles"
              icon={<TableChartIcon />}
              onClick={() => this.select(1)}
            />
            <BottomNavigationAction
              label="Settings"
              icon={<SettingsIcon />}
              onClick={() => this.select(2)}
            /> */}
          </BottomNavigation>
        </Paper>
      </div>
    )
  }
}

Navigation.propTypes = {
  onSelectedIndexChanged: PropTypes.func,
  selectedIndex: PropTypes.number
}
