import React from 'react';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import MaterialInput from './Common/MaterialInput';

import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';

import RemoteApi from '../RemoteApi';
import CampusForm from './Common/CampusForm';

import formValidation from "./Common/VehicleWashForm.validation";

class LandingPage extends React.Component {
    state = {
        error: undefined,
        open: false,
        campuses: [],
        isLoaded: false
    };

    componentDidMount() {
        RemoteApi.getCurrentCampuses((campusList) => (
            this.setState({
                isLoaded: true,
                campuses: campusList
            })
        ), (error) => (
            this.setState({
                isLoaded: true,
                error
            })
        ), this);
    }

    createNewCampus = (values) => {
        RemoteApi.createCampus(values, (newCampus) => {
            const {campuses} = this.state;
            const clone = campuses.slice();
            clone.push(newCampus);
            this.setState({
                isLoaded: true,
                open: false,
                campuses: clone
            });
        }, (error)=>{
            this.setState({
                isLoaded: true,
                error
            });
        });
    };

    handleClose = () => {
        this.setState({open: false});
    };


    handleClickOpen = () => {
        this.setState({open: true});
    };;


    render() {
        const {campuses, open} = this.state;
        return (
            <Grid container>
                <Dialog open={open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Create a new Campus</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Fill out the form with information regarding the campus being evaluated for water usage.
                        </DialogContentText>
                        <CampusForm createNewCampus={this.createNewCampus} />
                    </DialogContent>
                </Dialog>

                <Grid item xs={12}>
                    <List dense>
                        {(campuses || []).map((c) => (
                            <ListItem key={`campus-${c.id}`} button component="a" href={`/secure/water-balance/campuses/${c.id}`}>
                                <ListItemText primary={c.name} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={12}>
                    <Fab style={{ position: 'absolute', bottom: '1em', right: '1em'}} color="primary" onClick={this.handleClickOpen}>
                        <AddIcon />
                    </Fab>
                </Grid>
            </Grid>

        )
    }
}

export default LandingPage
