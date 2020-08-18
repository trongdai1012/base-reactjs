/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Form, Card, Col } from "react-bootstrap";
import { validateEmail, validateMobile, validateSpecialCharEmail, validateName } from "../../libs/utils";
import ButtonLoading from "../../partials/common/ButtonLoading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const AddCollaboration = (props) => {
    // Example 1
    const [dataAdd, setData] = useState({ email: '', name: '', mobile: '', password: '' });
    const [isLoadSubmit, setLoadSubmit] = useState(false);
    const inputNameRef = React.createRef();
    const inputEmailRef = React.createRef();
    const inputMobileRef = React.createRef();
    const inputPasswordRef = React.createRef();
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        addCollab: 'add-collaborators'
    }

    useEffect(() => {
        let check = checkPermission(permissions.addCollab);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const enableLoadSubmit = () => {
        setLoadSubmit(true);
    };

    const disableLoadSubmit = () => {
        setLoadSubmit(false);
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
            return showErrorMessage('Vui lòng nhập tên cộng tác viên');
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

        enableLoadSubmit();
        makeRequest('post', `collaborators/addcollaborator`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Tạo cộng tác viên thành công!')
                    props.history.push('/collaborators/list')
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
                                        Thêm cộng tác viên
                                    </span>
                                </h3>

                                <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicName">
                                            <Form.Label className="starDanger">Họ tên</Form.Label>
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
                                    <div className="kt-login__actions">
                                        <Link to="/collaborators/list" style={{ marginRight: '5px' }}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                        </Link>
                                        <ButtonLoading className='btn btn-primary' loading={isLoadSubmit} type="submit" >
                                            Thêm
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

export default AddCollaboration;