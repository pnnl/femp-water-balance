import React from 'react';
import { Form, Field } from 'react-final-form';
import {
    Grid,
    Button,
} from '@material-ui/core';
import emailMask from 'text-mask-addons/dist/emailMask';
import MaterialInput from "./MaterialInput";
import MaterialDatePicker from "./MaterialDatePicker";


const validate = values => {
    const errors = {};
    const currentYear = new Date().getFullYear();
    if (!values.name) {
        errors.name = 'A name is required for creating a campus';
    }
    if (!values.evaluator) {
        errors.evaluator = 'An evaluator email adress is required for creating a new campus.';
    }
    if (!values.city) {
        errors.city = 'A city name is required for creating a new campus.';
    }
    if (!values.region) {
        errors.region = 'A state designation is required for creating a new campus.';
    }
    if (!values.year) {
        errors.year = 'A water supply year is required for creating a new campus';
    } else if(values.year < 2010 || values.year > currentYear ) {
        errors.year = 'Calendar year must be between 2010 and ' + currentYear + '.'
    }
    if (!values.postal_code) {
        errors.postal_code = 'A zip code is required for creating a new campus.';
    }
    return errors;
};

class CampusForm extends React.Component  {

    render() {
        const { createNewCampus, formId } = this.props;
        return (
            <Form
                onSubmit={createNewCampus}
                validate={validate}
                render={({handleSubmit, reset, submitting, pristine, invalid}) => (
                    <form id={formId} onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="name"
                                    component={MaterialInput}
                                    type="text"
                                    label="Campus Name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="evaluator"
                                    mask={emailMask}
                                    placeholder="user@example.org"
                                    component={MaterialInput}
                                    type="text"
                                    label="Campus Evaluator"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="survey"
                                    dateFormat="MM/DD/YYYY"
                                    component={MaterialDatePicker}
                                    type="text"
                                    label="Date of Evaluation"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="year"
                                    mask={[/\d/, /\d/, /\d/, /\d/]}
                                    component={MaterialInput}
                                    type="text"
                                    label="Water Supply Year"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="city"
                                    component={MaterialInput}
                                    type="text"
                                    label="City"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="region"
                                    component={MaterialInput}
                                    mask={[/[a-zA-Z]/, /[a-zA-Z]/]}
                                    type="text"
                                    label="State"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name="postal_code"
                                    component={MaterialInput}
                                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
                                    type="text"
                                    label="Zip Code"
                                />
                            </Grid>
                            <Grid item style={{marginTop: 16}}>
                                <Button
                                    type="button"
                                    onClick={reset}
                                    disabled={submitting || pristine}
                                >
                                    Reset
                                </Button>
                            </Grid>
                            <Grid item style={{marginTop: 16}}>
                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={submitting || pristine || invalid}
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            />
        );
    }
}
export default CampusForm;
