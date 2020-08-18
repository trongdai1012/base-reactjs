import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Button, Form, Card, Col } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile } from "../../libs/utils";
import PackageLabel from '../../partials/common/PackageLabel';
import { formatMoney } from '../../libs/money';

const LinkPayment = (props) => {
    const [dataAdd, setData] = useState({ package_id: 0 });
    const [dataPayment, setPayment] = useState('');
    const { code } = props.match.params;

    useEffect(() => {
        makeRequest('get', `customer/getCode/${code}`, {})
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
    }, []);

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataPayment) {
            showErrorMessage('Link invalid');
        }

        if (!dataAdd.email) {
            return showErrorMessage('Vui lòng nhập email');
        }
        if (!dataAdd.mobile) {
            return showErrorMessage('Vui lòng nhập số điện thoại');
        }

        if (dataAdd.email && !validateEmail(dataAdd.email)) {
            return showErrorMessage('Vui lòng nhập email hợp lệ')
        }
        if (dataAdd.mobile) {
            if (!validateMobile(dataAdd.mobile)) {
                return showErrorMessage('Vui lòng nhập số điện thoại hợp lệ')
            }
        }

        if (!dataAdd.name) {
            return showErrorMessage('Vui lòng nhập tên');
        }

        makeRequest('post', `order/guest/requestOrder`, { ...dataAdd, code })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Gửi yêu cầu thành công')
                    props.history.push(`/payment/order/${data.data.code}`)
                } else {
                    return showErrorMessage(data.message);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    return (
        <>
            <div className="kt-grid kt-grid--ver kt-grid--root">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid">
                    <div className="kt-error-v1__container">
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>APP KICKENGLISH</Form.Label>
                                            {dataPayment && (
                                                <>
                                                    <PackageLabel packageData={dataPayment.packageData} />
                                                    <p>Giá: {formatMoney(dataPayment.packageData.price)} VNĐ</p>
                                                </>
                                            )}

                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicEmail">
                                            <Form.Label className="starDanger">Địa chỉ email</Form.Label>
                                            <InputForm
                                                type="email"
                                                placeholder=""
                                                value={dataAdd.email || ''}
                                                onChangeValue={(value) => { onChangeValue('email', value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicName">
                                            <Form.Label className="starDanger">Họ và tên</Form.Label>
                                            <InputForm
                                                type="text"
                                                placeholder=""
                                                value={dataAdd.name || ''}
                                                onChangeValue={(value) => { onChangeValue('name', value) }}
                                            />
                                        </Form.Group>

                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicName">
                                            <Form.Label className="starDanger">Số điện thoại</Form.Label>
                                            <InputForm
                                                type="text"
                                                placeholder=""
                                                value={dataAdd.mobile || ''}
                                                onChangeValue={(value) => { onChangeValue('mobile', value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicName">
                                            <Form.Label className="starDanger">Mã giảm giá</Form.Label>
                                            <InputForm
                                                type="text"
                                                placeholder=""
                                                value={dataAdd.code || ''}
                                                onChangeValue={(value) => { onChangeValue('code', value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <div className="kt-login__actions">
                                        <Button variant="primary" type="submit">
                                            Tạo đơn hàng
                                    </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LinkPayment;