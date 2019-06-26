import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import cx from 'classnames';
import {
    Button
} from '@material-ui/core';
import GoogleLoginButtonStyles from './GoogleLoginButton.styles';

class GoogleLoginButton extends React.Component {
    render() {
        const { buttonTheme, classes } = this.props;
        const buttonClasses = cx({
            [` ${classes.darkButton}`]: buttonTheme === 'dark',
            [` ${classes.lightButton}`]: buttonTheme === 'light'
        });
        return (
            <Button id="google-login-button" href="/accounts/auth/google_oauth2" title="Login with your Google account" disableRipple className={classes.buttonRoot + buttonClasses} >&nbsp;</Button>
        );
    }
}

GoogleLoginButton.defaultProps = {
    buttonTheme: 'dark',
};

GoogleLoginButton.propTypes = {
    buttonTheme: PropTypes.oneOf(['dark', 'light']),
};

export default withStyles(GoogleLoginButtonStyles)(GoogleLoginButton);
