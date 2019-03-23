import React, {Component} from "react"
import HomePage from "./HomePage"
import {MuiPickersUtilsProvider} from "material-ui-pickers"
import dayjsUtils from "@date-io/dayjs"

import promiseFinally from "promise.prototype.finally"
promiseFinally.shim()

window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true

class App extends Component {
  render() {
    return (
      <MuiPickersUtilsProvider utils={dayjsUtils}>
        <HomePage />
      </MuiPickersUtilsProvider>
    )
  }
}

export default App
