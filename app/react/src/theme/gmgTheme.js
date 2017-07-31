import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import merge from 'lodash.merge'

const colors = require('material-ui/styles/colors')
const muiTheme = {
  palette: {
    textColor: colors.grey200,
    primary1Color: colors.grey50,
    accent1Color: colors.green700,
    accent2Color: colors.green800,
    accent3Color: colors.green900,
  },
  table: {
    height: 'calc(100vh - 122px)'
  },
  tableHeaderColumn: {
    fontSize: '14px'
  }
}
const theme = merge(darkBaseTheme, muiTheme)
export default theme