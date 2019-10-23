import React from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import { AppBar, CssBaseline } from '@material-ui/core';
import classNames from 'classnames';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import styles from './styles';
import DefaultToolbar from './DefaultToolbar';
import DefaultFooter from './DefaultFooter';
import ScrollToTopButton from './ScrollToTopButton';

class ApplicationLayout extends React.Component {
	getTheme() {
		return createMuiTheme({
			palette: {
				primary: {
					main: '#2196f3',
				},
				contrastThreshold: 3,
				tonalOffset: 0.2,
			},
			typography: {
				useNextVariants: true,
				fontSize: 15,
			},
		});
	}

	render() {
		const { classes, toolbarContent, toolbarText } = this.props;
		return (
			<MuiThemeProvider theme={this.getTheme()}>
				<MuiPickersUtilsProvider utils={MomentUtils}>
					<CssBaseline />
					<div className={classes.appFrame}>
						<AppBar className={classNames(classes.appBar)}>
							<DefaultToolbar {...this.props} toolbarText={toolbarText}>
								{toolbarContent}
							</DefaultToolbar>
						</AppBar>
						<main className={classNames(classes.content)}>
							<div className={classes.drawerHeader} />
							{this.props.children}
							<ScrollToTopButton {...this.props} scrollStepInPx={50} delayInMs={30} />
						</main>
					</div>
					<DefaultFooter {...this.props} />
				</MuiPickersUtilsProvider>
			</MuiThemeProvider>
		);
	}
}

ApplicationLayout.propTypes = {
	children: PropTypes.node,
	sidebarContent: PropTypes.object,
	toolbarContent: PropTypes.object,
};
export default withStyles(styles, { withTheme: true })(ApplicationLayout);
