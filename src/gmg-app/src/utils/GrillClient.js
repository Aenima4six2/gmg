import 'whatwg-fetch'

const formatAddress = (uri) => {
  let formatted = uri.toString()
  if (formatted.endsWith('/') || formatted.endsWith('\\')) {
    formatted = formatted.substr(0, formatted.length - 1)
  }
  return formatted
}

export default class GrillClient {
  constructor(apiBaseAddress) {
    this.apiBaseAddress = formatAddress(apiBaseAddress)
  }

  async powerToggle() {
    const url = `${this.apiBaseAddress}/api/powertoggle`
    const result = await fetch(url, { method: 'PUT' })
    if (!result.ok) {
      const body = await result.text()
      throw new Error(body)
    }
  }

  async setDesiredFoodTemp(temperature) {
    const url = `${this.apiBaseAddress}/api/temperature/food/${temperature}`
    const result = await fetch(url, { method: 'PUT' })
    if (!result.ok) {
      const body = await result.text()
      throw new Error(body)
    }
  }

  async setDesiredGrillTemp(temperature) {
    const url = `${this.apiBaseAddress}/api/temperature/grill/${temperature}`
    const result = await fetch(url, { method: 'PUT' })
    if (!result.ok) {
      const body = await result.text()
      throw new Error(body)
    }
  }

  async getTemperatureHistory(since) {
    const url = `${this.apiBaseAddress}/api/temperature/history?since=${since}`
    const result = await fetch(url)

    if (!result.ok) {
      const body = await result.text()
      throw new Error(body)
    }

    return result.json()
  }
}