import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import RemoteApi from '../RemoteApi';
import MaterialTabs from './Common/TabContainer/MaterialTabs';
import {MaterialDatePicker, MaterialInput} from "./FormInput";

const TabContainer = (props) => {
    return (
        <Grid style={{margin: '0.75em 0.50em 0.25em'}} container direction="row" justify="center" alignItems="center" spacing={0}>
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

    getCampusTabs = () => {
        return [
            {
                tabName: 'Water Supply',
                tabContent: (
                    <TabContainer>
                        [PH] => Water Supply
                        <MaterialInput label="Campus Name" id="campus_name" input={{name: 'campus[name]', value:`????`}} placeholder="Campus Name" helperText="Enter the name of the Campus being evaluated."/>
                        <MaterialDatePicker label="Evaluation Date" id="campus_eval_date" input={{name: 'campus[evaluation_date]', value: Date.now()}} />
                    </TabContainer>
                ),
            }, {
                tabName: 'Vehicle Wash',
                tabContent: (
                    <TabContainer>
                        [PH] => Vehicle Wash
                    </TabContainer>
                ),
            },
            {
                tabName: 'Waste Water',
                tabContent: (
                    <TabContainer>
                        [PH] => Waste Water
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
        const { campus } = this.state;
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
