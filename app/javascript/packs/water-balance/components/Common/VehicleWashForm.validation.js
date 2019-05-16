import selectn from 'selectn';

const resolve = (path, values) => selectn(path)(values);

const isPositiveNumeric = (path, values, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue) {
        const numeric = parseInt(resolvedValue.replace(/,/g,''));
        return !(isNaN(numeric) || numeric < 0);
    }
    return false;
};

const isWithinNumericRange = (path, values, min, max, inclusive = true, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue){
        const numeric = parseInt(resolvedValue.replace(/,/g,''));
        if (isNaN(numeric)) {
            return false;
        } else if (inclusive === true) {
            return (numeric >= min && numeric <= max);
        }
        return (numeric > min && numeric < max);
    }
    return false;
};

const validateAutomatedFacility = (values, basePath) => {
    const errors = {};
    if (resolve(`${basePath}.metered`, values) === true) {
        let valuePath = `${basePath}.water_usage`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['water_usage'] = 'Annual water usage is required if this facility is metered.';
        }
    } else {
        let valuePath = `${basePath}.wpy`;
        if (!isWithinNumericRange(valuePath, values, 1,52)) {
            errors['wpy'] = 'The number of weeks per year vehicles are washed must be between 1 and 52.';
        }
        valuePath = `${basePath}.vpw`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['vpw'] = 'A positive number for the average number of vehicles washed per week is required.';
        }
        valuePath = `${basePath}.gpv`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['gpv'] = 'A positive number for the estimated number of gallons per vehicle is required.';
        }
        valuePath = `${basePath}.recycled`;
        if (!isWithinNumericRange(valuePath, values, 0,100)) {
            errors['recycled'] = 'The percentage of recycled or reused water must be between 0 and 100.';
        }
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateConveyorFacility = (values, basePath) => {
    const errors = {};
    if (!resolve(`${basePath}.type`, values)) {
       errors['type'] = 'Please select the conveyor type for this facility';
    }
    const facilityErrors = validateAutomatedFacility(values, basePath);
    if (facilityErrors){
        Object.assign(errors, facilityErrors);
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = values => {
    const errors = {};
    if (!values.vw_facilities) {
        errors.vw_facilities = 'An answer about vehicle wash facilities is required.';
    }
    const vehicleWash = {};
    const basePath = 'vehicle_wash';
    errors[basePath] = vehicleWash;
    if (selectn(`${basePath}.auto_wash_facilities`)(values) === true) {
        let sectionErrors = validateAutomatedFacility(values, `${basePath}.auto_wash`);
        if (sectionErrors) {
            vehicleWash['auto_wash'] = sectionErrors;
        }
    }
    if (selectn(`${basePath}.conveyor_facilities`)(values) === true) {
        let sectionErrors = validateConveyorFacility(values, `${basePath}.conveyor`);
        if (sectionErrors) {
            vehicleWash['conveyor'] = sectionErrors;
        }
    }
    return errors;
};
export default validate;
