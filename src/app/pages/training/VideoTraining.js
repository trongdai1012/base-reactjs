/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import {
    makeStyles
} from "@material-ui/core/styles";
import {
    Paper
} from "@material-ui/core";
import { Modal, Pagination } from "antd";
import { Form, Card, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import { validateTitleTraining } from "../../libs/utils";
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

const VideoTraining = (props) => {

    const classes1 = useStyles1();
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [dataAdd, setDataAdd] = useState({ visible: false });
    const [dataUpdate, setDataUpdate] = useState({ visible: false });
    const inputTitleRef = React.createRef();
    const inputLinkRef = React.createRef();
    const inputTitleUpdateRef = React.createRef();
    const inputLinkUpdateRef = React.createRef();
    const [rowsPerPage, setRowsPerPage] = useState(6);
    const [total, setTotal] = useState(0);
    const [deleteData, setDeleteData] = useState({ visible: false });
    const [isLoading, setLoading] = useState(true);
    const [isLoadAdd, setLoadAdd] = useState(false);
    const [isLoadUpdate, setLoadUpdate] = useState(false);
    const [isLoadDelete, setLoadDelete] = useState(false);
    const [page, setPage] = useState(1);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const { user } = props;
    const [isRefuse, setRefuse] = useState(false);

    const permissions = {
        getVideo: 'get-video-training'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getVideo);
        if (check == 1) {
            getVideoTraining({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const getVideoTraining = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `training/getAllVideo`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    if (res) {
                        setRow(res.listVideo);
                        setTotal(res.total);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            })
    }

    const onChangeAddValue = (key, value) => {
        setDataAdd({
            ...dataAdd,
            [key]: value
        });
    }

    const onChangeUpdateValue = (key, value) => {
        setDataUpdate({
            ...dataUpdate,
            [key]: value
        });
    }

    const clickModalAddCancel = () => {
        setDataAdd({
            visible: false
        })
    }

    const clickModalUpdateCancel = () => {
        setDataUpdate({
            ...dataUpdate,
            visible: false
        })
    }

    const clickModalDeleteCancel = () => {
        setDeleteData({
            ...deleteData,
            visible: false
        })
    }

    const submitAdd = (e) => {
        e.preventDefault();

        if (!dataAdd.title) {
            inputTitleRef.current.focus();
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!validateTitleTraining(dataAdd.title)) {
            inputTitleRef.current.focus();
            return showErrorMessage('Tiêu đề không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.link) {
            inputLinkRef.current.focus();
            return showErrorMessage('Vui lòng nhập link');
        }

        setLoadAdd(true);
        makeRequest('post', `training/createVideo`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Tạo video training thành công');
                    setPage(1);
                    getVideoTraining({ page: 1, limit: rowsPerPage });
                    clickModalAddCancel();

                } else {
                    showErrorMessage(data.message);
                }
                setLoadAdd(false);
                clickModalAddCancel();
            })
            .catch(err => {
                setLoadAdd(false);
                clickModalAddCancel();
                console.log('++++++++++++++++', err)
            })
    }

    const submitUpdate = (e) => {
        e.preventDefault();

        if (!dataUpdate.title) {
            inputTitleUpdateRef.current.focus();
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!validateTitleTraining(dataUpdate.title)) {
            inputTitleUpdateRef.current.focus();
            return showErrorMessage('Tiêu đề không được chứa ký tự đặc biệt');
        }

        if (!dataUpdate.link) {
            inputLinkUpdateRef.current.focus();
            return showErrorMessage('Vui lòng nhập link');
        }

        setLoadUpdate(true);
        makeRequest('post', `training/updateVideo`, dataUpdate)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Cập nhật video training thành công');
                    setPage(1);
                    getVideoTraining({ page: 1, limit: rowsPerPage });
                    clickModalUpdateCancel();
                } else {
                    showErrorMessage(data.message);
                }
                setLoadUpdate(false);
                clickModalUpdateCancel();
            })
            .catch(err => {
                setLoadUpdate(false);
                clickModalUpdateCancel();
                console.log('++++++++++++++++', err)
            })
    }

    const deleteVideo = () => {
        setLoadDelete(true);
        makeRequest('get', `training/deleteVideo?id=${deleteData.id}`)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Xóa thành công');
                    getVideoTraining({ page: 1, limit: rowsPerPage });
                    clickModalDeleteCancel();
                } else {
                    return showErrorMessage(data.message);
                }
                setLoadDelete(false);
                clickModalDeleteCancel();
            })
            .catch(err => {
                setLoadDelete(false);
                clickModalDeleteCancel();
                console.log('++++++++++++++++', err)
            })
    }

    const showModalAdd = () => {
        setDataAdd({
            ...dataAdd,
            visible: true
        })
    }

    const showModalUpdate = (id) => {
        makeRequest('get', `training/getVideoById?id=${id}`)
            .then(({ data }) => {
                setLoading(false)
                if (data.signal) {
                    setDataUpdate({
                        ...dataUpdate,
                        id: data.data.id,
                        title: data.data.title,
                        link: data.data.link,
                        visible: true
                    })
                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                setLoading(false)
                console.log('++++++++++++++++', err)
            })
        setDataUpdate({
            ...dataUpdate,
            visible: true
        })
    }

    const showModalDelete = (id) => {
        setDeleteData({
            ...deleteData,
            id: id,
            visible: true
        })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        getVideoTraining({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    if (isLoading) return <Loading />;

    return (
        <>
            {user && user.type == 1 ? (
                <Button onClick={showModalAdd} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo mới</Button>
            ) : ''}
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className="row" style={{ marginLeft: '0px', marginRight: '0px' }}>
                                    {
                                        rows.length > 0 ?
                                            rows.map(item => {
                                                return <div className="col-sm-6 col-md-4 video-train" key={`video-${item.id}`}>
                                                    {user && user.type == 1 && (
                                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-right">
                                                            <div className="form-group" style={{ marginBottom: '5px' }}>
                                                                <Button onClick={() => showModalUpdate(item.id)} className="btn btn-info btn-bold btn-sm btn-icon-h kt-margin-l-10">Sửa</Button>
                                                                <Button onClick={() => showModalDelete(item.id)} className="btn btn-danger btn-bold btn-sm btn-icon-h kt-margin-l-10">Xóa</Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="thumbnail">
                                                        <div className="embed-responsive embed-responsive-16by9">
                                                            <iframe className="video-full" src={"https://www.youtube.com/embed/" + item.link} allowFullScreen={true}></iframe>
                                                        </div>
                                                        <div className="caption text-center">
                                                            <h5 className="text-h5">{item.title}</h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            }) : null
                                    }
                                </div>
                                {total > rowsPerPage && (
                                    <div className="customSelector custom-svg">
                                        <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                            <Modal
                                title='Tạo video'
                                visible={dataAdd.visible}
                                onCancel={clickModalAddCancel}
                                onOk={submitAdd}
                                width={900}
                                footer={[
                                    <ButtonLoading type="default" onClick={clickModalAddCancel} className="btn btn-label-secondary btn-secondary">
                                        Đóng
                                    </ButtonLoading>,
                                    <ButtonLoading className="btn btn-label-primary btn-primary"
                                        onClick={submitAdd} loading={isLoadAdd}>
                                        <span>Lưu lại</span>
                                    </ButtonLoading>
                                ]}
                            >
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="kt-section">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <Card >
                                                        <Card.Body>
                                                            <Form>
                                                                <Form.Label className="text-h5">Thông tin</Form.Label>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicTitle">
                                                                        <Form.Label className="starDanger">Tiêu đề</Form.Label>
                                                                        <Form.Control type="text" maxLength={255} autoFocus ref={inputTitleRef} placeholder="Nhập tiêu đề" value={dataAdd.title || ''} onChange={(e) => onChangeAddValue('title', e.target.value)} />
                                                                    </Form.Group>
                                                                </Form.Row>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <Form.Label className="starDanger">Link (chỉ nhập chuỗi kết nối phía sau: ví dụ: <strike>https://www.youtube.com/embed/</strike>6t-MjBazs3o</Form.Label>
                                                                        <Form.Control type="text" maxLength={255} ref={inputLinkRef} placeholder="Nhập link" value={dataAdd.link || ''} onChange={(e) => onChangeAddValue('link', e.target.value)} />
                                                                    </Form.Group>
                                                                </Form.Row>
                                                            </Form>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                                <div className="col-md-6">
                                                    <Card >
                                                        <Card.Body >
                                                            <Form>
                                                                <Form.Label className="text-h5">Xem trước</Form.Label>
                                                                <div className="thumbnail">
                                                                    <div className="embed-responsive embed-responsive-16by9">
                                                                        <iframe className="video-full" src={"https://www.youtube.com/embed/" + dataAdd.link}></iframe>
                                                                    </div>
                                                                    <div className="caption text-center">
                                                                        <h5 className="text-h5">{dataAdd.title}</h5>
                                                                    </div>
                                                                </div>
                                                            </Form>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                title='Cập nhật video'
                                visible={dataUpdate.visible}
                                onCancel={clickModalUpdateCancel}
                                onOk={submitUpdate}
                                width={900}
                                footer={[
                                    <ButtonLoading type="default" onClick={clickModalUpdateCancel} className="btn btn-label-secondary btn-secondary">
                                        Đóng
                                    </ButtonLoading>,
                                    <ButtonLoading className="btn btn-label-primary btn-primary"
                                        onClick={submitUpdate} loading={isLoadUpdate}>
                                        <span>Lưu lại</span>
                                    </ButtonLoading>
                                ]}
                            >
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="kt-section">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <Card >
                                                        <Card.Body>
                                                            <Form>
                                                                <Form.Label className="text-h5">Thông tin</Form.Label>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicTitle">
                                                                        <Form.Label className="starDanger">Tiêu đề</Form.Label>
                                                                        <Form.Control type="text" maxLength={255} autoFocus ref={inputTitleUpdateRef} placeholder="Nhập tiêu đề" value={dataUpdate.title || ''} onChange={(e) => onChangeUpdateValue('title', e.target.value)} />
                                                                    </Form.Group>
                                                                </Form.Row>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <Form.Label className="starDanger">Link</Form.Label>
                                                                        <Form.Control type="text" maxLength={255} ref={inputLinkUpdateRef} placeholder="Nhập link" value={dataUpdate.link || ''} onChange={(e) => onChangeUpdateValue('link', e.target.value)} />
                                                                    </Form.Group>
                                                                </Form.Row>
                                                            </Form>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                                <div className="col-md-6">
                                                    <Card >
                                                        <Card.Body >
                                                            <Form>
                                                                <Form.Label className="text-h5">Xem trước</Form.Label>
                                                                <div className="thumbnail">
                                                                    <div className="embed-responsive embed-responsive-16by9">
                                                                        <iframe className="video-full" src={"https://www.youtube.com/embed/" + dataUpdate.link}></iframe>
                                                                    </div>
                                                                    <div className="caption text-center">
                                                                        <h5 className="text-h5">{dataUpdate.title}</h5>
                                                                    </div>
                                                                </div>
                                                            </Form>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                title='Xóa video training'
                                visible={deleteData.visible}
                                onCancel={clickModalDeleteCancel}
                                onOk={() => deleteVideo}
                                width={400}
                                footer={[
                                    <ButtonLoading type="default" onClick={clickModalUpdateCancel} className="btn btn-label-secondary btn-secondary">
                                        Đóng
                                    </ButtonLoading>,
                                    <ButtonLoading className="btn btn-label-danger btn-danger"
                                        onClick={deleteVideo} loading={isLoadDelete}>
                                        <span>Xóa</span>
                                    </ButtonLoading>
                                ]}
                            >
                                <div>Bạn có muốn xóa video training này?</div>
                            </Modal>
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

export default connect(mapStateToProps, null)(VideoTraining);