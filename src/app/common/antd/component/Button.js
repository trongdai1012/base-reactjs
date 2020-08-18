import React from 'react';
import PropTypes from 'prop-types';
import { Button } from "antd";

const ButtonAntd = (props) => {
    return <Button
        className={props.className}
        type={props.type}
        onClick={props.onClick}
        style={props.style}
    >
        {props.children}
    </Button>
}

ButtonAntd.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object
}

export default ButtonAntd;