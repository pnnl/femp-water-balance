import selectn from "selectn";

const resolve = (path, values) => selectn(path)(values);

const isPositiveNumeric = (value, required = true) => {
	if (required === true && value) {
		const numeric = parseInt(value.replace(/,/g, ""));
		return !(isNaN(numeric) || numeric < 0);
	}
	return false;
};

const isWithinNumericRange = (
	value,
	min,
	max,
	decimal = false,
	inclusive = true,
	required = true
) => {
	if (required === true && value) {
		let numeric = null;
		if (decimal) {
			numeric = parseFloat(value.replace(/,/g, ""));
		} else {
			numeric = parseInt(value.replace(/,/g, ""));
		}
		if (isNaN(numeric)) {
			return false;
		} else if (inclusive === true) {
			return numeric >= min && numeric <= max;
		}
		return numeric > min && numeric < max;
	}
	return false;
};

const validateSoftner = values => {
	const errors = {};
	let valuePath = values.water_regeneration;
	if (!isPositiveNumeric(valuePath)) {
		errors["water_regeneration"] = "The amount of water used between regenerations.";
	}
	valuePath = values.regeneration_per_week;
	if (!isPositiveNumeric(valuePath)) {
		errors["regeneration_per_week"] = "The number of times the system regenerates in 1 week.";
	}

	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateNoSoftner = values => {
	const errors = {};
	let valuePath = values.steam_generation;
	if (!isPositiveNumeric(valuePath)) {
		errors["steam_generation"] = "The steam generation rate.";
	}
	valuePath = values.condensate_percentage;
	if (!isPositiveNumeric(valuePath)) {
		errors["condensate_percentage"] = "The percentage of condensate that is returned.";
	}
	valuePath = values.cycles_concentration;
	if (!isPositiveNumeric(valuePath)) {
		errors["cycles_concentration"] = "The cycles of concentration.";
	}
	valuePath = values.hours_week;
	if (!isWithinNumericRange(valuePath, 1, 168)) {
		errors["hours_week"] =
			"The number of hours the system operates per week needs to be between 1 and 168.";
	}
	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateProcesses = (values, allBoilers) => {
	const errors = {};
	if (!values.name) {
		errors["name"] =
			"Enter a unique identifier for this steam boiler system (such as the building name/number it is associated)";
	}
	if (!values.is_metered) {
		errors["is_metered"] = "Is the makeup water metered?";
	}
	let valuePath = values.annual_water_use;
	if (values.is_metered == "yes") {
		if (!isPositiveNumeric(valuePath)) {
			errors["annual_water_use"] =
				"Annual water usage is required if makeup water is metered.";
		}
	} else {
		valuePath = values.softener;
		if (valuePath == undefined) {
			errors["softener"] = "Does the system have a softener or water conditioning system?";
		}
		if (valuePath == "yes") {
			const softenerErrors = validateSoftner(values);
			if (softenerErrors) {
				Object.assign(errors, softenerErrors);
			}
		}
		if (valuePath == "no") {
			const noSoftenerErrors = validateNoSoftner(values);
			if (noSoftenerErrors) {
				Object.assign(errors, noSoftenerErrors);
			}
		}
		if (valuePath != undefined) {
			valuePath = values.operating_weeks;
			if (!isWithinNumericRange(valuePath, 1, 52)) {
				errors["operating_weeks"] =
					"The number of weeks per year the system is operating must be between 1 and 52.";
			}
		}
	}

	valuePath = values.name;
	let isUsed = false;
	let resolvedValue = undefined;

	allBoilers.map((boiler, index) => {
		if (boiler != undefined) {
			let resolvedValue = boiler.name;
			if (resolvedValue == valuePath && isUsed == true && valuePath != undefined) {
				errors["name"] = "Identifiers must be unique.";
				isUsed = false;
			}
			if (resolvedValue == valuePath) {
				isUsed = true;
			}
		}
	});

	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = values => {
	const errors = {};
	if (!values.steam_boilers) {
		errors.steam_boilers = "An answer about steam boilers is required.";
	}
	const boilerErrors = [];
	const allBoilers = values.steam_boilers;
	values.steam_boilers.map((boiler, index) => {
		if (boiler) {
			let sectionErrors = validateProcesses(boiler, allBoilers);
			if (sectionErrors) {
				boilerErrors[index] = sectionErrors;
			}
		}
	});

	if (boilerErrors.length > 0) {
		errors["steam_boilers"] = boilerErrors;
	}

	return errors;
};
export default validate;
