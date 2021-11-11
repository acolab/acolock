import React, {Component} from "react"
import HomePage from "./HomePage"
import promiseFinally from "promise.prototype.finally"
import {ThemeProvider} from "@mui/styles"
import {createTheme} from "@mui/material/styles"

promiseFinally.shim()

const theme = createTheme()

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>
    )
  }
}

export default App
