import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card, Col } from "react-bootstrap";
import makeRequest from '../../libs/request';
import { Select, Spin } from 'antd';
import clsx from 'clsx';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const { Option } = Select;

const SendTrial = (props) => {
    const [distributor_buy_id, setDistributor] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [dataOptions, setDataOptions] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [textSearch, setTextSearch] = useState('');
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        sendTrial: 'add-order-trial'
    }

    useEffect(() => {
        let check = checkPermission(permissions.sendTrial);
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

    const onChangeDistributor = (value) => {
        const selected = dataOptions.find(it => it.value == value);
        setDistributor(value);
    }

    const fetchDistributor = value => {
        setDataOptions([]);
        setFetching(true);
        makeRequest('get', `distributor/getChildDistributor`, { name: value, email: value, limit: 25 })
            .then(({ data }) => {
                if (data.signal) {
                    let arrDistributor = data.data.map(it => {
                        return {
                            label: `${it.name} - ${it.email}`,
                            value: it.id,
                            level: it.level
                        }
                    })

                    setDataOptions(arrDistributor);
                    setFetching(false);
                    setTextSearch(value);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!quantity) {
            return showErrorMessage('Vui lòng nhập số lượng key');
        }

        if (quantity < 1) {
            return showErrorMessage('Số lượng key tối thiểu là 1');
        }

        if (!distributor_buy_id) {
            return showErrorMessage('Vui lòng chọn nhà phân phối');
        }

        enableLoading();

        makeRequest('post', `order/createWholeSaleFreeKey`, { quantity, distributor_buy_id })
            .then(({ data }) => {
                setLoading(false);
                if (data.signal) {
                    showSuccessMessageIcon('Gửi key 1 tháng cho nhà phân phối thành công!')
                    props.history.push('/order/list-wholeSale')
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
        <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>

                                <Form.Row>
                                    <Form.Group as={Col} md={6}>
                                        <Form.Label className="starDanger">Chọn nhà phân phối</Form.Label>
                                        <Select
                                            showSearch
                                            value={distributor_buy_id || ''}
                                            placeholder="Nhập tên hoặc email nhà phân phối"
                                            notFoundContent={fetching ? <Spin size="small" /> : textSearch ? 'Không có dữ liệu' : null}
                                            filterOption={false}
                                            onSearch={fetchDistributor}
                                            onChange={onChangeDistributor}
                                            style={{ width: '100%' }}
                                        >
                                            {dataOptions.map(d => (
                                                <Option key={`child-distri-${d.value}`} value={d.value}>{d.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row>
                                    <h5 className="card-title align-items-start flex-column">
                                        <span className="card-label font-weight-bolder text-dark">
                                            Số lượng key tặng free một tháng
                                        </span>
                                    </h5>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} md={6}>
                                        <Form.Control
                                            type="number"
                                            placeholder=""
                                            value={quantity}
                                            onChange={(e) => { setQuantity(e.target.value) }}
                                        />
                                    </Form.Group>
                                </Form.Row>

                                <div className="kt-login__actions">
                                    <Link to="/order/list-wholeSale" style={{ marginRight: '5px' }}>
                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                    </Link>
                                    <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                                        {
                                            "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                                        })}`} disabled={isLoading === true ? true : false}>
                                        Tặng key
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    )
}


const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(SendTrial);