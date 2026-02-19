import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Card, Box, Typography } from '@mui/material'

import logo from './logo.png'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend)

const DURATION = 30 * 60 * 1000

export default class GrillHistory extends Component {
    render() {
        const now = Date.now()
        return (
            <Card>
                <Box sx={{ position: 'relative', bgcolor: 'black' }}>
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
                        <Typography variant="h5" color="white">Temperature History</Typography>
                        <Typography variant="body2" color="grey.400">View grilling temperature history.</Typography>
                    </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Line data={{
                        datasets: this.props.datasets
                    }}
                        options={{
                            animation: false,
                            scales: {
                                x: {
                                    type: 'time',
                                    min: now - DURATION,
                                    max: now,
                                    time: {
                                        unit: 'minute',
                                        stepSize: 5,
                                        displayFormats: {
                                            minute: 'h:mm aaa'
                                        }
                                    },
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        maxRotation: 0
                                    }
                                },
                                y: {
                                    grid: {
                                        color: 'rgba(255, 255, 255, 0.1)'
                                    },
                                    ticks: {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    }
                                }
                            },
                            plugins: {
                                tooltip: { mode: 'nearest', intersect: false },
                                legend: {
                                    labels: {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    }
                                }
                            },
                            hover: { mode: 'nearest', intersect: false }
                        }}
                    />
                </Box>
            </Card>
        )
    }
}

GrillHistory.propTypes = {
    datasets: PropTypes.array
}
