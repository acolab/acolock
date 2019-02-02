import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import backUrl from './backUrl'

class App extends Component {
  onPing = () => {
    fetch(backUrl("ping"))
      .then(response => response.text())
      .then(response => {
        console.log(response)
      })
  }

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
        <Button color="primary" onClick={this.onPing}>Ping</Button>
      </div>
    );
  }
}

export default App;
