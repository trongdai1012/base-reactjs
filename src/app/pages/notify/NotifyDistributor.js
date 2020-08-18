/* eslint-disable no-restricted-imports */
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
    TableBody,
} from "@material-ui/core";
import { Pagination, Button } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import moment from 'moment';
import { showSuccessMessageIcon, showErrorMessage } from "../../actions/notification";
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

const TYPE_REDIRECT = {
    1: '/exchange-key',
    2: '/order/list-wholeSale',
    3: '/distributor/list',
    4: '/order/wholeBuySale',
    5: '/order/list-wholeSale',
    6: '/order/list-single',
    7: '/keyManage'
}

const NotifyDistributor = (props) => {

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
        getDistriNotify: 'get-distri-notify'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getDistriNotify);
        if (check == 1) {
            searchNotify({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const searchNotify = (dataSearch = {}) => {
        setLoading(true);
        setLoadSearch(true);
        makeRequest('get', `notification/SearchAllNotifyDetailDistri`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    if (res) {
                        setRow(res.rows);
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
        searchNotify({ ...dataSearch, page: newPage, limit: rowsPerPage });
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
        searchNotify({ page: 1, limit: rowsPerPage });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        searchNotify(dataSearch);
    }

    const renderAction = (key, id, status) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => onClickGoToDetail(key, id, status)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
            </>
        )
    }

    const convertDateTime = (date) => {
        let dataConvert = moment(new Date(date)).format('DD-MM-YYYY HH:mm')

        return dataConvert;
    }

    const onClickGoToDetail = (key, id, status) => {
        updateIsRead(id, status);
        window.open(TYPE_REDIRECT[key], '_blank');
    }

    const offset = rowsPerPage * (page - 1);

    const updateIsRead = (id, status) => {
        makeRequest('get', `notification/UpdateReadNotifyDetailDistri?notify_id=${id}`).then(({ data }) => {
            if (data.signal) {
                let tempRow = [...rows];
                tempRow.find(x => x.id === id).status = 1;
                setRow(tempRow);

                if (!status) return showSuccessMessageIcon('Đánh dấu đã xem');
            }
        }).catch(err => {
            return showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái');
        })
    }

    const renderStatusText = (status) => {
        if (status) return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã xem</span>);
        return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa xem</span>);
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
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Tiêu đề"
                                                        value={dataSearch.content || ''}
                                                        onChangeValue={(value) => { onChangeValue('content', value) }}
                                                        focus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading type="submit" loading={isLoadSearch} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv"
                                                        style={{ marginLeft: 10, marginTop: 3 }}><span>Tìm kiếm</span></ButtonLoading>
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
                                                    <TableCell>Số thứ tự</TableCell>
                                                    <TableCell>Tiêu đề</TableCell>
                                                    <TableCell>Người gửi</TableCell>
                                                    <TableCell>Thời gian</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.length ? rows.map((row, key) => (
                                                    <TableRow key={`notify-${row.id}`}>
                                                        <TableCell>
                                                            {offset + key + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.content.length > 62 ? row.content.slice(0, 62) + '...' : row.content}
                                                        </TableCell>
                                                        <TableCell>
                                                            Hệ thống
                                                        </TableCell>
                                                        <TableCell>{row.createdAt ? convertDateTime(row.createdAt) : null}</TableCell>
                                                        <TableCell>{renderStatusText(row.status)}</TableCell>
                                                        <TableCell>
                                                            {renderAction(row.type, row.id, row.status)}
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
                    </div>
                </div>
            </div >

        </>
    );
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(NotifyDistributor);