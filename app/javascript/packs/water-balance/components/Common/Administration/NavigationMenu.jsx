import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    IconButton,
    Menu,
    MenuItem,
} from '@material-ui/core';
import Dashboard from '@material-ui/icons/Dashboard';

class NavigationMenu extends React.Component {
    state = {
        anchorEl: null,
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        return (
            <div>
                <IconButton
                    aria-owns={open ? 'menu-admin-nav' : null}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                >
                    <Dashboard />
                </IconButton>
                <Menu
                    id="menu-admin-nav"
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
                    <MenuItem dense={true} disabled={true} >Manage Campuses</MenuItem>
                    <MenuItem dense={true} button component="a" href="/secure/admin/accounts">Manage Accounts</MenuItem>
                </Menu>
            </div>
        );
    }
}


export default withStyles({}, { withTheme: true })(NavigationMenu);
