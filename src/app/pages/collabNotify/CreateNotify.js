/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useRef } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Form, Card, Col } from "react-bootstrap";
import ButtonLoading from "../../partials/common/ButtonLoading";
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import {
    Radio,
    FormControlLabel
} from "@material-ui/core";
import { DatePicker } from "antd";
import checkPermission from '../../libs/permission';

export default function CreateNotify(props) {
    const [dataAdd, setData] = useState({});
    const [isloading, setLoading] = useState(false);
    const [isRequested, setRequested] = useState(false);
    const inputTitleRef = useRef();
    const inputContentRef = useRef();
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        createCollabNotify: 'get-notify'
    }

    const dateFormat = 'DD/MM/YYYY HH:mm';

    useEffect(() => {
        let check = checkPermission(permissions.createCollabNotify);
        if (check == 2) {
            setRefuse(true);
        } else if (check == 0) {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    if (isRequested) {
        return <Redirect to="/notifycollab/list" />;
    }

    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const onChangeStartDate = (date) => {
        if (dataAdd.endDate && dataAdd.endDate < date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataAdd,
            startDate: date
        });
    }

    const onChangeEndDate = (date) => {
        if (dataAdd.startDate && dataAdd.startDate > date) {
            return showErrorMessage("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
        }
        setData({
            ...dataAdd,
            endDate: date
        });
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.title) {
            inputTitleRef.current.focus();
            return showErrorMessage('Vui lòng nhập tiêu đề');
        }

        if (!dataAdd.content) {
            inputContentRef.current.focus();
            return showErrorMessage('Vui lòng nhập nội dung');
        }

        if (dataAdd.is_show == null) {
            return showErrorMessage('Vui lòng chọn trạng thái hiển thị');
        }

        if (dataAdd.startDate == null || dataAdd.startDate == '') {
            return showErrorMessage('Vui lòng chọn ngày bắt đầu');
        }

        if (dataAdd.endDate == null || dataAdd.endDate == '') {
            return showErrorMessage('Vui lòng chọn ngày kết thúc');
        }

        setLoading(true);
        makeRequest('post', `collabnotify/create`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    resetForm();
                    showSuccessMessageIcon('Tạo thông báo thành công');
                    setLoading(false);
                    setRequested(true);
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
                                            <Form.Control type="text" ref={inputContentRef}
                                                placeholder="" value={dataAdd && dataAdd.content || ''}
                                                onChange={(e) => { onChangeValue('content', e.target.value) }} />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={2} controlId="formBasicEndDate">
                                            <Form.Label className="starDanger">Hiển thị popup</Form.Label>
                                        </Form.Group>
                                        <Form.Group as={Col} md={3} controlId="formBasicName">
                                            <FormControlLabel
                                                key={1}
                                                control={<Radio checked={dataAdd && dataAdd.is_show == 1 ? true : false} />}
                                                label={"Hiển thị"}
                                                onClick={() => onChangeValue('is_show', 1)}
                                            />
                                            <FormControlLabel
                                                key={0}
                                                control={<Radio checked={dataAdd && dataAdd.is_show == 0 ? true : false} />}
                                                label={"Không hiển thị"}
                                                onClick={() => onChangeValue('is_show', 0)}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={2} controlId="formBasicLabelStartDate">
                                            <Form.Label className="starDanger">Ngày bắt đầu - kết thúc</Form.Label>
                                        </Form.Group>
                                        <Form.Group as={Col} md={2} controlId="formBasicStartDate">
                                            <DatePicker
                                                showTime
                                                format={dateFormat}
                                                onChange={onChangeStartDate}
                                                placeholder={'Thời gian bắt đầu'}
                                                value={dataAdd && dataAdd.startDate ? moment(dataAdd.startDate) : ''}
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} md={2} controlId="formBasicEndDate ">
                                            <DatePicker
                                                showTime
                                                format={dateFormat}
                                                onChange={onChangeEndDate}
                                                placeholder={'Thời gian kết thúc'}
                                                value={dataAdd && dataAdd.endDate ? moment(dataAdd.endDate) : ''}
                                            />
                                        </Form.Group>
                                    </Form.Row>

                                    <div className="kt-login__actions">
                                        <ButtonLoading type="submit" type="primary" className="btn btn-primary" loading={isloading}>Tạo thông báo</ButtonLoading>
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