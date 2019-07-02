

const isPositiveNumeric = (value, required = true) => {
    if (required === true && value) {
        const numeric = parseInt(value.replace(/,/g,''));
        return !(isNaN(numeric) || numeric < 0);
    }
    return false;
};

const isWithinNumericRange = (value, min, max, decimal = false, inclusive = true, required = true) => {
    if (required === true && value) {
        let numeric = null;
        if(decimal) {
            numeric = parseFloat(value.replace(/,/g,''));
        } else {
            numeric = parseInt(value.replace(/,/g,''));
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

const validatekitchenFacility = (values) => {
    
    const errors = {};
    let valuePath = values.annual_water_use;
    if (values.is_metered) {
        if (!isPositiveNumeric(valuePath)) {
            errors['annual_water_use'] = 'Annual water usage is required if this facility is metered.';
        }
    }
    valuePath = values.operating_weeks;
    if (!isWithinNumericRange(valuePath, 1, 52)) {
        errors['operating_weeks'] = 'The number of weeks per year vehicles are washed must be between 1 and 52.';
    }
    valuePath = values.operating_weekends;
    if (!isWithinNumericRange(valuePath, 1, 52)) {
        errors['operating_weekends'] = 'The number of weekends per year vehicles are washed must be between 1 and 52.';
    }
    valuePath = values.flow_rate;
    if (!isWithinNumericRange(valuePath, 0.5, 4, true)) {
        errors['flow_rate'] = 'The flow rate must be between 0.5 and 4.0 gpm';
    }
    var week_meals = values.weekday_meals;
    var weekend_meals = values.weekend_meals;
    if(week_meals == 0 && weekend_meals == 0) {
        errors['weekday_meals'] = 'Number of meals prepared cannot be 0 for both weekdays and weekends.';
        errors['weekend_meals'] = 'Number of meals prepared cannot be 0 for both weekdays and weekends.';
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    if (!values.kitchen_facilities) {
        errors.kitchen_facilities = 'An answer about vehicle wash facilities is required.';
    }
    const facilitiesErrors = [];
    values.kitchen_facilities.map((facility, index) => {
        const basePath = `kitchen_facilities[${index}]`;
        if(facility) {
            let sectionErrors = validatekitchenFacility(facility, basePath);
            if (sectionErrors) {
                facilitiesErrors[index] = sectionErrors;
            }
        }
    })
    if(facilitiesErrors.length > 0) {
        errors['kitchen_facilities'] = facilitiesErrors;
    }
    return errors;
};
export default validate;