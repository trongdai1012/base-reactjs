import React from 'react';
import PropTypes from 'prop-types';
import { Select } from "antd";
import { propTypes } from 'qrcode.react';

const SelectAntd = (props) => {
    return <Select
        className={props.className}
        options={props.options}
        value={props.value}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
        showSearch={props.showSearch}
        placeholder={props.placeholder}
        notFoundContent={props.notFoundContent}
        style={props.style}
        filterOption={props.filterOption}
    >
        {props.children}
    </Select>
}

SelectAntd.propTypes = {
    className: PropTypes.string,
    options: PropTypes.node,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    filterOption: PropTypes.bool,
    placeholder: PropTypes.string,
    notFoundContent: propTypes.any,
    style: PropTypes.object
}

export default SelectAntd;