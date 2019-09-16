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

const validateProcesses = (values, allValues, allProcesses, processType) => {
    const errors = {};
    let units = (processType == 'continuous_processes') ? "hours" : "batches";

    let valuePath = values.annual_water_use;
    if (values.is_metered == 'yes') {
        if (!isPositiveNumeric(valuePath)) {
            errors['annual_water_use'] = 'Annual water usage is required if this process is metered.';
        }
    } 
    else if (values.is_metered == 'no') {
        valuePath = values.average_week;
        if (!isWithinNumericRange(valuePath, 1, 120)) {
            errors['average_week'] = 'The average number of ' + units + ' per week must be between 1 and 120.';
        }
        valuePath = values.week_year;
        if (!isWithinNumericRange(valuePath, 1, 52)) {
            errors['week_year'] = 'The number of weeks per year the process runs must be between 1 and 52.';
        }
        if (processType == 'continuous_processes') {
            valuePath = values.flow_rate;
            if (!isPositiveNumeric(valuePath)) {
                errors['flow_rate'] = 'The typical flow rate of the process.';
            }
        } else {
            valuePath = values.water_use;
            if (!isPositiveNumeric(valuePath)) {
                errors['water_use'] = 'The water use per batch for this process.';
            }
        }
        valuePath = values.recycled;
        if (!isWithinNumericRange(valuePath, 0, 99)) {
            errors['recycled'] = 'The percentage of water that is recycled/reused must be between 0 and 99';
        }
    }

    valuePath = values.name;
    let isUsed = false;
    let resolvedValue = undefined;

    allProcesses.map((processes, index) => {
        if(processes != undefined) {
            let resolvedValue = processes.name;
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

const batchProcessesErrors = (values, allValues, allProcesses) => {
    let errors = {};
    if(!resolve('other_processes.has_batch_processes', allValues)) {
        return errors;
    }
    const processErrors = validateProcesses(values, allValues, allProcesses, "batch_processes");
    if (processErrors){
        Object.assign(errors, processErrors);
    }
    if(!values.name) {
        errors['name'] = "Enter a unique identifier (such as name of the process)"
    }
    if (!values.is_metered) {
        errors['is_metered'] = "Is the water use metered?"
    }

    return Object.keys(errors).length === 0 ? undefined : errors;
}

const continuousProcessesErrors = (values, allValues, allProcesses) => {
    let errors = {};
    if(!resolve('other_processes.has_continuous_processes', allValues)) {
        return errors;
    }
    const processErrors = validateProcesses(values, allValues, allProcesses, "continuous_processes");
    if (processErrors){
        Object.assign(errors, processErrors);
    }

    if(!values.name) {
        errors['name'] = "Enter a unique identifier (such as name of the process)"
    }
    if (!values.is_metered) {
        errors['is_metered'] = "Is the water use metered?"
    }
    return Object.keys(errors).length === 0 ? undefined : errors;
}

const validate = values => {
    const errors = {};
    const batchErrors = [];
    const continuousErrors = [];
    const sectionErrors = {};

    if (!values.other_processes) {
        errors.other_processes = 'An answer about other processes is required.';
    }
    if(values.batch_processes[0] == null && values.continuous_processes[0] == null) {
        return errors;
    }
    const allProcesses = values.batch_processes.concat(values.continuous_processes);
    values.batch_processes.map((processes, index) => {
        if(processes) {
            let sectionErrors = batchProcessesErrors(processes, values, allProcesses);
            if (sectionErrors) {
                batchErrors[index] = sectionErrors;
            }
        }
    })

    if(batchErrors.length > 0) {
        errors['batch_processes'] = batchErrors;
    }

    values.continuous_processes.map((processes, index) => {
        if(processes) {
            let sectionErrors = continuousProcessesErrors(processes, values, allProcesses);
            if (sectionErrors) {
                continuousErrors[index] = sectionErrors;
            }
        }
    })

    if(continuousErrors.length > 0) {
        errors['continuous_processes'] = continuousErrors;
    }

    return errors;
};
export default validate;