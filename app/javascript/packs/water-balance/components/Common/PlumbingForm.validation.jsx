import selectn from 'selectn';

const resolve = (path, values) => selectn(path)(values);

const isPositiveNumeric = (path, values, includeZero = false, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue) {
        const numeric = parseInt(resolvedValue.replace(/,/g,''));
        if(includeZero) {
            return !(isNaN(numeric));
        } else {
            return !(isNaN(numeric) || numeric <= 0);
        }
    }
    return false;
};

const isWithinNumericRange = (path, values, min, max, decimal = false, inclusive = true, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue){
        let numeric = null;
        if(decimal) {
            numeric = parseFloat(resolvedValue.replace(/,/g,''));
        } else {
            numeric = parseInt(resolvedValue.replace(/,/g,''));
        }
        if (isNaN(numeric)) {
            return false;
        } else if (inclusive === true) {
            return (numeric >= min && numeric <= max);
        }
        return (numeric > min && numeric < max);
    }
    return false;
};

const validateLodging = (values, basePath) => {
    const errors = {};

    let valuePath = `${basePath}.total_population`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['total_population'] = 'The estimated total population in all on-site lodging.';
    }
     
    let flushRateErrors = validateFlushRates(values, basePath, 'onsite lodging'); 
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validateFacility = (values, basePath) => {
    const errors = {};
    let valuePath = `${basePath}.total_population`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['total_population'] = 'The estimated overall campus staff population, excluding hospital/medical clinics.';
    }

    valuePath = `${basePath}.operating_weeks`;
    if (!isWithinNumericRange(valuePath, values, 0, 260, true)) {
        errors['operating_weeks'] = 'The number of days per year the campus operates must be between 0 and 260.';
    }
    valuePath = `${basePath}.operating_weekend`;
    if (!isWithinNumericRange(valuePath, values, 0, 104, true)) {
        errors['operating_weekend'] = 'The number of weekend days per year the campus operates must be between 0 and 104.';
    }
    let operatingWeeks = resolve(`${basePath}.operating_weeks`, values);
    let operatingWeekends = resolve(`${basePath}.operating_weekend`, values);
    if (operatingWeeks == 0 && operatingWeekends == 0) {
        errors['operating_weeks'] = 'The number of days the campus operates per year cannot be 0 for both weekdays and weekend days.';
        errors['operating_weekend'] = 'The number of days the campus operates per year cannot be 0 for both weekdays and weekend days.';
    }

    valuePath = `${basePath}.staff_weekend`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['staff_weekend'] = 'Percentage of staff that work during the weekends must be between 0 and 100.';
    }
    valuePath = `${basePath}.shift_weekday`;
    if (!isPositiveNumeric(valuePath, values)) {
        errors['shift_weekday'] = 'The average length of a weekday shift.';
    }
    valuePath = `${basePath}.shift_weekend`;
    if (!isPositiveNumeric(valuePath, values)) {
        errors['shift_weekend'] = 'The average length of a weekend day shift.';
    }
    valuePath = `${basePath}.male_population`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['male_population'] = 'Percentage of population that is male be between 0 and 100.';
    }
    valuePath = `${basePath}.shower_usage`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['shower_usage'] = 'Percentage of general campus occupants that use showers on a daily basis must be between 0 and 100.';
    }

    let flushRateErrors = validateFlushRates(values, basePath, 'overall campus'); 
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
}

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
    valuePath = `${basePath}.shower_usage_staff`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['shower_usage_staff'] = 'Percentage of hospital staff that use showers on a daily basis must be between 0 and 100.';
    }
    valuePath = `${basePath}.shower_usage_inpatient`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['shower_usage_inpatient'] = 'Percentage of hospital inpatents that use showers on a daily basis must be between 0 and 100.';
    }

    let flushRateErrors = validateFlushRates(values, basePath, 'hospital/medical clinic'); 
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validateFlushRates = (values, basePath, source) => {
    const errors = {};
    let valuePath = `${basePath}.typical_flush_rate`;
    if (!isWithinNumericRange(valuePath, values, 1.28, 3.5, true)) {
        errors['typical_flush_rate'] = 'The flush rate of toilets in '+ source +' must be between 1.28 and 3.5 gpf.';
    }
    valuePath = `${basePath}.urinal_flush_rate`;
    if (!isWithinNumericRange(valuePath, values, 0.5, 1.0, true)) {
        errors['urinal_flush_rate'] = 'The flush rate of urinals in '+ source +' must be between 0.5 and 1.0 gpf.';
    }
    valuePath = `${basePath}.aerator_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 0.5, 2.5, true)) {
        errors['aerator_flow_rate'] = 'The flow rate of restroom faucet aerators in '+ source +' must be between 0.5 and 2.5 gpf.';
    }
    valuePath = `${basePath}.kitchenette_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 0.5, 2.5, true)) {
        if(resolve(valuePath, values) != 0) {
            errors['kitchenette_flow_rate'] = 'The flow rate of kitchenette faucet aerators in '+ source +' must be between 0.5 and 2.5 gpf. Please put 0 if no kitchenettes are present.';
        }
    }
    valuePath = `${basePath}.shower_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 1.0, 2.5, true)) {
        if(resolve(valuePath, values) != 0) {
            errors['shower_flow_rate'] = 'The flow rate of showers in '+ source +' must be between 1.0 and 2.5 gpf. Please put 0 in no showers are present.';
        }
    }
    
    return Object.keys(errors).length === 0 ? undefined : errors;
}


const validate = values => {
    const errors = {};
    if (!values.plumbing) {
        errors.plumbing = 'An answer about plumbing facilities is required.';
    }

    const plumbing = {};
    const basePath = 'plumbing';
    errors[basePath] = plumbing;

    if (selectn(`${basePath}.has_onsite_lodging`)(values) === true) {
        let sectionErrors = validateLodging(values, `${basePath}.lodging`);
        if (sectionErrors) {
            plumbing['lodging'] = sectionErrors;
        }
    }

    if (selectn(`${basePath}.has_hospital`)(values) === true) {
        let sectionErrors = validateHospital(values, `${basePath}.hospital`);
        if (sectionErrors) {
            plumbing['hospital'] = sectionErrors;
        }
    }

    let sectionErrors = validateFacility(values, `${basePath}.facility`);
    if (sectionErrors) {
        plumbing['facility'] = sectionErrors;
    }

    return errors;
};
export default validate;