import selectn from 'selectn';

const resolve = (path, values) => selectn(path)(values);

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

const validatekitchenFacility = (values, allValues) => {
    
    const errors = {};
    let valuePath = values.annual_water_use;
    if (values.is_metered) {
        if (!isPositiveNumeric(valuePath)) {
            errors['annual_water_use'] = 'Annual water usage is required if this facility is metered.';
        }
    }
    valuePath = values.operating_weeks;
    if (!isWithinNumericRange(valuePath, 1, 52)) {
        errors['operating_weeks'] = 'The number of weeks per year commercial kitchens are operated must be between 1 and 52.';
    }
    valuePath = values.operating_weekends;
    if (!isWithinNumericRange(valuePath, 1, 52)) {
        errors['operating_weekends'] = 'The number of weekends per year commercial kitchens are operated must be between 1 and 52.';
    }
    valuePath = values.flow_rate;
    if (!isWithinNumericRange(valuePath, .3, 4, true)) {
        errors['flow_rate'] = 'The flow rate must be between 0.3 and 4.0 gpm';
    }

    var week_meals = values.weekday_meals;
    var weekend_meals = values.weekend_meals;
    if (!isPositiveNumeric(week_meals)) {
        errors['weekday_meals'] = 'The average number of meals prepared per week.';
    } else if (week_meals == 0 && weekend_meals == 0) {
        errors['weekday_meals'] = 'Number of meals prepared cannot be 0 for both weekdays and weekends.';
    }

    if (!isPositiveNumeric(weekend_meals)) {
        errors['weekend_meals'] = 'The average number of meals prepared per weekend.';
    } else if (week_meals == 0 && weekend_meals == 0) {
        errors['weekend_meals'] = 'Number of meals prepared cannot be 0 for both weekdays and weekends.';
    }

    valuePath = values.name;
    let isUsed = false;
    let resolvedValue = undefined;
    allValues.kitchen_facilities.map((facility, index) => {
        if(facility != undefined) {
                resolvedValue = facility.name;
            if (resolvedValue == valuePath && isUsed == true && valuePath != undefined) {
                errors['name'] = 'Identifiers must be unique.';
                isUsed = false;
            } 
            if (resolvedValue == valuePath) {
                isUsed = true;
            } 
        }
    })
    

    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    if (!values.kitchen_facilities) {
        errors.kitchen_facilities = 'An answer about commercial kitchens is required.';
    }
    const facilitiesErrors = [];

    values.kitchen_facilities.map((facility, index) => {
        if(facility) {
            let sectionErrors = validatekitchenFacility(facility, values);
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