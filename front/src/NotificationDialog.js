import React from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import {TimePicker} from "material-ui-pickers"
import dayjs from "dayjs"

class ConfirmDialog extends React.PureComponent {
  state = {selectedTime: null}

  handleTimeChange = time => {
    this.setState({selectedTime: time, error: undefined})
  }

  handleSubmit = () => {
    const {selectedTime} = this.state
    if (!selectedTime) {
      this.setState({error: "Veuillez sélectionner une heure de fermeture"})
      return
    }
  }

  render() {
    const {open, toggling, onClose} = this.props
    const {selectedTime, error} = this.state
    return (
      <Dialog open={open || false} onClose={onClose} aria-describedby="notification-dialog-message">
        <DialogContent>
          <DialogContentText id="notification-dialog-message">
            À quelle heure pensez vous fermer&nbsp;?
          </DialogContentText>
          <TimePicker
            ampm={false}
            autoOk={true}
            value={selectedTime}
            onChange={this.handleTimeChange}
            cancelLabel="Annuler"
            okLabel="OK"
          />
          {error && <DialogContentText id="notification-dialog-message">{error}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button color="primary" variant="contained" onClick={this.handleSubmit}>
            Annoncer l'ouverture
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ConfirmDialog
