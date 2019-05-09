import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import RemoteApi from '../RemoteApi';
import MaterialTabs from './Common/TabContainer/MaterialTabs';
import CampusForm from './Common/CampusForm';
import VehicleWashForm from "./Common/VehicleWashForm";

const TabContainer = (props) => {
    return (
        <Grid style={{margin: '0.75em 0.50em 0.25em'}} container direction="row" justify="center" alignItems="center"
              spacing={0}>
            <Grid item xs={12}>
                {props.children}
            </Grid>
        </Grid>
    );
};

class CampusDisplay extends React.Component {
    state = {
        error: undefined,
        campus: undefined,
        isLoaded: false
    };

    updateCampus = (values) => {
        RemoteApi.updateCampus(values,
            (data) => this.setState({
                isLoaded: true,
                campus: data
            }),
            (data) => this.setState({
                isLoaded: true,
                error: data
            })
        );
    };

    getCampusTabs = () => {
        const {campus} = this.state;
        return [
            {
                tabName: 'Vehicle Wash',
                tabContent: (
                    <TabContainer>
                        <VehicleWashForm campus={campus} {...this.props} />
                    </TabContainer>
                ),
            },
            {
                tabName: 'Water Supply',
                tabContent: (
                    <TabContainer>
                        [PH] => Water Supply
                    </TabContainer>
                ),
            },
            {
                tabName: 'Waste Water',
                tabContent: (
                    <TabContainer>
                        [PH] => Waste Waters
                    </TabContainer>
                ),
            },
            {
                tabName: 'Kitchens',
                tabContent: (
                    <TabContainer>
                        [PH] => Kitchens
                    </TabContainer>
                ),
            },
            {
                tabName: 'Laundry',
                tabContent: (
                    <TabContainer>
                        [PH] => Laundry
                    </TabContainer>
                ),
            },
        ];
    };

    componentDidMount() {
        const {match: {params: {id}}} = this.props;
        RemoteApi.getCampus(id, (campus) => (
            this.setState({
                isLoaded: true,
                campus: campus
            })
        ), (error) => (
            this.setState({
                isLoaded: true,
                error
            })
        ), this);
    }

    render() {
        const {campus} = this.state;
        return (
            <div>
                <Typography variant="h4" gutterBottom>{campus ? campus.name : ''}</Typography>
                <MaterialTabs headerColor="primary" tabs={this.getCampusTabs()}/>
            </div>
        )
    }
}

CampusDisplay.propTypes = {
    match: PropTypes.object.isRequired,
};

export default CampusDisplay
