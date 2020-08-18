/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
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
    TableBody
} from "@material-ui/core";
import { Modal, Pagination } from "antd";
import { Form } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { DATA_PACKAGE } from '../../config/product';
import PackageLabel from '../../partials/common/PackageLabel';

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

export default function KeyAdmin() {

    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({ package_id: '', key: '' });
    const [dataImport, setDataImport] = useState({ package_id: 0, show: false });
    const [dataDelete, setDataDelete] = useState({ visible: false });
    const [total, setTotal] = useState(0);
    const [packageAll, setPackage] = useState([]);
    const [linkFileKey, setLink] = useState("");
    const [isLoading, setLoading] = useState(true);
    const [isLoadPackage, setLoadPackage] = useState(true);


    useEffect(() => {
        getAllPakage();
        searchKey({ type: 1, page: 1, limit: rowsPerPage });
    }, []);

    const searchKey = (dataSearch = {}) => {
        makeRequest('get', `productkey/getallproductKey`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;

                    setRow(res.rows);
                    setTotal(res.total);
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const unfilteredData = (e) => {
        setData({
            key: '',
            package_id: ''
        });

        setPage(1);

        searchKey({ page: 1, limit: rowsPerPage });
    }

    const onChangeValue = (key, value) => {

        setData({
            ...dataSearch,
            [key]: value
        })
    }
    const showModal = (idDel) => {
        setDataDelete({
            ...dataDelete,
            visible: true,
            idDel
        })
    }

    const showModalDetail = () => {
        setData({
            ...dataSearch,
            visible: true,
        })
    }
    const hideModalImport = () => {
        setDataImport({
            ...dataImport,
            show: false
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        searchKey(dataSearch);
    }

    const getAllPakage = () => {
        makeRequest('get', `productpackage/getallpackage`, {})
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setPackage(res);
                }
                setLoadPackage(false);
            })
            .catch(err => {
                setLoadPackage(false);
                console.log(err)
            })
    }
    const onChangeValueSelect = (value) => {
        setData({
            ...dataSearch,
            package_id: value
        })
    }

    const onChangeValueImport = (event) => {
        setDataImport({
            ...dataImport,
            package_id: event.target.value
        })
    }

    const onChangeLink = (event) => {
        setLink(event.target.files[0]);
    }

    const renderPackage = () => {
        return (packageAll && packageAll.length > 0)
            ? packageAll.map(item => {
                return (
                    <option value={item.id} key={`page-admin-${item.id}`}>{item.name}</option>
                )
            })
            : null
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchKey({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const showModalImport = () => {
        setDataImport({ ...dataImport, package_id: 1, show: true })
        setLink('');
    }

    const importFile = () => {
        if (!dataImport.package_id) {
            return showErrorMessage('Vui lòng chọn loại gói');
        }

        if (!linkFileKey) {
            return showErrorMessage('Vui lòng chọn file Import');
        }

        let dataPost = new FormData();
        dataPost.append('file', linkFileKey);
        dataPost.append('package_id', dataImport.package_id);

        makeRequest('post', `productpackage/import`, dataPost, {
            'Content-Type': 'multipart/form-data'
        })
            .then(({ data }) => {
                if (data.signal) {
                    hideModalImport();
                    unfilteredData();
                } else {
                    showErrorMessage(data.message)
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const offset = rowsPerPage * (page - 1);

    if (isLoading || isLoadPackage) return <Loading />;

    return (
        <>
            <Link onClick={() => showModalImport()} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Import key</Link>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-3'>
                                                <div className="form-group">
                                                    <InputForm
                                                        type="text"
                                                        placeholder="Mã key"
                                                        value={dataSearch.key || ''}
                                                        onChangeValue={(value) => { onChangeValue('key', value) }}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={packageAll}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeValueSelect(value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ Lọc</span></button>
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></button>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                <Table className={classes1.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Số thứ tự </TableCell>
                                            <TableCell>Mã Key</TableCell>
                                            <TableCell>Gói</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows && rows.length ? rows.map((row, idx) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    {offset + idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {row.license_key}
                                                </TableCell>
                                                <TableCell>
                                                    <PackageLabel packageData={{ id: row.package_id, name: DATA_PACKAGE[row.package_id] }} />
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                </TableRow>
                                            )}
                                    </TableBody>
                                </Table>
                                {total > 10 && (
                                    <div className="customSelector custom-svg">
                                        <Pagination className="pagination-crm" defaultCurrent={1} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                    </div>
                                )}
                            </Paper>
                        </div>
                        <Modal
                            title='Nhập file key'
                            visible={dataImport.show}
                            onOk={importFile}
                            onCancel={hideModalImport}
                            cancelText='Huỷ'
                            okText='Import'
                        >
                            <select onChange={onChangeValueImport} value={dataImport.package_id} className="form-control" id="exampleFormControlSelect1">
                                {renderPackage()}
                            </select>
                            <div className="input-group" style={{ marginTop: '5px' }}>
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroupFileAddon01">
                                        Upload</span>
                                </div>
                                <div className="custom-file">
                                    <input
                                        onChange={onChangeLink}
                                        type="file"
                                        className="custom-file-input"
                                        id="inputGroupFile01"
                                        aria-describedby="inputGroupFileAddon01"
                                    />
                                    <label className="custom-file-label" htmlFor="inputGroupFile01">
                                        {linkFileKey ? linkFileKey.name : 'Chọn file'} </label>
                                </div>
                            </div>

                        </Modal>
                    </div>
                </div>
            </div>
        </>

    );
}