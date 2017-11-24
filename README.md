# Green Mountain Grills App

### This project is a silly alternative to the Green Mountain Grills mobile app.

## Why?
Well, I like to Grill, and I often utilize the grill overnight when cooking large portions. Unfortunately the GMG mobile app is not a dependable source for alerting me when critical grill events occur (like, the grill is out of fuel/pellets).

## Features
1. Slack Alerts
1. Configurable browser alerts sounds
1. Auto connect/reconnect
1. REST API and JS Client for extensions
1. Timers
1. Grill controls (Power, food temp, grill temp)

## Configuration
There are number of way to configure the server. You can set env variables in Docker to override any config that is provided in "custom-environment-variables" file located in the config directory. Alternatively, just override the default values set in default.json. The only option that you need to configure is the Slack web hook URL (`GMG_ALERTS_SLACK_WEBHOOKURL`). If you want to set your own alert sounds, simply override the corresponding mp3 file in the `public/alerts` directory.

## Preview
![alt text](assets/preview.jpg)