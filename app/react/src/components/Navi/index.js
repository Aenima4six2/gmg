import React, { Component } from 'react'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import Paper from 'material-ui/Paper'
import FontIcon from 'material-ui/FontIcon'
import './index.css'

export default class Navi extends Component {
  state = {
    selectedIndex: 0
  }

  select = (index) => this.setState({ selectedIndex: index })

  render() {
    return (
      <div className="navi">
        <Paper zDepth={1}>
          <BottomNavigation selectedIndex={this.state.selectedIndex}>
            <BottomNavigationItem
              label="Home"
              icon={<FontIcon className="fa fa-home"/>}
              onTouchTap={() => this.select(0)}
            />
            <BottomNavigationItem
              label="Profiles"
              icon={<FontIcon className="fa fa-table"/>}
              onTouchTap={() => this.select(1)}
            />
            <BottomNavigationItem
              label="Settings"
              icon={<FontIcon className="fa fa-cog"/>}
              onTouchTap={() => this.select(2)}
            />
          </BottomNavigation>
        </Paper>
      </div>
    )
  }
}
