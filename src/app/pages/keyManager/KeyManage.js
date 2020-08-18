/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../libs/money';
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
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
    TableBody
} from "@material-ui/core";
import { Modal, Pagination, DatePicker } from "antd";
import { Form, Button, Col, Card } from "react-bootstrap";
import SelectForm from '../../partials/common/SelectForm';
import { DATA_PACKAGE, PRICE_PACKAGE } from '../../config/product';
import PackageLabel from '../../partials/common/PackageLabel';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import moment from 'moment';
import { saveAs } from 'file-saver';
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

const KeyManage = (props) => {

    const classes1 = useStyles1();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({ package_id: '', key: '' });
    const [dataImport, setDataImport] = useState({ package_id: 0, show: false });
    const [dataUpdate, setDataUpdate] = useState({ show: false });
    const [total, setTotal] = useState(0);
    const [packageAll, setPackage] = useState([]);
    const [linkFileKey, setLink] = useState("");
    const [keyInfo, setkeyInfo] = useState({});
    const [dataExchange, setDataExchange] = useState({});
    const [dataReveice, setDataReceive] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [isLoadInfo, setLoadInfo] = useState(true);
    const [isLoadImport, setLoadImport] = useState(false);
    const [isLoadExchange, setLoadExchange] = useState(false);
    const [isLoadSearch, setLoadSearch] = useState(false);
    const { user } = props;
    const dateFormat = 'DD/MM/YYYY';
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getKeyManager: 'get-key'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getKeyManager);
        if (check == 1) {
            getAllPakage();
            getInfoKey();
            searchKey({ type: 1, page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const getInfoKey = () => {
        setLoadInfo(true);
        makeRequest('get', `productkey/getstatisticalkey`, null)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setkeyInfo(res);
                }
                setLoadInfo(false);
            })
            .catch(err => {
                setLoadInfo(false);
                console.log(err);
            })
    }

    const searchKey = (dataSearch = {}) => {
        setLoading(true);
        setLoadSearch(true);
        makeRequest('get', `productkey/getallproductKey`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setRow(res.rows);
                    setTotal(res.total);
                }
                setLoading(false);
                setLoadSearch(false);
            })
            .catch(err => {
                setLoading(false);
                setLoadSearch(false);
                console.log(err)
            })
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

    const submitExchange = () => {
        let totalE = getTotalExchange();
        let totalR = getTotalReceive();

        if (!totalE) {
            return showErrorMessage('Vui lòng chọn số lượng key các gói muốn đổi!')
        }

        if (!totalR) {
            return showErrorMessage('Vui lòng chọn số lượng key các gói muốn nhận!')
        }

        if (totalR > totalE) {
            return showErrorMessage("Tổng số tiền key đổi phải lớn hơn hoặc bằng tổng số tiền key nhận");
        }

        const package_exchange = Object.keys(dataExchange).map(it => {
            return {
                package_id: it,
                quantity: dataExchange[it] ? parseInt(dataExchange[it]) : 0
            }
        }).filter(it => !!it.quantity);

        const package_receive = Object.keys(dataReveice).map(it => {
            return {
                package_id: it,
                quantity: dataReveice[it] ? parseInt(dataReveice[it]) : 0
            }
        }).filter(it => !!it.quantity);

        setLoadExchange(true);
        makeRequest('post', `order/createExchange`, { package_exchange, package_receive })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Tạo yêu cầu đổi key thành công');
                    hideModalExchange();
                    props.history.push('/exchange/request');
                } else {
                    showErrorMessage(data.message);
                }
                setLoadExchange(false);
            })
            .catch(err => {
                setLoadExchange(false);
                console.log('++++++++++++++++', err)
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

    const onChangeValueExchange = (id, value) => {
        if (value < 0) value = 0;
        setDataExchange({
            ...dataExchange,
            [id]: value
        });
    }

    const onChangeValueReceive = (id, value) => {
        if (value < 0) value = 0;
        setDataReceive({
            ...dataReveice,
            [id]: value
        });
    }

    const hideModalImport = () => {
        setDataImport({
            ...dataImport,
            show: false
        })
    }

    const hideModalExchange = () => {
        setDataUpdate({
            ...dataUpdate,
            show: false
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        searchKey({ ...dataSearch, page: 1, limit: rowsPerPage });
    }

    const getAllPakage = () => {
        makeRequest('get', `productpackage/getallpackage`, {})
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setPackage(res);
                }
            })
            .catch(err => {
                console.log(err)
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
                    <option value={item.id} key={"package_" + item.id}>{item.name}</option>
                )
            })
            : null
    }

    const getTotalExchange = () => {
        let total = 0;
        if (dataExchange['4']) {
            total += dataExchange['4'] * PRICE_PACKAGE[3];
        }

        if (dataExchange['2']) {
            total += dataExchange['2'] * PRICE_PACKAGE[1];
        }

        if (dataExchange['3']) {
            total += dataExchange['3'] * PRICE_PACKAGE[2];
        }

        return total;
    }

    const getTotalReceive = () => {
        let total = 0;
        if (dataReveice['4']) {
            total += dataReveice['4'] * PRICE_PACKAGE[3];
        }

        if (dataReveice['2']) {
            total += dataReveice['2'] * PRICE_PACKAGE[1];
        }

        if (dataReveice['3']) {
            total += dataReveice['3'] * PRICE_PACKAGE[2];
        }

        return total;
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        searchKey({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const showModalImport = () => {
        setDataImport({ ...dataImport, package_id: 1, show: true })
        setLink('');
    }

    const showModalUpdate = () => {
        setDataUpdate({ ...dataUpdate, show: true })
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

        setLoadImport(true);
        makeRequest('post', `productpackage/import`, dataPost, {
            'Content-Type': 'multipart/form-data'
        })
            .then(({ data }) => {
                if (data.signal) {
                    hideModalImport();
                    unfilteredData();
                    searchKey({ type: 1, page: 1, limit: rowsPerPage });
                    getInfoKey();
                    showSuccessMessageIcon("Thêm key thành công");
                } else {
                    showErrorMessage(data.message);
                }
                setLoadImport(false);
            })
            .catch(err => {
                setLoadImport(false);
                console.log(err)
            })
    }

    const renderStatusText = (active) => {
        if (active) return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã bán</span>);
        return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa bán</span>);
    }

    const Export = () => {
        makeRequest('get', `productkey/export`, dataSearch, '', 'blob')
            .then(({ data }) => {
                var bb = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
                saveAs(bb, 'key_data.xlsx');
            })
            .catch(err => {
                console.log(err)
            })
    }

    const offset = rowsPerPage * (page - 1);

    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    {user && user.type == 1 ? (
                        <Button onClick={() => showModalImport()} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Import Key</Button>
                    ) : (
                            <>
                                <div className="col-md-6">
                                    <Button onClick={() => showModalUpdate()} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Đổi Key</Button>
                                    <Link to="/exchange/request" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Danh sách yêu cầu đổi</Link>
                                </div>
                            </>
                        )}
                </div>

            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <div className="kt-section__content">
                            <Paper className={classes1.root}>
                                <div className='col-md-12'>
                                    <Portlet>
                                        <PortletBody fit={true}>
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <div className="kt-widget14">
                                                        {isLoadInfo ? <Loading /> :
                                                            <div className="row textindiv2">
                                                                <div style={{ width: '20%' }}>
                                                                    <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                                                        <div className="card-body">
                                                                            <i className="flaticon2-analytics-2 text-white icon-2x"> <span className="customSpan">Tổng số key</span> </i>
                                                                            <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{keyInfo.totalKey}</div>
                                                                            <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1"></a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '20%' }}>
                                                                    <div className="card card-custom bg-primary gutter-b" style={{ height: '150px' }}>
                                                                        <div className="card-body">
                                                                            <i className="flaticon2-analytics-2 text-white icon-2x"><span className="customSpan"> Tổng key 1 THÁNG</span></i>
                                                                            <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{keyInfo.Key1M}</div>
                                                                            <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đã bán {keyInfo.sold1M}</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '20%' }}>
                                                                    <div className="card card-custom bg-info gutter-b" style={{ height: '150px' }}>
                                                                        <div className="card-body">
                                                                            <i className="flaticon2-analytics-2 text-white icon-2x"><span className="customSpan">Tổng key 3 THÁNG </span></i>
                                                                            <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{keyInfo.Key3M}</div>
                                                                            <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đã bán {keyInfo.sold3M}</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '20%' }}>
                                                                    <div className="card card-custom bg-danger gutter-b" style={{ height: '150px' }}>
                                                                        <div className="card-body">
                                                                            <i className="flaticon2-shopping-cart-1 text-white icon-2x"><span className="customSpan">Tổng key 1 NĂM </span></i>
                                                                            <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{keyInfo.Key1Y}</div>
                                                                            <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đã bán {keyInfo.sold1Y}</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ width: '20%' }}>
                                                                    <div className="card card-custom bg-warning gutter-b" style={{ height: '150px' }}>
                                                                        <div className="card-body">
                                                                            <i className="flaticon2-shopping-cart-1 text-white icon-2x"> <span className="customSpan"> Tổng key TRỌN ĐỜI</span></i>
                                                                            <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{keyInfo.KeyFe}</div>
                                                                            <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đã bán {keyInfo.soldFe}</a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </PortletBody>
                                    </Portlet>

                                    <Form onSubmit={handleSubmit}>
                                        <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-2' style={{ marginBottom: '0px' }}>
                                                <div className="form-group">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Mã key"
                                                        value={dataSearch.key || ''}
                                                        onChange={(value) => { onChangeValue('key', value.target.value) }}
                                                        autoFocus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2' style={{ marginBottom: '0px' }}>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={packageAll}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeValue('package_id', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-2' style={{ marginBottom: '0px' }}>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={[{ name: 'Đã bán', id: 1 }, { name: 'Chưa bán', id: 0 }]}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Trạng thái"
                                                        value={dataSearch.is_sell || dataSearch.is_sell == 0 ? dataSearch.is_sell : ''}
                                                        onChangeValue={(value) => { onChangeValue('is_sell', value) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3' style={{ marginBottom: '0px' }}>
                                                <div className="form-group">
                                                    <DatePicker
                                                        format={dateFormat}
                                                        onChange={onChangeStartDate}
                                                        placeholder={'Chọn ngày bắt đầu'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.startDate ? moment(dataSearch.startDate) : ''}
                                                    />
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3' style={{ marginBottom: '0px' }}>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <DatePicker
                                                        format={dateFormat}
                                                        onChange={onChangeEndDate}
                                                        placeholder={'Chọn ngày kết thúc'}
                                                        className="form-control inline-block"
                                                        value={dataSearch.endDate ? moment(dataSearch.endDate) : ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='form-row'>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <Link onClick={() => Export()} className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{ marginLeft: 10, marginTop: 3 }}>Xuất Excel</Link>
                                                </div>
                                            </div>

                                            <div className='form-group col-md-3' style={{ marginLeft: 'auto', marginRight: '0px' }}>
                                                <div className="form-group" style={{ display: 'flex', justifyContent: 'center', alignItems: 'right' }} >
                                                    <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ Lọc</span></button>
                                                    <ButtonLoading loading={isLoadSearch} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                {isLoading ? <Loading /> :
                                    <Table className={classes1.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Số thứ tự </TableCell>
                                                <TableCell>Mã Key</TableCell>
                                                <TableCell>Gói</TableCell>
                                                <TableCell>Trạng thái</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows && rows.length ? rows.map((row, idx) => (
                                                <TableRow key={`detail-${row.id}`}>
                                                    <TableCell>
                                                        {offset + idx + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.license_key}
                                                    </TableCell>
                                                    <TableCell>
                                                        <PackageLabel packageData={{ id: row.package_id, name: DATA_PACKAGE[row.package_id] }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderStatusText(row.is_sell)}
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
                        <Modal
                            title='Nhập file key'
                            visible={dataImport.show}
                            onOk={importFile}
                            onCancel={hideModalImport}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalImport} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={importFile} loading={isLoadImport}>
                                    <span>Thêm key</span>
                                </ButtonLoading>
                            ]}
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
                        <Modal
                            title='Đổi key'
                            visible={dataUpdate.show}
                            onOk={submitExchange}
                            onCancel={hideModalExchange}
                            footer={[
                                <ButtonLoading type="default" onClick={hideModalExchange} className="btn btn-label-secondary btn-secondary">
                                    Đóng
                                </ButtonLoading>,
                                <ButtonLoading className="btn btn-label-primary btn-primary"
                                    onClick={submitExchange} loading={isLoadExchange}>
                                    <span>Đổi key</span>
                                </ButtonLoading>
                            ]}
                            style={{ fontWeight: 'bold' }}
                        >
                            <Card>
                                <div className="row" style={{ border: 'outset', borderWidth: 'thin', borderColor: 'black' }}>
                                    <Card.Body style={{ paddingBottom: '0px' }}>
                                        <Form>
                                            <Form.Row>
                                                <Form.Group as={Col} md={12} controlId="formBasicMonth" style={{ textAlign: 'center', marginBottom: ' 0px' }}>
                                                    <Form.Label><h5><strong>Key khả dụng</strong></h5></Form.Label>
                                                </Form.Group>
                                            </Form.Row>
                                        </Form>
                                        <Form>
                                            {keyInfo.notsold3M > 0 && (
                                                <div className="row">
                                                    <div className="col-md-6" style={{ paddingLeft: "20px", paddingBottom: "10px" }}>
                                                        Key 3 THÁNG: {keyInfo.notsold3M} key
                                                    </div>
                                                </div>
                                            )}

                                            {keyInfo.notsold1Y > 0 && (
                                                <div className="row">
                                                    <div className="col-md-6" style={{ paddingLeft: "20px", paddingBottom: "10px" }}>
                                                        Key 1 NĂM: {keyInfo.notsold1Y} key
                                                    </div>
                                                </div>
                                            )}

                                            {keyInfo.notsoldFe > 0 && (
                                                <div className="row">
                                                    <div className="col-md-6" style={{ paddingLeft: "20px", paddingBottom: "10px" }}>
                                                        Key TRỌN ĐỜI: {keyInfo.notsoldFe} key
                                                    </div>
                                                </div>
                                            )}
                                        </Form>
                                    </Card.Body>
                                </div>
                            </Card>
                            <Card>
                                <div className="row" style={{ border: 'outset', borderWidth: 'thin', borderColor: 'black' }}>
                                    <div className="col-md-6" style={{ borderRight: 'outset' }}>
                                        <Card.Body style={{ paddingBottom: '0px' }}>
                                            <Form>
                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicMonth">
                                                        <Form.Label><strong>Key muốn đổi</strong></Form.Label>
                                                    </Form.Group>
                                                </Form.Row>
                                                {keyInfo.notsold3M > 0 && (
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12} controlId="formBasicMonth">
                                                            <Form.Label>Key 3 THÁNG </Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                placeholder=""
                                                                value={dataExchange["2"] || ''}
                                                                onChange={value => { onChangeValueExchange(2, value.target.value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                )}

                                                {keyInfo.notsold1Y > 0 && (
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12} controlId="formBasic1Y">
                                                            <Form.Label>Key 1 NĂM </Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                placeholder=""
                                                                value={dataExchange["3"] || ''}
                                                                onChange={value => { onChangeValueExchange(3, value.target.value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                )}

                                                {keyInfo.notsoldFe > 0 && (
                                                    <Form.Row>
                                                        <Form.Group as={Col} md={12} controlId="formBasicTD">
                                                            <Form.Label>Key TRỌN ĐỜI </Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                placeholder=""
                                                                value={dataExchange["4"] || ''}
                                                                onChange={value => { onChangeValueExchange(4, value.target.value) }}
                                                            />
                                                        </Form.Group>
                                                    </Form.Row>
                                                )}

                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicEmail">
                                                        <Form.Label>Tổng tiền: <b>{formatMoney(getTotalExchange())}</b></Form.Label>
                                                    </Form.Group>
                                                </Form.Row>
                                            </Form>
                                        </Card.Body>
                                    </div>
                                    <div className="col-md-6" style={{ borderLeft: 'outset' }}>
                                        <Card.Body style={{ paddingBottom: '0px' }}>
                                            <Form>
                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicMonth">
                                                        <Form.Label><strong>Key muốn nhận</strong></Form.Label>
                                                    </Form.Group>
                                                </Form.Row>
                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicMonth">
                                                        <Form.Label>Key 3 THÁNG </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder=""
                                                            value={dataReveice["2"] || ''}
                                                            onChange={value => { onChangeValueReceive(2, value.target.value) }}
                                                        />
                                                    </Form.Group>
                                                </Form.Row>

                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasic1Y">
                                                        <Form.Label>Key 1 NĂM </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder=""
                                                            value={dataReveice["3"] || ''}
                                                            onChange={value => { onChangeValueReceive(3, value.target.value) }}
                                                        />
                                                    </Form.Group>
                                                </Form.Row>

                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicTD">
                                                        <Form.Label>Key TRỌN ĐỜI </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder=""
                                                            value={dataReveice["4"] || ''}
                                                            onChange={value => { onChangeValueReceive(4, value.target.value) }}
                                                        />
                                                    </Form.Group>
                                                </Form.Row>
                                                <Form.Row>
                                                    <Form.Group as={Col} md={12} controlId="formBasicEmail">
                                                        <Form.Label>Tổng tiền: <b>{formatMoney(getTotalReceive())}</b></Form.Label>
                                                    </Form.Group>
                                                </Form.Row>
                                            </Form>
                                        </Card.Body>
                                    </div>
                                </div>
                            </Card>
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

export default connect(mapStateToProps, null)(KeyManage);