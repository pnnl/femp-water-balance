import React, {Fragment} from 'react';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox, Select} from 'final-form-material-ui';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MaterialInput from './MaterialInput';
import selectn from 'selectn';

import {
    Grid,
    Button,
    FormControlLabel,
    InputAdornment,
    Switch,
    MenuItem
} from '@material-ui/core';

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

class KitchensForm extends React.Component {
    renderMetered = (values, basePath) => {
        const isMetered = selectn(`${basePath}.is_metered`)(values);
        const facilityType = selectn(`${basePath}.facility_type`)(values);

         return (<Fragment>
            {isMetered && facilityType === 'stand_alone' && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        name={`${basePath}.total_annual`}
                        component={MaterialInput}
                        type="text"
                        label="Total annual water use"
                        endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        >
                    </Field>
                </Grid>
            )}
        </Fragment>);
    }

    renderFacilityTypeResponse = (values, basePath) => {
       const facilityType = selectn(`${basePath}.facility_type`)(values);
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
                    </Grid>
                )}

            {this.renderMetered(values, basePath)}

            {facilityType === 'incorporated' && (
                <Grid item xs={12}>
                    <Field
                        formControlProps={{fullWidth: true}}
                        name={`${basePath}.average_meals`}
                        component={MaterialInput}
                        type="text"
                        label="Average number of meals prepared per weekday (M-F)"
                        >
                    </Field>
                </Grid>
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
         const baseObject = values.kitchen_facility;

        if (values.kitchen_facilities === true) {
            return( <Fragment>
                    <Grid item xs={12}>
                        <ExpansionPanel expanded = {true}>
                            <ExpansionPanelSummary>
                                <Field
                                    fullWidth
                                    required
                                    name={`kitchen_facility.facility_name`}
                                    component={MaterialInput}
                                    type="text"
                                    label="Facility name"/>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                             <Grid container alignItems="flex-start" spacing={16}>
                                <Grid item xs={12}>
                                    <Field
                                        formControlProps={{fullWidth: true}}
                                        name={'kitchen_facility.facility_type'}
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
                                {selectn('kitchen_facility.facility_type')(values) && this.renderFacilityTypeResponse(values, 'kitchen_facility')}
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Grid>
                </Fragment>);
        }
    }

    render() {
        const {campus, applyRules} = this.props;
        return (
            <Form
                onSubmit={this.onSubmit}
                initialValues={campus}
                render={({handleSubmit, reset, submitting, pristine, values}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    label="My campus has commercial kitchen facilities?"
                                    control={
                                        <Field
                                            name="kitchen_facilities"
                                            component={Checkbox}
                                            indeterminate={values.kitchen_facilities === undefined}
                                            type="checkbox"
                                        />
                                    }
                                />
                            </Grid>
                            {this.renderFacilityTypes(values)}
                        </Grid>
                    </form>
                )}
           />
        );
    }
}

export default (KitchensForm);