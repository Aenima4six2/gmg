import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './index.css'
import 'typeface-roboto'

export default class Connecting extends Component {
    constructor() {
        super()
        this.state = {
            dots: 3
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({
                dots: this.state.dots === 3 ? 0 : this.state.dots + 1
            })
        }, 1000)
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval)
        }
    }

    getProgress = () => this.props.showProgress ? '.'.repeat(this.state.dots) : ''

    render() {
        return (
            <div className="connecting-box">
                <div className="connecting-container">
                    <span className="connecting-dialog">
                        {`${this.props.message} ${this.getProgress()}`}
                    </span>
                </div>
            </div>
        )
    }
}

Connecting.propTypes = {
    message: PropTypes.string,
    showProgress: PropTypes.bool
}

Connecting.defaultProps = {
    message: 'Connecting',
    showProgress: true
}