import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CampusForm from './CampusForm';

export default function CampusDialog(props) {
  let title = props.campus? 'Edit Campus' : 'Create a New Campus';
  return (
    <Dialog open={props.addOpen} onClose={props.handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>Fill out the form with information regarding the campus being evaluated for water usage.</DialogContentText>
        <CampusForm 
          createNewCampus={props.createNewCampus}
          campus={props.campus} 
        />
      </DialogContent>
    </Dialog>
  );
}
