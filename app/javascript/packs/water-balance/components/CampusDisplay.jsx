import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import RemoteApi from '../RemoteApi';
import MaterialTabs from './Common/TabContainer/MaterialTabs';
import CampusForm from './Common/CampusForm';
import selectn from 'selectn';
import VehicleWashForm from "./Common/VehicleWashForm";
import WaterSupplyForm from "./Common/WaterSupplyForm";
import KitchensForm from "./Common/KitchensForm";
import LaundryForm from "./Common/LaundryForm";
import PlumbingForm from "./Common/PlumbingForm";
import OtherProcessesForm from "./Common/OtherProcessesForm";

import {Engine} from 'json-rules-engine';

const moduleKeys = [
    'water_supply',
    'vehicle_wash',
    'other_processes',
    'plumbing',
    'laundry',
    'kitchen_facilities'
];


const formRules = [
    {
        conditions: {
            all: [
                {
                    fact: 'vw_facilities',
                    operator: 'equal',
                    value: true
                }
            ],
        },
        event: {
            type: 'displayCentralFacilityQuestions',
            params: {
                value: true
            }
        }
    },
    {
        conditions: {
            any: [{
                all: [{
                    fact: 'vw_central_facilities',
                    operator: 'equal',
                    value: false
                }, {
                    fact: 'vw_facilities',
                    operator: 'equal',
                    value: true
                }]
            }]
        },
        event: {
            type: 'displayFrictionWashQuestions',
            params: {
                value: true
            }
        }
    },
    {
        conditions: {
            any: [{
                all: [{
                    fact: 'vw_fw_facilities',
                    operator: 'equal',
                    value: false
                }, {
                    fact: 'vw_facilities',
                    operator: 'equal',
                    value: true
                }]
            },
            ],
        },
        event: {
            type: 'displayWashPadsQuestions',
            params: {
                value: true
            }
        }
    },
    {
        conditions: {
            any: [{
                all: [{
                    fact: 'vw_wash_pads',
                    operator: 'equal',
                    value: false
                }, {
                    fact: 'vw_facilities',
                    operator: 'equal',
                    value: true
                }]
            },
            ],
        },
        event: {
            type: 'displayLargeQuestions',
            params: {
                value: true
            }
        }
    }
];

const TabContainer = (props) => {
    return (
        <Grid style={{margin: '0.75em 0.50em 0.25em'}} container direction="row" justify="center" alignItems="center"
              spacing={0}>
            <Grid item xs={12 } style={{margin: '0em 1em  0em 0em'}} >
                <Paper style={{padding: 16}}>
                    {props.children}
                </Paper>
            </Grid>
        </Grid>
    );
};

class CampusDisplay extends React.Component {
    state = {
        error: undefined,
        campus: undefined,
        isLoaded: false,
        engine: new Engine([], {allowUndefinedFacts: true}),
    };

    updateCampus = (values) => {
        RemoteApi.updateCampus(values,
            (data) => this.setState({
                isLoaded: true,
                campus: Object.assign({}, {vehicle_wash: {}}, data)
            }),
            (data) => this.setState({
                isLoaded: true,
                error: data
            })
        );
    };

    updateModuleState = (data) => {
        const { campus } = this.state;
        campus.modules[data.name] = data.data;
        campus.modules[data.name].id = data.id;
        this.setState({
            isLoaded: true,
            campus: campus
        })
    }

    createOrUpdateCampusModule = (module) => {
            let campus = {};
            campus.id = module.campus_id;
            RemoteApi.createOrUpdateCampusModule(campus,
                {name: module.name, data: module, id: module.id},
                (data) => this.updateModuleState(data),
                (data) => console.log(data)
           );
    };

    executeRules = async (facts) => {
        const { engine } = this.state;
        this.setState({events: await engine.run(facts)});
    };

    getCampusTabs = () => {
        const { campus, events } = this.state;

        return [
               {
                tabName: 'Water Supply',
                tabContent: (
                    <TabContainer>
                        <WaterSupplyForm 
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule}
                            campus={campus} 
                            events={events}
                            applyRules={this.executeRules} 
                            {...this.props} />
                    </TabContainer>
                ),
            },
             {
                tabName: 'Plumbing',
                tabContent: (
                    <TabContainer>
                        <PlumbingForm
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule}
                            campus={campus}
                            events={events}
                            applyRules={this.executeRules}
                            {...this.props}
                        />
                    </TabContainer>
                ),
            },
             { 
                tabName: 'Vehicle Wash',
                tabContent: (
                    <TabContainer>
                        <VehicleWashForm
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule}
                            campus={campus}
                            events={events}
                            applyRules={this.executeRules}
                            {...this.props}
                        />
                    </TabContainer>
                ),
            },
            {
                tabName: 'Other Processes',
                tabContent: (
                    <TabContainer>
                        <OtherProcessesForm 
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule}
                            campus={campus}
                            events={events}
                            applyRules={this.executeRules} 
                            {...this.props} />
                    </TabContainer>
                ),
            },
            {
                tabName: 'Cooling Towers',
                tabContent: (
                    <TabContainer>
                        <Typography variant="h5" gutterBottom>Cooling Towers</Typography>
                        <Typography variant="body2" gutterBottom>
                            Enter the following information only for cooling towers that use potable water on the campus
                        </Typography>
                    </TabContainer>
                ),
            },
            {
                tabName: 'Steam Boilers',
                tabContent: (
                    <TabContainer>
                        <Typography variant="h5" 
                        gutterBottom>Steam Boilers</Typography>
                        <Typography variant="body2" gutterBottom>
                            Enter the following information only for steam boilers that use potable water on the campus
                        </Typography>
                    </TabContainer>
                ),
            },
            {
                tabName: 'Commercial Kitchen',
                tabContent: (
                    <TabContainer>
                        <KitchensForm 
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule} 
                            campus={campus}
                            events={events}
                            applyRules={this.executeRules} 
                            {...this.props} 
                        />
                    </TabContainer>
                ),
            },
            {
                tabName: 'Laundry (Washing Machines)',
                tabContent: (
                    <TabContainer>
                        <LaundryForm 
                            createOrUpdateCampusModule={this.createOrUpdateCampusModule} 
                            campus={campus} 
                            events={events}
                            applyRules={this.executeRules}
                            {...this.props} />
                    </TabContainer>
                ),
            },
        ];
    };

    getModules(campus) { 
        RemoteApi.getCampusModules(campus, 
            (data) => {
                campus.modules = {};
                for (let i = 0; i < data.length; i++) {
                    const module = data[i];
                    campus.modules[module.name] = module.data;
                    campus.modules[module.name].id = module.id;
                }
                for (let i = 0; i < moduleKeys.length; i++) {
                    const moduleKey = moduleKeys[i];
                    if (!campus.modules[moduleKey]) {
                        campus.modules[moduleKey] = {
                            name: moduleKey,
                            survey: campus.survey,
                            campus_id: campus.id
                        };
                    }
                }
                this.setState({ 
                    isLoaded: true,
                    campus: campus
                });
            },
        )
    }

    componentDidMount() {
        const {engine} = this.state;
        const {match: {params: {id}}} = this.props;
        formRules.forEach((rule) => engine.addRule(rule));

        RemoteApi.getCampus(id, (campus) => (
            this.getModules(campus),
            (error) => (
            this.setState({
                isLoaded: true,
                error
            })
        )));
    }

    render() {
        const {campus} = this.state;
        return (
            <div>
                <Typography variant="h4" gutterBottom>
                    {campus ? campus.name : ''}
                </Typography>
                <MaterialTabs
                    headerColor="primary"
                    tabs={this.getCampusTabs()}
                />
            </div>
        )
    }
}

CampusDisplay.propTypes = {
    match: PropTypes.object.isRequired,
};

export default CampusDisplay
