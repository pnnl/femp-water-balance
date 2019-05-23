import React, {Fragment} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem
} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Divider from '@material-ui/core/Divider';

import styles from './styles';

import NavigationMenu from "../Administration/NavigationMenu";

const hasRole = (user, role) => {
    if (user && Array.isArray(user.roles)) {
        return user.roles.filter((roleObj) => roleObj.role === role).length > 0;
    }
    return false;
};

class DefaultToolbar extends React.Component {
    state = {
        anchorEl: null,
    };

    handleMenu = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    renderUserNavMenu = () => {
        const {user} = this.props;
        if (user && hasRole(user, 'administrator')){
            return (
                <Fragment>
                    <NavigationMenu account={user} />
                </Fragment>
            )
        }
        return '';
    }

    renderUserMenu() {
        const {user} = this.props;
        if (user) {
            const {anchorEl} = this.state;
            const open = Boolean(anchorEl);
            return (
                <div>
                    <IconButton
                        aria-owns={open ? 'menu-appbar' : null}
                        aria-haspopup="true"
                        onClick={this.handleMenu}
                        color="inherit"
                    >
                        <AccountCircle/>
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
                        <MenuItem dense={true} disabled={true}>{user['name'] || user['email']}</MenuItem>
                        <Divider/>
                        <MenuItem dense={true} button component="a" href="/accounts/sign_out">
                            Sign Out
                        </MenuItem>
                    </Menu>
                </div>
            );
        }
        return '';
    }

    renderToolbarTitle() {
        const {classes, toolbarText} = this.props;
        if (toolbarText) {
            return (
                <Typography variant="h6" color="inherit" className={classes.flex}>
                    {toolbarText}
                </Typography>
            );
        }
        return (
            <Typography variant="h6" color="inherit" className={classes.flex}>
                <a href="/" style={{textDecoration: 'none', color: 'inherit'}}>AssetScore :: Water Balance</a>
            </Typography>
        );
    }

    render() {
        return (
            <Toolbar>
                {this.renderToolbarTitle()}
                {this.props.children}
                {this.renderUserNavMenu()}
                {this.renderUserMenu()}
            </Toolbar>
        );
    }
}

export default withStyles(styles, {withTheme: true})(DefaultToolbar);
