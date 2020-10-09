import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Link from '@material-ui/core/Link';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert, FormRulesListener} from '../shared/sharedFunctions';
import {fabStyle, DEFAULT_NUMBER_MASK, ONE_DECIMAL_MASK, numberFormat, mediaQuery, linkStyle} from '../shared/sharedStyles';
import formValidation from './SteamBoilersForm.validation';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem} from '@material-ui/core';
import CocReferenceGuide from '../CoolingTowers/CocReferenceGuide';
import Handbook from '../shared/handbookLink';

let expansionPanel = mediaQuery();

const focusOnError = createDecorator();

const steamBoilerCalculation = boiler => {
  let waterRegeneration = toNumber(boiler.water_regeneration);
  let regenerationPerWeek = toNumber(boiler.regeneration_per_week);
  let operatingWeeks = toNumber(boiler.operating_weeks);
  let steamGeneration = toNumber(boiler.steam_generation);
  let cyclesConcentration = toNumber(boiler.cycles_concentration);
  let condensatePercentage = toNumber(boiler.condensate_percentage);
  let hoursWeek = toNumber(boiler.hours_week);

  let softenerPerformance = (waterRegeneration * regenerationPerWeek * operatingWeeks) / 1000;
  let steamGenerationRate = steamGeneration / 8.314;
  let feedwaterRate = steamGenerationRate / (1 - 1 / cyclesConcentration);
  let totalWaterUse = [[feedwaterRate - (steamGenerationRate * condensatePercentage) / 100] * (hoursWeek * operatingWeeks)] / 1000;

  let total = softenerPerformance + totalWaterUse;
  return total;
};

const toNumber = value => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};

class SteamBoilersForm extends React.Component {
  constructor(props) {
    let waterUse = selectn(`campus.modules.steam_boilers.water_use`)(props);
    super(props);
    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : ''
    };
    this.calculateWaterUse = this.calculateWaterUse.bind(this);
  }

  toggleCocVisibility = () => {
    this.setState({cocReferenceGuideVisible: !this.state.cocReferenceGuideVisible});
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
    values.steam_boilers.map((boiler, index) => {
      if (boiler) {
        if (boiler.is_metered == 'yes') {
          total += toNumber(boiler.annual_water_use);
        } else {
          total += steamBoilerCalculation(boiler);
        }
      }
    });
    let formatTotal = numberFormat.format(total);
    values.water_use = formatTotal;

    this.setState({
      waterUse: ' Water Use: ' + formatTotal + ' kgal'
    });
  };

  onSubmit = values => {};

  weeksPerYear = basePath => {
    return (
      <Grid item xs={12}>
        <Field
          formControlProps={{fullWidth: true}}
          required
          name={`${basePath}.operating_weeks`}
          component={MaterialInput}
          type='text'
          mask={DEFAULT_NUMBER_MASK}
          label='Number of weeks per year the system is operating'
          endAdornment={<InputAdornment position='end'>weeks</InputAdornment>}
        ></Field>
      </Grid>
    );
  };

  softener = (values, basePath) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.water_regeneration`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Amount of water used between regenerations'
            endAdornment={<InputAdornment position='end'>gal</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.regeneration_per_week`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Number of times the system regenerates in 1 week'
          ></Field>
        </Grid>
        {this.weeksPerYear(basePath)}
      </Fragment>
    );
  };

  noSoftner = (values, basePath) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.steam_generation`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Steam generation rate'
            endAdornment={<InputAdornment position='end'>lb./hr.</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.condensate_percentage`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Percentage of condensate that is returned'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          ></Field>
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.cycles_concentration`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Cycles of concentration'
            endAdornment={<InputAdornment position='end'>cycles</InputAdornment>}
          ></Field>
        </Grid>
        <span>
          <Typography variant='body2' gutterBottom>
            <InfoIcon style={{color: '#F8A000', margin: '33px 12px -5px 6px'}} />
            Click{' '}
            <Link style={{...linkStyle, cursor: 'pointer'}} onClick={() => this.toggleCocVisibility()}>
              here
            </Link>{' '}
            for help with determining the cycles of concentration in the system.
          </Typography>
        </span>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.hours_week`}
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            label='Number of hours per week the system operates'
            endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
          ></Field>
        </Grid>
        {this.weeksPerYear(basePath)}
      </Fragment>
    );
  };

  nonMetered = (values, basePath) => {
    const softenerUse = selectn(`${basePath}.softener`)(values);
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true, required: true}}
            name={`${basePath}.softener`}
            component={Select}
            label='Does the system have a softener or water conditioning system?'
          >
            <MenuItem value='yes'>Yes</MenuItem>
            <MenuItem value='no'>No</MenuItem>
          </Field>
        </Grid>

        {softenerUse === 'no' && this.noSoftner(values, basePath)}
        {softenerUse === 'no' && this.clearValues(['water_regeneration', 'regeneration_per_week'], basePath, values)}
        {softenerUse === 'yes' && this.softener(values, basePath)}
        {softenerUse === 'yes' &&
          this.clearValues(['steam_generation', 'condensate_percentage', 'cycles_concentration', 'hours_week'], basePath, values)}
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
        {isMetered == 'yes' &&
          this.clearValues(
            [
              'water_regeneration',
              'regeneration_per_week',
              'steam_generation',
              'condensate_percentage',
              'cycles_concentration',
              'hours_week',
              'softener',
              'operating_weeks'
            ],
            basePath,
            values
          )}
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
            formControlProps={{fullWidth: true, required: true}}
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

  boilerSystemTypes = (values, valid) => {
    if (!values.has_steam_boilers) {
      return null;
    }
    return (
      <Fragment>
        <FieldArray name='steam_boilers'>
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
                      label='Enter a unique name identifier for this steam boiler system (such as the building name/number it is associated).'
                    />
                    {values.steam_boilers && values.steam_boilers.length > 1 && (
                      <IconButton
                        style={{padding: 'initial', height: '40px', width: '40px'}}
                        onClick={() => fields.remove(index)}
                        aria-label='Delete'
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
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
            helperText={valid || values.water_use == null ? null : "Enter required fields and click 'Calculate Water Use' button to update value."}
            meta={{
              visited: true
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
    const module = campus ? campus.modules.steam_boilers : {};
    module.year = campus.year;
    if (!('steam_boilers' in module)) {
      module.steam_boilers = [];
      module.steam_boilers.push({});
    }
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          Steam Boilers
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information only for steam boilers that use potable water on the campus
        </Typography>
        <Handbook sectionName={'Steam Boilers'}/>
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
              mutators: {push, pop}
            }
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16}>
                <Grid item xs={12}>
                  <FormControlLabel
                    label='My campus has steam boilers?'
                    control={
                      <Field name='has_steam_boilers' component={Checkbox} indeterminate={values.has_steam_boilers === undefined} type='checkbox' />
                    }
                  />
                </Grid>
                {this.boilerSystemTypes(values, valid)}
                <Grid item xs={12}>
                  {values.has_steam_boilers === true && (
                    <Button variant='contained' color='primary' onClick={() => push('steam_boilers', {})}>
                      Add Another Steam Boiler
                    </Button>
                  )}
                  {values.has_steam_boilers === false || values.has_steam_boilers === undefined ? null : (
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
        <Dialog open={this.state.cocReferenceGuideVisible} onClose={this.toggleCocVisibility} maxWidth='lg' aria-labelledby='form-dialog-title'>
          <DialogTitle id='form-dialog-title'>
            Cycles of Concentration Help
            <CloseIcon color='action' onClick={() => this.toggleCocVisibility()} style={{float: 'right', cursor: 'pointer'}} />
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Reference the tables below for help with determining the cycles of concentration.</DialogContentText>
            <CocReferenceGuide />
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
}

export default SteamBoilersForm;
