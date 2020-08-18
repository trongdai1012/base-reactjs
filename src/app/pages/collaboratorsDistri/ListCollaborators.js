/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { connect } from "react-redux";
import { formatMoney } from '../../libs/money';
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
import { InfoCircleOutlined } from '@ant-design/icons';
import { Pagination, Button } from "antd";
import { Form } from "react-bootstrap";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { Link } from "react-router-dom";
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

const ListCollaborators = (props) => {
    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(true);
    const [dataOrderChart, setDataOrderChart] = useState({});
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListCollab: 'get-collaborators'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListCollab);
        if (check == 1) {
            searchDistributor({ page: 1, limit: rowsPerPage });
            getOrder();
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const enableLoadSearch = () => {
        setLoadSearch(true);
    };

    const disableLoadSearch = () => {
        setLoadSearch(false);
    };

    const searchDistributor = (dataSearch = {}) => {
        setLoading(true);
        enableLoadSearch();
        makeRequest('get', `collaborators/search`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const { rows, total } = data.data;
                    setRow(rows);
                    setTotal(total);
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
    const getOrder = (date) => {
        setLoadSearch(true);
        makeRequest('get', `collaborators/getReportOrderDetail`)
            .then(({ data }) => {
                if (data.signal) {
                    console.log('data', data)
                    setDataOrderChart(data.data)
                }
                setLoadSearch(false);
            })
            .catch(err => {
                setLoadSearch(false);
                console.log(err)
            })
    }
    const renderAction = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="ant-btn button-center-item ant-btn-primary ant-btn-sm" size="small" icon={<InfoCircleOutlined />}>
                        <span><Link style={{ color: '#FFF' }} to={`/collaborators/detail/${row}`}>Chi tiết</Link></span>
                    </Button>
                </div>
            </>
        )
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

    return (
        <>


            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>

                                <div className="col-lg-12">
                                    <div className="kt-widget14">
                                        <div className="row">
                                            <div className="col-lg-3">
                                                <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                                    <div className="card-body">
                                                        <i className="flaticon2-analytics-2 text-white icon-2x"> </i>
                                                        <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{formatMoney(dataOrderChart.totalRevenue)}</div>
                                                        <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Tổng doanh thu</a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3">
                                                <div className="card card-custom bg-warning gutter-b" style={{ height: '150px' }}>
                                                    <div className="card-body">
                                                        <i className="flaticon2-shopping-cart-1 text-white icon-2x"> </i>
                                                        <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{formatMoney(dataOrderChart.totalCommission) || 0}</div>
                                                        <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Tổng hoa hồng phải trả</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tên CTV"
                                                        value={dataSearch.name || ''}
                                                        onChange={(value) => { onChangeValue('name', value.target.value) }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Mã CTV"
                                                        value={dataSearch.code || ''}
                                                        onChange={(value) => { onChangeValue('code', value.target.value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
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
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Số điện thoại CTV"
                                                        value={dataSearch.mobile || ''}
                                                        onChange={(value) => { onChangeValue('mobile', value.target.value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading type="submit" disabled={isLoadSearch === true ? true : false}
                                                        className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10"
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
                                                <TableCell>Họ tên</TableCell>
                                                <TableCell>Mã CTV</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Số điện thoại</TableCell>
                                                <TableCell>Chi tiết</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`list-collab-${row.id}`}>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.code}</TableCell>
                                                    <TableCell>{row.email}</TableCell>
                                                    <TableCell>{row.mobile}</TableCell>
                                                    <TableCell>
                                                        {renderAction(row.id)}
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
                                        <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(ListCollaborators);