import {isPositiveNumeric, isWithinNumericRange, resolve} from '../shared/validationFunctions';
import {isPositiveNumeric as isPositiveNumericArray, isWithinNumericRange as isWithinNumericRangeArray} from '../shared/arrayValidationFunctions';
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
  if (!(selectn(`${basePath}.individual_audit`)(values))) {
    errors['individual_audit'] = 'Indicate if data will be entered for audited buildings.';
  }
  if(values.buildings && values.buildings.length == 0 && (selectn(`${basePath}.individual_audit`)(values) === 'yes')) {
    errors['individual_audit'] = 'Add buildings to audit in the buildings tab.';
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

const validateAudits = (values) => {
  let errors = {};
  if (!values.name) {
    errors['name'] = 'The building that will be audited.';
  }
  if (!isPositiveNumericArray(values.weekday_occupancy, true, true)) {
    errors['weekday_occupancy'] = 'The typical weekday occupancy for this building.';
  }
  if (!isPositiveNumericArray(values.weekend_occupancy)) {
    errors['weekend_occupancy'] = 'The typical weekend occupancy for this building.';
  }
  if (!isWithinNumericRangeArray(values.percent_male, 0, 100)) {
    errors['percent_male'] = 'Percentage of occupants that are male must be between 0 and 100.';
  }
  if (!isWithinNumericRangeArray(values.week_days_year, 1, 260)) {
    errors['week_days_year'] = 'Number of week days per year must be between 1 and 260.';
  }
  if (!isWithinNumericRangeArray(values.week_days_hours, 1, 24)) {
    errors['week_days_hours'] = 'Number of week day hours must be between 1 and 24.';
  }
  if (values.weekend_occupancy > 0) {
    if (!isWithinNumericRangeArray(values.weekend_days_year, 1, 104)) {
      errors['weekend_days_year'] = 'Number of weekend days per year must be between 1 and 104.';
    }
    if (!isWithinNumericRangeArray(values.weekend_days_hours, 1, 24)) {
      errors['weekend_days_hours'] = 'Number of weekend day hours must be between 1 and 24.';
    }
  }
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
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
      let sectionErrors = validateAudits(audit, values.audits);
      if (sectionErrors) {
        auditErrors[index] = sectionErrors;
      }
    }
  });

  if (auditErrors.length > 0) {
    errors['audits'] = auditErrors;
  }
  console.log('%o', errors);
  return errors;
};
export default validate;
