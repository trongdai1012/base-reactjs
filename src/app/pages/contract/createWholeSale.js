import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card, Col } from "react-bootstrap";
import { LIST_PACKAGE } from '../../config/product';
import { DISCOUNT_WHOLESALE } from '../../config/distributor';
import { formatMoney } from '../../libs/money';
import makeRequest from '../../libs/request';
import { Select, Spin } from 'antd';
import clsx from 'clsx';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const { Option } = Select;

const CreateWholeSale = (props) => {
    const [dataPackage, setDataPackage] = useState({});
    const [distributor_buy_id, setDistributor] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [level, setLevel] = useState(0);
    const [dataOptions, setDataOptions] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [textSearch, setTextSearch] = useState('');
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        createWholeSale: 'add-order-wholesale'
    }

    useEffect(() => {
        let check = checkPermission(permissions.createWholeSale);
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

    let totalPrice = 0;
    LIST_PACKAGE.forEach(it => {
        totalPrice += (dataPackage[it.id] || 0) * it.price;
    });

    const getTotalPrice = () => {
        const discountPers = level ? DISCOUNT_WHOLESALE[level] : 0;
        let subTotal = totalPrice - (discountPers / 100) * totalPrice;
        return subTotal;
    }

    const onChangeDistributor = (value) => {
        const selected = dataOptions.find(it => it.value == value);
        setLevel(selected ? selected.level : 0)
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

    const updateQuantity = (id, value) => {
        if (value < 0) value = 0;
        setDataPackage({
            ...dataPackage,
            [id]: value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let products = [];
        LIST_PACKAGE.forEach(it => {
            if (dataPackage[it.id]) {
                products.push({
                    package_id: it.id,
                    quantity: dataPackage[it.id]
                })
            }
        })

        if (!distributor_buy_id) {
            return showErrorMessage('Vui lòng chọn nhà phân phối');
        }

        let total = getTotalPrice();
        if (total < 1) {
            return showErrorMessage('Vui lòng nhập số lượng key của ít nhất 1 gói');
        }

        enableLoading();

        makeRequest('post', `order/createWholeSale`, { products, distributor_buy_id })
            .then(({ data }) => {
                setLoading(false);
                if (data.signal) {
                    showSuccessMessageIcon('Tạo đơn hàng mua sỉ thành công!')
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

    const renderPackage = () => {
        return LIST_PACKAGE.map((it, idx) => {
            if (it.is_trial) {
                return null
            }
            return (
                <Form.Row key={`package-${idx}`}>
                    <Form.Group as={Col}>
                        <Form.Label >Gói</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder=""
                            value={it.name}
                            isReadOnly={true}
                            onChange={(value) => { }}
                        />
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label >Số lượng key</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder=""
                            value={dataPackage[it.id] || ''}
                            onChange={(e) => { updateQuantity(it.id, e.target.value) }}
                        />
                    </Form.Group>
                </Form.Row>
            )
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

                                {renderPackage()}

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
                                            value={dataPackage['1'] || 0}
                                            onChange={(e) => { updateQuantity('1', e.target.value) }}
                                        />
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row>
                                    <p className="card-title align-items-start flex-column" style={{ fontSize: 15 }}>
                                        <span className="card-label font-weight-bolder text-dark">
                                            Tổng số tiền key: {formatMoney(totalPrice)}
                                        </span>
                                    </p>
                                </Form.Row>

                                <Form.Row>
                                    <p className="card-title align-items-start flex-column" style={{ fontSize: 15 }}>
                                        <span className="card-label font-weight-bolder text-dark">
                                            Tổng số tiền thanh toán: {formatMoney(getTotalPrice())}
                                        </span>
                                    </p>
                                </Form.Row>
                                <Form.Row>
                                    <p className="card-title align-items-start flex-column" style={{ fontSize: 15 }}>
                                        <span className="card-label font-weight-bolder text-dark">
                                            Chiết khấu: {level ? DISCOUNT_WHOLESALE[level] : 0} %
                                        </span>
                                    </p>
                                </Form.Row>

                                <div className="kt-login__actions">
                                    <Link to="/order/list-wholeSale" style={{ marginRight: '5px' }}>
                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                                    </Link>
                                    <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                                        {
                                            "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                                        })}`} disabled={isLoading === true ? true : false}>
                                        Tạo đơn hàng
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

export default connect(mapStateToProps, null)(CreateWholeSale);