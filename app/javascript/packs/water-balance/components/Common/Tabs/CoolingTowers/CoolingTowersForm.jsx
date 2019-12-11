import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { Form, Field, FormSpy } from 'react-final-form';
import { Checkbox, Select } from 'final-form-material-ui';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {
	fabStyle,
	DEFAULT_NUMBER_MASK,
	DEFAULT_DECIMAL_MASK,
	ONE_DECIMAL_MASK,
	numberFormat,
} from '../shared/sharedStyles';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import { submitAlert } from '../shared/sharedFunctions';

import formValidation from './CoolingTowers.validation';
import { Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem } from '@material-ui/core';

const waterUseLookUp = [
	[5480, 4930, 4660, 4380, 4380, 4110],
	[10960, 9860, 9320, 8770, 8490, 8490],
	[21920, 19730, 18360, 17530, 17260, 16710],
	[27400, 24380, 23010, 21920, 21370, 21100],
	[33150, 29320, 27400, 26580, 25750, 25210],
	[44110, 39180, 36710, 35340, 34250, 33700],
	[55070, 49040, 46030, 44110, 42740, 41920],
	[82740, 73420, 68770, 66030, 64380, 63010],
	[110140, 97810, 91780, 88220, 85480, 83840],
	[137810, 122470, 114790, 110140, 107120, 104930],
	[165210, 146850, 137810, 132330, 128490, 126030],
	[192880, 171510, 160550, 154250, 149860, 146850],
	[220270, 195890, 183560, 176160, 171510, 167950],
	[275340, 245480, 229590, 220270, 214250, 209860],
];

const chillerTonnage = [
	'100',
	'200',
	'400',
	'500',
	'600',
	'800',
	'1,000',
	'1,500',
	'2,000',
	'2,500',
	'3,000',
	'3,500',
	'4,000',
	'5,000',
];
const concentrationCycles = ['3', '4', '5', '6', '7', '8'];

const toNumber = value => {
	if (value === undefined || value === null) {
		return 0;
	}
	return parseFloat(value.replace(/,/g, ''));
};

const FormRulesListener = ({ handleFormChange }) => (
	<FormSpy
		subscription={{ values: true, valid: true }}
		onChange={async ({ values, valid }) => {
			if (valid) {
				handleFormChange(values);
			}
		}}
	/>
);

const focusOnError = createDecorator();

const coolingTowerCalculation = values => {
	let waterUse = waterUseLookUp[values.tonnage][values.cycles];
	let total = (waterUse * values.days_per_year) / 1000;
	return total;
};

class CoolingTowersForm extends React.Component {
	constructor(props) {
		super(props);
		let waterUse = selectn(`campus.modules.cooling_towers.water_use`)(props);
		this.state = {
			waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : '',
		};
		this.calculateWaterUse = this.calculateWaterUse.bind(this);
	}

	clearValues = (clearValues, basePath, values) => {
		let field = basePath.split('[');
		let path = field[0];
		let index = field[1].replace(']', '');
		for (let i = 0; i < clearValues.length; i++) {
			if (values[path] != undefined) {
				values[path][index][clearValues[i]] = null;
			}
		}
	};

	clearSection = (values, name) => {
		if (values[name] != undefined) {
			if (!(Object.keys(values[name]).length === 0)) {
				values[name] = [];
				values[name].push({});
			}
		}
	};

	calculateWaterUse = (values, valid) => {
		if (!valid) {
			window.alert('Missing or incorrect values.');
			return;
		}
		let total = 0;
		values.cooling_towers.map((tower, index) => {
			if (tower) {
				if (tower.is_metered == 'yes') {
					total += toNumber(tower.annual_water_use);
				} else {
					total += coolingTowerCalculation(tower);
				}
			}
		});
		let formatTotal = numberFormat.format(total);
		values.water_use = formatTotal;
		this.setState({
			waterUse: ' Water Use: ' + formatTotal + ' kgal',
		});
	};

	onSubmit = values => {};

	nonMetered = basePath => {
		let i = 0;
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.tonnage`}
						component={Select}
						label='Total tonnage of the chillers associated with the system'
					>
						{chillerTonnage.map((val, i) => (
							<MenuItem key={val} value={i++}>
								{val}
							</MenuItem>
						))}
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.cycles`}
						component={Select}
						label='Cycles of concentration for the system'
					>
						{concentrationCycles.map((val, i) => (
							<MenuItem key={val} value={i++}>
								{val}
							</MenuItem>
						))}
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						fullWidth
						required
						name={`${basePath}.days_per_year`}
						component={MaterialInput}
						type='text'
						label='Number of days per year the system is operating'
						endAdornment={<InputAdornment position='end'>days</InputAdornment>}
					/>
				</Grid>
			</Fragment>
		);
	};

	renderMetered = (values, basePath) => {
		const isMetered = selectn(`${basePath}.is_metered`)(values);
		const year = values.year;
		return (
			<Fragment>
				{isMetered === 'yes' && (
					<Grid item xs={12}>
						<Field
							formControlProps={{ fullWidth: true }}
							required
							name={`${basePath}.annual_water_use`}
							component={MaterialInput}
							type='text'
							mask={ONE_DECIMAL_MASK}
							label={`${year} total annual water use`}
							endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
						></Field>
					</Grid>
				)}
				{isMetered == 'yes' &&
					this.clearValues(['tonnage', 'cycles', 'days_per_year'], basePath, values)}
				{isMetered == 'no' && this.clearValues(['annual_water_use'], basePath, values)}
				{isMetered == 'no' && this.nonMetered(basePath)}
			</Fragment>
		);
	};

	isMetered = (values, basePath) => {
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.is_metered`}
						component={Select}
						label='Is the makeup water metered?'
					>
						<MenuItem value='yes'>Yes</MenuItem>
						<MenuItem value='no'>No</MenuItem>
					</Field>
				</Grid>
				{this.renderMetered(values, basePath)}
			</Fragment>
		);
	};

	coolingTowersTypes = (values, valid) => {
		if (!values.has_cooling_towers) {
			return null;
		}
		return (
			<Fragment>
				<FieldArray name='cooling_towers'>
					{({ fields }) =>
						fields.map((name, index) => (
							<Grid item xs={12} key={index}>
								<ExpansionPanel
									expanded={selectn(`${name}.name`)(values) !== undefined}
								>
									<ExpansionPanelSummary>
										<Field
											fullWidth
											required
											name={`${name}.name`}
											component={MaterialInput}
											type='text'
											label='Enter a unique name identifier for this cooling tower system (such as the building name/number it is associated).'
										/>
										<IconButton
											style={{
												padding: 'initial',
												height: '40px',
												width: '40px',
											}}
											onClick={() => fields.remove(index)}
											aria-label='Delete'
										>
											<DeleteIcon />
										</IconButton>
									</ExpansionPanelSummary>
									<ExpansionPanelDetails>
										<Grid container alignItems='flex-start' spacing={16}>
											{this.isMetered(values, `${name}`)}
										</Grid>
									</ExpansionPanelDetails>
								</ExpansionPanel>
							</Grid>
						))
					}
				</FieldArray>
				<Grid item xs={12} sm={4}>
					<Field
						fullWidth
						disabled
						name='water_use'
						label='Water use'
						component={MaterialInput}
						type='text'
						meta={{
							visited: true,
							error: (valid || values.water_use == null)
								? null
								: "Fix errors and click 'Calculate Water Use' button to update value.",
						}}
						endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
					/>
				</Grid>
			</Fragment>
		);
	};

	 updateIsDirty = (dirty, updateParent) => {
        if(dirty && this.state.isDirty != true) {
            this.setState({isDirty:true});
            updateParent();
        }
    }

	render() {
		const { createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;

		const module = campus ? campus.modules.cooling_towers : {};

		if (!('cooling_towers' in module)) {
			module.cooling_towers = [];
			module.cooling_towers.push({});
		}

		return (
			<Fragment>
				<Typography variant='h5' gutterBottom>
					Cooling Towers
				</Typography>
				<Typography variant='body2' gutterBottom>
					Enter the following information only for cooling towers that use potable water
					on the campus
				</Typography>
				<Form
					onSubmit={this.onSubmit}
					initialValues={module}
					validate={formValidation}
					mutators={{ ...arrayMutators }}
					decorators={[focusOnError]}
					render={({
						handleSubmit,
						values,
						dirty,
						valid,
						form: {
							mutators: { push },
						},
					}) => (
						<form onSubmit={handleSubmit} noValidate>
							<Grid container alignItems='flex-start' spacing={16}>
								<Grid item xs={12}>
									<FormControlLabel
										label='My campus has cooling towers?'
										control={
											<Field
												name='has_cooling_towers'
												component={Checkbox}
												indeterminate={
													values.has_cooling_towers === undefined
												}
												type='checkbox'
											/>
										}
									/>
								</Grid>
								{this.coolingTowersTypes(values, valid)}
								<Grid item xs={12}>
									{values.has_cooling_towers === true && (
										<Button
											style={{ marginLeft: '10px' }}
											variant='contained'
											color='primary'
											onClick={() => push('cooling_towers', {})}
										>
											Add Another Cooling Tower
										</Button>
									)}
									{values.has_cooling_towers === false ||
									values.has_cooling_towers === undefined ? null : (
										<Fragment>
											<Button
												style={{ marginLeft: '10px' }}
												variant='contained'
												type='submit'
												onClick={() =>
													this.calculateWaterUse(values, valid)
												}
											>
												Calculate Water Use
											</Button>
											<Button
												variant='contained'
												type='button'
												onClick={() =>
													submitAlert(
														valid,
														createOrUpdateCampusModule,
														values
													)
												}
												style={{ marginLeft: '10px' }}
											>
												Save
											</Button>
										</Fragment>
									)}
									{this.state.waterUse != '' && (
										<Fab
											color='primary'
											aria-label='Water Use'
											title='Water Use'
											style={fabStyle}
										>
											{this.state.waterUse}
										</Fab>
									)}
								</Grid>
							</Grid>
							{this.updateIsDirty(dirty, updateParent)}
							<FormRulesListener handleFormChange={applyRules} />
						</form>
					)}
				/>
			</Fragment>
		);
	}
}

export default CoolingTowersForm;