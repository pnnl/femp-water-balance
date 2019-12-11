import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { numberFormat } from '../shared/sharedStyles';

export default function UseTable(props) {
	let waterUse = props.values;
	let waterUseArray = Object.keys(waterUse).map(i => waterUse[i]);

	waterUseArray.sort(function(a, b) {
		return a.water - b.water;
	});

	let totalWaterUse = waterUseArray
		.map(function(key) {
			return key.name;
		})
		.indexOf('Total Water Supply');
	waterUseArray.push(waterUseArray.splice(totalWaterUse, 1)[0]);
	let unknown = waterUseArray
		.map(function(key) {
			return key.name;
		})
		.indexOf('Unknown');

	if (unknown >= 0) {
		waterUseArray.splice(unknown, 1);
	}
	const rows = waterUseArray.map(key => (
		<TableRow key={key.name}>
			<TableCell component='th' scope='row'>
				{key.name}
			</TableCell>
			<TableCell align='right'>{numberFormat.format(key.water)}</TableCell>
		</TableRow>
	));

	return (
		<Paper>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Water End-Use</TableCell>
						<TableCell align='right'>
							Estimated Annual Potable Water Use (kgal)
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>{rows}</TableBody>
			</Table>
		</Paper>
	);
}
