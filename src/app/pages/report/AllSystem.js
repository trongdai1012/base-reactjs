import React, { useState, useEffect, useRef } from "react";
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import moment from 'moment';
import makeRequest from '../../libs/request';
import ApexCharts from "react-apexcharts";
import { formatMoney } from '../../libs/money';
import { DatePicker } from 'antd';
import Loading from '../loading';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
const { RangePicker } = DatePicker;


const AllSystem = (props) => {
    const ref = useRef();
    const [dataRevenueChart, setDataRevenueChart] = useState({});
    const [dataOrderChart, setDataOrderChart] = useState({});
    const [dataSearch, setDataSearch] = useState({ start: moment().subtract(9, 'days').format('DD/MM/YYYY'), end: moment().format('DD/MM/YYYY') });
    const [isLoadOrder, setLoadOrder] = useState(true);
    const [isLoadRevenue, setLoadRevenue] = useState(true);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getReport: 'get-report'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getReport);
        if (check == 1) {
            getRevenue(dataSearch);
            getOrder(dataSearch);
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

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
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return value ? parseInt(value) : 0;
                }
            },
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
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return `${formatMoney(value)} đ`;
                }
            },
        }
    };

    const getRevenue = (date) => {
        setLoadRevenue(true);
        makeRequest('get', `distributor/dataChart`, date)
            .then(({ data }) => {
                if (data.signal) {
                    setDataRevenueChart(data.data)
                }
                setLoadRevenue(false);
            })
            .catch(err => {
                setLoadRevenue(false);
                console.log(err)
            })
    }

    const getOrder = (date) => {
        setLoadOrder(true);
        makeRequest('get', `distributor/dataOrderChart`, date)
            .then(({ data }) => {
                if (data.signal) {
                    setDataOrderChart(data.data)
                }
                setLoadOrder(false);
            })
            .catch(err => {
                setLoadOrder(false);
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

        setDataSearch({
            start: date[0].format('DD/MM/YYYY'),
            end: date[1].format('DD/MM/YYYY')
        });

        getRevenue(objSearch);
        getOrder(objSearch);
    }

    const dateFormat = 'DD/MM/YYYY';

    return (
        <>
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
                                        // defaultValue={[moment().subtract(9, 'days'), moment()]}
                                        format={dateFormat}
                                        onChange={onChangeDate}
                                        placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {isLoadOrder || isLoadRevenue ? <Loading /> :
                        <>
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
                            </div>

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

                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="kt-widget14">
                                        <div className="kt-widget14__header kt-margin-b-30">
                                            <h3 className="kt-widget14__title">Biểu đồ doanh thu</h3>
                                        </div>
                                        <div className="kt-widget14__chart">
                                            <div id="chart-revenue">
                                                <ApexCharts options={getOptionsRevenue} series={getSeriesRevenue} type="line" height={350} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>}
                </PortletBody>
            </Portlet>
        </>
    );
}

export default AllSystem;
