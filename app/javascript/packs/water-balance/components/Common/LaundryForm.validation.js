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
    let valuePath = `${basePath}.has_single_load`;
    if(resolve(valuePath, values) == true) {
        valuePath = `${basePath}.people`;
        if (!isPositiveNumeric(valuePath, values, true)) {
            errors['people'] = 'The number of people that use washing machines each week.';
        }
        valuePath = `${basePath}.loads_per_person`;
        if (!isPositiveNumeric(valuePath, values, true)) {
            errors['loads_per_person'] = 'The number of loads of laundry per person per week.';
        }
        valuePath = `${basePath}.single_load_weeks`;
        if (!isWithinNumericRange(valuePath, values, 1, 52)) {
            errors['single_load_weeks'] = 'The number of weeks single-load/multi-load washing machines are operated must be between 1 and 52.';
        }
        valuePath = `${basePath}.energy_star`;
        if (!isWithinNumericRange(valuePath, values, 0, 100)) {
            errors['energy_star'] = 'The percentage of single-load/multi-load washing machines that are ENERGY STAR must be between 0 and 100.';
        }
        valuePath = `${basePath}.energy_star_capacity`;
        if (!isWithinNumericRange(valuePath, values, 1.6, 8, true)) {
            errors['energy_star_capacity'] = 'The capacity of ENERGY STAR single-load/multi-load washing machines must be between 1.6 and 8 feet³.';
        }
        valuePath = `${basePath}.energy_star_factor`;
        if (!isWithinNumericRange(valuePath, values, 0, 4)) {
            errors['energy_star_factor'] = 'The water factor of ENERGY STAR single-load/multi-load washing machines must be less than or equal to 4.0 gallons/cycle/cubic feet³.';
        }
        valuePath = `${basePath}.energy_star`;
        if(resolve(valuePath, values) < 100 ) {
            let machineType = resolve(`${basePath}.machine_type`, values)
            let maxWaterFactor = machineType == 'top_loading' ? 8.5 : 5.5;
            valuePath = `${basePath}.nonenergy_star_factor`;
            if (!isWithinNumericRange(valuePath, values, 0, maxWaterFactor, true)) {
                errors['nonenergy_star_factor'] = 'Water factor of non-ENERGY STAR single-load/multi-load washing machines must be between 0 and ' + maxWaterFactor +' gallons/cycle/cubic feet³.';
            }
            valuePath = `${basePath}.nonenergy_star_capacity`;
            if (!isWithinNumericRange(valuePath, values, 1.6, 8, true)) {
                errors['nonenergy_star_capacity'] = 'The capacity of non-ENERGY STAR single-load/multi-load washing machines must be between 1.6 and 8 feet³.';
            }
        }
    }
    valuePath = `${basePath}.has_industrial_machines`;
    if(resolve(valuePath, values) == true) {
        valuePath = `${basePath}.weight`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['weight'] = 'The weight of laundry washed in industrial washing machines.';
        }
        valuePath = `${basePath}.industrial_weeks`;
        if (!isWithinNumericRange(valuePath, values, 1, 52)) {
            errors['industrial_weeks'] = 'The number of weeks industrial washing machines are operated must be between 1 and 52.';
        }
        valuePath = `${basePath}.water_use`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['water_use'] = 'The water use per pound of laundry.';
        }
        valuePath = `${basePath}.recycled`;
        if (!isWithinNumericRange(valuePath, values, 0, 99)) {
            errors['recycled'] = 'The percentage of water that is recycled/reused must be between 0 and 99';
        }
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    if (!values.laundry) {
        errors.laundry = 'An answer about laundry facilities is required.';
    }

    const basePath = 'laundry';
    if ((values.has_laundry_facility) === true) {
        let sectionErrors = validateLaundryFacility(values, basePath);
        if (sectionErrors) {
            errors['laundry'] = sectionErrors;
        }
    }
    console.log('%o', errors);
    return errors;
};
export default validate;