const getRawValue = (hex, position) => parseInt(hex.substr(position, 2), 16)

const getGrillState = (hex) => {
  let status = parseInt(hex.charAt(61))
  if (status == 0) status = 'off'
  else if (status == 1) status = 'on'
  else if (status == 2) status = 'fan mode'
  else status = 'unknown'
  return status
}

const getCurrentGrillTemp = (hex) => {
  const first = getRawValue(hex, 4)
  const second = getRawValue(hex, 6) * 256
  return first + second
}

const getDesiredGrillTemp = (hex) => {
  const first = getRawValue(hex, 12)
  const second = getRawValue(hex, 14) * 256
  return first + second
}

const getCurrentFoodTemp = (hex) => {
  const first = getRawValue(hex, 8)
  const second = getRawValue(hex, 10) * 256
  const currentFoodTemp = first + second
  return currentFoodTemp >= 557 ? 0 : currentFoodTemp
}
const getDesiredFoodTemp = (hex) => {
  const first = getRawValue(hex, 56)
  const second = getRawValue(hex, 58) * 256
  return first + second
}

class GrillStatus {
  constructor(bytes) {
    const hex = Buffer.from(bytes).toString('hex')
    this.state = getGrillState(hex)
    this._hex = hex
    this.isOn = this.state == 'on'
    this.currentGrillTemp = getCurrentGrillTemp(hex)
    this.desiredGrillTemp = this.isOn ? getDesiredGrillTemp(hex) : 0
    this.currentFoodTemp = getCurrentFoodTemp(hex)
    this.desiredFoodTemp = this.isOn ? getDesiredFoodTemp(hex) : 0
    this.fanModeActive = this.state == 'fan mode'
  }
}

module.exports = GrillStatus