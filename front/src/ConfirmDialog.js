import React from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"

class ConfirmDialog extends React.PureComponent {
  render() {
    const {open, message, onConfirm, onCancel} = this.props
    return (
      <Dialog open={open || false} onClose={onCancel} aria-describedby="confirm-dialog-message">
        <DialogContent>
          <DialogContentText id="confirm-dialog-message">{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Annuler</Button>
          <Button onClick={onConfirm} color="secondary" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ConfirmDialog
