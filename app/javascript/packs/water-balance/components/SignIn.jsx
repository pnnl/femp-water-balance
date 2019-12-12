import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import GoogleLoginButton from './Common/GoogleLoginButton';

const styles = theme => ({
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit *
            3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit,
        backgroundColor: theme.palette.secondary.main,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

function SignIn(props) {
    const { classes } = props;
    return (
        <Paper className={classes.paper}>
            <Grid container justify="center" alignItems="center" spacing={16}>
                <Grid item>
                    <Typography component="h1" variant="h5">
                        Click or tap below to sign in with Google
                    </Typography>
                    <GoogleLoginButton buttonTheme="dark" />
                    <br />
                    <Typography variant="subtitle1" align="left" gutterBottom>
                        &nbsp; Or create a Google account{' '}
                        <a href="https://support.google.com/mail/answer/56256?hl=en">
                            here.
                        </a>
                    </Typography>
                </Grid>
                {NODE_ENV === 'development' && (
                    <Grid item>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="email">Email Address</InputLabel>
                        <Input
                            id="email"
                            name="account[email]"
                            autoComplete="email"
                            autoFocus
                        />
                    </FormControl>
                    <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            id="password"
                            name="account[password]"
                            type="password"
                            autoComplete="current-password"
                        />
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="account[remember_me]"
                                value="remember"
                                color="primary"
                            />
                        }
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign in
                    </Button>
                </Grid>
                )}
            </Grid>
        </Paper>
    );
}

SignIn.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);
