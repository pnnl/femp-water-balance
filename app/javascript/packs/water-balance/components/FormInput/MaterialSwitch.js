import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import cx from "classnames";
import {
    FormControlLabel, FormGroup, FormHelperText, Switch
} from '@material-ui/core';

import customInputStyle from './inputStyles'

class MaterialSwitch extends React.Component {

    handleChange = (event, checked) => {
        const {input: {onChange}, trueValue, falseValue} = this.props;
        if (onChange) {
            onChange(checked ? trueValue : falseValue);
        }
    };

    render() {
        const {classes, disabled, helperText, label, required, style, switchColor, trueValue, labelPlacement} = this.props || {};
        // redux-form properties we are proxying
        const {input: {value}, meta: {visited, error, warning}} = this.props || {};
        const displayError = Boolean(visited && Boolean(error));
        const displayWarning = (Boolean(warning));

        const displaySuccess = (visited && !Boolean(error));
        const labelClasses = cx({
            [" " + classes.labelRootError]: displayError,
            [" " + classes.labelRootWarning]: displayWarning,
            [" " + classes.labelRootSuccess]: displaySuccess
        });

        return (
            <FormGroup row style={style} className={classes.formControl}>
                <FormControlLabel className={classes.labelRoot + labelClasses} labelplacement={labelPlacement}
                                  control={
                                      <Switch
                                          disabled={disabled}
                                          checked={value === trueValue}
                                          onChange={this.handleChange}
                                          value={value}
                                          color={switchColor}
                                      />
                                  }
                                  label={label}
                />
                {Boolean(helperText) && (
                    <FormHelperText className={classes.labelRoot + labelClasses}>{helperText}</FormHelperText>)}
                {displayWarning && (
                    <FormHelperText className={classes.labelRoot + labelClasses}
                                    id="material-input-warning">{warning}</FormHelperText>
                )}
                {displayError && (
                    <FormHelperText className={classes.labelRoot + labelClasses}
                                    id="material-input-error">{error}</FormHelperText>
                )}
            </FormGroup>
        );
    }
}

MaterialSwitch.defaultProps = {
    input: {value: ""},
    switchColor: 'secondary',
    trueValue: "true",
    falseValue: "false",
    labelPlacement: "start",
    meta: {},
};

MaterialSwitch.propTypes = {
    classes: PropTypes.object.isRequired,
    trueValue: PropTypes.string,
    falseValue: PropTypes.string,
    labelPlacement: PropTypes.oneOf([
        'start',
        'end',
    ]),
    switchColor: PropTypes.oneOf([
        'primary',
        'secondary',
        'default'
    ]),
};

export default withStyles(customInputStyle)(MaterialSwitch);
