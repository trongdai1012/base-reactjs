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
import { Modal, Pagination, Button, DatePicker } from "antd";
import { InfoCircleOutlined, CheckOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import SelectForm from '../../partials/common/SelectForm';
import { TYPE_PAYMENT } from '../../config/product';
import { getMessageKey } from '../../libs/key_message';
import { connect } from "react-redux";
import Loading from "../loading";
import ButtonLoading from '../../partials/common/ButtonLoading';
import moment from 'moment';
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

const OrderTrial = (props) => {

    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [orderView, setOrderView] = useState('');
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [dataConfirm, setDataConfirm] = useState({ show: false, order: {}, type_payment: '' });
    const [total, setTotal] = useState(0);
    const [orderKey, setOrderKey] = useState([]);
    const [dataKey, setDataKey] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isLoadConfirm, setLoadConfirm] = useState(false);
    const { user } = props;
    const dateFormat = 'DD/MM/YYYY';
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getOrderTrial: 'get-order-trial'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getOrderTrial);
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
        dataSearch.package_id = 1;
        setLoading(true);
        setLoadSearch(true);
        makeRequest('get', `order/search`, dataSearch)
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
                console.log(err)
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
        if (e.key == "Enter") {
            e.preventDefault();
            setPage(1);
            searchOrder({ ...dataSearch, page: 1, limit: rowsPerPage });
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        searchOrder({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const showViewOrder = (order) => {
        setOrderView(order);
        if (order.status == 1) {
            getOrderKey(order.code);
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
        makeRequest('post', `order/cancelOrder`, { order_id: dataCancel.order.id, reason: dataCancel.reason })
            .then(({ data }) => {
                if (data.signal) {
                    let dataRow = rows.map(it => {
                        if (it.id == dataCancel.order.id) {
                            it.status = 2;
                        }

                        return it;
                    })

                    setRow(dataRow);
                    setDataCancel({
                        ...dataCancel,
                        show: false,
                        reason: ''
                    });

                    showSuccessMessageIcon('Huỷ đơn hàng thành công');

                } else {
                    showErrorMessage(data.message);
                }
                setLoadCancel(false);
            })
            .catch(err => {
                setLoadCancel(false);
                console.log(err)
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
        makeRequest('post', `order/confirmPayment`, { order_id: dataConfirm.order.id, type_payment: '' })
            .then(({ data }) => {
                if (data.signal) {
                    let dataRow = rows.map(it => {
                        if (it.id == dataConfirm.order.id) {
                            it.status = 1;
                            it.note_pay = '';
                            it.updatedAt = new Date();
                        }

                        return it;
                    })

                    setRow(dataRow);
                    setDataConfirm({
                        ...dataConfirm,
                        show: false
                    });

                    showSuccessMessageIcon('Xác nhận cấp key thành công');
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

    const renderStatusText = (category) => {
        if (category.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã cấp key</span>);
        } else if (category.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa cấp key</span>);
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
                showSuccessMessageIcon('Copy key thành công!')
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
                            showSuccessMessageIcon('Copy key thành công!')
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
                {row.status == 1 && (
                    <div className="mg-b5">
                        <Button type="secondary" className="button-center-item" size="small" onClick={() => copyKey(row)} icon={<CopyOutlined />}>
                            Copy key
                        </Button>
                    </div>
                )}
                {(row.status == 0 && user && ((user.type == 1 && !row.distributor_id) || user.distributor_id == row.distributor_id)) && (
                    <>
                        <div className="mg-b5">
                            <Button type="primary" className="button-center-item" size="small" onClick={() => showConfirmPayment(row)} icon={<CheckOutlined />}>
                                Cấp key
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

    const renderInfoCustomer = (cart) => {
        if (!cart.customer) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {cart.customer.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{cart.customer.email}</span>
                </div>
                {(cart.customer.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{cart.customer.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const onChangeStartDate = (date) => {
        if (dataSearch.end && dataSearch.end < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataSearch,
            start: date.format('MM/DD/YYYY')
        });
    }

    const onChangeEndDate = (date) => {
        if (dataSearch.start && dataSearch.start > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataSearch,
            end: date.format('MM/DD/YYYY')
        });
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
                                            <div className='form-group col-md-2 search-row-1 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Mã đơn hàng"
                                                        value={dataSearch.code || ''}
                                                        onChange={(value) => { onChangeValue('code', value.target.value) }}
                                                        autoFocus
                                                        onKeyPress={(e) => handleSearchOrder(e)}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 search-row-1 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email khách"
                                                        value={dataSearch.email || ''}
                                                        onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                        onKeyPress={(e) => handleSearchOrder(e)}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 search-row-1 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Số điện thoại"
                                                        value={dataSearch.mobile || ''}
                                                        onChange={(value) => { onChangeValue('mobile', value.target.value) }}
                                                        onKeyPress={(e) => handleSearchOrder(e)}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero">
                                                    <DatePicker
                                                        format={dateFormat}
                                                        onChange={onChangeStartDate}
                                                        placeholder={'Chọn ngày bắt đầu'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.start ? moment(dataSearch.start) : ''}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <DatePicker
                                                        format={dateFormat}
                                                        onChange={onChangeEndDate}
                                                        placeholder={'Chọn ngày kết thúc'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.end ? moment(dataSearch.end) : ''}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero">
                                                    <SelectForm
                                                        optionData={[{ n: 'Đã cấp key', v: 1 }, { n: 'Chưa cấp', v: 0 }]}
                                                        keyString="v"
                                                        labelString="n"
                                                        placeholder="Trạng thái"
                                                        value={dataSearch.status || ''}
                                                        onChangeValue={(value) => { onChangeValue('status', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-9 margin-bottom-zero'>
                                            </div>

                                            <div className='form-group col-md-3 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" loading={isLoadSearch} onClick={(e) => handleSearch(e)} style={{ marginLeft: 10, marginTop: 3 }}><span>Tìm kiếm</span></ButtonLoading>
                                                </div>
                                            </div>

                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <Table className={classes1.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Mã đơn hàng</TableCell>
                                                <TableCell>Khách hàng</TableCell>
                                                <TableCell>Thời gian</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell>Thời gian cấp key</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`order-trial-${row.id}`}>
                                                    <TableCell>
                                                        {row.code}
                                                    </TableCell>
                                                    <TableCell>{renderInfoCustomer(row)}</TableCell>
                                                    {/* <TableCell>{row.customer.email}</TableCell> */}
                                                    <TableCell>{formatTime(row.createdAt)}</TableCell>
                                                    <TableCell>{renderStatusText(row)}</TableCell>
                                                    <TableCell>
                                                        {row.status === 1 && (
                                                            formatTime(row.updatedAt)
                                                        )}
                                                    </TableCell>
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
                                                <td>{orderView.code}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tên khách hàng</td>
                                                <td>{orderView.customer.name}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Email khách hàng</td>
                                                <td>{orderView.customer.email}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">SĐT</td>
                                                <td>{orderView.customer.mobile}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Ngày đăng ký</td>
                                                <td>{formatTime(orderView.createdAt)}</td>
                                            </tr>

                                            {(orderView.status == 1 && orderKey[0] && orderKey[0].dataKey[0]) ? (
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
                            title='Xác nhận huỷ yêu cầu'
                            visible={dataCancel.show}
                            onOk={handleCancelOrder}
                            onCancel={hideModalCancel}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalCancel} className="btn btn-label-secondary btn-secondary">
                                    Close
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-danger btn-danger"
                                    onClick={handleCancelOrder} loading={isLoadCancel}>
                                    <span>Xác nhận hủy</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="form-group">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fontBold" style={{ width: "200px" }}>Mã đơn hàng</td>
                                            <td>{dataCancel.order.code}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Khách hàng</td>
                                            <td>
                                                <p style={{ fontSize: '16px' }}>{dataCancel.order.customer ? dataCancel.order.customer.name : ''}</p>
                                                <p style={{ fontSize: '16px' }}>{dataCancel.order.customer ? dataCancel.order.customer.email : ''}</p>
                                                <p style={{ fontSize: '16px' }}>{dataCancel.order.customer ? dataCancel.order.customer.mobile : ''}</p>
                                            </td>
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
                                autoFocus={true}
                            />
                        </Modal>

                        <Modal
                            title='Xác nhận cấp key dùng thử'
                            visible={dataConfirm.show}
                            onOk={handleConfirmPayment}
                            onCancel={hideConfirm}
                            footer={[
                                <ButtonLoading type="default" onClick={hideConfirm} className="btn btn-label-secondary btn-secondary">
                                    Close
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={handleConfirmPayment} loading={isLoadConfirm}>
                                    <span>Cấp key</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="form-group">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fontBold" style={{ width: "200px" }}>Mã đơn hàng</td>
                                            <td>{dataConfirm.order.code}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Khách hàng</td>
                                            <td>
                                                <p style={{ fontSize: '16px' }}>{dataConfirm.order.customer ? dataConfirm.order.customer.name : ''}</p>
                                                <p style={{ fontSize: '16px' }}>{dataConfirm.order.customer ? dataConfirm.order.customer.email : ''}</p>
                                                <p style={{ fontSize: '16px' }}>{dataConfirm.order.customer ? dataConfirm.order.customer.mobile : ''}</p>
                                            </td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
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

export default connect(mapStateToProps, null)(OrderTrial);