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

import isValid from 'date-fns/isValid';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import isWithinInterval from 'date-fns/isWithinInterval';

import { DatePicker } from 'material-ui-pickers';
import customInputStyle from '../inputStyles';

 const stylesWeekPicker = theme => ({
  dayWrapper: {
    position: 'relative',
  },
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: '0 2px',
    color: 'inherit',
  },
  customDayHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '2px',
    right: '2px',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: '50%',
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
  },
  highlightNonCurrentMonthDay: {
    color: '#676767',
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  firstHighlight: {
    extend: 'highlight',
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  },
  endHighlight: {
    extend: 'highlight',
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  },
  ...customInputStyle
});

class MaterialWeekPicker extends React.Component {

  handleChange = (date) => {
    const { input: { onChange } } = this.props;
    if (onChange) {
      onChange(date);
    }
  };

  formatWeekSelectLabel = (date, invalidLabel) => {
    if (date === null) {
      return '';
    }

    if (date instanceof moment) {
      date = date.toDate();
    }

    return date && isValid(date)
      ? `Week of ${format(startOfWeek(date), 'MMM Do')}`
      : invalidLabel;
  }

  renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
    const { classes } = this.props;

    if (date instanceof moment) {
      date = date.toDate();
    }

    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);

    const dayIsBetween = isWithinInterval(date, { start, end });
    const isFirstDay = isSameDay(date, start);
    const isLastDay = isSameDay(date, end);

    const wrapperClassName = classNames({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay,
    });

    const dayClassName = classNames(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
    });

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span> { format(date, 'D')} </span>
        </IconButton>
      </div>
    );
  }

  render() {
    const { classes, disabled, weekFormat, placeholder, helperText, label, required, minDate, maxDate } = this.props || {};
    // redux-form properties we are proxying
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
            renderDay={this.renderWrappedWeekDay}
            labelFunc={this.formatWeekSelectLabel}
            animateYearScrolling={false}
            format={weekFormat}
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
                    <Icon>date_range</Icon>
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

MaterialWeekPicker.defaultProps = {
  input: { value: "" },
  meta: {},
  format: "MM/DD/YYYY",
};

MaterialWeekPicker.propTypes = {
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

export default withStyles(stylesWeekPicker, { withTheme: true })(MaterialWeekPicker);
