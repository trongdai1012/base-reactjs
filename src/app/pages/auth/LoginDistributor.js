import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { showErrorMessage } from '../../actions/notification';
import { connect } from "react-redux";
import * as auth from "../../store/ducks/auth.duck";
import ButtonLoading from "../../partials/common/ButtonLoading";
import { Form, Card, Col } from "react-bootstrap";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const LoginDistributor = (props) => {
    const [dataAdd, setData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        toolSwitch: 'tool-switch'
    }

    useEffect(() => {
        let check = checkPermission(permissions.toolSwitch);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.email) {
            return showErrorMessage('Vui lòng nhập email nhà phân phối');
        }
        if (!dataAdd.password) {
            return showErrorMessage('Vui lòng nhập mật khẩu tài khoản của bạn');
        }
        setLoading(true);
        makeRequest('post', `auth/loginswitch`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    props.login(data.data.token);
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 1000)
                } else {
                    showErrorMessage(data.message);
                }
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.log('++++++++++++++++', err)
            })

    }

    return (

        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicEmail">
                                            <Form.Label className="starDanger">Email nhà phân phối</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder=""
                                                value={dataAdd.email || ''}
                                                onChange={(value) => { onChangeValue('email', value.target.value) }}
                                                autoFocus={true}
                                            />
                                        </Form.Group>

                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicContent">
                                            <Form.Label className="starDanger">Mật khẩu của bạn</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder=""
                                                value={dataAdd.password || ''}
                                                onChange={(value) => { onChangeValue('password', value.target.value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>

                                    <div className="kt-login__actions">
                                        <ButtonLoading type="submit" loading={isLoading} className="btn btn-primary btn-elevate kt-login__btn-primary">
                                            Vào xem nhà phân phối
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

export default connect(null, auth.actions)(LoginDistributor);