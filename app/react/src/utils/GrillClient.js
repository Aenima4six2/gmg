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

}