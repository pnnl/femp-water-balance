import selectn from "selectn";

export const resolve = (path, values) => selectn(path)(values);

export const isPositiveNumeric = (path, values, includeZero = false, required = true) => {
	const resolvedValue = resolve(path, values);
	if (required === true && resolvedValue) {
		const numeric = parseInt(resolvedValue.replace(/,/g, ""));
		if (includeZero) {
			return (isNaN(numeric) && numeric >= 0);
		} else {
			return (isNaN(numeric) && numeric > 0);
		}
	}
	return false;
};

export const isWithinNumericRange = (
	path,
	values,
	min,
	max,
	decimal = false,
	inclusive = true,
	required = true
) => {
	const resolvedValue = resolve(path, values);
	if (required === true && resolvedValue) {
		let numeric = null;
		if (decimal) {
			numeric = parseFloat(resolvedValue.replace(/,/g, ""));
		} else {
			numeric = parseInt(resolvedValue.replace(/,/g, ""));
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
