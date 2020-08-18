/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useRef } from "react";
import makeRequest from '../../libs/request';
import { showErrorMessage, showSuccessMessageIcon } from '../../actions/notification';
import {
    makeStyles
} from "@material-ui/core/styles";
import {
    Paper
} from "@material-ui/core";
import { Modal, Pagination } from "antd";
import { Form, Card, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { validateTitleTraining } from '../../libs/utils';
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

const DocumentTraining = (props) => {

    const classes1 = useStyles1();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [dataAdd, setDataAdd] = useState({ visible: false });
    const inputLinkRef = React.createRef();
    const [LinkImage, setLinkImage] = useState("");
    const [LinkImageUpdate, setLinkImageUpdate] = useState("");
    const [LinkFile, setLinkFile] = useState("");
    const [LinkFileUpdate, setLinkFileUpdate] = useState("");
    const [deleteData, setDeleteData] = useState({ visible: false });
    const [dataUpdate, setDataUpdate] = useState({ visible: false });
    const inputTitleUpdateRef = React.createRef();
    const inputLinkImageRef = React.createRef();
    const inputLinkImageUpdateRef = React.createRef();
    const [isLoading, setLoading] = useState(true);
    const [isLoadAdd, setLoadAdd] = useState(false);
    const [isLoadUpdate, setLoadUpdate] = useState(false);
    const [isLoadDelete, setLoadDelete] = useState(false);
    const { user } = props;
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getDocument: 'get-document-training'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getDocument)
        if (check == 1) {
            getAllDocument({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const onChangeAddValue = (key, value) => {
        setDataAdd({
            ...dataAdd,
            [key]: value
        });
    }

    const showModalAdd = () => {
        setDataAdd({
            ...dataAdd,
            visible: true
        })
    }

    const showModalUpdate = (id) => {
        makeRequest('get', `training/getDocumentById?id=${id}`)
            .then(({ data }) => {
                if (data.signal) {
                    setDataUpdate({
                        ...dataUpdate,
                        id: data.data.id,
                        title: data.data.title,
                        visible: true
                    })
                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    const showModalDelete = (id) => {
        setDeleteData({
            ...deleteData,
            id: id,
            visible: true
        })
    }

    const onChangeLinkFile = (event) => {
        setLinkFile(event.target.files[0]);
    }

    const onChangeLinkFileUpdate = (event) => {
        setLinkFileUpdate(event.target.files[0]);
    }

    const importFile = () => {
        if (!dataAdd.title) {
            inputLinkRef.current.focus();
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!validateTitleTraining(dataAdd.title)) {
            inputLinkRef.current.focus();
            return showErrorMessage('Tiêu đề không được chứa ký tự đặc biệt');
        }

        if (!LinkImage) {
            return showErrorMessage('Vui lòng chọn ảnh');
        }

        if (!LinkFile) {
            return showErrorMessage('Vui lòng chọn file');
        }

        let dataPost = new FormData();
        dataPost.append('file', LinkFile);
        dataPost.append('file', LinkImage);
        dataPost.append('title', dataAdd.title);

        setLoadAdd(true);
        makeRequest('post', `training/upload`, dataPost, {
            'Content-Type': 'multipart/form-data'
        })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon("Thêm tài liệu thành công");
                    unfilteredData();
                    setPage(1);
                    getAllDocument({ page: 1, limit: rowsPerPage });
                } else {
                    showErrorMessage(data.message)
                }
                setLoadAdd(false);
                hideModalAdd();
            })
            .catch(err => {
                setLoadAdd(false);
                hideModalAdd();
                console.log(err);
            })
    }

    const unfilteredData = (e) => {
        setDataAdd({
            title: '',
            visible: false
        });

        setLinkFile('');
        setLinkImage('');
    }

    const unfilteredUpdateData = (e) => {
        setDataUpdate({
            title: '',
            id: 0,
            visible: false
        });

        setLinkFileUpdate('');
        setLinkImageUpdate('');
    }

    const unfilteredDeleteData = (e) => {
        setDeleteData({
            title: '',
            id: 0,
            visible: false
        });

        setLinkFile('');
        setLinkImage('');
    }

    const getAllDocument = (dataSearch = {}) => {
        setLoading(true);
        makeRequest('get', `training/getalldocument`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setRow(res.listDocument);
                    setTotal(res.total);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err);
            })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        getAllDocument({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const deleteDocument = () => {
        setLoadDelete(true);
        makeRequest('get', `training/deletedocument?id=${deleteData.id}`)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Xóa thành công');
                    getAllDocument({ page: 1, limit: rowsPerPage });
                } else {
                    showErrorMessage(data.message);
                }
                setLoadDelete(false);
                hideModalDelete();
            })
            .catch(err => {
                setLoadDelete(false);
                hideModalDelete();
                console.log('++++++++++++++++', err)
            })
    }

    const submitUpdate = (e) => {
        e.preventDefault();

        if (!dataUpdate.title) {
            inputTitleUpdateRef.current.focus()
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!validateTitleTraining(dataUpdate.title)) {
            inputTitleUpdateRef.current.focus()
            return showErrorMessage('Tiêu đề không được chứa ký tự đặc biệt');
        }

        let dataPost = new FormData();

        if (LinkFileUpdate) {
            dataPost.append('file', LinkFileUpdate);
            dataPost.append('isFile', true);
        }

        if (LinkImageUpdate) {
            dataPost.append('file', LinkImageUpdate);
            dataPost.append('isImage', true);
        }

        dataPost.append('title', dataUpdate.title);
        dataPost.append('id', dataUpdate.id);

        setLoadUpdate(true);
        makeRequest('post', `training/updatedocument`, dataPost, {
            'Content-Type': 'multipart/form-data'
        })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon("Cập nhật tài liệu thành công");
                    unfilteredUpdateData();
                    getAllDocument({ page: 1, limit: rowsPerPage });
                } else {
                    showErrorMessage(data.message)
                }
                setLoadUpdate(false);
                hideModalUpdate();
            })
            .catch(err => {
                setLoadUpdate(false);
                hideModalUpdate();
                console.log(err);
            })
    }

    const onChangeUpdateValue = (key, value) => {
        setDataUpdate({
            ...dataUpdate,
            [key]: value
        });
    }

    const hideModalAdd = () => {
        setData({
            ...dataAdd,
            visible: false
        })
    }

    const hideModalUpdate = () => {
        setDataUpdate({
            ...dataUpdate,
            visible: false
        })
    }

    const hideModalDelete = () => {
        setDeleteData({
            ...deleteData,
            visible: false
        })
    }

    const onChangeLink = (event) => {
        const file = event.target.files[0];
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

        if (!isJpgOrPng) {
            inputLinkImageRef.current.value = "";
            return showErrorMessage('Chỉ hỗ trợ định dạng ảnh PNG|JPEG|JPG.');
        }

        setLinkImage(event.target.files[0]);
    }

    const onChangeLinkUpdate = (event) => {
        const file = event.target.files[0];
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

        if (!isJpgOrPng) {
            inputLinkImageUpdateRef.current.value = "";
            return showErrorMessage('Chỉ hỗ trợ định dạng ảnh PNG|JPEG|JPG.');
        }

        setLinkImageUpdate(event.target.files[0]);
    }

    if (isLoading) return <Loading />

    return (
        <>
            {user && user.type == 1 && (
                <Button onClick={showModalAdd} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo mới</Button>
            )}
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className="row" style={{ marginLeft: '0px', marginRight: '0px' }}>
                                    {rows && rows.length > 0 ? rows.map(item => {
                                        return <div className="col-sm-6 col-md-4" key={'docs' + item.id}>
                                            <div className="thumbnail">
                                                {user && user.type == 1 && (
                                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-right">
                                                        <div className="form-group" style={{ marginBottom: '5px', paddingTop: '3px' }}>
                                                            <Button onClick={() => showModalUpdate(item.id)} className="btn btn-info btn-bold btn-sm btn-icon-h kt-margin-l-10">Sửa</Button>
                                                            <Button onClick={() => showModalDelete(item.id)} className="btn btn-danger btn-bold btn-sm btn-icon-h kt-margin-l-10">Xóa</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="thumb">
                                                    <img src={item.image} alt="" className="img-full-width" />
                                                </div>
                                                <div className="caption text-center">
                                                    <h6 className="text-h5">{item.title}</h6>
                                                    <a href={item.file} target="_blank" className="btn btn-success btn-bold btn-sm btn-icon-h kt-margin-l-10">Download</a>
                                                </div>
                                            </div>
                                        </div>
                                    }) : null}
                                </div>
                            </Paper>
                            {total > rowsPerPage && (
                                <div className="customSelector custom-svg">
                                    <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                </div>
                            )}
                            <Modal
                                title='Tạo tài liệu'
                                visible={dataAdd.visible}
                                onCancel={unfilteredData}
                                onOk={importFile}
                                width={900}
                                footer={[
                                    <ButtonLoading type="default" onClick={unfilteredData} className="btn btn-label-secondary btn-secondary">
                                        Đóng
                                    </ButtonLoading>,
                                    <ButtonLoading className="btn btn-label-primary btn-primary"
                                        onClick={importFile} loading={isLoadAdd}>
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
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <Form.Label className="starDanger">Tiêu đề</Form.Label>
                                                                        <Form.Control type="text" maxLength={255} ref={inputLinkRef} placeholder="Nhập tiêu đề" value={dataAdd.title || ''} onChange={(e) => onChangeAddValue('title', e.target.value)} />
                                                                    </Form.Group>
                                                                </Form.Row>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <div className="input-group" style={{ marginTop: '5px' }}>
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text" id="inputGroupFileAddon01">
                                                                                    Tải Ảnh</span>
                                                                            </div>
                                                                            <div className="custom-file">
                                                                                <input
                                                                                    onChange={onChangeLink}
                                                                                    type="file"
                                                                                    className="custom-file-input"
                                                                                    id="inputGroupFile01"
                                                                                    aria-describedby="inputGroupFileAddon01"
                                                                                    accept="image/*"
                                                                                    ref={inputLinkImageRef}
                                                                                />
                                                                                <label className="custom-file-label" htmlFor="inputGroupFile01">
                                                                                    {LinkImage && LinkImage.name.length > 31 ? LinkImage.name.slice(0, 31) :
                                                                                        LinkImage && LinkImage.name || 'Chọn ảnh'} </label>
                                                                            </div>
                                                                        </div>
                                                                    </Form.Group>
                                                                </Form.Row>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <div className="input-group" style={{ marginTop: '5px' }}>
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text" id="inputGroupFileAddon02">
                                                                                    Tải File</span>
                                                                            </div>
                                                                            <div className="custom-file">
                                                                                <input
                                                                                    onChange={onChangeLinkFile}
                                                                                    type="file"
                                                                                    className="custom-file-input"
                                                                                    id="inputGroupFile02"
                                                                                    aria-describedby="inputGroupFileAddon02"
                                                                                />
                                                                                <label className="custom-file-label" htmlFor="inputGroupFile02">
                                                                                    {LinkFile && LinkFile.name.length > 31 ? LinkFile.name.slice(0, 31) :
                                                                                        LinkFile && LinkFile.name || 'Chọn file'} </label>
                                                                            </div>
                                                                        </div>
                                                                    </Form.Group>
                                                                </Form.Row>
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
                                title='Cập nhật tài liệu'
                                visible={dataUpdate.visible}
                                onCancel={unfilteredUpdateData}
                                onOk={submitUpdate}
                                width={900}
                                footer={[
                                    <ButtonLoading type="default" onClick={unfilteredUpdateData} className="btn btn-label-secondary btn-secondary">
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
                                                                        <div className="input-group" style={{ marginTop: '5px' }}>
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text" id="inputGroupFileAddon03">
                                                                                    Tải Ảnh</span>
                                                                            </div>
                                                                            <div className="custom-file">
                                                                                <input
                                                                                    onChange={onChangeLinkUpdate}
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    className="custom-file-input"
                                                                                    id="inputGroupFile03"
                                                                                    aria-describedby="inputGroupFileAddon03"
                                                                                    ref={inputLinkImageUpdateRef}
                                                                                />
                                                                                <label className="custom-file-label" htmlFor="inputGroupFile03">
                                                                                    {LinkImageUpdate && LinkImageUpdate.name.length > 31 ? LinkImageUpdate.name.slice(0, 31) :
                                                                                        LinkImageUpdate && LinkImageUpdate.name || 'Chọn ảnh'} </label>
                                                                            </div>
                                                                        </div>
                                                                    </Form.Group>
                                                                </Form.Row>
                                                                <Form.Row>
                                                                    <Form.Group as={Col} controlId="formBasicLink">
                                                                        <div className="input-group" style={{ marginTop: '5px' }}>
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text" id="inputGroupFileAddon04">
                                                                                    Tải File</span>
                                                                            </div>
                                                                            <div className="custom-file">
                                                                                <input
                                                                                    onChange={onChangeLinkFileUpdate}
                                                                                    type="file"
                                                                                    className="custom-file-input"
                                                                                    id="inputGroupFile04"
                                                                                    aria-describedby="inputGroupFileAddon04"
                                                                                />
                                                                                <label className="custom-file-label" htmlFor="inputGroupFile04">
                                                                                    {LinkFileUpdate ? LinkFileUpdate.name : 'Chọn file'} </label>
                                                                            </div>
                                                                        </div>
                                                                    </Form.Group>
                                                                </Form.Row>
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
                                title='Xóa tài liệu training'
                                visible={deleteData.visible}
                                onCancel={unfilteredDeleteData}
                                onOk={deleteDocument}
                                width={400}
                                footer={[
                                    <ButtonLoading type="default" onClick={unfilteredDeleteData} className="btn btn-label-secondary btn-secondary">
                                        Đóng
                                    </ButtonLoading>,
                                    <ButtonLoading className="btn btn-label-danger btn-danger"
                                        onClick={deleteDocument} loading={isLoadDelete}>
                                        <span>Xóa</span>
                                    </ButtonLoading>
                                ]}
                            >
                                <div>Bạn có muốn xóa tài liệu training này?</div>
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

export default connect(mapStateToProps, null)(DocumentTraining);