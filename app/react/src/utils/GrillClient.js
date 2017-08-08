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

  powerToggle() {
    const url = `${this.apiBaseAddress}/api/powertoggle`
    return fetch(url, { method: 'PUT' }).then(result => {
      if (!result.ok) throw new Error(result.statusText)
    })
  }

  setDesiredFoodTemp(temperature) {
    const url = `${this.apiBaseAddress}/api/temperature/food/${temperature}`
    return fetch(url, { method: 'PUT' }).then(result => {
      if (!result.ok) throw new Error(result.statusText)
    })
  }

  setDesiredGrillTemp(temperature) {
    const url = `${this.apiBaseAddress}/api/temperature/grill/${temperature}`
    return fetch(url, { method: 'PUT' }).then(result => {
      if (!result.ok) throw new Error(result.statusText)
    })
  }

}