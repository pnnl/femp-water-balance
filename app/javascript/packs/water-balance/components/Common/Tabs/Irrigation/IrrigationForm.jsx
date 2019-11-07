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
	ONE_DECIMAL_MASK,
	numberFormat,
	DEFAULT_DECIMAL_MASK,
} from '../shared/sharedStyles';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import { submitAlert } from '../shared/submitAlert';

import { Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem } from '@material-ui/core';
import formValidation from './Irrigation.validation';
import RemoteApi from '../../../../RemoteApi';

const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nonmeter = [
	'supplemental_irrigation',
	'plant_density',
	'exposure',
	'start_month',
	'end_month',
	'type',
	'species',
	'condition',
	'soil_type',
	'area',
	'equipment',
	'controls',
	'puddles_observed',
	'runoff_observed',
	'leaks_observed',
	'broken_equipment',
	'sidewalks',
];

const rfMonthMap = {
	jan_rf: 0,
	feb_rf: 1,
	mar_rf: 2,
	apr_rf: 3,
	may_rf: 4,
	jun_rf: 5,
	jul_rf: 6,
	aug_rf: 7,
	sep_rf: 8,
	oct_rf: 9,
	nov_rf: 10,
	dec_rf: 11,
};

const etoMonthMap = {
	jan_et: 0,
	feb_et: 1,
	mar_et: 2,
	apr_et: 3,
	may_et: 4,
	jun_et: 5,
	jul_et: 6,
	aug_et: 7,
	sep_et: 8,
	oct_et: 9,
	nov_et: 10,
	dec_et: 11,
};

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

const getCoefficient = values => {
	let coefficient = '';
	if (values.type == 'Turfgrass') {
		coefficient = toNumber(values.species);
	} else {
		let waterRequirements = toNumber(values.supplemental_irrigation);
		let density = toNumber(values.plant_density);
		let exposure = toNumber(values.exposure);
		coefficient = waterRequirements * density * exposure;
	}

	return coefficient;
};

const formatData = (values, data, monthMap) => {
	let array = [];
	let index = '';
	for (var key in data) {
		index = monthMap[key];
		if (index !== undefined) {
			if (index < values.start_month || index > values.end_month) {
				array[index] = 0;
			}
			array[index] = data[key];
		}
	}
	console.log(array);
	return array;
};

const getTotalRequirement = (values, rf, eto, coefficient) => {
	let MonthlyRequirement = [];
	let effectivePrecipitation = [];
	let monthlySupplementalNeed = [];
	let supplementalIrrigation = [];
	let soilType = toNumber(values.soil_type);
	let totalRequirement = 0;
	let requirement = '';
	let need = '';

	//monthlyRequirement = coefficient * eto;
	eto.map((month, index) => {
		MonthlyRequirement[index] = month * coefficient;
	});

	//effectivePrecipitation = rf * soil type;
	rf.map((month, index) => {
		effectivePrecipitation[index] = month * soilType;
	});

	//monthlySupplementalNeeds = monthlyRequirement - effectivePrecipitation;
	effectivePrecipitation.map((monthlyPrecipitation, index) => {
		monthlySupplementalNeed[index] = MonthlyRequirement[index] - monthlyPrecipitation;
	});

	//If monthlyRequirement < effectivePrecipitation ? 0 : monthlySupplementalNeeds;
	effectivePrecipitation.map((monthlyPrecipitation, index) => {
		requirement = MonthlyRequirement[index];
		need = monthlySupplementalNeed[index];
		supplementalIrrigation[index] = requirement < monthlyPrecipitation ? 0 : need;
	});

	supplementalIrrigation.map(val => {
		if (val) {
			totalRequirement += val;
		}
	});

	return totalRequirement;
};

const getIndex = values => {
	let schedule = toNumber(values.controls);
	let equipment = toNumber(values.equipment);
	let puddles = toNumber(values.puddles_observed);
	let runOff = toNumber(values.runoff_observed);
	let leaks = toNumber(values.leaks_observed);
	let brokenEquipment = toNumber(values.broken_equipment);
	let brokenSidewalks = toNumber(values.sidewalks);

	let totalObservations = puddles + runOff + leaks + brokenEquipment + brokenSidewalks;
	let uniformityIndex = totalObservations + schedule * equipment;
	let index = 0;

	if (uniformityIndex >= 6 && uniformityIndex <= 9) {
		index = 0.9;
	} else if (uniformityIndex >= 10 && uniformityIndex <= 13) {
		index = 0.8;
	} else if (uniformityIndex >= 14 && uniformityIndex <= 17) {
		index = 0.7;
	} else if (uniformityIndex >= 18 && uniformityIndex <= 21) {
		index = 0.6;
	} else if (uniformityIndex >= 22 && uniformityIndex <= 24) {
		index = 0.5;
	}

	return index;
};

const irrigationCalculation = (values, rfObject, etoObject) => {
	let coefficient = getCoefficient(values);
	let rf = formatData(values, rfObject, rfMonthMap);
	let eto = formatData(values, etoObject, etoMonthMap);
	let totalRequirement = getTotalRequirement(values, rf, eto, coefficient);
	let index = getIndex(values);
	let appearance = toNumber(values.condition);
	let totalLandscape = toNumber(values.area);
	let conversion = 0.6233;

	let waterUse = (totalRequirement * appearance * totalLandscape * conversion) / index / 1000;
	return waterUse;
};

const focusOnError = createDecorator();

class IrrigationForm extends React.Component {
	componentWillMount() {
		let zip = selectn(`campus.postal_code`)(this.props);
		zip = zip.replace(/^0+/, '');
		this.getRainFall(zip);
		this.getEto(zip);
	}

	constructor(props) {
		super(props);
		let waterUse = selectn(`campus.modules.irrigation.water_use`)(props);
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

	getRainFall = zip => {
		RemoteApi.getRainFall({ zip: zip }, data => {
			if (data.errors) {
				console.log('error');
			}
			this.setState({ rainFall: data });
			console.log('success');
		});
	};

	getEto = zip => {
		RemoteApi.getEto({ zip: zip }, data => {
			if (data.errors) {
				console.log('error');
			}
			this.setState({ eto: data });
			console.log('success');
		});
	};

	calculateWaterUse = (values, valid) => {
		if (!valid) {
			window.alert('Missing or incorrect values.');
			return;
		}
		let total = 0;

		values.irrigation.map((area, index) => {
			if (area) {
				if (area.is_metered == 'yes') {
					total += toNumber(area.annual_water_use);
				} else {
					total += irrigationCalculation(area, this.state.rainFall, this.state.eto);
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

	mixedBeds = basePath => {
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.supplemental_irrigation`}
						component={Select}
						label='What is the general level of supplemental irrigation needed by the plants for the location? (drought tolerant vs. high water need)'
					>
						<MenuItem value='.2'>Low</MenuItem>
						<MenuItem value='.5'>Moderate</MenuItem>
						<MenuItem value='.8'>High</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.plant_density`}
						component={Select}
						label='What is the density of the plants in the landscape? (compact vs. sparsely planted?)'
					>
						<MenuItem value='.65'>Low</MenuItem>
						<MenuItem value='1'>Moderate</MenuItem>
						<MenuItem value='1.2'>High</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.exposure`}
						component={Select}
						label='What is the exposure of the landscape?'
					>
						<MenuItem value='.65'>Protected</MenuItem>
						<MenuItem value='1'>Open</MenuItem>
						<MenuItem value='1.25'>Intense Exposure</MenuItem>
					</Field>
				</Grid>
				{this.landscapeType(basePath)}
			</Fragment>
		);
	};

	turfgrass = basePath => {
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.species`}
						component={Select}
						label='What is the turfgrass species?'
					>
						<MenuItem value='.8'>Cool Season</MenuItem>
						<MenuItem value='.6'>Warm Season</MenuItem>
					</Field>
				</Grid>
				{this.landscapeType(basePath)}
			</Fragment>
		);
	};

	landscapeType = basePath => {
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.condition`}
						component={Select}
						label='General appearance/condition of the landscape'
					>
						<MenuItem value='.7'>Stressed</MenuItem>
						<MenuItem value='.8'>Average</MenuItem>
						<MenuItem value='1'>High Quality</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.soil_type`}
						component={Select}
						label='Soil type'
					>
						<MenuItem value='.4'>Sandy</MenuItem>
						<MenuItem value='.5'>Loam</MenuItem>
						<MenuItem value='.6'>Clay</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.area`}
						component={MaterialInput}
						type='text'
						mask={DEFAULT_DECIMAL_MASK}
						label='Landscape area size'
						endAdornment={<InputAdornment position='end'>ft²</InputAdornment>}
					></Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.equipment`}
						component={Select}
						label='Irrigation equipment type'
					>
						<MenuItem value='2'>Rotor</MenuItem>
						<MenuItem value='1'>Spray</MenuItem>
						<MenuItem value='1'>Micro-spray</MenuItem>
						<MenuItem value='1'>Drip</MenuItem>
						<MenuItem value='3'>Manual</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.controls`}
						component={Select}
						label='Type of irrigation controls'
					>
						<MenuItem value='3'>Manual</MenuItem>
						<MenuItem value='2'>Clock</MenuItem>
						<MenuItem value='1'>Smart Water Application Technologies</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.puddles_observed`}
						component={Select}
						label='Puddles observed in and around the landscape area'
					>
						<MenuItem value='3'>Many</MenuItem>
						<MenuItem value='2'>Few</MenuItem>
						<MenuItem value='1'>None</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.runoff_observed`}
						component={Select}
						label='Runoff observed in and around the landscape area'
					>
						<MenuItem value='3'>Yes</MenuItem>
						<MenuItem value='1'>No</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.leaks_observed`}
						component={Select}
						label='Leaks observed with the equipment'
					>
						<MenuItem value='3'>Many</MenuItem>
						<MenuItem value='2'>Few</MenuItem>
						<MenuItem value='1'>None</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.broken_equipment`}
						component={Select}
						label='Broken equipment observed'
					>
						<MenuItem value='3'>Yes</MenuItem>
						<MenuItem value='1'>No</MenuItem>
					</Field>
				</Grid>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.sidewalks`}
						component={Select}
						label='Impervious surfaces being watered (e.g., sidewalks or parking lots)'
					>
						<MenuItem value='3'>Yes</MenuItem>
						<MenuItem value='1'>No</MenuItem>
					</Field>
				</Grid>
			</Fragment>
		);
	};

	nonMetered = (values, basePath) => {
		let i = 0;
		let type = selectn(`${basePath}.type`)(values);
		return (
			<Fragment>
				<Grid item xs={12}>
					<Field
						formControlProps={{ fullWidth: true }}
						required
						name={`${basePath}.start_month`}
						component={Select}
						label='Month irrigation starts'
					>
						{month.map((val, i) => (
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
						name={`${basePath}.end_month`}
						component={Select}
						label='Month irrigation ends'
					>
						{month.map((val, i) => (
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
						name={`${basePath}.type`}
						component={Select}
						label='Is the majority of this landscape area mixed beds or turfgrass?'
					>
						<MenuItem value='Mixed Beds'>Mixed Beds</MenuItem>
						<MenuItem value='Turfgrass'>Turfgrass</MenuItem>
					</Field>
				</Grid>
				{type == 'Mixed Beds' && this.clearValues(['species'], basePath, values)}
				{type == 'Mixed Beds' && this.mixedBeds(basePath)}
				{type == 'Turfgrass' &&
					this.clearValues(
						['supplemental_irrigation', 'plant_density', 'exposure'],
						basePath,
						values
					)}
				{type == 'Turfgrass' && this.turfgrass(basePath)}
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
				{isMetered == 'yes' && this.clearValues(nonmeter, basePath, values)}
				{isMetered == 'no' && this.clearValues(['annual_water_use'], basePath, values)}
				{isMetered == 'no' && this.nonMetered(values, basePath)}
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
						label='Is the water use metered?'
					>
						<MenuItem value='yes'>Yes</MenuItem>
						<MenuItem value='no'>No</MenuItem>
					</Field>
				</Grid>
				{this.renderMetered(values, basePath)}
			</Fragment>
		);
	};

	coolingTowersTypes = values => {
		if (!values.has_irrigation) {
			return null;
		}
		return (
			<Fragment>
				<FieldArray name='irrigation'>
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
											label='Enter a unique name identifier for this irrigated area (such as where it is located, or building number/name it is associated)'
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
						endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
					/>
				</Grid>
			</Fragment>
		);
	};

	render() {
		const { createOrUpdateCampusModule, campus, applyRules } = this.props;

		const module = campus ? campus.modules.irrigation : {};

		if (!('irrigation' in module)) {
			module.irrigation = [];
			module.irrigation.push({});
		}

		return (
			<Fragment>
				<Typography variant='h5' gutterBottom>
					Landscape Irrigation
				</Typography>
				<Typography variant='body2' gutterBottom>
					Enter the following information only for irrigated landscaped areas that use
					potable water on the campus
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
						valid,
						form: {
							mutators: { push },
						},
					}) => (
						<form onSubmit={handleSubmit} noValidate>
							<Grid container alignItems='flex-start' spacing={16}>
								<Grid item xs={12}>
									<FormControlLabel
										label='My campus has landscape irrigation?'
										control={
											<Field
												name='has_irrigation'
												component={Checkbox}
												indeterminate={values.has_irrigation === undefined}
												type='checkbox'
											/>
										}
									/>
								</Grid>
								{this.coolingTowersTypes(values)}
								<Grid item xs={12}>
									{values.has_irrigation === true && (
										<Button
											style={{ marginLeft: '10px' }}
											variant='contained'
											color='primary'
											onClick={() => push('irrigation', {})}
										>
											Add Another Landscape Area
										</Button>
									)}
									{values.has_irrigation === false ||
									values.has_irrigation === undefined ? null : (
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
							<FormRulesListener handleFormChange={applyRules} />
							<pre>{JSON.stringify(values, 0, 2)}</pre>
						</form>
					)}
				/>
			</Fragment>
		);
	}
}

export default IrrigationForm;
