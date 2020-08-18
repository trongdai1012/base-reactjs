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
import { Modal, Pagination, Button, DatePicker } from "antd";
import { InfoCircleOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { formatMoney } from '../../libs/money';
import PackageLabel from '../../partials/common/PackageLabel';
import { DATA_PACKAGE, LIST_PACKAGE_SELL, TYPE_PAYMENT } from '../../config/product';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { saveAs } from 'file-saver';
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

const WholeSaleOrder = (props) => {
    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [orderView, setOrderView] = useState('');
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [dataConfirm, setDataConfirm] = useState({ show: false, order: {}, type_payment: TYPE_PAYMENT[0].n });
    const [total, setTotal] = useState(0);
    const [orderKey, setOrderKey] = useState([]);
    const [showKey, setShowKey] = useState({ visible: false });
    const [isLoadConfirm, setLoadingConfirm] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [isLoadExcel, setLoadExcel] = useState(false);
    const dateFormat = 'DD/MM/YYYY';
    const { user } = props;
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getWholesaleOrder: 'get-order-wholesale'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getWholesaleOrder);
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
        if (dataSearch.type_sell == 2 && !dataSearch.email_distri_sale) {
            return showErrorMessage('Vui lòng nhập email nhà phân phối bán');
        }
        dataSearch.type = 1;
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
                    setLoading(false);
                    setLoadSearch(false);
                }

            })
            .catch(err => {
                setLoading(false);
                setLoadSearch(false);
                console.log(err);
            })
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
        setData({});

        setPage(1);
        searchOrder({ page: 1, limit: rowsPerPage });
    }

    const handleSearchOrder = (e) => {
        e.preventDefault();
        setPage(1);
        searchOrder({ ...dataSearch, page: 1, limit: rowsPerPage });
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
        setLoadingConfirm(true);
        makeRequest('post', `order/confirmPayment`, { order_id: dataConfirm.order.id, type_payment: dataConfirm.type_payment })
            .then(({ data }) => {
                if (data.signal) {
                    let dataRow = rows.map(it => {
                        if (it.id == dataConfirm.order.id) {
                            it.status = 1;
                            it.note_pay = dataConfirm.type_payment
                        }

                        return it;
                    })

                    setRow(dataRow);
                    setDataConfirm({
                        ...dataConfirm,
                        show: false
                    });

                    showSuccessMessageIcon('Xác nhận thanh toán thành công');
                } else {
                    showErrorMessage(data.message);
                }
                setLoadingConfirm(false);
                hideConfirm();
            })
            .catch(err => {
                setLoadingConfirm(false);
                hideConfirm();
                console.log(err)
            })
    }

    const renderAction = (row, idx) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => showViewOrder(row)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
                {(row.status == 0 && user && ((user.type == 1 && !row.distributor_id) || user.distributor_id == row.distributor_id)) && (
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

    const renderStatusText = (category) => {
        if (category.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã thanh toán</span>);
        } else if (category.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa thanh toán</span>);
        }
    }

    const renderInfoDistributor = (cart) => {
        if (!cart.distributorBuy) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {cart.distributorBuy.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{cart.distributorBuy.email}</span>
                </div>
                {(cart.distributorBuy.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{cart.distributorBuy.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const renderInfoDistributorSell = (cart) => {
        if (!cart.distributor) return "Admin";
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

    const renderPackage = (packageList) => {
        if (!packageList) return '';
        return packageList.map(it => {
            let name = `${DATA_PACKAGE[it.package_id]} (${it.quantity} key)`;
            return <PackageLabel packageData={{ id: it.package_id, name }} key={it.id} />
        })
    }

    const exportExelOrder = (e) => {
        e.preventDefault();
        setLoadExcel(true);
        makeRequest('get', `order/exportExcelOrderRetail`, { ...dataSearch, type: 1 }, '', 'blob')
            .then(({ data }) => {
                var bb = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
                saveAs(bb, 'order_data.xlsx');
                setLoadExcel(false);
            })
            .catch(err => {
                setLoadExcel(false);
                console.log(err);
            })
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
            {/* <Link to="/order/add" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo đơn hàng</Link> */}

            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>

                                        <div className='form-row'>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Mã đơn hàng"
                                                        value={dataSearch.code || ''}
                                                        onChangeValue={(value) => { onChangeValue('code', value) }}
                                                        focus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Email nhà phân phối mua"
                                                        value={dataSearch.email || ''}
                                                        onChangeValue={(value) => { onChangeValue('email', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Tên nhà phân phối mua"
                                                        value={dataSearch.nameBuy || ''}
                                                        onChangeValue={(value) => { onChangeValue('nameBuy', value) }}
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
                                                        optionData={[{ n: 'Chưa thanh toán', v: 0 }, { n: 'Đã thanh toán', v: 1 }, { n: 'Bị huỷ', v: 2 }]}
                                                        keyString="v"
                                                        labelString="n"
                                                        placeholder="Trạng thái"
                                                        value={dataSearch.status || ''}
                                                        onChangeValue={(value) => { onChangeValue('status', value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={LIST_PACKAGE_SELL}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeValue('package_id', value) }}
                                                    />
                                                </div>
                                            </div>

                                            {user && user.type == 1 && (
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <SelectForm
                                                            optionData={[{ n: 'Tất cả', v: 0 }, { n: 'Admin tạo', v: 1 }, { n: 'NPP tạo', v: 2 }]}
                                                            keyString="v"
                                                            labelString="n"
                                                            placeholder="Loại đơn"
                                                            value={dataSearch.type_sell || ''}
                                                            onChangeValue={(value) => { onChangeValue('type_sell', value) }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {dataSearch && dataSearch.type_sell == 2 ?
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <InputForm
                                                            type="text"
                                                            placeholder="Email nhà phân phối bán"
                                                            value={dataSearch.email_distri_sale || ''}
                                                            onChangeValue={(value) => { onChangeValue('email_distri_sale', value) }}
                                                        />
                                                    </div>
                                                </div> : null
                                            }
                                            {user && user.type == 1 && (
                                                <>
                                                    {dataSearch && dataSearch.type_sell != 2 ?
                                                        <div className='form-group col-md-2 margin-bottom-zero'></div> : null
                                                    }
                                                    <div className='form-group col-md-3 margin-bottom-zero'>
                                                    </div>
                                                    <div className='form-group col-md-3 margin-bottom-zero'>
                                                        <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                            <ButtonLoading className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv"
                                                                onClick={handleSearchOrder} style={{ marginLeft: 10, marginTop: 3 }} loading={isLoadSearch}>
                                                                <span>Tìm kiếm</span>
                                                            </ButtonLoading>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {user && user.type != 1 && (
                                                <>
                                                    <div className='form-group col-md-7 margin-bottom-zero'>
                                                    </div>
                                                    <div className='form-group col-md-3 margin-bottom-zero'>
                                                        <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                            <ButtonLoading className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv"
                                                                onClick={handleSearchOrder} style={{ marginLeft: 10, marginTop: 3 }} loading={isLoadSearch}>
                                                                <span>Tìm kiếm</span>
                                                            </ButtonLoading>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <ButtonLoading loading={isLoadExcel} onClick={(e) => exportExelOrder(e)} className="btn btn-success btn-bold btn-sm btn-icon-h kt-margin-l-10 " >
                                                        <span className="flaticon2-calendar-9" style={{ marginRight: '5px', marginTop: '-2px' }}></span> Xuất Excel
                                                    </ButtonLoading>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <>
                                        <Table className={classes1.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Gói</TableCell>
                                                    <TableCell>Mã đơn hàng</TableCell>
                                                    {user && user.type == 1 && (
                                                        <TableCell>Nhà phân phối bán</TableCell>
                                                    )}
                                                    <TableCell>Nhà phân phối mua</TableCell>
                                                    <TableCell>Tổng tiền</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell>Ngày tạo</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows && rows.length ? rows.map((row, key) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell className="textindiv">
                                                            {renderPackage(row.productData)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.code}
                                                        </TableCell>
                                                        {user && user.type == 1 && (
                                                            <TableCell>
                                                                {renderInfoDistributorSell(row)}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>{renderInfoDistributor(row)}</TableCell>
                                                        <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                        <TableCell className="textindiv">{renderStatusText(row)}</TableCell>
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
                                        </Table>
                                        {total > rowsPerPage && (
                                            <div className="customSelector custom-svg">
                                                <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                            </div>
                                        )}
                                    </>}
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
                                                <td className="fontBold">Nhà phân phối mua</td>
                                                <td>{orderView.distributorBuy.email}</td>
                                            </tr>

                                            {/* <tr>
                                                <td className="fontBold">Email khách hàng</td>
                                                <td>{orderView.customer.email}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">SĐT</td>
                                                <td>{orderView.customer.mobile}</td>
                                            </tr> */}

                                            <tr>
                                                <td className="fontBold">Gói</td>
                                                <td>
                                                    {renderPackage(orderView.productData)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tổng tiền key</td>
                                                <td>{formatMoney(orderView.origin_price)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Chiết khấu</td>
                                                <td>{orderView.discount}%</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tổng tiền đơn hàng</td>
                                                <td>{formatMoney(orderView.total_price)}</td>
                                            </tr>

                                            {/* <tr>
                                                <td className="fontBold">{t('cart.discount')}</td>
                                                <td>{cart.wholesale}</td>
                                            </tr> */}

                                            {/* <tr>
                                                <td className="fontBold">Số lượng</td>
                                                <td>{this._formatDataTotalKey(cart.totalkey)}</td>
                                            </tr> */}

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
                                            {/* {( orderView.distributor && cart.distributerid != users.distributerid) ? (
                                                <tr>
                                                    <td className="fontBold">Nhà phân phối</td>
                                                    <td>
                                                        <span className="position-left">{cart.distributer.name}</span>
                                                        <a href="#" className="label label-info marginR5" onClick={this.showInfoDistributer.bind(this, cart.distributerid)}><span className="icon-info22 position-left"></span>{t('button.detail')}</a>
                                                        <a href="#" className="label label-info" onClick={this.showCartOfDistributer.bind(this, cart.distributerid)}><span className="icon-three-bars position-left"></span>{t('button.view_cart')}</a>
                                                    </td>
                                                </tr>
                                            ) : ''} */}

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
                                <InputForm
                                    type="text"
                                    placeholder="Tìm kiếm theo key"
                                    value={showKey.keys || ''}
                                    onChangeValue={(value) => { setShowKey({ visible: true, keys: value }) }}
                                />
                                <br />
                                {showKey && orderKey.length && (
                                    <table className="table table-striped table-bordered">
                                        <tbody>
                                            {orderKey.map(itemKey => {
                                                return (
                                                    <tr key={itemKey.package_id}>
                                                        <td className="fontBold text-center">
                                                            <PackageLabel packageData={{ id: itemKey.package_id, name: DATA_PACKAGE[itemKey.package_id] + ' (' + itemKey.dataKey.length + ' key)' }} />
                                                        </td>
                                                        <td>
                                                            {itemKey.dataKey.map(it => {
                                                                if (!showKey.keys || it.license_key.toLowerCase().includes(showKey.keys.toLowerCase())) {
                                                                    return <p style={{ fontSize: '14px' }}>{it.license_key}</p>
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
                                <ButtonLoading type="default" onClick={() => hideModalCancel()} className="btn btn-label-secondary btn-secondary">
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
                                            <td className="fontBold">Nhà phân phối mua</td>
                                            <td>{dataCancel.order.distributorBuy ? dataCancel.order.distributorBuy.email : ''}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Tổng tiền</td>
                                            <td>{formatMoney(dataCancel.order.total_price)}</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                            <h4 className="fontBold">Nhập lý do huỷ đơn hàng</h4>
                            <InputForm
                                type="text"
                                placeholder=""
                                value={dataCancel.reason || ''}
                                onChangeValue={(value) => { onChangeValueCancel('reason', value) }}
                            />
                        </Modal>

                        <Modal
                            title='Xác nhận thanh toán đơn hàng'
                            visible={dataConfirm.show}
                            onOk={handleConfirmPayment}
                            onCancel={hideConfirm}
                            footer={[
                                <ButtonLoading type="default" onClick={() => hideConfirm()} className="btn btn-label-secondary btn-secondary">
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
                                            <td>{dataConfirm.order.code}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Nhà phân phối mua</td>
                                            <td>{dataConfirm.order.distributorBuy ? dataConfirm.order.distributorBuy.email : ''}</td>
                                        </tr>
                                        <tr>
                                            <td className="fontBold">Tổng tiền</td>
                                            <td>{formatMoney(dataConfirm.order.total_price)}</td>
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
                        {/* <CopyToClipboard ref={copyRef} style={{ marginBottom: '10px', display: 'none' }} text={`${emailContent}`}
                            onCopy={() => {
                                setState({ copied: true })
                                showSuccessMessageIcon('Copy link!')
                            }}>
                            <div className="border box-icon rounded border-left-0" >
                                <i className='far fa-clone customIconCopy'></i>
                            </div>
                        </CopyToClipboard> */}
                    </div>
                </div>
            </div >

        </>
    );
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(WholeSaleOrder);