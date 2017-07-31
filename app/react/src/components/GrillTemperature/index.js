import React, { Component } from 'react'
import { Card, CardActions, CardMedia, CardTitle } from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'
import List from 'material-ui/List/List'
import ListItem from 'material-ui/List/ListItem'
import Button from 'material-ui/RaisedButton'
import logo from './temp.png'
import PropTypes from 'prop-types'
import './index.css'
import '../../../node_modules/font-awesome/css/font-awesome.css'
import 'typeface-roboto'

export default class GrillTemperature extends Component {
  render() {
    return (
      <Card>
        <CardMedia overlay={
          <CardTitle title="Grill Temp ℉" subtitle="Set the temperature of the grill"/>
        }>
          <img src={logo} alt=""/>
        </CardMedia>

        <div className="Controls">
          <List>
            <ListItem
              disabled={true}
              leftAvatar={
                <Avatar
                  icon={<FontIcon className="fa fa-thermometer-empty"/>}
                  size={50}
                />
              }

            >
              {this.props.grillTemp} ℉
            </ListItem>
          </List>
          <CardActions>
            <Button label="Set Temperature"/>
          </CardActions>
        </div>

      </Card>
    )
  }
}

GrillTemperature.propTypes = {
  grillTemp: PropTypes.number
}