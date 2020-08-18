/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
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
    Button
} from "@material-ui/core";

import { Form, Card, Col } from "react-bootstrap";
import { Modal, Pagination } from "antd";
import Icon from "@material-ui/core/Icon";
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateBankName, validateBankNo, validateName } from "../../libs/utils";
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

export default function ListBank() {
    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({ name: '', email: '' });
    const [dataDelete, setDataDelete] = useState({ visible: false });
    const [dataAdd, setDataAdd] = useState({});
    const [dataUpdate, setDataUpdate] = useState({ visible: false });
    const [total, setTotal] = useState(0);
    const inputNameBankRef = React.createRef();
    const inputSTKRef = React.createRef();
    const inputChiNhanhRef = React.createRef();
    const inputCTKRef = React.createRef();
    const inputUpdateNameBankRef = React.createRef();
    const inputUpdateSTKRef = React.createRef();
    const inputUpdateChiNhanhRef = React.createRef();
    const inputUpdateCTKRef = React.createRef();
    const formAdd = React.createRef();
    const formUpdate = React.createRef();
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getBank: 'get-bank'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getBank);
        if (check == 1) {
            searchBank({ page: 1, limit: rowsPerPage });
        }
        else if (check == 2) {
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
        })
    }

    const onChangeUpdateValue = (key, value) => {
        setDataUpdate({
            ...dataUpdate,
            [key]: value
        })
    }

    const searchBank = (dataSearch = {}) => {
        makeRequest('get', `distributor/getBank`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setRow(res);
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const handleSubmitAdd = (e) => {
        e.preventDefault();

        if (!dataAdd.bank_name) {
            inputNameBankRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên ngân hàng');
        } else {
            if (!(dataAdd.bank_name).trim().length) {
                inputNameBankRef.current.focus();
                return showErrorMessage('Vui lòng nhập tên ngân hàng');
            }
        }

        if (!validateBankName(dataAdd.bank_name)) {
            inputNameBankRef.current.focus();
            return showErrorMessage('Tên ngân hàng không được chứa số và ký tự đặc biệt')
        }

        if (!dataAdd.bank_no) {
            inputSTKRef.current.focus();
            return showErrorMessage('Vui lòng nhập số tài khoản');
        }

        if (!validateBankNo(dataAdd.bank_no)) {
            inputSTKRef.current.focus();
            return showErrorMessage('Số tài khoản chỉ được chứa ký tự số');
        }

        if (!dataAdd.branch) {
            inputChiNhanhRef.current.focus();
            return showErrorMessage('Vui lòng nhập chi nhánh');
        }

        if (!validateName(dataAdd.branch)) {
            inputChiNhanhRef.current.focus();
            return showErrorMessage('Chi nhánh không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.owner) {
            inputCTKRef.current.focus();
            return showErrorMessage('Vui lòng nhập chủ tài khoản');
        }

        if (!validateBankName(dataAdd.owner)) {
            inputCTKRef.current.focus();
            return showErrorMessage('Số tài khoản không được chứa số và ký tự đặc biệt');
        }

        makeRequest('post', `distributor/addBank`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Thêm thông tin ngân hàng thành công');
                    setPage(1);
                    searchBank({ page: 1, limit: rowsPerPage });
                    setDataAdd({
                        visible: false
                    })
                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('Error', err)
            })
    }

    const handleSubmitUpdate = (e) => {
        e.preventDefault();
        if (!dataUpdate.bank_name) {
            inputUpdateNameBankRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên ngân hàng');
        } else {
            if (!(dataUpdate.bank_name).trim().length) {
                inputUpdateNameBankRef.current.focus();
                return showErrorMessage('Vui lòng nhập tên ngân hàng');
            }
        }

        if (!dataUpdate.bank_no) {
            inputUpdateSTKRef.current.focus();
            return showErrorMessage('Vui lòng nhập số tài khoản');
        }

        if (!dataUpdate.branch) {
            inputUpdateChiNhanhRef.current.focus();
            return showErrorMessage('Vui lòng nhập chi nhánh');
        }

        if (!dataUpdate.owner) {
            inputUpdateCTKRef.current.focus();
            return showErrorMessage('Vui lòng nhập chủ tài khoản');
        }

        makeRequest('post', `distributor/updateBank`, dataUpdate)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Cập nhật thông tin thành công')
                    setDataUpdate({
                        visible: false
                    });

                    let dataRow = rows.map(it => {
                        if (it.id == dataUpdate.id) {
                            return dataUpdate;
                        }
                        return it;
                    })

                    setRow(dataRow);

                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('Error', err)
            })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchBank({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const showModal = (idDel) => {
        setDataDelete({
            ...dataDelete,
            visible: true,
            idDel
        })
    }

    const showModalAdd = () => {
        setDataAdd({
            ...dataAdd,
            visible: true
        })
    }

    const showModalUpdate = (row) => {
        setDataUpdate({
            ...row,
            visible: true
        })
    }

    const clickModalCancel = () => {
        setDataDelete({
            ...dataDelete,
            visible: false,
            idDel: 0
        })
    }

    const clickModalAddCancel = () => {
        setDataAdd({
            ...dataAdd,
            visible: false
        })
    }

    const clickModalUpdateCancel = () => {
        setDataUpdate({
            ...dataUpdate,
            visible: false
        })
    }

    const clickModalOk = () => {
        let idDel = dataDelete.idDel;
        makeRequest('post', `distributor/removeBank/${idDel}`)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Xoá thông tin thành công')
                    setDataDelete({
                        visible: false
                    });

                    let dataRow = rows.filter(it => {
                        return it.id !== idDel;
                    })

                    setRow(dataRow);

                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('Error', err)
            })
    }

    const submitAdd = (e) => {
        e.preventDefault();
        const nodeAdd = formAdd.current;
        nodeAdd.click();
    }

    const submitUpdate = (e) => {
        e.preventDefault();
        const nodeUpdate = formUpdate.current;
        nodeUpdate.click();
    }

    return (
        <>
            <Link onClick={showModalAdd} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Thêm thông tin ngân hàng</Link>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <Table className={classes1.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tên ngân hàng</TableCell>
                                            <TableCell>Số tài khoản</TableCell>
                                            <TableCell>Chi nhánh</TableCell>
                                            <TableCell>Chủ tài khoản</TableCell>
                                            <TableCell style={{ width: 150 }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.length ? rows.map((row, key) => (
                                            <TableRow key={`bank${row.id}`}>
                                                <TableCell>
                                                    {row.bank_name}
                                                </TableCell>
                                                <TableCell>
                                                    {row.bank_no}
                                                </TableCell>
                                                <TableCell>{row.branch}</TableCell>
                                                <TableCell>{row.owner}</TableCell>
                                                <TableCell>
                                                    <span style={{ cursor: 'pointer' }} d data-toggle="tooltip" data-placement="top" title="Sửa thông tin"><Icon className="fa fa-pen" onClick={(e) => showModalUpdate(row)} style={{ color: '#ffa800', fontSize: 15 }} /></span>
                                                    <span style={{ cursor: 'pointer' }} data-toggle="tooltip" data-placement="top" title="Xóa thông tin"><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)', fontSize: 15, marginLeft: 15 }} /></span>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                </TableRow>
                                            )}
                                    </TableBody>
                                </Table>
                            </Paper>
                            {total > rowsPerPage && (
                                <div className="customSelector custom-svg">
                                    <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                </div>
                            )}
                        </div>
                        <Modal
                            title='Xóa thông tin ngân hàng'
                            visible={dataDelete.visible}
                            onOk={clickModalOk}
                            onCancel={clickModalCancel}
                            cancelText='Cancel'
                            okText='Ok'
                        >
                            <p>Bạn muốn xóa thông tin ngân hàng này?</p>
                        </Modal>
                        <Modal
                            title='Thêm mới thông tin ngân hàng'
                            visible={dataAdd.visible}
                            cancelText='Hủy bỏ'
                            okText='Lưu'
                            onCancel={clickModalAddCancel}
                            onOk={submitAdd}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-section">
                                        <Card >
                                            <Card.Body>
                                                <Form onSubmit={handleSubmitAdd}>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicNameBank">
                                                            <Form.Label className="starDanger">Tên ngân hàng</Form.Label>
                                                            <Form.Control type="text" autoFocus maxLength={255} autoFocus ref={inputNameBankRef} placeholder="Nhập tên ngân hàng" value={dataAdd.bank_name || ''} onChange={(e) => onChangeAddValue('bank_name', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicSTK">
                                                            <Form.Label className="starDanger">Số tài khoản</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputSTKRef} placeholder="Nhập số tài khoản" value={dataAdd.bank_no || ''} onChange={(e) => onChangeAddValue('bank_no', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicChiNhanh">
                                                            <Form.Label className="starDanger">Chi nhánh</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputChiNhanhRef} placeholder="Nhập chi nhánh" value={dataAdd.branch || ''} onChange={(e) => onChangeAddValue('branch', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicCTK">
                                                            <Form.Label className="starDanger">Chủ tài khoản</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputCTKRef} placeholder="Nhập tên chủ tài khoản" value={dataAdd.owner || ''} onChange={(e) => onChangeAddValue('owner', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Button variant="primary" type="submit" ref={formUpdate} visible={false} style={{ width: 0, height: 0, paddingTop: 0, paddingBottom: 0, paddingRight: 0, paddingLeft: 0 }} ref={formAdd}>

                                                    </Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        <Modal
                            title='Cập nhật thông tin ngân hàng'
                            visible={dataUpdate.visible}
                            cancelText='Hủy bỏ'
                            okText='Cập nhật'
                            onCancel={clickModalUpdateCancel}
                            onOk={submitUpdate}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-section">
                                        <Card >
                                            <Card.Body>
                                                <Form onSubmit={handleSubmitUpdate}>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicNameBank">
                                                            <Form.Label className="starDanger">Tên ngân hàng</Form.Label>
                                                            <Form.Control type="text" autoFocus maxLength={255} autoFocus ref={inputUpdateNameBankRef} placeholder="Nhập tên ngân hàng" value={dataUpdate.bank_name || ''} onChange={(e) => onChangeUpdateValue('bank_name', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicSTK">
                                                            <Form.Label className="starDanger">Số tài khoản</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputUpdateSTKRef} placeholder="Nhập số tài khoản" value={dataUpdate.bank_no || ''} onChange={(e) => onChangeUpdateValue('bank_no', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicChiNhanh">
                                                            <Form.Label className="starDanger">Chi nhánh</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputUpdateChiNhanhRef} placeholder="Nhập chi nhánh" value={dataUpdate.branch || ''} onChange={(e) => onChangeUpdateValue('branch', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Form.Row>
                                                        <Form.Group as={Col} controlId="formBasicCTK">
                                                            <Form.Label className="starDanger">Chủ tài khoản</Form.Label>
                                                            <Form.Control type="text" maxLength={255} ref={inputUpdateCTKRef} placeholder="Nhập tên chủ tài khoản" value={dataUpdate.owner || ''} onChange={(e) => onChangeUpdateValue('owner', e.target.value)} />
                                                        </Form.Group>
                                                    </Form.Row>
                                                    <Button variant="primary" type="submit" ref={formUpdate} visible={false} style={{ width: 0, height: 0, paddingTop: 0, paddingBottom: 0, paddingRight: 0, paddingLeft: 0 }} ref={formUpdate}>

                                                    </Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </>
    );
}