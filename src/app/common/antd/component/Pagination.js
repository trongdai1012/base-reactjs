import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from "antd";

const PaginationAntd = (props) => {
    return <Pagination
        className={props.className}
        current={props.current}
        pageSize={props.pageSize}
        total={props.total}
        onChange={props.onChange}
    >
        {props.children}
    </Pagination>
}

PaginationAntd.propTypes = {
    className: PropTypes.string,
    current: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
    onChange: PropTypes.func
}

export default PaginationAntd;