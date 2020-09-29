import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import CampusForm from './CampusForm';

export default function CampusDialog(props) {
  let title = props.campus ? 'Edit Campus' : 'Create a New Campus';
  return (
    <Dialog open={props.addOpen} onClose={props.handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>
        {title} <CloseIcon color='action' onClick={props.handleClose} style={{float: 'right', cursor: 'pointer'}} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>Fill out the form with information regarding the campus being evaluated for water usage.</DialogContentText>
        <CampusForm createNewCampus={props.createNewCampus} updateCampus={props.updateCampus} campus={props.campus} />
      </DialogContent>
    </Dialog>
  );
}
