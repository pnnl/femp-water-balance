const isWithinNumericRange = (value, min, max, inclusive = true, required = true) => {
      if (required === true && value) {
        const numeric = parseInt(value.replace(/,/g,''));
        if (isNaN(numeric)) {
            return false;
        } else if (inclusive === true) {
            return (numeric >= min && numeric <= max);
        }
        return (numeric > min && numeric < max);
    }
    return false;
};


const validateWaterSupply = (values) => {
    const errors = {};
    const calendarYear = new Date().getFullYear();
    let valuePath = values.calendar_year;
    if (!isWithinNumericRange(valuePath, 2010, calendarYear)) {
        errors['calendar_year'] = 'Calendar year must be between 2010 and ' + calendarYear + '.';
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    let errors = {};

    let sectionErrors = validateWaterSupply(values);
    if (sectionErrors) {
        errors = sectionErrors;
    }

    return errors;
};
export default validate;