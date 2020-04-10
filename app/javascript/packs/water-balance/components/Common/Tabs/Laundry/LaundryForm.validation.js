import {isWithinNumericRange, isPositiveNumeric} from '../shared/arrayValidationFunctions';

const validateLaundryFacility = (values, allValues) => {
  const errors = {};
  if (!values.name) {
    errors['name'] = 'Enter a unique identifier for this laundry facility (such as the building name/number it is associated)';
  }
  if (values.has_single_load == true) {
    const {
      people,
      loads_per_person,
      single_load_weeks,
      energy_star,
      energy_star_capacity,
      energy_star_factor,
      nonenergy_star_factor,
      nonenergy_star_capacity,
    } = values;
    if (!isPositiveNumeric(people, true)) {
      errors['people'] = 'The number of people that use washing machines each week.';
    }
    if (!isPositiveNumeric(loads_per_person, true)) {
      errors['loads_per_person'] = 'The number of loads of laundry per person per week.';
    }
    if (!isWithinNumericRange(single_load_weeks, 1, 52)) {
      errors['single_load_weeks'] = 'The number of weeks single-load/multi-load washing machines are operated must be between 1 and 52.';
    }
    if (energy_star > 0) {
      if (!isWithinNumericRange(energy_star, 0, 100)) {
        errors['energy_star'] = 'The percentage of single-load/multi-load washing machines that are ENERGY STAR must be between 0 and 100.';
      }
      if (!isWithinNumericRange(energy_star_capacity, 1.6, 8, true)) {
        errors['energy_star_capacity'] = 'The capacity of ENERGY STAR single-load/multi-load washing machines must be between 1.6 and 8 feet³.';
      }
      if (!isWithinNumericRange(energy_star_factor, 0, 4)) {
        errors['energy_star_factor'] =
          'The water factor of ENERGY STAR single-load/multi-load washing machines must be less than or equal to 4.0 gallons/cycle/cubic feet³.';
      }
    }
    if (energy_star < 100) {
      let machineType = values.machine_type;
      if (machineType == undefined) {
        errors['machine_type'] = 'Are washing machines predominately top loading or front loading?';
      }
      let maxWaterFactor = machineType == 'top_loading' ? 8.5 : 5.5;
      if (!isWithinNumericRange(nonenergy_star_factor, 0, maxWaterFactor, true)) {
        errors['nonenergy_star_factor'] =
          'Water factor of non-ENERGY STAR single-load/multi-load washing machines must be between 0 and ' +
          maxWaterFactor +
          ' gallons/cycle/cubic feet³.';
      }
      if (!isWithinNumericRange(nonenergy_star_capacity, 1.6, 8, true)) {
        errors['nonenergy_star_capacity'] =
          'The capacity of non-ENERGY STAR single-load/multi-load washing machines must be between 1.6 and 8 feet³.';
      }
    }
  }
  if (values.has_industrial_machines === true) {
    const {weight, industrial_weeks, water_use, recycled} = values;
    if (!isPositiveNumeric(weight)) {
      errors['weight'] = 'The weight of laundry washed in industrial washing machines.';
    }
    if (!isWithinNumericRange(industrial_weeks, 1, 52)) {
      errors['industrial_weeks'] = 'The number of weeks industrial washing machines are operated must be between 1 and 52.';
    }
    if (!isPositiveNumeric(water_use)) {
      errors['water_use'] = 'The water use per pound of laundry.';
    }
    if (!isWithinNumericRange(recycled, 0, 99)) {
      errors['recycled'] = 'The percentage of water that is recycled/reused must be between 0 and 99';
    }
  }

  let isUsed = false;
  let resolvedValue = undefined;

  allValues && allValues.map((facility, index) => {
    if (facility != undefined) {
      resolvedValue = facility.name;
      if (resolvedValue == values.name && isUsed == true && values.name != undefined) {
        errors['name'] = 'Identifiers must be unique.';
        isUsed = false;
      }
      if (resolvedValue == values.name) {
        isUsed = true;
      }
    }
  });

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
  const errors = {};
  if (!values.laundry) {
    errors.laundry = 'An answer about laundry facilities is required.';
  }

  const laundryErrors = [];
  const allLaundryFacilities = values.laundry_facilities;
  values.laundry_facilities.map((facility, index) => {
    if (facility) {
      laundryErrors[index] = validateLaundryFacility(facility, allLaundryFacilities);
    }
  });

  console.log('%o', laundryErrors);
  if (laundryErrors.length > 0) {
    errors['laundry_facilities'] = laundryErrors;
  }

  return errors;
};
export default validate;
