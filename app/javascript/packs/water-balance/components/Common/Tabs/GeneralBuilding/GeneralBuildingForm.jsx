import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import createDecorator from 'final-form-focus';
import {Form, Field} from 'react-final-form';
import {FieldArray} from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import {requireFieldSubmitAlert, FormRulesListener} from '../shared/sharedFunctions';
import {mediaQuery, DEFAULT_DECIMAL_MASK, DEFAULT_NUMBER_MASK} from '../shared/sharedStyles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import selectn from 'selectn';
import MaterialDatePicker from '../../MaterialDatePicker';
import formValidation from './GeneralBuildingForm.validation';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import {Select} from 'final-form-material-ui';
import {Grid, Button, MenuItem, InputAdornment} from '@material-ui/core';
import MaterialInput from '../../MaterialInput';

let expansionPanel = mediaQuery();
const focusOnError = createDecorator();

class GeneralBuildingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderBuildingInfo = (values, basePath) => {
    return (
      <Grid container alignItems='flex-start' spacing={16}>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name={`${basePath}.primary_building_type`}
            label='Primary building type (select the most appropriate building type)'
            component={Select}
          >
            <MenuItem value='hotel'>Hotel/Motel</MenuItem>
            <MenuItem value='barracks'>Barracks/Dormitory</MenuItem>
            <MenuItem value='family'>Family Housing</MenuItem>
            <MenuItem value='Hospital'>Hospital</MenuItem>
            <MenuItem value='clinic'>Medical Clinic</MenuItem>
            <MenuItem value='other'>Other Building Type</MenuItem>
          </Field>
        </Grid>
        {selectn(`${basePath}.primary_building_type`)(values) === 'other' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name={`${basePath}.building_occupants`}
              label='Building occupants stationary or transient'
              component={Select}
            >
              <MenuItem value='stationary'>Stationary</MenuItem>
              <MenuItem value='transient'>Transient</MenuItem>
            </Field>
          </Grid>
        )}
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.footage`}
            label='Square footage of building'
            component={MaterialInput}
            type='text'
            mask={DEFAULT_DECIMAL_MASK}
            endAdornment={<InputAdornment position='end'>ft²</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.construction_year`}
            label='Date of construction'
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            endAdornment={<InputAdornment position='end'>year</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.renovations_year`}
            label='Year of last major water-related renovations'
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            endAdornment={<InputAdornment position='end'>year</InputAdornment>}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.renovations_list`}
            label='List types of water-related renovations'
            component={MaterialInput}
            type='text'
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.building_address`}
            label='Building address'
            component={MaterialInput}
            type='text'
          />
        </Grid>
        <Grid item xs={12}>
          <Field formControlProps={{fullWidth: true}} name='evaluator_name' label='Evaluator name' component={MaterialInput} type='text' />
        </Grid>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            name={`${basePath}.survey_date`}
            label='Date of survey'
            component={MaterialDatePicker}
            dateFormat='MM/DD/YYYY'
          />
        </Grid>
      </Grid>
    );
  };

  renderBuildingArray = (values) => {
    return (
      <Fragment>
        <FieldArray name='buildings'>
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
                      label='Enter a unique name identifier for this building.'
                    />
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
                  <ExpansionPanelDetails>{this.renderBuildingInfo(values, `${name}`)}</ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
            ))
          }
        </FieldArray>
      </Fragment>
    );
  };

  onSubmit = (e) => {};

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.plumbing : {};
    if (!('buildings' in module)) {
      module.buildings = [];
      module.buildings.push({});
    }
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          General Building
        </Typography>
        <Typography variant='body2' gutterBottom style={{marginBottom: '23px'}}>
          Enter the following for general building information.
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
                {this.renderBuildingArray(values, valid)}
                <Grid item xs={12}>
                  <Button style={{marginLeft: '10px'}} variant='contained' color='primary' onClick={() => push('buildings', {})}>
                    Add Another Building
                  </Button>
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

export default GeneralBuildingForm;
