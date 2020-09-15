import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Divider from '@material-ui/core/Divider';
import fempLogo from 'images/FEMP_logo.png';
import HelpIcon from '@material-ui/icons/Help';
import CampusIntroduction from '../Tabs/LandingPage/CampusIntroduction';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import HomeIcon from '@material-ui/icons/Home';
import waterBalanceLogo from 'images/water-balance-logo.png';

import styles from './styles';

import NavigationMenu from '../Administration/NavigationMenu';

const hasRole = (user, role) => {
    if (user && Array.isArray(user.roles)) {
        return user.roles.filter(roleObj => roleObj.role === role).length > 0;
    }
    return false;
};

class DefaultToolbar extends React.Component {
    state = {
        anchorEl: null,
        open: false,
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleDialog = () => {
        this.setState({ open: false });
    };

    renderUserNavMenu = () => {
        const { user } = this.props;
        if (user && hasRole(user, 'administrator')) {
            return (
                <Fragment>
                    <NavigationMenu account={user} />
                </Fragment>
            );
        }
        return '';
    };

    handleHelp = () => {
        this.setState({ open: true });
    };

    renderUserMenu() {
        const { user } = this.props;
        if (user) {
            const { anchorEl } = this.state;
            const open = Boolean(anchorEl);
            return (
                <div style={{marginLeft: 'auto'}}>
                    <IconButton
                        color="primary"
                        onClick={() => {
                            window.location.href = '/';
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={this.handleHelp}>
                        <HelpIcon />
                    </IconButton>
                    <IconButton
                        aria-owns={open ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenu}
                        color="primary"
                    >
                        {user.oauth_meta.image && (
                            <Avatar
                                alt={user.oauth_meta.name}
                                src={user.oauth_meta.image}
                            />
                        )}
                        {!user.oauth_meta.image && <AccountCircle />}
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={this.handleClose}
                    >
                        <MenuItem dense={true} disabled={true}>
                            {user.oauth_meta.name || user.email}
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            dense={true}
                            button
                            component="a"
                            href="/accounts/sign_out"
                        >
                            Sign Out
                        </MenuItem>
                    </Menu>
                </div>
            );
        }
        return '';
    }

    renderToolbarTitle() {
        const { classes } = this.props;
        return (
            <Fragment>
                <img src={fempLogo} className={classes.fempLogo} />
                <a
                    href="/"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <img src={waterBalanceLogo} className={classes.waterBalanceLogo} />
                </a>
            </Fragment>
        );
    }
    render() {
        return (
            <Fragment>
                <Toolbar style={{ background: 'white' }}>
                    
                        {this.renderToolbarTitle()}
                        {this.props.children}
                        {this.renderUserNavMenu()}
                        {this.renderUserMenu()}
                    
                </Toolbar>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleDialog}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        Help
                        <CloseIcon
                            color="action"
                            onClick={this.handleDialog}
                            style={{ float: 'right' }}
                        />
                    </DialogTitle>
                    <DialogContent>
                        <CampusIntroduction />
                    </DialogContent>
                </Dialog>
            </Fragment>
        );
    }
}

export default withStyles(styles, { withTheme: true })(DefaultToolbar);
