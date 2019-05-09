import React, {Fragment} from 'react';
import {Form, Field} from 'react-final-form';
import {TextField, Checkbox, Radio, Select} from 'final-form-material-ui';
import {
    Paper,
    Grid,
    Button,
    RadioGroup,
    FormLabel,
    MenuItem,
    FormGroup,
    FormControl,
    FormControlLabel,
    Typography,
    Switch
} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const validate = values => {
    const errors = {};
    if (!values.name) {
        errors.name = 'Required';
    }
    return errors;
};

const ToggleAdapter = ({input: {onChange, value}, label, ...rest}) => (
    <FormControlLabel
        control={<Switch checked={value} onChange={(event, isInputChecked) => onChange(isInputChecked)}
                         value={value} {...rest} />}
        label={label}
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

    renderCentralFacilitiesQuestions = (values) => {
        if (values.vw_central_facilities) {
            return (
                <Fragment>
                    <Grid item xs={12}>
                        <FormControlLabel
                            label="Is the water metered?"
                            control={
                                <Field
                                    name="module[central_facilities].metered"
                                    component={Checkbox}
                                    indeterminate={values.module['central_facilities'].metered === undefined}
                                    type="checkbox"
                                />
                            }
                        />
                    </Grid>
                    {values.module['central_facilities'].metered && (
                        <Grid item xs={12}>
                            <Field
                                fullWidth
                                required
                                name="module[central_facilities].water_usage"
                                component={TextField}
                                type="text"
                                label="Enter the total annual water use for all central facilities"
                            />
                        </Grid>
                    )}
                    {(values.module['central_facilities'].metered === false) && (
                            <Grid container>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].weekly_washes"
                                    component={TextField}
                                    type="text"
                                    label="Total number of vehicles washed per week"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].monthly_washes"
                                    component={TextField}
                                    type="text"
                                    label="Total number of weeks vehicles washed per month"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].wash_time"
                                    component={TextField}
                                    type="text"
                                    label="Approximate wash time per vehicle in minutes"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].month_count"
                                    component={TextField}
                                    type="text"
                                    label="Number of months vehicles washed per year"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].nozzle_rating"
                                    component={TextField}
                                    type="text"
                                    label="Nozzle Rating (gpm)"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="module[central_facilities].recycled"
                                    component={TextField}
                                    type="text"
                                    label="Percentage of water recycled/reused if any"
                                />
                            </Grid>
                            </Grid>
                    )}
                </Fragment>
            );

        }
        return '';
    };

    render() {
        const {campus} = this.props;
        const formModules = {module: {central_facilities: {}}};
        return (
            <Form
                onSubmit={this.onSubmit}
                initialValues={Object.assign({}, formModules, campus)}
                validate={validate}
                render={({handleSubmit, reset, submitting, pristine, values}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Paper style={{padding: 16}}>
                            <div>{values.vw_facilities}</div>
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
                                {values.vw_facilities && (
                                    <Grid item xs={12}>
                                    <ExpansionPanel expanded={values.vw_central_facilities === true} >
                                        <ExpansionPanelSummary>
                                            <Field
                                                name="vw_central_facilities"
                                                label="My campus has central vehicle wash facilities?"
                                                component={ToggleAdapter}
                                                type="checkbox"
                                            />
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Grid container alignItems="flex-start" spacing={16}>
                                                <Grid item xs={12}>
                                                    {this.renderCentralFacilitiesQuestions(values)}
                                                </Grid>
                                            </Grid>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                    </Grid>
                                )}
                                {values.vw_central_facilities && (
                                    <Grid item xs={12}>
                                        <ExpansionPanel expanded={values.vw_automated_facilities === true} >
                                            <ExpansionPanelSummary>
                                                <Field
                                                    name="vw_automated_facilities"
                                                    label="My campus has individual automated car washes?"
                                                    component={ToggleAdapter}
                                                    type="checkbox"
                                                />
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <Grid container alignItems="flex-start" spacing={16}>
                                                    <Grid item xs={12}>
                                                        XXXXX
                                                    </Grid>
                                                </Grid>
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    </Grid>
                                )}

                                <Grid item style={{marginTop: 16}}>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        onClick={reset}
                                        disabled={submitting || pristine}
                                    >
                                        Reset
                                    </Button>
                                </Grid>
                                <Grid item style={{marginTop: 16}}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                        <pre className="code">{JSON.stringify(values, 0, 2)}</pre>
                    </form>
                )}
            />
        );
    }
}

export default VehicleWashForm;
