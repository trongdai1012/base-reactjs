import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { showSuccessMessageIcon } from '../../actions/notification';
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
import { Pagination } from "antd";
import { Form } from "react-bootstrap";
import SelectForm from '../../partials/common/SelectForm';
import { formatMoney } from '../../libs/money';
import PackageLabel from '../../partials/common/PackageLabel';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { DATA_PACKAGE, LIST_PACKAGE_SELL } from '../../config/product';
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
const ListCTV = (props) => {
    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [page, setPage] = useState(1);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListCollab: 'collab-permission'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListCollab);
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
        makeRequest('get', `collaborators/getdetail`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    if (res) {
                        setRow(res.allOrder);
                        setTotal(res.total);
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

    const renderStatusText = (category) => {
        if (category.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã thanh toán</span>);
        } else if (category.status == 2) {
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

    const renderInfoDistributor = (row) => {
        if (!row.distributor) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {row.distributor.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{row.distributor.email}</span>
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
                                                        placeholder="Mã đơn hàng"
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
                                                        placeholder="Email khách"
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
                                            <div className='form-group col-md-2'>
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
                                                <TableCell>Tổng tiền</TableCell>
                                                <TableCell>Hoa hồng</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                                <TableCell>Ngày tạo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.length ? rows.map((row, key) => (
                                                <TableRow key={`ctv-${key}`}>
                                                    <TableCell className="textindiv">
                                                        {renderPackage(row.order.productData)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.order.code}
                                                    </TableCell>
                                                    <TableCell>{renderInfoCustomer(row)}</TableCell>
                                                    <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                    <TableCell>{formatMoney(0.25 * row.origin_price)}</TableCell>
                                                    <TableCell className="textindiv">{renderStatusText(row.order)}</TableCell>
                                                    <TableCell>{formatTime(row.createdAt)}</TableCell>
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


                    </div>


                </div>
            </div>

        </>
    )
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(ListCTV);