import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {
    Fab,
    Icon,
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    Switch,
    MenuItem
} from '@material-ui/core';
import selectn from 'selectn';
import MaterialInput from './MaterialInput';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import createDecorator from 'final-form-focus';
import {submitAlert} from './submitAlert'

import formValidation from './VehicleWashForm.validation';

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

const focusOnError = createDecorator ()

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

const recycledCalculation = (valuePath, values) => {
    let waterUsage = toNumber(selectn(`${valuePath}.water_usage`)(values));
    let metered = selectn(`${valuePath}.metered`)(values)
    
    if(metered == "yes") {
        return (waterUsage);
    } 

    let vpw = toNumber(selectn(`${valuePath}.vpw`)(values));
    let gpv = toNumber(selectn(`${valuePath}.gpv`)(values));
    let wpy = toNumber(selectn(`${valuePath}.wpy`)(values));
    let recycled = toNumber(selectn(`${valuePath}.recycled`)(values));

    return (vpw * wpy * gpv * (1 - (recycled)/100))/1000;
}

const nonRecycledCalculation = (valuePath, values) => {
    let waterUsage = toNumber(selectn(`${valuePath}.water_usage`)(values));
    let metered = selectn(`${valuePath}.metered`)(values)
    
    if(metered == "yes") {
        return (waterUsage);
    } 

    let vpw = toNumber(selectn(`${valuePath}.vpw`)(values));
    let rating = toNumber(selectn(`${valuePath}.rating`)(values));
    let washTime = toNumber(selectn(`${valuePath}.wash_time`)(values));
    let wpy = toNumber(selectn(`${valuePath}.wpy`)(values));

    return (vpw * wpy * rating * washTime)/1000;
}

class VehicleWashForm extends React.Component {

     constructor(props) {
        super(props);
        let waterUse = selectn(`campus.modules.vehicle_wash.vehicle_wash.water_use`)(props);
        
        this.state = {
            waterUse: waterUse? " Water Use: " + waterUse + " kgal" : '' 
        };
        this.calculateWaterUse = this.calculateWaterUse.bind(this);
    }

    clearValues = (clearValues, basePath, values) => {
        let field = basePath.replace("vehicle_wash.", '');
        for(let i = 0; i < clearValues.length; i++) {
            values['vehicle_wash'][field][clearValues[i]] = null;  
        }
    }
    
    clearSection = (values, name) => {
        if(values['vehicle_wash'][name] != undefined) {
            if(!(Object.keys(values['vehicle_wash'][name]).length === 0)) {
                values['vehicle_wash'][name] = null;  
            }
        }
    }


    calculateWaterUse = (values, valid) => {
        if(!valid) {
            window.alert("Missing or incorrect values.");
            return;
        }
        let valuePath = 'vehicle_wash.auto_wash';
        let autoWash = recycledCalculation(valuePath, values) || 0;
        
        valuePath = 'vehicle_wash.conveyor';
        let conveyor = recycledCalculation(valuePath, values) || 0;

        valuePath = 'vehicle_wash.wash_pads';
        let washPads = nonRecycledCalculation(valuePath, values) || 0;

        valuePath = 'vehicle_wash.large_vehicles';
        let LargeVehicle = recycledCalculation(valuePath, values) || 0;

        let total = autoWash + conveyor + washPads + LargeVehicle;
        let roundTotal = Math.round( total * 10) / 10;
        values.vehicle_wash.water_use = roundTotal; 

        this.setState({
            waterUse: " Water Use: " + roundTotal + " kgal"
        });

    };

    onSubmit = values => {};

    renderWashpadForm = (values, basePath) => {
        const washpadType = selectn(`${basePath}.type`)(values);
        return (<Fragment>
            <Grid item xs={12}>
                <Field
                    fullWidth
                    required
                    name={`${basePath}.vpw`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Average number of vehicles washed per week"
                    endAdornment={<InputAdornment position="end">Vehicles</InputAdornment>}
                />
            </Grid>
            <Grid item xs={12}>
                <Field
                    fullWidth
                    required
                    name={`${basePath}.wpy`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Total number of weeks per year vehicles are washed "
                    endAdornment={<InputAdornment position="end">Washes</InputAdornment>}
                />
            </Grid>
            <Grid item xs={12}>
                <Field
                    fullWidth
                    required
                    name={`${basePath}.wash_time`}
                    component={MaterialInput}
                    type="text"
                    mask={DEFAULT_NUMBER_MASK}
                    label="Approximate wash time per vehicle"
                    endAdornment={<InputAdornment position="end">Minutes</InputAdornment>}
                />
            </Grid>
            {washpadType === 'open_hose' && (
                <Grid item xs={12}>
                    <Field
                        fullWidth
                        required
                        name={`${basePath}.rating`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="Flow rate of the open hose"
                        endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
                    />
                </Grid>
            )}
            {washpadType === 'pressure_washer' && (
                <Grid item xs={12}>
                    <Field
                        fullWidth
                        required
                        name={`${basePath}.rating`}
                        component={MaterialInput}
                        type="text"
                        mask={DEFAULT_NUMBER_MASK}
                        label="Nozzle rating of pressure washer"
                        endAdornment={<InputAdornment position="end">gpm</InputAdornment>}
                    />
                </Grid>
            )}
        </Fragment>);
    };

    renderFacilityForm = (values, basePath) => {
        const isMetered = selectn(`${basePath}.metered`)(values);
        const year = new Date(values.survey).getFullYear();
        return (
            <Fragment>
                {this.renderWaterMeteredControl(basePath,values, true)}
                {isMetered === "yes" && (
                    <Grid item xs={12}>
                        <Field
                            fullWidth
                            required
                            name={`${basePath}.water_usage`}
                            component={MaterialInput}
                            type="text"
                            mask={DEFAULT_NUMBER_MASK}
                            label={`${year} total annual water use for all vehicle wash facilities on campus`}
                            endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        />
                    </Grid>
                )}
                {isMetered === "no" && (
                    <Fragment>
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name={`${basePath}.vpw`}
                                component={MaterialInput}
                                type="text"
                                mask={DEFAULT_NUMBER_MASK}
                                label="Average number of vehicles washed per week"
                                endAdornment={<InputAdornment position="end">Vehicles</InputAdornment>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name={`${basePath}.wpy`}
                                component={MaterialInput}
                                type="text"
                                mask={DEFAULT_NUMBER_MASK}
                                label="Total number of weeks per year vehicles are washed "
                                endAdornment={<InputAdornment position="end">Washes</InputAdornment>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name={`${basePath}.gpv`}
                                component={MaterialInput}
                                type="text"
                                mask={DEFAULT_DECIMAL_MASK}
                                label="Estimated water use per vehicle"
                                endAdornment={<InputAdornment position="end">gpv</InputAdornment>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name={`${basePath}.recycled`}
                                component={MaterialInput}
                                type="text"
                                mask={DEFAULT_DECIMAL_MASK}
                                label="Percentage of water recycled/reused (if any)"
                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            />
                        </Grid>
                    </Fragment>
                )}
            </Fragment>
        );
    };

    renderWaterMeteredControl = (basePath, values) => (
        <Grid item xs={12}>
              <Field
                    formControlProps={{fullWidth: true}}
                    required
                    name={`${basePath}.metered`}
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
                {selectn(`${basePath}.metered`)(values) == 'yes' && (
                    this.clearValues( ['vpw', 'wpy', 'gpv', 'recycled'], basePath, values)
                )}
                {selectn(`${basePath}.metered`)(values) == 'no' && (
                    this.clearValues( ['water_usage'], basePath, values)
                )}
        </Grid>
    );

    renderFormInputs = (values) => {
        const elements = [];

        if (selectn(`vehicle_wash.vw_facilities`)(values) === true) {
            return (<Fragment>
                <Grid item xs={12}>
                    <ExpansionPanel expanded={selectn(`vehicle_wash.auto_wash_facilities`)(values) === true}>
                        <ExpansionPanelSummary>
                            <Field
                                name="vehicle_wash.auto_wash_facilities"
                                label="This campus has individual in-bay automated vehicle wash facilities"
                                component={ToggleAdapter}
                                type="checkbox"
                            />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid container alignItems="flex-start" spacing={16}>
                                {this.renderFacilityForm(values, 'vehicle_wash.auto_wash')}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
                {selectn(`vehicle_wash.auto_wash_facilities`)(values) == false && (this.clearSection(values,"auto_wash"))}
                <Grid item xs={12}>
                    <ExpansionPanel expanded={selectn(`vehicle_wash.conveyor_facilities`)(values) === true}>
                        <ExpansionPanelSummary>
                            <Field
                                name="vehicle_wash.conveyor_facilities"
                                label="This campus has conveyor type friction washing or frictionless washing vehicle wash facilities"
                                component={ToggleAdapter}
                                type="checkbox"
                            />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid container alignItems="flex-start" spacing={16}>
                                <Grid item xs={12}>
                                    <Field
                                        formControlProps={{fullWidth: true}}
                                        required
                                        name="vehicle_wash.conveyor.type"
                                        component={Select}
                                        label="Conveyor type used for vehicle washes"
                                    >
                                        <MenuItem value="friction">
                                            Friction Washing
                                        </MenuItem>
                                        <MenuItem value="frictionless">
                                            Frictionless Washing
                                        </MenuItem>
                                    </Field>
                                </Grid>
                                {selectn('vehicle_wash.conveyor.type')(values) && (this.renderFacilityForm(values, 'vehicle_wash.conveyor'))}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
                {selectn(`vehicle_wash.conveyor_facilities`)(values) == false && (this.clearSection(values,"conveyor"))}
                <Grid item xs={12}>
                    <ExpansionPanel expanded={selectn(`vehicle_wash.wash_pad_facilities`)(values) === true}>
                        <ExpansionPanelSummary>
                            <Field
                                name="vehicle_wash.wash_pad_facilities"
                                label="This campus has self-service wash pad(s)"
                                component={ToggleAdapter}
                                type="checkbox"
                            />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid container alignItems="flex-start" spacing={16}>
                                <Grid item xs={12}>
                                    <Field
                                        formControlProps={{fullWidth: true}}
                                        required
                                        name="vehicle_wash.wash_pads.type"
                                        component={Select}
                                        label="Are most vehicles using self-service wash pads washed with an open hose or with a pressure washer?"
                                    >

                                        <MenuItem value="open_hose">
                                            Open Hose
                                        </MenuItem>
                                        <MenuItem value="pressure_washer">
                                            Pressure Washer
                                        </MenuItem>
                                    </Field>
                                </Grid>
                                {selectn('vehicle_wash.wash_pads.type')(values) && this.renderWashpadForm(values, 'vehicle_wash.wash_pads')}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
                {selectn(`vehicle_wash.wash_pad_facilities`)(values) == false && (this.clearSection(values,"wash_pads"))}
                <Grid item xs={12}>
                    <ExpansionPanel expanded={selectn(`vehicle_wash.large_facilities`)(values) === true}>
                        <ExpansionPanelSummary>
                            <Field
                                name="vehicle_wash.large_facilities"
                                label="This campus has vehicle wash facilities for large vehicles such as semi-trucks, tracked vehicles, or aircraft?"
                                component={ToggleAdapter}
                                type="checkbox"
                            />
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid container alignItems="flex-start" spacing={16}>
                                {this.renderFacilityForm(values, 'vehicle_wash.large_vehicles')}
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
                {selectn(`vehicle_wash.large_facilities`)(values) == false && (this.clearSection(values,"large_vehicles"))}
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
                </Grid>
            </Fragment>);
        }
        return elements;
    };

    render() {
        const {createOrUpdateCampusModule, campus, applyRules} = this.props;

        const module = (campus) ? campus.modules.vehicle_wash : {};

        return (<Fragment>
            <Typography variant="h5" gutterBottom>Vehicle Wash </Typography>
            <Typography variant="body2" gutterBottom>Enter the following information only for vehicle wash facilities that use potable water on the campus</Typography>
            <Form
                noValidate
                onSubmit={this.onSubmit}
                initialValues={module}
                validate={formValidation}
                decorators={[focusOnError]}
                render={({handleSubmit, reset, submitting, pristine, values, valid}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has vehicle wash facilities?"
                                    control={
                                        <Field
                                            name="vehicle_wash.vw_facilities"
                                            component={Checkbox}
                                            indeterminate={selectn(`vehicle_wash.vw_facilities`)(values) === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.renderFormInputs(values)}
                            <Grid item xs={12}>
                                {(selectn(`vehicle_wash.vw_facilities`)(values) === false || selectn(`vehicle_wash.vw_facilities`)(values) === undefined) ? null : (<Fragment>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        onClick={() => this.calculateWaterUse(values, valid)}
                                    >
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

export default VehicleWashForm;