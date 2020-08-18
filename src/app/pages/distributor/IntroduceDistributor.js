/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card, Col } from "react-bootstrap";
import TextAreaForm from '../../partials/common/TextAreaForm';
import SelectProductPackage from './SelectProductPackage';
import { LIST_PACKAGE, TOTAL_PRICE_DISTRIBUTOR } from '../../config/product';
import { formatMoney } from '../../libs/money';
import { validateEmail, validateMobile, validateSpecialCharEmail, validateName } from "../../libs/utils";
import clsx from 'clsx';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const IntroduceDistributor = (props) => {
    // Example 1
    const [dataAdd, setData] = useState({ email: '', name: '', mobile: '', password: '' });
    const [dataPackage, setDataPackage] = useState({});
    const [isLoadContinue, setLoadContinue] = useState(false);
    const [isLoadSubmit, setLoadSubmit] = useState(false);
    const [step, setStep] = useState(0);
    const inputNameRef = React.createRef();
    const inputEmailRef = React.createRef();
    const inputMobileRef = React.createRef();
    const inputPasswordRef = React.createRef();
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        introDistributor: 'intro-distributor'
    }

    useEffect(() => {
        let check = checkPermission(permissions.introDistributor);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const enableLoadContinue = () => {
        setLoadContinue(true);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const disableLoadContinue = () => {
        setLoadContinue(false);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const enableLoadSubmit = () => {
        setLoadSubmit(true);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const disableLoadSubmit = () => {
        setLoadSubmit(false);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.name) {
            inputNameRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên nhà phân phối');
        }

        if (!validateName(dataAdd.name)) {
            inputNameRef.current.focus();
            return showErrorMessage('Tên nhà phân phối không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.email) {
            inputEmailRef.current.focus();
            return showErrorMessage('Vui lòng nhập thông tin email');
        }

        if (dataAdd.email && !validateEmail(dataAdd.email)) {
            inputEmailRef.current.focus();
            return showErrorMessage('Vui lòng nhập email hợp lệ')
        }

        if (dataAdd.email && !validateSpecialCharEmail(dataAdd.email)) {
            inputEmailRef.current.focus();
            return showErrorMessage('Email không được chứa ký tự đặc biệt')
        }

        if (!dataAdd.mobile) {
            inputMobileRef.current.focus();
            return showErrorMessage('Vui lòng nhập số điện thoại');
        }

        if (dataAdd.mobile) {
            if (!validateMobile(dataAdd.mobile)) {
                inputMobileRef.current.focus();
                return showErrorMessage('Vui lòng nhập số điện thoại hợp lệ')
            }
        }

        if (!dataAdd.password) {
            inputPasswordRef.current.focus();
            return showErrorMessage("Vui lòng nhập mật khẩu");
        }

        enableLoadContinue();
        makeRequest('get', `distributor/getDistributorByEmail?email=${dataAdd.email}`).then(({ data }) => {
            if (data.signal) {
                if (!data.data) {
                    setStep(1)
                } else {
                    showErrorMessage('Email đã tồn tại')
                }
                disableLoadContinue();
            }
        })
            .catch(err => {
                disableLoadContinue();
                console.log(err)
            })
    }

    const submitDistributor = () => {
        if (!dataAdd.level) {
            return showErrorMessage('Vui lòng chọn cấp nhà phân phối');
        }

        let totalPrice = 0;
        let products = [];
        LIST_PACKAGE.forEach(it => {
            totalPrice += (dataPackage[it.id] || 0) * it.price;
            if (dataPackage[it.id]) {
                products.push({
                    package_id: it.id,
                    quantity: dataPackage[it.id]
                })
            }
        })

        if (dataAdd.level == 1 && totalPrice < TOTAL_PRICE_DISTRIBUTOR.lv1) {
            return showErrorMessage(`Tổng tiền key phải từ ${formatMoney(TOTAL_PRICE_DISTRIBUTOR.lv1)} để đăng ký nhà phân phối Kim Cương`);
        }

        if (dataAdd.level == 2 && totalPrice < TOTAL_PRICE_DISTRIBUTOR.lv2) {
            return showErrorMessage(`Tổng tiền key phải từ ${formatMoney(TOTAL_PRICE_DISTRIBUTOR.lv2)} để đăng ký nhà phân phối Hồng Ngọc`);
        }

        if (dataAdd.level == 3 && totalPrice < TOTAL_PRICE_DISTRIBUTOR.lv3) {
            return showErrorMessage(`Tổng tiền key phải từ ${formatMoney(TOTAL_PRICE_DISTRIBUTOR.lv3)} để đăng ký nhà phân phối Vàng`);
        }

        enableLoadSubmit();
        makeRequest('post', `distributor/introDistributor`, { ...dataAdd, products })
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Giới thiệu nhà phân phối thành công!');
                    props.history.push('/distributor/all-intro');
                } else {
                    showErrorMessage(data.message);
                }
                disableLoadSubmit();
            })
            .catch(err => {
                disableLoadSubmit();
                console.log('++++++++++++++++', err);
            })
    }

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        {/* <span className="kt-section__sub">
                            Add New User
                        </span> */}
                        <Card >
                            <Card.Body>
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label font-weight-bolder text-dark">
                                        {step === 0 ? "Thông tin nhà phân phối" : "Đơn hàng điều kiện"}
                                    </span>
                                </h3>

                                {step === 0 && (
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formBasicName">
                                                <Form.Label className="starDanger">Tên nhà phân phối</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputNameRef} autoFocus placeholder="" value={dataAdd.name && dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formBasicEmail">
                                                <Form.Label className="starDanger">Email</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputEmailRef} placeholder=""
                                                    value={dataAdd.email && dataAdd.email || ''} onChange={(e) => onChangeValue('email', e.target.value)} />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formBasicMobile">
                                                <Form.Label className="starDanger">Số điện thoại</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputMobileRef} placeholder=""
                                                    value={dataAdd.mobile && dataAdd.mobile || ''} onChange={(e) => onChangeValue('mobile', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formBasicDesc">
                                                <Form.Label className="starDanger">Mật khẩu</Form.Label>
                                                <Form.Control type="password" maxLength={255} ref={inputPasswordRef} placeholder=""
                                                    value={dataAdd.password && dataAdd.password || ''} onChange={(e) => onChangeValue('password', e.target.value)} />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formBasicPassword">
                                                <Form.Label>Mô tả</Form.Label>
                                                <TextAreaForm
                                                    type="description"
                                                    placeholder=""
                                                    value={dataAdd.description || ''}
                                                    onChangeValue={(value) => { onChangeValue('description', value) }}
                                                />
                                            </Form.Group>
                                            {/* <Form.Group as={Col} controlId="formBasicRePassword">
                                                <Form.Label className="starDanger">Cấp nhà phân phối</Form.Label>
                                                <SelectForm
                                                    optionData={[{n: 'Kim Cương', lv: 1}, {n: 'Hồng Ngọc', lv: 2}, {n: 'Vàng', lv: 3}]}
                                                    keyString="lv"
                                                    labelString="n"
                                                    value={dataAdd.level || ''}
                                                    onChangeValue={(value) => { onChangeValue('level', value) }}
                                                />
                                            </Form.Group> */}

                                        </Form.Row>
                                        <div className="kt-login__actions">
                                            <Link to="/distributor/all-intro" style={{ marginRight: '5px' }}>
                                                <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                            </Link>
                                            <Button variant="primary" type="submit" className={`btn-elevate kt-login__btn-secondary ${clsx(
                                                {
                                                    "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoadContinue
                                                }
                                            )}`} disabled={isLoadContinue === true ? true : false}>
                                                Tiếp tục
                                            </Button>
                                        </div>
                                    </Form>
                                )}

                                {step === 1 && (
                                    <SelectProductPackage
                                        updateStep={(st) => setStep(st)}
                                        updateQuantity={(data) => setDataPackage(data)}
                                        dataPackage={dataPackage}
                                        submitDistributor={submitDistributor}
                                        dataAdd={dataAdd}
                                        onChangeValue={onChangeValue}
                                        isLoadSubmit={isLoadSubmit}
                                        loadingButtonStyle={loadingButtonStyle}
                                        isIntro={true}
                                    />
                                )}


                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

export default IntroduceDistributor;