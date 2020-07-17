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
import formValidation from './OccupancyForm.validation';

import {Grid, Button, InputAdornment, MenuItem, Link} from '@material-ui/core';

let expansionPanel = mediaQuery();

const toNumber = (value) => {
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

  onSubmit = (e) => {};

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
    return (
      <Grid container alignItems='flex-start' spacing={16}>
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
        {selectn(`${basePath}.weekend_occupancy`)(values) > 0 && (
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
      </Grid>
    );
  };

  renderAuditArray = (values) => {
    const auditedBuildings = values.audits.map((audit) => audit.name);
    if(values.buildings && values.buildings.length == 0) {
      return;
    } 
    return (
      <FieldArray name='audits'>
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
                    label='Please select the building that you would like to audit.'
                  >
                    {values.buildings.map((building) => {
                      let disabled = auditedBuildings.indexOf(building.name) > -1;
                      return (
                        <MenuItem disabled={disabled} value={building.name}>
                          {building.name}
                        </MenuItem>
                      );
                    })}
                  </Field>
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
            <Grid item xs={12}>
              <Field
                formControlProps={{fullWidth: true}}
                required
                name={`${basePath}.individual_audit`}
                component={Select}
                label='Do you want to enter occupancy data for individual buildings that have been audited?'
              >
                <MenuItem value='yes'>Yes</MenuItem>
                <MenuItem value='no'>No</MenuItem>
              </Field>
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
        {selectn('plumbing.facility.individual_audit')(values) === 'yes' && this.renderAuditArray(values)}
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
    const showAddAuditButton = selectn('plumbing.facility.individual_audit')(values) === 'yes' && moreBuildings;
    if (showAddAuditButton) {
      return (
        <Button variant='contained' color='primary' onClick={() => push('audits', {})}>
          Add Another building to audit
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
              mutators: {push},
            },
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
              <pre>{JSON.stringify(values, 0, 2)}</pre>
            </form>
          )}
        />
      </Fragment>
    );
  }
}

export default OccupancyForm;
