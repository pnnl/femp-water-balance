import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import cx from 'classnames';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    TextField
} from '@material-ui/core';
import MaskedInput from 'react-text-mask';
import customInputStyle from './inputStyles';

class MaterialInput extends React.Component {
    handleChange = event => {
        const {
            input: {onChange},
        } = this.props;
        if (onChange) {
            onChange(event.target.value);
        }
    };

    renderTextComponent() {
        const {classes, inputRef, label, id, mask, placeholder, disabled, startAdornment, endAdornment} =
        this.props || {};
        const {
            input: {onBlur, onFocus, value, name},
        } = this.props || {};
        const marginTop = cx({
            [classes.marginTop]: label === undefined,
        });
        return mask ? (
            <MaskedInput
                id={id}
                value={value}
                name={name}
                mask={mask}
                onBlur={onBlur}
                placeholder={placeholder}
                onFocus={onFocus}
                onChange={this.handleChange}
                disabled={disabled}
                render={(ref, props) => (
                    <Input
                        classes={{
                            root: marginTop,
                            disabled: classes.disabled,
                            underline: classes.underline,
                        }}
                        inputRef={ref}
                        {...props}
                    />
                )}
                ref={inputRef}
            />
        ) : (
            <Input
                classes={{
                    root: marginTop,
                    disabled: classes.disabled,
                    underline: classes.underline,
                }}
                id={id}
                onBlur={onBlur}
                value={value}
                name={name}
                disabled={disabled}
                placeholder={placeholder}
                onFocus={onFocus}
                onChange={this.handleChange}
                startAdornment={startAdornment}
                endAdornment={endAdornment}
            />
        );
    }

    render() {
        const {classes, disabled, helperText, label, required, style} =
        this.props || {};
        // redux-form properties we are proxying
        const {
            meta: {visited, error, warning},
        } = this.props || {};
        const displayError = visited && Boolean(error);
        const displayWarning = Boolean(warning);
        const formControlProps = {
            fullWidth: true,
            error: displayError,
            required,
            disabled: Boolean(disabled || false),
        };

        const displaySuccess = visited && !error;
        const labelClasses = cx({
            [` ${classes.labelRootError}`]: displayError,
            [` ${classes.labelRootWarning}`]: displayWarning,
            [` ${classes.labelRootSuccess}`]: displaySuccess,
        });

        return (
            <FormControl
                style={style}
                className={`${formControlProps.className} ${classes.formControl}`}
                {...formControlProps}
            >
                <InputLabel
                    error={displayError}
                    className={classes.labelRoot + labelClasses}
                    htmlFor="material-input"
                >
                    {label}
                </InputLabel>
                {this.renderTextComponent()}
                {Boolean(helperText) && (
                    <FormHelperText className={classes.labelRoot + labelClasses}>
                        {helperText}
                    </FormHelperText>
                )}
                {displayWarning && (
                    <FormHelperText
                        className={classes.labelRoot + labelClasses}
                        id="material-input-warning"
                    >
                        {warning}
                    </FormHelperText>
                )}
                {displayError && (
                    <FormHelperText
                        className={classes.labelRoot + labelClasses}
                        id="material-input-error"
                    >
                        {error}
                    </FormHelperText>
                )}
            </FormControl>
        );
    }
}

MaterialInput.defaultProps = {
    input: {value: ''},
    meta: {},
    idProperty: 'id',
    renderValue: 'name',
};

MaterialInput.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    helperText: PropTypes.any,
    label: PropTypes.any,
    // if using an input mask these are the optional properties that can be pass
    mask: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.func,
        PropTypes.bool,
        PropTypes.shape({
            mask: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            pipe: PropTypes.func,
        }),
    ]),
    guide: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pipe: PropTypes.func,
    placeholderChar: PropTypes.string,
    keepCharPositions: PropTypes.bool,
    showMask: PropTypes.bool,
};

export default withStyles(customInputStyle, {withTheme: true})(MaterialInput);
