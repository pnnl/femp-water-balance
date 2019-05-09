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
 import { DateTimePicker } from 'material-ui-pickers';
 import customInputStyle from '../inputStyles';

class MaterialDateTimePicker extends React.Component {

  handleChange = (date) => {
    const { input: { onChange } } = this.props;
    if (onChange) {
      onChange(date);
    }
  };

  render() {
    const { classes, disabled, dateTimeFormat, placeholder, helperText, label, required, minDate, maxDate, timezone} = this.props || {};
    // redux-form properties we are proxying
    const { input: { onBlur, onFocus, value }, meta: { dirty, error, warning }} = this.props || {};

    const localeTimezone = timezone ? timezone : moment.tz.guess();
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
        <DateTimePicker
            keyboard={false}
            clearable={!required}
            value={value ? moment(value).tz(localeTimezone) : null}
            emptyLabel={placeholder}
            showTodayButton={true}
            onChange={this.handleChange}
            animateYearScrolling={false}
            format={dateTimeFormat}
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
                    <Icon>access_time</Icon>
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

MaterialDateTimePicker.defaultProps = {
  input: { value: "" },
  meta: {},
  format: "MM/DD/YYYY hh A",
};

MaterialDateTimePicker.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  input: PropTypes.object,
  meta: PropTypes.object,
  minDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  maxDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  format: PropTypes.string,
  helperText: PropTypes.node,
  label: PropTypes.node
};

export default withStyles(customInputStyle, { withTheme: true })(MaterialDateTimePicker);
