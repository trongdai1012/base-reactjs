import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
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

import { Form } from "react-bootstrap";
import { Modal, Button, Pagination } from "antd";
import { DATA_PACKAGE, LIST_PACKAGE_ALL } from '../../config/product';
import PackageLabel from '../../partials/common/PackageLabel';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatMoney } from '../../libs/money';
import { formatTime } from '../../libs/time';
import OrderStatus from '../../partials/common/OrderStatus';
import Loading from "../loading";
import ButtonLoading from "../../partials/common/ButtonLoading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

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

const ListCustomer = (props) => {

    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [detailCus, setDetailCus] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListCustomer: 'get-customer'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListCustomer);
        if (check == 1) {
            searchCustomer({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const onChangeSearchValue = (key, value) => {
        setData({
            ...dataSearch,
            [key]: value
        })
    }

    const handleSearchCustomer = (e) => {
        e.preventDefault();
        searchCustomer(dataSearch);
    }

    const unfilteredData = (e) => {
        setData({});
        searchCustomer({ page: 1, limit: rowsPerPage });
    }

    const makeid = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const renderPackage = (packageList) => {

        let listPackage = [];

        const count1M = packageList.filter(it => it.package_id === 1).length;
        if (count1M > 0) listPackage.push({ package_id: 1, total: count1M, id: makeid(4) });
        const count3M = packageList.filter(it => it.package_id === 2).length;
        if (count3M > 0) listPackage.push({ package_id: 2, total: count3M, id: makeid(4) });
        const count1Y = packageList.filter(it => it.package_id === 3).length;
        if (count1Y > 0) listPackage.push({ package_id: 3, total: count1Y, id: makeid(4) });
        const countNY = packageList.filter(it => it.package_id === 4).length;
        if (countNY > 0) listPackage.push({ package_id: 4, total: countNY, id: makeid(4) });

        if (!listPackage) return '';
        return listPackage.map(it => {
            let name = `${DATA_PACKAGE[it.package_id]} - ${it.total}`;
            return <PackageLabel packageData={{ id: it.package_id, name }} key={`package-id-${it.id}`} />
        })
    }

    const searchCustomer = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `customer/allCustomer`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    setRow(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })
    }

    const showModalInfo = (row) => {
        setDetailCus(row);
        setShowModal(true);
    }

    let { customer, order } = detailCus;
    customer = customer || {};
    order = order || [];

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSearchCustomer}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='row'>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >

                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tên"
                                                        value={dataSearch.name || ''}
                                                        onChange={(value) => { onChangeSearchValue('name', value.target.value) }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Email"
                                                        value={dataSearch.email || ''}
                                                        onChangeValue={(value) => { onChangeSearchValue('email', value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={LIST_PACKAGE_ALL}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeSearchValue('package_id', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="textindiv btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading className="textindiv btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={handleSearchCustomer}
                                                        loading={isLoading} style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <Table className={classes1.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Tên khách hàng</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Số điện thoại</TableCell>
                                                <TableCell>Gói đã mua</TableCell>
                                                <TableCell style={{ width: 150 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`customer-id-${key}`}>
                                                    <TableCell>
                                                        {row.customer.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.customer.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.customer.mobile}
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderPackage(row.package)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <Button className="button-center-item" type="primary" size="small" onClick={() => showModalInfo(row)} icon={<InfoCircleOutlined />}>
                                                                Chi tiết
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                    </TableRow>
                                                )}
                                        </TableBody>
                                    </Table>}
                            </Paper>
                        </div>
                        <Modal
                            title='Thông tin khách hàng'
                            visible={showModal}
                            onOk={() => setShowModal(false)}
                            onCancel={() => setShowModal(false)}
                            footer={[
                                <Button type="primary" onClick={() => setShowModal(false)}>
                                    OK
                                </Button>
                            ]}
                            width={900}
                        >
                            <div className="modal-body">
                                <div className="form-group">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-6 col-md-9 col-lg-9">
                                            <h4 className="marginT0 text-primary">Họ tên: {customer.name}</h4>
                                            <p>
                                                <span className="icon-envelop2 position-left" />Địa chỉ email: {customer.email}
                                            </p>
                                            <p>
                                                <span className="icon-mobile position-left" />Số điện thoại: {customer.mobile}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <br />
                                <h4 className="marginT0">ĐƠN HÀNG</h4>
                                <div className="form-group">
                                    <table className="table table-striped table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th className="fontBold">Gói</th>
                                                <th className="fontBold">Mã đơn hàng</th>
                                                <th className="fontBold">Tổng tiền</th>
                                                <th className="fontBold noWrap">Thời gian</th>
                                                <th className="fontBold noWrap">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.map(item => {
                                                return <tr key={`order-id-${item.id}`}>
                                                    <td className="text-center">
                                                        {item.productData[0] && (
                                                            <PackageLabel packageData={{ id: item.productData[0].package_id, name: DATA_PACKAGE[item.productData[0].package_id] }} />
                                                        )}
                                                    </td>
                                                    <td className="text-center">{item.code}</td>
                                                    <td className="text-center">{formatMoney(item.total_price)}</td>
                                                    <td className="text-center">{formatTime(item.createdAt)}</td>
                                                    <td className="noWrap text-center">
                                                        <OrderStatus status={item.status} />
                                                    </td>
                                                </tr>
                                            })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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

export default connect(mapStateToProps, null)(ListCustomer);