import React, {Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Form, Field, FormSpy} from 'react-final-form';
import {Checkbox} from 'final-form-material-ui';
import {
    Grid,
    FormControlLabel,
    InputAdornment,
} from '@material-ui/core';
import DateFnsUtils from "@date-io/date-fns";
import withWidth, {isWidthDown} from '@material-ui/core/withWidth';
import createDecorator from 'final-form-calculate';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import selectn from 'selectn';
import MaterialInput from './MaterialInput';
import formValidation from './VehicleWashForm.validation';

const DEFAULT_NUMBER_MASK = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    integerLimit: 10,
    allowDecimal: false
});

const numberFormat = new Intl.NumberFormat('en-US');

const toNumber = (value) => {
    if (value === undefined || value === null) {
        return 0;
    }
    return parseInt(value.replace(/,/g, ''));
};

const calculator = createDecorator(
    {
        field: /water_supply.ww\[\d+\]/,
        updates: {
            ws_ww_total: (minimumValue, allValues) =>
                numberFormat.format((allValues.water_supply.ww || []).reduce((sum, value) => {
                    const n = toNumber(value);
                    return sum + (isNaN(n) ? 0 : n);
                }, 0))
        }
    },
    {
        field: /water_supply.wu\[\d+\]/,
        updates: {
            ws_wu_total: (minimumValue, allValues) =>
                numberFormat.format((allValues.water_supply.wu || []).reduce((sum, value) => {
                    const n = toNumber(value);
                    return sum + (isNaN(n) ? 0 : n);
                }, 0))
        }
    },
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

class WaterSupplyForm extends React.Component {
    onSubmit = values => {
        const {onSubmit} = this.props;
        if (onSubmit) {
            onSubmit(values);
        } else {
            window.alert(JSON.stringify(values, 0, 2));
        }
    };

    renderFormInputs = (values) => {
        const elements = [];
        const baseObject = values.water_supply;
        const basePath = 'water_supply';
        const DateUtils = new DateFnsUtils();


        if (values.monthly_discharge === undefined && values.monthly_usage === undefined) {
            return (<Fragment>
                [PH]
            </Fragment>);
        } else if (values.monthly_discharge === true || values.monthly_usage === true) {
            const usageDiff = toNumber(values.ws_wu_total) - toNumber(values.potable_water);
            const overallUsageOK = (values.monthly_usage === true && usageDiff === 0) || values.monthly_usage === false;
            return (
                <Fragment>
                    {DateUtils.getMonthArray(new Date()).map((monthDate) => {
                            const rowDiff = toNumber(selectn(`${basePath}.wu[${DateUtils.getMonth(monthDate)}]`)(values)) - toNumber(selectn(`${basePath}.ww[${DateUtils.getMonth(monthDate)}]`)(values));
                            const hasWarning = (rowDiff < 0);
                            return (
                                <Fragment key={DateUtils.getMonth(monthDate)}>
                                    <Grid item xs={12} sm={4}>
                                        <Field
                                            fullWidth
                                            required
                                            name={`${basePath}.wu[${DateUtils.getMonth(monthDate)}]`}
                                            disabled={!values.monthly_usage}
                                            component={MaterialInput}
                                            type="text"
                                            mask={DEFAULT_NUMBER_MASK}
                                            label={`${DateUtils.getMonthText(monthDate)} Potable Water Usage`}
                                            endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Field
                                            fullWidth
                                            required
                                            disabled={!values.monthly_discharge}
                                            name={`${basePath}.ww[${DateUtils.getMonth(monthDate)}]`}
                                            component={MaterialInput}
                                            type="text"
                                            mask={DEFAULT_NUMBER_MASK}
                                            label={`${DateUtils.getMonthText(monthDate)} Waste Water Usage`}
                                            endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <MaterialInput disabled meta={{visited: true, error: hasWarning}}
                                                       helperText={`Difference in Water Usage & Waste Water for the month of ${DateUtils.getMonthText(monthDate)}`}
                                                       input={{value: numberFormat.format(rowDiff)}}
                                                       startAdornment={<InputAdornment position="start">Balance</InputAdornment>}
                                                       endAdornment={<InputAdornment position="end">kgal</InputAdornment>}/>
                                    </Grid>
                                </Fragment>
                            );
                        }
                    )}
                    <Grid item xs={12} sm={4}>
                        <Field
                            fullWidth
                            disabled
                            name="ws_wu_total"
                            component={MaterialInput}
                            type="text"
                            label={`Annual Potable Water Usage`}
                            meta={{visited: true, error: (overallUsageOK ? null : 'Annual water usage does not monthly water usage values.' )}}
                            endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Field
                            fullWidth
                            disabled
                            defaultValue="0"
                            name="ws_ww_total"
                            component={MaterialInput}
                            type="text"
                            label={`Annual Waste Water Usage`}
                            endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                        />
                    </Grid>
                </Fragment>
            );
        }
        return elements;
    };

    render() {
        const {campus, applyRules} = this.props;
        return (<Fragment>
            <Typography variant="h5" gutterBottom>Water Supply</Typography>
            <Typography variant="body2" gutterBottom>Enter the following information for potable water use (supply) for the campus.</Typography>
            <Typography variant="body2" gutterBottom>Optional - Enter the following information for wastewater discharge for the campus if it is available.</Typography>
            <Form
                onSubmit={this.onSubmit}
                decorators={[calculator]}
                initialValues={campus}
                validate={formValidation}
                render={({handleSubmit, reset, submitting, pristine, values}) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <Grid container alignItems="flex-start" spacing={16}>
                            <Grid item xs={12}>
                                <Field
                                    fullWidth
                                    required
                                    name={`potable_water`}
                                    component={MaterialInput}
                                    type="text"
                                    mask={DEFAULT_NUMBER_MASK}
                                    label="The total annual potable water use for the campus"
                                    endAdornment={<InputAdornment position="end">kgal</InputAdornment>}
                                />
                            </Grid>
                            {toNumber(values.potable_water) > 0 && (
                                <Fragment>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            label="Is the potable water use for the campus available by month?"
                                            control={
                                                <Field
                                                    name="monthly_usage"
                                                    component={Checkbox}
                                                    indeterminate={values.monthly_usage === undefined}
                                                    type="checkbox"
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            label="Is the waste water discharged for the campus available by month?"
                                            control={
                                                <Field
                                                    name="monthly_discharge"
                                                    component={Checkbox}
                                                    indeterminate={values.monthly_discharge === undefined}
                                                    type="checkbox"
                                                />
                                            }
                                        />
                                    </Grid>
                                    {this.renderFormInputs(values)}
                                </Fragment>
                            )}
                        </Grid>
                        <FormRulesListener handleFormChange={applyRules}/>
                    </form>
                )}
            />
        </Fragment>);
    }
}

export default withWidth()(WaterSupplyForm);
