import React from 'react';
import PropTypes from 'prop-types';

const SelectForm = (props) => {
    const { optionData, keyString, labelString, placeholder, value, className } = props;

    const renderOptions = () => {
        return optionData.map((item, idx) => {
            return (
                <option value={item[keyString]} key={`select-form-${idx}`}>{item[labelString]}</option>
            )
        })
    }
    return <select className={`form-control inline-block ${className || ""}`} value={value} onChange={(e) => { props.onChangeValue(e.target.value) }}>
                <option value="" hidden>{placeholder || ""}</option>
                {renderOptions()}
            </select>
};

SelectForm.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    isRequired: PropTypes.bool,
    value: PropTypes.any,
    optionData: PropTypes.array.isRequired,
    keyString: PropTypes.string.isRequired,
    labelString: PropTypes.string.isRequired,
    onChangeValue: PropTypes.func.isRequired
};

export default SelectForm;