import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import InputForm from '../../partials/common/InputForm';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card, Col } from "react-bootstrap";
import { LIST_PACKAGE } from '../../config/product';
import { DISCOUNT_WHOLESALE } from '../../config/distributor';
import { formatMoney } from '../../libs/money';
import makeRequest from '../../libs/request';
import clsx from 'clsx';
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

const CreateOrderWholseSale = (props) => {
    const [dataPackage, setDataPackage] = useState({});
    const [isLoading, setLoading] = useState(false);
    const { user } = props;
    const distributor = user ? (user.distributor || {}) : {};
    const level = distributor.level || 1;
    const [loadingButtonStyle, setLoadingButtonStyle] = useState({
        marginTop: "3px"
    });
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        createOrderWholeSale: 'add-order-buy-wholesale'
    }

    useEffect(() => {
        let check = checkPermission(permissions.createOrderWholeSale);
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
        let subTotal = totalPrice - (DISCOUNT_WHOLESALE[level] / 100) * totalPrice;
        return subTotal;
    }

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

        let total = getTotalPrice();
        if (total < 1) {
            return showErrorMessage('Vui lòng nhập số lượng cho ít nhất một gói')
        }

        enableLoading();
        makeRequest('post', `order/createOrderWholeSale`, { products })
            .then(({ data }) => {
                setLoading(false);
                if (data.signal) {
                    showSuccessMessageIcon('Tạo đơn hàng mua sỉ thành công!')
                    props.history.push('/order/wholeBuySale')
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
                return null;
            }
            return (
                <Form.Row key={`list-package-${it.id}`}>
                    <Form.Group as={Col}>
                        <Form.Label>Gói</Form.Label>
                        <InputForm
                            type="text"
                            placeholder=""
                            value={it.name}
                            isReadOnly={true}
                            onChangeValue={() => { }}
                        />
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label>Số lượng key</Form.Label>
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
        <div className="row" key={`select-product-${props.key}`}>
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>

                                {renderPackage()}

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
                                            Chiết khấu: {DISCOUNT_WHOLESALE[level]} %
                                        </span>
                                    </p>
                                </Form.Row>

                                <div className="kt-login__actions">
                                    <Link to="/order/wholeBuySale" style={{ marginRight: '5px' }}>
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

export default connect(mapStateToProps, null)(CreateOrderWholseSale);