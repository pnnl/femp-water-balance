export const submitAlert = (valid, createOrUpdateCampusModule, values) => {
    if (
        valid ||
        (!valid &&
            window.confirm(
                'There are missing or invalid values would you like to save?'
            ))
    ) {
        createOrUpdateCampusModule(values);
    }
};
