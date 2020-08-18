/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import {
    makeStyles,
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
import { InfoCircleOutlined, CheckOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import SelectForm from '../../partials/common/SelectForm';
import { formatMoney } from '../../libs/money';
import PackageLabel from '../../partials/common/PackageLabel';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { DATA_PACKAGE, TYPE_PAYMENT } from '../../config/product';
import { getMessageKey } from '../../libs/key_message';
import { connect } from "react-redux";
import Loading from '../loading';
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

const CollabOrder = (props) => {



    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [orderView, setOrderView] = useState('');
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [dataConfirm, setDataConfirm] = useState({ show: false, order: {}, type_payment: TYPE_PAYMENT[0].n });
    const [total, setTotal] = useState(0);
    const [orderKey, setOrderKey] = useState([]);
    const [dataKey, setDataKey] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isLoadConfirm, setLoadConfirm] = useState(false);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [page, setPage] = useState(1);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getCollabOrder: 'get-collab-order'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getCollabOrder);
        if (check == 1) {
            searchOrder({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const searchOrder = (dataSearch = {}) => {
        dataSearch.type = 0;
        setLoading(true);
        setLoadSearch(true);
        makeRequest('get', `collaborators/getAllOrderByDistributor`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    if (res) {
                        setRow(res.rows);
                        setTotal(res.count);
                    }
                }
                setLoading(false);
                setLoadSearch(false);
            })
            .catch(err => {
                setLoading(false);
                setLoadSearch(false);
                console.log(err);
            })
    }

    const getOrderKey = (code) => {
        if (dataKey[code]) {
            setOrderKey(dataKey[code]);
        } else {
            makeRequest('get', `order/getOrderKey/${code}`, {})
                .then(({ data }) => {
                    if (data.signal) {
                        setOrderKey(data.data);
                        setDataKey({
                            ...dataKey,
                            [code]: data.data
                        })
                    } else {
                        setOrderKey([]);
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchOrder({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const onChangeValue = (key, value) => {
        setData({
            ...dataSearch,
            [key]: value
        })
    }

    const unfilteredData = (e) => {
        setData({
            status: '',
            email: '',
            package_id: '',
            code: ''
        });

        setPage(1);
        searchOrder({ page: 1, limit: rowsPerPage });
    }

    const handleSearchOrder = (e) => {
        e.preventDefault();
        setPage(1);
        searchOrder({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const showViewOrder = (order) => {
        setOrderView(order);
        if (order.order.status == 1) {
            getOrderKey(order.order.code);
        } else {
            setOrderKey([]);
        }
    }

    const showCancelOrder = (order) => {
        setDataCancel({
            show: true,
            order,
            reason: ''
        })
    }

    const onChangeValueCancel = (key, value) => {
        setDataCancel({
            ...dataCancel,
            [key]: value
        })
    }

    const hideModalCancel = () => {
        setDataCancel({
            show: false,
            order: {},
            reason: ''
        })
    }

    const handleCancelOrder = () => {
        setLoadCancel(true);
        makeRequest('post', `order/cancelOrder`, { order_id: dataCancel.order.order.id, reason: dataCancel.reason })
            .then(({ data }) => {
                setLoadCancel(false);
                if (data.signal) {
                    showSuccessMessageIcon('Huỷ đơn hàng thành công');
                    setPage(1);
                    searchOrder({ page: 1, limit: rowsPerPage });
                    hideModalCancel();
                } else {
                    showErrorMessage(data.message);
                }
            })
            .catch(err => {
                setLoadCancel(false);
                console.log(err);
            })
    }

    const showConfirmPayment = (order) => {
        setDataConfirm({
            show: true,
            order,
            type_payment: TYPE_PAYMENT[0].n
        })
    }

    const onChangeValueConfirm = (key, value) => {
        setDataConfirm({
            ...dataConfirm,
            [key]: value
        })
    }

    const hideConfirm = () => {
        setDataConfirm({
            show: false,
            order: {},
            type_payment: TYPE_PAYMENT[0].n
        })
    }

    const handleConfirmPayment = () => {
        setLoadConfirm(true);
        makeRequest('post', `order/confirmPayment`, { order_id: dataConfirm.order.order.id, type_payment: dataConfirm.type_payment })
            .then(({ data }) => {
                if (data.signal) {
                    setPage(1);
                    searchOrder({ page: 1, limit: rowsPerPage });
                    hideConfirm();
                    showSuccessMessageIcon('Xác nhận thanh toán thành công');
                } else {
                    showErrorMessage(data.message);
                }
                setLoadConfirm(false);
            })
            .catch(err => {
                setLoadConfirm(false);
                console.log(err)
            })
    }

    const renderStatusText = (order) => {
        if (order.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã thanh toán</span>);
        } else if (order.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa thanh toán</span>);
        }
    }

    const copyToClipboard = (text) => {
        const elem = document.createElement('textarea');
        elem.value = text;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
    }

    const copyKey = (row) => {
        if (dataKey[row.code]) {
            const orderKeyData = dataKey[row.code];
            if (orderKeyData[0] && orderKeyData[0].dataKey && orderKeyData[0].dataKey[0]) {
                const license_key = orderKeyData[0].dataKey[0].license_key;

                let message = getMessageKey(row.productData[0].package_id, license_key);
                copyToClipboard(message);
                showSuccessMessageIcon('Copy key thành công!');
            }
        } else {
            makeRequest('get', `order/getOrderKey/${row.code}`, {})
                .then(({ data }) => {
                    if (data.signal) {
                        const orderKeyData = data.data;
                        setDataKey(data.data);
                        if (orderKeyData[0] && orderKeyData[0].dataKey && orderKeyData[0].dataKey[0]) {
                            const license_key = orderKeyData[0].dataKey[0].license_key;

                            let message = getMessageKey(row.productData[0].package_id, license_key);
                            copyToClipboard(message);
                            showSuccessMessageIcon('Copy key thành công!');
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    const renderAction = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => showViewOrder(row)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                </Button>
                </div>
                {row.order.status == 1 && (
                    <div className="mg-b5">
                        <Button type="secondary" className="button-center-item" size="small" onClick={() => copyKey(row.order)} icon={<CopyOutlined />}>
                            Copy key
                        </Button>
                    </div>
                )}
                {(row.order.status === 0) && (
                    <>
                        <div className="mg-b5">
                            <Button type="primary" className="button-center-item" size="small" onClick={() => showConfirmPayment(row)} icon={<CheckOutlined />}>
                                Xác nhận thanh toán
                        </Button>
                        </div>
                        <div>
                            <Button type="danger" className="button-center-item" size="small" onClick={() => showCancelOrder(row)} icon={<DeleteOutlined />}>
                                Huỷ bỏ
                        </Button>
                        </div>
                    </>
                )}
            </>
        )
    }

    const renderInfoCustomer = (customer) => {
        if (!customer) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {customer.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{customer.email}</span>
                </div>
                {(customer.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{customer.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const renderInfoDistributor = (row) => {
        if (!row) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {row.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{row.email}</span>
                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{row.mobile}</span>
                </div>
            </>
        );
    }

    const renderPackage = (packageList) => {
        if (!packageList) return '';
        return packageList.map(it => {
            let name = DATA_PACKAGE[it.package_id];
            return <PackageLabel packageData={{ id: it.package_id, name }} key={`package-id-${it.id}`} />
        })
    }


    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>

                                        <div className='form-row'>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Mã CTV"
                                                        value={dataSearch.code || ''}
                                                        onChange={(value) => { onChangeValue('code', value.target.value) }}
                                                        autoFocus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tên CTV"
                                                        value={dataSearch.name || ''}
                                                        onChange={(value) => { onChangeValue('name', value.target.value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email CTV"
                                                        value={dataSearch.email || ''}
                                                        onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <SelectForm
                                                        optionData={[{ n: 'Chưa thanh toán', v: 0 }, { n: 'Đã thanh toán', v: 1 }, { n: 'Bị huỷ', v: 2 }]}
                                                        keyString="v"
                                                        labelString="n"
                                                        placeholder="Trạng thái"
                                                        value={dataSearch.status || ''}
                                                        onChangeValue={(value) => { onChangeValue('status', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading type="submit" className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10"
                                                        loading={true} onClick={handleSearchOrder} disabled={isLoadSearch} loading={isLoadSearch}
                                                        style={{ marginLeft: 10, marginTop: 3 }}><span>Tìm kiếm</span></ButtonLoading>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <Table className={classes1.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Gói</TableCell>
                                                <TableCell>Mã đơn hàng</TableCell>
                                                <TableCell>Khách hàng</TableCell>
                                                <TableCell>Cộng tác viên</TableCell>
                                                <TableCell>Tổng tiền</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`list-order-${row.id}`}>
                                                    <TableCell className="textindiv">
                                                        {renderPackage(row.order.productData)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.order.code}
                                                    </TableCell>
                                                    <TableCell>{renderInfoCustomer(row.customer)}</TableCell>
                                                    <TableCell>{renderInfoDistributor(row.collaborators)}</TableCell>
                                                    <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                    <TableCell className="textindiv">{renderStatusText(row.order)}</TableCell>
                                                    <TableCell>
                                                        {renderAction(row)}
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
                            title='Chi tiết đơn hàng'
                            visible={orderView ? true : false}
                            onOk={() => setOrderView('')}
                            onCancel={() => setOrderView('')}
                            footer={[
                                <Button type="primary" onClick={() => setOrderView('')}>
                                    OK
                                </Button>
                            ]}
                        >
                            <div className="form-group">
                                {orderView && (
                                    <table className="table table-striped table-bordered">
                                        <tbody>
                                            <tr>
                                                <td className="fontBold">Mã đơn hàng</td>
                                                <td>{orderView.order.code}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Khách hàng</td>
                                                <td>{renderInfoCustomer(orderView.customer)}</td>
                                            </tr>

                                            {orderView.collaborators ?
                                                <tr>
                                                    <td className="fontBold">Cộng tác viên</td>
                                                    <td>{renderInfoCustomer(orderView.collaborators)}</td>
                                                </tr> : null}

                                            <tr>
                                                <td className="fontBold">Gói</td>
                                                <td>
                                                    {renderPackage(orderView.order.productData)}
                                                </td>
                                            </tr>

                                            {orderView.coupons_code ?
                                                <tr>
                                                    <td className="fontBold">Mã giảm giá</td>
                                                    <td>
                                                        {orderView.order.coupons_code}
                                                    </td>
                                                </tr> : null
                                            }

                                            <tr>
                                                <td className="fontBold">Tổng tiền</td>
                                                <td>{formatMoney(orderView.order.total_price)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Thời gian</td>
                                                <td>{formatTime(orderView.createdAt)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fontBold">Trạng thái</td>
                                                <td>
                                                    {renderStatusText(orderView)}
                                                </td>
                                            </tr>

                                            {(orderView.order.status == 1 || orderView.order.status == 2) ? (
                                                <tr>
                                                    <td className="fontBold">{orderView.order.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                                    <td>{orderView.order.note_pay}</td>
                                                </tr>
                                            ) : ''}

                                            {(orderView.order.status == 1 && orderKey[0] && orderKey[0].dataKey[0]) ? (
                                                <tr>
                                                    <td className="fontBold">Key</td>
                                                    <td>{orderKey[0].dataKey[0].license_key}</td>
                                                </tr>
                                            ) : ''}

                                        </tbody>
                                    </table>
                                )}

                            </div>
                        </Modal>
                        <Modal
                            title='Xác nhận huỷ đơn hàng'
                            visible={dataCancel.show}
                            onOk={handleCancelOrder}
                            onCancel={hideModalCancel}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalCancel} className="btn btn-label-secondary btn-secondary">
                                    Close
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-danger btn-danger"
                                    onClick={handleCancelOrder} loading={isLoadCancel}>
                                    <span>Hủy đơn hàng</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="form-group">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fontBold" style={{ width: "200px" }}>Mã đơn hàng</td>
                                            <td>{dataCancel && dataCancel.order && dataCancel.order.order ? dataCancel.order.order.code : null}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Khách hàng</td>
                                            <td>{dataCancel && dataCancel.order && dataCancel.order.customer ? renderInfoCustomer(dataCancel.order.customer) : null}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Tổng tiền</td>
                                            <td>{dataCancel && dataCancel.order && dataCancel.order.order ? formatMoney(dataCancel.order.total_price) : null}</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                            <h4 className="fontBold">Nhập lý do huỷ đơn hàng</h4>
                            <Form.Control
                                type="text"
                                placeholder=""
                                value={dataCancel.reason || ''}
                                onChange={(value) => { onChangeValueCancel('reason', value.target.value) }}
                            />
                        </Modal>

                        <Modal
                            title='Xác nhận thanh toán đơn hàng'
                            visible={dataConfirm.show}
                            onOk={handleConfirmPayment}
                            onCancel={hideConfirm}
                            footer={[
                                <ButtonLoading type="default" onClick={hideConfirm} className="btn btn-label-secondary btn-secondary">
                                    Close
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={handleConfirmPayment} loading={isLoadConfirm}>
                                    <span>Xác nhận thanh toán</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="form-group">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fontBold" style={{ width: "200px" }}>Mã đơn hàng</td>
                                            <td>{dataConfirm && dataConfirm.order && dataConfirm.order.order ? dataConfirm.order.order.code : null}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Khách hàng</td>
                                            <td>{dataConfirm && dataConfirm.order && dataConfirm.order.customer ? renderInfoCustomer(dataConfirm.order.customer) : null}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Tổng tiền</td>
                                            <td>{dataConfirm && dataConfirm.order ? formatMoney(dataConfirm.order.total_price) : null}</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                            <h4 className="fontBold">Chọn phương thức thanh toán</h4>
                            <SelectForm
                                optionData={TYPE_PAYMENT}
                                keyString="n"
                                labelString="n"
                                placeholder=""
                                value={dataConfirm.type_payment || ''}
                                onChangeValue={(value) => { onChangeValueConfirm('type_payment', value) }}
                            />
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

export default connect(mapStateToProps, null)(CollabOrder);