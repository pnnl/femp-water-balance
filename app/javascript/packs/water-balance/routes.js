import React from 'react'
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';

import ApplicationLayout from './components/Common/ApplicationLayout/ApplicationLayout';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';

const App = (props) => (
    <Router>
        <ApplicationLayout>
            <Route exact path='/secure/water-balance/campuses' component={LandingPage}/>
            <Route exact path='/accounts/sign_in' component={SignIn}/>
        </ApplicationLayout>
    </Router>
);
export default App;
