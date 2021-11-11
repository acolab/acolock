import React from "react"
import PropTypes from "prop-types"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import FormControl from "@mui/material/FormControl"
import Input from "@mui/material/Input"
import InputLabel from "@mui/material/InputLabel"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import withStyles from "@mui/styles/withStyles"
import CircularProgress from "@mui/material/CircularProgress"
import backUrl from "./backUrl"
import credentialStore from "./credentialStore"
import Grid from "@mui/material/Grid"
import ActionResult from "./ActionResult"
import UserManager from "./UserManager"
import ConfirmDialog from "./ConfirmDialog"
import {green, red} from "@mui/material/colors"

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400)]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    padding: `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)}`,
    width: "auto",
  },
  paperContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
  },
  brand: {
    marginBottom: theme.spacing(2),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    marginTop: theme.spacing(3),
  },
  logout: {
    marginTop: theme.spacing(3),
  },
  progress: {
    marginTop: theme.spacing(3),
  },
  progressContainer: {
    textAlign: "center",
  },
  successContainer: {
    textAlign: "center",
  },
  failureContainer: {
    textAlign: "center",
  },
  successAvatar: {
    margin: `${theme.spacing(1)} auto`,
    backgroundColor: theme.palette.primary.main,
  },
  failureAvatar: {
    margin: `${theme.spacing(1)} auto`,
    backgroundColor: theme.palette.error.main,
  },
  manageCodes: {
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
})

class HomePage extends React.Component {
  constructor(props) {
    super(props)

    const {username, password} = credentialStore.load()
    const token = credentialStore.loadToken()
    const admin = credentialStore.loadAdmin()

    this.state = {
      toggling: false,
      username,
      password,
      token,
      admin,
      loggedIn: token !== undefined,
    }
  }

  sendCommand = command => {
    this.setState({toggling: true, success: undefined, lastActionResult: undefined})
    const {token} = this.state

    fetch(backUrl(command), {
      method: "POST",
      body: JSON.stringify({token}),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.text())
      .then(response => {
        this.setState({toggling: false, success: response === "ok", lastActionResult: response})
        if (response === "invalid_credentials") this.setState({loggedIn: false, token: undefined})
      })
      .catch(error => {
        this.setState({toggling: false, success: false, lastActionResult: "server_error"})
      })
      .finally(() => {
        this.updateLockState()
      })
  }

  handleLoginSubmit = e => {
    e.preventDefault()

    const {username, password} = this.state
    this.setState({
      loggingIn: true,
      loggedIn: false,
      lastActionResult: undefined,
      token: undefined,
      admin: false,
    })
    fetch(backUrl("login"), {
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          const {token, admin} = response
          credentialStore.saveToken(token)
          credentialStore.saveAdmin(admin)
          credentialStore.clearUsernameAndPassword()
          this.setState({
            loggingIn: false,
            loggedIn: true,
            lastActionResult: "logged_in",
            token,
            admin,
          })
        } else {
          const {error} = response
          this.setState({loggingIn: false, loggedIn: false, lastActionResult: error})
        }
      })
      .catch(error => {
        this.setState({loggingIn: false, loggedIn: false, lastActionResult: "server_error"})
      })
  }

  handleLogoutClick = () => {
    credentialStore.clearToken()
    credentialStore.clearAdmin()
    this.setState({loggedIn: false, token: undefined, admin: undefined})
  }

  handleOpenClick = event => {
    event.preventDefault()
    const {lockState} = this.state
    if (lockState === "open") {
      this.setState({confirmAction: true, confirmedCommand: "open"})
      return
    }
    this.sendCommand("open")
  }

  handleCloseClick = event => {
    event.preventDefault()
    const {lockState} = this.state
    if (lockState === "closed") {
      this.setState({confirmAction: true, confirmedCommand: "close"})
      return
    }
    this.sendCommand("close")
  }

  handleActionConfirm = () => {
    this.setState({confirmAction: false})
    const {confirmedCommand} = this.state
    this.sendCommand(confirmedCommand)
  }

  handleActionCancel = () => {
    this.setState({confirmAction: false})
  }

  handleUsernameChange = event => {
    this.setState({username: event.target.value})
  }

  handlePasswordChange = event => {
    this.setState({password: event.target.value})
  }

  componentDidMount() {
    this.timer = setInterval(this.updateLockState, 10000)
    this.updateLockState()
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  updateLockState = () => {
    fetch(backUrl("lock_state"))
      .then(response => response.text())
      .then(response => {
        this.setState({lockState: response})
      })
  }

  handleMenuClick = () => {
    this.setState({menuOpen: true})
  }

  render() {
    const {classes} = this.props
    const {
      loggingIn,
      toggling,
      lockState,
      lastActionResult,
      loggedIn,
      token,
      username,
      password,
      admin,
    } = this.state

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <div className={classes.paperContent}>
            <Avatar
              className={classes.avatar}
              sx={{bgcolor: lockState === "open" ? "primary.main" : "secondary.main"}}
            >
              {lockState === "open" && <LockOpenOutlinedIcon />}
              {lockState === "closed" && <LockOutlinedIcon />}
            </Avatar>
            <Typography component="h1" variant="h5" sx={{mb: 2}}>
              ACoLock
            </Typography>
            {loggedIn || (
              <form className={classes.form} onSubmit={this.handleLoginSubmit}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="username">Idenfiant</InputLabel>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    onChange={this.handleUsernameChange}
                    value={username}
                  />
                </FormControl>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel htmlFor="password">Mot de passe</InputLabel>
                  <Input
                    name="password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    onChange={this.handlePasswordChange}
                    value={password}
                  />
                </FormControl>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loggingIn}
                  type="submit"
                >
                  Connexion
                </Button>
              </form>
            )}
            {loggedIn &&
              (toggling ? (
                <div className={classes.progressContainer}>
                  <CircularProgress className={classes.progress} />
                </div>
              ) : (
                <div>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={toggling}
                        onClick={this.handleOpenClick}
                      >
                        Ouvrir
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        className={classes.submit}
                        disabled={toggling}
                        onClick={this.handleCloseClick}
                      >
                        Fermer
                      </Button>
                    </Grid>
                  </Grid>
                  {admin && (
                    <div className={classes.manageCodes}>
                      <UserManager {...{token}} />
                    </div>
                  )}
                  <Button fullWidth className={classes.logout} onClick={this.handleLogoutClick}>
                    Déconnexion
                  </Button>
                </div>
              ))}
            <ActionResult result={lastActionResult} />
            <ConfirmDialog
              open={this.state.confirmAction || false}
              message={
                {
                  open: "La serrure semble être déjà ouverte. Êtes vous sûr\u00a0?",
                  close: "La serrure semble être déjà fermée. Êtes vous sûr\u00a0?",
                }[this.state.confirmedCommand]
              }
              onCancel={this.handleActionCancel}
              onConfirm={this.handleActionConfirm}
            />
          </div>
        </Paper>
      </main>
    )
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(HomePage)
