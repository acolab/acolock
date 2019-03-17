import React from "react"
import {withStyles} from "@material-ui/core/styles"
import Snackbar from "@material-ui/core/Snackbar"
import SnackbarContent from "@material-ui/core/SnackbarContent"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from "@material-ui/icons/Close"
import green from "@material-ui/core/colors/green"
import errorTranslator from "./errorTranslator"

const styles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
})

class InvalidCredentialsNotification extends React.Component {
  state = {
    open: false,
  }

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    this.setState({open: false})
  }

  componentDidUpdate(prevProps) {
    const {result} = this.props
    if (result !== prevProps.result) {
      if (result === undefined) this.setState({open: false})
      else {
        const success = result === "ok"
        this.setState({open: true, success})
      }
    }
  }

  message = () => {
    const {result} = this.props
    switch (result) {
      case "ok":
        return "Opération effectuée"
      default:
        const translation = errorTranslator(result)
        if (translation) return translation
        else return <em>{result}</em>
    }
  }

  render() {
    const {classes} = this.props

    const {success, open} = this.state
    const message = this.message()

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={6000}
        onClose={this.handleClose}
      >
        <SnackbarContent
          className={success ? classes.success : classes.error}
          aria-describedby="result-message"
          message={<span id="result-message">{message}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Fermer"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Snackbar>
    )
  }
}

export default withStyles(styles)(InvalidCredentialsNotification)
