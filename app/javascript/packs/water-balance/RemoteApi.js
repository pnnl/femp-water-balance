class RemoteApi {
    static BASE_V1_URI = '/secure/api/v1';
    static DEFAULT_HEADERS = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json',
    };
    static DEFAULT_FETCH_CONFIG = {
        method: 'GET',
        credentials: 'include',
        headers: {
            ...RemoteApi.DEFAULT_HEADERS
        }
    };

    static captureAuthorization(response) {
        if (sessionStorage) {
            sessionStorage.setItem('asset-score:water-balance/auth', response.headers.get('Authorization'));
        }
        return response.json();
    }

    static retrieveCurrentAuthorization() {
        if (sessionStorage) {
            return sessionStorage.getItem('asset-score:water-balance/auth');
        }
        return null;
    }

    static getCurrentCampuses = (onSuccess, onError, caller = undefined) => {
        fetch(`${RemoteApi.BASE_V1_URI}/water-balance/campuses`, RemoteApi.DEFAULT_FETCH_CONFIG)
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

    static getCampus = (campusId, onSuccess, onError, caller = undefined) => {
        fetch(`${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campusId}`, RemoteApi.DEFAULT_FETCH_CONFIG)
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

    static updateCampus = (campus, onSuccess, onError, caller = undefined) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'PUT',
            body: JSON.stringify({data: {attributes: {...campus}}}),
            headers: {
                'Authorization': RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS
            }
        });
        console.log("fetchConfig(%o) => ", fetchConfig, fetchConfig.headers);
        fetch(`${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}`, Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, fetchConfig))
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

export default RemoteApi;
