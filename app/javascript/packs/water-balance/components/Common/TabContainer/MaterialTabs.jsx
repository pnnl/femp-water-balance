import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {
    Tabs,
    Tab,
    AppBar,
    Typography,
} from '@material-ui/core';
import customTabsStyle from './tabStyles';

class MaterialTabs extends React.Component {

    static defaultProps = {
        variant: 'thick',
        title: null,
        tabs: [],
        rtlActive: false,
        plainTabs: false,
        onTabChange: null,
        headerColor: 'primary',
    };

    state = {
        selectedTab: 0,
    };

    handleChange = (event, selectedTab) => {
        const { onTabChange, tabs } = this.props;
        this.setState({ selectedTab });
        if (onTabChange) {
            onTabChange(selectedTab, tabs[selectedTab]);
        }
    };

    renderTabNavs = () => {
        const { classes, tabs } = this.props;
        const { selectedTab } = this.state;
        return (
            <Tabs
                value={selectedTab}
                onChange={this.handleChange}
                classes={{
                    root: classes.tabsRoot,
                    indicator: classes.displayNone,
                }}
                variant="scrollable"
                scrollButtons="auto"
            >
                {tabs.map(tabDefinition => {
                    let icon = {};
                    if (tabDefinition.tabIcon) {
                        icon = {
                            icon: <tabDefinition.tabIcon />,
                        };
                    }
                    return (
                        <Tab
                            classes={{
                                root: classes.tabRootButton,
                                labelContainer: classes.tabLabelContainer,
                                label: classes.tabLabel,
                                selected: classes.tabSelected,
                                wrapper: classes.tabWrapper,
                            }}
                            key={`tabnav-${tabDefinition.tabName}`}
                            label={tabDefinition.tabName}
                            {...icon}
                        />
                    );
                })}
            </Tabs>
        );
    };

    renderTabContent = () => {
        const { tabs } = this.props;
        const { selectedTab } = this.state;
        return tabs.map((tabDefinition, key) => {
            if (key === selectedTab) {
                return (
                    <div key={`tab-${tabDefinition.tabName}`}>
                        {tabDefinition.tabContent}
                    </div>
                );
            }
            return null;
        });
    };

    render() {
        const {
            headerColor,
            title,
        } = this.props;
        return (
            <div style={{ flexGrow: 1 }}>
                <AppBar color={headerColor} position="sticky" style={{ zIndex: 0 }}>
                    {title && (
                        <Typography variant="h6" color="inherit">
                            {title}
                        </Typography>
                    )}
                    {this.renderTabNavs()}
                </AppBar>
                {this.renderTabContent()}
            </div>
        );
    }
}

MaterialTabs.propTypes = {
    classes: PropTypes.object.isRequired,
    headerColor: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
    ]),
    onTabChange: PropTypes.func,
    title: PropTypes.string,
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            tabName: PropTypes.string.isRequired,
            tabIcon: PropTypes.func,
            tabContent: PropTypes.node.isRequired,
        }),
    ),
    rtlActive: PropTypes.bool,
    plainTabs: PropTypes.bool,
};
export default withStyles(customTabsStyle)(MaterialTabs);
