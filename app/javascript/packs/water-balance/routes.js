import React from 'react'
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import ApplicationLayout from './components/Common/ApplicationLayout/ApplicationLayout';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import CampusDisplay from "./components/CampusDisplay";

localStorage.debug = 'json-rules-engine';
const App = (props) => {
    const commonProps = Object.assign({}, props, {
        user: current_account,
    });
    return (
        <Router>
            <ApplicationLayout {...commonProps} >
                <Route exact path='/' render={({match}) => <LandingPage match={match} {...commonProps} />}/>
                <Route exact path='/secure/water-balance/campuses/:id' render={({match}) => (<CampusDisplay match={match} {...commonProps} /> )}/>
                <Route exact path='/accounts/sign_in' component={SignIn}/>
            </ApplicationLayout>
        </Router>
    );
};
export default App;
