import {isWithinNumericRange} from '../shared/arrayValidationFunctions';
import {lodgingTypes} from '../shared/sharedConstants';
import selectn from 'selectn';

const validateFlushRates = (values, primaryBuildingType) => {
  const errors = {};
  if (!isWithinNumericRange(values.typical_flush_rate, 1.28, 3.5, true)) {
    errors['typical_flush_rate'] = 'The flush rate of toilets must be between 1.28 and 3.5 gpf.';
  }
  if (values.urinals == 'yes' && values.urinals != undefined) {
    if (!isWithinNumericRange(values.urinal_flush_rate, 0.5, 1.0, true)) {
      errors['urinal_flush_rate'] = 'The flush rate of urinals must be between 0.5 and 1.0 gpf.';
    }
  }
  if (!isWithinNumericRange(values.aerator_flow_rate, 0.5, 2.5, true)) {
    errors['aerator_flow_rate'] = 'The flow rate of restroom faucet aerators must be between 0.5 and 2.5 gpm.';
  }
  if (!isWithinNumericRange(values.kitchenette_flow_rate, 0.5, 2.5, true)) {
    if (values.kitchenette_flow_rate != 0) {
      errors['kitchenette_flow_rate'] =
        'If present the flow rate of kitchenette faucet aerators must be between 0.5 and 2.5 gpm.';
    }
  }
  if (!isWithinNumericRange(values.shower_flow_rate, 1.0, 2.5, true)) {
    if (values.shower_flow_rate != 0) {
      errors['shower_flow_rate'] = 'If present the flow rate of showers must be between 1.0 and 2.5 gpm.';
    }
  }
  if (values.shower_flow_rate != 0 && values.shower_flow_rate != undefined && lodgingTypes.indexOf(primaryBuildingType) == -1) {
    if (!isWithinNumericRange(values.shower_usage, 1, 100, true)) {
      errors['shower_usage'] = 'Percentage of occupants that use showers on a daily basis must be between 1 and 100.';
    }
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = values => {
  const errors = {};

  const fixturesErrors = [];
  values.fixtures.map((facility, index) => {
    if (facility) {
      const building = values.buildings.find(building => building.name === facility.name);
      fixturesErrors[index] = validateFlushRates(facility, selectn('primary_building_type')(building));
    }
  });

  if (fixturesErrors.length > 0) {
    errors['fixtures'] = fixturesErrors;
  }

  return errors;
};
export default validate;
