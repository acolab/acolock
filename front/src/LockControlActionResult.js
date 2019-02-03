import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import classnames from 'classnames'
import ErrorIcon from '@material-ui/icons/Error'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import green from '@material-ui/core/colors/green'

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
}

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
});

class InvalidCredentialsNotification extends React.Component {
  state = {
    open: false,
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({open: false})
  }

  componentDidUpdate(prevProps) {
    const { result } = this.props
    if (result !== prevProps.result) {
      if (result === undefined)
        this.setState({open: false})
      else
      {
        const success = (result === "ok")
        this.setState({open: true, success})
      }
    }
  }
  
  message = () => {
    const { result } = this.props
    switch (result) {
      case "ok":
        return "Opération effectuée"
      case "invalid_credentials":
        return "Identifiants invalides"
      case "server_error":
        return "Erreur serveur"
      case "lock_control_failed":
        return "Le controle de la serrure a échoué"
      default:
        return <em>{result}</em>
    }
  }

  render() {
    const {
      classes,
      result,
    } = this.props;

    const { success, open } = this.state
    const message = this.message()

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
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
