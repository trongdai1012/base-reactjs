import React, { useState, useEffect, useRef } from "react";
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import moment from 'moment';
import makeRequest from '../../libs/request';
import ApexCharts from "react-apexcharts";
import { formatMoney } from '../../libs/money';
import InputForm from '../../partials/common/InputForm';
import Loading from '../loading';

const DashboardDistributor = (props) => {
    const ref = useRef();
    const [dataRevenueChart, setDataRevenueChart] = useState({});
    const [dataOrderChart, setDataOrderChart] = useState({});
    const [isLoadOrder, setLoadOrder] = useState(true);
    const [isLoadRevenue, setLoadRevenue] = useState(true);
    const [dataDate, setDataDate] = useState({ start: moment().startOf('month').format('DD/MM/YYYY'), end: moment().format('DD/MM/YYYY') });

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
                    setDataRevenueChart(data.data);
                }
                setLoadRevenue(false);
            })
            .catch(err => {
                setLoadRevenue(false);
                console.log(err)
            })
    }

    const getOrder = (date) => {
        makeRequest('get', `distributor/dataOrderChart`, date)
            .then(({ data }) => {
                if (data.signal) {
                    setDataOrderChart(data.data);
                }
                setLoadOrder(false)
            })
            .catch(err => {
                setLoadOrder(false);
                console.log(err)
            })
    }

    useEffect(() => {
        getRevenue(dataDate);
        getOrder(dataDate);
    }, [])

    if (isLoadRevenue || isLoadOrder) {
        return <Loading />
    }

    return (
        <>
            <Portlet>
                <PortletBody fit={true}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="kt-widget14">
                                <div className="kt-widget14__header kt-margin-b-30">
                                    <h3 className="kt-widget14__title">THÁNG NÀY</h3>
                                </div>
                                <div className="kt-widget14__chart">
                                    <InputForm
                                        type="text"
                                        placeholder=""
                                        value={`${dataDate.start} - ${dataDate.end}`}
                                        onChangeValue={(value) => { }}
                                        isReadOnly={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="kt-widget14">
                                <div className="row">
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon2-analytics-2 text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart && formatMoney(dataRevenueChart.totalAll)}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Doanh thu tháng này</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-primary gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon2-shopping-cart-1 text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart && formatMoney(dataRevenueChart.totalWholeSale)}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Bán sỉ</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-warning gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon-cart text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart && formatMoney(dataRevenueChart.totalRetail)}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Bán lẻ</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-danger gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon-coins text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart && dataRevenueChart.totalCommission && dataRevenueChart.totalCommission.length && dataRevenueChart.totalCommission[0] ? formatMoney(dataRevenueChart.totalCommission) : 0}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Hoa Hồng Giới Thiệu</a>
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
                                    <h3 className="kt-widget14__title">Biểu đồ doanh thu</h3>
                                </div>
                                <div className="kt-widget14__chart">
                                    <div id="chart">
                                        <ApexCharts options={getOptionsRevenue} series={getSeriesRevenue} type="line" height={350} />
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
                                <div className="row">
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon2-analytics-2 text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataOrderChart.totalOrder}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Tổng đơn hàng tháng</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="card card-custom bg-primary gutter-b" style={{ height: '150px' }}>
                                            <div className="card-body">
                                                <i className="flaticon2-shopping-cart-1 text-white icon-2x"> </i>
                                                <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataOrderChart.totalPay}</div>
                                                <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Số đơn đã thanh toán</a>
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

                </PortletBody>
            </Portlet>

        </>
    );
}

export default DashboardDistributor;
