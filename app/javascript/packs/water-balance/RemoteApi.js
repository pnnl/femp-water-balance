class RemoteApi {
    static BASE_V1_URI = '/secure/api/v1';
    static DEFAULT_HEADERS = {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
    };
    static DEFAULT_FETCH_CONFIG = {
        method: 'GET',
        credentials: 'include',
        headers: {
            ...RemoteApi.DEFAULT_HEADERS,
        },
    };

    static captureAuthorization(response) {
        const bearer = response.headers.get('Authorization');
        if (sessionStorage && bearer) {
            sessionStorage.setItem('asset-score:water-balance/auth', bearer);
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
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses`,
            RemoteApi.DEFAULT_FETCH_CONFIG
        )
            .then(response => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static createCampus = (
        newCampus,
        onSuccess,
        onError,
        caller = undefined
    ) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'POST',
            body: JSON.stringify({ data: { attributes: { ...newCampus } } }),
            headers: {
                Authorization: RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS,
            },
        });
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses`,
            Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, fetchConfig)
        )
            .then(response => response.json())
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static getCampus = (campusId, onSuccess, onError, caller = undefined) => {
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campusId}`,
            RemoteApi.DEFAULT_FETCH_CONFIG
        )
            .then(response => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static updateCampus = (campus, onSuccess, onError, caller = undefined) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'PUT',
            body: JSON.stringify({ data: { attributes: { ...campus } } }),
            headers: {
                Authorization: RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS,
            },
        });
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}`,
            Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, fetchConfig)
        )
            .then(response => response.json())
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static getCampusModules = (
        campus,
        onSuccess,
        onError,
        caller = undefined
    ) => {
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}/modules`,
            RemoteApi.DEFAULT_FETCH_CONFIG
        )
            .then(response => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static getRainFall = async zip => {
        let result;
        result = await fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/rain-falls/${zip.zip}`,
            RemoteApi.DEFAULT_FETCH_CONFIG
        );
        return result.json();
    };

    static getEto = async zip => {
        let result;
        result = await fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/etos/${zip.zip}`,
            RemoteApi.DEFAULT_FETCH_CONFIG
        );
        return result.json();
    };

    static createOrUpdateCampusModule = (
        campus,
        campusModule,
        onSuccess,
        onError,
        caller = undefined
    ) => {
        let targetURL = null;
        let fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'GET',
            body: JSON.stringify({ data: { attributes: { ...campusModule } } }),
            headers: {
                Authorization: RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS,
            },
        });
        if (!campusModule.id || isNaN(parseInt(campusModule.id))) {
            fetchConfig.method = 'POST';
            targetURL = `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}/modules`;
        } else {
            fetchConfig.method = 'PUT';
            targetURL = `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}/modules/${campusModule.id}`;
        }
        fetch(targetURL, fetchConfig)
            .then(response => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };

    static deleteCampusModules = (
        campus,
        campusModule,
        onSuccess,
        onError,
        caller = undefined
    ) => {
        const fetchConfig = Object.assign({}, RemoteApi.DEFAULT_FETCH_CONFIG, {
            method: 'DELETE',
            headers: {
                Authorization: RemoteApi.retrieveCurrentAuthorization(),
                ...RemoteApi.DEFAULT_HEADERS,
            },
        });
        fetch(
            `${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campus.id}/modules/${campusModule.id}`,
            fetchConfig
        )
            .then(response => RemoteApi.captureAuthorization(response))
            .then(
                // onFulfilled:
                result => {
                    if (onSuccess) {
                        onSuccess.call(caller, result);
                    }
                },
                // onRejected:
                error => {
                    if (onError) {
                        onError.call(caller, error);
                    }
                }
            );
    };
}

export default RemoteApi;
