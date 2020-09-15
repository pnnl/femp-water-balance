import {isWithinNumericRange} from '../shared/arrayValidationFunctions';

const validateFlushRates = (values, allValues) => {
  const errors = {};
  if (!isWithinNumericRange(values.typical_flush_rate, 1.28, 3.5, true)) {
    errors['typical_flush_rate'] = 'The flush rate of toilets must be between 1.28 and 3.5 gpf.';
  }
  if (values.urinals == 'Yes' && values.urinals != undefined) {
    if (!isWithinNumericRange(values.urinal_flush_rate, 0.5, 1.0, true)) {
      errors['urinal_flush_rate'] = 'The flush rate of urinals must be between 0.5 and 1.0 gpf.';
    }
  }
  if (!isWithinNumericRange(values.aerator_flow_rate, 0.5, 2.5, true)) {
    errors['aerator_flow_rate'] = 'The flow rate of restroom faucet aerators must be between 0.5 and 2.5 gpf.';
  }
  if (!isWithinNumericRange(values.kitchenette_flow_rate, 0.5, 2.5, true)) {
    if (values.kitchenette_flow_rate != 0) {
      errors['kitchenette_flow_rate'] =
        'The flow rate of kitchenette faucet aerators in must be between 0.5 and 2.5 gpf. Please put 0 if no kitchenettes are present.';
    }
  }
  if (!isWithinNumericRange(values.shower_flow_rate, 1.0, 2.5, true)) {
    if (values.shower_flow_rate != 0) {
      errors['shower_flow_rate'] = 'The flow rate of showers in must be between 1.0 and 2.5 gpf. Please put 0 in no showers are present.';
    }
  }
  if (values.shower_flow_rate != 0 && values.shower_flow_rate != undefined) {
    if (!isWithinNumericRange(values.shower_usage, 1, 100, true)) {
      errors['shower_usage'] = 'Percentage of general campus occupants that use showers on a daily basis must be between 1 and 100.';
    }
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
  const errors = {};

  const fixturesErrors = [];
  values.fixtures.map((facility, index) => {
    if (facility) {
      fixturesErrors[index] = validateFlushRates(facility, values);
    }
  });

  if (fixturesErrors.length > 0) {
    errors['fixtures'] = fixturesErrors;
  }

  return errors;
};
export default validate;
