import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import RemoteApi from '../RemoteApi';

class LandingPage extends React.Component {
    state = {
        error: undefined,
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

    render() {
        const {campuses} = this.state;
        return (
            <List dense>
                {(campuses || []).map((c) => (
                    <ListItem key={`campus-${c.id}`} button component="a" href={`/secure/water-balance/campuses/${c.id}`}>
                        <ListItemText primary={c.name} />
                    </ListItem>
                ))}
            </List>
        )
    }
}

export default LandingPage
