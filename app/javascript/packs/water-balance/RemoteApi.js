class RemoteApi {
    static BASE_V1_URI = '/secure/api/v1';
    static DEFAULT_FETCH_CONFIG = {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json',
        }
    };

    static getCurrentCampuses = (onSuccess, onError, caller = undefined) => {
        fetch(`${RemoteApi.BASE_V1_URI}/water-balance/campuses`, RemoteApi.DEFAULT_FETCH_CONFIG)
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

    static getCampus = (campusId, onSuccess, onError, caller = undefined) => {
        fetch(`${RemoteApi.BASE_V1_URI}/water-balance/campuses/${campusId}`, RemoteApi.DEFAULT_FETCH_CONFIG)
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
    }
}

export default RemoteApi;
