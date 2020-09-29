import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import DialogContentText from '@material-ui/core/DialogContentText';
import {fabStyle, ONE_DECIMAL_MASK, numberFormat, mediaQuery} from '../shared/sharedStyles';
import MaterialInput from '../../MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import createCalculatorDecorator from 'final-form-calculate';
import {submitAlert, FormRulesListener, toNumber} from '../shared/sharedFunctions';
import MaterialDatePicker from '../../MaterialDatePicker';
import moment from 'moment';
import InfoIcon from '@material-ui/icons/Info';

import formValidation from './CoolingTowers.validation';
import {Fab, Grid, Button, FormControlLabel, InputAdornment, MenuItem} from '@material-ui/core';
import FullLoadReferenceGuide from './FullLoadReferenceGuide';
import CocReferenceGuide from './CocReferenceGuide';

let expansionPanel = mediaQuery();

const calculator = createCalculatorDecorator({
  field: /\.*_date/,
  updates: (value, name, allValues) => {
    if (allValues.cooling_towers) {
      allValues.cooling_towers.forEach(cooling_tower => {
        if (cooling_tower.start_date && cooling_tower.end_date) {
          const startDateMoment = moment(cooling_tower.start_date);
          const endDateMoment = moment(cooling_tower.end_date);
          const daysBetween = endDateMoment.diff(startDateMoment, 'days').toString();
          if (daysBetween > 0) {
            cooling_tower.days_per_year = daysBetween;
          } else {
            cooling_tower.days_per_year = null;
          }
        }
      });
    }
    return {};
  }
});

const focusOnError = createDecorator();

const coolingTowerCalculation = values => {
  let annualOperatingHours = 0;
  const evaporationRate = 1.65;
  if (values.parameters_known === 'yes') {
    annualOperatingHours = values.days_per_year * values.hours_per_day * values.cooling_season_capacity_used/100;
  } else {
    let percentFullLoad = values.full_load_cooling;
    annualOperatingHours = (percentFullLoad / 100) * 8760;
  }
  const evaporationWaterUse = annualOperatingHours * values.tonnage * evaporationRate;
  const blowDown = evaporationWaterUse / (values.cycles - 1);
  let totalWaterUse = (evaporationWaterUse + blowDown) / 1000;
  return totalWaterUse;
};

class CoolingTowersForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.cooling_towers.water_use`)(props);
    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : '',
      referenceGuideVisible: false
    };
    this.calculateWaterUse = this.calculateWaterUse.bind(this);
  }

  toggleFullLoadDialogVisibility = () => {
    this.setState({referenceGuideVisible: !this.state.referenceGuideVisible});
  };

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
      waterUse: ' Water Use: ' + formatTotal + ' kgal'
    });
  };

  onSubmit = values => {};
  renderParameters = (basePath, values) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.start_date`}
            component={MaterialDatePicker}
            dateFormat='MM/DD/YYYY'
            label='Cooling season start date'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.end_date`}
            component={MaterialDatePicker}
            dateFormat='MM/DD/YYYY'
            label='Cooling season end date'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            disabled
            name={`${basePath}.days_per_year`}
            component={MaterialInput}
            helperText='Number of days per year the system is operating'
            endAdornment={<InputAdornment position='end'>days</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.hours_per_day`}
            component={MaterialInput}
            mask={ONE_DECIMAL_MASK}
            label='Average hours per day the system operates'
            endAdornment={<InputAdornment position='end'>hours</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.cooling_season_capacity_used`}
            component={MaterialInput}
            mask={ONE_DECIMAL_MASK}
            label='Typical percent of capacity used during the cooling season'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          />
        </Grid>
      </Fragment>
    );
  };

  renderHandbook = (basePath, values) => {
    return (
      <Fragment>
        <span>
          <Typography variant='body2' gutterBottom>
            <InfoIcon style={{color: '#F8A000', margin: '33px 12px -5px 6px'}} />
            Click{' '}
            <Link style={{cursor: 'pointer'}} onClick={() => this.toggleFullLoadDialogVisibility()}>
              here
            </Link>{' '}
            for help calculating percent of full load cooling hours per year.
          </Typography>
        </span>
        <Grid item xs={12}>
          <Field
            style={{marginTop: '0px'}}
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.full_load_cooling`}
            component={MaterialInput}
            mask={ONE_DECIMAL_MASK}
            label='Percent of full load cooling hours per year'
            endAdornment={<InputAdornment position='end'>%</InputAdornment>}
          />
        </Grid>
      </Fragment>
    );
  };

  nonMetered = (basePath, values) => {
    const parametersKnown = selectn(`${basePath}.parameters_known`)(values);
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.tonnage`}
            component={MaterialInput}
            mask={ONE_DECIMAL_MASK}
            label='Total tonnage of the chillers associated with the system'
            endAdornment={<InputAdornment position='end'>tons</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.cycles`}
            component={MaterialInput}
            mask={ONE_DECIMAL_MASK}
            label='Cycles of concentration for the system'
            endAdornment={<InputAdornment position='end'>cycles</InputAdornment>}
          />
        </Grid>
        <span>
          <Typography variant='body2' gutterBottom>
            <InfoIcon style={{color: '#F8A000', margin: '33px 12px -5px 6px'}} />
            Click{' '}
            <Link style={{cursor: 'pointer'}} onClick={() => this.toggleCocVisibility()}>
              here
            </Link>{' '}
            for help with determining the cycles of concentration in the system.
          </Typography>
        </span>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true, required: true}}
            name={`${basePath}.parameters_known`}
            component={Select}
            label='Are operational parameters known (days and hours in operation)?'
          >
            <MenuItem value='yes'>Yes</MenuItem>
            <MenuItem value='no'>No</MenuItem>
          </Field>
        </Grid>
        {parametersKnown == 'no' && this.clearValues(['days_per_year', 'start_date', 'end_date', 'hours_per_day', 'cooling_season_capacity_used'], basePath, values)}
        {parametersKnown == 'yes' && this.clearValues(['full_load_cooling'], basePath, values)}
        {selectn(`${basePath}.parameters_known`)(values) == 'yes' && this.renderParameters(basePath, values)}
        {selectn(`${basePath}.parameters_known`)(values) == 'no' && this.renderHandbook(basePath)}
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
            ['tonnage', 'cycles', 'days_per_year', 'start_date', 'end_date', 'hours_per_day', 'cooling_season_capacity_used', 'parameters_known', 'full_load_cooling'],
            basePath,
            values
          )}
        {isMetered == 'no' && this.clearValues(['annual_water_use'], basePath, values)}
        {isMetered == 'no' && this.nonMetered(basePath, values)}
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

  coolingTowersTypes = (values, valid) => {
    if (!values.has_cooling_towers) {
      return null;
    }
    return (
      <Fragment>
        <FieldArray name='cooling_towers'>
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
                      label='Enter a unique name identifier for this cooling tower system (such as the building name/number it is associated).'
                    />
                    {values.cooling_towers && values.cooling_towers.length > 1 && (
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

    const module = campus ? campus.modules.cooling_towers : {};
    module.year = campus.year;
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
          Enter the following information only for cooling towers that use potable water on the campus
        </Typography>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          validate={formValidation}
          mutators={{...arrayMutators}}
          decorators={[calculator, focusOnError]}
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
                    label='My campus has cooling towers?'
                    control={
                      <Field name='has_cooling_towers' component={Checkbox} indeterminate={values.has_cooling_towers === undefined} type='checkbox' />
                    }
                  />
                </Grid>
                {this.coolingTowersTypes(values, valid)}
                <Grid item xs={12}>
                  {values.has_cooling_towers === true && (
                    <Button style={{marginLeft: '10px'}} variant='contained' color='primary' onClick={() => push('cooling_towers', {})}>
                      Add Another Cooling Tower
                    </Button>
                  )}
                  {values.has_cooling_towers === false || values.has_cooling_towers === undefined ? null : (
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
        <Dialog
          open={this.state.referenceGuideVisible}
          onClose={this.toggleFullLoadDialogVisibility}
          maxWidth='lg'
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>
            Full Load Cooling Hours Help
            <CloseIcon color='action' onClick={() => this.toggleFullLoadDialogVisibility()} style={{float: 'right', cursor: 'pointer'}} />
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              To determine the percent of full-load cooling hours to be entered into the tool, identify the climate zone the campus is located in from
              the figure. The table can then be used to select the percent full-load cooling hours based on the type of building the cooling tower is
              serving. See Section 3.5.2 Data Entry for Cooling Towers in the Handbook: Water Evaluation Tools.
            </DialogContentText>
            <FullLoadReferenceGuide />
          </DialogContent>
        </Dialog>

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

export default CoolingTowersForm;
