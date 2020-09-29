import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import {Select} from 'final-form-material-ui';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {requireFieldSubmitAlert, FormRulesListener, ToggleAdapter} from '../shared/sharedFunctions';
import {DEFAULT_NUMBER_MASK, DEFAULT_DECIMAL_MASK, expansionDetails, mediaQuery} from '../shared/sharedStyles';
import {buildingTypeMap, lodgingTypes} from '../shared/sharedConstants';
import formValidation from './OccupancyForm.validation';
import WarningIcon from '@material-ui/icons/Warning';

import {Grid, Button, InputAdornment, MenuItem} from '@material-ui/core';

let expansionPanel = mediaQuery();

const toNumber = value => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};

const focusOnError = createDecorator();

class OccupancyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  calculateTotalOccupants = (values, basePath) => {
    values.plumbing.hospital.total_occupants =
      toNumber(selectn(`${basePath}.inpatient_per_day`)(values)) + toNumber(selectn(`${basePath}.daily_staff`)(values));
  };

  clearValues = (clearValues, basePath, values) => {
    let field = basePath.replace('plumbing.', '');
    for (let i = 0; i < clearValues.length; i++) {
      values['plumbing'][field][clearValues[i]] = null;
    }
  };

  clearSection = (values, name) => {
    if (values['plumbing'][name] != undefined) {
      if (!(Object.keys(values['plumbing'][name]).length === 0)) {
        values['plumbing'][name] = null;
      }
    }
  };

  clearValuesArray = (clearValues, basePath, values) => {
    let field = basePath.split('[');
    let path = field[0];
    let index = field[1].replace(']', '');
    for (let i = 0; i < clearValues.length; i++) {
      if (values[path] != undefined) {
        values[path][index][clearValues[i]] = null;
      }
    }
  };

  onSubmit = e => {};

  onsiteLodging = (basePath, values) => {
    return (
      <Grid item xs={12}>
        <Field
          style={expansionDetails}
          formControlProps={{fullWidth: true}}
          required
          name={`${basePath}.total_population`}
          component={MaterialInput}
          type='text'
          mask={DEFAULT_NUMBER_MASK}
          label='What is the estimated monthly average population in all on-site lodging?'
        ></Field>
      </Grid>
    );
  };

  renderAudit = (values, basePath) => {
    const name = selectn(`${basePath}.name`)(values);
    const building = values.buildings.find(building => building.name === name);
    const primary_building_type = selectn('primary_building_type')(building);
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        {primary_building_type !== 'hospital' && primary_building_type !== 'clinic' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.weekday_occupancy`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={`What is the typical weekday occupancy for ${name}`}
              endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
            />
          </Grid>
        )}
        {(primary_building_type === 'clinic' || primary_building_type === 'hospital') && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.weekday_staff`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`What is the typical number of daily staff on a weekday for  ${name}`}
                endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.outpatient_weekday`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`What is the typical number of daily outpatient visits on a weekday for  ${name}`}
                endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
              />
            </Grid>
            {primary_building_type === 'hospital' && (
              <Grid item xs={12}>
                <Field
                  formControlProps={{fullWidth: true}}
                  required
                  name={`${basePath}.inpatient_weekday`}
                  component={MaterialInput}
                  type='text'
                  mask={DEFAULT_DECIMAL_MASK}
                  label={`What is the typical number of daily inpatients on a weekday  ${name}`}
                  endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
                />
              </Grid>
            )}
          </Fragment>
        )}
        {primary_building_type !== 'hospital' && primary_building_type !== 'clinic' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.weekend_occupancy`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={`What is the typical weekend occupancy for ${name}`}
              endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
            />
          </Grid>
        )}
        {(primary_building_type === 'clinic' || primary_building_type === 'hospital') && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.weekend_staff`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`What is the typical number of daily staff on a weekend day for ${name}`}
                endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.outpatient_weekend`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`What is the typical number of daily outpatient visits on a weekend day for  ${name}`}
                endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
              />
            </Grid>
            {primary_building_type === 'hospital' && (
              <Grid item xs={12}>
                <Field
                  formControlProps={{fullWidth: true}}
                  required
                  name={`${basePath}.inpatient_weekend`}
                  component={MaterialInput}
                  type='text'
                  mask={DEFAULT_DECIMAL_MASK}
                  label={`What is the typical number of daily inpatients on a weekend day for  ${name}`}
                  endAdornment={<InputAdornment position='end'>persons</InputAdornment>}
                />
              </Grid>
            )}
          </Fragment>
        )}
        {primary_building_type !== 'family' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.percent_male`}
              component={MaterialInput}
              type='text'
              mask={DEFAULT_DECIMAL_MASK}
              label={`What percentage of occupants in ${name} are male?`}
              endAdornment={<InputAdornment position='end'>%</InputAdornment>}
            />
          </Grid>
        )}
        {lodgingTypes.indexOf(primary_building_type) === -1 && (
          <Fragment>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.week_days_year`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`How many weekdays per year is ${name} open?`}
                endAdornment={<InputAdornment position='end'>days</InputAdornment>}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.week_days_hours`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label={`How many hours is ${name} typically open on a weekday?`}
                endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
              />
            </Grid>
            {(selectn(`${basePath}.weekend_occupancy`)(values) > 0 || primary_building_type === 'clinic' || primary_building_type === 'hospital') && (
              <Fragment>
                <Grid item xs={12}>
                  <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.weekend_days_year`}
                    component={MaterialInput}
                    type='text'
                    mask={DEFAULT_DECIMAL_MASK}
                    label={`How many weekend days per year is ${name} open?`}
                    endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.weekend_days_hours`}
                    component={MaterialInput}
                    type='text'
                    mask={DEFAULT_DECIMAL_MASK}
                    label={`How many hours is ${name} open on a weekend day?`}
                    endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
                  />
                </Grid>
              </Fragment>
            )}
          </Fragment>
        )}
        {primary_building_type == 'family' && this.clearValuesArray(['percent_male'], basePath, values)}
        {lodgingTypes.indexOf(primary_building_type) > -1 &&
          this.clearValuesArray(['week_days_year', 'week_days_hours', 'weekend_days_year', 'weekend_days_hours'], basePath, values)}
        {primary_building_type !== 'hospital' &&
          primary_building_type !== 'clinic' &&
          this.clearValuesArray(['weekday_staff', 'outpatient_weekday', 'weekend_staff', 'outpatient_weekend'], basePath, values)}
        {(primary_building_type === 'hospital' || primary_building_type === 'clinic') &&
          this.clearValuesArray(['weekday_occupancy', 'weekend_occupancy'], basePath, values)}
        {primary_building_type !== 'hospital' && this.clearValuesArray(['inpatient_weekday', 'inpatient_weekend'], basePath, values)}
      </Grid>
    );
  };

  clearOccupancyValues = (values, basePath) => {};

  renderAuditArray = values => {
    const auditedBuildings = values.audits.map(audit => audit.name);
    if (values.buildings && values.buildings.some(building => building.name == undefined)) {
      return (
        <Typography variant='body2' gutterBottom style={{...expansionPanel}}>
          <WarningIcon style={{color: '#F8A000', margin: '15px 7px -5px 11px'}} />
          Add buildings in the 'General Buildings' before adding building level occupancy information
        </Typography>
      );
    }
    return (
      <FieldArray name='audits'>
        {({fields}) =>
          fields.map((name, index) => (
            <Grid item xs={12} key={index}>
              <ExpansionPanel style={expansionPanel} expanded={selectn(`${name}.name`)(values) !== undefined}>
                <ExpansionPanelSummary>
                  <Field
                    formControlProps={{fullWidth: true, required: true}}
                    name={`${name}.name`}
                    component={Select}
                    label='Please select the building you would like to enter occupancy information for.'
                  >
                    {values.buildings.map(building => {
                      const disabled = auditedBuildings.indexOf(building.name) > -1;
                      return (
                        <MenuItem disabled={disabled} value={building.name}>
                          {`${building.name} (${buildingTypeMap[building.primary_building_type]})`}
                        </MenuItem>
                      );
                    })}
                  </Field>
                  {values.audits && values.audits.length > 1 && (
                    <IconButton
                      style={{
                        padding: 'initial',
                        height: '40px',
                        width: '40px'
                      }}
                      onClick={() => fields.remove(index)}
                      aria-label='Delete'
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>{this.renderAudit(values, `${name}`)}</ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          ))
        }
      </FieldArray>
    );
  };

  facility = (basePath, values, push) => {
    return (
      <ExpansionPanel style={expansionPanel} expanded={selectn(`${basePath}.total_population`)(values) !== undefined}>
        <ExpansionPanelSummary>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.total_population`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='What is the estimated overall average daily campus staff population for weekdays, excluding hospital/clinics?'
          ></Field>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container alignItems='flex-start' spacing={16}>
            <Grid item xs={12}>
              <Field
                style={expansionDetails}
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.total_population_weekends`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_NUMBER_MASK}
                label='What is the estimated overall average daily campus staff population for weekends, excluding hospital/clinics?'
              ></Field>
            </Grid>
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.male_population`}
                component={MaterialInput}
                type='text'
                mask={DEFAULT_DECIMAL_MASK}
                label='Estimate the percentage of overall population that is male'
                endAdornment={<InputAdornment position='end'>%</InputAdornment>}
              />
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  hospital = (basePath, values) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            style={expansionDetails}
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.days_per_year`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='How many days per year is the hospital/clinic open?'
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.daily_staff`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='What is the approximate number of hospital/clinic daily staff?'
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.administrative`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='Approximately what percentage of the hospital/clinic staff are administrative?'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.hospital_male`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='Approximately what percentage of hospital clinic staff are male?'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.staff_shift`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='What is the average length of a hospital/clinic staff shift?'
            endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.outpatient_visits`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='What is the average number of outpatient visits in a day?'
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.outpatient_duration`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            label='What is the average length of an outpatient visit?'
            endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.inpatient_per_day`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='What is the average number of inpatients in a day? Please put 0 if no overnight patients.'
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            disabled
            formControlProps={{fullWidth: true}}
            name={`${basePath}.total_occupants`}
            component={MaterialInput}
            mask={DEFAULT_NUMBER_MASK}
            helperText='Average daily hospital/clinic occupancy'
          ></Field>
        </Grid>
        {selectn(`${basePath}.inpatient_per_day`)(values) != undefined &&
          selectn(`${basePath}.daily_staff`)(values) != undefined &&
          this.calculateTotalOccupants(values, basePath)}
        {selectn(`${basePath}.inpatient_per_day`)(values) == 0 && this.clearValues(['shower_usage_inpatient'], basePath, values)}
      </Fragment>
    );
  };

  renderFacilityTypes = (values, push) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <ExpansionPanel style={{marginTop: '15px', ...expansionPanel}} expanded={selectn(`plumbing.has_onsite_lodging`)(values) === true}>
            <ExpansionPanelSummary>
              <Field
                name='plumbing.has_onsite_lodging'
                label='My campus has on-site lodging that utilizes the campus water supply (barracks, dormitory, hotel, family housing)?'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{paddingLeft: '40px', ...expansionDetails}}>
              {this.onsiteLodging('plumbing.lodging', values)}
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        {selectn(`plumbing.has_onsite_lodging`)(values) == false && this.clearSection(values, 'lodging')}
        <Grid item xs={12}>
          <ExpansionPanel style={expansionPanel} expanded={selectn(`plumbing.has_hospital`)(values) === true}>
            <ExpansionPanelSummary>
              <Field
                name='plumbing.has_hospital'
                label='My campus has a hospital or medical/dental clinic(s)?'
                component={ToggleAdapter}
                type='checkbox'
              />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{paddingLeft: '40px', ...expansionDetails}}>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.hospital('plumbing.hospital', values)}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        <Grid item xs={12}>
          {this.facility('plumbing.facility', values, push)}
        </Grid>
        {this.renderAuditArray(values)}
      </Fragment>
    );
  };

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  addAnotherAuditButton = (values, push) => {
    const moreBuildings = values.buildings && values.audits && values.buildings.length > values.audits.length;
    if (moreBuildings) {
      return (
        <Button variant='contained' color='primary' onClick={() => push('audits', {})}>
          Add Another Building
        </Button>
      );
    }
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.plumbing : {};
    if (!('audits' in module)) {
      module.audits = [];
      module.audits.push({});
    }
    if (!('fixtures' in module)) {
      module.fixtures = [];
      module.fixtures.push({});
    }
    if (!('buildings' in module)) {
      module.buildings = [];
      module.buildings.push({});
    }
    if (campus && module.buildings) {
      if (
        module.buildings.some(
          building =>
            building.primary_building_type == 'hotel' || building.primary_building_type == 'family' || building.primary_building_type == 'barracks'
        )
      ) {
        module.plumbing = module.plumbing ? module.plumbing : {};
        module.plumbing.has_onsite_lodging = true;
      }
      if (module.buildings.some(building => building.primary_building_type == 'clinic' || building.primary_building_type == 'hospital')) {
        module.plumbing = module.plumbing ? module.plumbing : {};
        module.plumbing.has_hospital = true;
      }
    }
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Occupancy
        </Typography>
        <Typography variant='body2' gutterBottom>
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
              mutators: {push}
            }
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                {this.renderFacilityTypes(values, valid, push)}
                <Grid item xs={12}>
                  {this.addAnotherAuditButton(values, push)}
                  <Button
                    variant='contained'
                    type='submit'
                    onClick={() => requireFieldSubmitAlert(valid, createOrUpdateCampusModule, values)}
                    style={{marginLeft: '10px'}}
                  >
                    Save
                  </Button>
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

export default OccupancyForm;
