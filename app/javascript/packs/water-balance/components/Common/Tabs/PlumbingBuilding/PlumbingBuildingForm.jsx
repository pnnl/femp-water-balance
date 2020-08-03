import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import {Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from '../../MaterialInput';
import {FieldArray} from 'react-final-form-arrays';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import arrayMutators from 'final-form-arrays';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert, FormRulesListener} from '../shared/sharedFunctions';
import {fabStyle, DEFAULT_DECIMAL_MASK, mediaQuery, expansionDetails, numberFormat} from '../shared/sharedStyles';
import formValidation from './PlumbingBuildingForm.validation';

import {Fab, Grid, Button, InputAdornment, MenuItem} from '@material-ui/core';

let expansionPanel = mediaQuery();

const focusOnError = createDecorator();

const assumedTypes = ['hotel', 'barracks', 'family'];
const assumedUrinalFlushesPerPersonPerHour = 0.25;
const assumedDaysPerYear = 350;
const assumedUrinalFlushRate = 0.125;
const assumedFlushRate = 0.375;
const assumedShowerPercent = 0.69;
const restroomSinkUseMap = {
  hotel: 0.25,
  barracks: 0.25,
  family: 0.25,
  hospital: .125,
  clinic: 1.05,
  other: 0.125
};

const kitchenSinkUseMap = {
  hotel: 0.5,
  barracks: 0.5,
  family: 2.5,
  hospital: 0.5,
  clinic: 0.5,
  other: 0.5
};

class PlumbingForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.plumbing.plumbing.water_usage`)(props);
    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : ''
    };
    this.calculateWaterUse = this.calculateWaterUse.bind(this);
  }

  toNumber = number => {
    return Number(number) || 0;
  };

  occupantsPerDay = audit => {
    const week_day_occupancy = this.toNumber(audit.weekday_occupancy);
    const weekend_occupancy = this.toNumber(audit.weekend_occupancy);
    let weekdays = week_day_occupancy ? 5 : 0;
    let weekendDays = weekend_occupancy ? 2 : 0;
    let totalDays = weekdays + weekendDays;
    return (week_day_occupancy * 5 + weekend_occupancy * 2) / totalDays;
  };

  daysPerYear = (audit, buildingType) => {
    const week_days_year = this.toNumber(audit.week_days_year);
    const weekend_days_year = this.toNumber(audit.weekend_days_year);

    let daysPerYear;
    if (assumedTypes.indexOf(buildingType) > -1) {
      daysPerYear = assumedDaysPerYear;
    } else {
      daysPerYear = week_days_year + weekend_days_year;
    }
    return daysPerYear;
  };

  getOccupancy = (audit, buildingType) => {
    // Occupants per day
    let occupantsPerDay = this.occupantsPerDay(audit);

    // Hours per day
    const week_days_year = this.toNumber(audit.week_days_year);
    const week_days_hours = this.toNumber(audit.week_days_hours);
    const weekend_days_year = this.toNumber(audit.weekend_days_year);
    const weekend_days_hours = this.toNumber(audit.weekend_days_hours);
    let hoursPerDay;
    if (assumedTypes.indexOf(buildingType) > -1) {
      hoursPerDay = 8;
    } else {
      hoursPerDay = (week_days_hours * week_days_year + weekend_days_hours * weekend_days_year) / (week_days_year + weekend_days_year);
    }

    // Days per year
    let daysPerYear = this.daysPerYear(audit, buildingType);

    return occupantsPerDay * hoursPerDay * daysPerYear;
  };

  calculateUrinals = (fixture, buildingType, audit, totalHoursOccupiedPerYear) => {
    if (buildingType === 'family') {
      return 0;
    }
    if (fixture.urinals === 'no') {
      return 0;
    }
    const percentMale = this.toNumber(audit.percent_male) / 100;
    const flushRate = this.toNumber(fixture.urinal_flush_rate);
    const totalFlushes = percentMale * assumedUrinalFlushesPerPersonPerHour * totalHoursOccupiedPerYear;
    return (totalFlushes * flushRate) / 1000;
  };

  calculateToilets = (fixture, audit, totalHoursOccupiedPerYear) => {
    const averageFlushRate = this.toNumber(fixture.typical_flush_rate);
    const percentMale = this.toNumber(audit.percent_male) / 100;
    const femaleFlushes = assumedFlushRate;
    let maleFlushes = assumedFlushRate;
    if (fixture.urinals === 'yes') {
      maleFlushes = assumedUrinalFlushRate;
    }
    const maleFlushesPerYear = percentMale * maleFlushes * totalHoursOccupiedPerYear;
    const femaleFlushesPerYear = (1 - percentMale) * femaleFlushes * totalHoursOccupiedPerYear;

    return ((maleFlushesPerYear + femaleFlushesPerYear) * averageFlushRate) / 1000;
  };

  calculateRestroomSink = (fixture, buildingType, totalHoursOccupiedPerYear) => {
    const aeratorFlowRate = this.toNumber(fixture.aerator_flow_rate);
    const minutesUsedPerHour = restroomSinkUseMap[buildingType];
    const totalMinutesPerYear = minutesUsedPerHour * totalHoursOccupiedPerYear;

    return (aeratorFlowRate * totalMinutesPerYear) / 1000;
  };

  calculateKitchenSink = (fixture, primaryBuildingType, audit) => {
    const minutesUsedPerOccupant = kitchenSinkUseMap[primaryBuildingType];
    const averageFlowRate = this.toNumber(fixture.kitchenette_flow_rate);
    const minutesUsedPerYear = this.occupantsPerDay(audit) * this.daysPerYear(audit, primaryBuildingType) * minutesUsedPerOccupant;

    return (averageFlowRate * minutesUsedPerYear) / 1000;
  };

  calculateShowers = (fixture, primaryBuildingType, audit) => {
    const averageShowerFlowRate = this.toNumber(fixture.shower_flow_rate);
    let occupantShowerPercent;
    let minutesPerShower;
    if (assumedTypes.indexOf(primaryBuildingType) > -1) {
      occupantShowerPercent = assumedShowerPercent;
      minutesPerShower = 7.8;
    } else {
      occupantShowerPercent = this.toNumber(fixture.shower_usage) / 100;
      minutesPerShower = 5.3;
    }
    const showersPerYear = this.occupantsPerDay(audit) * this.daysPerYear(audit, primaryBuildingType) * occupantShowerPercent;

    return (showersPerYear * minutesPerShower * averageShowerFlowRate) / 1000;
  };

  calculateWaterUse = (values, valid) => {
    if (!valid) {
      window.alert('Missing or incorrect values.');
      return;
    }

    let waterCategoryTotal = {};
    let totalWater = 0;

    values.audits.forEach(audit => {
      const building = values.buildings.find(building => building.name == audit.name);
      const primaryBuildingType = building.primary_building_type;
      const fixture = values.fixtures.find(fixture => fixture.name == building.name);
      const totalHoursOccupiedPerYear = this.getOccupancy(audit, primaryBuildingType);
      const urinals = this.calculateUrinals(fixture, primaryBuildingType, audit, totalHoursOccupiedPerYear);
      const toilets = this.calculateToilets(fixture, audit, totalHoursOccupiedPerYear);
      const restroomSink = this.calculateRestroomSink(fixture, primaryBuildingType, totalHoursOccupiedPerYear);
      const kitchenSinks = this.calculateKitchenSink(fixture, primaryBuildingType, audit);
      const showers = this.calculateShowers(fixture, primaryBuildingType, audit);
      if (!waterCategoryTotal[primaryBuildingType]) {
        waterCategoryTotal[primaryBuildingType] = 0;
      }
      const auditTotal = urinals + toilets + restroomSink + kitchenSinks + showers;
      waterCategoryTotal[primaryBuildingType] += auditTotal;
      totalWater += auditTotal;
    });
    console.log('%o', waterCategoryTotal);

    values.plumbing.lodging_water_usage = numberFormat.format(
      (waterCategoryTotal['family'] || 0) + (waterCategoryTotal['hotel'] || 0) + (waterCategoryTotal['barracks'] || 0)
    );
    values.plumbing.hospital_water_usage = numberFormat.format((waterCategoryTotal['hospital'] || 0) + (waterCategoryTotal['clinic'] || 0));
    values.plumbing.overall_water_usage = numberFormat.format(waterCategoryTotal['other'] || 0);
    let formatTotal = numberFormat.format(totalWater);

    values.plumbing.water_usage = formatTotal;
    this.setState({
      waterUse: ' Water Use:' + formatTotal + ' kgal'
    });
  };

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
    if (values['plumbing'][name] != undefined) {
      if (!(Object.keys(values['plumbing'][name]).length === 0)) {
        values['plumbing'][name] = null;
      }
    }
  };

  onSubmit = values => {};

  flushRate = (basePath, values) => {
    const source = selectn(`${basePath}.name`)(values);
    const flowRate = selectn(`${basePath}.shower_flow_rate`)(values);
    const building = source && values.buildings.find(building => building.name === source);
    const buildingType = building ? building.primary_building_type : null;
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        <Field
          formControlProps={{fullWidth: true}}
          required
          name={`${basePath}.typical_flush_rate`}
          component={MaterialInput}
          type='text'
          mask={DEFAULT_DECIMAL_MASK}
          label={'What is the typical flush rate of toilets in ' + source + '?'}
          endAdornment={<InputAdornment position='end'>gpf</InputAdornment>}
        />
        {buildingType !== 'family' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.urinals`}
              component={Select}
              label={'Are urinals typically present in ' + source + '?'}
            >
              <MenuItem value='yes'>Yes</MenuItem>
              <MenuItem value='no'>No</MenuItem>
            </Field>
          </Grid>
        )}
        {selectn(`${basePath}.urinals`)(values) === 'yes' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.urinal_flush_rate`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={'What is the typical flush rate of urinals in ' + source + '?'}
              endAdornment={<InputAdornment position='end'>gpf</InputAdornment>}
            />
          </Grid>
        )}

        {selectn(`${basePath}.urinals`)(values) == 'No' && this.clearValues(['urinal_flush_rate'], basePath, values)}
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.aerator_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of restroom faucet aerators in ' + source + '?'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.kitchenette_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of kitchenette faucet aerators in ' + source + '? Please put 0 if no kitchenettes are present.'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.shower_flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label={'What is the typical flow rate of showers in ' + source + '? Please put 0 in no showers are present.'}
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          />
        </Grid>
        {flowRate != 0 && flowRate != undefined && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.shower_usage`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={'What is the estimated percentage of occupants in ' + source + ' that use showers on a daily basis?'}
              endAdornment={<InputAdornment position='end'>%</InputAdornment>}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  renderFacilityTypes = (values, valid) => {
    const facilities = values.fixtures.map(facility => facility.name);
    return (
      <Fragment>
        <FieldArray name='fixtures'>
          {({fields}) =>
            fields.map((name, index) => (
              <Grid item xs={12} key={index}>
                <ExpansionPanel style={expansionPanel} expanded={selectn(`${name}.name`)(values) !== undefined}>
                  <ExpansionPanelSummary>
                    <Field
                      formControlProps={{fullWidth: true}}
                      required
                      name={`${name}.name`}
                      component={Select}
                      label='Select a unique name identifier for this building from the dropdown list.'
                    >
                      {values.buildings.map(building => {
                        const disabled = facilities.indexOf(building.name) > -1;
                        return (
                          <MenuItem disabled={disabled} value={building.name}>
                            {building.name}
                          </MenuItem>
                        );
                      })}
                    </Field>
                    <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                      <DeleteIcon />
                    </IconButton>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{paddingLeft: '40px', ...expansionDetails}}>
                    <Grid container alignItems='flex-start' spacing={16}>
                      {this.flushRate(`${name}`, values)}
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
            ))
          }
        </FieldArray>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.lodging_water_usage'
            label='On-Site Lodging Water Use'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.hospital_water_usage'
            label='Hospital/Medical Clinic Water Use'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.overall_water_usage'
            label='General Campus'
            component={MaterialInput}
            type='text'
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Field
            fullWidth
            disabled
            name='plumbing.water_usage'
            label='Total Water Use'
            component={MaterialInput}
            type='text'
            meta={{
              visited: true,
              error:
                valid || selectn('plumbing.water_usage')(values) == null ? null : "Fix errors and click 'Calculate Water Use' button to update value."
            }}
            endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
          />
        </Grid>
      </Fragment>
    );
  };

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  addAnotherBuildingButton = (values, push) => {
    const moreBuildings = values.fixtures && values.buildings && values.buildings.length > values.fixtures.length;
    if (moreBuildings) {
      return (
        <Button style={{marginRight: '10px'}} variant='contained' color='primary' onClick={() => push('fixtures', {})}>
          Add Another Building
        </Button>
      );
    }
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.plumbing : {};
    if (!('fixtures' in module)) {
      module.fixtures = [];
      module.fixtures.push({});
    }
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Plumbing
        </Typography>
        <Typography variant='body2' gutterBottom style={{marginBottom: '25px'}}>
          Enter the following information on campus occupancy groups and installed fixtures. Note that fixture information will only be entered for
          occupancy groups present on the campus.
        </Typography>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          mutators={{...arrayMutators}}
          decorators={[focusOnError]}
          render={({
            handleSubmit,
            dirty,
            values,
            valid,
            form: {
              mutators: {push, pop}
            }
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.renderFacilityTypes(values, valid)}
                <Grid item xs={12}>
                  {this.addAnotherBuildingButton(values, push)}
                  <Button variant='contained' type='submit' onClick={() => this.calculateWaterUse(values, valid)}>
                    Calculate Water Use
                  </Button>
                  <Button
                    variant='contained'
                    type='button'
                    onClick={() => submitAlert(valid, createOrUpdateCampusModule, values)}
                    style={{marginLeft: '10px'}}
                  >
                    Save
                  </Button>
                  {this.state.waterUse != '' && (
                    <Fab color='primary' aria-label='Water Use' title='Water Use' style={fabStyle}>
                      {this.state.waterUse}
                    </Fab>
                  )}
                </Grid>
                {this.updateIsDirty(dirty, updateParent)}
                <FormRulesListener handleFormChange={applyRules} />
                <pre>{JSON.stringify(values, 0, 2)}</pre>
              </Grid>
            </form>
          )}
        />
      </Fragment>
    );
  }
}

export default PlumbingForm;
