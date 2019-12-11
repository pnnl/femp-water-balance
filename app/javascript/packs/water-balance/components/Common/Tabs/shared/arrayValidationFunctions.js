export const isWithinNumericRange = (
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

export const isPositiveNumeric = (value, required = true) => {
	if (required === true && value) {
		const numeric = parseInt(value.replace(/,/g, ""));
		return !(isNaN(numeric) || numeric < 0);
	}
	return false;
};
