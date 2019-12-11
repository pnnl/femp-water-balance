import { isWithinNumericRange, isPositiveNumeric } from '../shared/arrayValidationFunctions';

const validateProcesses = (values, allTowers) => {
	const errors = {};
	if (!values.name) {
		errors['name'] =
			'Enter a unique name identifier for this cooling tower system (such as the building name/number the cooling tower is associated with)';
	}
	if (!values.is_metered) {
		errors['is_metered'] = 'Is the makeup water metered?';
	}
	let valuePath = values.annual_water_use;
	if (values.is_metered == 'yes') {
		if (!isPositiveNumeric(valuePath)) {
			errors['annual_water_use'] =
				'Annual water usage is required if makeup water is metered.';
		}
	} else {
		valuePath = values.tonnage;
		if (valuePath == undefined) {
			errors['tonnage'] = 'The total tonnage of the chillers associated with the system.';
		}
		valuePath = values.cycles;
		if (valuePath == undefined) {
			errors['cycles'] = 'The cycles of concentration for the system.';
		}
		valuePath = values.days_per_year;
		if (!isWithinNumericRange(valuePath, 1, 365)) {
			errors['days_per_year'] =
				'The number of days per year the system operates must be between 1 and 365.';
		}
	}

	valuePath = values.name;
	let isUsed = false;
	let resolvedValue = undefined;

	allTowers.map((tower, index) => {
		if (tower != undefined) {
			let resolvedValue = tower.name;
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
	const coolingTowerErrors = [];
	const allTowers = values.cooling_towers;
	values.cooling_towers.map((tower, index) => {
		if (tower) {
			let sectionErrors = validateProcesses(tower, allTowers);
			if (sectionErrors) {
				coolingTowerErrors[index] = sectionErrors;
			}
		}
	});

	if (coolingTowerErrors.length > 0) {
		errors['cooling_towers'] = coolingTowerErrors;
	}

	return errors;
};
export default validate;
