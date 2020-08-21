import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import BarChart from './BarChart';
import PieChart from './PieChart';
import { numberFormat, reportsMediaQuery } from '../shared/sharedStyles';

const panelSize = reportsMediaQuery();

export default function UseTable(props) {
	let waterUse = props.values;
	let waterUseArray = Object.keys(waterUse).map(i => waterUse[i]);

	waterUseArray.sort(function(a, b) {
		return a.water - b.water;
	});

	let unknown = waterUseArray
		.map(function(key) {
			return key.name;
		})
		.indexOf('Unknown');

	waterUseArray.push(waterUseArray.splice(unknown, 1)[0]);

	let endUse = waterUseArray
		.map(function(key) {
			return key.name;
		})
		.indexOf('Sum of End-Uses');

	if (endUse >= 0) {
		waterUseArray.splice(endUse, 1);
	}
	let length = waterUseArray.length - 1;
	let temp = waterUseArray[length - 1];
	waterUseArray[length - 1] = waterUseArray[length];
	waterUseArray[length] = temp;

	const rows = waterUseArray.map(key => (
		<TableRow key={key.name}>
			<TableCell component='th' scope='row'>
				{key.name}
			</TableCell>
			<TableCell align='right'>{numberFormat.format(key.water)}</TableCell>
			<TableCell align='right'>
				{key.percent != undefined ? numberFormat.format(key.percent) + '%' : null}
			</TableCell>
		</TableRow>
	));

	return (
		<Grid container spacing={24} justify='space-between'>
			<Grid item xs={panelSize}>
				<Paper>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Water End-Use</TableCell>
								<TableCell align='right'>
									Estimated Annual Potable Water Use (kgal)
								</TableCell>
								<TableCell align='right'>Percent of Total</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{rows}</TableBody>
					</Table>
				</Paper>
			</Grid>
			<Grid item xs={panelSize}>
				<Paper
					style={{
						height: '100%',
					}}
				>
					<BarChart data={waterUseArray} />
				</Paper>
			</Grid>
			<Grid item xs={panelSize}>
				<Paper
					style={{
						height: '100%',
					}}
				>
					<PieChart data={waterUseArray} />
				</Paper>
			</Grid>
		</Grid>
	);
}
