import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from "antd";

const TabsAntd = (props) => {

    return <Tabs
        defaultActiveKey={props.defaultActiveKey}
        onChange={props.onChange}
    >
        {props.children}
    </Tabs>
}

TabsAntd.propTypes = {
    defaultActiveKey: PropTypes.string,
    onChange: PropTypes.func.isRequired
}

export default TabsAntd;