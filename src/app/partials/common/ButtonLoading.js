import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const ButtonLoading = (props) => {

    return <button 
        type={props.type || "default"}
        className={`${clsx({
            "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": props.loading
        })} ${props.className || ""}`}
        onClick={props.onClick ? props.onClick : null}
        style={props.style || null}
        disabled={props.disabled === true ? true : false}
    >{props.children}</button>
};

ButtonLoading.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.node
};

export default ButtonLoading;