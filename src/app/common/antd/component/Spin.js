import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

const SpinAntd = (pros) => {

    return <Spin 
    spinning = {pros.spinning}
    size={pros.size}
    delay={pros.delay}
    indicator={pros.indicator}
    tip = {pros.tip}
    wrapperClassName = {pros.wrapperClassName}
    >

    </Spin>
}

SpinAntd.propTypes = {
    spinning = PropTypes.bool,
    size = PropTypes.string,
    tip = PropTypes.string,
    wrapperClassName = PropTypes.string,
    delay  = PropTypes.number,
    indicator=PropTypes.node
}

export default SpinAntd;
