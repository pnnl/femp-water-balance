import React, {Fragment} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import mapZones from 'images/map_zones_cooling_towers.png';
import {coolingTowerMap} from '../shared/sharedConstants';

class FullLoadReferenceGuide extends React.Component {
  render() {
    const rows = (coolingTowerMap || []).map(zone => (
      <TableRow key={zone.climateZone}>
        <TableCell component='th' scope='row'>
          {zone.climateZone}
        </TableCell>
        <TableCell component='th' scope='row'>
          {zone.hospitals}%
        </TableCell>
        <TableCell component='th' scope='row'>
          {zone.otherBuildings}%
        </TableCell>
      </TableRow>
    ));
    return (
      <Fragment>
        <img style={{margin: '10px auto 18px auto', display: 'block'}} src={mapZones} />
        <Paper style={{margin: 'auto', width: '80%'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Climate Zone</TableCell>
                <TableCell>Hospitals</TableCell>
                <TableCell>Other Buildings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        </Paper>
      </Fragment>
    );
  }
}

export default FullLoadReferenceGuide;
