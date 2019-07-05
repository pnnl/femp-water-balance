import selectn from 'selectn';

const resolve = (path, values) => selectn(path)(values);

const isPositiveNumeric = (path, values, includeZero = false, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue) {
        const numeric = parseInt(resolvedValue.replace(/,/g,''));
        if(includeZero) {
            return !(isNaN(numeric) || numeric <= 0);
        } else {
            return !(isNaN(numeric) || numeric < 0);
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

const validateLaundryFacility = (values, basePath) => {
    const errors = {};
    let valuePath = `${basePath}.people`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['people'] = 'The number of people that use washing machines each week must be greater than 0.';
    }
    valuePath = `${basePath}.loads_per_person`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['loads_per_person'] = 'The number of loads of laundry per person must be greater than 0.';
    }
    valuePath = `${basePath}.single_load_weeks`;
    if (!isWithinNumericRange(valuePath, values, 1, 52)) {
        errors['single_load_weeks'] = 'The number of weeks single-load washing machines are operated must be between 1 and 52.';
    }
    valuePath = `${basePath}.energy_star`;
    if (!isWithinNumericRange(valuePath, values, 0, 100)) {
        errors['energy_star'] = 'The percentage of single-load washing machines that are ENERGY STAR must be between 0 and 100.';
    }
    valuePath = `${basePath}.nonenergy_star_capacity`;
    if (!isWithinNumericRange(valuePath, values, 1.6, 8, true)) {
        errors['nonenergy_star_capacity'] = 'The capacity of ENERGY STAR single-load washing machines must be between 1.6 and 8 feet³.';
    }
    valuePath = `${basePath}.energy_star_capacity`;
    if (!isWithinNumericRange(valuePath, values, 1.6, 8, true)) {
        errors['energy_star_capacity'] = 'The capacity of ENERGY STAR single-load washing machines must be between 1.6 and 8 feet³.';
    }
    valuePath = `${basePath}.energy_star_factor`;
    if (!isWithinNumericRange(valuePath, values, 0, 4)) {
        errors['energy_star_factor'] = 'The water factor of ENERGY STAR single-load washing machines must be less than or equal to 4.0 gallons/cycle/cubic feet³.';
    }

    let machineType = resolve(`${basePath}.machine_type`, values)
    let maxWaterFactor = machineType == 'top_loading' ? 5.5 : 8.5;
    valuePath = `${basePath}.nonenergy_star_factor`;
    if (!isWithinNumericRange(valuePath, values, 0, maxWaterFactor, true)) {
        errors['nonenergy_star_factor'] = 'Water factor of non-ENERGY STAR single-load washing machines must be between 0 and ' + maxWaterFactor +'.';
    }
    valuePath = `${basePath}.weight`;
    if (!isPositiveNumeric(valuePath, values)) {
        errors['weight'] = 'A positive number for the weight of laundry washed in industrial washing machines is required.';
    }
    valuePath = `${basePath}.industrial_weeks`;
    if (!isWithinNumericRange(valuePath, values, 1, 52)) {
        errors['industrial_weeks'] = 'The number of weeks industrial washing machines are operated must be between 1 and 52.';
    }
    valuePath = `${basePath}.water_use`;
    if (!isPositiveNumeric(valuePath, values)) {
        errors['water_use'] = 'A positive number for the water use per pound of laundry is required.';
    }
    valuePath = `${basePath}.recycled`;
    if (!isWithinNumericRange(valuePath, values, 0, 99)) {
        errors['recycled'] = 'The percentage of water that is recycled/reused must be between 0 and 99';
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    if (!values.laundry) {
        errors.laundry = 'An answer about vehicle wash facilities is required.';
    }

    const basePath = 'laundry';
    if ((values.has_laundry_facility) === true) {
        let sectionErrors = validateLaundryFacility(values, basePath);
        if (sectionErrors) {
            errors['laundry'] = sectionErrors;
        }
    }

    console.log("errors: %o", errors)
    
    return errors;
};
export default validate;