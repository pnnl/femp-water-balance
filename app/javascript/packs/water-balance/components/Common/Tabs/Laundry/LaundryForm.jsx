import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import {FieldArray} from 'react-final-form-arrays';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import arrayMutators from 'final-form-arrays';
import {
  fabStyle,
  DEFAULT_NUMBER_MASK,
  DEFAULT_DECIMAL_MASK,
  ONE_DECIMAL_MASK,
  numberFormat,
  noShadow,
  noPadding,
  mediaQuery,
} from '../shared/sharedStyles';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert, FormRulesListener, ToggleAdapter} from '../shared/sharedFunctions';
import formValidation from './LaundryForm.validation';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem} from '@material-ui/core';
import Handbook from '../shared/handbookLink';

let expansionPanel = mediaQuery();

const singleLoadFields = [
  'people',
  'loads_per_person',
  'loads_per_person_weekend',
  'single_load_weeks',
  'loads_per_person_weekend',
  'energy_star',
  'energy_star_capacity',
  'energy_star_factor',
  'machine_type',
  'nonenergy_star_factor',
  'nonenergy_star_capacity',
];

const industrialLoadFields = ['weight', 'industrial_weeks', 'water_use', 'recycled'];

const toNumber = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};

const focusOnError = createDecorator();

const calculateSingleLoad = (values) => {
  let esPercent = toNumber(selectn(`energy_star`)(values));
  let people = toNumber(selectn(`people`)(values));
  let loadsPerPerson = toNumber(selectn(`loads_per_person`)(values));
  let loadsPerPersonWeekend = toNumber(selectn(`loads_per_person_weekend`)(values));
  let singleLoadWeeks = toNumber(selectn(`single_load_weeks`)(values));
  let energyStarCapacity = toNumber(selectn(`energy_star_capacity`)(values));
  let energyStarFactor = toNumber(selectn(`energy_star_factor`)(values));
  let nonenergyStarCapacity = toNumber(selectn(`nonenergy_star_capacity`)(values));
  let nonenergyStarFactor = toNumber(selectn(`nonenergy_star_factor`)(values));

  let loadsPerYear = people * (loadsPerPerson + loadsPerPersonWeekend) * singleLoadWeeks;
  let esGalPerCycle = energyStarCapacity * energyStarFactor;

  let nesGalPerCycle = nonenergyStarCapacity * nonenergyStarFactor;
  let totalSingleLoad = (esGalPerCycle * loadsPerYear * (esPercent / 100) + nesGalPerCycle * loadsPerYear * (1 - esPercent / 100)) / 1000 || 0;

  return totalSingleLoad;
};

const calculateIndustrialLoad = (values) => {
  let weight = toNumber(selectn(`weight`)(values));
  let industrialWeeks = toNumber(selectn(`industrial_weeks`)(values));
  let laundryRecycled = toNumber(selectn(`recycled`)(values));
  let waterUse = toNumber(selectn(`water_use`)(values));

  let totalIndustrialLoad = (weight * industrialWeeks * waterUse * (1 - laundryRecycled / 100)) / 1000;

  return totalIndustrialLoad;
};

class LaundryForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.laundry.water_usage`)(props);
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

  calculateWaterUse = (values, valid) => {
    if (!valid) {
      window.alert('Missing or incorrect values.');
      return;
    }
    let singleLoad = 0;
    let industrialLoad = 0;
    values.laundry_facilities.map((facility) => {
      singleLoad += calculateSingleLoad(facility);
      industrialLoad += calculateIndustrialLoad(facility);
    });
    let total = singleLoad + industrialLoad;
    let formatTotal = numberFormat.format(total);
    values.water_usage = formatTotal;
    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal',
    });
  };

  onSubmit = (values) => {};

  industrialMachines = (basePath) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.weight`}
            component={MaterialInput}
            type='text'
            mask={ONE_DECIMAL_MASK}
            label='Estimated weight of laundry washed in industrial washing machines weekly.'
            endAdornment={<InputAdornment position='end'>lbs</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.industrial_weeks`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Weeks per year industrial washing machines are operated.'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.water_use`}
            component={MaterialInput}
            type='text'
            mask={ONE_DECIMAL_MASK}
            label='Estimated water use per pound of laundry.'
            endAdornment={<InputAdornment position='end'>gal</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.recycled`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Percentage of the water that is recycled/reused.'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          />
        </Grid>
      </Fragment>
    );
  };

  energyStar = (values, basePath) => {
    let energyStar = selectn(`${basePath}.energy_star`)(values);
    return (
      <Fragment>
        {energyStar < 100 && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true, required: true}}
              name={`${basePath}.machine_type`}
              component={Select}
              label='Non-ENERGY STAR single-load/multi-load washing machines predominately top loading or front loading?'
            >
              <MenuItem value='top_loading'>Top Loading</MenuItem>
              <MenuItem value='front_loading'>Front Loading</MenuItem>
            </Field>
          </Grid>
        )}
        {energyStar > 0 && (
          <Grid item xs={12}>
            <Field
              required
              formControlProps={{fullWidth: true}}
              name={`${basePath}.energy_star_capacity`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='Typical capacity of ENERGY STAR single-load/multi-load washing machines.'
              endAdornment={<InputAdornment position='end'>feet³</InputAdornment>}
            />
          </Grid>
        )}
        {selectn(`${basePath}.energy_star`)(values) < 100 && (
          <Grid item xs={12}>
            <Field
              required
              formControlProps={{fullWidth: true}}
              name={`${basePath}.nonenergy_star_capacity`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='Typical capacity of Non-ENERGY STAR single-load/multi-load washing machines.'
              endAdornment={<InputAdornment position='end'>feet³</InputAdornment>}
            />
          </Grid>
        )}
        {energyStar > 0 && (
          <Grid item xs={12}>
            <Field
              required
              formControlProps={{fullWidth: true}}
              name={`${basePath}.energy_star_factor`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='Water factor of the ENERGY STAR single-load/multi-load washing machines.'
              endAdornment={<InputAdornment position='end'>gallons/cycle/feet³</InputAdornment>}
            />
          </Grid>
        )}
        {selectn(`${basePath}.energy_star`)(values) < 100 && (
          <Grid item xs={12}>
            <Field
              required
              formControlProps={{fullWidth: true}}
              name={`${basePath}.nonenergy_star_factor`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='Water factor of the Non-ENERGY STAR single-load/multi-load washing machines.'
              endAdornment={<InputAdornment position='end'>gallons/cycle/feet³</InputAdornment>}
            />
          </Grid>
        )}
        {selectn(`${basePath}.energy_star`)(values) == 100 &&
          this.clearValues(['machine_type', 'nonenergy_star_factor', 'nonenergy_star_capacity'], basePath, values)}
        {selectn(`${basePath}.energy_star`)(values) == 0 && this.clearValues(['energy_star_factor', 'energy_star_capacity'], basePath, values)}
      </Fragment>
    );
  };

  singleLoad = (values, basePath) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.people`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Estimated number of people that use washing machines each week.'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.loads_per_person`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Estimated loads of laundry per person per weekday.'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.loads_per_person_weekend`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Estimated loads of laundry per person per weekend.'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.single_load_weeks`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Weeks per year single-load/multi-load washing machines are operated.'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            required
            formControlProps={{fullWidth: true}}
            name={`${basePath}.energy_star`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Percentage of single-load/multi-load washing machines that are ENERGY STAR.'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          />
        </Grid>
        {selectn(`${basePath}.energy_star`)(values) && this.energyStar(values, basePath)}
      </Fragment>
    );
  };

  renderFacilityTypes = (values, valid, basePath) => {
    return (
      <Fragment>
        <Grid item xs={12} style={noPadding}>
          <ExpansionPanel expanded={selectn(`${basePath}.has_single_load`)(values) === true} style={noShadow}>
            <ExpansionPanelSummary>
              <Field
                name={`${basePath}.has_single_load`}
                label='This facility has single-load and/or multi-load washing machines.'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.singleLoad(values, basePath)}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        {selectn(`${basePath}.has_single_load`)(values) == false && this.clearValues(singleLoadFields, basePath, values)}
        <Grid item xs={12} style={noPadding}>
          <ExpansionPanel expanded={selectn(`${basePath}.has_industrial_machines`)(values) === true} style={noShadow}>
            <ExpansionPanelSummary>
              <Field
                name={`${basePath}.has_industrial_machines`}
                label='This facility has industrial washing machines, such as tunnel washers or washer extractors.'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.industrialMachines(basePath)}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        {selectn(`${basePath}.has_industrial_machines`)(values) == false && this.clearValues(industrialLoadFields, basePath, values)}
      </Fragment>
    );
  };

  renderFacility = (values, valid) => {
    if (!values.has_laundry_facility) {
      return null;
    }
    return (
      <Fragment>
        <FieldArray name='laundry_facilities'>
          {({fields}) =>
            fields.map((name, index) => (
              <Grid item xs={12} key={index}>
                <ExpansionPanel style={expansionPanel} expanded={selectn(`${name}.name`)(values) !== undefined}>
                  <ExpansionPanelSummary>
                    <Field
                      fullWidth
                      required
                      name={`${name}.name`}
                      component={MaterialInput}
                      type='text'
                      label='Enter a unique name identifier for this laundry system (such as the building name/number it is associated).'
                    />
                    {values.laundry_facilities && values.laundry_facilities.length > 1 && (
                      <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container alignItems='flex-start' spacing={16}>
                      {this.renderFacilityTypes(values, valid, `${name}`)}
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
            name='water_usage'
            label='Water use'
            component={MaterialInput}
            type='text'
            helperText={ valid || selectn('water_usage')(values) == null ? null : "Enter required fields and click 'Calculate Water Use' button to update value."}
            meta={{
              visited: true,
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

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.laundry : {};
    if (!('laundry_facilities' in module)) {
      const startingValues = module.laundry ? {...module.laundry} : {};
      module.laundry_facilities = [startingValues];
    }
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Laundry (Washing Machines)
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information for laundry (washing machines) on the campus
        </Typography>
        <Handbook sectionName={'Laundry (Washing Machines)'}/>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          decorators={[focusOnError]}
          mutators={{...arrayMutators}}
          render={({
            handleSubmit,
            values,
            dirty,
            valid,
            form: {
              mutators: {push},
            },
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                <Grid item xs={12}>
                  <FormControlLabel
                    label='My campus has laundry facilities?'
                    control={
                      <Field
                        name='has_laundry_facility'
                        component={Checkbox}
                        indeterminate={values.has_laundry_facility === undefined}
                        type='checkbox'
                      />
                    }
                  />
                </Grid>
                {this.renderFacility(values, valid)}
                <Grid item xs={12}>
                  {values.has_laundry_facility === true && (
                    <Button variant='contained' color='primary' onClick={() => push('laundry_facilities', {})}>
                      Add Another Laundry Facility
                    </Button>
                  )}
                  {values.has_laundry_facility === false || values.has_laundry_facility === undefined ? null : (
                    <Fragment>
                      <Button variant='contained' style={{marginLeft: '10px'}} type='submit' onClick={() => this.calculateWaterUse(values, valid)}>
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
                    </Fragment>
                  )}
                  {this.state.waterUse != '' && (
                    <Fab color='primary' aria-label='Water Use' title='Water Use' style={fabStyle}>
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

export default LaundryForm;
