import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { DATA_PACKAGE, LIST_PACKAGE_SELL, TYPE_PAYMENT } from '../../config/product';
import { Button, Form, Card, Col, Container, Row } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile, validateMaxLength, validateMinLength } from "../../libs/utils";
import PackageLabel from '../../partials/common/PackageLabel';
import { formatMoney } from '../../libs/money';

const LinkPayment = (props) => {
    const [ dataPayment, setPayment ] = useState('');
    const { code } = props.match.params;

    let orderData = dataPayment.orderData || {};
    let paymentBank = dataPayment.paymentBank || [];

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
    return (
        <>
        <div className="kt-grid kt-grid--ver kt-grid--root">
            <div className="kt-grid__item kt-grid__item--fluid kt-grid">
                <div className="kt-error-v1__container">
                    <Card>
                        <Card.Body>
                            <Container>
                                <Row>
                                    <Col md={{ span: 6, offset: 3 }}>
                                        <h3>THÔNG TIN ĐƠN HÀNG</h3>
                                        <p>
                                            Mã đơn hàng: {code}
                                        </p>
                                        { orderData.id  && (
                                            <>
                                                <p>
                                                    Gói:  <PackageLabel packageData={{ id: orderData.productData[0].package_id, name: DATA_PACKAGE[orderData.productData[0].package_id] }}/>
                                                </p>
                                                <p>
                                                    Tổng tiền: {formatMoney(orderData.total_price)} VNĐ
                                                </p>
                                            </>
                                        )}
                                        
                                    </Col>

                                    { paymentBank.length > 0 &&  (
                                        <Col md={{ span: 6, offset: 3 }}>
                                            <h3>THÔNG TIN THANH TOÁN</h3>
                                            <p>
                                                Ngân hàng: {paymentBank[0].bank_name}
                                            </p>
                                            <p>
                                                Chi nhánh: {paymentBank[0].branch}
                                            </p>
                                            <p>
                                                Số tài khoản: {paymentBank[0].bank_no}
                                            </p>
                                            <p>
                                                Chủ tài khoản: {paymentBank[0].owner}
                                            </p>
                                        </Col>
                                    )}
                                    
                                </Row>
                            </Container>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
        </>
  );
}

export default LinkPayment;