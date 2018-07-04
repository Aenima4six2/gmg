import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import Paper from 'material-ui/Paper'
import FontIcon from 'material-ui/FontIcon'
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
        <Paper zDepth={1}>
          <BottomNavigation selectedIndex={this.state.selectedIndex}>
            <BottomNavigationItem
              label="Home"
              icon={<FontIcon className="fa fa-home"/>}
              onClick={() => this.select(0)}
            />
            {/* <BottomNavigationItem
              label="Profiles"
              icon={<FontIcon className="fa fa-table"/>}
              onClick={() => this.select(1)}
            />
            <BottomNavigationItem
              label="Settings"
              icon={<FontIcon className="fa fa-cog"/>}
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