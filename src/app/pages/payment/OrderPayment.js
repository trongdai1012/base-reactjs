import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import InputForm from '../../partials/common/InputForm';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile, validateMaxLength, validateMinLength } from "../../libs/utils";
import { formatMoney } from '../../libs/money';
import { Button, Form, Card, Col, Container, Row } from "react-bootstrap";
import { Tabs } from 'antd';
import { BankOutlined, QrcodeOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const PaymentRequest = (props) => {
    const [ dataPayment, setPayment ] = useState('');
    const { code } = props.match.params;

    let orderData = dataPayment.orderData || {};
    let paymentBank = dataPayment.paymentBank || [];
    let paymentGem = dataPayment.paymentGem || "";

    useEffect(() => {
        makeRequest('get', `customer/getOrder/${code}`, {})
            .then(({ data }) => {
                if (data.signal) {
                    if (!data.data) {
                        showErrorMessage('Link invalid');
                    } else {
                        setPayment(data.data);
                    }
                } else {
                    showErrorMessage('Link invalid');
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
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 1 tháng.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const render3M = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <h2 className="pricing-table__title">GÓI 3 THÁNG</h2>
                <h4 className="pricing-table__subtitle">Dành cho những người mong muốn cải thiện tiếng Anh trong ngắn hạn.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val">499,000 đ</span></div>
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 3 tháng.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const render1Y = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <h2 className="pricing-table__title">GÓI 1 NĂM</h2>
                <h4 className="pricing-table__subtitle">01 năm cho những sự thay đổi đến bất ngờ từ nghe nói đến kiến thức.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val">999,000 đ</span></div>
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập bài học trong 1 năm.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
            </div>
        </div>)
    }

    const renderNY = () => {
        return (<div className="pricing-table">
            <div className="pricing-table__heading">
                <h2 className="pricing-table__title">GÓI TRỌN ĐỜI</h2>
                <h4 className="pricing-table__subtitle">Để tiếng Anh trở thành ngôn ngữ thứ 2. Thời gian học trọn đời với giá ưu đãi tốt nhất.</h4>
            </div>
            <div className="pricing-table__price"><span className="pricing-table__price-val">1,999,000 đ</span></div>
            <div className="pricing-table__features">
                <div className="pricing-feature pricing-feature-7db9d5d item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Truy cập và cập nhật bài học trọn đời.</span></div>
                </div>
                <div className="pricing-feature pricing-feature-33b8361 item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Trí tuệ thông minh nhân tạo hỗ trợ</span></div>
                </div>
                <div className="pricing-feature pricing-feature-136f76b item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">3000+ video, audio, infographic và kho dữ liệu thực hành mỗi ngày</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Có lộ trình học tiếng anh cá nhân hóa riêng</span></div>
                </div>
                <div className="pricing-feature pricing-feature-d8de51f item-included">
                <div className="pricing-feature__inner"><i class="flaticon2-check-mark"></i><span className="pricing-feature__text">Số lượng có giới hạn, sẽ ngừng bán bất kỳ thời điểm nào</span></div>
                </div>
                
            </div>
        </div>)
    }

    const renderPackage = () => {
        if (!orderData.id) return '';
        const package_id = orderData.productData[0].package_id;
        if (package_id == 1) return render1M();
        if (package_id == 2) return render3M();
        if (package_id == 3) return render1Y();
        if (package_id == 4) return renderNY();
    }

    return (
        <div className="header">
            <div className="container">
                <h1 className="text-center logo" style={{backgroundColor: '#61016A'}}>
                    <img src="/media/logos/logo-kickenglish-200.webp" />
                </h1>
                <div className="row">
                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                        {renderPackage()}
                    </div>
                    <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8">
                        <div className="clearfix">
                            { orderData.id && (
                                orderData.productData[0].package_id != 1 ? (<h2>Bước 2/2: THANH TOÁN</h2>) : (<h2>Thành công</h2>)
                            ) }
                        </div>
                        <hr />
                        <Container>
                            <Row>
                                <Col style={{padding: '0px'}}>
                                    <h3>THÔNG TIN ĐƠN HÀNG</h3>
                                    <p className="pricing-table__subtitle">
                                        Mã đơn hàng: {code}
                                    </p>
                                    { orderData.id  && (
                                        
                                        <p className="pricing-table__subtitle">
                                            Tổng tiền: {formatMoney(orderData.total_price)} VNĐ
                                        </p>
                                    )}
                                    
                                </Col>
                                
                            </Row>
                            <h3>THÔNG TIN THANH TOÁN</h3>
                            <Row>
                                <Tabs defaultActiveKey="1" style={{width: '100%'}}>
                                    <TabPane
                                    tab={
                                        <span>
                                        <BankOutlined />
                                        Chuyển khoản ngân hàng
                                        </span>
                                    }
                                    key="1"
                                    >
                                        <p>
                                            Nội dung chuyển khoản: <strong>
                                            HoTen_MaDonHang_KickEnglish
                                            </strong> (Trong đó: dấu _ là dấu cách)
                                        </p>
                                            { paymentBank.map((it, idx) => (
                                                <Row className="bank-container">
                                                    <Col>
                                                        
                                                        <p className="pricing-table__subtitle">
                                                            Ngân hàng: {it.bank_name}
                                                        </p>
                                                        <p className="pricing-table__subtitle">
                                                            Chi nhánh: {it.branch}
                                                        </p>
                                                        <p className="pricing-table__subtitle">
                                                            Số tài khoản: {it.bank_no}
                                                        </p>
                                                        <p className="pricing-table__subtitle">
                                                            Chủ tài khoản: {it.owner}
                                                        </p>
                                                    </Col>
                                                </Row>
                                            ))}
                                        

                                    </TabPane>
                                    { paymentGem && (
                                        <TabPane
                                            tab={
                                                <span>
                                                <QrcodeOutlined />
                                                Gem QRCode
                                                </span>
                                            }
                                            key="2"
                                        >
                                            <div className="text-center">
                                                <img src={paymentGem.gem_qr} width="150"/>
                                            </div>
                                        </TabPane>
                                    ) }
                                    
                                </Tabs>
                            </Row>
                        </Container>
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