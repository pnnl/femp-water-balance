import React from 'react';
import {FormSpy} from 'react-final-form';
import {FormControlLabel, Switch} from '@material-ui/core';

export const submitAlert = (valid, createOrUpdateCampusModule, values) => {
  if (valid || (!valid && window.confirm('There are missing or invalid values would you like to save?'))) {
    createOrUpdateCampusModule(values);
  }
};

export const requireFieldSubmitAlert = (valid, createOrUpdateCampusModule, values) => {
  if (!valid) {
    window.alert('Fill out required fields in order to save the form.');
  } else {
    createOrUpdateCampusModule(values);
  }
};

export const FormRulesListener = ({handleFormChange}) => (
  <FormSpy
    subscription={{values: true, valid: true}}
    onChange={async ({values, valid}) => {
      if (valid) {
        handleFormChange(values);
      }
    }}
  />
);

export const ToggleAdapter = ({input: {onChange, value}, label, ...rest}) => (
  <FormControlLabel
    control={
      <Switch
        checked={value}
        onChange={(event, isInputChecked) => {
          let proceed = true;
          if (value == true) {
            proceed = window.confirm('Deactivating this toggle will clear values. Do you want to proceed?');
          }
          if (proceed == true) {
            onChange(isInputChecked);
          }
        }}
        value={value}
        {...rest}
      />
    }
    label={label}
  />
);

export const toNumber = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  return parseFloat(value.replace(/,/g, ''));
};