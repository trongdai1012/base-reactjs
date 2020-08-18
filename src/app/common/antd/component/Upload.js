import React from 'react';
import PropTypes from 'prop-types';
import { Upload } from "antd";

const UploadAntd = (pros) => {
    return <Upload
        accept={pros.stringAccept}
        className={pros.className}
        disabled={pros.disabled}
        onChange={pros.onChange}
        style={pros.style}
    >
        {pros.children}
    </Upload>
}
UploadAntd.propTypes = {
   accept : PropTypes.string,
   className : PropTypes.string,
   disable : PropTypes.bool,
   onChange : PropTypes.func,
   style : PropTypes.object,
   children : PropTypes.node
}

export default UploadAntd;