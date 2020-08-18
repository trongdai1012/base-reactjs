import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
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
import { formatTime } from '../../libs/time';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { Pagination } from 'antd';
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

export default function CustomerInvited() {

    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getCustomInvited: 'collab-permission'
    }


    useEffect(() => {
        let check = checkPermission(permissions.getCustomInvited);
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

    const searchCustomer = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `collaborators/getcustomer`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    setRow(data.data.rows);
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
        searchCustomer({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

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
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email"
                                                        value={dataSearch.email || ''}
                                                        onChange={(value) => { onChangeSearchValue('email', value.target.value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <ButtonLoading loading={isLoading} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></ButtonLoading>
                                                    <ButtonLoading loading={isLoading} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={handleSearchCustomer} style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
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
                                                <TableCell style={{ width: 150 }}>Thời gian tạo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.length ? rows.map((row, key) => (
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
                                                        {formatTime(row.customer.createdAt)}
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