import { isWithinNumericRange, isPositiveNumeric } from "./shared/arrayValidationFunctions";

const validatekitchenFacility = (values, allValues) => {
	const errors = {};
	if (!values.type) {
		errors["type"] =
			"Is the commercial kitchen a stand-alone facility or is it incorporated into another building?";
	}
	if (!values.name) {
		errors["name"] =
			"Enter a unique identifier for this commercial kitchen facility (such as a building name or building number).";
	}
	if (values.stand_alone == "yes") {
		if (!values.is_metered) {
			errors["is_metered"] = "Is the water use metered?";
		}
	}
	let valuePath = values.annual_water_use;
	if (values.is_metered == "yes") {
		if (!isPositiveNumeric(valuePath)) {
			errors["annual_water_use"] =
				"Annual water usage is required if this facility is metered.";
		}
	} else {
		var week_meals = values.weekday_meals;
		var weekend_meals = values.weekend_meals;
		if (!isPositiveNumeric(week_meals)) {
			errors["weekday_meals"] = "The average number of daily meals prepared during weekdays.";
		}
		if (!isPositiveNumeric(weekend_meals)) {
			errors["weekend_meals"] =
				"The average number of daily meals prepared during weekend days.";
		}
		if (week_meals == 0 && weekend_meals == 0) {
			errors["weekend_meals"] =
				"Number of meals prepared cannot be 0 for both weekdays and weekends.";
			errors["weekday_meals"] =
				"Number of meals prepared cannot be 0 for both weekdays and weekends.";
		}
		if (week_meals != 0) {
			valuePath = values.days_per_week;
			if (!isWithinNumericRange(valuePath, 1, 5)) {
				errors["days_per_week"] =
					"The number of weekdays per week meals are prepared must be between 1 and 5.";
			}
			valuePath = values.operating_weeks;
			if (!isWithinNumericRange(valuePath, 1, 52)) {
				errors["operating_weeks"] =
					"The number of weeks per year commercial kitchens are operated must be between 1 and 52.";
			}
		}
		if (weekend_meals != 0) {
			valuePath = values.days_per_weekend;
			if (!isWithinNumericRange(valuePath, 1, 2)) {
				errors["days_per_weekend"] =
					"The number of weekend days per week meals are prepared must be between 1 and 2.";
			}
			valuePath = values.operating_weekends;
			if (!isWithinNumericRange(valuePath, 1, 52)) {
				errors["operating_weekends"] =
					"The number of weekends per year commercial kitchens are operated must be between 1 and 52.";
			}
		}
		valuePath = values.dishwasher_type;
		if (!valuePath) {
			errors["dishwasher_type"] = "Select type of dishwasher.";
		}
		valuePath = values.spray_valve;
		if (!valuePath) {
			errors["spray_valve"] = "Select type of type of pre-rinse spray valve.";
		}
		valuePath = values.flow_rate;
		if (!isWithinNumericRange(valuePath, 0.3, 4, true)) {
			errors["flow_rate"] = "The flow rate must be between 0.3 and 4.0 gpm.";
		}
		valuePath = values.combination_oven;
		if (!valuePath) {
			errors["combination_oven"] = "Select type of combination oven or steam cooker.";
		}
		valuePath = values.ice_maker;
		if (!valuePath) {
			errors["ice_maker"] = "Select type of ice maker.";
		}
	}

	valuePath = values.name;
	let isUsed = false;
	let resolvedValue = undefined;
	allValues.kitchen_facilities.map((facility, index) => {
		if (facility != undefined) {
			resolvedValue = facility.name;
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
	if (!values.kitchen_facilities) {
		errors.kitchen_facilities = "An answer about commercial kitchens is required.";
	}
	const facilitiesErrors = [];

	values.kitchen_facilities.map((facility, index) => {
		if (facility) {
			let sectionErrors = validatekitchenFacility(facility, values);
			if (sectionErrors) {
				facilitiesErrors[index] = sectionErrors;
			}
		}
	});

	if (facilitiesErrors.length > 0) {
		errors["kitchen_facilities"] = facilitiesErrors;
	}

	return errors;
};
export default validate;
