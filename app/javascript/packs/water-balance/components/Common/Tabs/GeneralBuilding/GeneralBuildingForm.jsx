import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import createDecorator from 'final-form-focus';
import {Form, Field} from 'react-final-form';
import {submitAlert, FormRulesListener} from '../shared/sharedFunctions';
import {fabStyle, mediaQuery, DEFAULT_DECIMAL_MASK, DEFAULT_NUMBER_MASK} from '../shared/sharedStyles';
// import formValidation from './PlumbingForm.validation';
import {Select} from 'final-form-material-ui';
import {Fab, Grid, Button, MenuItem, InputAdornment} from '@material-ui/core';
import MaterialInput from '../../MaterialInput';

let expansionPanel = mediaQuery();
const focusOnError = createDecorator();

class PlumbingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderFacilityInfo = (values) => {
    return (
      <Fragment>
        <Grid item xs={12}>
          <Field
            formControlProps={{fullWidth: true}}
            required
            name='primary_building_type'
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
        {values.primary_building_type === 'other' && (
          <Grid item xs={12}>
            <Field
              formControlProps={{fullWidth: true}}
              required
              name='building_occupants'
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
            required
            name='footage'
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
            required
            name='construction_date'
            label='Date of construction'
            component={MaterialInput}
            type='text'
            mask={DEFAULT_NUMBER_MASK}
            endAdornment={<InputAdornment position='end'>year</InputAdornment>}
          ></Field>
        </Grid>
      </Fragment>
    );
  };

  onSubmit = (values) => {};

  updateIsDirty = (dirty, updateParent) => {
    if (dirty && this.state.isDirty != true) {
      this.setState({isDirty: true});
      updateParent();
    }
  };

  render() {
    const {createOrUpdateCampusModule, campus, applyRules, updateParent} = this.props;
    const module = campus ? campus.modules.plumbing : {};
    return (
      <Fragment>
        <Typography variant='h5' gutterBottom>
          General Building
        </Typography>
        <Typography variant='body2' gutterBottom>
          Enter the following information for general building information.
        </Typography>
        <Form
          onSubmit={this.onSubmit}
          initialValues={module}
          // validate={formValidation}
          decorators={[focusOnError]}
          render={({handleSubmit, reset, submitting, pristine, dirty, values, valid}) => (
            <form onSubmit={handleSubmit} noValidate>
              <Grid container alignItems='flex-start' spacing={16} style={expansionPanel}>
                {this.renderFacilityInfo(values, valid)}
              </Grid>
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
              {this.updateIsDirty(dirty, updateParent)}
              <FormRulesListener handleFormChange={applyRules} />
            </form>
          )}
        />
      </Fragment>
    );
  }
}

export default PlumbingForm;
