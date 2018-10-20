import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { Card, CardMedia, CardTitle } from 'material-ui/Card'
import 'chartjs-plugin-streaming'
import logo from './logo.png'

export default class GrillHistory extends Component {
    render() {
        return (
            <Card>
                <CardMedia overlay={
                    <CardTitle
                        title="Temperature History"
                        subtitle="View grilling temperature history." />
                }>
                    <img src={logo} alt="" />
                </CardMedia>
                <Line data={{
                    datasets: this.props.datasets
                }}
                    options={{
                        scales: {
                            xAxes: [{
                                type: 'realtime',
                                time: { unit: 'minute' }
                            }],
                            tooltips: {
                                mode: 'nearest',
                                intersect: false
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: false
                            },
                        }
                    }}
                />
            </Card>
        )
    }
}

GrillHistory.propTypes = {
    datasets: PropTypes.array
}