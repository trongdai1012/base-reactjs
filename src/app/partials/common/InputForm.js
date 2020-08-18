import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const InputForm = (props) => {

    const inputRef = useRef();

    useEffect(() => {
        if (props.focus) {
            inputRef.current.focus();
        }
    }, []);

    return <input
        type={props.type || "text"}
        className={`form-control inline-block ${props.className || ""}`}
        placeholder={props.placeholder || ""}
        value={props.value}
        min={props.min || ""}
        maxLength={props.maxLength || ""}
        onChange={(e) => { props.onChangeValue(e.target.value) }}
        onKeyPress={props.onKeyPress ? (e) => { props.onKeyPress(e) } : null}
        required={props.isRequired || false}
        readOnly={props.isReadOnly || false}
        ref={inputRef}
        style={props.style}
        
    />
};

InputForm.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    isRequired: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isDisabled: PropTypes.bool,
    value: PropTypes.any,
    min: PropTypes.number,
    max: PropTypes.number,
    onChangeValue: PropTypes.func.isRequired
};

export default InputForm;