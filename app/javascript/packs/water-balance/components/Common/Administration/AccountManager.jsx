import React, {Fragment} from 'react';
import AdminApi from "../../../AdminApi";
import AccountGrid from "./AccountGrid";

class AccountManager extends React.Component {
    state = {
        error: undefined,
        accounts: [],
        dialogOpen: false,
        isLoaded: false
    };

    componentDidMount() {
        AdminApi.getAccounts((accounts) => (
            this.setState({
                isLoaded: true,
                accounts: accounts
            })
        ), (error) => (
            this.setState({
                isLoaded: true,
                error
            })
        ), this);
    }
    render() {
        const {accounts} = this.state;
        return (
            <Fragment>
                <AccountGrid  accounts={accounts} />
            </Fragment>
        );
    }
}

export default AccountManager;
