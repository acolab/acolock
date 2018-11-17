import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

class App extends Component {
  render() {
    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              ACoLock
            </Typography>
          </Toolbar>
        </AppBar>
        <Button color="primary">hello</Button>
      </div>
    );
  }
}

export default App;
