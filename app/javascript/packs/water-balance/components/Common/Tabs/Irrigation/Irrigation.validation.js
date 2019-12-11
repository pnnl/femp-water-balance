import { isWithinNumericRange, isPositiveNumeric } from '../shared/arrayValidationFunctions';

const validateMixedBed = values => {
	const errors = {};
	let valuePath = values.supplemental_irrigation;
	if (valuePath == undefined) {
		errors['supplemental_irrigation'] =
			'What is the general level of supplemental irrigation needed by the plants for the location?';
	}
	valuePath = values.plant_density;
	if (valuePath == undefined) {
		errors['plant_density'] = 'What is the density of the plants in the landscape?';
	}
	valuePath = values.exposure;
	if (valuePath == undefined) {
		errors['exposure'] = 'What is the exposure of the landscape? ';
	}

	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateTurfgrass = values => {
	const errors = {};
	let valuePath = values.species;
	if (valuePath == undefined) {
		errors['species'] = 'What is the turfgrass species?';
	}

	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateLandscape = values => {
	const errors = {};
	let valuePath = values.condition;
	if (valuePath == undefined) {
		errors['condition'] = 'What is the general appearance/condition of the landscape?';
	}
	valuePath = values.soil_type;
	if (valuePath == undefined) {
		errors['soil_type'] = 'What is the soil type?';
	}
	valuePath = values.area;
	if (!isPositiveNumeric(valuePath)) {
		errors['area'] = 'The landscape area size.';
	}
	valuePath = values.equipment;
	if (valuePath == undefined) {
		errors['equipment'] = 'Irrigation equipment type.';
	}
	valuePath = values.controls;
	if (valuePath == undefined) {
		errors['controls'] = 'Type of irrigation controls.';
	}
	valuePath = values.puddles_observed;
	if (valuePath == undefined) {
		errors['puddles_observed'] = 'Puddles observed in and around the landscape area.';
	}
	valuePath = values.runoff_observed;
	if (valuePath == undefined) {
		errors['runoff_observed'] = 'Runoff observed in and around the landscape area.';
	}
	valuePath = values.leaks_observed;
	if (valuePath == undefined) {
		errors['leaks_observed'] = 'Leaks observed with the equipment.';
	}
	valuePath = values.broken_equipment;
	if (valuePath == undefined) {
		errors['broken_equipment'] = 'Broken equipment observed.';
	}
	valuePath = values.sidewalks;
	if (valuePath == undefined) {
		errors['sidewalks'] = 'Impervious surfaces being watered.';
	}

	return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateIrrigation = (values, allBoilers) => {
	const errors = {};
	if (!values.name) {
		errors['name'] =
			'Enter a unique name identifier for this irrigated area (such as where it is located, or building number/name it is associated)';
	}
	if (!values.is_metered) {
		errors['is_metered'] = 'Is the water use metered?';
	}
	let valuePath = values.annual_water_use;
	if (values.is_metered == 'yes') {
		if (!isPositiveNumeric(valuePath)) {
			errors['annual_water_use'] = 'Annual water usage is required if water is metered.';
		}
	} else {
		let startMonth = values.start_month;
		if (startMonth == undefined) {
			errors['start_month'] = 'Month irrigation starts';
		}
		let endMonth = values.end_month;
		if (endMonth == undefined) {
			errors['end_month'] = 'Month irrigation ends';
		}
		if (startMonth > endMonth) {
			errors['start_month'] = 'Start month must be before end month.';
		}
		valuePath = values.type;
		if (valuePath == undefined) {
			errors['type'] = 'Is the majority of this landscape area mixed beds or turfgrass?';
		}
		if (valuePath == 'Mixed Beds') {
			const mixedBedErrors = validateMixedBed(values);
			if (mixedBedErrors) {
				Object.assign(errors, mixedBedErrors);
			}
		}
		if (valuePath == 'Turfgrass') {
			const turfgrassErrors = validateTurfgrass(values);
			if (turfgrassErrors) {
				Object.assign(errors, turfgrassErrors);
			}
		}
		const landscapeErrors = validateLandscape(values);
		if (landscapeErrors) {
			Object.assign(errors, landscapeErrors);
		}
	}

	valuePath = values.name;
	let isUsed = false;
	let resolvedValue = undefined;

	allBoilers.map((boiler, index) => {
		if (boiler != undefined) {
			let resolvedValue = boiler.name;
			if (resolvedValue == valuePath && isUsed == true && valuePath != undefined) {
				errors['name'] = 'Identifiers must be unique.';
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
	const irrigationErrors = [];
	const allLandscapes = values.irrigation;
	allLandscapes.map((landscape, index) => {
		if (landscape) {
			let sectionErrors = validateIrrigation(landscape, allLandscapes);
			if (sectionErrors) {
				irrigationErrors[index] = sectionErrors;
			}
		}
	});

	if (irrigationErrors.length > 0) {
		errors['irrigation'] = irrigationErrors;
	}

	return errors;
};
export default validate;
