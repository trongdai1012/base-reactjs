/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useRef } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import SelectForm from '../../partials/common/SelectForm';
import { Form, Card } from "react-bootstrap";
import ButtonLoading from "../../partials/common/ButtonLoading";
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    RadioGroup,
    FormControlLabel,
    Radio
} from "@material-ui/core";
import { DatePicker } from "antd";
import { validateName } from "../../libs/utils";
import checkPermission from '../../libs/permission';

const AddCampaign = (props) => {
    const [dataAdd, setData] = useState({});
    const [isloading, setLoading] = useState(false);
    const [isRequested, setRequested] = useState(false);
    const inputNameRef = useRef();
    const [listPackage, setPackage] = useState([]);
    const [campaignDetail, setCampaignDetail] = useState([{ id: 1, number: '', unit: 0, package_id: '' }]);
    const [lastID, setLastID] = useState(1);
    const dateFormat = 'DD/MM/YYYY HH:mm';
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        addCampaign: 'add-campaign'
    }

    useEffect(() => {
        let check = checkPermission(permissions.addCampaign);
        if (check == 1) {
            fetchPackage();
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    if (isRequested) {
        return <Redirect to="/gift-card/list-campaign" />;
    }

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const onChangeDetail = (key, value, index) => {
        if (key === 'number' && value < 0) value = 0;
        let listDetailObj = [...campaignDetail];
        if (key === 'package_id') {
            let checkExisted = listDetailObj.find(it => it.package_id && it.package_id === value);
            if (checkExisted) return showErrorMessage('Gói đã được cài đặt, vui lòng chọn gói khác')
        }
        listDetailObj.find(it => it.id === index)[key] = value;
        setCampaignDetail(listDetailObj);
    }

    const removeDetail = (e, key) => {
        e.preventDefault();
        let listDetailObj = [...campaignDetail];
        if (listDetailObj.length < 2) {
            return showErrorMessage('Số lượng chi tiết chiến dịch tối thiểu là 1')
        }
        listDetailObj = listDetailObj.filter(it => it.id !== key);
        setCampaignDetail(listDetailObj);
    }

    const onChangeStartDate = (date) => {
        if (dataAdd.endDate && dataAdd.endDate < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataAdd,
            startDate: date
        });
    }

    const onChangeEndDate = (date) => {
        if (dataAdd.startDate && dataAdd.startDate > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataAdd,
            endDate: date
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.name) {
            inputNameRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên chiến dịch');
        }

        if (!validateName(dataAdd.name)) {
            inputNameRef.current.focus();
            return showErrorMessage('Tên chiến dịch không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.startDate) {
            return showErrorMessage('Vui lòng chọn ngày bắt đầu');
        }

        if (!dataAdd.endDate) {
            return showErrorMessage('Vui lòng chọn ngày kết thúc');
        }

        let isOk = true;
        campaignDetail.forEach(item => {
            if (!item.number) {
                isOk = false;
                return showErrorMessage('Vui lòng nhập số lượng giảm')
            }
            if (!item.unit) {
                isOk = false;
                return showErrorMessage('Vui lòng nhập đơn vị')
            }
            if (!item.package_id) {
                isOk = false;
                return showErrorMessage('Vui lòng chọn gói áp dụng')
            }
        })

        if (!isOk) return;
        setLoading(true);
        makeRequest('post', `coupons/addCampaign`, { data: dataAdd, listPackage: campaignDetail })
            .then(({ data }) => {
                if (data.signal) {
                    resetForm();
                    showSuccessMessageIcon('Tạo chiến dịch thành công');
                    setLoading(false);
                    setRequested(true);
                } else {
                    showErrorMessage(data.message);
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
                console.log('++++++++++++++++', err);
            })
    }

    const resetForm = () => {
        setData({});
    }

    const fetchPackage = () => {
        makeRequest('get', `productpackage/getPackageCampaign`)
            .then(({ data }) => {
                let arrPackage = data.data.map(it => {
                    return {
                        label: `${it.name}`,
                        value: it.id
                    }
                })
                setPackage(arrPackage);
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    function addCampaignDetail(e) {
        e.preventDefault();
        if (campaignDetail.length >= listPackage.length) {
            return showErrorMessage('Số lượng giảm không được nhiều hơn tổng số gói');
        }
        let camDetailTemp = campaignDetail;
        let newLastID = lastID + 1;
        let objDetail = { id: newLastID, number: '', unit: '', package_id: '' };
        setLastID(newLastID);
        camDetailTemp.push(objDetail)
        setCampaignDetail(camDetailTemp);
    }

    return (

        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Tên chiến dịch</p>
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><i className="fa fa-calendar" aria-hidden="true"></i></span>
                                        </div>
                                        <input autoFocus type="text" className="form-control" ref={inputNameRef} value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} placeholder="Tên chiến dịch" />
                                    </div>

                                    <p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Bắt đầu </p>
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><i className="fa fa-clock" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                        <DatePicker
                                            showTime
                                            format={dateFormat}
                                            onChange={onChangeStartDate}
                                            placeholder={'Chọn ngày bắt đầu'}
                                            className="form-control align-input"
                                            value={dataAdd.startDate ? moment(dataAdd.startDate) : ''}
                                        />
                                    </div>

                                    <p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Kết thúc</p>
                                    <div className="input-group mb-3">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><i className="fa fa-clock" aria-hidden="true"></i>
                                            </span>
                                        </div>
                                        <DatePicker
                                            showTime
                                            format={dateFormat}
                                            onChange={onChangeEndDate}
                                            placeholder={'Chọn ngày kết thúc'}
                                            className="form-control align-input"
                                            value={dataAdd.endDate ? moment(dataAdd.endDate) : ''}
                                        />
                                    </div>
                                    {campaignDetail && campaignDetail.map((item, idx) => {
                                        return <div className="row" key={`item-${idx}`}>
                                            <div className="col-md-3"> <p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Giảm</p>
                                                <Form.Group style={{ marginBottom: '0px' }}>
                                                    <Form.Control
                                                        type="number"
                                                        value={item.number || ''}
                                                        onChange={(e) => onChangeDetail('number', e.target.value, item.id)}
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-3"><p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Đơn vị</p>
                                                <Form.Group style={{ marginBottom: '0px' }}>
                                                    <SelectForm
                                                        optionData={[{ value: 0, label: 'Phần trăm' }, { value: 1, label: 'VNĐ' }]}
                                                        keyString="value"
                                                        labelString="label"
                                                        placeholder=""
                                                        value={item.unit || ''}
                                                        onChangeValue={(e) => onChangeDetail('unit', e, item.id)}
                                                    />
                                                </Form.Group>
                                            </div>

                                            <div className="col-md-3 "><p style={{ color: 'black', fontSize: '14px' }} className="starDanger">Gói áp dụng</p>
                                                <RadioGroup
                                                    aria-label="cam-pack"
                                                    name="cam-pack"
                                                    value={item.package_id}
                                                    onChange={(e) => onChangeDetail('package_id', e.target.value, item.id)}
                                                    row
                                                >
                                                    {listPackage && listPackage.map(option => (
                                                        <FormControlLabel
                                                            value={option.value}
                                                            key={option.value}
                                                            control={<Radio />}
                                                            label={option.label}
                                                            checked={option.value == item.package_id}
                                                            row
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                            {campaignDetail.length > 1 && (
                                                <div className="col-md-3 "><p style={{ color: 'black', fontSize: '14px' }}>Action</p>
                                                    <button className="btn btn-danger" onClick={(e) => removeDetail(e, item.id)}>Xóa</button >
                                                </div>
                                            )}

                                        </div>
                                    })}

                                    <div className="col-md-3" style={{ paddingLeft: '0px' }}>
                                        <button className="btn btn-primary" onClick={addCampaignDetail}>Thêm</button>
                                    </div>

                                    <ButtonLoading className="btn btn-primary" type="submit" style={{ marginTop: '15px' }} loading={isloading}>
                                        Tạo chiến dịch
                                    </ButtonLoading>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>

        </>
    );
}

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(AddCampaign);