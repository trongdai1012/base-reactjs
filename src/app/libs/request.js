import axios from 'axios';
import { URL_API } from '../config/url';
import { AUTH_TOKEN_KEY } from '../config/auth';

export default (method, url, params={}, headers = "", responseType) => {
    method = method.toLowerCase();
    let storeData = localStorage.getItem(AUTH_TOKEN_KEY);

    storeData = storeData ? JSON.parse(storeData) : '';

    let opts = {
        method : method,
        url: URL_API + url,
        headers: {
            token: storeData && storeData.authToken ? JSON.parse(storeData.authToken) : ''
        }
    };

    if (method == 'get')
        opts.params = params;
    else 
        opts.data = params;

    if (headers) {
        opts.headers = Object.assign(opts.headers, headers);
    }

    if(responseType) {
        opts.responseType = responseType;
    }

    opts.validateStatus = (status) => {
        return true;
    }

    return axios(opts);
}