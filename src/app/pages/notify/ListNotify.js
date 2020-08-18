/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import moment from 'moment';
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
    TableBody,
    Radio,
    FormControlLabel
} from "@material-ui/core";
import { Modal, Pagination, Button, DatePicker } from "antd";
import { InfoCircleOutlined, EditOutlined, DeleteOutlined, } from '@ant-design/icons';
import { Form, Col, Card } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { LIST_LEVEL, DISTRIBUTOR_LEVEL } from '../../config/notify';
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

const ListNotify = (props) => {

    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [notifyDetail, setNotifyDetail] = useState({ visible: false });
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [total, setTotal] = useState(0);
    const [deleteID, setDeleteID] = useState(0);
    const [dataUpdate, setDataUpdate] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const [isLoadUpdate, setLoadUpdate] = useState(false);
    const [isLoadDelete, setLoadDelete] = useState(false);
    const [page, setPage] = useState(1);
    const dateFormat = 'DD/MM/YYYY HH:mm';
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getListNotify: 'get-notify'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getListNotify);
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
        makeRequest('get', `notification/getallnotification`, dataSearch)
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

    const getNotifyDetail = (id) => {
        makeRequest('get', `notification/getnotificationbyid?id=${id}`)
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

    const renderStatusText = (category) => {
        if (category == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Hiển thị</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Không hiển thị</span>);
        }
    }

    const renderAction = (id) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => onClickShowModalDetail(id)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
                <div className="mg-b5">
                    <Button type="danger" className="button-center-item" size="small" onClick={() => onClickShowModalDelete(id)} icon={<DeleteOutlined />}>
                        Xóa
                    </Button>
                </div>
                <div className="mg-b5">
                    <Button className="bg-success text-white button-center-item" size="small" onClick={() => onClickShowModalUpdate(id)} icon={<EditOutlined />}>
                        Cập nhật
                    </Button>
                </div>
            </>
        )
    }

    const renderLevel = (level) => {
        if (level == 0) {
            return 'Tất cả';
        } else {
            return 'Cấp ' + level;
        }
    }

    const onChangeStartDate = (date) => {
        if (date) {
            date._d.setHours(0, 0, 0, 0);
            let dateConvert = new Date(date).toUTCString();
            setData({
                ...dataSearch,
                startDate: dateConvert
            });
        } else {
            setData({
                ...dataSearch,
                startDate: ''
            });
        }
    }

    const onChangeEndDate = (date) => {
        if (date) {
            date._d.setHours(23, 59, 59, 0);
            let dateConvert = new Date(date).toUTCString();
            setData({
                ...dataSearch,
                endDate: dateConvert
            });
        } else {
            setData({
                ...dataSearch,
                endDate: ''
            });
        }
    }

    const convertDateTime = (date) => {
        let dataConvert = moment(new Date(date)).format('DD/MM/YYYY HH:mm');

        return dataConvert;
    }

    const onClickShowModalDetail = (id) => {
        setShowModalDetail(true)

        getNotifyDetail(id);
    }

    const onClickHideModalDetail = () => {
        setShowModalDetail(false)

        setDeleteID(0);
    }

    const onClickShowModalDelete = (id) => {
        setShowModalDelete(true);

        setDeleteID(id);
    }

    const onClickShowModalUpdate = (id) => {
        setShowModalUpdate(true);
        getNotifyUpdate(id);
    }

    const onClickHideModalDelete = () => {
        setShowModalDelete(false)

        setDeleteID(0);
    }

    const onClickHideModalUpdate = () => {
        setShowModalUpdate(false)

        setDataUpdate(null);
    }

    const deleteNotify = () => {
        if (deleteID != 0) {
            setLoadDelete(true);
            makeRequest('get', `notification/deletenotification?id=${deleteID}`).then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon("Xóa thông báo thành công");
                    searchNotify({ page: 1, limit: rowsPerPage });
                } else {
                    showErrorMessage("Xóa thông báo thất bại, Vui lòng kiểm tra lại thông báo có tồn tại hay không.");
                }
                setLoadDelete(false);
                onClickHideModalDelete();
            }).catch(err => {
                setLoadDelete(false);
                onClickHideModalDelete();
                console.log(err)
            })
        }
    }

    const getNotifyUpdate = (id) => {
        makeRequest('get', `notification/getnotificationbyid?id=${id}`).then(({ data }) => {
            if (data.signal) {
                setDataUpdate(data.data);
            } else {
                showErrorMessage("Không tồn tại thông báo");
            }
        })
    }

    const onChangeValueUpdate = (key, value) => {
        if (key != 'id') {
            setDataUpdate({
                ...dataUpdate,
                [key]: value
            })
        }
    }

    const onChangeStartDateUpdate = (date) => {
        if (new Date(dataUpdate.endDate) && new Date(dataUpdate.endDate) < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataUpdate({
            ...dataUpdate,
            startDate: date
        });
    }

    const onChangeEndDateUpdate = (date) => {
        if (new Date(dataUpdate.startDate) && new Date(dataUpdate.startDate) > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataUpdate({
            ...dataUpdate,
            endDate: date
        });
    }


    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        if (!dataUpdate.title) {
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!dataUpdate.content) {
            return showErrorMessage('Vui lòng nhập nội dung');
        }

        if (dataUpdate.is_show == null) {
            return showErrorMessage('Vui lòng chọn trạng thái hiển thị');
        }

        if (dataUpdate.startDate == null || dataUpdate.startDate == '') {
            return showErrorMessage('Vui lòng chọn ngày bắt đầu');
        }

        if (dataUpdate.endDate == null || dataUpdate.endDate == '') {
            return showErrorMessage('Vui lòng chọn ngày kết thúc');
        }
        setLoadUpdate(true);
        makeRequest('post', `notification/updatenotification`, dataUpdate)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Cập nhật thông báo thành công');
                    searchNotify({ page: 1, limit: rowsPerPage });
                } else {
                    showErrorMessage(data.message);
                }
                setLoadUpdate(false);
                onClickHideModalUpdate();
            })
            .catch(err => {
                setLoadUpdate(false);
                onClickHideModalUpdate();
                console.log('++++++++++++++++', err)
            })
    }

    return (
        <>
            <Link to="/notify/create" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo thông báo</Link>

            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>

                                        <div className='form-row margin-bottom-zero'>
                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Tiêu đề"
                                                        value={dataSearch.title || ''}
                                                        onChangeValue={(value) => { onChangeValue('title', value) }}
                                                        focus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero">
                                                    <DatePicker
                                                        showTime
                                                        format={dateFormat}
                                                        onChange={onChangeStartDate}
                                                        placeholder={'Chọn ngày bắt đầu'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.startDate ? moment(dataSearch.startDate) : ''}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                    <DatePicker
                                                        showTime
                                                        format={dateFormat}
                                                        onChange={onChangeEndDate}
                                                        placeholder={'Chọn ngày kết thúc'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.endDate ? moment(dataSearch.endDate) : ''}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero">
                                                    <SelectForm
                                                        optionData={[{ n: 'Hiển thị', v: 1 }, { n: 'Không hiển thị', v: 0 }]}
                                                        keyString="v"
                                                        labelString="n"
                                                        placeholder="Hiển thị popup"
                                                        value={dataSearch.is_show || ''}
                                                        onChangeValue={(value) => { onChangeValue('is_show', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2 margin-bottom-zero'>
                                                <div className="form-group margin-bottom-zero">
                                                    <SelectForm
                                                        optionData={LIST_LEVEL}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Cấp nhận thông báo"
                                                        value={dataSearch.level || ''}
                                                        onChangeValue={(value) => { onChangeValue('level', value) }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='form-row margin-bottom-zero'>
                                            <div className='form-group col-md-9 margin-bottom-zero'></div>
                                            <div className='form-group col-md-3 margin-bottom-zero'>
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
                                                    <TableCell>Cấp</TableCell>
                                                    <TableCell>Tiêu đề</TableCell>
                                                    <TableCell>Ngày bắt đầu</TableCell>
                                                    <TableCell>Ngày kết thúc</TableCell>
                                                    <TableCell>Hiển thị popup</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows && rows.length ? rows.map((row, key) => (
                                                    <TableRow key={`notify-${row.id}`}>
                                                        <TableCell>
                                                            {renderLevel(row.level)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.title.length > 62 ? row.title.slice(0, 62) + '...' : row.title}
                                                        </TableCell>
                                                        <TableCell>{row.startDate ? convertDateTime(row.startDate) : null}</TableCell>
                                                        <TableCell>{row.endDate ? convertDateTime(row.endDate) : null}</TableCell>
                                                        <TableCell>{renderStatusText(row.is_show)}</TableCell>
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
                            onOk={() => onClickHideModalDetail()}
                            onCancel={() => onClickHideModalDetail()}
                            cancelText="Hủy bỏ"
                            width='900px'
                        >
                            <div className="form-group">
                                {notifyDetail && (
                                    <table className="table table-striped table-bordered">
                                        <tbody>
                                            <tr>
                                                <td className="fontBold td_title">ID thông báo</td>
                                                <td>{notifyDetail.id}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Cấp thông báo</td>
                                                <td>{renderLevel(notifyDetail.level)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Tiêu đề</td>
                                                <td>{notifyDetail.title}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Nội dung</td>
                                                <td>{notifyDetail.content}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Hiển thị popup</td>
                                                <td>
                                                    {renderStatusText(notifyDetail.is_show)}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Ngày bắt đầu</td>
                                                <td>{convertDateTime(notifyDetail.startDate)}</td>
                                            </tr>

                                            <tr>
                                                <td className="fontBold td_title">Ngày kết thúc</td>
                                                <td>{convertDateTime(notifyDetail.endDate)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}

                            </div>
                        </Modal>
                        <Modal
                            title='Xóa thông báo'
                            visible={showModalDelete}
                            onOk={deleteNotify}
                            onCancel={onClickHideModalDelete}
                            width='500px'
                            footer={[
                                <ButtonLoading type="default" onClick={onClickHideModalDelete} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={deleteNotify} loading={isLoadDelete}>
                                    <span>Xóa</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="form-group">
                                Bạn có muốn xóa thông báo này?
                            </div>
                        </Modal>
                        <Modal
                            title='Cập nhật thông báo'
                            visible={showModalUpdate}
                            onOk={(e) => handleSubmitUpdate(e)}
                            onCancel={() => onClickHideModalUpdate()}
                            width='900px'
                            footer={[
                                <ButtonLoading type="default" onClick={onClickHideModalUpdate} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={handleSubmitUpdate} loading={isLoadUpdate}>
                                    <span>Lưu lại</span>
                                </ButtonLoading>
                            ]}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-section">
                                        <Card>
                                            <Card.Body>
                                                <Form>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12}>
                                                            <Form.Label className="starDanger">ID thông báo</Form.Label>
                                                            <InputForm
                                                                type="text"
                                                                placeholder=""
                                                                value={dataUpdate && dataUpdate.id || ''}
                                                                isReadOnly={true}
                                                                onChangeValue={(value) => { onChangeValueUpdate('id', value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12}>
                                                            <Form.Label className="starDanger">Cấp nhà phân phối</Form.Label>
                                                            <SelectForm
                                                                optionData={DISTRIBUTOR_LEVEL}
                                                                keyString="id"
                                                                labelString="name"
                                                                value={dataUpdate && dataUpdate.level}
                                                                onChangeValue={(value) => { onChangeValue('level', value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12} controlId="formBasicEmail">
                                                            <Form.Label className="starDanger">Tiêu đề</Form.Label>
                                                            <InputForm
                                                                type="text"
                                                                placeholder=""
                                                                value={dataUpdate && dataUpdate.title || ''}
                                                                onChangeValue={(value) => { onChangeValueUpdate('title', value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12} controlId="formBasicContent">
                                                            <Form.Label className="starDanger">Nội dung</Form.Label>
                                                            <InputForm
                                                                type="text"
                                                                placeholder=""
                                                                value={dataUpdate && dataUpdate.content || ''}
                                                                onChangeValue={(value) => { onChangeValueUpdate('content', value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={2} controlId="formBasicEndDate">
                                                            <Form.Label className="starDanger">Hiển thị popup</Form.Label>
                                                        </Form.Group>
                                                        <Form.Group as={Col} md={3} controlId="formBasicName">
                                                            <FormControlLabel
                                                                key={0}
                                                                control={<Radio checked={dataUpdate && dataUpdate.is_show && dataUpdate.is_show == 1 || false} />}
                                                                label={"Hiển thị"}
                                                                onClick={() => onChangeValueUpdate('is_show', 1)}
                                                            />
                                                            <FormControlLabel
                                                                key={1}
                                                                control={<Radio checked={dataUpdate && dataUpdate.is_show == 0 ? true : false} />}
                                                                label={"Không hiển thị"}
                                                                onClick={() => onChangeValueUpdate('is_show', 0)}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={2} controlId="formBasicLabelStartDate">
                                                            <Form.Label className="starDanger">Thời gian bắt đầu - kết thúc</Form.Label>
                                                        </Form.Group>
                                                        <Form.Group as={Col} md={3} controlId="formBasicStartDateUpdate">
                                                            <DatePicker
                                                                showTime
                                                                format={dateFormat}
                                                                onChange={onChangeStartDateUpdate}
                                                                placeholder={'Thời gian bắt đầu'}
                                                                value={dataUpdate && dataUpdate.startDate && moment(dataUpdate.startDate) || ''}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group as={Col} md={3} controlId="formBasicEndDateUpdate">
                                                            <DatePicker
                                                                showTime
                                                                format={dateFormat}
                                                                onChange={onChangeEndDateUpdate}
                                                                placeholder={'Thời gian kết thúc'}
                                                                value={dataUpdate && dataUpdate.endDate && moment(dataUpdate.endDate) || ''}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                </Form>
                                            </Card.Body>
                                        </Card>
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

export default connect(mapStateToProps, null)(ListNotify);