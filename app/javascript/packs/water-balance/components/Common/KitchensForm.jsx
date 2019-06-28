import React, {Fragment} from 'react';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from './MaterialInput';
import { FieldArray } from 'react-final-form-arrays'
import arrayMutators from 'final-form-arrays'
import selectn from 'selectn';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import formValidation from './kitchensForm.validation';

import {
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    Switch,
    MenuItem
} from '@material-ui/core';

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

class KitchensForm extends React.Component {

    renderMetered = (values, basePath) => {
        const isMetered = selectn(`${basePath}.is_metered`)(values);
         return (<Fragment>
            {isMetered && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.annual_water_use`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="Total annual water use"
                        endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        >
                    </Field>
                </Grid>
            )}
            {isMetered === false 
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
                    <MenuItem value="standard_continuous">
                        Standard Continuous
                    </MenuItem>
                    <MenuItem value="standard_batch">
                        Standard Batch
                    </MenuItem>
                    <MenuItem value="energy_star_labelled">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="no_dishwasher">
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
                    <MenuItem value="standard_flow">
                        Standard Flow
                    </MenuItem>
                    <MenuItem value="watersense_labelled">
                        WaterSense Labelled
                    </MenuItem>
                    <MenuItem value="no_valve">
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
                    <MenuItem value="standard_boiler_based">
                        Standard Boiler-Based
                    </MenuItem>
                    <MenuItem value="standard_connectionless">
                        Standard Connectionless
                    </MenuItem>
                    <MenuItem value="energy_star_labelled">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="no_combination">
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
                    <MenuItem value="standard_water_cooled">
                        Standard Water-Cooled
                    </MenuItem>
                    <MenuItem value="standard_air_cooled">
                        Standard Air-Cooled
                    </MenuItem>
                    <MenuItem value="energy_star_labelled">
                        Energy Star Labelled
                    </MenuItem>
                    <MenuItem value="no_ice_maker">
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
                    <FormControlLabel
                        label="Is the water use metered?"
                        control={
                        <Field
                            name={`${basePath}.is_metered`}
                            component={Checkbox}
                            indeterminate= {selectn(`${basePath}.is_metered`)(values) === undefined}
                            type="checkbox"
                        />
                        }
                    />
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
                        <ExpansionPanel expanded = {selectn(`${name}.name`)(values) !== undefined}>
                            <ExpansionPanelSummary>
                                <Field
                                    fullWidth
                                    required
                                    name={`${name}.name`}
                                    component={MaterialInput}
                                    type="text"
                                    label="Facility name"/>
                                    <span
                                        onClick={() => fields.remove(index)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        ❌
                                    </span>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                            <Grid container alignItems="flex-start" spacing={16}>
                                <Grid item xs={12}>
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

        return (
            <Form
                onSubmit={this.onSubmit}
                initialValues={campus}
                validate={formValidation}
                mutators={{
                    ...arrayMutators
                }}
                render={({
                    handleSubmit,
                    values,
                    form: { mutators: { push, pop } }
                }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has commercial kitchen facilities?"
                                    control={
                                        <Field
                                            name="has_kitchens"
                                            component={Checkbox}
                                            indeterminate={values.kitchen_facilities === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.renderFacilityTypes(values)}
                            <Grid item xs={12}>
                                {(values.has_kitchens === false || values.has_kitchens === undefined) ? null : (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => push('kitchen_facilities', undefined)}>
                                        Enter another commercial kitchen
                                    </Button>
                                )}
                                
                            </Grid>
                        </Grid>
                        <FormRulesListener handleFormChange={applyRules}/>
                    </form>
                )}
           />
        );
    }
}

export default (KitchensForm);