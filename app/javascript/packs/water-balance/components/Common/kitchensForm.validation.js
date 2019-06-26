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

const isWithinNumericDecimalRange = (path, values, min, max, inclusive = true, required = true) => {
    const resolvedValue = resolve(path, values);
    if (required === true && resolvedValue){
        const numeric = parseFloat(resolvedValue.replace(/,/g,''));
        if (isNaN(numeric)) {
            return false;
        } else if (inclusive === true) {
            return (numeric >= min && numeric <= max);
        }
        return (numeric > min && numeric < max);
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


const validatekitchenFacility = (values, basePath) => {
    const errors = {};

        let valuePath = `${basePath}.total_annual`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['total_annual'] = 'Annual water usage is required if this facility is metered.';
        }
        valuePath = `${basePath}.operating_weeks`;
        if (!isWithinNumericRange(valuePath, values, 1,52)) {
            errors['operating_weeks'] = 'The number of weeks per year vehicles are washed must be between 1 and 52.';
        }
        valuePath = `${basePath}.operating_weekends`;
        if (!isWithinNumericRange(valuePath, values, 1,52)) {
            errors['operating_weekends'] = 'The number of weeks per year vehicles are washed must be between 1 and 52.';
        }
        valuePath = `${basePath}.flow_rate`;
        if (!isWithinNumericDecimalRange(valuePath, values, 1,52)) {
            errors['flow_rate'] = 'The flow rate must be between 0.5 and 4.0 gpm';
        }
        
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    if (!values.kitchen_facilities) {
        errors.kitchen_facilities = 'An answer about vehicle wash facilities is required.';
    }
    const kitchenFacility = {};
    const basePath = 'kitchen_facility';
    errors[basePath] = kitchenFacility;

    
    let sectionErrors = validatekitchenFacility(values, basePath);
    if (sectionErrors) {
        Object.assign(kitchenFacility, sectionErrors);
    }

    return errors;
};

export default validate;