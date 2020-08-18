/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useRef } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import SelectForm from '../../partials/common/SelectForm';
import { PRODUCT_CUSTOMER } from '../../config/product';
import { Form, Card, Col } from "react-bootstrap";
import ButtonLoading from "../../partials/common/ButtonLoading";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";


export default function SupportCustomer(props) {
    const [dataAdd, setData] = useState({});
    const [isloading, setLoading] = useState(false);
    //const [isRequested, setRequested] = useState(false);
    const inputTitleRef = useRef();
    const inputContentRef = useRef();
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        sendMailSupport: 'created-mail-support'
    }

    useEffect(() => {
        let check = checkPermission(permissions.sendMailSupport);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    // if (isRequested) {
    //     return <Redirect to="/notify/list"/>;
    // }

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.package_id) {
            return showErrorMessage('Vui lòng chọn đối tượng khách hàng');
        }

        if (!dataAdd.title) {
            inputTitleRef.current.focus();
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!dataAdd.content) {
            inputContentRef.current.focus();
            return showErrorMessage('Vui lòng nhập nội dung mail');
        }

        setLoading(true);
        makeRequest('get', `distributor/sendmail`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    resetForm();
                    showSuccessMessageIcon('Gửi mail thành công');
                    setLoading(false);
                    //setRequested(true);
                } else {
                    showErrorMessage(data.message);
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
                console.log('++++++++++++++++', err);
            })
    }

    const resetForm = () => {
        setData(null);
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
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label className="starDanger">Chọn khách hàng theo gói</Form.Label>
                                            <SelectForm
                                                optionData={PRODUCT_CUSTOMER}
                                                keyString="id"
                                                labelString="name"
                                                value={dataAdd && dataAdd.package_id || ''}
                                                onChangeValue={(value) => { onChangeValue('package_id', value) }}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicEmail">
                                            <Form.Label className="starDanger">Tiêu đề</Form.Label>
                                            <Form.Control type="text" maxLength={255} ref={inputTitleRef} autoFocus
                                                placeholder="" value={dataAdd && dataAdd.title || ''}
                                                onChange={(e) => { onChangeValue('title', e.target.value) }} />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} controlId="formBasicContent">
                                            <Form.Label className="starDanger">Nội dung</Form.Label>
                                            <Form.Control as="textarea" ref={inputContentRef}
                                                placeholder="" value={dataAdd && dataAdd.content || ''}
                                                onChange={(e) => { onChangeValue('content', e.target.value) }} />
                                        </Form.Group>
                                    </Form.Row>

                                    <div className="kt-login__actions">
                                        <ButtonLoading type="submit" type="primary" className="btn btn-primary" loading={isloading}>Gửi Email cho khách hàng</ButtonLoading>
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