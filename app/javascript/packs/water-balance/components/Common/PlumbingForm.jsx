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
import createDecorator from 'final-form-focus';
import Divider from '@material-ui/core/Divider';
import {submitAlert} from './submitAlert'

import formValidation from './PlumbingForm.validation';

const style = {
  opacity: '.65',
  position: 'fixed',
  bottom: '11px',
  right: '104px',
  zIndex: '10000',
  backgroundColor: 'rgb(220, 0, 78)',
  borderRadius: '11px',
  width: '196px',
  '&:hover': {
    opacity: '1',
  },
};



import {
    Fab, 
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

const toNumber = (value) => {
    if (value === undefined || value === null) {
        return 0;
    }
    return parseFloat(value.replace(/,/g, ''));
};

const ToggleAdapter = ({input: {onChange, value}, label, ...rest}) => (
    <FormControlLabel
        control={<Switch checked={value} onChange={(event, isInputChecked) => {
            let proceed = true; 
            if(value == true) {
                proceed = window.confirm("Deactivating this toggle will clear values. Do you want to proceed?");
            }
            if(proceed == true) {
                onChange(isInputChecked);
            }
        }}
        value={value} {...rest}/>}
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

const focusOnError = createDecorator ()

const caluclateOccupancy = (values, basePath, subgroup) => {
    let hoursPerDay = null;
    let daysPerYear = null;
    let occupants = null;
    if(basePath == 'plumbing.lodging') {
        occupants = toNumber(selectn(`${basePath}.total_population`)(values));
        hoursPerDay = 8;
        daysPerYear = 350;
    }
    if(basePath == 'plumbing.hospital') {
        let dailyStaff = toNumber(selectn(`${basePath}.daily_staff`)(values));
        let administrative = toNumber(selectn(`${basePath}.administrative`)(values))/100;
        hoursPerDay = toNumber(selectn(`${basePath}.staff_shift`)(values));
        daysPerYear = toNumber(selectn(`${basePath}.days_per_year`)(values));
        occupants = dailyStaff * administrative;
        if(subgroup == 'staff') { 
            occupants = dailyStaff - occupants;
        }
        if(subgroup == "outPatient"){
            occupants = toNumber(selectn(`${basePath}.outpatient_visits`)(values));
            hoursPerDay = toNumber(selectn(`${basePath}.outpatient_duration`)(values));
        }
        if(subgroup == "inPatient"){
            occupants = toNumber(selectn(`${basePath}.inpatient_per_day`)(values));
            hoursPerDay = 1;
        }
    }
    if(subgroup == "weekday") {
        occupants = toNumber(selectn(`${basePath}.total_population`)(values));
        hoursPerDay = toNumber(selectn(`${basePath}.shift_weekday`)(values));
        daysPerYear = toNumber(selectn(`${basePath}.operating_weeks`)(values));
    }
    if(subgroup == "weekend") {
        occupants = toNumber(selectn(`${basePath}.total_population_weekends`)(values));
        hoursPerDay = toNumber(selectn(`${basePath}.shift_weekend`)(values));
        daysPerYear = toNumber(selectn(`${basePath}.operating_weekend`)(values));
    }
    let totalOccupied = occupants * hoursPerDay * daysPerYear;

   return totalOccupied;
}

class PlumbingForm extends React.Component {
    
    constructor(props) {
        super(props);
        let waterUse = selectn(`campus.modules.plumbing.plumbing.water_usage`)(props);
        this.state = {
            waterUse: waterUse? " Water Use: " + waterUse + " kgal" : '' 
        };
        this.calculateWaterUse = this.calculateWaterUse.bind(this);
    }

    clearValues = (clearValues, basePath, values) => {
        let field = basePath.replace("plumbing.", '');
        for(let i = 0; i < clearValues.length; i++) {
            values['plumbing'][field][clearValues[i]] = null;  
        }
    }   

    clearSection = (values, name) => {
        if(values['plumbing'][name] != undefined) {
            if(!(Object.keys(values['plumbing'][name]).length === 0)) {
                values['plumbing'][name] = null;  
            }
        }
    }
    
    calculateWaterUse = (values, valid) => {
        if(!valid) {
            window.alert("Missing or incorrect values.");
            return;
        }

        let lodgingOccupancy = caluclateOccupancy(values, 'plumbing.lodging');
        let hospitalAdminOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'admin');
        let hospitalStaffOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'staff');
        let hospitalOutPatientOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'outPatient');
        let hospitalInPatientOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'inPatient');
        let weekDaygeneralCampusOccupancy = caluclateOccupancy(values, 'plumbing.facility', 'weekday');
        let weekendDaygeneralCampusOccupancy = caluclateOccupancy(values, 'plumbing.facility', 'weekend');

        let total = hospitalAdminOccupancy + hospitalStaffOccupancy + hospitalOutPatientOccupancy + hospitalInPatientOccupancy + weekDaygeneralCampusOccupancy + weekendDaygeneralCampusOccupancy;

        values.plumbing.water_usage = total; 
        
        this.setState({
            waterUse: " Water Use: " + total + "kgal"
        });

    };
    
    onSubmit = values => {};

    flushRate = (basePath, values, source, title, people) => {
         let flowRate = selectn(`${basePath}.shower_flow_rate`)(values);
         return (<Fragment>
            <Typography variant="subtitle1" gutterBottom>{title}</Typography>
            <ExpansionPanel expanded={selectn(`${basePath}.typical_flush_rate`)(values) !== undefined}>
                <ExpansionPanelSummary>
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
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                <Grid container alignItems="flex-start" spacing={16}>
                    <Grid item xs={12}>
                        <Field
                            formControlProps={{fullWidth: true}}
                            required
                            name={`${basePath}.urinals`}
                            component={Select}
                            label={"Are urinals typically present in " + source + "?"}>
                            <MenuItem value="Yes">
                                Yes
                            </MenuItem>
                            <MenuItem value="No">
                                No
                            </MenuItem>
                        </Field>
                    </Grid>
                    {selectn(`${basePath}.urinals`)(values) === "Yes" && (
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
                    {selectn(`${basePath}.urinals`)(values) == 'No' && (
                        this.clearValues( ['urinal_flush_rate'], basePath, values)
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
                            label={"What is the typical flow rate of kitchenette faucet aerators in " + source + "? Please put 0 if no kitchenettes are present."}
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
                            label={"What is the typical flow rate of showers in " + source + "? Please put 0 in no showers are present."}
                            endAdornment={<InputAdornment position="end">gpf</InputAdornment>}
                            >
                        </Field>
                    </Grid>
                    {source === "overall campus" && flowRate != 0 && flowRate != undefined && (
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
                    {source === "overall campus" && flowRate == 0 && (
                        this.clearValues( ['shower_usage'], basePath, values)
                    )}
                    {source === "hospital/medical clinic" && flowRate != 0 && flowRate != undefined && (<Fragment>
                        <Grid item xs={12}>
                            <Field
                                formControlProps={{fullWidth: true}}
                                required
                                name={`${basePath}.shower_usage_staff`}
                                component={MaterialInput}
                                type="text"
                                mask={DEFAULT_DECIMAL_MASK}
                                label={"What is the estimated percentage of " + people[0] + " that use showers on a daily basis?"}
                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                >
                            </Field>
                        </Grid>    
                        {selectn(`${basePath}.inpatient_per_day`)(values) != 0 && (
                            <Grid item xs={12}>
                                <Field
                                    formControlProps={{fullWidth: true}}
                                    required
                                    name={`${basePath}.shower_usage_inpatient`}
                                    component={MaterialInput}
                                    type="text"
                                    mask={DEFAULT_DECIMAL_MASK}
                                    label={"What is the estimated percentage of " + people[1] + " that use showers on a daily basis?"}
                                    endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                    >
                                </Field>
                            </Grid>
                        )}
                    </Fragment>)}
                    {source === "hospital/medical clinic" && flowRate == 0 && (
                        this.clearValues(['shower_usage_staff', 'shower_usage_inpatient'], basePath, values)
                    )}
                </Grid>
            </ExpansionPanelDetails>
        </ExpansionPanel>
        </Fragment>)};

    onsiteLodging = (basePath, values) => {
        return (
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.total_population`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="What is the estimated monthly average population in all on-site lodging?"
                    >
                </Field>
            </Grid>
       );
    }

    facility = (basePath, values) => {
        return (
            <ExpansionPanel expanded={selectn(`${basePath}.total_population`)(values) !== undefined}>
                <ExpansionPanelSummary>
                    <Field
                        formControlProps={{fullWidth: true}}
                        required
                        name={`${basePath}.total_population`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="What is the estimated overall average daily campus staff population for weekdays, excluding hospital/clinics?"
                    >
                </Field>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                <Grid container alignItems="flex-start" spacing={16}>
                    <Grid item xs={12}>
                        <Field
                            formControlProps={{fullWidth: true}}
                            required
                            name={`${basePath}.total_population_weekends`}
                            component={MaterialInput}
                            type="text"
                            mask={DEFAULT_NUMBER_MASK}
                            label="What is the estimated overall average daily campus staff population for weekends, excluding hospital/clinics?"
                        >
                        </Field>
                    </Grid>  
                    {selectn(`${basePath}.total_population`)(values) != 0 && (
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
                    )}
                    {selectn(`${basePath}.total_population_weekends`)(values) != 0 && (
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
                    )}
                    {selectn(`${basePath}.total_population`)(values) != 0 && (
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
                    )}    
                    {selectn(`${basePath}.total_population_weekends`)(values) != 0 && (
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
                    )}
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
                </Grid>
                {selectn(`${basePath}.total_population`)(values) == 0 && (
                    this.clearValues( ['operating_weeks', 'shift_weekday'], basePath, values)
                )}
                {selectn(`${basePath}.total_population_weekends`)(values) == 0 && (
                    this.clearValues( [ 'operating_weekend', 'shift_weekend'], basePath, values)
                )}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )}

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
                    label="Approximately what percentage of the hospital/clinic staff are administrative?"
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
                    label="What is the average number of inpatients in a day? Please put 0 if no overnight patients."
                    >
                </Field>
            </Grid>
            {selectn(`${basePath}.inpatient_per_day`)(values) == 0 && (
                this.clearValues(['shower_usage_inpatient'], basePath, values)
            )}
        </Fragment>);
    }

    fixtureInformation = (values) => {
        return(<Fragment>
            <Grid item xs={12}>
                 <Typography variant="subtitle1" gutterBottom>Overall Campus</Typography>
                {this.facility('plumbing.facility', values)}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Fixture Information</Typography>
                <Divider variant="middle" />
            </Grid>
            {selectn(`plumbing.has_onsite_lodging`)(values) && (
                <Grid item xs={12}>
                    {this.flushRate('plumbing.lodging', values, "onsite lodging", "Onsite Lodging")}
                </Grid>
            )}
            {selectn(`plumbing.has_hospital`)(values) && (
                <Grid item xs={12}>
                    {this.flushRate('plumbing.hospital', values, "hospital/medical clinic", "Hospital/Medical Clinic", ["hospital staff", "hospital inpatents"])}
                </Grid> 
            )}    
            <Grid item xs={12}>
                {this.flushRate('plumbing.facility', values, "overall campus", "Overall Campus", "general campus occupants")}
            </Grid>
        </Fragment>)
    }

    renderFacilityTypes = (values) => {
        return (<Fragment>
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Occupancy Information</Typography>
                <Divider variant="middle" />
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
            {selectn(`plumbing.has_onsite_lodging`)(values) == false && (this.clearSection(values, "lodging"))}
            <Grid item xs={12}>
                <ExpansionPanel expanded={selectn(`plumbing.has_hospital`)(values) === true}>
                    <ExpansionPanelSummary>
                        <Field
                            name="plumbing.has_hospital"
                            label="My campus has a hospital or medical/dental clinic(s)?"
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
             {selectn(`plumbing.has_hospital`)(values) == false && (this.clearSection(values, "hospital"))}
            {this.fixtureInformation(values)}
            <Grid item xs={12} sm={4}>
                <Field
                    fullWidth
                    disabled
                    name="plumbing.water_usage"
                    label="Water use"
                    component={MaterialInput}
                    type="text"
                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                />
            </Grid>
        </Fragment>);
    }

    render() {
            const {createOrUpdateCampusModule, campus, applyRules} = this.props;
            const module = (campus) ? campus.modules.plumbing : {};
            return (<Fragment>
                <Typography variant="h5" gutterBottom>Plumbing</Typography>
                <Typography variant="body2" gutterBottom>Enter the following information on campus occupancy groups and installed fixtures.  Note that fixture information will only be entered for occupancy groups present on the campus.</Typography>
                <Form
                    onSubmit={this.onSubmit}
                    initialValues={module}
                    validate={formValidation}
                    decorators={[focusOnError]}
                    render={({handleSubmit, reset, submitting, pristine, values, valid}) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <Grid container alignItems="flex-start" spacing={16}>
                                {this.renderFacilityTypes(values)}
                            </Grid>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    onClick={() => this.calculateWaterUse(values, valid)}>
                                    Calculate Water Use
                                </Button>
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={() => submitAlert(valid, createOrUpdateCampusModule, values)}
                                    style={{marginLeft:'10px'}}
                                    >
                                    Save 
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
                            <FormRulesListener handleFormChange={applyRules}/>
                            <pre>{JSON.stringify(values, 0 ,2)}</pre>
                        </form>
                    )}
                /> 
            </Fragment>);
        }
    }

export default (PlumbingForm);