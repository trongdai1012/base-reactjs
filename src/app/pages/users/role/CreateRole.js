/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import { Button, Form, Card, Col } from "react-bootstrap";
import clsx from 'clsx';
import checkPermission from '../../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';


const CreateRole = (props) => {
    // Example 1
    const inputRef = React.createRef();
    const inputDescriptionRef = React.createRef();
    const [dataAdd, setData] = useState({ unsaved: false });
    const [isLoading, setLoading] = useState(false);
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        createRole: 'create-role'
    }

    useEffect(() => {
        let check = checkPermission(permissions.createRole);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.name) {
            inputRef.current.focus();
            return showErrorMessage('Vui lòng nhập tên quyền');
        } else {
            if (!(dataAdd.name).trim().length) {
                inputRef.current.focus();
                return showErrorMessage('Vui lòng nhập tên quyền');
            }
        }

        enableLoading();

        makeRequest('post', `permission/addRole`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    showSuccessMessageIcon('Thêm quyền thành công');
                    props.history.push(`/permissions/roles/edit-permission/${data.data.id}`);
                    setLoading(false);
                } else {
                    showErrorMessage(data.message);
                }
                disableLoading();
            })
            .catch(err => {
                disableLoading();
                console.log('++++++++++++++++', err);
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
                                        <Form.Group as={Col} md={6} controlId="formBasicName">
                                            <Form.Label className="starDanger">Tên quyền</Form.Label>
                                            <Form.Control type="name" maxLength={255} autoFocus ref={inputRef} placeholder="" value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicDescription">
                                            <Form.Label>Mô tả</Form.Label>
                                            <Form.Control as="textarea" maxLength={500} ref={inputDescriptionRef} rows="3" placeholder="" value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)} />
                                        </Form.Group>
                                    </Form.Row>
                                    <div className="kt-login__actions">
                                        <Link to="/permissions/roles" style={{ marginRight: '5px' }}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                        </Link>
                                        <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                                            {
                                                "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                                            }
                                        )}`} disabled={isLoading === true ? true : false}>
                                            Tạo
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

export default connect(mapStateToProps, null)(CreateRole);