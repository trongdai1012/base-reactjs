import React, { useState, useEffect } from "react";
import { Tabs } from 'antd';
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import { formatMoney } from '.././../libs/money';
import makeRequest from '../../libs/request';
import Loading from '../loading';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
const { TabPane } = Tabs;

export default function TopDistributor(props) {
    const [listTop, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [activeKey, setActiveKey] = useState("1");
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getTopDistri: 'top-distributor'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getTopDistri)
        if (check == 1) {
            makeRequest('get', `distributor/top`, {})
                .then(({ data }) => {
                    if (data.signal) {
                        setData(data.data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    console.log(err)
                })
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const callback = (key) => {
        setActiveKey(key);
    }

    if (isLoading) return <Loading />

    return (
        <>
            <Portlet>
                <Tabs style={{ paddingLeft: '10px' }} defaultActiveKey="1" activeKey={activeKey} onChange={callback}>
                    <TabPane tab="Top bán sỉ" key="1">
                        <PortletBody fit={true}>
                            <div className="row" style={{ padding: '20px' }}>
                                <div className="col-md-3">
                                    <div className="text-center">
                                        <img src="/images/medal.jpg" />
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="fontBold text-center">STT</th>
                                                    <th className="fontBold text-center">Nhà phân phối</th>
                                                    <th className="fontBold text-center">Doanh thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    listTop.TopWholeSale.map((item, idx) => {
                                                        return (
                                                            <tr key={`top-${idx}`}>
                                                                <td className="text-center">
                                                                    <span className="">{idx + 1}</span>
                                                                </td>
                                                                <td className="text-center">{item.distributor.name}</td>
                                                                <td className="text-center">{formatMoney(item.total_amount)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </PortletBody>
                    </TabPane>
                    <TabPane tab="Top bán lẻ" key="2">
                        <PortletBody fit={true}>
                            <div className="row" style={{ padding: '20px' }}>
                                <div className="col-md-3">
                                    <div className="text-center">
                                        <img src="/images/medal.jpg" />
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="fontBold text-center">STT</th>
                                                    <th className="fontBold text-center">Nhà phân phối</th>
                                                    <th className="fontBold text-center">Doanh thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    listTop.TopRetail.map((item, idx) => {
                                                        return (
                                                            <tr key={`top-${idx}`}>
                                                                <td className="text-center">
                                                                    <span className="">{idx + 1}</span>
                                                                </td>
                                                                <td className="text-center">{item.distributor.name}</td>
                                                                <td className="text-center">{formatMoney(item.total_amount)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </PortletBody>
                    </TabPane>
                    <TabPane tab="Top giới thiệu" key="3">
                        <PortletBody fit={true}>
                            <div className="row" style={{ padding: '20px' }}>
                                <div className="col-md-3">
                                    <div className="text-center">
                                        <img src="/images/medal.jpg" />
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="fontBold text-center">STT</th>
                                                    <th className="fontBold text-center">Nhà phân phối</th>
                                                    <th className="fontBold text-center">Doanh thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    listTop.listTopIntro.map((item, idx) => {
                                                        return (
                                                            <tr key={`top-${idx}`}>
                                                                <td className="text-center">
                                                                    <span className="">{idx + 1}</span>
                                                                </td>
                                                                <td className="text-center">{item.name}</td>
                                                                <td className="text-center">{formatMoney(item.total_price)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </PortletBody>
                    </TabPane>
                </Tabs>
            </Portlet>
        </>
    );
}
