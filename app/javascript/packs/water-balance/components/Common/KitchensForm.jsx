import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {
    Fab,
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    Switch,
    MenuItem
} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from './MaterialInput';
import { FieldArray } from 'react-final-form-arrays'
import arrayMutators from 'final-form-arrays'
import selectn from 'selectn';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import formValidation from './kitchensForm.validation';

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

const toNumber = (value) => {
    if (value === undefined || value === null) {
        return -1;
    }
    return parseInt(value.toString().replace(/,/g, ''));
};

const calculatePerMeal = (values) => {
    if(values == null) {
        return 0;
    }
    let iceMaker = (values.ice_maker * 1) || 0;
    let combinationOven = (values.combination_oven * 1) || 0;
    let prepSink = values.prep_sink == true ? 1 : 0;
    let sprayValve = (values.spray_valve * 1) || 0;
    let dishwasher = (values.dishwasher_type * 1) || 0;
    let handWashSink = (values.flow_rate * 1);
    let handWashSinkValue = 0;
    if (isNaN(handWashSink)) { 
        handWashSinkValue = 0;
    } else if (handWashSink > 1.5) {
        handWashSinkValue = 4;
    } else if ((handWashSink >= 1.1) && (handWashSink <= 1.5)) {
        handWashSinkValue = 3;
    } else if ((handWashSink >= 0.6) && (handWashSink <= 1.0)) {
        handWashSinkValue = 2;
    } else if (handWashSink <= 0.5) {
        handWashSinkValue = 1;
    }
    let useIndex = iceMaker + (combinationOven * 5.9 ) + (prepSink + sprayValve + dishwasher + handWashSinkValue) * 3.1;
    let waterUsePerMeal = 0;
    if ((useIndex > 0) && (useIndex <= 28.3)) {
        waterUsePerMeal = 5;
    } else if ((useIndex >= 28.4) && (useIndex <= 40.1)) {
        waterUsePerMeal = 10;
    } else if ((useIndex >= 40.2) && (useIndex <= 51.7)) {
        waterUsePerMeal = 15;
    }

    return waterUsePerMeal;
}

class KitchensForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            waterUse: ''
        };
        this.calculateWaterUse = this.calculateWaterUse.bind(this);
    }

    calculateWaterUse = (values) => {
        let waterUsePerMeal = 0;
        let total = 0;
        values.kitchen_facilities.map((facilityValues, index) => {
            if(facilityValues) {
                waterUsePerMeal = calculatePerMeal(facilityValues);
                let weekdayMeals = facilityValues.weekday_meals || 0;
                let weekendMeals = facilityValues.weekend_meals || 0;
                let operatingWeeks = facilityValues.operating_weeks || 0;
                let operatingWeekends = facilityValues.operating_weekends || 0;
                total += (((weekdayMeals * operatingWeeks) + (weekendMeals * operatingWeekends)) * waterUsePerMeal)/1000;
            }
        });

        let roundTotal = Math.round( total * 10) / 10;

        this.setState({
            waterUse: " Water Use: " + roundTotal + " kgal"
        });
    };

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
                && (this.averageMeals(basePath, values))
            }
        </Fragment>);
    }

    kitchenComponents = (basePath, values) => {
         return(<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.dishwasher_type`}
                    component={Select}
                    label="Type of dishwasher"
                >
                    <MenuItem value="3">
                        Standard Continuous
                    </MenuItem>
                    <MenuItem value="2">
                        Standard Batch
                    </MenuItem>
                    <MenuItem value="1">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="0">
                        No Dishwasher
                    </MenuItem>
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.spray_valve`}
                    component={Select}
                    label="Type of pre-rinse spray valve"
                >
                    <MenuItem value="2">
                        Standard Flow
                    </MenuItem>
                    <MenuItem value="1">
                        WaterSense Labelled
                    </MenuItem>
                    <MenuItem value="0">
                        No Pre-Rinse Spray Valves
                    </MenuItem>
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.flow_rate`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label="Typical flow rate of the handwash faucets"
                    endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
                    >
                </Field>
            </Grid>
            <FormControlLabel
                label="Faucets for prep sinks or for washing pots and pans present"
                control={
                <Field
                    name={`${basePath}.prep_sink`}
                    component={Checkbox}
                    indeterminate= {selectn(`${basePath}.prep_sink`)(values) === undefined}
                    type="checkbox"
                />
                }
            />
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.combination_oven`}
                    component={Select}
                    label="Type of combination oven or steam cooker"
                >
                    <MenuItem value="3">
                        Standard Boiler-Based
                    </MenuItem>
                    <MenuItem value="2">
                        Standard Connectionless
                    </MenuItem>
                    <MenuItem value="1">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="0">
                        No Combination Ovens or Steam Cookers
                    </MenuItem>
                </Field>
            </Grid>
             <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.ice_maker`}
                    component={Select}
                    label="Type of ice maker"
                >
                    <MenuItem value="3">
                        Standard Water-Cooled
                    </MenuItem>
                    <MenuItem value="2">
                        Standard Air-Cooled
                    </MenuItem>
                    <MenuItem value="1">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="0">
                        No Ice Maker
                    </MenuItem>
                </Field>
            </Grid>
        </Fragment>)
    }

    averageMeals = (basePath, values) => {
        const weekdayMeals = selectn(`${basePath}.weekday_meals`)(values);
        const weekendMeals = selectn(`${basePath}.weekend_meals`)(values);
        return(<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.weekday_meals`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Average number of meals prepared per weekday (M-F)"
                    >
                </Field>
            </Grid>
            {weekdayMeals != undefined && weekdayMeals != 0 && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.operating_weeks`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="Number of weeks (M-F) commercial kitchen is operating per year"
                        >
                    </Field>
                </Grid>
            )}

            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.weekend_meals`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Average number of meals prepared per weekend day"
                    >
                </Field>
            </Grid>

            {toNumber(weekendMeals) != 0 && weekendMeals != undefined && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.operating_weekends`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="Number of weekends the commercial kitchen operates per year"
                        >
                    </Field>
                </Grid>
            )}
            {this.kitchenComponents(basePath, values)}
        </Fragment>)
    }

    renderFacilityTypeResponse = (values, basePath) => {
       const facilityType = selectn(`${basePath}.type`)(values);
        return (<Fragment>
            {facilityType === 'stand_alone' && (
                    <Grid item xs={12}>
                        <Field
                            formControlProps={{fullWidth: true}}
                            required
                            name={`${basePath}.is_metered`}
                            component={Select}
                            label="Is the water use metered?"
                        >
                            <MenuItem value="yes">
                                Yes
                            </MenuItem>
                            <MenuItem value="no">
                                No
                            </MenuItem>
                        </Field>
                        {this.renderMetered(values, basePath)}
                    </Grid>
            )}
            {facilityType === 'incorporated' && (
                this.averageMeals(basePath, values)
            )}
        </Fragment>);
    };

    onSubmit = values => {
        const {onSubmit} = this.props;
        if (onSubmit) {
            onSubmit(values);
        } else {
            window.alert(JSON.stringify(values, 0, 2));
        }
    };

    renderFacilityTypes = (values) => {
        if(!values.has_kitchens) {
            return null;
        }
        return( <Fragment>
            <FieldArray name="kitchen_facilities">
                {({ fields }) =>
                fields.map((name, index) => (
                    <Grid item xs={12} key={index}>
                        <ExpansionPanel expanded = {selectn(`${name}.type`)(values) !== undefined}>
                            <ExpansionPanelSummary>
                                <Field
                                    formControlProps={{fullWidth: true}}
                                    required
                                    name={`${name}.type`}
                                    component={Select}
                                    label="Is the commercial kitchen a stand-alone facility or is it incorporated into another building?">
                                    <MenuItem value="stand_alone">
                                        Stand Alone
                                    </MenuItem>
                                    <MenuItem value="incorporated">
                                        Incorporated in Another Building
                                    </MenuItem>
                                </Field>
                                <IconButton 
                                    style={{padding: 'initial', height:'40px', width:'40px'}}
                                    onClick={() => fields.remove(index)}
                                    aria-label="Delete">
                                    <DeleteIcon />
                                </IconButton>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container alignItems="flex-start" spacing={16}>
                                    <Grid item xs={12}>
                                        <Field
                                            fullWidth
                                            required
                                            name={`${name}.name`}
                                            component={MaterialInput}
                                            type="text"
                                            label="Enter a unique identifier for this commercial kitchen facility (such as a building name or building number)"
                                        />
                                    </Grid>
                                    {selectn(`${name}.type`)(values) && this.renderFacilityTypeResponse(values, `${name}`)}
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Grid>
                    
                ))
                }
            </FieldArray>
            </Fragment>);
    }

    render() {
        const { campus, applyRules } = this.props;
       
        if (!('kitchen_facilities' in campus)) {
            campus.kitchen_facilities = [];
            campus.kitchen_facilities.push(null);
        }

        return (<Fragment>
            <Typography variant="h5" gutterBottom>Commercial Kitchen</Typography>
            <Typography variant="body2" gutterBottom>Enter the following information for commercial kitchens on the campus</Typography>
            <Form
                onSubmit={this.onSubmit}
                initialValues={campus}
                validate={formValidation}
                mutators={{...arrayMutators }}
                render={({ handleSubmit, values, form: { mutators: { push, pop } }}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has commercial kitchen facilities?"
                                    control={
                                        <Field
                                            name="has_kitchens"
                                            component={Checkbox}
                                            indeterminate={values.has_kitchens === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.renderFacilityTypes(values)}
                           
                            <Grid item xs={12}>
                                {(values.has_kitchens === false || values.has_kitchens === undefined) ? null : (<Fragment>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => push('kitchen_facilities', undefined)}>
                                        Add Another Commercial Kitchen
                                    </Button>
                                    <Button
                                        style={{marginLeft: '10px'}}
                                        variant="contained"
                                        onClick={() => this.calculateWaterUse(values)}>
                                        Calculate Water Use
                                    </Button>
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
                                </Fragment>)}
                            </Grid>
                        </Grid>
                        <FormRulesListener handleFormChange={applyRules}/>
                    </form>
                  )}
            />
        </Fragment>);
    }
}

export default (KitchensForm);