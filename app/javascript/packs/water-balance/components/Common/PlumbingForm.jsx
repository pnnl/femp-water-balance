import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from './MaterialInput';
import selectn from 'selectn';
import createDecorator from 'final-form-focus';
import Divider from '@material-ui/core/Divider';
import {submitAlert} from './shared/submitAlert'
import {fabStyle, DEFAULT_NUMBER_MASK, DEFAULT_DECIMAL_MASK, numberFormat} from './shared/sharedStyles'; 
import formValidation from './PlumbingForm.validation';

import {
    Fab, 
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    Switch,
    MenuItem
} from '@material-ui/core';

const subHeader = {
    marginLeft: '7px',
    fontWeight: '300'
}

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
    let daysPerYear = getDaysPerYear(basePath, values, subgroup);
    let occupants = getOccupants(basePath, values, subgroup);

    if(basePath == 'plumbing.lodging') {
        hoursPerDay = 8;
    }
    if(subgroup == 'admin' ||subgroup == 'staff') {
        hoursPerDay = toNumber(selectn(`${basePath}.staff_shift`)(values));
    }
    if(subgroup == "outPatient"){
            hoursPerDay = toNumber(selectn(`${basePath}.outpatient_duration`)(values));
    }
    if(subgroup == "inPatient"){
        hoursPerDay = 1;
    }
    if(subgroup == "weekday") {
        hoursPerDay = toNumber(selectn(`${basePath}.shift_weekday`)(values));
    }
    if(subgroup == "weekend") {
        hoursPerDay = toNumber(selectn(`${basePath}.shift_weekend`)(values));
    }
    let totalOccupied = occupants * hoursPerDay * daysPerYear;

   return totalOccupied;
}

const calculateUrinals = (occupancy, basePath, values, subgroup) => {
    let waterUse = 0;
    if(selectn(`${basePath}.urinals`)(values) == 'Yes') {
        let flushRatePerHour = subgroup == 'inPatient'? 4 : .25;
        let malePercent = toNumber(selectn(`plumbing.facility.male_population`)(values));
        let flushRate = toNumber(selectn(`${basePath}.urinal_flush_rate`)(values));
        let flushesPerYear = occupancy * (malePercent/100) * flushRatePerHour;
        waterUse = (flushesPerYear * flushRate)/1000;
    } 
    return waterUse;
}

const calculateToilets = (occupancy, basePath, values, subgroup) => {
    let maleFlush = 0;
    let femaleFlush = 0; 
    if(subgroup == 'inPatient') {
        maleFlush = selectn(`${basePath}.urinals`)(values) == 'Yes'? 3 : 7;
        femaleFlush = 7; 
    } else {
        maleFlush = selectn(`${basePath}.urinals`)(values) == 'Yes'? 0.125 : 0.375;
        femaleFlush = 0.375;
    }
    let averageFlushRate = toNumber(selectn(`${basePath}.typical_flush_rate`)(values));
    let malePercent = toNumber(selectn(`plumbing.facility.male_population`)(values))/100;
    let maleFlushesPerYear = occupancy * maleFlush * malePercent;
    let femaleFlushesPerYear = occupancy * femaleFlush * (1 - malePercent);

    let totalToiletWater = ((maleFlushesPerYear + femaleFlushesPerYear) * averageFlushRate)/1000; 

    return totalToiletWater;
}

const calculateRestroomSink = (occupancy, basePath, values, minutesPerHour) => {
    let minuresPerYear = minutesPerHour * occupancy;
    let averageFlow = toNumber(selectn(`${basePath}.aerator_flow_rate`)(values));
    let totalWaterUse = (minuresPerYear * averageFlow)/1000;
     
    return totalWaterUse;
}
const getDaysPerYear = (basePath, values, subgroup) => {
    let daysPerYear = null;
    if(basePath == 'plumbing.lodging') {
       daysPerYear = 350; 
    }
    if(basePath == 'plumbing.hospital') { 
        daysPerYear = toNumber(selectn(`${basePath}.days_per_year`)(values));
    }
    if(subgroup == "weekday") {
        daysPerYear = toNumber(selectn(`${basePath}.operating_weeks`)(values));
    }
    if(subgroup == "weekend") {
        daysPerYear = toNumber(selectn(`${basePath}.operating_weekend`)(values));
    }
    return daysPerYear;
}

const getOccupants = (basePath, values, subgroup) => {
    let occupants = null;
    if(basePath == 'plumbing.lodging') { 
         occupants = toNumber(selectn(`${basePath}.total_population`)(values));
    }
    if(basePath == 'plumbing.hospital') {
        let dailyStaff = toNumber(selectn(`${basePath}.daily_staff`)(values));
        let administrative = toNumber(selectn(`${basePath}.administrative`)(values))/100;
        occupants = dailyStaff * administrative;
        if(subgroup == 'staff') { 
            occupants = dailyStaff - occupants;
        }
    }
    if(subgroup == "outPatient"){
        occupants = toNumber(selectn(`${basePath}.outpatient_visits`)(values));
    }
    if(subgroup == "inPatient"){
        occupants = toNumber(selectn(`${basePath}.inpatient_per_day`)(values));
    }
    if(subgroup == "weekday") {
        occupants = toNumber(selectn(`${basePath}.total_population`)(values));
    }
    if(subgroup == "weekend") {
        occupants = toNumber(selectn(`${basePath}.total_population_weekends`)(values));
    }
    return occupants; 
}

const calculateKitchenSink = (basePath, values, subgroup, minutesPerHour) => {
    let occupants = getOccupants(basePath, values, subgroup);
    let flowRate = toNumber(selectn(`${basePath}.kitchenette_flow_rate`)(values));
    let minutesPerYear = occupants * minutesPerHour;
    let totalWaterUse = (minutesPerYear * flowRate)/1000;  
    return totalWaterUse;
}

const calculateShowers = (basePath, values, subgroup, timeUsed)  => {
    let occupants = getOccupants(basePath, values, subgroup);
    let daysPerYear = getDaysPerYear(basePath, values, subgroup);
    let showerUsage = null;
    if(subgroup == 'lodging') {
        showerUsage = 69;
    } 
    if(subgroup == 'inPatient'){
        showerUsage = toNumber(selectn(`${basePath}.shower_usage_inpatient`)(values));
    }
    if(subgroup == 'staff' || subgroup == 'admin'){
        showerUsage = toNumber(selectn(`${basePath}.shower_usage_staff`)(values));
    }
    if(subgroup == 'weekday' || subgroup == 'weekend'){
        showerUsage = toNumber(selectn(`${basePath}.shower_usage`)(values));
    }
    if(subgroup == 'outPatient'){
        showerUsage = 0;
    }
    let flowRate = toNumber(selectn(`${basePath}.shower_flow_rate`)(values));
    let showersPerYear = (showerUsage/100) * occupants * daysPerYear;
    let totalWaterUse = (showersPerYear * flowRate * timeUsed)/1000;
    return totalWaterUse;
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

    calulateTotalOccupants = (values, basePath) => {
        values.plumbing.hospital.total_occupants = toNumber(selectn(`${basePath}.inpatient_per_day`)(values)) + toNumber(selectn(`${basePath}.daily_staff`)(values));
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

        //Occupancy 
        let lodgingOccupancy = caluclateOccupancy(values, 'plumbing.lodging');
        let hospitalAdminOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'admin');
        let hospitalStaffOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'staff');
        let hospitalOutPatientOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'outPatient');
        let hospitalInPatientOccupancy = caluclateOccupancy(values, 'plumbing.hospital', 'inPatient');
        let weekDaygeneralCampusOccupancy = caluclateOccupancy(values, 'plumbing.facility', 'weekday');
        let weekendDaygeneralCampusOccupancy = caluclateOccupancy(values, 'plumbing.facility', 'weekend');

        // Urinals
        let lodgingUrinals = calculateUrinals(lodgingOccupancy, 'plumbing.lodging', values);
        let hospitalAdminUrinals = calculateUrinals(hospitalAdminOccupancy, 'plumbing.hospital', values);
        let hospitalStaffUrinals = calculateUrinals(hospitalStaffOccupancy, 'plumbing.hospital', values);
        let hospitalOutPatientUrinals = calculateUrinals(hospitalOutPatientOccupancy, 'plumbing.hospital', values);
        let hospitalInPatientUrinals = calculateUrinals(hospitalInPatientOccupancy, 'plumbing.hospital', values, 'inPatient');
        let weekDaygeneralCampusUrinals = calculateUrinals(weekDaygeneralCampusOccupancy, 'plumbing.facility', values);
        let weekendDaygeneralCampusUrinals = calculateUrinals(weekendDaygeneralCampusOccupancy, 'plumbing.facility', values);

        //Toilets
        let lodgingToilets = calculateToilets(lodgingOccupancy, 'plumbing.lodging', values);
        let hospitalAdminToilets = calculateToilets(hospitalAdminOccupancy, 'plumbing.hospital', values);
        let hospitalStaffToilets = calculateToilets(hospitalStaffOccupancy, 'plumbing.hospital', values);
        let hospitalOutPatientToilets = calculateToilets(hospitalOutPatientOccupancy, 'plumbing.hospital', values);
        let hospitalInPatientToilets = calculateToilets(hospitalInPatientOccupancy, 'plumbing.hospital', values, 'inPatient');
        let weekDaygeneralCampusToilets = calculateToilets(weekDaygeneralCampusOccupancy, 'plumbing.facility', values);
        let weekendDaygeneralCampusToilets = calculateToilets(weekendDaygeneralCampusOccupancy, 'plumbing.facility', values);

        //Restroom handwash sink 
        let lodgingRestroomSink = calculateRestroomSink(lodgingOccupancy, 'plumbing.lodging', values, 0.25);
        let hospitalAdminRestroomSink = calculateRestroomSink(hospitalAdminOccupancy, 'plumbing.hospital', values, 0.125);
        let hospitalStaffRestroomSink = calculateRestroomSink(hospitalStaffOccupancy, 'plumbing.hospital', values, 1.05);
        let hospitalOutPatientRestroomSink = calculateRestroomSink(hospitalOutPatientOccupancy, 'plumbing.hospital', values, 0.125);
        let hospitalInPatientRestroomSink = calculateRestroomSink(hospitalInPatientOccupancy, 'plumbing.hospital', values, 0.125);
        let weekDaygeneralCampusRestroomSink = calculateRestroomSink(weekDaygeneralCampusOccupancy, 'plumbing.facility', values, 0.125);
        let weekendDaygeneralCampusRestroomSink = calculateRestroomSink(weekendDaygeneralCampusOccupancy, 'plumbing.facility', values, 0.125);
        
        //Kitchenette sinks
        let lodgingKitchenSink = calculateKitchenSink('plumbing.lodging', values, 'lodging', 0.25);
        let hospitalAdminKitchenSink = calculateKitchenSink('plumbing.hospital', values, 'admin', 0.5);
        let hospitalStaffKitchenSink = calculateKitchenSink('plumbing.hospital', values, 'staff', 0.5);
        let hospitalOutPatientKitchenSink = calculateKitchenSink('plumbing.hospital', values,'outPatient', 0);
        let hospitalInPatientKitchenSink = calculateKitchenSink('plumbing.hospital', values, 'inPatient', 0);
        let weekDaygeneralCampusKitchenSink = calculateKitchenSink('plumbing.facility', values, 'weekday', 0.5);
        let weekendDaygeneralCampusKitchenSink = calculateKitchenSink('plumbing.facility', values,'weekend', 0.5);

        //Showers
        let lodgingShowers = calculateShowers('plumbing.lodging', values, 'lodging', 7.8);
        let hospitalAdminShowers = calculateShowers('plumbing.hospital', values, 'admin', 5.3);
        let hospitalStaffShowers = calculateShowers('plumbing.hospital', values, 'staff', 5.3);
        let hospitalOutPatientShowers = calculateShowers('plumbing.hospital', values,'outPatient', 0);
        let hospitalInPatientShowers = calculateShowers('plumbing.hospital', values, 'inPatient', 7.8);
        let weekDaygeneralCampusShowers = calculateShowers('plumbing.facility', values, 'weekday', 5.3);
        let weekendDaygeneralCampusShowers = calculateShowers('plumbing.facility', values,'weekend', 5.3);

        let totalPlumbingLodging =  lodgingUrinals + lodgingToilets + lodgingRestroomSink + lodgingKitchenSink + lodgingShowers;
        let totalPlumbingHospitalAdmin = hospitalAdminUrinals + hospitalAdminToilets + hospitalAdminRestroomSink + hospitalAdminKitchenSink + hospitalAdminShowers;
        let totalPlumbingHospitalStaffShowers = hospitalStaffUrinals + hospitalStaffToilets + hospitalStaffRestroomSink + hospitalStaffKitchenSink + hospitalStaffShowers;
        let totalPlumbingHospitalOutPatient = hospitalOutPatientUrinals + hospitalOutPatientToilets + hospitalOutPatientRestroomSink + hospitalOutPatientKitchenSink + hospitalOutPatientShowers;
        let totalPlumbinghospitalInPatient = hospitalInPatientUrinals + hospitalInPatientToilets + hospitalInPatientRestroomSink + hospitalInPatientKitchenSink + hospitalInPatientShowers
        let totalPlumbingWeek = weekDaygeneralCampusUrinals + weekDaygeneralCampusToilets + weekDaygeneralCampusRestroomSink + weekDaygeneralCampusKitchenSink + weekDaygeneralCampusShowers;
        let totalPlumbingWeekend = weekendDaygeneralCampusUrinals + weekendDaygeneralCampusToilets + weekendDaygeneralCampusRestroomSink + weekendDaygeneralCampusKitchenSink + weekendDaygeneralCampusShowers;


        let totalWaterUse = totalPlumbingLodging + totalPlumbingHospitalAdmin + totalPlumbingHospitalStaffShowers + totalPlumbingHospitalOutPatient + totalPlumbinghospitalInPatient + totalPlumbingWeek + totalPlumbingWeekend;  
        let totalHospital = totalPlumbingHospitalAdmin + totalPlumbingHospitalStaffShowers + totalPlumbingHospitalOutPatient + totalPlumbinghospitalInPatient;
        let totalOverall = totalPlumbingWeek + totalPlumbingWeekend;

        let formatTotal = numberFormat.format(totalWaterUse);
        let formatTotalLodging = numberFormat.format(totalPlumbingLodging);
        let formatTotalHospital = numberFormat.format(totalHospital);
        let formatTotalOverall = numberFormat.format(totalOverall);

        values.plumbing.lodging_water_usage = formatTotalLodging;
        values.plumbing.hospital_water_usage = formatTotalHospital;
        values.plumbing.overall_water_usage = formatTotalOverall;
        
        values.plumbing.water_usage = formatTotal; 

        this.setState({
            waterUse: " Water Use:" + formatTotal + " kgal"
        });

    };
    
    onSubmit = values => {};

    flushRate = (basePath, values, source, title, people) => {
         let flowRate = selectn(`${basePath}.shower_flow_rate`)(values);
         return (<Fragment>
            <Typography variant="subtitle1" style={subHeader} gutterBottom>{title}</Typography>
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
                            endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
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
                            endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
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
                            endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
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
            <Grid item xs={12}>
                <Field
                    formControlProps={{fullWidth: true}}
                    disabled
                    name={`${basePath}.total_occupants`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Average daily hospital/clinic occupancy"
                    >
                </Field>
            </Grid>
            {selectn(`${basePath}.inpatient_per_day`)(values) != undefined && selectn(`${basePath}.daily_staff`)(values) != undefined && (
                this.calulateTotalOccupants(values, basePath)
            )}
            {selectn(`${basePath}.inpatient_per_day`)(values) == 0 && (
                this.clearValues(['shower_usage_inpatient'], basePath, values)
            )}
        </Fragment>);
    }

    fixtureInformation = (values) => {
        return(<Fragment>
            <Grid item xs={12}>
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
                <Divider variant="middle" style={{'margin': '16px'}}/>
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
            <Grid item xs={12} sm={3}>
                <Field
                    fullWidth
                    disabled
                    name="plumbing.lodging_water_usage"
                    label="On-Site Lodging Water Use"
                    component={MaterialInput}
                    type="text"
                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Field
                    fullWidth
                    disabled
                    name="plumbing.hospital_water_usage"
                    label="Hospital/Medical Clinic Water Use"
                    component={MaterialInput}
                    type="text"
                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Field
                    fullWidth
                    disabled
                    name="plumbing.overall_water_usage"
                    label="Overall Campus Water Use"
                    component={MaterialInput}
                    type="text"
                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <Field
                    fullWidth
                    disabled
                    name="plumbing.water_usage"
                    label="Total Water Use"
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
                                        style={fabStyle}
                                    >
                                    {this.state.waterUse}
                                    </Fab>
                                )}
                            <FormRulesListener handleFormChange={applyRules}/>
                        </form>
                    )}
                /> 
            </Fragment>);
        }
    }

export default (PlumbingForm);