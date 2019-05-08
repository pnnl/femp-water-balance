import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Divider from '@material-ui/core/Divider';

import styles from './styles';

class DefaultToolbar extends React.Component {
  state = {
    anchorEl: null,
  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  renderUserMenu() {
    if (this.props.user) {
      const { user } = this.props;
      const { anchorEl } = this.state;
      const open = Boolean(anchorEl);

      return (
        <div>
          <IconButton
            aria-owns={open ? 'menu-appbar' : null}
            aria-haspopup="true"
            onClick={this.handleMenu}
            color="inherit"
          >
            <AccountCircle />
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
            <MenuItem dense={true} disabled={true} >{user['name'] || user['email']}</MenuItem>
            <MenuItem dense={true} button component="a" href="/legacy/account-services/my-profile">
              My Profile
            </MenuItem>
            <MenuItem dense={true} button component="a" href="/legacy/account-services/calendars">
              My Calendars
            </MenuItem>
            <Divider />
            <MenuItem dense={true} button component="a" href="/logout">
              Sign Out
            </MenuItem>
          </Menu>
        </div>
      );
    }
    return '';
  }

  renderToolbarTitle() {
    const { classes, toolbarText } = this.props;
    if (toolbarText) {
      return (
        <Typography variant="h6" color="inherit" className={classes.flex}>
          {toolbarText}
        </Typography>
      );
    }
    return (
      <Typography variant="h6" color="inherit" className={classes.flex}>
        AssetScore :: Water Balance
      </Typography>
    );
  }

  render() {
    return (
      <Toolbar>
        {this.renderToolbarTitle()}
        {this.props.children}
        {this.renderUserMenu()}
      </Toolbar>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DefaultToolbar);
