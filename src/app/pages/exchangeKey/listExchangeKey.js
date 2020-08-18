/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
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
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import PackageLabelExchange from '../../partials/common/PackageLabelExchange';
import { DATA_PACKAGE, TYPE_PAYMENT } from '../../config/product';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from "../../partials/common/ButtonLoading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
import { FormSelect } from "semantic-ui-react";
import SelectForm from "../../partials/common/SelectForm";

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
    const [dataConfirm, setDataConfirm] = useState({ show: false, order: {}, type_payment: TYPE_PAYMENT[0].n });
    const [total, setTotal] = useState(0);
    const [updateId, setUpdateId] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadConfirm, setLoadConfirm] = useState(false);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListExchangeKey: 'get-all-exchange-key'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListExchangeKey)
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
        dataSearch.type = 0;
        setLoading(true);
        makeRequest('get', `order/getAllExchange`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;

                    if (res) {
                        setRow(res.result);
                        setTotal(res.total);
                    }
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

    const onChangeValue = (key, value) => {
        setData({
            ...dataSearch,
            [key]: value
        })
    }

    const unfilteredData = (e) => {
        setData({});

        setPage(1);
        searchExchangeKey({ page: 1, limit: rowsPerPage });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        searchExchangeKey({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const handleSearchOrder = () => {
        setPage(1);
        searchExchangeKey({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const showCancelExchange = (id) => {
        setDataCancel({
            show: true
        })

        setUpdateId(id);
    }

    const hideModalCancel = () => {
        setDataCancel({
            show: false,
            order: {},
            reason: ''
        })
    }

    const handleCancelExchange = () => {
        setLoadCancel(true);
        makeRequest('get', `order/cancelExchange?id=${updateId}`)
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
                setLoadCancel(false);
                hideModalCancel();
            })
            .catch(err => {
                setLoadCancel(false);
                hideModalCancel();
                console.log(err)
            })
    }

    const showConfirmExchange = (id) => {
        setDataConfirm({
            show: true
        })

        setUpdateId(id);
    }

    const hideConfirm = () => {
        setDataConfirm({
            show: false,
            order: {},
            type_payment: TYPE_PAYMENT[0].n
        })
    }

    const handleConfirmExchange = () => {
        setLoadConfirm(true);
        makeRequest('get', `order/confirmExchange?id=${updateId}`)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Xác nhận đổi key thành công');
                    const dataEx = rows.map(it => {
                        if (it.id == updateId) {
                            it.status = 1;
                        }

                        return it;
                    });

                    setRow(dataEx);
                } else {
                    showErrorMessage(data.message);
                }
                setLoadConfirm(false);
                hideConfirm();
            })
            .catch(err => {
                setLoadConfirm(false);
                console.log(err)
            })
    }

    const renderStatusText = (category) => {
        if (category == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đổi thành công</span>);
        } else if (category == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đang chờ xác nhận</span>);
        }
    }

    const renderInfoDistributor = (cart) => {
        if (!cart.distributor) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {cart.distributor.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{cart.distributor.email}</span>
                </div>
                {(cart.distributor.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{cart.distributor.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>

                                        <div className='form-row'>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email nhà phân phối"
                                                        value={dataSearch.email || ''}
                                                        onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <SelectForm
                                                        optionData={[{ n: 'Đang chờ xác nhận ', v: 0 }, { n: 'Thành công', v: 1 }, { n: 'Bị huỷ', v: 2 }]}
                                                        keyString="v"
                                                        labelString="n"
                                                        placeholder="Trạng thái"
                                                        value={dataSearch.status || ''}
                                                        onChangeValue={(value) => { onChangeValue('status', value) }}
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={LIST_PACKAGE_SELL}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeValue('package_id', value) }}
                                                    />
                                                </div>
                                            </div> */}

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading loading={isLoading} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={handleSearchOrder} style={{ marginLeft: 10, marginTop: 3 }} type="submit">
                                                        <span>Tìm kiếm</span>
                                                    </ButtonLoading>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <Table className={classes1.table}>
                                        <TableHead>
                                            <TableRow>

                                                <TableCell>Nhà phân phối</TableCell>
                                                <TableCell>Key đổi</TableCell>
                                                <TableCell>Key nhận</TableCell>
                                                <TableCell>Thời gian</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map(row => (
                                                <TableRow key={"exchange-" + row.id}>
                                                    <TableCell>{renderInfoDistributor(row)}</TableCell>
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
                                                            <div className="mg-b5">
                                                                <Button type="primary" className="button-center-item" size="small" onClick={() => showConfirmExchange(row.id)} icon={<CheckOutlined />}>
                                                                    Xác nhận
                                                        </Button>
                                                            </div>
                                                            <div>
                                                                <Button type="danger" className="button-center-item" size="small" onClick={() => showCancelExchange(row.id)} icon={<DeleteOutlined />}>
                                                                    Huỷ bỏ
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
                                    </Table>}
                                {total > rowsPerPage && (
                                    <div className="customSelector custom-svg">
                                        <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                        </div>

                        <Modal
                            title='Yêu cầu đổi key'
                            visible={dataCancel.show}
                            onOk={handleCancelExchange}
                            onCancel={hideModalCancel}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalCancel} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-danger btn-danger"
                                    onClick={handleCancelExchange} loading={isLoadCancel}>
                                    <span>Huỷ yêu cầu</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div>Bạn có muốn hủy yêu cầu đổi key này?</div>
                        </Modal>

                        <Modal
                            title='Yêu cầu đổi key'
                            visible={dataConfirm.show}
                            onOk={handleConfirmExchange}
                            onCancel={hideConfirm}
                            footer={[
                                <ButtonLoading type="default" onClick={hideConfirm} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={handleConfirmExchange} loading={isLoadConfirm}>
                                    <span>Xác nhận đổi</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div>Bạn có xác nhận yêu cầu đổi key này?</div>
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