const validateGeneralBuilding = (values, allValues) => {
  const errors = {};
  if (!values.name) {
    errors['name'] =
      'Enter a unique name identifier for this building (such as the building name/number it is associated).';
  }
  if (!values.primary_building_type) {
    errors['primary_building_type'] = 'Primary building type is required.';
  }
  if (values.primary_building_type === 'other' && !values.building_occupants) {
    errors['building_occupants'] = 'Select whether occupants are stationary or transient.';
  }
  const allNames = allValues.buildings.filter((building) => building.name === values.name);
  if (allNames.length > 1) {
    errors['name'] = 'Identifiers must be unique.';
  }
  return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = (values) => {
  const errors = {};
  const generalBuildingErrors = [];

  values.buildings.map((building, index) => {
    if (building) {
      let sectionErrors = validateGeneralBuilding(building, values);
      if (sectionErrors) {
        generalBuildingErrors[index] = sectionErrors;
      }
    }
  });

  if (generalBuildingErrors.length > 0) {
    errors['buildings'] = generalBuildingErrors;
  }

  return errors;
};
export default validate;
