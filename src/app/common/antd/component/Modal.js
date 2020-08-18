import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from "antd";

const ModalAntd = (props) => {
    return <Modal
        title={props.title}
        visible={props.visible}
        onOk={props.onOk}
        onCancel={props.onCancel}
        footer={props.footer}
        className={props.className}
    >
        {props.children}
    </Modal>
}

ModalAntd.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    footer: PropTypes.node,
    children: PropTypes.node
}

export default ModalAntd;