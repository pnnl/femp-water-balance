import React from 'react';
import {Grid} from '@material-ui/core';
import RemoteApi from '../RemoteApi';
import CampusDialog from './Common/Tabs/LandingPage/CampusDialog';
import Campuses from './Common/Tabs/LandingPage/Campuses';
import Introduction from './Common/Tabs/LandingPage/Introduction';

class LandingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: undefined,
            addOpen: false,
            campuses: [],
            isLoaded: false,
        };
        this.handleClickOpen = this.handleClickOpen.bind(this);
      }
    

    componentDidMount() {
        RemoteApi.getCurrentCampuses(
            campusList =>
                this.setState({
                    isLoaded: true,
                    campuses: campusList,
                }),
            error =>
                this.setState({
                    isLoaded: true,
                    error,
                }),
            this
        );
    }

    createNewCampus = values => {
        RemoteApi.createCampus(
            values,
            newCampus => {
                const { campuses } = this.state;
                const clone = campuses.slice();
                clone.push(newCampus);
                this.setState({
                    isLoaded: true,
                    addOpen: false,
                    campuses: clone,
                });
            },
            error => {
                this.setState({
                    isLoaded: true,
                    error,
                });
            }
        );
    };

    updateCampus = values => {
        RemoteApi.updateCampus(
            values,
            () => {
                const { campuses } = this.state;
                const clone = campuses.slice();
                const updatedIndex = clone.findIndex(campus => campus.id === values.id);
                clone[updatedIndex] = values;
                this.setState({
                    isLoaded: true,
                    addOpen: false,
                    campuses: clone,
                })
            },
            data =>
                this.setState({
                    isLoaded: true,
                    error: data,
                })
        );
    };


    handleClose = () => {
        this.setState({ addOpen: false});
    };

    handleClickOpen = (e) => {
        let campus = undefined;
        if (e.currentTarget.id) {
          campus = this.state.campuses.find((campus) => (campus.id == e.currentTarget.id));
        }
        this.setState({addOpen: true, campus});
    };

    render() {
        const { campuses, addOpen, campus } = this.state;
        return (
            <Grid container>
                <CampusDialog 
                    createNewCampus={this.createNewCampus} 
                    updateCampus={this.updateCampus}
                    addOpen={addOpen} 
                    handleClose={this.handleClose}
                    campus={campus}
                />
                <Introduction/>
                <Grid item xs={12}>
                    <Campuses 
                        campuses={campuses} 
                        handleClickOpen={this.handleClickOpen} 
                        addOpen={addOpen} 
                        handleClose={this.handleClose}
                    />
                </Grid>
            </Grid>
        );
    }
}

export default LandingPage;
