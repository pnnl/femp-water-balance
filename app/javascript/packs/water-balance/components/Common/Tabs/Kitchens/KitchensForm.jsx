import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from '../../MaterialInput';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import selectn from 'selectn';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import createDecorator from 'final-form-focus';
import {submitAlert} from '../shared/sharedFunctions';
import {fabStyle, DEFAULT_NUMBER_MASK, DEFAULT_DECIMAL_MASK, ONE_DECIMAL_MASK, numberFormat, expansionPanel} from '../shared/sharedStyles';

import formValidation from './kitchensForm.validation';

const nonMeteredFields = [
  'weekend_meals',
  'weekday_meals',
  'operating_weeks',
  'operating_weekends',
  'dishwasher_type',
  'spray_valve',
  'flow_rate',
  'prep_sink',
  'combination_oven',
  'ice_maker',
];

const FormRulesListener = ({handleFormChange}) => (
  <FormSpy
    subscription={{values: true, valid: true}}
    onChange={async ({values, valid}) => {
      if (valid) {
        handleFormChange(values);
      }
    }}
  />
);

const focusOnError = createDecorator();

const toNumber = (value) => {
  if (value === undefined || value === null) {
    return -1;
  }
  return parseFloat(value.toString().replace(/,/g, ''));
};

const calculatePerMeal = (values) => {
  if (values == null) {
    return 0;
  }
  let iceMaker = toNumber(values.ice_maker);
  let combinationOven = toNumber(values.combination_oven);
  let prepSink = values.prep_sink == true ? 1 : 0;
  let sprayValve = toNumber(values.spray_valve);
  let dishwasher = toNumber(values.dishwasher_type);
  let handWashSink = toNumber(values.flow_rate);
  let handWashSinkValue = 0;
  if (isNaN(handWashSink)) {
    handWashSinkValue = 0;
  } else if (handWashSink > 1.5) {
    handWashSinkValue = 4;
  } else if (handWashSink >= 1.1 && handWashSink <= 1.5) {
    handWashSinkValue = 3;
  } else if (handWashSink >= 0.6 && handWashSink <= 1.0) {
    handWashSinkValue = 2;
  } else if (handWashSink <= 0.5) {
    handWashSinkValue = 1;
  }
  let useIndex = iceMaker + combinationOven * 5.9 + (prepSink + sprayValve + dishwasher + handWashSinkValue) * 3.1;
  let waterUsePerMeal = 0;
  if (useIndex > 0 && useIndex <= 28.3) {
    waterUsePerMeal = 5;
  } else if (useIndex >= 28.4 && useIndex <= 40.1) {
    waterUsePerMeal = 10;
  } else if (useIndex >= 40.2 && useIndex <= 51.7) {
    waterUsePerMeal = 15;
  }

  return waterUsePerMeal;
};

class KitchensForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.kitchen_facilities.water_use`)(props);
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
    let waterUsePerMeal = 0;
    let total = 0;
    values.kitchen_facilities.map((facilityValues, index) => {
      if (facilityValues) {
        if (facilityValues.is_metered == 'yes') {
          total += toNumber(facilityValues.annual_water_use);
        } else {
          waterUsePerMeal = calculatePerMeal(facilityValues);
          let weekdayMeals = toNumber(facilityValues.weekday_meals);
          let weekendMeals = toNumber(facilityValues.weekend_meals);
          let operatingWeeks = toNumber(facilityValues.operating_weeks);
          let operatingWeekends = toNumber(facilityValues.operating_weekends);
          let daysPerWeek = toNumber(facilityValues.days_per_week);
          let daysPerWeekend = toNumber(facilityValues.days_per_weekend);

          total += ((weekdayMeals * operatingWeeks * daysPerWeek + weekendMeals * operatingWeekends * daysPerWeekend) * waterUsePerMeal) / 1000;
        }
      }
    });

    let formatTotal = numberFormat.format(total);
    values.water_use = formatTotal;
    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal',
    });
  };

  renderMetered = (values, basePath) => {
    const isMetered = selectn(`${basePath}.is_metered`)(values);
    const year = values.year;
    return (
      <Fragment>
        {isMetered === 'yes' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
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
        {isMetered === 'no' && this.clearValues(['annual_water_use'], basePath, values)}
        {isMetered === 'no' && this.averageMeals(basePath, values)}
        {isMetered === 'yes' && this.clearValues(nonMeteredFields, basePath, values)}
      </Fragment>
    );
  };

  kitchenComponents = (basePath, values) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field formControlProps={{fullWidth: true}} required name={`${basePath}.dishwasher_type`} component={Select} label='Type of dishwasher'>
            <MenuItem value='3'>Standard Continuous</MenuItem>
            <MenuItem value='2'>Standard Batch</MenuItem>
            <MenuItem value='1'>Energy Star Labeled</MenuItem>
            <MenuItem value='0'>No Dishwasher</MenuItem>
          </Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.spray_valve`}
            component={Select}
            label='Type of pre-rinse spray valve'
          >
            <MenuItem value='2'>Standard Flow</MenuItem>
            <MenuItem value='1'>WaterSense Labeled</MenuItem>
            <MenuItem value='0'>No Pre-Rinse Spray Valves</MenuItem>
          </Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.flow_rate`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='Typical flow rate of the handwash faucets'
            endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
          ></Field>
        </Grid>
        <FormControlLabel
          label='Faucets for prep sinks or for washing pots and pans present'
          control={
            <Field
              name={`${basePath}.prep_sink`}
              component={Checkbox}
              indeterminate={selectn(`${basePath}.prep_sink`)(values) === undefined}
              type='checkbox'
            />
          }
        />
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.combination_oven`}
            component={Select}
            label='Type of combination oven or steam cooker'
          >
            <MenuItem value='3'>Standard Boiler-Based</MenuItem>
            <MenuItem value='2'>Standard Connectionless</MenuItem>
            <MenuItem value='1'>Energy Star Labeled</MenuItem>
            <MenuItem value='0'>No Combination Ovens or Steam Cookers</MenuItem>
          </Field>
        </Grid>
        <Grid item xs={12}>
          <Field formControlProps={{fullWidth: true}} required name={`${basePath}.ice_maker`} component={Select} label='Type of ice maker'>
            <MenuItem value='3'>Standard Water-Cooled</MenuItem>
            <MenuItem value='2'>Standard Air-Cooled</MenuItem>
            <MenuItem value='1'>Energy Star Labeled</MenuItem>
            <MenuItem value='0'>No Ice Maker</MenuItem>
          </Field>
        </Grid>
      </Fragment>
    );
  };

  averageMeals = (basePath, values) => {
    const weekdayMeals = selectn(`${basePath}.weekday_meals`)(values);
    const weekendMeals = selectn(`${basePath}.weekend_meals`)(values);
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.weekday_meals`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Average number of daily meals prepared during weekdays'
            endAdornment={<InputAdornment position='end'>meals/day</InputAdornment>}
          ></Field>
        </Grid>
        {toNumber(weekdayMeals) != 0 && weekdayMeals != undefined && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.days_per_week`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='How many weekdays per week are meals prepared?'
                endAdornment={<InputAdornment position='end'>days</InputAdornment>}
              ></Field>
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.operating_weeks`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='Number of weeks (M-F) commercial kitchen is operating per year'
              ></Field>
            </Grid>
          </Fragment>
        )}
        {toNumber(weekdayMeals) == 0 && weekdayMeals != undefined && this.clearValues(['operating_weeks', 'days_per_week'], basePath, values)}
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.weekend_meals`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Average number of daily meals prepared during weekend days'
            endAdornment={<InputAdornment position='end'>meals/day</InputAdornment>}
          ></Field>
        </Grid>
        {toNumber(weekendMeals) != 0 && weekendMeals != undefined && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.days_per_weekend`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='How many weekend days per week are meals prepared?'
                endAdornment={<InputAdornment position='end'>days</InputAdornment>}
              ></Field>
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.operating_weekends`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='Number of weekends the commercial kitchen operates per year'
              ></Field>
            </Grid>
          </Fragment>
        )}
        {toNumber(weekendMeals) == 0 && weekendMeals != undefined && this.clearValues(['operating_weekends', 'days_per_weekend'], basePath, values)}
        {this.kitchenComponents(basePath, values)}
      </Fragment>
    );
  };
  renderFacilityTypeResponse = (values, basePath) => {
    const facilityType = selectn(`${basePath}.type`)(values);
    return (
      <Fragment>
        {facilityType === 'stand_alone' && (
          <Grid item xs={12}>
            <Field formControlProps={{fullWidth: true}} required name={`${basePath}.is_metered`} component={Select} label='Is the water use metered?'>
              <MenuItem value='yes'>Yes</MenuItem>
              <MenuItem value='no'>No</MenuItem>
            </Field>
            {this.renderMetered(values, basePath)}
          </Grid>
        )}
        {facilityType === 'incorporated' && this.clearValues(['is_metered', 'annual_water_use'], basePath, values)}
        {facilityType === 'incorporated' && this.averageMeals(basePath, values)}
      </Fragment>
    );
  };

  onSubmit = (values) => {};

  renderFacilityTypes = (values, valid) => {
    if (!values.has_kitchens) {
      return null;
    }
    return (
      <Fragment>
        <FieldArray name='kitchen_facilities'>
          {({fields}) =>
            fields.map((name, index) => (
              <Grid item xs={12} key={index}>
                <ExpansionPanel style={expansionPanel} expanded={selectn(`${name}.type`)(values) !== undefined}>
                  <ExpansionPanelSummary>
                    <Field
                      formControlProps={{fullWidth: true}}
                      required
                      name={`${name}.type`}
                      component={Select}
                      label='Is the commercial kitchen a stand-alone facility or is it incorporated into another building?'
                    >
                      <MenuItem value='stand_alone'>Stand Alone</MenuItem>
                      <MenuItem value='incorporated'>Incorporated in Another Building</MenuItem>
                    </Field>
                    <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                      <DeleteIcon />
                    </IconButton>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container alignItems='flex-start' spacing={16}>
                      <Grid item xs={12}>
                        <Field
                          fullWidth
                          required
                          name={`${name}.name`}
                          component={MaterialInput}
                          type='text'
                          label='Enter a unique identifier for this commercial kitchen facility (such as a building name or building number)'
                        />
                      </Grid>
                      {selectn(`${name}.type`)(values) && this.renderFacilityTypeResponse(values, `${name}`)}
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
              error: valid || values.water_use == null ? null : "Fix errors and click 'Calculate Water Use' button to update value.",
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

    const module = campus ? campus.modules.kitchen_facilities : {};

    if (!('kitchen_facilities' in module)) {
      module.kitchen_facilities = [];
      module.kitchen_facilities.push({});
    }

    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Commercial Kitchen
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information for commercial kitchens on the campus
        </Typography>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          mutators={{
            ...arrayMutators,
          }}
          decorators={[focusOnError]}
          render={({
            handleSubmit,
            values,
            dirty,
            valid,
            form: {
              mutators: {push, pop},
            },
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                <Grid item xs={12}>
                  <FormControlLabel
                    label='My campus has commercial kitchen facilities?'
                    control={<Field name='has_kitchens' component={Checkbox} indeterminate={values.has_kitchens === undefined} type='checkbox' />}
                  />
                </Grid>
                {this.renderFacilityTypes(values, valid)}

                <Grid item xs={12}>
                  {values.has_kitchens === false || values.has_kitchens === undefined ? null : (
                    <Fragment>
                      <Button variant='contained' color='primary' onClick={() => push('kitchen_facilities', {})}>
                        Add Another Commercial Kitchen
                      </Button>
                      <Button
                        style={{marginLeft: '10px'}}
                        variant='contained'
                        type='submit'
                        onClick={() => this.calculateWaterUse(values, valid)}
                      >
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
                    </Fragment>
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

export default KitchensForm;
