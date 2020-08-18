import { message } from 'antd';

export const showMessage = (type = '', title = '', description = '') => {
    if (!type || type != 'success' && type != 'error' && type != 'info' && type != 'warning' && type != 'warn') {
        message.open({
            message: title,
            description: description
        });
    } else {
        message[type]({
            message: title,
            description: description
        });
    }
}