import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, Switch, MenuItem} from '@material-ui/core';
import selectn from 'selectn';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import MaterialInput from '../../MaterialInput';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import createDecorator from 'final-form-focus';
import {submitAlert} from '../shared/sharedFunctions';
import {
  fabStyle,
  DEFAULT_NUMBER_MASK,
  DEFAULT_DECIMAL_MASK,
  ONE_DECIMAL_MASK,
  numberFormat,
  expansionDetails,
  mediaQuery
} from '../shared/sharedStyles';

let expansionPanel = mediaQuery();

import formValidation from './VehicleWashForm.validation';

const toNumber = value => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};

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

const recycledCalculation = values => {
  let waterUsage = toNumber(values.water_usage);
  if (values.metered == 'yes') {
    return waterUsage;
  }
  let vpw = toNumber(values.vpw);
  let gpv = toNumber(values.gpv);
  let wpy = toNumber(values.wpy);
  let recycled = toNumber(values.recycled);

  return (vpw * wpy * gpv * (1 - recycled / 100)) / 1000;
};

const nonRecycledCalculation = values => {
  let waterUsage = toNumber(values.water_usage);
  if (values.metered == 'yes') {
    return waterUsage;
  }
  let vpw = toNumber(values.vpw);
  let rating = toNumber(values.rating);
  let washTime = toNumber(values.wash_time);
  let wpy = toNumber(values.wpy);

  return (vpw * wpy * rating * washTime) / 1000;
};

class VehicleWashForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.vehicle_wash.vehicle_wash.water_use`)(props);

    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : ''
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
        values[name] = [{}];
      }
    }
  };

  calculateWaterUse = (values, valid) => {
    if (!valid) {
      window.alert('Missing or incorrect values.');
      return;
    }

    let autoWash = 0;
    let conveyor = 0;
    let washPadOpenHose = 0;
    let washPadPressureWash = 0;
    let largeVehicle = 0;
    values.auto_wash.map(facility => {
      autoWash += recycledCalculation(facility);
    });

    values.conveyor.map(facility => {
      conveyor += recycledCalculation(facility);
    });

    values.wash_pad_open_hose.map(facility => {
      washPadOpenHose += nonRecycledCalculation(facility);
    });

    values.wash_pad_pressure_washer.map(facility => {
      washPadPressureWash += nonRecycledCalculation(facility);
    });

    values.large_vehicles.map(facility => {
      largeVehicle += recycledCalculation(facility);
    });

    let total = autoWash + conveyor + washPadOpenHose + washPadPressureWash + largeVehicle;
    let formatTotal = numberFormat.format(total);
    values.vehicle_wash.water_use = formatTotal;
    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal'
    });
  };

  onSubmit = values => {};

  renderWashpadForm = (values, name, basePath) => {
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        <Grid item xs={12}>
          <Field
            fullWidth
            required
            name={`${name}.vpw`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Average number of vehicles washed per week'
            endAdornment={<InputAdornment position='end'>Vehicles</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            fullWidth
            required
            name={`${name}.wpy`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Total number of weeks per year vehicles are washed '
            endAdornment={<InputAdornment position='end'>Washes</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            fullWidth
            required
            name={`${name}.wash_time`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Approximate wash time per vehicle'
            endAdornment={<InputAdornment position='end'>Minutes</InputAdornment>}
          />
        </Grid>
        {basePath === 'wash_pad_open_hose' && (
          <Grid item xs={12}>
            <Field
              fullWidth
              required
              name={`${name}.rating`}
              component={MaterialInput}
              type='text'
              mask={ONE_DECIMAL_MASK}
              label='Flow rate of the open hose'
              endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
            />
          </Grid>
        )}
        {basePath === 'wash_pad_pressure_washer' && (
          <Grid item xs={12}>
            <Field
              fullWidth
              required
              name={`${name}.rating`}
              component={MaterialInput}
              type='text'
              mask={ONE_DECIMAL_MASK}
              label='Nozzle rating of pressure washer'
              endAdornment={<InputAdornment position='end'>gpm</InputAdornment>}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  renderArray = (fieldsToRender, basePath, values) => {
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        <FieldArray name={basePath || null}>
          {({fields}) =>
            fields.map((name, index) => (
              <Grid item xs={12} key={index}>
                <ExpansionPanel expanded={selectn(`${name}.name`)(values) !== undefined}>
                  <ExpansionPanelSummary>
                    <Field
                      style={expansionDetails}
                      fullWidth
                      required
                      name={`${name}.name`}
                      component={MaterialInput}
                      type='text'
                      label='Enter a unique name identifier for this vehicle wash process'
                    />
                    {values[basePath] && values[basePath].length > 1 && (
                      <IconButton style={{padding: 'initial', height: '40px', width: '40px'}} onClick={() => fields.remove(index)} aria-label='Delete'>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={expansionDetails}>{fieldsToRender(values, name, basePath)}</ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
            ))
          }
        </FieldArray>
      </Grid>
    );
  };

  renderFacilityForm = (values, name, basePath) => {
    const year = values.year;
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        {basePath === 'conveyor' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${name}.type`}
              component={Select}
              label='Conveyor type used for vehicle washes'
            >
              <MenuItem value='friction'>Friction Washing</MenuItem>
              <MenuItem value='frictionless'>Frictionless Washing</MenuItem>
            </Field>
          </Grid>
        )}
        {this.renderWaterMeteredControl(`${name}`, values, true)}
        {selectn(`${name}.metered`)(values) === 'yes' && (
          <Grid item xs={12}>
            <Field
              fullWidth
              required
              name={`${name}.water_usage`}
              component={MaterialInput}
              type='text'
              mask={ONE_DECIMAL_MASK}
              label={`${year} total annual water use for all vehicle wash facilities on campus`}
              endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
            />
          </Grid>
        )}
        {selectn(`${name}.metered`)(values) === 'no' && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                fullWidth
                required
                name={`${name}.vpw`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='Average number of vehicles washed per week'
                endAdornment={<InputAdornment position='end'>Vehicles</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                fullWidth
                required
                name={`${name}.wpy`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='Total number of weeks per year vehicles are washed '
                endAdornment={<InputAdornment position='end'>Washes</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                fullWidth
                required
                name={`${name}.gpv`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label='Estimated water use per vehicle'
                endAdornment={<InputAdornment position='end'>gpv</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                fullWidth
                required
                name={`${name}.recycled`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='Percentage of water recycled/reused (if any)'
                endAdornment={<InputAdornment position='end'>%</InputAdornment>}
              />
            </Grid>
          </Fragment>
        )}
      </Grid>
    );
  };

  renderWaterMeteredControl = (basePath, values) => (
    <Grid item xs={12}>
      <Field formControlProps={{fullWidth: true}} required name={`${basePath}.metered`} component={Select} label='Is the water use metered?'>
        <MenuItem value='yes'>Yes</MenuItem>
        <MenuItem value='no'>No</MenuItem>
      </Field>
      {selectn(`${basePath}.metered`)(values) == 'yes' && this.clearValues(['vpw', 'wpy', 'gpv', 'recycled'], basePath, values)}
      {selectn(`${basePath}.metered`)(values) == 'no' && this.clearValues(['water_usage'], basePath, values)}
    </Grid>
  );

  renderFormInputs = (values, valid) => {
    const elements = [];

    if (selectn(`vehicle_wash.vw_facilities`)(values) === true) {
      return (
        <Fragment>
          <Grid item xs={12}>
            <ExpansionPanel style={expansionPanel} expanded={selectn(`vehicle_wash.auto_wash_facilities`)(values) === true}>
              <ExpansionPanelSummary>
                <Field
                  name='vehicle_wash.auto_wash_facilities'
                  label='This campus has individual in-bay automated vehicle wash facilities'
                  component={ToggleAdapter}
                  type='checkbox'
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={expansionDetails}>{this.renderArray(this.renderFacilityForm, 'auto_wash', values)}</ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {selectn(`vehicle_wash.auto_wash_facilities`)(values) == false && this.clearSection(values, 'auto_wash')}
          <Grid item xs={12}>
            <ExpansionPanel style={expansionPanel} expanded={selectn(`vehicle_wash.conveyor_facilities`)(values) === true}>
              <ExpansionPanelSummary>
                <Field
                  name='vehicle_wash.conveyor_facilities'
                  label='This campus has conveyor type friction washing or frictionless washing vehicle wash facilities'
                  component={ToggleAdapter}
                  type='checkbox'
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={expansionDetails}>{this.renderArray(this.renderFacilityForm, 'conveyor', values)}</ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {selectn(`vehicle_wash.conveyor_facilities`)(values) == false && this.clearSection(values, 'conveyor')}
          <Grid item xs={12}>
            <ExpansionPanel style={expansionPanel} expanded={selectn(`vehicle_wash.wash_pad_pressure_washer_facilities`)(values) === true}>
              <ExpansionPanelSummary>
                <Field
                  name='vehicle_wash.wash_pad_pressure_washer_facilities'
                  label='This campus has self-service wash pad(s) that use a pressure washer'
                  component={ToggleAdapter}
                  type='checkbox'
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={expansionDetails}>
                {this.renderArray(this.renderWashpadForm, 'wash_pad_pressure_washer', values)}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {selectn(`vehicle_wash.wash_pad_pressure_washer_facilities`)(values) == false && this.clearSection(values, 'wash_pad_pressure_washer')}
          <Grid item xs={12}>
            <ExpansionPanel style={expansionPanel} expanded={selectn(`vehicle_wash.wash_pad_open_hose_facilities`)(values) === true}>
              <ExpansionPanelSummary>
                <Field
                  name='vehicle_wash.wash_pad_open_hose_facilities'
                  label='This campus has self-service wash pad(s) that use an open hose'
                  component={ToggleAdapter}
                  type='checkbox'
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={expansionDetails}>
                {this.renderArray(this.renderWashpadForm, 'wash_pad_open_hose', values)}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {selectn(`vehicle_wash.wash_pad_open_hose_facilities`)(values) == false && this.clearSection(values, 'wash_pad_open_hose')}
          <Grid item xs={12}>
            <ExpansionPanel style={expansionPanel} expanded={selectn(`vehicle_wash.large_facilities`)(values) === true}>
              <ExpansionPanelSummary>
                <Field
                  name='vehicle_wash.large_facilities'
                  label='This campus has vehicle wash facilities for large vehicles such as semi-trucks, tracked vehicles, or aircraft?'
                  component={ToggleAdapter}
                  type='checkbox'
                />
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={expansionDetails}>
                {this.renderArray(this.renderFacilityForm, 'large_vehicles', values)}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          {selectn(`vehicle_wash.large_facilities`)(values) == false && this.clearSection(values, 'large_vehicles')}
          <Grid item xs={12} sm={4}>
            <Field
              fullWidth
              disabled
              name='vehicle_wash.water_use'
              helperText='Water use'
              mask={DEFAULT_DECIMAL_MASK}
              component={MaterialInput}
              type='text'
              helperText={
                valid || selectn('vehicle_wash.water_use')(values) == null
                  ? null
                  : "Enter required fields and click 'Calculate Water Use' button to update value."
              }
              meta={{
                visited: true
              }}
              endAdornment={<InputAdornment position='end'>kgal</InputAdornment>}
            />
          </Grid>
        </Fragment>
      );
    }
    return elements;
  };

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  parseModule = (fields, module) => {
    fields.forEach(field => {
      const {name} = field;
      if (!(name in module) && module.vehicle_wash) {
        let startingValues;
        if (name === 'wash_pad_pressure_washer' && module.vehicle_wash.wash_pads.type === 'pressure_washer') {
          startingValues = {...module.vehicle_wash.wash_pads};
          module.vehicle_wash.wash_pad_pressure_washer_facilities = true;
        } else if (name === 'wash_pad_open_hose' && module.vehicle_wash.wash_pads.type === 'open_hose') {
          startingValues = {...module.vehicle_wash.wash_pad_open_hose_facilities};
          module.vehicle_wash.wash_pad_open_hose_facilities = true;
        } else {
          startingValues = module.vehicle_wash[name] ? {...module.vehicle_wash[name]} : {};
        }
        module[name] = [startingValues];
      } else if (module.vehicle_wash === undefined) {
        module[name] = [{}];
      }
    });
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.vehicle_wash : {};
    const fields = [
      {name: 'auto_wash', display_name: 'In-Bay Automated', check: 'auto_wash_facilities'},
      {name: 'conveyor', display_name: 'Friction or Frictionless', check: 'conveyor_facilities'},
      {name: 'wash_pad_open_hose', display_name: 'Open Hose', check: 'wash_pad_open_hose_facilities'},
      {name: 'wash_pad_pressure_washer', display_name: 'Pressure Washer', check: 'wash_pad_pressure_washer_facilities'},
      {name: 'large_vehicles', display_name: 'Large Vehicle', check: 'large_facilities'}
    ];
    this.parseModule(fields, module);
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Vehicle Wash
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information only for vehicle wash facilities that use potable water on the campus
        </Typography>
        <Form
          noValidate
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
              mutators: {push}
            }
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                <Grid item xs={12}>
                  <FormControlLabel
                    label='My campus has vehicle wash facilities?'
                    control={
                      <Field
                        name='vehicle_wash.vw_facilities'
                        component={Checkbox}
                        indeterminate={selectn(`vehicle_wash.vw_facilities`)(values) === undefined}
                        type='checkbox'
                      />
                    }
                  />
                </Grid>
                {this.renderFormInputs(values, valid)}
                <Grid item xs={12}>
                  {fields.map(field => {
                    const {check, name, display_name} = field;
                    if (values.vehicle_wash && values.vehicle_wash[check]) {
                      return (
                        <Button key={check} variant='contained' color='primary' onClick={() => push(name, {})} style={{margin: '5px'}}>
                          {`Add ${display_name} process`}
                        </Button>
                      );
                    }
                  })}
                  {selectn(`vehicle_wash.vw_facilities`)(values) === false || selectn(`vehicle_wash.vw_facilities`)(values) === undefined ? null : (
                    <Fragment>
                      <Button variant='contained' type='submit' style={{margin: '5px'}} onClick={() => this.calculateWaterUse(values, valid)}>
                        Calculate Water Use
                      </Button>
                      <Button
                        variant='contained'
                        type='button'
                        onClick={() => submitAlert(valid, createOrUpdateCampusModule, values)}
                        style={{margin: '5px'}}
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
              {/* <pre>{JSON.stringify(values, 0, 2)}</pre> */}
            </form>
          )}
        />
      </Fragment>
    );
  }
}

export default VehicleWashForm;
