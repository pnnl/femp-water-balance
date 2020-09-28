import React from 'react';
import { Form, Field } from 'react-final-form';
import { Grid, Button, MenuItem} from '@material-ui/core';
import { Select } from 'final-form-material-ui';
import emailMask from 'text-mask-addons/dist/emailMask';
import MaterialInput from '../../MaterialInput';
import MaterialDatePicker from '../../MaterialDatePicker';

class CampusForm extends React.Component {
    validate = values => {
        const errors = {};
        const currentYear = new Date().getFullYear();
        if (!values.name) {
            errors.name = 'A name is required for creating a campus.';
        }
        if (!values.evaluator) {
            errors.evaluator =
                'An evaluator email address is required for a campus.';
        }
        if (!values.city) {
            errors.city = 'A city name is required for a campus.';
        }
        if (!values.region) {
            errors.region =
                'A state designation is required for a campus.';
        }
        if (!values.plumbing_level) {
            errors.plumbing_level =
                'A plumbing level designation is required for a campus.';
        }
        if (!values.year) {
            errors.year =
                'A water supply year is required for a campus';
        } else if (values.year < 2010 || values.year > currentYear) {
            errors.year =
                'Calendar year must be between 2010 and ' + currentYear + '.';
        }
        return errors;
    };

    render() {
        const { createNewCampus, formId, updateCampus, campus} = this.props;
        let onSubmit = undefined;
        if(campus && Object.keys(campus).length > 0) {
            onSubmit = updateCampus;
        } else {
            onSubmit = createNewCampus;
        }
        return (
            <Form
                onSubmit={onSubmit}
                initialValues={campus}
                validate={this.validate}
                render={({
                    handleSubmit,
                    reset,
                    submitting,
                    pristine,
                    invalid,
                    values,
                }) => (
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
                                    formControlProps={{fullWidth: true, required: true}}
                                    name="plumbing_level"
                                    component={Select}
                                    label="Will this campus use campus-wide or building level plumbing data?"
                                > 
                                    <MenuItem value='campus'>Campus</MenuItem>
                                    <MenuItem value='building'>Building</MenuItem>
                                </Field>
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
                            <Grid item style={{ marginTop: 16 }}>
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
