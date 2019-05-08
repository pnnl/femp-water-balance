import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

class LandingPage extends React.Component {
    state = {
        campuses: [],
        isLoaded: false
    };

    componentDidMount() {
        fetch('/secure/api/v1/water-balance/campuses', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        campuses: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
    }

    render() {
        const {campuses} = this.state;
        return (
            <List dense>
                {(campuses || []).map((c) => (
                    <ListItem key={`campus-${c.id}`} button component="a" href={`/secure/water-balance/campuses/${c.id}`}>
                        <ListItemText
                            primary={c.name}
                        />
                    </ListItem>
                ))}
            </List>
        )
    }
}

export default LandingPage
