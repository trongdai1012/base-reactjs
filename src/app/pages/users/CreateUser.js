/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateEmail, validateMobile, validateName, validateSpecialCharEmail } from "../../libs/utils";
import { connect } from "react-redux";
import { Button, Form, Card, Col } from "react-bootstrap";
import clsx from "clsx";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const CreateUser = (props) => {
    // Example 1
    const [dataAdd, setData] = useState({ unsaved: false, loadingPage: true });
    const [roles, setRoles] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const inputEmailRef = React.createRef();
    const inputMobileRef = React.createRef();
    const inputFullnameRef = React.createRef();
    const inputPasswordRef = React.createRef();
    const inputRePasswordRef = React.createRef();
    const { match: { params } } = props;
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        addManager: 'add-manager'
    }

    useEffect(() => {
        let check = checkPermission(permissions.addManager)
        if (check == 1) {
            getRole();
            if (params.id) {
                getDetail(params.id);
            } else {
                resetForm();
            }
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const enableLoading = () => {
        setLoading(true);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const disableLoading = () => {
        setLoading(false);
        setLoadingButtonStyle({ marginTop: "3px" });
    };

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const setRePass = (key, value) => {
        setData({
            ...dataAdd,
            repassword: value
        })
    }

    const resetForm = () => {
        setData(null);
        setData({ unsaved: false, loadingPage: true })
    }

    const getRole = () => {
        makeRequest('get', `permission/listRole`)
            .then(({ data }) => {
                if (data.signal) {
                    setRoles(data.data)
                    setData({
                        ...dataAdd,
                        user_type: 1,
                        loadingPage: false
                    })
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const getDetail = (id) => {
        makeRequest('get', `permission/managerDetail/${id}`)
            .then(({ data }) => {
                if (data.signal) {
                    const detailUser = data.data;
                    setData({
                        ...detailUser,
                        loadingPage: false
                    })
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.email) {
            inputEmailRef.current.focus()
            return showErrorMessage('Vui lòng nhập email');
        }

        if (dataAdd.email && !validateEmail(dataAdd.email)) {
            inputEmailRef.current.focus()
            return showErrorMessage('Vui lòng nhập email hợp lệ')
        }

        if (dataAdd.email && !validateSpecialCharEmail(dataAdd.email)) {
            return showErrorMessage('Email không được chứa ký tự đặc biệt')
        }

        if (!dataAdd.mobile) {
            inputMobileRef.current.focus()
            return showErrorMessage('Vui lòng nhập số điện thoại');
        }

        if (!validateMobile(dataAdd.mobile)) {
            inputMobileRef.current.focus()
            return showErrorMessage('Vui lòng nhập số điện thoại hợp lệ');
        }

        if (!dataAdd.name) {
            inputFullnameRef.current.focus()
            return showErrorMessage('Vui lòng nhập họ tên');
        } else {
            if (!(dataAdd.name).trim().length) {
                inputFullnameRef.current.focus();
                return showErrorMessage('Vui lòng nhập họ tên');
            }
        }

        if (!validateName(dataAdd.name)) {
            inputFullnameRef.current.focus();
            return showErrorMessage('Tên không được chứa ký tự đặc biệt');
        }

        if (!dataAdd.role_id) {
            return showErrorMessage("Vui lòng chọn quyền");
        }

        if (!dataAdd.password && !params.id) {
            inputPasswordRef.current.focus();
            return showErrorMessage('Vui lòng nhập mật khẩu');
        }

        if (!dataAdd.repassword && !params.id) {
            inputRePasswordRef.current.focus();
            return showErrorMessage('Vui lòng xác nhận mật khẩu');
        }
        if (dataAdd.repassword !== dataAdd.password && !params.id) {
            inputRePasswordRef.current.focus()
            return showErrorMessage('Mẩu khẩu xác nhận không khớp');
        }

        const urlApi = params.id ? 'updateManager' : 'addManager';

        enableLoading();
        makeRequest('post', `permission/${urlApi}`, dataAdd)
            .then(({ data }) => {
                onChangeValue('loadingPage', false)
                if (data.signal) {
                    const msg = params.id ? 'Cập nhật thành công' : 'Thêm quản trị viên thành công'
                    showSuccessMessageIcon(msg);
                    props.history.push('/permissions/list');
                    onChangeValue('loadingPage', false);
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
                    <div className="kt-section">
                        <Card >
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicEmail">
                                            <Form.Label className="starDanger">Email</Form.Label>
                                            <Form.Control type="text" maxLength={255} ref={inputEmailRef} autoFocus placeholder="" value={dataAdd.email && dataAdd.email || ''} onChange={(e) => onChangeValue('email', e.target.value)} />
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="formBasicMobile">
                                            <Form.Label className="starDanger">Số điện thoại</Form.Label>
                                            <Form.Control type="text" maxLength={12} ref={inputMobileRef} placeholder="" value={dataAdd.mobile && dataAdd.mobile || ''} onChange={(e) => onChangeValue('mobile', e.target.value)} />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicName">
                                            <Form.Label className="starDanger">Họ tên</Form.Label>
                                            <Form.Control type="text" maxLength={255} ref={inputFullnameRef} placeholder="" value={dataAdd.name && dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                        </Form.Group>
                                        <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                            <Form.Label className="starDanger">Quyền</Form.Label>
                                            <Form.Control as="select" value={dataAdd.role_id} placeholder="Select Role" onChange={(e) => onChangeValue('role_id', e.target.value)} >
                                                <option value="">Chọn quyền</option>
                                                {roles.map((it, idx) => {
                                                    return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                                                })}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>

                                    {params.id ? '' : (
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formBasicPassword">
                                                <Form.Label className="starDanger">Mật khẩu</Form.Label>
                                                <Form.Control type="password" maxLength={255} ref={inputPasswordRef} placeholder="" value={dataAdd.password && dataAdd.password || ''} onChange={(e) => onChangeValue('password', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formBasicRePassword">
                                                <Form.Label className="starDanger">Nhập lại mật khẩu</Form.Label>
                                                <Form.Control type="password" maxLength={255} ref={inputRePasswordRef} placeholder="" value={dataAdd.repassword && dataAdd.repassword || ''} onChange={(e) => setRePass('repassword ', e.target.value)} />
                                            </Form.Group>
                                        </Form.Row>
                                    )}

                                    <div className="kt-login__actions">
                                        <Link to="/permissions/list" style={{ marginRight: '5px' }}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                        </Link>
                                        <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                                            {
                                                "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                                            }
                                        )}`} disabled={isLoading === true ? true : false}>
                                            {params.id ? 'Cập nhật' : 'Tạo quản trị'}
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

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(CreateUser);