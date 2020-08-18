import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from "antd";

const DatePickerAntd = (props) => {

    return <DatePicker
        format={props.format}
        showTime={props.showTime}
        className={`${props.className}`}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
        value={props.value}
        placeholder={props.placeholder}
    >
        {props.children}
    </DatePicker>
}

DatePickerAntd.propTypes = {
    format: PropTypes.any,
    showTime: PropTypes.bool,
    className: PropTypes.string,
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    placeholder: PropTypes.string
}

export default DatePickerAntd;