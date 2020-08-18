import React from 'react';
import {
    makeStyles
} from "@material-ui/core/styles";
import { Link } from 'react-router-dom';

const useStyles1 = makeStyles(theme => ({
    footer: {
        textAlign: 'center',
        position: 'fixed',
        marginLeft: '530px',
        bottom: '0px',
        textAlignLast: 'center'
    },
}));

function Error403() {
    const classes1 = useStyles1();

    return <div>
        <div className="container py-5">
            <div className="row">
                <div className="col-md-2 text-center">
                    <p><i className="fa fa-exclamation-triangle fa-5x" /><br />Trạng thái lỗi: 403</p>
                </div>
                <div className="col-md-10">
                    <h3>Ồ!!!! Xin lỗi...</h3>
                    <p>Xin lỗi, quyền truy cập của bạn bị từ chối vì lý do bảo mật của máy chủ và dữ liệu nhạy cảm của chúng tôi.<br /> Vui lòng quay lại trang trước để tiếp tục duyệt.</p>
                    <Link className="btn btn-danger" to="javascript:history.back()">Quay lại</Link>
                </div>
            </div>
        </div>
        <div id="footer" className={classes1.footer}>
            © Bản quyền thuộc về KickEnglish
        </div>
    </div>
}

export default Error403