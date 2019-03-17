import React, {Component} from "react"
import HomePage from "./HomePage"
import promiseFinally from "promise.prototype.finally"

promiseFinally.shim()

window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true

class App extends Component {
  render() {
    return <HomePage />
  }
}

export default App
