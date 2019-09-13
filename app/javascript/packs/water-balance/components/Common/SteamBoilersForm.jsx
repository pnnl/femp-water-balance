import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {FieldArray} from 'react-final-form-arrays'
import arrayMutators from 'final-form-arrays'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import MaterialInput from './MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import {submitAlert} from './submitAlert'

import formValidation from './SteamBoilersForm.validation';

import {
    Fab, 
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    MenuItem
} from '@material-ui/core';

const style = {
  opacity: '.65',
  position: 'fixed',
  bottom: '11px',
  right: '104px',
  zIndex: '10000',
  backgroundColor : 'rgb(220, 0, 78)',
  borderRadius: '11px',
  width: '196px',
  '&:hover': {
    opacity: '1',
  },
};

const DEFAULT_NUMBER_MASK = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    integerLimit: 10,
    allowDecimal: false
});

const DEFAULT_DECIMAL_MASK = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    integerLimit: 10,
    allowDecimal: true
});

const focusOnError = createDecorator ()

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

const steamBoilerCalculation = (boiler) => {
    let softenerPerformance = ((boiler.water_regeneration * boiler.regeneration_per_week * boiler.operating_weeks)/ 1000) || 0;
    let steamGenerationRate = (boiler.steam_generation / 8.314) || 0;
    let feedwaterRate = (steamGenerationRate / (1-(1/boiler.cycles_concentration))) || 0;
    let totalWaterUse =  ([[(feedwaterRate)-(steamGenerationRate * boiler.condensate_percentage/100)]*(boiler.hours_week * boiler.operating_weeks)]/1000) || 0;
    
    let total = softenerPerformance + totalWaterUse;
    return total;
}


class SteamBoilersForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            waterUse: ''
        };
        this.calculateWaterUse = this.calculateWaterUse.bind(this);
    }   

    calculateWaterUse = (values) => {
       
        let total = 0;
        values.steam_boilers.map((boiler, index) => {
            if(boiler) { 
                if(boiler.is_metered == 'yes') {
                    total += (boiler.annual_water_use || 0) * 1;
                } else {
                   
                    total += steamBoilerCalculation(boiler);
                }
            }
        });

        let roundTotal = Math.round( total * 10) / 10;

        this.setState({
            waterUse: " Water Use: " + roundTotal + " kgal"
        });
    }

    onSubmit = (values) => {};

    weeksPerYear = (basePath) => {
        return(
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.operating_weeks`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Number of weeks per year the system is operating'
                    endAdornment={<InputAdornment position="end">weeks</InputAdornment>}
                    >
                </Field>
            </Grid>
        )
    }

    softener = (values, basePath) => {
        return(<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.water_regeneration`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Amount of water used between regenerations'
                    endAdornment={<InputAdornment position="end">gal</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.regeneration_per_week`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Number of times the system regenerates in 1 week'
                    >
                </Field>
            </Grid>
            {this.weeksPerYear(basePath)}
        </Fragment>)
    }

    noSoftner = (values, basePath) => {
        return(<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.steam_generation`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Steam generation rate'
                    endAdornment={<InputAdornment position="end">lb./hr.</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.condensate_percentage`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Percentage of condensate that is returned'
                    endAdornment={<InputAdornment position="end">%</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.cycles_concentration`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Cycles of concentration'
                    endAdornment={<InputAdornment position="end">cycles</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.hours_week`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label='Number of hours the system operates per week'
                    endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                    >
                </Field>
            </Grid>
            {this.weeksPerYear(basePath)}
        </Fragment>)
    }

    nonMetered = (values, basePath) => {
        const softenerUse = selectn(`${basePath}.softener`)(values);
        return( <Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.softener`}
                    component={Select}
                    label="Does the system have a softener or water conditioning system?"
                >
                    <MenuItem value="yes">
                        Yes
                    </MenuItem>
                    <MenuItem value="no">
                        No
                    </MenuItem>
                </Field>
            </Grid>
            {softenerUse === "no" && (
                this.noSoftner(values, basePath)
            )}
            {softenerUse === "yes" && (
               this.softener(values, basePath)
            )}
        </Fragment>)
    }

    renderMetered = (values, basePath) => {
        const isMetered = selectn(`${basePath}.is_metered`)(values);
        const year = new Date(values.survey).getFullYear();
        return (<Fragment>
            {isMetered === "yes" && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.annual_water_use`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label={`${year} total annual water use`}
                        endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        >
                    </Field>
                </Grid>
            )}
            {isMetered === "no" 
                && (this.nonMetered(values, basePath))
            }
        </Fragment>)
    }

    isMetered = (values, basePath ) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.is_metered`}
                    component={Select}
                    label="Is the makeup water metered?"
                >
                    <MenuItem value="yes">
                        Yes
                    </MenuItem>
                    <MenuItem value="no">
                        No
                    </MenuItem>
                </Field>
            </Grid>
            {this.renderMetered(values, basePath)}
        </Fragment>)
    }

    boilerSystemTypes = (values) => {
        if(!values.has_steam_boilers) {
            return null;
        }
        return(<Fragment>
            <FieldArray name="steam_boilers"> 
                {({ fields }) => fields.map((name, index) => (
                    <Grid item xs={12} key={index}>
                        <ExpansionPanel expanded = {selectn(`${name}.name`)(values) !== undefined}>
                            <ExpansionPanelSummary>
                                <Field
                                    fullWidth
                                    required
                                    name={`${name}.name`}
                                    component={MaterialInput}
                                    type="text"
                                    label="Enter a unique name identifier for this steam boiler system (such as the building name/number it is associated)."
                                />
                                <IconButton 
                                    style={{padding: 'initial', height:'40px', width:'40px'}}
                                    onClick={() => fields.remove(index)}
                                    aria-label="Delete">
                                    <DeleteIcon />
                                </IconButton>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container alignItems="flex-start" spacing={16}>
                                   {this.isMetered(values, `${name}`)}
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Grid>
                ))}
            </FieldArray>
            <Grid item xs={12} sm={4}>
                <Field
                    fullWidth
                    disabled
                    name="vehicle_wash.water_use"
                    label="Water use"
                    component={MaterialInput}
                    type="text"
                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
            />
        <Fragment/>)
    }


    render() {
        const {createOrUpdateCampusModule, campus, applyRules} = this.props;

        const module = (campus) ? campus.modules.steam_boilers : {};

        if (!('steam_boilers' in module)) {
            module.steam_boilers = [];
            module.steam_boilers.push(null);
        }

        return (<Fragment>
            <Typography variant="h5" gutterBottom>Steam Boilers</Typography>
            <Typography variant="body2" gutterBottom>Enter the following information only for steam boilers that use potable water on the campus</Typography>
            <Form
                onSubmit={this.onSubmit}
                initialValues={module}
                validate={formValidation}
                mutators={{...arrayMutators }}
                render={({ handleSubmit, values, valid, form: { mutators: { push, pop } }}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has steam boilers"
                                    control={
                                        <Field
                                            name="has_steam_boilers"
                                            component={Checkbox}
                                            indeterminate={values.has_other_processes === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.boilerSystemTypes(values)}
                             <Grid item xs={12}>
                                {values.has_steam_boilers === true && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => push('steam_boilers', undefined)}>
                                        Add Another Steam Boiler
                                    </Button>
                                )}
                                {(values.has_steam_boilers === false || values.has_steam_boilers === undefined) ? null : (<Fragment>
                                    <Button
                                        style={{marginLeft: '10px'}}
                                        variant="contained"
                                        type="submit"
                                        onClick={() => this.calculateWaterUse(values)}>
                                        Calculate Water Use
                                    </Button>
                                    <Button
                                        variant="contained"
                                        type="button"
                                        onClick={() => submitAlert(valid, createOrUpdateCampusModule, values)}
                                        style={{marginLeft: '10px'}}
                                    >
                                        Save 
                                    </Button>
                                </Fragment>)}
                                {this.state.waterUse != '' && (
                                    <Fab
                                        color="primary"
                                        aria-label="Water Use"
                                        title="Water Use"
                                        style={style}
                                    >
                                    {this.state.waterUse}
                                    </Fab>
                                )}
                            </Grid>
                        </Grid>
                        <FormRulesListener handleFormChange={applyRules}/>
                    </form>
                )}
           />
        </Fragment>);
    }
}

export default (SteamBoilersForm);