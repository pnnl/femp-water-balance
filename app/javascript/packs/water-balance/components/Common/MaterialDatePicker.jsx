import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from "classnames";
import moment from 'moment-timezone';
import {
    InputAdornment,
    Icon,
    FormControl,
    FormHelperText,
    IconButton
} from '@material-ui/core';
import { DatePicker } from 'material-ui-pickers';
import customInputStyle from './customInputStyles';

class MaterialDatePicker extends React.Component {

    handleChange = (date) => {
        const { input: { onChange } } = this.props;
        if (onChange) {
            onChange(date);
        }
    };

    render() {
        const { classes, disabled, dateFormat, placeholder, helperText, label, required, minDate, maxDate } = this.props || {};
        // redux-form or final form properties we are proxying
        const { input: { onBlur, onFocus, value }, meta: { dirty, error, warning }} = this.props || {};

        const displayError = (dirty && Boolean(error));
        const displayWarning = (Boolean(warning));
        const displaySuccess = (dirty && !Boolean(error));
        const formControlProps = { fullWidth: true, error: displayError, required: required, disabled: Boolean(disabled || false) };
        const labelClasses = classNames({
            [" " + classes.labelRootError]: displayError,
            [" " + classes.labelRootWarning]: displayWarning,
            [" " + classes.labelRootSuccess]: displaySuccess
        });


        return (
            <FormControl className={formControlProps.className + " " + classes.formControl} {...formControlProps} >
                <DatePicker
                    keyboard={false}
                    clearable={!required}
                    value={value ? moment(value) : null}
                    emptyLabel={placeholder}
                    showTodayButton={true}
                    onChange={this.handleChange}
                    animateYearScrolling={false}
                    format={dateFormat}
                    DialogProps={
                        {
                            disableBackdropClick : true
                        }
                    }
                    {...{helperText, label, minDate, maxDate, onBlur, onFocus}}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton>
                                    <Icon>today</Icon>
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                {displayWarning && (
                    <FormHelperText className={classes.labelRoot + labelClasses}>{warning}</FormHelperText>
                )}
                {displayError && (
                    <FormHelperText className={classes.labelRoot + labelClasses}>{error}</FormHelperText>
                )}
            </FormControl>
        );
    }
}

MaterialDatePicker.defaultProps = {
    input: { value: "" },
    meta: {},
    format: "MM/DD/YYYY",
};

MaterialDatePicker.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    input: PropTypes.object,
    meta: PropTypes.object,
    format: PropTypes.string,
    placeholder: PropTypes.string,

    minDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    maxDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    helperText: PropTypes.node,
    label: PropTypes.node
};

export default withStyles(customInputStyle, { withTheme: true })(MaterialDatePicker);
