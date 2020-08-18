/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { connect } from "react-redux";
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
import { Form, Col } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { DATA_PACKAGE, TYPE_PAYMENT } from '../../config/product';
import { InfoCircleOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { formatMoney } from "../../libs/money";
import PackageLabel from '../../partials/common/PackageLabel';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';

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

const ListOrderDistri = (props) => {
    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [dataDelete, setDataDelete] = useState({ visible: false });
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(true);
    const [introView, setIntroView] = useState('');
    const [showKey, setShowKey] = useState({ visible: false });
    const [orderKey, setOrderKey] = useState([]);
    const [dataCancel, setDataCancel] = useState({ show: false, order: {}, reason: '' });
    const [isLoadCancel, setLoadCancel] = useState(false);
    const [dataConfirm, setDataConfirm] = useState({ show: false, order: {}, type_payment: TYPE_PAYMENT[0].n });
    const [isLoadConfirm, setLoadingConfirm] = useState(false);
    const [freePackage, setFreePackage] = useState(0);
    const { user } = props;

    const enableLoadSearch = () => {
        setLoadSearch(true);
    };

    const disableLoadSearch = () => {
        setLoadSearch(false);
    };

    function itemRender(current, type, originalElement) {

        return originalElement;
    }
    useEffect(() => {
        searchDistributor({ page: 1, limit: rowsPerPage });
    }, []);

    const searchDistributor = (dataSearch = {}) => {
        setLoading(true);
        enableLoadSearch();
        makeRequest('get', `order/getOrderIntro`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const { rows, count } = data.data;
                    setRow(rows);
                    setTotal(count);
                }
                setLoading(false);
                disableLoadSearch();
            })
            .catch(err => {
                setLoading(false);
                disableLoadSearch();
                console.log(err);
            })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchDistributor({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const onChangeValue = (key, value) => {
        setData({
            ...dataSearch,
            [key]: value
        })
    }

    const clickModalCancel = () => {
        setDataDelete({
            ...dataDelete,
            visible: false,
            idDel: 0
        })
    }

    const clickModalOk = () => {
        let idDel = dataDelete.idDel;
    }

    const unfilteredData = (e) => {
        setData({
        });
        setPage(1);
        searchDistributor({ page: 1, limit: rowsPerPage });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        searchDistributor({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const renderLevel = (level) => {
        if (level == 1) {
            return <span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Kim cương</span>
        } else if (level == 2) {
            return <span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Hồng Ngọc</span>
        } else {
            return <span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Vàng</span>
        }
    }

    const renderInfoDistributor = (presentee) => {
        if (!presentee) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {presentee.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{presentee.email}</span>
                </div>
                {(presentee.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{presentee.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const renderStatusText = (order) => {
        if (order.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã xác nhận</span>);
        } else if (order.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa xác nhận</span>);
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
                {(row.status == 0 && user && ((user.type == 1 && !row.distributor_id) || user.distributor_id == row.distributor_id)) && (
                    <>
                        <div className="mg-b5">
                            <Button type="primary" className="button-center-item" size="small" onClick={() => showConfirmPayment(row, row.distributorBuy)} icon={<CheckOutlined />}>
                                Xác nhận thanh toán
                            </Button>
                        </div>
                        <div>
                            <Button type="danger" className="button-center-item" size="small" onClick={() => showCancelOrder(row, row.distributorBuy)} icon={<DeleteOutlined />}>
                                Huỷ bỏ
                            </Button>
                        </div>
                    </>
                )}
            </>
        )
    }

    const showViewOrder = (intro) => {
        setIntroView(intro);
        if (intro.status == 1) {
            getOrderKey(intro.code);
        } else {
            setOrderKey([]);
        }
    }

    const getOrderKey = (code) => {
        makeRequest('get', `order/getOrderKey/${code}`, {})
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

    const showConfirmPayment = (order, distributorBuy) => {
        order.distributor_buy_email = distributorBuy.email
        setDataConfirm({
            show: true,
            order,
            type_payment: TYPE_PAYMENT[0].n
        })
    }

    const showCancelOrder = (order, distributorBuy) => {
        order.distributor_buy_email = distributorBuy.email
        setDataCancel({
            show: true,
            order,
            reason: ''
        })
    }

    const renderPackage = (packageList) => {
        if (!packageList) return '';
        return packageList.map(it => {
            let name = `${DATA_PACKAGE[it.package_id]} (${it.quantity} key)`;
            return <PackageLabel packageData={{ id: it.package_id, name }} key={it.id} />
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
                    setDataCancel({
                        ...dataCancel,
                        show: false,
                        reason: ''
                    });

                    showSuccessMessageIcon('Huỷ đơn hàng thành công');
                    setPage(1);
                    searchDistributor({ page: 1, limit: rowsPerPage });

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

    const onChangeValueCancel = (key, value) => {
        setDataCancel({
            ...dataCancel,
            [key]: value
        })
    }

    const handleConfirmPayment = () => {
        setLoadingConfirm(true);
        makeRequest('post', `order/confirmPayment`, { order_id: dataConfirm.order.id, type_payment: dataConfirm.type_payment, type_confirm: 1, freePackage })
            .then(({ data }) => {
                setDataConfirm({
                    ...dataConfirm,
                    show: false
                });

                if (data.signal) {
                    showSuccessMessageIcon('Xác nhận thanh toán thành công');
                    setPage(1);
                    searchDistributor({ page: 1, limit: rowsPerPage });
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

    const hideConfirm = () => {
        setDataConfirm({
            show: false,
            order: {},
            type_payment: TYPE_PAYMENT[0].n

        })
        setFreePackage('');
    }

    const onChangeValueConfirm = (key, value) => {
        setDataConfirm({
            ...dataConfirm,
            [key]: value
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
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email nhà phân phối"
                                                        value={dataSearch.presentee_email || ''}
                                                        onChange={(value) => { onChangeValue('presentee_email', value.target.value) }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            {user.distributor_id === 0 &&
                                                <div className='form-group col-md-2'>
                                                    <div className="form-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Email NPP giới thiệu"
                                                            value={dataSearch.presenter_email || ''}
                                                            onChange={(value) => { onChangeValue('presenter_email', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>}

                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <SelectForm
                                                        optionData={[{ n: 'Chưa xác nhận', v: 0 }, { n: 'Đã xác nhận', v: 1 }, { n: 'Bị huỷ', v: 2 }]}
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
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading type="submit" disabled={isLoadSearch === true ? true : false}
                                                        className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv"
                                                        loading={isLoadSearch} style={{ marginLeft: 10, marginTop: 3 }}><span>Tìm kiếm</span></ButtonLoading>
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
                                                <TableCell>Cấp</TableCell>
                                                {user && user.distributor_id === 0 &&
                                                    <TableCell>Giới thiệu bởi</TableCell>
                                                }
                                                <TableCell>Tổng tiền thanh toán</TableCell>
                                                <TableCell>Hoa hồng giới thiệu</TableCell>

                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`list-distri-${row.id}`}>
                                                    <TableCell>{renderInfoDistributor(row.distributorBuy)}</TableCell>
                                                    <TableCell className="textindiv">{renderLevel(row.distributorBuy.level)}</TableCell>
                                                    {user && user.distributor_id === 0 &&
                                                        <TableCell>{renderInfoDistributor(row.distributorBuy.presenter)}</TableCell>
                                                    }
                                                    
                                                    <TableCell>{formatMoney(row.total_price)} VNĐ</TableCell>
                                                
                                                    <TableCell>{formatMoney(row.total_price * row.commission_percent / 100)} VNĐ</TableCell>
                                                    
                                                    <TableCell className="textindiv">{renderStatusText(row)}</TableCell>
                                                    <TableCell>
                                                        {renderAction(row)}
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                    </TableRow>
                                                )}
                                        </TableBody>
                                    </Table>}
                                {total > rowsPerPage && (
                                    <div className="customSelector custom-svg">
                                        <Pagination itemRender={itemRender} className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}

                            </Paper>
                        </div>
                        <Modal
                            title='Chi tiết đơn hàng'
                            visible={introView && !showKey.visible ? true : false}
                            onOk={() => setIntroView('')}
                            onCancel={() => setIntroView('')}
                            footer={[
                                <Button type="primary" onClick={() => setIntroView('')}>
                                    OK
                                </Button>
                            ]}
                        >
                            <div className="form-group">
                                {introView && (
                                    <table className="table table-striped table-bordered">
                                        <tbody>
                                            <tr>
                                                <td className="fontBold">Nhà phân phối</td>
                                                <td>{renderInfoDistributor(introView.distributorBuy)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fontBold">Giới thiệu bởi</td>
                                                <td>{renderInfoDistributor(introView.distributorBuy.presenter)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fontBold">Mã đơn hàng</td>
                                                <td>{introView.code}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Gói</td>
                                                <td>
                                                    {renderPackage(introView.productData)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tổng tiền đơn hàng</td>
                                                <td>{formatMoney(introView.origin_price)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Chiết khấu</td>
                                                <td>{introView.discount}%</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Tổng tiền thực trả</td>
                                                <td>{formatMoney(introView.total_price)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Hoa hồng giới thiệu</td>
                                                <td>{formatMoney((introView.total_price * introView.commission_percent) / 100)} VNĐ</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold">Thời gian</td>
                                                <td>{formatTime(introView.createdAt)}</td>
                                            </tr>
                                            <tr>
                                                <td className="fontBold">Trạng thái</td>
                                                <td>
                                                    {renderStatusText(introView)}
                                                </td>
                                            </tr>

                                            {(introView.status == 1 || introView.status == 2) ? (
                                                <tr>
                                                    <td className="fontBold">{introView.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                                    <td>{introView.note_pay}</td>
                                                </tr>
                                            ) : ''}

                                            {(user && !user.distributor_id && introView.status == 1) ? (
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
                            title={`Chi tiết key đơn hàng ${introView && introView.order_condition ? introView.code : ''}`}
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
                                                                    return <p style={{fontSize: '14px'}}>{it.license_key}</p>
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
                                    Đóng
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
                                            <td>{dataCancel.order.distributor_buy_email}</td>
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
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={handleConfirmPayment} loading={isLoadConfirm}>
                                    <span>Xác nhận thanh toán</span>
                                </ButtonLoading>
                            ]}
                        >
                            {dataConfirm ?
                                <>
                                    <div className="form-group">
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <td className="fontBold" style={{ width: "200px" }}>Mã đơn hàng</td>
                                                    <td>{dataConfirm.order.code}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fontBold">Nhà phân phối mua</td>
                                                    <td>{dataConfirm.order.distributor_buy_email}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fontBold">Tổng tiền</td>
                                                    <td>{formatMoney(dataConfirm.order.total_price)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <Form.Row>
                                        <h5 className="card-title align-items-start flex-column">
                                            <span className="card-label font-weight-bolder text-dark">
                                                Số lượng key Free 1 Tháng tặng
                                            </span>
                                        </h5>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={12}>
                                            <Form.Control
                                                type="number"
                                                placeholder=""
                                                value={freePackage || ''}
                                                onChange={(value) => { setFreePackage(value.target.value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <h4 className="fontBold">Chọn phương thức thanh toán</h4>
                                    <SelectForm
                                        optionData={TYPE_PAYMENT}
                                        keyString="n"
                                        labelString="n"
                                        placeholder=""
                                        value={dataConfirm.type_payment || ''}
                                        onChangeValue={(value) => { onChangeValueConfirm('type_payment', value) }}
                                    />
                                </> : null}
                        </Modal>
                    </div>
                </div>
            </div>
        </>
    );
}


const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(ListOrderDistri);