// Toolbar items: icon button with its label underneath. Laid out as a flex
// column (rather than offsetting the label with position: relative) so each
// item only takes the width it needs and the toolbar fits narrow screens.
const styles = {
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Matches the original ~90px icon spacing; tighter on phones
    marginRight: { xs: '8px', sm: '42px' }
  },
  navLabel: {
    marginTop: '-10px',
    color: 'rgb(238, 238, 238)',
    fontSize: '14px'
  }
}

export default styles
