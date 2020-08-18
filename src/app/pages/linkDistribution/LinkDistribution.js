/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon } from '../../actions/notification';
import {
    makeStyles
} from "@material-ui/core/styles";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DATA_PACKAGE } from '../../config/product';
import { URL_PAYMENT } from '../../config/url';
import QRCode from 'qrcode.react';
import Loading from "../loading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

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

const LinkDistribution = () => {

    const classes1 = useStyles1();
    const [dataLink, setDataLink] = useState([]);
    const [state, setState] = useState({ value: '', copied: false });
    const [isLoading, setLoading] = useState(true);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getLinkDistributor: 'get-link-distri'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getLinkDistributor);
        if (check == 1) {
            getLink({});
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const getLink = () => {
        setLoading(true);
        makeRequest('get', `distributor/linkPayment`)
            .then(({ data }) => {
                if (data.signal) {
                    const res = data.data;
                    setDataLink(res);
                }

                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })
    }

    const renderLink = () => {
        return (dataLink && dataLink.length > 0)
            ? dataLink.map(item => {
                return (
                    <div key={`link-${item.code}`} className="col-xs-12 col-sm-12 col-md-6 col-lg-6  rounded " style={{ marginTop: '20px' }}>
                        <div className="customLink ">
                            <div className="panel border">


                                <div className="panel panel-flat border-top-info" style={{ marginBottom: '20px' }}>
                                    <div className="row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="col-md-12">
                                            <div className="">
                                                <div className="panel-heading" style={{ marginBottom: '10px', marginTop: '20px' }}>
                                                    <h5 className="panel-title"><span style={{ fontWeight: 'bold' }} className="fontBold">Link đăng ký gói {DATA_PACKAGE[item.package_id]}</span></h5>
                                                </div>
                                                <div className="panel-body" >
                                                    <div className="form-group" >
                                                        {/* <p>Link gốc</p> */}
                                                        <div style={{ padding: '10px' }} className="input-group">
                                                            <input readOnly type="text" className="url-free form-control"
                                                                defaultValue={`${URL_PAYMENT}${item.code}`} />
                                                            <CopyToClipboard style={{ marginBottom: '10px' }} text={`${URL_PAYMENT}${item.code}`}
                                                                onCopy={() => {
                                                                    setState({ copied: true })
                                                                    showSuccessMessageIcon('Copy link thành công!')
                                                                }}>
                                                                {/* <button className="btn btn-dark">Copy </button> */}
                                                                <div className="border box-icon rounded border-left-0" >
                                                                    <i className='far fa-clone customIconCopy'></i>
                                                                </div>

                                                            </CopyToClipboard>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                    <div className="row text-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="col-md-12 qr-canvas">
                                            <QRCode value={`${URL_PAYMENT}${item.code}`} />
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                )
            })
            : <div className="row" style={{ marginTop: '20px' }}>
                Không có dữ liệu
        </div>
    }

    if (isLoading) return <Loading />

    return (
        <>

            <div className="row" style={{ marginTop: '40px', backgroundColor: 'white' }}>
                {renderLink()}
            </div>
        </>
    )
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(LinkDistribution);