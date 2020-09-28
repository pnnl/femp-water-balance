import React, {Fragment} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import EditIcon from '@material-ui/icons/Edit';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import {Paper, Typography, Button, Link} from '@material-ui/core';

export default function campusesTable(props) {
  const {handleClickOpen, campuses} = props;
  const textAlign = {textAlign: 'center'};
  const buttonStyle = {margin: '29px 6px', display: 'inline-block', float: 'right'};

  const isCampuses = campuses && campuses.length > 0;
  const rows = (campuses || []).map((campus) => (
    <TableRow key={campus.id}>
      <TableCell component='th' scope='row'>
        {<Link href={`/secure/water-balance/campuses/${campus.id}`}>{campus.name}</Link> || 'N/A'}
      </TableCell>
      <TableCell component='th' scope='row'>
        {campus.evaluator || 'N/A'}
      </TableCell>
      <TableCell component='th' scope='row' style={textAlign}>
        {campus.year || 'N/A'}
      </TableCell>
      <TableCell component='th' scope='row'>
        {campus.city || 'N/A'}
      </TableCell>
      <TableCell component='th' scope='row' style={textAlign}>
        {campus.region || 'N/A'}
      </TableCell>
      <TableCell component='th' scope='row' style={textAlign}>
        <EditIcon id={campus.id} color='primary' onClick={handleClickOpen} style={{cursor: 'pointer'}}/>
      </TableCell>
    </TableRow>
  ));

  return (
    <div style={{width: '80%', margin: 'auto'}}>
      {isCampuses && (
        <Fragment>
          <Typography variant='h6' gutterBottom>
            Your Campuses :
          </Typography>
          <Paper style={{marginTop: '10px'}}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campus Name</TableCell>
                  <TableCell>Campus Evaluator</TableCell>
                  <TableCell style={textAlign}>Water Supply Year</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell style={textAlign}>State</TableCell>
                  <TableCell style={textAlign}>Edit/View Campus Information</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{rows}</TableBody>
            </Table>
          </Paper>
        </Fragment>
      )}
      <div>
        <Button onClick={props.handleClickOpen} style={buttonStyle} size='small' variant='contained' color='primary'>
          Create Campus
        </Button>
        {!isCampuses && (
          <Typography variant='body1' style={buttonStyle} gutterBottom>
            Click here to get started <ArrowForwardIcon color={'disabled'} style={{verticalAlign: 'bottom'}} />
          </Typography>
        )}
      </div>
    </div>
  );
}
