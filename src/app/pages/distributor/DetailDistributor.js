import React, { useState, useEffect, useRef } from "react";
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import moment from 'moment';
import { formatTime } from '../../libs/time';
import makeRequest from '../../libs/request';
import ApexCharts from "react-apexcharts";
import { formatMoney } from '../../libs/money';
import { DatePicker, Button, Modal, Tabs, Pagination } from 'antd';
import { DATA_PACKAGE } from '../../config/product';
import { Form } from "react-bootstrap";
import { InfoCircleOutlined } from '@ant-design/icons';
import PackageLabel from '../../partials/common/PackageLabel';
import {
    makeStyles
} from "@material-ui/core/styles";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@material-ui/core";
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { LIST_PACKAGE_SELL } from '../../config/product';
import SelectForm from '../../partials/common/SelectForm';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
import { saveAs } from 'file-saver';
import { showErrorMessage } from '../../actions/notification';

const { TabPane } = Tabs;

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
export default function DetailDistributor(props) {

    const classes1 = useStyles1();
    const { RangePicker } = DatePicker;
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rows, setRow] = useState([]);
    const [dataSearch, setData] = useState({ type: 0, name: null, email: null, mobile: null, codeOrder: null });
    const [total, setTotal] = useState(0);
    const [dataRevenueChart, setDataRevenueChart] = useState({});
    const [dataOrderChart, setDataOrderChart] = useState({});
    const [orderView, setOrderView] = useState('');
    const [distributorDetail, setDetail] = useState('');
    const [dataDate, setDataDate] = useState({ start: moment().subtract(9, 'days').format('DD/MM/YYYY'), end: moment().format('DD/MM/YYYY') });
    const [keyInfo, setkeyInfo] = useState({});
    const [isLoadInfo, setLoadInfo] = useState(true);
    const [isLoadOrderBought, setLoadingBought] = useState(false);
    const [isLoadSearchRetail, setLoadSearchRetail] = useState(false);
    const [rowBoughts, setRowBought] = useState([]);
    const [dataSearchBought, setDataSearchBought] = useState({ codeOrder: '' });
    const [totalBought, setTotalBought] = useState(0);
    const [pageBought, setPageBought] = useState(1);
    const [activeKey, setActiveKey] = useState("1");
    const [orderViewBought, setOrderViewBought] = useState('');
    const [page, setPage] = useState(1);
    const [pageWholeSale, setPageWholeSale] = useState(1);
    const [totalWholeSale, setTotalWholeSale] = useState(0);
    const [rowsWholeSale, setRowWholeSale] = useState([]);
    const [isLoadSearchWholeSale, setLoadSearchWholeSale] = useState(false);
    const [orderViewWholeSale, setOrderViewWholeSale] = useState('');
    const [dataSearchWholeSale, setDataSearchWholeSale] = useState({ type: 0, name: null, email: null, mobile: null, codeOrder: null });
    const [isLoadRevenue, setIsLoadRevenue] = useState(false);
    const [isLoadOrder, setIsLoadOrder] = useState(false);
    const { match: { params: { id } } } = props;
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);
    const [isLoadExcel, setLoadExcel] = useState(false);
    const [isLoadExcelWholeSale, setLoadExcelWholeSale] = useState(false);
    const [isLoadExcelBought, setLoadExcelBought] = useState(false);

    const permissions = {
        getDetailDistri: 'get-detail-distributor'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getDetailDistri);
        if (check == 1) {
            getInfoKey();
            SearchOrderRetail({ type: 0, page: 1, limit: rowsPerPage });
            SearchOrderWholeSale({ type: 1, page: 1, limit: rowsPerPage });
            getDetailDistributor();
            searchBoughtWholeSale({ type: 1, page: 1, limit: rowsPerPage });
            getRevenue(dataDate);
            getOrder(dataDate);
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const SearchOrderRetail = (dataSearch = {}) => {
        dataSearch.distributor_id = id;
        dataSearch.type = 0;
        setLoadSearchRetail(true);
        makeRequest('get', `order/search`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    const { rows, count } = data.data;
                    setRow(rows);
                    setTotal(count);
                }
                setLoadSearchRetail(false);
            })
            .catch(err => {
                setLoadSearchRetail(false);
                console.log(err)
            })
    }

    const SearchOrderWholeSale = (dataSearchWholeSale = {}) => {
        dataSearchWholeSale.distributor_id = id;
        dataSearchWholeSale.type = 1;
        setLoadSearchWholeSale(true);
        makeRequest('get', `order/search`, dataSearchWholeSale)
            .then(({ data }) => {
                if (data.signal) {
                    const { rows, count } = data.data;
                    setRowWholeSale(rows);
                    setTotalWholeSale(count);
                }
                setLoadSearchWholeSale(false);
            })
            .catch(err => {
                setLoadSearchWholeSale(false);
                console.log(err)
            })
    }

    const getInfoKey = () => {
        setLoadInfo(true);
        makeRequest('get', `productkey/getstatisticalkey?distributor_id=${props.match.params.id}`, null)
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

    const getDetailDistributor = () => {
        makeRequest('get', `distributor/detail/${id}`, {})
            .then(({ data }) => {
                if (data.signal) {
                    setDetail(data.data);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleChangePage = (newPage) => {
        setPage(newPage)
        SearchOrderRetail({ ...dataSearch, page: newPage, limit: rowsPerPage });
    };

    const handleChangePageWholeSale = (newPage) => {
        setPageWholeSale(newPage)
        SearchOrderWholeSale({ ...dataSearchWholeSale, page: newPage, limit: rowsPerPage });
    };

    const renderPackage = (packageList) => {
        if (!packageList) return null;
        return packageList.map(it => {
            let name = `${DATA_PACKAGE[it.package_id]} - ${it.quantity} key`;
            return <PackageLabel packageData={{ id: it.package_id, name }} key={`package-id-${it.id}`} />
        })
    }

    const onChangeValue = (key, value) => {

        setData({
            ...dataSearch,
            [key]: value
        })
    }
    const onChangeValueBought = (key, value) => {

        setDataSearchBought({
            ...dataSearchBought,
            [key]: value
        })
    }

    const onChangeValueWholeSale = (key, value) => {

        setDataSearchWholeSale({
            ...dataSearchWholeSale,
            [key]: value
        })
    }
    const unfilteredData = (e) => {
        setData({});

        SearchOrderRetail({ page: 1, limit: rowsPerPage });
    }
    const unfilteredDataBought = (e) => {
        setDataSearchBought({});
        setPageBought(1);
        searchBoughtWholeSale({ page: 1, limit: rowsPerPage });
    }
    const unfilteredDataWholeSale = (e) => {
        setDataSearchWholeSale({});
        setPageWholeSale(1);
        SearchOrderWholeSale({ page: 1, limit: rowsPerPage });
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        SearchOrderRetail(dataSearch);
    }

    const renderStatusText = (category) => {
        if (category.status == 1) {
            return (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Đã thanh toán</span>);
        } else if (category.status == 2) {
            return (<span className="btn btn-label-danger btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Bị huỷ</span>);
        } else {
            return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{ borderRadius: '.42rem' }}>Chưa thanh toán</span>);
        }
    }

    const getSeries = [
        {
            name: 'Đơn hàng thành công',
            data: dataOrderChart.dataPay || []
        }, {
            name: 'Đơn hàng chưa thanh toán',
            data: dataOrderChart.dataPending || []
        }
    ];

    const getOptions = {
        chart: {
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        // title: {
        //     text: 'Biểu đồ đơn hàng',
        //     align: 'left'
        // },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: dataOrderChart.lstDateResult || [],
        }
    };

    const getSeriesRevenue = [
        {
            name: 'Tổng doanh thu',
            data: dataRevenueChart.dataTotal || []
        }, {
            name: 'Doanh thu bán lẻ',
            data: dataRevenueChart.dataRetail || []
        }, {
            name: 'Doanh thu bán sỉ',
            data: dataRevenueChart.dataWholesale || []
        }
    ];

    const getOptionsRevenue = {
        chart: {
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        // title: {
        //     text: 'Biểu đồ doanh thu',
        //     align: 'left'
        // },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: dataRevenueChart.lstDateResult || [],
        }
    };

    const getRevenue = (date) => {
        let dataSearch = Object.assign(date, { distributor_id: id });
        setIsLoadRevenue(true);
        makeRequest('get', `distributor/dataChart`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    setDataRevenueChart(data.data)
                }
                setIsLoadRevenue(false);
            })
            .catch(err => {
                setIsLoadRevenue(false);
                console.log(err)
            })
    }

    const getOrder = (date) => {
        let dataSearch = Object.assign(date, { distributor_id: id })
        setIsLoadOrder(true);
        makeRequest('get', `distributor/dataOrderChart`, dataSearch)
            .then(({ data }) => {
                if (data.signal) {
                    setDataOrderChart(data.data)
                }
                setIsLoadOrder(false);
            })
            .catch(err => {
                setIsLoadOrder(false);
                console.log(err)
            })
    }

    const onChangeDate = (date) => {

        let objSearch = {};
        if (!date) {
            objSearch = {
                start: moment().subtract(9, 'days').format('DD/MM/YYYY'),
                end: moment().format('DD/MM/YYYY')
            };
        } else {
            objSearch = {
                start: date[0].format('DD/MM/YYYY'),
                end: date[1].format('DD/MM/YYYY')
            };
        }

        setDataDate({
            start: date[0].format('DD/MM/YYYY'),
            end: date[1].format('DD/MM/YYYY')
        });

        getRevenue(objSearch);
        getOrder(objSearch);
    }

    const showViewOrder = (order) => {
        setOrderView(order);
    }

    const showViewOrderWholeSale = (order) => {
        setOrderViewWholeSale(order);
    }

    const callback = (key) => {
        setActiveKey(key);
    }

    const handleSubmitBought = (e) => {
        e.preventDefault();
        searchBoughtWholeSale(dataSearchBought);
    }

    const handleSubmitWholeSale = (e) => {
        e.preventDefault();
        setPageWholeSale(1);
        SearchOrderWholeSale(dataSearchWholeSale);
    }

    const searchBoughtWholeSale = (dataSearchBought = {}) => {
        dataSearchBought.distributor_id = id;
        dataSearchBought.type = 1;
        setLoadingBought(true);
        makeRequest('get', `order/getOrderWholeSale`, dataSearchBought)
            .then(({ data }) => {
                if (data.signal) {
                    setRowBought(data.data.listOrder);
                    setTotalBought(data.data.total);
                }
                setLoadingBought(false);
            })
            .catch(err => {
                setLoadingBought(false);
                console.log(err)
            })
    }

    const renderAction = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" onClick={() => showViewOrderBought(row)} size="small" icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
            </>
        )
    }

    const handleChangePageBought = (newPage) => {
        setPageBought(newPage);
        searchBoughtWholeSale({ ...dataSearchBought, page: newPage, limit: rowsPerPage });
    };

    const showViewOrderBought = (order) => {
        setOrderViewBought(order);
    }

    const renderInfoCustomer = (cart) => {
        if (!cart.customer) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {cart.customer.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{cart.customer.email}</span>
                </div>
                {(cart.customer.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{cart.customer.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const renderInfoDistributor = (cart) => {
        if (!cart.distributorBuy) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {cart.distributorBuy.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{cart.distributorBuy.email}</span>
                </div>
                {(cart.distributorBuy.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{cart.distributorBuy.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const renderActionRetail = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => showViewOrder(row)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
            </>
        )
    }

    const renderActionWholeSale = (row) => {
        return (
            <>
                <div className="mg-b5">
                    <Button type="primary" className="button-center-item" size="small" onClick={() => showViewOrderWholeSale(row)} icon={<InfoCircleOutlined />}>
                        Chi tiết
                    </Button>
                </div>
            </>
        )
    }

    const exportExelSingleOrder = (e) => {
        e.preventDefault();
        dataSearch.distributor_id = id;
        dataSearch.type = 0;
        setLoadExcel(true);
        makeRequest('get', `order/exportExcelOrderRetail`, { ...dataSearch, type: 0 }, '', 'blob')
            .then(({ data }) => {
                var bb = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
                saveAs(bb, `don-hang-le-${id}.xlsx`);
                setLoadExcel(false);
            })
            .catch(err => {
                setLoadExcel(false);
                console.log(err);
            })
    }

    const exportExelWholeSaleOrder = (e) => {
        e.preventDefault();
        dataSearchWholeSale.distributor_id = id;
        dataSearchWholeSale.type = 1;
        setLoadExcelWholeSale(true);
        makeRequest('get', `order/exportExcelOrderRetail`, { ...dataSearchWholeSale, type: 1 }, '', 'blob')
            .then(({ data }) => {
                var bb = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
                saveAs(bb, `don-hang-si-${id}.xlsx`);
                setLoadExcelWholeSale(false);
            })
            .catch(err => {
                setLoadExcelWholeSale(false);
                console.log(err);
            })
    }

    const exportExelBuyWholeSaleOrder = (e) => {
        e.preventDefault();
        dataSearchBought.distributor_id = id;
        dataSearchBought.isBoughtWholeSale = id;
        setLoadExcelBought(true);
        makeRequest('get', `order/exportExcelOrderRetail`, { ...dataSearchBought, type: 1 }, '', 'blob')
            .then(({ data }) => {
                var bb = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
                saveAs(bb, `don-hang-mua-si-${id}.xlsx`);
                setLoadExcelBought(false);
            })
            .catch(err => {
                setLoadExcelBought(false);
                console.log(err);
            })
    }

    const onChangeStartDate = (date) => {
        if (dataSearch.end && dataSearch.end < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataSearch,
            start: date.format('MM/DD/YYYY')
        });
    }

    const onChangeEndDate = (date) => {
        if (dataSearch.start && dataSearch.start > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataSearch,
            end: date.format('MM/DD/YYYY')
        });
    }

    const onChangeStartDateWholeSale = (date) => {
        if (dataSearchWholeSale.end && dataSearchWholeSale.end < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataSearchWholeSale({
            ...dataSearchWholeSale,
            start: date.format('MM/DD/YYYY')
        });
    }

    const onChangeEndDateWholeSale = (date) => {
        if (dataSearchWholeSale.start && dataSearchWholeSale.start > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataSearchWholeSale({
            ...dataSearchWholeSale,
            end: date.format('MM/DD/YYYY')
        });
    }

    const onChangeStartDateBuyWholeSale = (date) => {
        if (dataSearchBought.end && dataSearchBought.end < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataSearchBought({
            ...dataSearchBought,
            start: date.format('MM/DD/YYYY')
        });
    }

    const onChangeEndDateBuyWholeSale = (date) => {
        if (dataSearchBought.start && dataSearchBought.start > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setDataSearchBought({
            ...dataSearchBought,
            end: date.format('MM/DD/YYYY')
        });
    }

    const dateFormat = 'DD/MM/YYYY';

    return (
        <>
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

            <Portlet>
                <PortletBody fit={true}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="kt-widget14">
                                <div className="kt-widget14__header kt-margin-b-30">
                                    <h3 className="kt-widget14__title">THÔNG TIN NHÀ PHÂN PHỐI</h3>
                                </div>
                                <div className="kt-widget14__chart">
                                    <div className="table-responsive">
                                        <table className="table table-user-information">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            <span className="glyphicon glyphicon-eye-open text-primary" />
                                                            Tên nhà phân phối
                                                        </strong>
                                                    </td>
                                                    <td className="text-primary">
                                                        {distributorDetail ? distributorDetail.name : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            <span className="glyphicon glyphicon-envelope text-primary" />
                                                            Email
                                                        </strong>
                                                    </td>
                                                    <td className="text-primary">
                                                        {distributorDetail ? distributorDetail.email : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>
                                                            <span className="glyphicon glyphicon-calendar text-primary" />
                                                            Số điện thoại
                                                        </strong>
                                                    </td>
                                                    <td className="text-primary">
                                                        {distributorDetail ? distributorDetail.mobile : ''}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PortletBody>
            </Portlet>

            <Portlet>
                <PortletBody fit={true}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="kt-widget14">
                                <div className="kt-widget14__header kt-margin-b-30">
                                    <h3 className="kt-widget14__title">CHỌN KHOẢNG THỜI GIAN</h3>
                                </div>
                                <div className="kt-widget14__chart">
                                    <RangePicker
                                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                                        defaultValue={[moment().subtract(9, 'days'), moment()]}
                                        format={dateFormat}
                                        onChange={onChangeDate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {isLoadOrder || isLoadRevenue ? <Loading /> :
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="kt-widget14">
                                    <div className="row">
                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon2-analytics-2 text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{formatMoney(dataRevenueChart.totalAll)}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Tổng doanh thu</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-primary gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon2-shopping-cart-1 text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataOrderChart.totalOrder || 0}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đơn hàng được tạo</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-warning gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon-cart text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataOrderChart.totalPay || 0}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đơn hàng đã thanh toán</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="kt-widget14">
                                <div className="kt-widget14__header kt-margin-b-30">
                                    <h3 className="kt-widget14__title">Biểu đồ đơn hàng</h3>
                                </div>
                                <div className="kt-widget14__chart">
                                    <div id="chart">
                                        <ApexCharts options={getOptions} series={getSeries} type="line" height={350} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PortletBody>
            </Portlet>

            <Tabs defaultActiveKey="1" activeKey={activeKey} onChange={callback}>
                <TabPane tab="Đơn hàng lẻ" key="1">
                    <Portlet>
                        <h3 style={{ textAlign: 'center', paddingTop: '10px' }} className="kt-widget14__title">ĐƠN HÀNG LẺ</h3>
                        <PortletBody fit={true}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-widget14">
                                        <Form onSubmit={handleSubmit}>
                                            <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Tên khách hàng"
                                                            value={dataSearch.name || ''}
                                                            onChange={(value) => { onChangeValue('name', value.target.value) }}

                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Email"
                                                            value={dataSearch.email || ''}
                                                            onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Số điện thoại"
                                                            value={dataSearch.mobile || ''}
                                                            onChange={(value) => { onChangeValue('mobile', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Mã đơn hàng"
                                                            value={dataSearch.code || ''}
                                                            onChange={(value) => { onChangeValue('code', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeStartDate}
                                                            placeholder={'Chọn ngày bắt đầu'}
                                                            className="form-control inline-block"
                                                            value={dataSearch.start ? moment(dataSearch.start) : ''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeEndDate}
                                                            placeholder={'Chọn ngày kết thúc'}
                                                            className="form-control inline-block"
                                                            value={dataSearch.end ? moment(dataSearch.end) : ''}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-9 margin-bottom-zero'>
                                                </div>
                                                <div className='form-group col-md-3 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                        <ButtonLoading loading={isLoadSearchRetail} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
                                                        {/* <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></button> */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <ButtonLoading type="primary" loading={isLoadExcel} onClick={exportExelSingleOrder} className="btn btn-success btn-bold btn-sm btn-icon-h kt-margin-l-10 " >
                                                            <span className="flaticon2-calendar-9" style={{ marginRight: '5px', marginTop: '-2px' }}></span> Xuất Excel
                                                        </ButtonLoading>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>
                                        <Table className={classes1.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Gói</TableCell>
                                                    <TableCell>Mã đơn hàng</TableCell>
                                                    <TableCell>Khách hàng</TableCell>
                                                    <TableCell>Tổng tiền</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell>Ngày tạo</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows && rows.length ? rows.map((row, key) => (
                                                    <TableRow key={`list-order-${row.id}`}>
                                                        <TableCell className="textindiv">
                                                            {renderPackage(row.productData)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.code}
                                                        </TableCell>
                                                        <TableCell>{renderInfoCustomer(row)}</TableCell>
                                                        <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                        <TableCell className="textindiv">{renderStatusText(row)}</TableCell>
                                                        <TableCell>{formatTime(row.createdAt)}</TableCell>
                                                        <TableCell>
                                                            {renderActionRetail(row)}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                        </TableRow>
                                                    )}
                                            </TableBody>
                                        </Table>
                                        {total > rowsPerPage && (
                                            <div className="customSelector custom-svg">
                                                <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div >
                        </PortletBody>
                    </Portlet>
                </TabPane>
                <TabPane tab="Đơn hàng sỉ" key="2">
                    <Portlet>
                        <h3 style={{ textAlign: 'center', paddingTop: '10px' }} className="kt-widget14__title">ĐƠN HÀNG SỈ</h3>
                        <PortletBody fit={true}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-widget14">
                                        <Form onSubmit={handleSubmitWholeSale}>
                                            <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Mã đơn hàng"
                                                            value={dataSearchWholeSale.code || ''}
                                                            onChange={(value) => { onChangeValueWholeSale('code', value.target.value) }}

                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Email nhà phân phối mua"
                                                            value={dataSearchWholeSale.email || ''}
                                                            onChange={(value) => { onChangeValueWholeSale('email', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeStartDateWholeSale}
                                                            placeholder={'Chọn ngày bắt đầu'}
                                                            className="form-control inline-block"
                                                            value={dataSearchWholeSale.start ? moment(dataSearchWholeSale.start) : ''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeEndDateWholeSale}
                                                            placeholder={'Chọn ngày kết thúc'}
                                                            className="form-control inline-block"
                                                            value={dataSearchWholeSale.end ? moment(dataSearchWholeSale.end) : ''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <SelectForm
                                                            optionData={[{ n: 'Chưa thanh toán', v: 0 }, { n: 'Đã thanh toán', v: 1 }, { n: 'Bị huỷ', v: 2 }]}
                                                            keyString="v"
                                                            labelString="n"
                                                            placeholder="Trạng thái"
                                                            value={dataSearchWholeSale.status || ''}
                                                            onChangeValue={(value) => { onChangeValueWholeSale('status', value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <SelectForm
                                                            optionData={LIST_PACKAGE_SELL}
                                                            keyString="id"
                                                            labelString="name"
                                                            placeholder="Gói"
                                                            value={dataSearchWholeSale.package_id || ''}
                                                            onChangeValue={(value) => { onChangeValueWholeSale('package_id', value) }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-9 margin-bottom-zero'>
                                                </div>
                                                <div className='form-group col-md-3 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" onClick={unfilteredDataWholeSale} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                        <ButtonLoading loading={isLoadSearchWholeSale} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 textindiv" style={{ marginLeft: 10, marginTop: 3 }} type="submit">
                                                            <span>Tìm kiếm</span>
                                                        </ButtonLoading>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group  margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <ButtonLoading loading={isLoadExcelWholeSale} onClick={(e) => exportExelWholeSaleOrder(e)} className="btn btn-success btn-bold btn-sm btn-icon-h kt-margin-l-10" >
                                                            <span className="flaticon2-calendar-9" style={{ marginRight: '5px', marginTop: '-2px' }}></span> Xuất Excel
                                                        </ButtonLoading>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>

                                        <Table className={classes1.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Gói</TableCell>
                                                    <TableCell>Mã đơn hàng</TableCell>
                                                    <TableCell>Nhà phân phối mua</TableCell>
                                                    <TableCell>Tổng tiền</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell>Ngày tạo</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rowsWholeSale.length ? rowsWholeSale.map((row, key) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell className="textindiv">
                                                            {renderPackage(row.productData)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.code}
                                                        </TableCell>
                                                        <TableCell>{renderInfoDistributor(row)}</TableCell>
                                                        <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                        <TableCell className="textindiv">{renderStatusText(row)}</TableCell>
                                                        <TableCell>{formatTime(row.createdAt)}</TableCell>
                                                        <TableCell>
                                                            {renderActionWholeSale(row)}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                        </TableRow>
                                                    )}
                                            </TableBody>
                                        </Table>
                                        {totalWholeSale > rowsPerPage && (
                                            <div className="customSelector custom-svg">
                                                <Pagination className="pagination-crm" current={pageWholeSale} pageSize={rowsPerPage} total={totalWholeSale} onChange={(p, s) => handleChangePageWholeSale(p)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div >
                        </PortletBody>
                    </Portlet>
                </TabPane>
                <TabPane tab="Đơn hàng mua sỉ" key="3">
                    <Portlet>
                        <h3 style={{ textAlign: 'center', paddingTop: '10px' }} className="kt-widget14__title">ĐƠN HÀNG MUA SỈ</h3>
                        <PortletBody fit={true}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="kt-widget14">
                                        <Form onSubmit={handleSubmitBought}>
                                            <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Mã đơn hàng"
                                                            value={dataSearchBought.code || ''}
                                                            onChange={(value) => { onChangeValueBought('code', value.target.value) }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero">
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeStartDateBuyWholeSale}
                                                            placeholder={'Chọn ngày bắt đầu'}
                                                            className="form-control inline-block"
                                                            value={dataSearchBought.start ? moment(dataSearchBought.start) : ''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <DatePicker
                                                            format={dateFormat}
                                                            onChange={onChangeEndDateBuyWholeSale}
                                                            placeholder={'Chọn ngày kết thúc'}
                                                            className="form-control inline-block"
                                                            value={dataSearchBought.end ? moment(dataSearchBought.end) : ''}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='form-group col-md-3 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredDataBought} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                                                        <ButtonLoading loading={isLoadOrderBought} className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{ marginLeft: 10, marginTop: 3 }} type="submit"><span>Tìm kiếm</span></ButtonLoading>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='form-row margin-bottom-zero'>
                                                <div className='form-group col-md-2 margin-bottom-zero'>
                                                    <div className="form-group margin-bottom-zero" style={{ display: 'flex' }} >
                                                        <ButtonLoading loading={isLoadExcelBought} onClick={(e) => exportExelBuyWholeSaleOrder(e)} className="btn btn-success btn-bold btn-sm btn-icon-h kt-margin-l-10 " >
                                                            <span className="flaticon2-calendar-9" style={{ marginRight: '5px', marginTop: '-2px' }}></span> Xuất Excel
                                                        </ButtonLoading>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>

                                        <Table className={classes1.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Gói</TableCell>
                                                    <TableCell>Mã đơn hàng</TableCell>
                                                    <TableCell>Tổng tiền</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell>Ngày tạo</TableCell>
                                                    <TableCell style={{ width: 150 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rowBoughts.length ? rowBoughts.map((row, key) => (
                                                    <TableRow key={`order-bought-${row.id}`}>
                                                        <TableCell>
                                                            {renderPackage(row.productData)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.code}
                                                        </TableCell>
                                                        <TableCell>{formatMoney(row.total_price)}</TableCell>
                                                        <TableCell>{renderStatusText(row)}</TableCell>
                                                        <TableCell>{formatTime(row.createdAt)}</TableCell>
                                                        <TableCell>
                                                            {renderAction(row)}
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={10} align="center">Không có dữ liệu để hiển thị</TableCell>
                                                        </TableRow>
                                                    )}
                                            </TableBody>
                                        </Table>
                                        {totalBought > 10 && (
                                            <div className="customSelector custom-svg">
                                                <Pagination className="pagination-crm" current={pageBought} pageSize={rowsPerPage} total={totalBought} onChange={(p, s) => handleChangePageBought(p)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div >
                        </PortletBody>
                    </Portlet>
                </TabPane>
            </Tabs>
            <Modal
                title='Chi tiết đơn hàng'
                visible={orderView ? true : false}
                onOk={() => setOrderView('')}
                onCancel={() => setOrderView('')}
                footer={[
                    <Button type="primary" onClick={() => setOrderView('')}>
                        OK
                    </Button>
                ]}
            >
                <div className="form-group">
                    {orderView && (
                        <table className="table table-striped table-bordered">
                            <tbody>
                                <tr>
                                    <td className="fontBold">Mã đơn hàng</td>
                                    <td>{orderView.code}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Tên khách hàng</td>
                                    <td>{orderView.customer.name}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Email khách hàng</td>
                                    <td>{orderView.customer.email}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">SĐT</td>
                                    <td>{orderView.customer.mobile}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Gói</td>
                                    <td>
                                        {renderPackage(orderView.productData)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Tổng tiền</td>
                                    <td>{formatMoney(orderView.total_price)}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Thời gian</td>
                                    <td>{formatTime(orderView.createdAt)}</td>
                                </tr>
                                <tr>
                                    <td className="fontBold">Trạng thái</td>
                                    <td>
                                        {renderStatusText(orderView)}
                                    </td>
                                </tr>

                                {(orderView.status == 1 || orderView.status == 2) ? (
                                    <tr>
                                        <td className="fontBold">{orderView.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                        <td>{orderView.note_pay}</td>
                                    </tr>
                                ) : ''}

                            </tbody>
                        </table>
                    )}

                </div>
            </Modal>
            <Modal
                title='Chi tiết đơn hàng'
                visible={orderViewBought ? true : false}
                onOk={() => setOrderViewBought('')}
                onCancel={() => setOrderViewBought('')}
                footer={[
                    <Button type="primary" onClick={() => setOrderViewBought('')}>
                        OK
                    </Button>
                ]}
            >
                <div className="form-group">
                    {orderViewBought && (
                        <table className="table table-striped table-bordered">
                            <tbody>
                                <tr>
                                    <td className="fontBold">Mã đơn hàng</td>
                                    <td>{orderViewBought.code}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Gói</td>
                                    <td>
                                        {renderPackage(orderViewBought.productData)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Tổng tiền</td>
                                    <td>{formatMoney(orderViewBought.total_price)}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Chiết khấu</td>
                                    <td>{orderViewBought.discount} %</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Thời gian</td>
                                    <td>{formatTime(orderViewBought.createdAt)}</td>
                                </tr>
                                <tr>
                                    <td className="fontBold">Trạng thái</td>
                                    <td>
                                        {renderStatusText(orderViewBought)}
                                    </td>
                                </tr>

                                {(orderViewBought.status == 1 || orderViewBought.status == 2) ? (
                                    <tr>
                                        <td className="fontBold">{orderViewBought.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                        <td>{orderViewBought.note_pay}</td>
                                    </tr>
                                ) : ''}

                            </tbody>
                        </table>
                    )}

                </div>
            </Modal>

            <Modal
                title='Chi tiết đơn hàng'
                visible={orderViewWholeSale ? true : false}
                onOk={() => setOrderViewWholeSale('')}
                onCancel={() => setOrderViewWholeSale('')}
                footer={[
                    <Button type="primary" onClick={() => setOrderViewWholeSale('')}>
                        OK
                                </Button>
                ]}
            >
                <div className="form-group">
                    {orderViewWholeSale && (
                        <table className="table table-striped table-bordered">
                            <tbody>
                                <tr>
                                    <td className="fontBold">Mã đơn hàng</td>
                                    <td>{orderViewWholeSale.code}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Nhà phân phối mua</td>
                                    <td>{orderViewWholeSale.distributorBuy.email}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Gói</td>
                                    <td>
                                        {renderPackage(orderViewWholeSale.productData)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Tổng tiền key</td>
                                    <td>{formatMoney(orderViewWholeSale.origin_price)}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Chiết khấu</td>
                                    <td>{orderViewWholeSale.discount}%</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Tổng tiền đơn hàng</td>
                                    <td>{formatMoney(orderViewWholeSale.total_price)}</td>
                                </tr>

                                <tr>
                                    <td className="fontBold">Thời gian</td>
                                    <td>{formatTime(orderViewWholeSale.createdAt)}</td>
                                </tr>
                                <tr>
                                    <td className="fontBold">Trạng thái</td>
                                    <td>
                                        {renderStatusText(orderViewWholeSale)}
                                    </td>
                                </tr>

                                {(orderViewWholeSale.status == 1 || orderViewWholeSale.status == 2) ? (
                                    <tr>
                                        <td className="fontBold">{orderViewWholeSale.status == 1 ? 'Hình thức thanh toán' : 'Lý do huỷ'}</td>
                                        <td>{orderViewWholeSale.note_pay}</td>
                                    </tr>
                                ) : ''}
                            </tbody>
                        </table>
                    )}

                </div>
            </Modal>
        </>)
}