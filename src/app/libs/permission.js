import { AUTH_TOKEN_KEY } from "../config/auth";

const checkPermission = (key) => {
    const authStore = localStorage.getItem(AUTH_TOKEN_KEY);
    
    let auth = authStore ? JSON.parse(authStore) : {};

    if(!auth.userRole) return 0;

    let listPermis = JSON.parse(auth.userRole);

    if(!listPermis) return 0;

    return listPermis.find(x => x.key === key) ? 1 : 2;
}


export default checkPermission;