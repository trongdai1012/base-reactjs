/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { showErrorMessage, showSuccessMessageIcon } from '../../actions/notification';
import {
    makeStyles
} from "@material-ui/core/styles";
import {
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@material-ui/core";
import { Modal, Pagination, Button } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import PackageLabelExchange from '../../partials/common/PackageLabelExchange';
import { DATA_PACKAGE, TYPE_PAYMENT } from '../../config/product';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const useStyles1 = makeStyles(theme => ({
    root: {
        width: "100%",
        marginTop: theme.spacing(3),
        overflowX: "auto"
    },
    table: {
        minWidth: 650
    }
}));

const ListExchangeKey = (props) => {

    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [total, setTotal] = useState(0);
    const [updateId, setUpdateId] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isShowCancel, setShowCancel] = useState(false);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListRequestExchange: 'get-list-request-exchange'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListRequestExchange);
        if (check == 1) {
            searchExchangeKey({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const searchExchangeKey = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `distributor/requestExchange`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data.rows;
                    setRow(res);
                    setTotal(data.data.count);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchExchangeKey({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const showCancelExchange = (id) => {
        setShowCancel(true);
        setDataCancel({
            show: true
        })

        setUpdateId(id);
    }

    const hideModalCancel = () => {
        setShowCancel(false);
        setDataCancel({
            show: false,
            order: {},
            reason: ''
        })
    }

    const handleCancelExchange = () => {
        setLoadCancel(true);
        makeRequest('get', `order/cancelExchangeDistributor?id=${updateId}`)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Hủy đổi key thành công');
                    const dataEx = rows.map(it => {
                        if (it.id == updateId) {
                            it.status = 2;
                        }

                        return it;
                    });

                    setRow(dataEx);
                } else {
                    showErrorMessage(data.message);
                }
                hideModalCancel();
                setLoadCancel(false);
            })
            .catch(err => {
                hideModalCancel();
                setLoadCancel(false);
                console.log(err)
            })
    }

    const renderStatusText = (category) => {
        console.log(category)
        if (category == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đổi thành công</span>);
        } else if (category == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đang chờ xác nhận</span>);
        }
    }

    if (isLoading) return <Loading />

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <Table className={classes1.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Key đổi</TableCell>
                                            <TableCell>Key nhận</TableCell>
                                            <TableCell>Thời gian</TableCell>
                                            <TableCell>Trạng thái</TableCell>
                                            <TableCell style={{ width: 150 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows && rows.length ? rows.map(row => (
                                            <TableRow key={"exchane-" + row.id}>
                                                <TableCell>
                                                    {row ? row.package_exchange.map(item => {
                                                        return <PackageLabelExchange key={`package-exchange-${item.package_id}`} packageData={{ id: item.package_id, name: DATA_PACKAGE[item.package_id], amount: item.quantity }} />
                                                    }) : null}
                                                </TableCell>
                                                <TableCell>
                                                    {row ? row.package_receive.map(item => {
                                                        return <PackageLabelExchange key={`package-exchange-${item.package_id}`} packageData={{ id: item.package_id, name: DATA_PACKAGE[item.package_id], amount: item.quantity }} />
                                                    }) : null}
                                                </TableCell>
                                                <TableCell>{formatTime(row.createdAt)}</TableCell>
                                                <TableCell>{renderStatusText(row.status)}</TableCell>
                                                <TableCell>{row.status == 0 ?
                                                    <>
                                                        <div>
                                                            <Button type="danger" className="button-center-item" size="small" onClick={() => showCancelExchange(row.id)} icon={<DeleteOutlined />}>
                                                                Hủy bỏ
                                                        </Button>
                                                        </div>
                                                    </> : null}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">Không có dữ liệu</TableCell>
                                                </TableRow>
                                            )}
                                    </TableBody>
                                </Table>
                                {total > rowsPerPage && (
                                    <div className="customSelector custom-svg">
                                        <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                        </div>

                        <Modal
                            title='Yêu cầu đổi key'
                            visible={isShowCancel}
                            onOk={handleCancelExchange}
                            onCancel={hideModalCancel}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalCancel} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-danger btn-danger"
                                    onClick={handleCancelExchange} loading={isLoadCancel}>
                                    <span>Hủy yêu cầu</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div>Bạn có muốn hủy yêu cầu đổi key này?</div>
                        </Modal>
                    </div>
                </div>
            </div >

        </>
    );
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(ListExchangeKey);