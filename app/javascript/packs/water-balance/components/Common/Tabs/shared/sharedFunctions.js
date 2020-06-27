import React from 'react';
import {FormSpy} from 'react-final-form';

export const submitAlert = (valid, createOrUpdateCampusModule, values) => {
    if (
        valid ||
        (!valid &&
            window.confirm(
                'There are missing or invalid values would you like to save?'
            ))
    ) {
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