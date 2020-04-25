import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import {fabStyle, DEFAULT_NUMBER_MASK, DEFAULT_DECIMAL_MASK, ONE_DECIMAL_MASK, numberFormat, expansionPanel, noPadding, noShadow} from '../shared/sharedStyles';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert} from '../shared/sharedFunctions';

import formValidation from './OtherProcessesForm.validation';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, Switch, MenuItem} from '@material-ui/core';

const toNumber = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};

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

const ToggleAdapter = ({input: {onChange, value}, label, ...rest}) => (
  <FormControlLabel
    control={
      <Switch
        checked={value}
        onChange={(event, isInputChecked) => {
          let proceed = true;
          if (value == true) {
            proceed = window.confirm('Deactivating this toggle will clear values. Do you want to proceed?');
          }
          if (proceed == true) {
            onChange(isInputChecked);
          }
        }}
        value={value}
        {...rest}
      />
    }
    label={label}
  />
);

const continuousWaterUse = (processes) => {
  let batchesPerWeek = toNumber(processes.average_week);
  let weeksPerYear = toNumber(processes.week_year);
  let waterPerBatch = toNumber(processes.water_use);
  let recycled = toNumber(processes.recycled);

  return (batchesPerWeek * weeksPerYear * waterPerBatch * (1 - recycled / 100)) / 1000;
};

const batchWaterUse = (processes) => {
  let batchesPerWeek = toNumber(processes.average_week);
  let weeksPerYear = toNumber(processes.week_year);
  let flow_rate = toNumber(processes.flow_rate);
  let recycled = toNumber(processes.recycled);

  return (batchesPerWeek * weeksPerYear * 60 * flow_rate * (1 - recycled / 100)) / 1000;
};

class OtherProcessesForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.other_processes.other_processes.water_use`)(props);
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

    let batchTotal = 0;
    values.continuous_processes.map((processes, index) => {
      if (processes) {
        if (processes.is_metered == 'yes') {
          batchTotal += toNumber(processes.annual_water_use);
        } else {
          batchTotal += batchWaterUse(processes);
        }
      }
    });
    let continousTotal = 0;
    values.batch_processes.map((processes, index) => {
      if (processes) {
        if (processes.is_metered == 'yes') {
          continousTotal += toNumber(processes.annual_water_use);
        } else {
          continousTotal += continuousWaterUse(processes);
        }
      }
    });

    let total = batchTotal + continousTotal;
    let formatTotal = numberFormat.format(total);
    values.other_processes.water_use = formatTotal;

    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal',
    });
  };

  onSubmit = (values) => {};

  waterUse = (values, basePath, source) => {
    let prompt = source == 'continuous_processes' ? 'hours per week the process operates' : 'batches per week';
    let adornment = source == 'continuous_processes' ? 'hours' : 'batches';
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.average_week`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label={`Average number of ${prompt}`}
            endAdornment={<InputAdornment position='end'>{`${adornment}`}</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.week_year`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Number of weeks per year the process operates'
            endAdornment={<InputAdornment position='end'>weeks</InputAdornment>}
          ></Field>
        </Grid>
        {source == 'continuous_processes' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.flow_rate`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='What is the typical flow rate of the process?'
              endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
            ></Field>
          </Grid>
        )}
        {source == 'batch_processes' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.water_use`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label='Water use for one batch'
              endAdornment={<InputAdornment position='end'>gal</InputAdornment>}
            ></Field>
          </Grid>
        )}
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

  continuousProcesses = (values, basePath) => {
    return (
      <FieldArray name='continuous_processes'>
        {({fields}) =>
          fields.map((name, index) => (
            <Grid item xs={12} key={index}>
              <ExpansionPanel style={{...noShadow, ...noPadding}} expanded={selectn(`${name}.name`)(values) !== undefined}>
                <ExpansionPanelSummary>
                  <Field
                    fullWidth
                    required
                    name={`${name}.name`}
                    component={MaterialInput}
                    type='text'
                    label='Enter a unique name identifier for this continuous process (such as the name of the process).'
                  />
                  <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                    <DeleteIcon />
                  </IconButton>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container alignItems='flex-start' spacing={16}>
                    {this.renderIsMetered(values, `${name}`)}
                    {selectn(`${name}.is_metered`)(values) == 'no' && this.waterUse(values, `${name}`, 'continuous_processes')}
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          ))
        }
      </FieldArray>
    );
  };

  batchProcesses = (values, basePath) => {
    return (
      <FieldArray name='batch_processes'>
        {({fields}) =>
          fields.map((name, index) => (
            <Grid item xs={12} key={index}>
              <ExpansionPanel style={{...noShadow, ...noPadding}} expanded={selectn(`${name}.name`)(values) !== undefined}>
                <ExpansionPanelSummary>
                  <Field
                    fullWidth
                    required
                    name={`${name}.name`}
                    component={MaterialInput}
                    type='text'
                    label='Enter a unique name identifier for this batch process (such as the name of the process).'
                  />
                  <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                    <DeleteIcon />
                  </IconButton>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container alignItems='flex-start' spacing={16}>
                    {this.renderIsMetered(values, `${name}`)}
                    {selectn(`${name}.is_metered`)(values) == 'no' && this.waterUse(values, `${name}`, 'batch_processes')}
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          ))
        }
      </FieldArray>
    );
  };

  renderIsMetered = (values, basePath) => {
    const isMetered = selectn(`${basePath}.is_metered`)(values);
    const year = values.year;

    return (
      <Fragment>
        <Grid item xs={12}>
          <Field formControlProps={{fullWidth: true}} required name={`${basePath}.is_metered`} component={Select} label='Is the water use metered?'>
            <MenuItem value='yes'>Yes</MenuItem>
            <MenuItem value='no'>No</MenuItem>
          </Field>
        </Grid>
        {isMetered == 'yes' && this.clearValues(['average_week', 'week_year', 'flow_rate', 'water_use', 'recycled'], basePath, values)}
        {isMetered == 'no' && this.clearValues(['annual_water_use'], basePath, values)}
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
      </Fragment>
    );
  };

  renderFacilityTypes = (values, valid) => {
    if (!values.has_other_processes) {
      return null;
    }
    return (
      <Fragment>
        <Grid item xs={12}>
          <ExpansionPanel style={expansionPanel} expanded={selectn(`other_processes.has_batch_processes`)(values) === true}>
            <ExpansionPanelSummary>
              <Field
                name={`other_processes.has_batch_processes`}
                label='My campus has other batch processes (such as laboratory glassware washing)'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.batchProcesses(values, `batch_processes`)}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        {selectn(`other_processes.has_batch_processes`)(values) == false && this.clearSection(values, 'batch_processes')}
        <Grid item xs={12}>
          <ExpansionPanel style={expansionPanel} expanded={selectn(`other_processes.has_continuous_processes`)(values) === true}>
            <ExpansionPanelSummary>
              <Field
                name={`other_processes.has_continuous_processes`}
                label='My campus has other continuous processes (such as tempering water for steam sterilizers).'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.continuousProcesses(values, 'continuous_processes')}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        {selectn(`other_processes.has_continuous_processes`)(values) == false && this.clearSection(values, 'continuous_processes')}
        <Grid item xs={12} sm={4}>
          <Field
            fullWidth
            disabled
            name='other_processes.water_use'
            label='Water use'
            component={MaterialInput}
            type='text'
            meta={{
              visited: true,
              error:
                valid || selectn('other_processes.water_use')(values) == null
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
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;

    const module = campus ? campus.modules.other_processes : {};

    if (!('batch_processes' in module)) {
      module.batch_processes = [];
      module.batch_processes.push({});
    }
    if (!('continuous_processes' in module)) {
      module.continuous_processes = [];
      module.continuous_processes.push({});
    }

    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Other Processes
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information only for other processes that use potable water on the campus
        </Typography>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          mutators={{...arrayMutators}}
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
                    label='My campus has other water-consuming processes that are not already covered? (e.g. laboratory and medical equipment)'
                    control={
                      <Field
                        name='has_other_processes'
                        component={Checkbox}
                        indeterminate={values.has_other_processes === undefined}
                        type='checkbox'
                      />
                    }
                  />
                </Grid>
                {this.renderFacilityTypes(values, valid)}
                <Grid item xs={12}>
                  {selectn(`other_processes.has_continuous_processes`)(values) === true && (
                    <Button variant='contained' color='primary' onClick={() => push('continuous_processes', {})}>
                      Add Another Continuous Process
                    </Button>
                  )}
                  {selectn(`other_processes.has_batch_processes`)(values) === true && (
                    <Button style={{marginLeft: '10px'}} variant='contained' color='primary' onClick={() => push('batch_processes', {})}>
                      Add Another Batch Process
                    </Button>
                  )}
                  {values.has_other_processes === false || values.has_other_processes === undefined ? null : (
                    <Fragment>
                      <Button style={{marginLeft: '10px'}} variant='contained' type='submit' onClick={() => this.calculateWaterUse(values, valid)}>
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

export default OtherProcessesForm;
