
import { notification, Icon } from 'antd';
import React from 'react'

export const showSuccessMessage = (title="Success",description="") => {
      notification['success']({
        message: title,
        description:''
      });
}
export const showSuccessMessageIcon = (title="Success",description="") => {
  notification['success']({
    message: title,
    description:''
  });
}
export const showErrorMessage = (title="Error",description="") => {

    notification['error']({
      message: title,
      description: description,
    });
}
