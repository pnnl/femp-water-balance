import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
 } from '@material-ui/core';

import MaterialDateTimePicker from './MaterialDateTimePicker';
import MaterialDatePicker from './MaterialDatePicker';
import MaterialTimePicker from './MaterialTimePicker';

class MaterialDateRangePicker extends React.Component {

  handleChange = (date, index) => {
    const { input: { onChange, value } } = this.props;
    if (onChange) {
      let copy = Array.from(value);
      copy[index] = date;
      onChange(copy);
    }
  };

  subcomponentProperties = (index) => {
    const { disabled, placeholder, helperText, label, timezone, dateFormat, dateTimeFormat, timeFormat, primaryLabel, secondaryLabel, primaryHelperText, secondaryHelperText} = this.props || {};
    // redux-form properties we are proxying
    const { input: { onBlur, onFocus, value }, meta: { dirty, error, warning }} = this.props || {};
    const inputPlaceholder = null;
    const inputHelperText = (index === 0 ? primaryHelperText : secondaryHelperText) || helperText;
    const inputLabel = (index === 0 ? primaryLabel : secondaryLabel) || label;
    return {
      ...{disabled, timezone, dateFormat, dateTimeFormat, timeFormat},
      label: inputLabel,
      helperText: inputHelperText,
      input: {
        onBlur: onBlur,
        onFocus: onFocus,
        value: value[index],
        onChange: (date) => this.handleChange(date, index)
      },
      meta: {
        ...{dirty, error, warning}
      }
    };
  }

  render() {
    const { pickerType,dateFormat, timeFormat, dateTimeFormat } = this.props || {};
    const { input: { value } } = this.props || {};
    const componentMap = {
      'date': MaterialDatePicker,
      'time': MaterialTimePicker,
      'date-time': MaterialDateTimePicker,
    };
    const PickerComponent = componentMap[pickerType]
    return (
      <Grid container spacing={16} alignItems="center" justify="flex-start">
        <Grid item xs={6}>
          <PickerComponent {...this.subcomponentProperties(0)} {...{dateFormat, timeFormat, dateTimeFormat}} maxDate={value[1]} />
        </Grid>
        <Grid item xs={6}>
          <PickerComponent {...this.subcomponentProperties(1)} {...{dateFormat, timeFormat, dateTimeFormat}} minDate={value[0]} />
        </Grid>
      </Grid>
    );
  }
}

MaterialDateRangePicker.defaultProps = {
  input: { value: "" },
  meta: {},
  format: "MM/DD/YYYY",
  pickerType: 'date-time'
};

MaterialDateRangePicker.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  format: PropTypes.string,
  helperText: PropTypes.node,
  label: PropTypes.node
};

export default MaterialDateRangePicker;
