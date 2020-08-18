import { notification } from 'antd';

/**
 * 
 * @param type type of noitification {success || error || info || warning || warn || open}
 * @param title title of notification 
 * @param description description of notification 
 */
export const showMessageWithType = (type = '', title = '', description = '') => {
    if(!type || type != 'success' && type != 'error' && type != 'info' && type != 'warning' && type != 'warn' ){
        notification.open({
            message: title,
            description: description
        });
    }else{
        notification[type]({
            message: title,
            description: description
        });
    }
}