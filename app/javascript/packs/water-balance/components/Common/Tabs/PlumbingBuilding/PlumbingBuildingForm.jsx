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
import {fabStyle, DEFAULT_DECIMAL_MASK, mediaQuery, expansionDetails} from '../shared/sharedStyles';
import formValidation from './PlumbingBuildingForm.validation';

import {Fab, Grid, Button, InputAdornment, MenuItem} from '@material-ui/core';

let expansionPanel = mediaQuery();

const focusOnError = createDecorator();

class PlumbingForm extends React.Component {
  constructor(props) {
    super(props);
    let waterUse = selectn(`campus.modules.plumbing.plumbing.water_usage`)(props);
    this.state = {
      waterUse: waterUse ? ' Water Use: ' + waterUse + ' kgal' : '',
    };
    // this.calculateWaterUse = this.calculateWaterUse.bind(this);
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
    if (values['plumbing'][name] != undefined) {
      if (!(Object.keys(values['plumbing'][name]).length === 0)) {
        values['plumbing'][name] = null;
      }
    }
  };

  onSubmit = (values) => {};

  flushRate = (basePath, values) => {
    const source = selectn(`${basePath}.name`)(values);
    const flowRate = selectn(`${basePath}.shower_flow_rate`)(values);
    const buildingType = source && values.buildings.find((building) => building.name === source).primary_building_type;

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
              <MenuItem value='Yes'>Yes</MenuItem>
              <MenuItem value='No'>No</MenuItem>
            </Field>
          </Grid>
        )}
        {selectn(`${basePath}.urinals`)(values) === 'Yes' && (
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

  renderFacilityTypes = (values) => {
    const facilities = values.fixtures.map((facility) => facility.name);
    return (
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
                    {values.buildings.map((building) => {
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
              mutators: {push, pop},
            },
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
