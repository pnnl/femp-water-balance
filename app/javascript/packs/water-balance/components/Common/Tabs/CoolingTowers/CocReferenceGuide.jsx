import React, {Fragment} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {cocDissolvedSolidsMap, cocConductivityMap} from '../shared/sharedConstants';

class CocReferenceGuide extends React.Component {
  render() {
    const solidsRows = (cocDissolvedSolidsMap || []).map(item => (
      <TableRow key={item.ppm}>
        <TableCell component='th' scope='row'>
          {item.ppm}
        </TableCell>
        <TableCell component='th' scope='row'>
          {item.coc}
        </TableCell>
      </TableRow>
    ));
    const conductivityRows = (cocConductivityMap || []).map(item => (
      <TableRow key={item.ppm}>
        <TableCell component='th' scope='row'>
          {item.micromhos}
        </TableCell>
        <TableCell component='th' scope='row'>
          {item.coc}
        </TableCell>
      </TableRow>
    ));
    return (
      <div style={{margin: '20px auto', width: '80%'}}>
        <Typography variant='body2' gutterBottom style={{margin: '25px 0px 10px 0px'}}>
          This table provides the relationship between CoC and water quality measured in parts per million of total dissolved solids (TDS).{' '}
        </Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total Dissolved Solids (ppm)</TableCell>
                <TableCell>CoC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{solidsRows}</TableBody>
          </Table>
        </Paper>
        <Typography variant='body2' gutterBottom style={{margin: '25px 0px 10px 0px'}}>
          This table provides the relationship between CoC and water quality measured by conductivity (micromhos/cm).
        </Typography>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conductivity (micromhos/cm)</TableCell>
                <TableCell>CoC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{conductivityRows}</TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

export default CocReferenceGuide;
