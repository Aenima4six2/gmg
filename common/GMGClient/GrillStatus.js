const getRawValue = (hex, position) => parseInt(hex.substr(position, 2), 16)

const getGrillState = (hex) => {
  let status = parseInt(hex.charAt(61))
  if (status == 0) status = 'off'
  else if (status == 1) status = 'on'
  else if (status == 2) status = 'fan mode'
  else status = 'unknown'
  return status
}

const getDecimal = (hex) => {
  let decimal = ''
  for (let i = 0; i < hex.length; i += 2) {
    decimal += getRawValue(hex, i).toString()
  }
  return decimal
}

const getGrillTemp = (hex) => {
  const first = getRawValue(hex, 4)
  const second = getRawValue(hex, 6) * 256
  return first + second
}

const getFoodTemp = (hex) => {
  const first = getRawValue(hex, 8)
  return first
}

class GrillStatus {
  constructor(bytes) {
    const hex = Buffer.from(bytes).toString('hex')
    this.grillTemp = getGrillTemp(hex)
    this.foodTemp = getFoodTemp(hex)
    this.state = getGrillState(hex)
    this.isOn = this.state == 'on'
    this.fanModeActive = this.state == 'fan mode'
  }
}

module.exports = GrillStatus