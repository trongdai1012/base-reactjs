import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile, validateName, validateSpecialCharEmail } from "../../libs/utils";
import { Form } from "react-bootstrap";
import { formatMoney } from '../../libs/money';
import ButtonLoading from "../../partials/common/ButtonLoading";

const PaymentRequest = (props) => {
    const [dataAdd, setData] = useState({ package_id: 0 });
    const [dataPayment, setPayment] = useState('');
    const emailRef = React.createRef();
    const mobileRef = React.createRef();
    const nameRef = React.createRef();
    const [optionPromotion, setOptionPromotion] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { code } = props.match.params;

    const onChangeValue = (key, value) => {
        if (key === 'coupons_code') {
            getCouponsDetailByCode(value);
        }
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataPayment && !dataPayment.dataDistributorLinkpayment) {
            showErrorMessage('Link không hợp lệ');
        }

        if (!dataAdd.name) {
            nameRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên');
        }

        if (!validateName(dataAdd.name)) {
            nameRef.current.focus();
            return showErrorMessage('Tên không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.email) {
            emailRef.current.focus();
            return showErrorMessage('Vui lòng nhập email');
        }

        if (!validateEmail(dataAdd.email)) {
            emailRef.current.focus();
            return showErrorMessage('Vui lòng nhập email hợp lệ');
        }

        if (!validateSpecialCharEmail(dataAdd.email)) {
            emailRef.current.focus();
            return showErrorMessage('Email không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.mobile) {
            mobileRef.current.focus();
            return showErrorMessage('Vui lòng nhập số điện thoại');
        }

        if (!validateMobile(dataAdd.mobile)) {
            mobileRef.current.focus();
            return showErrorMessage('Vui lòng nhập số điện thoại hợp lệ');
        }

        let collaborator_id = dataPayment.dataCollaborator ? dataPayment.dataCollaborator.id : null;
        setIsLoading(true);
        makeRequest('post', `order/guest/requestOrder`, { ...dataAdd, code, collaborator_id })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Gửi yêu cầu thành công')
                    props.history.push(`/payment/order/${data.data.code}`)
                } else {
                    showErrorMessage(data.message);
                }
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                console.log('++++++++++++++++', err)
            })
    }

    const getCouponsDetailByCode = (code) => {
        makeRequest('get', `coupons/guestGetCouponsByCode`, { coupons_code: code })
            .then(({ data }) => {
                if (data.signal) {
                    setOptionPromotion(data.data)
                } else {
                    showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    useEffect(() => {
        makeRequest('get', `customer/getCode/${code}${props.location.search}`, {})
            .then(({ data }) => {
                if (data.signal) {
                    if (!data.data) {
                        showErrorMessage('Link không hợp lệ');
                    } else {
                        setPayment(data.data);
                    }
                } else {
                    showErrorMessage('Link không hợp lệ');
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }, [])

    const render1M = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <h2 className="pricing-table__title">GÓI FREE 1 THÁNG</h2>
                <h4 className="pricing-table__subtitle">Dành cho những người mong muốn cải thiện tiếng Anh trong ngắn hạn.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val">FREE</span></div>
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 1 tháng.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const render3M = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <img src="/images/key-3-thang.png" alt="Gói free 1 tháng" className="img-package"/>
                <h2 className="pricing-table__title">GÓI 3 THÁNG</h2>
                <h4 className="pricing-table__subtitle">Dành cho những người mong muốn cải thiện tiếng Anh trong ngắn hạn.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 2 ? <div className="line-through" style={{fontSize: '36px'}}>499,000 đ</div> : '499,000 đ'}</span></div>
            {optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 2 &&
                <div className="pricing-table__price" style={{paddingTop: '0px'}}><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{formatMoney(499000 - (optionPromotion.campaignPackageData.number * 499000 / 100))} đ</span></div>
                || null}
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 3 tháng.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const render1Y = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <img src="/images/key-1-nam.png" alt="Gói free 1 tháng" className="img-package" />
                <h2 className="pricing-table__title">GÓI 1 NĂM</h2>
                <h4 className="pricing-table__subtitle">01 năm cho những sự thay đổi đến bất ngờ từ nghe nói đến kiến thức.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 3 ? <div className="line-through" style={{fontSize: '36px'}}>999,000 đ</div> : '999,000 đ'}</span></div>
            {optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 3 &&
                <div className="pricing-table__price" style={{paddingTop: '0px'}}><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{formatMoney(999000 - (optionPromotion.campaignPackageData.number * 999000 / 100))} đ</span></div>
                || null}
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 1 năm.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const renderNY = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <img src="/images/key-tron-doi.png" alt="Gói free 1 tháng" className="img-package" />
                <h2 className="pricing-table__title">GÓI TRỌN ĐỜI</h2>
                <h4 className="pricing-table__subtitle">Để tiếng Anh trở thành ngôn ngữ thứ 2. Thời gian học trọn đời với giá ưu đãi tốt nhất.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 4 ?  <div className="line-through" style={{fontSize: '36px'}}>1,999,000 đ</div> : '1,999,000 đ'}</span></div>
            {optionPromotion && optionPromotion.campaignPackageData && optionPromotion.campaignPackageData.package_id === 4 &&
                <div className="pricing-table__price" style={{paddingTop: '0px'}}><span className="pricing-table__price-val" style={{fontSize: '36px'}}>{formatMoney(1999000 - (optionPromotion.campaignPackageData.number * 1999000 / 100))} đ</span></div>
                || null}
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập và cập nhật bài học trọn đời.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                    <div className="pricing-feature__inner"><i className="flaticon2-check-mark"></i><span className="pricing-feature__text">Số lượng có giới hạn, sẽ ngừng bán bất kỳ thời điểm nào</span></div>
                </div>

            </div>
        </div>)
    }

    const renderPackage = () => {
        if (!dataPayment.dataDistributorLinkpayment && !dataPayment.packageData) return '';
        if (dataPayment.dataDistributorLinkpayment && dataPayment.dataDistributorLinkpayment.packageData.id === 1 || dataPayment.packageData && dataPayment.packageData.id === 1) return render1M();
        if (dataPayment.dataDistributorLinkpayment && dataPayment.dataDistributorLinkpayment.packageData.id === 2 || dataPayment.packageData && dataPayment.packageData.id === 2) return render3M();
        if (dataPayment.dataDistributorLinkpayment && dataPayment.dataDistributorLinkpayment.packageData.id === 3 || dataPayment.packageData && dataPayment.packageData.id === 3) return render1Y();
        if (dataPayment.dataDistributorLinkpayment && dataPayment.dataDistributorLinkpayment.packageData.id === 4 || dataPayment.packageData && dataPayment.packageData.id === 4) return renderNY();
    }

    return (
        <div className="header">
            <div className="container">
                <h1 className="text-center logo" style={{ backgroundColor: '#61016A' }}>
                    <img src="/media/logos/logo-kickenglish-200.webp" />
                </h1>
                <div className="row">
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                        {renderPackage()}
                    </div>
                    <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8">
                        <div className="clearfix">
                            {dataPayment.dataDistributorLinkpayment && (
                                dataPayment.dataDistributorLinkpayment.packageData.id != 1 ? (<h2>Bước 1/2: Đặt mua</h2>) : (<h2>Gửi yêu cầu</h2>)
                            )}
                            {dataPayment && !dataPayment.dataDistributorLinkpayment && (
                                dataPayment.packageData.id != 1 ? (<h2>Bước 1/2: Đặt mua</h2>) : (<h2>Gửi yêu cầu</h2>)
                            )}
                        </div>
                        <hr />
                        <div className="alert alert-info">
                            <span className="glyphicon glyphicon-info-sign" />
                            <span>Vui lòng điền đầy đủ thông tin của bạn để được hưởng đầy đủ các quyền lợi về sau.</span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group form-name">
                                <label htmlFor="exampleInputEmail1" className="starDanger">Họ tên</label>

                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={dataAdd.name || ''}
                                    onChange={(value) => { onChangeValue('name', value.target.value) }}
                                    autoFocus
                                    ref={nameRef}
                                />
                            </div>
                            <div className="form-group form-email">
                                <label htmlFor="exampleInputPassword1" className="starDanger">Email thường dùng</label>
                                <Form.Control
                                    type="email"
                                    placeholder=""
                                    value={dataAdd.email || ''}
                                    onChange={(value) => { onChangeValue('email', value.target.value) }}
                                    ref={emailRef}
                                />
                            </div>
                            <div className="form-group form-mobile">
                                <label htmlFor="exampleInputFile" className="starDanger">Số điện thoại</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={dataAdd.mobile || ''}
                                    onChange={(value) => { onChangeValue('mobile', value.target.value) }}
                                    ref={mobileRef}
                                />
                            </div>
                            <div className="form-group form-mobile">
                                <label htmlFor="exampleInputFile">Địa chỉ</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={dataAdd.address || ''}
                                    onChange={(value) => { onChangeValue('address', value.target.value) }}
                                />
                            </div>
                            <div className="form-group form-gift">
                                <label htmlFor="exampleInputFile">Mã giảm giá (nếu có)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    value={dataAdd.coupons_code || ''}
                                    onChange={(value) => { onChangeValue('coupons_code', value.target.value) }}
                                />
                            </div>
                            <div className="text-right">
                                <ButtonLoading type="submit" loading={isLoading} className="btn btn-success btn-buy" frm="onnet">
                                    Đặt mua &nbsp;<span className="glyphicon glyphicon-arrow-right" />
                                </ButtonLoading>
                            </div>
                        </form>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col-xs-12 col-xs-offset-1 col-sm-12 col-sm-offset-1 col-md-12 col-md-offset-1 col-lg-12 col-lg-offset-1 text-center">
                        <p><span>Mọi thắc mắc vui lòng liên hệ<br /></span></p>
                        <p><span className="glyphicon glyphicon-envelope" /> contact@kickenglish.vn - <span className="glyphicon glyphicon-phone" />0968 919 099</p>
                    </div>
                </div>
            </div>
            <div className="payment-mask"><div className="tableS"><div className="tableCellS"><img src="/images/loading.svg" style={{ width: '70px' }} /></div></div></div>
        </div>
    )
}

export default PaymentRequest;