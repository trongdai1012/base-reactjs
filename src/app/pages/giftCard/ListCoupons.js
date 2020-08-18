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
    TableBody
} from "@material-ui/core";
import { Pagination } from "antd";
import { Form, Button } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import { connect } from "react-redux";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { DATA_PACKAGE, LIST_PACKAGE_SELL } from '../../config/product';
import PackageLabel from '../../partials/common/PackageLabel';
import { CopyOutlined } from '@ant-design/icons';
import { showSuccessMessageIcon } from '../../actions/notification';
import SelectForm from '../../partials/common/SelectForm';
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

const ListCoupons = (props) => {

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
        getCampaign: 'get-coupons'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getCampaign)
        if (check == 1) {
            searchCoupons({ page: 1, limit: rowsPerPage });
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const searchCoupons = (dataSearch = {}) => {
        setLoading(true);
        setLoadSearch(true);
        makeRequest('get', `coupons/getAllCouponsByDistribotor`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    if (res) {
                        setRow(res.ListCoupons);
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
        searchCoupons({ ...dataSearch, page: newPage, limit: rowsPerPage });
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
        searchCoupons({ page: 1, limit: rowsPerPage });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        searchCoupons(dataSearch);
    }

    const renderPackage = (packageData) => {
        if (!packageData) return '';
        let name = `${DATA_PACKAGE[packageData.package_id]} - ${packageData.number} ${packageData.unit === 0 ? '%' : ' VNĐ'}`;

        return <PackageLabel packageData={{ id: packageData.package_id, name }} />
    }

    const renderStatusText = (category) => {
        if (category == 1) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã sử dụng</span>);
        } else {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa sử dụng</span>);
        }
    }

    const copyToClipboard = (text) => {
        const elem = document.createElement('textarea');
        elem.value = text;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
    }

    const copyCode = (row) => {
        copyToClipboard(row.coupons_code);
        showSuccessMessageIcon('Copy mã giảm giá thành công!');
    }

    const renderAction = (row) => {
        return (
            <div className="mg-b5">
                <Button type="secondary" className="button-center-item" size="small" onClick={() => copyCode(row)} icon={<CopyOutlined />}>
                    Copy coupons
                </Button>
            </div>
        )
    }

    const convertDateTime = (date) => {
        let dataConvert = new Date(date).toLocaleString();

        return dataConvert;
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
                                                        placeholder="Mã giảm giá"
                                                        value={dataSearch.code || ''}
                                                        onChangeValue={(value) => { onChangeValue('code', value) }}
                                                        focus={true}
                                                    />
                                                </div>
                                            </div>
                                            <div className='form-group col-md-2'>
                                                <div className="form-group" style={{ display: 'flex' }} >
                                                    <SelectForm
                                                        optionData={LIST_PACKAGE_SELL}
                                                        keyString="id"
                                                        labelString="name"
                                                        placeholder="Gói"
                                                        value={dataSearch.package_id || ''}
                                                        onChangeValue={(value) => { onChangeValue('package_id', value) }}
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
                                                    <TableCell>Mã giảm giá</TableCell>
                                                    <TableCell>Gói - Giảm</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell>Bắt đầu</TableCell>
                                                    <TableCell>Kết thúc</TableCell>
                                                    <TableCell>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows && rows.length ? rows.map((row, key) => (
                                                    <TableRow key={`coupons-${row.id}`}>
                                                        <TableCell>
                                                            {row.coupons_code}
                                                        </TableCell>
                                                        <TableCell>{renderPackage(row.campaignPackageData)}</TableCell>
                                                        <TableCell>{renderStatusText(row.del)}</TableCell>
                                                        <TableCell>{row.campaignData ? convertDateTime(row.campaignData.startDate) : null}</TableCell>
                                                        <TableCell>{row.campaignData ? convertDateTime(row.campaignData.endDate) : null}</TableCell>
                                                        <TableCell>{renderAction(row)}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={10} align="center">Không có dữ liệu</TableCell>
                                                        </TableRow>
                                                    )}
                                            </TableBody>
                                        </Table>
                                        {total > rowsPerPage && (
                                            <div className="custom-svg customSelector">
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

export default connect(mapStateToProps, null)(ListCoupons);