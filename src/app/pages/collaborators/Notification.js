/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { showErrorMessage } from '../../actions/notification';
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
import { Modal, Pagination, Button } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import { connect } from "react-redux";
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

const NoticationCollab = (props) => {

    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [notifyDetail, setNotifyDetail] = useState({ visible: false });
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [page, setPage] = useState(1);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getCollabNotify: 'collab-permission'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getCollabNotify);
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
        makeRequest('get', `collabnotify/getAll`, dataSearch)
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
                console.log(err);
            })
    }

    const getNotifyDetail = (id) => {
        makeRequest('get', `collabnotify/getById?id=${id}`)
            .then(({ data }) => {
                if (data.signal) {
                    setNotifyDetail(data.data);
                } else {
                    return showErrorMessage('Không lấy được chi tiết thông báo');
                }
            })
            .catch(err => {
                console.log(err)
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

    const renderAction = (id) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => onClickShowModalDetail(id)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
            </>
        )
    }

    const convertDateTime = (date) => {
        let dataConvert = new Date(date).toLocaleDateString();

        return dataConvert;
    }

    const onClickShowModalDetail = (id) => {
        setShowModalDetail(true)

        getNotifyDetail(id);
    }

    const onClickHideModalDetail = () => {
        setShowModalDetail(false);
        setNotifyDetail(null);
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
                                                        value={dataSearch.title || ''}
                                                        onChangeValue={(value) => { onChangeValue('title', value) }}
                                                        focus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                    <ButtonLoading type="submit" loading={isLoadSearch} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10"
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
                                                    <TableCell>Tiêu đề</TableCell>
                                                    <TableCell>Người nhận</TableCell>
                                                    <TableCell>Ngày bắt đầu</TableCell>
                                                    <TableCell>Ngày kết thúc</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.length ? rows.map((row, key) => (
                                                    <TableRow key={`notify-${row.id}`}>
                                                        <TableCell>
                                                            {row.title.length > 62 ? row.title.slice(0, 62) + '...' : row.title}
                                                        </TableCell>
                                                        <TableCell>
                                                            Cộng tác viên
                                                        </TableCell>
                                                        <TableCell>{row.startDate ? convertDateTime(row.startDate) : null}</TableCell>
                                                        <TableCell>{row.endDate ? convertDateTime(row.endDate) : null}</TableCell>
                                                        <TableCell>
                                                            {renderAction(row.id)}
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
                            title='Chi tiết thông báo'
                            visible={showModalDetail}
                            onCancel={() => onClickHideModalDetail()}
                            footer={[
                                <Button type="primary" onClick={() => onClickHideModalDetail()}>
                                    OK
                                </Button>
                            ]}
                            width='900px'
                        >
                            <div className="modal-header d-flex justify-content-center">
                                <h5 className="heading text-h5">{notifyDetail ? notifyDetail.title : null}</h5>
                            </div>
                            <div>
                                <div>
                                    <div className="modal-dialog modal-notify modal-info" role="document">
                                        <div className="modal-content text-center">
                                            <div className="modal-body">
                                                <i className="fas fa-bell fa-4x animated rotateIn mb-4" />
                                                <p>{notifyDetail ? notifyDetail.content : null}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

export default connect(mapStateToProps, null)(NoticationCollab);