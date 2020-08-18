import React from 'react';
import PropTypes from 'prop-types';

const TextAreaForm = (props) => {
    return <textarea
        className={`form-control inline-block  ${props.className || ""}`}
        placeholder={props.placeholder || ""}
        value={props.value}
        onChange={(e) => { props.onChangeValue(e.target.value) }}
        required={props.isRequired || false} 
        rows={props.rows || 5}
    />
};

TextAreaForm.propTypes = {
    className: PropTypes.string,
    rows: PropTypes.number,
    placeholder: PropTypes.string,
    isRequired: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isDisabled: PropTypes.bool,
    value: PropTypes.any,
    onChangeValue: PropTypes.func.isRequired
};

export default TextAreaForm;