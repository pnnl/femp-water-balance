import RemoteApi from './RemoteApi';

class AdminApi extends RemoteApi  {
    static BASE_V1_URI = '/secure/api/v1/administration';

    static getAccounts = (onSuccess, onError, caller = undefined) => {
        fetch(`${AdminApi.BASE_V1_URI}/accounts`, RemoteApi.DEFAULT_FETCH_CONFIG)
            .then((response) => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                (result) => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                (error) => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static createAccount = (account, onSuccess, onError, caller = undefined) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'POST',
            body: JSON.stringify({data: {attributes: {...account}}}),
            headers: {
                'Authorization': RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS
            }
        });
        fetch(`${AdminApi.BASE_V1_URI}/accounts`, Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, fetchConfig))
            .then((response) => response.json())
            .then(
                // onFulfilled:
                (result) => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                (error) => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static getAccount = (accountId, onSuccess, onError, caller = undefined) => {
        fetch(`${AdminApi.BASE_V1_URI}/accounts/${accountId}`, RemoteApi.DEFAULT_FETCH_CONFIG)
            .then((response) => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                (result) => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                (error) => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static updateAccount = (account, onSuccess, onError, caller = undefined) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'PUT',
            body: JSON.stringify({data: {attributes: {...account}}}),
            headers: {
                'Authorization': RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS
            }
        });
        fetch(`${AdminApi.BASE_V1_URI}/accounts/${account.id}`, Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, fetchConfig))
            .then((response) => response.json())
            .then(
                // onFulfilled:
                (result) => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                (error) => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };
}

export default AdminApi;
