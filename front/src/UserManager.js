import React from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import CircularProgress from "@mui/material/CircularProgress"
import Grid from "@mui/material/Grid"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PersonIcon from "@mui/icons-material/Person"
import BuildIcon from "@mui/icons-material/Build"
import ListItemIcon from "@mui/material/ListItemIcon"
import errorTranslator from "./errorTranslator"
import ConfirmDialog from "./ConfirmDialog"
import SnackbarContent from "@mui/material/SnackbarContent"
import withStyles from "@mui/styles/withStyles"

import backUrl from "./backUrl"

import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"

class ErrorMessage extends React.PureComponent {
  render() {
    const {message, classes} = this.props
    if (message === undefined) return null

    return (
      <SnackbarContent className={classes.error} message={errorTranslator(message) || message} />
    )
  }
}
const ErrorMessageWrapper = withStyles(theme => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  },
}))(ErrorMessage)

class User extends React.Component {
  constructor(props) {
    super(props)

    const {user} = props

    this.state = {
      open: false,
      admin: user && user.admin,
      password: "",
      loading: false,
    }
  }

  handleItemClick = () => {
    const {user, disabled} = this.props
    if (disabled) return

    this.setState({
      open: true,
      admin: user && user.admin,
      password: "",
      username: "",
      loading: false,
    })
  }

  handleClose = event => {
    event.stopPropagation()
    this.setState({open: false, password: ""})
  }

  handleAdminChange = (event, checked) => {
    this.setState({admin: checked})
  }

  handlePasswordChange = event => {
    this.setState({password: event.target.value})
  }

  handleUsernameChange = event => {
    this.setState({username: event.target.value})
  }

  handleDelete = () => {
    const {newUser} = this.props
    if (newUser) return
    this.setState({confirmDelete: true})
  }

  handleDeleteCancel = () => {
    this.setState({confirmDelete: false})
  }

  handleDeleteConfirm = () => {
    const {username, onDelete} = this.props
    this.setState({confirmDelete: false, open: false, error: undefined})
    onDelete(username).catch(error => {
      this.setState({loading: false, open: true, error: "server_error"})
    })
  }

  handleSubmit = event => {
    event.stopPropagation()
    const {username} = this.props
    const {admin, password, username: newUsername} = this.state
    this.setState({loading: true, open: false, error: undefined})
    this.props
      .onChange(username, {admin, password, username: newUsername})
      .then(() => {
        this.setState({loading: false, open: false, password: "", error: undefined})
      })
      .catch(error => {
        console.error(error)

        const errorMessage = typeof error === "string" ? error : "server_error"
        this.setState({loading: false, open: true, error: errorMessage})
      })
  }

  handleDialogClick = event => {
    event.stopPropagation()
  }

  render() {
    const {username, newUser} = this.props
    const {open, admin, password, username: newUsername, loading, confirmDelete, error} = this.state

    return (
      <ListItem button onClick={this.handleItemClick}>
        <ListItemIcon>
          {newUser ? <PersonAddIcon /> : admin ? <BuildIcon /> : <PersonIcon />}
        </ListItemIcon>
        <ListItemText primary={newUser ? "Nouvel utilisateur" : username} />
        <Dialog
          open={open || false}
          onClose={this.handleClose}
          onClick={this.handleDialogClick}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {newUser ? "Nouvel utilisateur" : username}
          </DialogTitle>
          <DialogContent>
            <ErrorMessageWrapper message={errorTranslator(error) || error} />
            {newUser && (
              <TextField
                margin="dense"
                label="Nom d'utilisateur"
                type="text"
                fullWidth
                onChange={this.handleUsernameChange}
                value={newUsername}
                autoComplete="username"
              />
            )}
            <TextField
              margin="dense"
              id="password"
              label="Mot de passe"
              type="password"
              fullWidth
              onChange={this.handlePasswordChange}
              value={password}
              autoComplete="new-password"
            />
            <FormControlLabel
              label="Admin"
              control={<Checkbox checked={admin} onChange={this.handleAdminChange} />}
            />
          </DialogContent>
          <DialogActions>
            {!newUser && (
              <Button onClick={this.handleDelete} color="secondary">
                Supprimer
              </Button>
            )}
            <Button onClick={this.handleClose}>Annuler</Button>
            <Button disabled={loading} onClick={this.handleSubmit} color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
        <ConfirmDialog
          open={confirmDelete}
          message={`Supprimer l'accès de "${username}"\u00a0?`}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />
      </ListItem>
    )
  }
}

const UserList = ({users, onUserChange, onUserDelete, disabled}) => {
  return (
    <List component="nav">
      <User key="new-user" newUser onChange={onUserChange} disabled={disabled} />
      {Object.keys(users).map(key => (
        <User
          key={key}
          username={key}
          user={users[key]}
          onChange={onUserChange}
          onDelete={onUserDelete}
          disabled={disabled}
        />
      ))}
    </List>
  )
}

export default class UserManager extends React.Component {
  state = {
    open: false,
  }

  handleClickOpen = () => {
    this.setState({open: true, loading: true, error: undefined, users: undefined})
    const {token} = this.props

    fetch(backUrl("users"), {
      method: "POST",
      body: JSON.stringify({token}),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) this.setState({loading: false, users: response.users})
        else this.setState({loading: false, error: response.error})
      })
      .catch(error => {
        this.setState({loading: false, error: error.message})
      })
  }

  handleClose = () => {
    const {loading} = this.state
    if (loading) return

    this.setState({open: false, error: undefined})
  }

  handleUserChange = (username, attributes) => {
    this.setState({open: true, loading: true, error: undefined})
    const {token} = this.props
    return new Promise((resolve, reject) => {
      fetch(backUrl("update_user"), {
        method: "POST",
        body: JSON.stringify({
          token,
          user: {
            username,
            attributes,
          },
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.setState({loading: false, users: response.users})
            resolve()
          } else {
            this.setState({loading: false})
            reject(response.error)
          }
        })
        .catch(error => {
          this.setState({loading: false})
          reject(error)
        })
    })
  }

  handleUserDelete = username => {
    this.setState({open: true, loading: true, error: undefined})
    const {token} = this.props
    return new Promise((resolve, reject) => {
      fetch(backUrl("delete_user"), {
        method: "POST",
        body: JSON.stringify({
          token,
          user: {
            username,
          },
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.setState({loading: false, users: response.users})
            resolve()
          } else {
            this.setState({loading: false})
            reject(response.error)
          }
        })
        .catch(error => {
          this.setState({loading: false})
          reject(error)
        })
    })
  }

  render() {
    const {loading, users, error} = this.state

    return (
      <div>
        <Button variant="text" onClick={this.handleClickOpen}>
          Gérer les accès
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Gestion des accès</DialogTitle>
          <DialogContent>
            {loading && (
              <Grid container justifyContent="center">
                <CircularProgress />
              </Grid>
            )}
            {error && <DialogContentText>{errorTranslator(error)}</DialogContentText>}
            {users && (
              <UserList
                users={users}
                onUserChange={this.handleUserChange}
                onUserDelete={this.handleUserDelete}
                disabled={loading}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
