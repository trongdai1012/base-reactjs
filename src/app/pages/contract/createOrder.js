/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile, validateName, validateSpecialCharEmail } from "../../libs/utils";
import SelectForm from '../../partials/common/SelectForm';
import { LIST_PACKAGE } from '../../config/product';
import { Form, Card, Col } from "react-bootstrap";
import ButtonLoading from "../../partials/common/ButtonLoading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

const CreateOrder = (props) => {
    const [dataAdd, setData] = useState({ package_id: 0 });
    const [isRefuse, setRefuse] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const emailRef = React.createRef();
    const nameRef = React.createRef();
    const mobileRef = React.createRef();
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        createOrder: 'add-order-single'
    }

    useEffect(() => {
        let check = checkPermission(permissions.createOrder);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const enableLoading = () => {
        setLoading(true);
    };

    const disableLoading = () => {
        setLoading(false);
    };

    const onChangeValue = (key, value) => {
        setErrEmail(false);
        setData({
            ...dataAdd,
            [key]: value
        })
        console.log(errEmail)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.package_id) {
            return showErrorMessage('Vui lòng chọn gói');
        }

        if (!dataAdd.email) {
            emailRef.current.focus();
            setErrEmail(true);
            return showErrorMessage('Vui lòng nhập email');
        }

        if (dataAdd.email && !validateEmail(dataAdd.email)) {
            emailRef.current.focus();
            setErrEmail(true);
            return showErrorMessage('Vui lòng nhập email hợp lệ');
        }

        if (!validateSpecialCharEmail(dataAdd.email)) {
            emailRef.current.focus();
            setErrEmail(true);
            return showErrorMessage('Email không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.name) {
            nameRef.current.focus();
            return showErrorMessage('Vui lòng nhập họ và tên');
        }

        if (!validateName(dataAdd.name)) {
            nameRef.current.focus();
            return showErrorMessage('Họ và tên không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.mobile) {
            mobileRef.current.focus();
            return showErrorMessage('Vui lòng nhập số điện thoại');
        }

        if (!validateMobile(dataAdd.mobile)) {
            mobileRef.current.focus();
            return showErrorMessage('Vui lòng nhập số điện thoại hợp lệ')
        }

        enableLoading();
        makeRequest('post', `order/createRetail`, dataAdd)
            .then(({ data }) => {
                setLoading(false)
                if (data.signal) {
                    showSuccessMessageIcon('Tạo đơn hàng thành công')
                    props.history.push('/order/list-single')
                } else {
                    showErrorMessage(data.message);
                }
                disableLoading();
            })
            .catch(err => {
                disableLoading();
                console.log('++++++++++++++++', err)
            })
    }

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section"> <Card>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Row>
                                    <Form.Group as={Col} md={6}>
                                        <Form.Label className="starDanger">Gói</Form.Label>
                                        <SelectForm
                                            optionData={LIST_PACKAGE}
                                            keyString="id"
                                            labelString="name"
                                            value={dataAdd.package_id || ''}
                                            onChangeValue={(value) => { onChangeValue('package_id', value) }}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} md={6} controlId="formBasicEmail">
                                        <Form.Label className="starDanger">Địa chỉ email</Form.Label>
                                        <Form.Control
                                            id="email"
                                            name="email"
                                            type="text"
                                            placeholder=""
                                            value={dataAdd.email || ''}
                                            onChange={(value) => { onChangeValue('email', value.target.value) }}
                                            autoFocus={true}
                                            ref={emailRef}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} md={6} controlId="formBasicName">
                                        <Form.Label className="starDanger">Họ và tên</Form.Label>
                                        <Form.Control
                                            name="name"
                                            type="text"
                                            placeholder=""
                                            value={dataAdd.name || ''}
                                            onChange={(value) => { onChangeValue('name', value.target.value) }}
                                            ref={nameRef}
                                        />
                                    </Form.Group>

                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} md={6} controlId="formBasicName">
                                        <Form.Label className="starDanger">Số điện thoại</Form.Label>
                                        <Form.Control
                                            name="mobile"
                                            type="text"
                                            placeholder=""
                                            value={dataAdd.mobile || ''}
                                            onChange={(value) => { onChangeValue('mobile', value.target.value) }}
                                            ref={mobileRef}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} md={6} controlId="formBasicName">
                                        <Form.Label>Mã giảm giá (nếu có)</Form.Label>
                                        <Form.Control
                                            name="coupons_code"
                                            type="text"
                                            placeholder=""
                                            value={dataAdd.coupons_code || ''}
                                            onChange={(value) => { onChangeValue('coupons_code', value.target.value) }}
                                        />
                                    </Form.Group>
                                </Form.Row>

                                {/* <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicName">
                                            <Form.Label className="starDanger">Mã giảm giá</Form.Label>
                                            <Form.Control type="text" maxLength={255} ref={inputCoupon} placeholder="Enter name" value={dataAdd.coupon || ''} onChange={(e) => onChangeValue('coupon', e.target.value)} />
                                        </Form.Group>
                                    </Form.Row> */}
                                <div className="kt-login__actions">
                                    <Link to="/order/list-single" style={{ marginRight: '5px' }}>
                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                    </Link>
                                    <ButtonLoading className="btn btn-primary" loading={isLoading} type="submit">
                                        Tạo đơn hàng
                                    </ButtonLoading>
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

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(CreateOrder);