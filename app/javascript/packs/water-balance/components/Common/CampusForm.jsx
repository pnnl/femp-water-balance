import React from 'react';
import ReactDOM from 'react-dom';
import { Form, Field } from 'react-final-form';
import { TextField, Checkbox, Radio, Select } from 'final-form-material-ui';
import {
    Typography,
    Paper,
    Link,
    Grid,
    Button,
    CssBaseline,
    RadioGroup,
    FormLabel,
    MenuItem,
    FormGroup,
    FormControl,
    FormControlLabel,
} from '@material-ui/core';
// Picker
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    TimePicker,
    DatePicker,
} from 'material-ui-pickers';

function DatePickerWrapper(props) {
    const {
        input: { name, onChange, value, ...restInput },
        meta,
        ...rest
    } = props;
    const showError =
        ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
        meta.touched;

    return (
        <DatePicker
            {...rest}
            name={name}
            helperText={showError ? meta.error || meta.submitError : undefined}
            error={showError}
            inputProps={restInput}
            onChange={onChange}
            value={value === '' ? null : value}
        />
    );
}

function TimePickerWrapper(props) {
    const {
        input: { name, onChange, value, ...restInput },
        meta,
        ...rest
    } = props;
    const showError =
        ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
        meta.touched;

    return (
        <TimePicker
            {...rest}
            name={name}
            helperText={showError ? meta.error || meta.submitError : undefined}
            error={showError}
            inputProps={restInput}
            onChange={onChange}
            value={value === '' ? null : value}
        />
    );
}

const onSubmit = async values => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(300);
    window.alert(JSON.stringify(values, 0, 2));
};
const validate = values => {
    const errors = {};
    if (!values.name) {
        errors.name = 'Required';
    }
    return errors;
};

class CampusForm extends React.Component  {

    onSubmit = values => {
        const { onSubmit } = this.props;
        if (onSubmit){
            onSubmit(values);
        } else {
            window.alert(JSON.stringify(values, 0, 2));
        }
    };

    render() {
        const { campus } = this.props;
        return (
            <Form
                onSubmit={this.onSubmit}
                initialValues={campus}
                validate={validate}
                render={({handleSubmit, reset, submitting, pristine, values}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Paper style={{padding: 16}}>
                            <Grid container alignItems="flex-start" spacing={8}>
                                <Grid item xs={6}>
                                    <Field
                                        fullWidth
                                        required
                                        name="name"
                                        component={TextField}
                                        type="text"
                                        label="Name"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Field
                                        fullWidth
                                        required
                                        name="lastName"
                                        component={TextField}
                                        type="text"
                                        label="Last Name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        name="email"
                                        fullWidth
                                        required
                                        component={TextField}
                                        type="email"
                                        label="Email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        label="Employed"
                                        control={
                                            <Field
                                                name="employed"
                                                component={Checkbox}
                                                type="checkbox"
                                            />
                                        }
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Best Stooge</FormLabel>
                                        <RadioGroup row>
                                            <FormControlLabel
                                                label="Larry"
                                                control={
                                                    <Field
                                                        name="stooge"
                                                        component={Radio}
                                                        type="radio"
                                                        value="larry"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="Moe"
                                                control={
                                                    <Field
                                                        name="stooge"
                                                        component={Radio}
                                                        type="radio"
                                                        value="moe"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="Curly"
                                                control={
                                                    <Field
                                                        name="stooge"
                                                        component={Radio}
                                                        type="radio"
                                                        value="curly"
                                                    />
                                                }
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Sauces</FormLabel>
                                        <FormGroup row>
                                            <FormControlLabel
                                                label="Ketchup"
                                                control={
                                                    <Field
                                                        name="sauces"
                                                        component={Checkbox}
                                                        type="checkbox"
                                                        value="ketchup"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="Mustard"
                                                control={
                                                    <Field
                                                        name="sauces"
                                                        component={Checkbox}
                                                        type="checkbox"
                                                        value="mustard"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="Salsa"
                                                control={
                                                    <Field
                                                        name="sauces"
                                                        component={Checkbox}
                                                        type="checkbox"
                                                        value="salsa"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="Guacamole 🥑"
                                                control={
                                                    <Field
                                                        name="sauces"
                                                        component={Checkbox}
                                                        type="checkbox"
                                                        value="guacamole"
                                                    />
                                                }
                                            />
                                        </FormGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        name="notes"
                                        component={TextField}
                                        multiline
                                        label="Notes"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        fullWidth
                                        name="city"
                                        component={Select}
                                        label="Select a City"
                                        formControlProps={{fullWidth: true}}
                                    >
                                        <MenuItem value="London">London</MenuItem>
                                        <MenuItem value="Paris">Paris</MenuItem>
                                        <MenuItem value="Budapest">
                                            A city with a very long Name
                                        </MenuItem>
                                    </Field>
                                </Grid>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <Grid item xs={6}>
                                        <Field
                                            name="rendez-vous"
                                            component={DatePickerWrapper}
                                            fullWidth
                                            margin="normal"
                                            label="Rendez-vous"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Field
                                            name="alarm"
                                            component={TimePickerWrapper}
                                            fullWidth
                                            margin="normal"
                                            label="Alarm"
                                        />
                                    </Grid>
                                </MuiPickersUtilsProvider>
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
                        <pre>{JSON.stringify(values, 0, 2)}</pre>
                    </form>
                )}
            />
        );
    }
}
export default CampusForm;
