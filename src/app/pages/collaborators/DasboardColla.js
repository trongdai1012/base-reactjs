import React, { useState, useEffect, useRef } from "react";
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import moment from 'moment';
import makeRequest from '../../libs/request';
import ApexCharts from "react-apexcharts";
import { formatMoney } from '../../libs/money';
import Loading from '../loading';
import { DatePicker } from 'antd';
import { connect } from 'react-redux';
const { RangePicker } = DatePicker;


const DashboardColla = (props) => {
    const [dataRevenueChart, setDataRevenueChart] = useState({});
    const [dataSearch, setDataSearch] = useState({ start: moment().subtract(9, 'days').format('DD/MM/YYYY'), end: moment().format('DD/MM/YYYY') });
    const dateFormat = 'DD/MM/YYYY';
    const [listDate, setListDate] = useState([]);
    const [listData, setListData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getRevenue(dataSearch);
    }, [])

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
            categories: listDate || [],
        }
    };

    const getSeriesRevenue = [{
        name: 'Hoa hồng',
        data: listData || []
    }
    ];

    const getRevenue = (date) => {
        setIsLoading(true);
        makeRequest('get', `collaborators/getReportOrder`, date)
            .then(({ data }) => {
                if (data.signal) {
                    setDataRevenueChart(data.data);
                    let dates = [];
                    let datas = [];
                    for (let i = 0; i < data.data.listDate.length; i++) {
                        dates.push(data.data.listDate[i]);
                        let isExist = data.data.listResult.find(it => it.date_col_formed === data.data.listDate[i]);
                        if (isExist) {
                            datas.push(isExist.total_commission);
                        } else {
                            datas.push('0');
                        }
                    }

                    setListData(datas);
                    setListDate(dates);
                }
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
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

        setDataSearch(objSearch);

        getRevenue(objSearch);
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
                                    <RangePicker
                                        defaultValue={[moment().subtract(9, 'days'), moment()]}
                                        format={dateFormat}
                                        onChange={onChangeDate}
                                        placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {isLoading ? <Loading /> :
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="kt-widget14">
                                    <div className="row">
                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-success gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon2-analytics-2 text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart.totalOrder}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Tổng đơn hàng giới thiệu</a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-primary gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon2-shopping-cart-1 text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart.totalOrderSuccess}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Đơn hàng thành công</a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-warning gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon-cart text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart.totalRevenue ? formatMoney(dataRevenueChart.totalRevenue[0]) + ' VNĐ' : '0 VNĐ'}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Doanh thu</a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3">
                                            <div className="card card-custom bg-danger gutter-b" style={{ height: '150px' }}>
                                                <div className="card-body">
                                                    <i className="flaticon-cart text-white icon-2x"> </i>
                                                    <div className="text-inverse-success font-weight-bolder font-size-h2 mt-3">{dataRevenueChart.totalRevenue ? formatMoney(dataRevenueChart.totalCommission) + ' VNĐ' : '0 VNĐ'}</div>
                                                    <a href="#" className="text-inverse-success font-weight-bold font-size-lg mt-1">Hoa hồng</a>
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
                                    <h3 className="kt-widget14__title">Biểu đồ doanh thu và hoa hồng nhận được</h3>
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

        </>
    );
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(DashboardColla);