import { createTheme } from '@mui/material/styles'
import { grey, green } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    mode: 'dark',
    text: {
      primary: grey[200],
    },
    primary: {
      main: grey[50],
    },
    secondary: {
      main: green[700],
    },
    background: {
      default: '#000000',
      paper: 'rgb(48, 48, 48)',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(48, 48, 48)',
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: grey[800],
        }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: grey[800],
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 50,
          height: 50,
          backgroundColor: grey[600],
          color: grey[300],
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem',
        }
      }
    }
  }
})

export default theme
