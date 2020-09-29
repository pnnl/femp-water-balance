import {isWithinNumericRange, isPositiveNumeric} from '../shared/arrayValidationFunctions';

const validateProcesses = (values, allTowers) => {
  const errors = {};
  if (!values.name) {
    errors['name'] =
      'Enter a unique name identifier for this cooling tower system (such as the building name/number the cooling tower is associated with)';
  }
  if (!values.is_metered) {
    errors['is_metered'] = 'Is the makeup water metered?';
  }
  let valuePath = values.annual_water_use;
  if (values.is_metered == 'yes') {
    if (!isPositiveNumeric(valuePath)) {
      errors['annual_water_use'] = 'Annual water usage is required if makeup water is metered.';
    }
  } else {
    valuePath = values.tonnage ? values.tonnage.toString() : null;
    if (!isPositiveNumeric(valuePath)) {
      errors['tonnage'] = 'The total tonnage of the chillers associated with the system.';
    }
    valuePath = values.cycles ? values.cycles.toString() : null;
    if (!isWithinNumericRange(valuePath, 2.0, 10.0)) {
      errors['cycles'] = 'The cycles of concentration for the system must be between 2.0 and 10.0.';
    }
    if(!values.parameters_known) {
      errors['parameters_known'] = 'Please indicate if the operational parameters are known.'
    }
    if (values.parameters_known === 'yes') {
      if (!values.start_date) {
        errors['start_date'] = 'The cooling season start date.';
      }
      if (!values.end_date) {
        errors['end_date'] = 'The cooling season end date.';
      }
      if (values.end_date && values.start_date) {
        if (values.end_date < values.start_date) {
          errors['start_date'] = 'Start date must be before end date.';
        }
      }
			valuePath = values.hours_per_day;
			if (!isWithinNumericRange(valuePath, 1, 24)) {
				errors['hours_per_day'] = 'The hours per day the system operates must be between 1 and 24.';
      }
      valuePath = values.cooling_season_capacity_used;
			if (!isWithinNumericRange(valuePath, 1, 100)) {
				errors['cooling_season_capacity_used'] = 'Percent of full load cooling hours per year must be between 1 and 100.';
			}
		}
		if(values.parameters_known === 'no') {
			valuePath = values.full_load_cooling;
			if(!isWithinNumericRange(valuePath, 2.0, 46.0)) {
				errors['full_load_cooling'] = "Percent of full load cooling hours per year must be between 2.0% and 46.0%."
			}  
		}
  }

  const allNames = allTowers.filter(tower => tower.name === values.name);
  if(allNames.length > 1) {
    errors['name'] = 'Identifiers must be unique.';
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
  const errors = {};
  const coolingTowerErrors = [];
  const allTowers = values.cooling_towers;
  values.cooling_towers.map((tower, index) => {
    if (tower) {
      let sectionErrors = validateProcesses(tower, allTowers);
      if (sectionErrors) {
        coolingTowerErrors[index] = sectionErrors;
      }
    }
  });

  if (coolingTowerErrors.length > 0) {
    errors['cooling_towers'] = coolingTowerErrors;
  }
  return errors;
};
export default validate;
