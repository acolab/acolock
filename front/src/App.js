import React, { Component } from 'react'
import HomePage from './HomePage'
import promiseFinally from 'promise.prototype.finally'

promiseFinally.shim()

class App extends Component {
  render() {
    return (
      <HomePage />
    );
  }
}

export default App;
