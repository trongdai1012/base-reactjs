/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
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
import { InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import { formatMoney } from '../../libs/money';
import PackageLabel from '../../partials/common/PackageLabel';
import { DATA_PACKAGE } from '../../config/product';
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

export default function WholeSaleBuyOrder() {

    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [total, setTotal] = useState(0);
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [orderView, setOrderView] = useState('');
    const [orderKey, setOrderKey] = useState([]);
    const [showKey, setShowKey] = useState({ visible: false });
    const [isLoading, setLoading] = useState(true);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getWholesaleBuyOrder: 'get-order-buy-wholesale'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getWholesaleBuyOrder);
        if (check == 1) {
            searchOrder({ type: 1, page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const searchOrder = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `order/getOrderWholeSale`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    setRow(data.data.listOrder);
                    setTotal(data.data.total);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })
    }

    const renderPackage = (packageList) => {
        if (!packageList) return '';
        return packageList.map(it => {
            let name = DATA_PACKAGE[it.package_id] + ' (' + it.quantity + ' key)';
            return <PackageLabel packageData={{ id: it.package_id, name }} key={`package-id-${it.id}`} />
        })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchOrder({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

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

    const onChangeValue = (key, value) => {

        setData({
            ...dataSearch,
            [key]: value
        })
    }

    const unfilteredData = (e) => {
        setData({
            name: ''
        });

        setPage(1);
        searchOrder({ page: 1, limit: rowsPerPage });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        searchOrder({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const renderStatusText = (category) => {
        if (category.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Thành công</span>);
        } else if (category.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chờ xác nhận</span>);
        }
    }

    const handleCancelOrder = () => {
        setLoadCancel(true);
        makeRequest('post', `order/cancelOrder`, { order_id: dataCancel.order.id, reason: dataCancel.reason })
            .then(({ data }) => {
                if (data.signal) {
                    let dataRow = rows.map(it => {
                        if (it.id == dataCancel.order.id) {
                            it.status = 2;
                            it.note_pay = dataCancel.reason
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
                hideModalCancel();
            })
            .catch(err => {
                setLoadCancel(false);
                hideModalCancel();
                console.log(err)
            })
    }

    const renderAction = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => showViewOrder(row)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
                {row.status == 0 && (
                    <>
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

    const getOrderKey = (code) => {
        makeRequest('get', `order/getOrderKey/${code}/${1}`, {})
            .then(({ data }) => {
                if (data.signal) {
                    setOrderKey(data.data);
                } else {
                    setOrderKey([]);
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const showViewOrder = (order) => {
        setOrderView(order);
        if (order.status == 1) {
            getOrderKey(order.code);
        } else {
            setOrderKey([]);
        }
    }

    return (
        <>
            <Link to="/order/wholeSale-add" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo đơn hàng mua sỉ</Link>

            <div className="row">
                <div className="col-md-12">

                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Mã đơn hàng"
                                                        value={dataSearch.code || ''}
                                                        onChange={(e) => { onChangeValue('code', e.target.value) }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" loading={isLoading} style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
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
                                                <TableCell>Tổng tiền</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell>Ngày tạo</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`order-bought-${row.id}`}>
                                                    <TableCell>
                                                        {renderPackage(row.productData)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.code}
                                                    </TableCell>
                                                    <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                    <TableCell>{renderStatusText(row)}</TableCell>
                                                    <TableCell>{formatTime(row.createdAt)}</TableCell>
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
                                {total > 10 && (
                                    <div className="customSelector custom-svg">
                                        <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                        </div>

                        <Modal
                            title='Chi tiết đơn hàng'
                            visible={orderView && !showKey.visible ? true : false}
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
                                                <td className="fontBold">Gói</td>
                                                <td>
                                                    {renderPackage(orderView.productData)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tổng tiền</td>
                                                <td>{formatMoney(orderView.total_price)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Chiết khấu</td>
                                                <td>{orderView.discount} %</td>
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

                                            {(orderView.status == 1 || orderView.status == 2) ? (
                                                <tr>
                                                    <td className="fontBold">{orderView.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                                    <td>{orderView.note_pay}</td>
                                                </tr>
                                            ) : ''}

                                            {(orderView.status == 1) ? (
                                                <tr>
                                                    <td className="fontBold">Key</td>
                                                    <td>
                                                        <Button type="primary" size="small" onClick={() => setShowKey({ visible: true })} >
                                                            Xem danh sách key
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ) : ''}

                                        </tbody>
                                    </table>
                                )}

                            </div>
                        </Modal>

                        <Modal
                            title={`Chi tiết key đơn hàng ${orderView ? orderView.code : ''}`}
                            visible={showKey.visible}
                            onOk={() => setShowKey({ visible: false })}
                            onCancel={() => setShowKey({ visible: false })}
                            footer={[
                                <Button type="primary" onClick={() => setShowKey({ visible: false })}>
                                    OK
                                </Button>
                            ]}
                        >
                            <div className="form-group">
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm theo key"
                                    value={showKey.keys || ''}
                                    onChange={(e) => { setShowKey({ visible: true, keys: e.target.value }) }}
                                />
                                <br />
                                {showKey && orderKey.length && (
                                    <table className="table table-striped table-bordered">
                                        <tbody>
                                            {orderKey.map(itemKey => {
                                                return (
                                                    <tr key={`info-key-${itemKey.package_id}`}>
                                                        <td className="fontBold text-center">
                                                            <PackageLabel packageData={{ id: itemKey.package_id, name: DATA_PACKAGE[itemKey.package_id] + ' (' + itemKey.dataKey.length + ' key)' }} />
                                                        </td>
                                                        <td>
                                                            {itemKey.dataKey.map(it => {
                                                                if (!showKey.keys || it.license_key.toLowerCase().includes(showKey.keys.toLowerCase())) {
                                                                    return <p style={{ fontSize: '14px' }} key={`data-key-${it.license_key}`}>{it.license_key}</p>
                                                                } else {
                                                                    return <></>
                                                                }
                                                            })}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
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
                                    Đóng
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
                                            <td>{dataCancel.order.code}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Tổng tiền</td>
                                            <td>{formatMoney(dataCancel.order.total_price)}</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                            <h4 className="fontBold">Nhập lý do huỷ đơn hàng</h4>
                            <Form.Control
                                type="text"
                                placeholder=""
                                value={dataCancel.reason || ''}
                                onChange={(e) => { onChangeValueCancel('reason', e.target.value) }}
                            />
                        </Modal>

                    </div>
                </div>
            </div>


        </>
    );
}