import {isPositiveNumeric, isWithinNumericRange, resolve} from '../shared/validationFunctions';
import {isPositiveNumeric as isPositiveNumericArray, isWithinNumericRange as isWithinNumericRangeArray} from '../shared/arrayValidationFunctions';
import {lodgingTypes} from '../shared/sharedConstants';
import selectn from 'selectn';

const validateLodging = (values, basePath) => {
  const errors = {};

  let valuePath = `${basePath}.total_population`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['total_population'] = 'The estimated total population in all on-site lodging.';
  }
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateFacility = (values, basePath) => {
  const errors = {};
  let valuePath = `${basePath}.total_population`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['total_population'] =
      'The estimated overall average daily campus staff population for weekdays, excluding hospital/clinics (calculated above, if applicable).';
  }
  valuePath = `${basePath}.total_population_weekends`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['total_population_weekends'] =
      'The estimated overall average daily campus staff population for weekends, excluding hospital/clinics (calculated above, if applicable).';
  }

  let weekDayPopulation = resolve(`${basePath}.total_population`, values);
  let weekendDayPopulation = resolve(`${basePath}.total_population_weekends`, values);
  if (weekDayPopulation == 0 && weekendDayPopulation == 0) {
    errors['total_population'] = 'The campus weekday and weekend day population cannot both be zero.';
    errors['total_population_weekends'] = 'The campus weekday and weekend day population cannot both be zero.';
  }
  valuePath = `${basePath}.male_population`;
  if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
    errors['male_population'] = 'Percentage of population that is male be between 0 and 100.';
  }
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateHospital = (values, basePath) => {
  const errors = {};
  let valuePath = `${basePath}.days_per_year`;

  if (!isWithinNumericRange(valuePath, values, 1, 365, true)) {
    errors['days_per_year'] = 'The number of days per year the hospital/clinic is open must be between 1 and 365.';
  }
  valuePath = `${basePath}.daily_staff`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['daily_staff'] = 'The approximate number of hospital/clinic daily staff.';
  }
  valuePath = `${basePath}.administrative`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['administrative'] = 'Percentage of hospital clinic staff that are administrative must be between 0 and 100.';
  }
  valuePath = `${basePath}.hospital_male`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['hospital_male'] = 'Percentage of hospital clinic staff that are male must be between 0 and 100.';
  }
  valuePath = `${basePath}.staff_shift`;
  if (!isPositiveNumeric(valuePath, values)) {
    errors['staff_shift'] = 'The average length of a hospital/clinic staff shift.';
  }
  valuePath = `${basePath}.outpatient_visits`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['outpatient_visits'] = 'The average number of outpatient visits in a day.';
  }
  valuePath = `${basePath}.outpatient_duration`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['outpatient_duration'] = 'The average length of an outpatient visit.';
  }
  valuePath = `${basePath}.inpatient_per_day`;
  if (!isPositiveNumeric(valuePath, values, true)) {
    errors['inpatient_per_day'] = 'The average number of inpatients in a day. Please put 0 if no overnight patients.';
  }
  valuePath = `${basePath}.shower_flow_rate`;
  if (resolve(valuePath, values) != 0 && resolve(valuePath, values) != undefined) {
    valuePath = `${basePath}.shower_usage_staff`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
      errors['shower_usage_staff'] = 'Percentage of hospital staff that use showers on a daily basis must be between 0 and 100.';
    }
    if (selectn(`${basePath}.inpatient_per_day`)(values) != 0) {
      valuePath = `${basePath}.shower_usage_inpatient`;
      if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['shower_usage_inpatient'] = 'Percentage of hospital inpatients that use showers on a daily basis must be between 0 and 100.';
      }
    }
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateAudits = (values, primary_building_type) => {
  let errors = {};
  const weekend_staff = values.weekend_staff;
  const weekend_occupancy = selectn(`weekend_occupancy`)(values);
  const isHospitalType = primary_building_type === 'clinic' || primary_building_type === 'hospital';
  const weekendRequired = weekend_staff !== '0' || weekend_staff === undefined || weekend_staff === null;
  const otherWeekendRequired = weekend_occupancy != 0 || weekend_occupancy === undefined || weekend_occupancy === null;
  if (!values.name) {
    errors['name'] = 'The building that you would like to enter occupancy information for.';
  }
  if (primary_building_type !== 'hospital' && primary_building_type !== 'clinic') {
    if (!isPositiveNumericArray(values.weekday_occupancy, true, true)) {
      errors['weekday_occupancy'] = 'The typical weekday occupancy for this building.';
    }
  }
  if (isHospitalType) {
    if (!isPositiveNumericArray(values.weekday_staff, true, true)) {
      errors['weekday_staff'] = 'The typical number of daily staff on a weekday.';
    }
    if (!isPositiveNumericArray(values.outpatient_weekday, true, true)) {
      errors['outpatient_weekday'] = 'The typical number of daily outpatient visits on a weekday.';
    }
    if (weekendRequired && !isPositiveNumericArray(values.weekend_staff, true, false)) {
      errors['weekend_staff'] = 'The typical number of daily staff on a weekend day.';
    }
    if (weekendRequired && !isPositiveNumericArray(values.outpatient_weekend, true, true)) {
      errors['outpatient_weekend'] = 'The typical number of daily outpatient visits on a weekend day.';
    }
    if (primary_building_type == 'hospital') {
      if (!isPositiveNumericArray(values.inpatient_weekday, true, false)) {
        errors['inpatient_weekday'] = 'The typical number of daily inpatients on a weekday.';
      }
      if (weekendRequired && !isPositiveNumericArray(values.inpatient_weekend, true, false)) {
        errors['inpatient_weekend'] = 'The typical number of daily inpatients on a weekend day.';
      }
    }
  }
  if (primary_building_type !== 'hospital' && primary_building_type !== 'clinic') {
    if (!isPositiveNumericArray(values.weekend_occupancy)) {
      errors['weekend_occupancy'] = 'The typical weekend occupancy for this building.';
    }
  }
  if (primary_building_type !== 'family' && !isWithinNumericRangeArray(values.percent_male, 0, 100)) {
    errors['percent_male'] = 'Percentage of occupants that are male must be between 0 and 100.';
  }
  if (lodgingTypes.indexOf(primary_building_type) === -1) {
    if (!isWithinNumericRangeArray(values.week_days_year, 1, 260)) {
      errors['week_days_year'] = 'Number of week days per year must be between 1 and 260.';
    }
    if (!isWithinNumericRangeArray(values.week_days_hours, 1, 24)) {
      errors['week_days_hours'] = 'Number of week day hours must be between 1 and 24.';
    }
    if ((weekendRequired && isHospitalType) || (otherWeekendRequired && primary_building_type === 'other')) {
      if (!isWithinNumericRangeArray(values.weekend_days_year, 1, 104)) {
        errors['weekend_days_year'] = 'Number of weekend days per year must be between 1 and 104.';
      }
      if (!isWithinNumericRangeArray(values.weekend_days_hours, 1, 24)) {
        errors['weekend_days_hours'] = 'Number of weekend day hours must be between 1 and 24.';
      }
    }
  }

  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = values => {
  const errors = {};
  const plumbing = {};
  const basePath = 'plumbing';
  errors[basePath] = plumbing;
  const auditErrors = [];
  let sectionErrors;

  if (selectn(`${basePath}.has_onsite_lodging`)(values) === true) {
    sectionErrors = validateLodging(values, `${basePath}.lodging`);
    if (sectionErrors) {
      plumbing['lodging'] = sectionErrors;
    }
  }

  if (selectn(`${basePath}.has_hospital`)(values) === true) {
    sectionErrors = validateHospital(values, `${basePath}.hospital`);
    if (sectionErrors) {
      plumbing['hospital'] = sectionErrors;
    }
  }

  sectionErrors = validateFacility(values, `${basePath}.facility`);
  if (sectionErrors) {
    plumbing['facility'] = sectionErrors;
  }

  values.audits.map((audit, index) => {
    if (audit && Object.keys(audit).length > 0) {
      const building = values.buildings.find(building => building.name === audit.name);
      let sectionErrors = validateAudits(audit, selectn('primary_building_type')(building));
      if (sectionErrors) {
        auditErrors[index] = sectionErrors;
      }
    }
  });

  if (auditErrors.length > 0) {
    errors['audits'] = auditErrors;
  }

  return errors;
};
export default validate;
