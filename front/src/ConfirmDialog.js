import React from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"

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
