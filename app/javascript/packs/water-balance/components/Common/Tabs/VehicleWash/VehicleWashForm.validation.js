import {isWithinNumericRange, isPositiveNumeric} from '../shared/arrayValidationFunctions';

const validateName = (values, allValues, errors) => {
  let isUsed = false;
  let resolvedValue = undefined;
  allValues &&
    allValues.map((facility) => {
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
};

const validateAutomatedFacility = (values, allValues, basePath) => {
  const errors = {};
  if (basePath != 'wash_pad_open_hose' && basePath != 'wash_pad_pressure_washer') {
    if (values.metered === undefined) {
      errors['metered'] = 'Is the water use metered?';
    }
  }
  if (values.metered === 'yes') {
    if (!isPositiveNumeric(values.water_usage)) {
      errors['water_usage'] = 'Annual water usage is required if this facility is metered.';
    }
  } else {
    if (!isWithinNumericRange(values.wpy, 1, 52)) {
      errors['wpy'] = 'The number of weeks per year vehicles are washed must be between 1 and 52.';
    }
    if (!isPositiveNumeric(values.vpw)) {
      errors['vpw'] = 'The average number of vehicles washed per week.';
    }
    if (basePath != 'wash_pad_open_hose' && basePath != 'wash_pad_pressure_washer') {
      if (!isPositiveNumeric(values.gpv)) {
        errors['gpv'] = 'The estimated number of gallons per vehicle.';
      }
      if (!isWithinNumericRange(values.recycled, 0, 100)) {
        errors['recycled'] = 'The percentage of recycled or reused water must be between 0 and 100.';
      }
    }
  }
  validateName(values, allValues, errors);
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateWashPadFacility = (values, allValues, basePath) => {
  const errors = {};
  const facilityErrors = validateAutomatedFacility(values, allValues, basePath);
  if (facilityErrors) {
    Object.assign(errors, facilityErrors);
  }

  if (!isPositiveNumeric(values.wash_time)) {
    errors['wash_time'] = 'The approximate wash time per vehicle.';
  }

  if (basePath == 'wash_pad_pressure_washer') {
    if (!isPositiveNumeric(values.rating)) {
      errors['rating'] = 'The nozzle rating of pressure washer.';
    }
  }

  if (basePath == 'wash_pad_open_hose') {
    if (!isPositiveNumeric(values.rating)) {
      errors['rating'] = 'The flow rate of the open hose.';
    }
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateConveyorFacility = (values, allValues, basePath) => {
  const errors = {};
  if (!values.type) {
    errors['type'] = 'Please select the conveyor type for this facility';
  }
  const facilityErrors = validateAutomatedFacility(values, allValues, basePath);
  if (facilityErrors) {
    Object.assign(errors, facilityErrors);
  }
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
  const errors = {
    auto_wash: [],
    conveyor: [],
    wash_pad_pressure_washer: [],
    wash_pad_open_hose: [],
    large_vehicles: [],
  };
  if (!values.vehicle_wash) {
    return;
  }
  let allValues = [];

  const {auto_wash, conveyor, wash_pad_pressure_washer, wash_pad_open_hose, large_vehicles} = values;

  allValues = [].concat(auto_wash, conveyor, wash_pad_pressure_washer, wash_pad_open_hose, large_vehicles);

  errors['vehicle_wash'] = {};
  if (values.vehicle_wash.auto_wash_facilities === true) {
    values.auto_wash &&
      values.auto_wash.map((facility, index) => {
        let sectionErrors = validateAutomatedFacility(facility, allValues, 'auto_wash');
        if (sectionErrors) {
          errors.auto_wash[index] = sectionErrors;
        }
      });
  }

  if (values.vehicle_wash.conveyor_facilities === true) {
    values.conveyor &&
      values.conveyor.map((facility, index) => {
        let sectionErrors = validateConveyorFacility(facility, allValues, 'conveyor');
        if (sectionErrors) {
          errors.conveyor[index] = sectionErrors;
        }
      });
  }
  if (values.vehicle_wash.wash_pad_pressure_washer_facilities === true) {
    values.wash_pad_pressure_washer &&
      values.wash_pad_pressure_washer.map((facility, index) => {
        let sectionErrors = validateWashPadFacility(facility, allValues, 'wash_pad_pressure_washer');
        if (sectionErrors) {
          errors.wash_pad_pressure_washer[index] = sectionErrors;
        }
      });
  }
  if (values.vehicle_wash.wash_pad_open_hose_facilities === true) {
    values.wash_pad_open_hose &&
      values.wash_pad_open_hose.map((facility, index) => {
        let sectionErrors = validateWashPadFacility(facility, allValues, 'wash_pad_open_hose');
        if (sectionErrors) {
          errors.wash_pad_open_hose[index] = sectionErrors;
        }
      });
  }
  if (values.vehicle_wash.large_vehicle_facilities === true) {
    values.large_vehicles &&
      values.large_vehicles.map((facility, index) => {
        let sectionErrors = validateAutomatedFacility(facility, allValues, 'large_vehicles');
        if (sectionErrors) {
          errors.large_vehicles[index] = sectionErrors;
        }
      });
  }

  return errors;
};
export default validate;
