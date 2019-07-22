import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import {
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

import formValidation from './VehicleWashForm.validation';

const DEFAULT_NUMBER_MASK = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    integerLimit: 10,
    allowDecimal: false
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


class VehicleWashForm extends React.Component {
    onSubmit = values => {
        const {onSubmit} = this.props;
        if (onSubmit) {
            onSubmit(values);
        } else {
            window.alert(JSON.stringify(values, 0, 2));
        }
    };

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
                        endAdornment={<InputAdornment position="end">G.P.M</InputAdornment>}
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
                        endAdornment={<InputAdornment position="end">G.P.M</InputAdornment>}
                    />
                </Grid>
            )}
        </Fragment>);
    };

    renderFacilityForm = (values, basePath) => {
        const isMetered = selectn(`${basePath}.metered`)(values);
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
                            label="Total annual water use for all vehicle wash facilities on campus"
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
                                mask={DEFAULT_NUMBER_MASK}
                                label="Estimated water use per vehicle (gpv)"
                                endAdornment={<InputAdornment position="end">Gallons</InputAdornment>}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name={`${basePath}.recycled`}
                                component={MaterialInput}
                                type="text"
                                mask={[/\d/, /\d/, /\d/]}
                                label="Percentage of water recycled/reused (if any)"
                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            />
                        </Grid>
                    </Fragment>
                )}
            </Fragment>
        );
    };

    renderWaterMeteredControl = (basePath, values, indeterminate = false) => (
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
        </Grid>
    );

    renderFormInputs = (values) => {
        const elements = [];
        const baseObject = values.vehicle_wash;

        if (values.vw_facilities === true) {
            return (<Fragment>
                <Grid item xs={12}>
                    <ExpansionPanel expanded={baseObject['auto_wash_facilities'] === true}>
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
                <Grid item xs={12}>
                    <ExpansionPanel expanded={baseObject['conveyor_facilities'] === true}>
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
                                        type="text"
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
                <Grid item xs={12}>
                    <ExpansionPanel expanded={baseObject['wash_pad_facilities'] === true}>
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
                                        type="text"
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
                <Grid item xs={12}>
                    <ExpansionPanel expanded={baseObject['large_facilities'] === true}>
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
            </Fragment>);
        }
        return elements;
    };

    render() {
        const {campus, applyRules} = this.props;
        return (<Fragment>
            <Typography variant="h5" gutterBottom>Vehicle Wash</Typography>
            <Typography variant="body2" gutterBottom>Enter the following information only for vehicle wash facilities that use potable water on the campus</Typography>
            <Form
                onSubmit={this.onSubmit}
                initialValues={campus}
                validate={formValidation}
                render={({handleSubmit, reset, submitting, pristine, values}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has vehicle wash facilities?"
                                    control={
                                        <Field
                                            name="vw_facilities"
                                            component={Checkbox}
                                            indeterminate={values.vw_facilities === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.renderFormInputs(values)}
                        </Grid>
                        <FormRulesListener handleFormChange={applyRules}/>
                    </form>
                )}
            />
        </Fragment>);
    }
}

export default VehicleWashForm;
