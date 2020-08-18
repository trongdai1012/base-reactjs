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
import { Pagination } from "antd";
import { Form } from "react-bootstrap";
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

const Potential = (props) => {
    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(true);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);
    const { user } = props;

    const permissions = {
        getPotenial: 'get-potential'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getPotenial);
        if (check == 1) {
            searchDistributor({ page: 1, limit: rowsPerPage });
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
        makeRequest('get', `distributor/searchPotential`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const { listDistriPoten, total } = data.data;
                    setRow(listDistriPoten);
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
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            {user && user.type == 1 &&
                                                <div className='form-group col-md-2'>
                                                    <div className="form-group">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Mã nhà phân phối"
                                                            value={dataSearch.code || ''}
                                                            onChange={(value) => { onChangeValue('code', value.target.value) }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>}

                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Email NPP tiềm năng"
                                                        value={dataSearch.email || ''}
                                                        onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Tên NPP tiềm năng"
                                                        value={dataSearch.name || ''}
                                                        onChange={(value) => { onChangeValue('name', value.target.value) }}
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
                                                {user && user.type == 1 &&
                                                    <TableCell>Mã NPP giới thiệu</TableCell>
                                                }
                                                <TableCell>Email NPP tiềm năng</TableCell>
                                                <TableCell>SĐT NPP tiềm năng</TableCell>
                                                <TableCell>Tên NPP tiềm năng</TableCell>
                                                <TableCell>Thời gian tạo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, key) => (
                                                <TableRow key={`list-distri-${row.id}`}>
                                                    {user && user.type == 1 &&
                                                        <TableCell>{row.code_distributor}</TableCell>
                                                    }
                                                    <TableCell>{row.email}</TableCell>


                                                    <TableCell>{row.mobile}</TableCell>

                                                    <TableCell>{row.name}</TableCell>

                                                    <TableCell className="textindiv">{formatTime(row.createdAt)}</TableCell>
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

export default connect(mapStateToProps, null)(Potential);