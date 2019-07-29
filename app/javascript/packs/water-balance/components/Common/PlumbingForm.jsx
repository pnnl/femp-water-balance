import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
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
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import formValidation from './PlumbingForm.validation';


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

const ToggleAdapter = ({input: {onChange, value}, label, ...rest}) => (
    <FormControlLabel
        control={<Switch checked={value} onChange={(event, isInputChecked) => onChange(isInputChecked)}
                         value={value} {...rest} />}
        label={label}
    />
);

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

class PlumbingForm extends React.Component {
    onSubmit = values => {
        const {onSubmit} = this.props;
        if (onSubmit) {
            onSubmit(values);
        } else {
            window.alert(JSON.stringify(values, 0, 2));
        }
    };

    flushRate = (basePath, values, source, people) => {
         return (<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.typical_flush_rate`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label={"What is the typical flush rate of toilets in " + source + "?"}
                    endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.urinals`}
                    component={Select}
                    label={"Are urinals typically present in " + source + "?"}>
                    <MenuItem value="yes">
                        yes
                    </MenuItem>
                    <MenuItem value="No">
                        No
                    </MenuItem>
                </Field>
            </Grid>
            {selectn(`${basePath}.urinals`)(values) === "yes" && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.urinal_flush_rate`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label={"What is the typical flush rate of urinals in " + source + "?"}
                        endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                    >
                    </Field>
                </Grid>
            )}
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.aerator_flow_rate`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label={"What is the typical flow rate of restroom faucet aerators in " + source + "?"}
                    endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.kitchenette_flow_rate`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label={"What is the typical flow rate of kitchenette faucet aerators in " + source + "?"}
                    endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.shower_flow_rate`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label={"What is the typical flow rate of showers in " + source + "?"}
                    endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                    >
                </Field>
            </Grid>
            {source === "overall campus" || source === "hospital/medical clinic" && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.shower_usage`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label={"What is the estimated percentage of " + people + " that use showers on a daily basis?"}
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                        >
                    </Field>
                </Grid>
            )}
        </Fragment>);
    }

    onsiteLodging = (basePath, values) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.total_population`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the estimated total population in all on-site lodging? "
                    >
                </Field>
            </Grid>
            {this.flushRate(basePath, values, "onsite lodging")}
        </Fragment>);
    }

    facility = (basePath, values) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.total_population`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the estimated overall campus staff population, excluding hospital/medical clinics? Note: hospital/medical clinic population question is below."
                    >
                </Field>
            </Grid>
            {selectn(`${basePath}.total_population`)(values) !== undefined && (<Fragment>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.operating_weeks`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="How many week days per year does the campus typically operate?"
                        >
                    </Field>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.operating_weekend`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="How many weekend days per year does the campus typically operate?"
                        >
                    </Field>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.staff_weekend`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="What is the estimated percentage of staff that work during the weekends?"
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                        >
                    </Field>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.shift_weekday`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="What is the average length of a weekday shift?"
                        endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                        >
                    </Field>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.shift_weekend`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="What is the average length of a weekend day shift?"
                        endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                        >
                    </Field>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.male_population`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_DECIMAL_MASK}
                        label="Estimate the percentage of overall population that is male"
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                        >
                    </Field>
                </Grid>
                {this.flushRate(basePath, values, "overall campus", "general campus occupants")}
            </Fragment>)}
         </Fragment>);
    }

    hospital = (basePath, values) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.days_per_year`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label="How many days per year is the hospital/clinic open?"
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.daily_staff`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the approximate number of hospital/clinic daily staff?"
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.administrative`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label="What is the estimated percentage of hospital clinic staff are administrative?"
                    endAdornment={<InputAdornment position="end">%</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.staff_shift`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label="What is the average length of a hospital/clinic staff shift?"
                    endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.outpatient_visits`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the average number of outpatient visits in a day?"
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.outpatient_duration`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_DECIMAL_MASK}
                    label="What is the average length of an outpatient visit?"
                    endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                    >
                </Field>
            </Grid>
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.inpatient_per_day`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the average number of inpatient stays in a day?"
                    >
                </Field>
            </Grid>
            {this.flushRate(basePath, values, "hospital/medical clinic", "hospital staff and hospital inpatents")}
        </Fragment>);
    }

    renderFacilityTypes = (values) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Grid container alignItems="flex-start" spacing={16}>
                    {this.facility('plumbing.facility', values)}
                </Grid>
               <ExpansionPanel expanded={selectn(`plumbing.has_onsite_lodging`)(values) === true}>
                    <ExpansionPanelSummary>
                        <Field
                            name="plumbing.has_onsite_lodging"
                            label="My campus has on-site lodging that utilizes the campus water supply (barracks, dormitory, hotel, family housing)?"
                            component={ToggleAdapter}
                            type="checkbox"
                        />
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container alignItems="flex-start" spacing={16}>
                            {this.onsiteLodging('plumbing.lodging', values)}
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
            <Grid item xs={12}>
                <ExpansionPanel expanded={selectn(`plumbing.has_hospital`)(values) === true}>
                <ExpansionPanelSummary>
                    <Field
                        name="plumbing.has_hospital"
                        label="My campus has a hospital or medical clinic?"
                        component={ToggleAdapter}
                        type="checkbox"
                    />
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Grid container alignItems="flex-start" spacing={16}>
                        {this.hospital('plumbing.hospital', values)}
                    </Grid>
                </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
        </Fragment>);
    }

    render() {
            const { campus, applyRules } = this.props;

            return (<Fragment>
                <Typography variant="h5" gutterBottom>Plumbing</Typography>
                <Typography variant="body2" gutterBottom>Enter the following information only for plumbing fixtures (toilets, urinals, bathroom faucets, kitchenette faucets and showerheads) that use potable water on the campus.</Typography>
                <Form
                    onSubmit={this.onSubmit}
                    initialValues={campus}
                    validate={formValidation}
                    render={({handleSubmit, reset, submitting, pristine, values}) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <Grid container alignItems="flex-start" spacing={16}>
                                {this.renderFacilityTypes(values)}
                            </Grid>
                            <FormRulesListener handleFormChange={applyRules}/>
                            <pre>{JSON.stringify(values, null, 2)}</pre> 
                        </form>
                    )}
                /> 
            </Fragment>);
        }
    }

export default (PlumbingForm);