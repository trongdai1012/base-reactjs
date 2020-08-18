import React from 'react';
import { connect } from "react-redux";
import SelectForm from '../../partials/common/SelectForm';
import { Button, Form, Card, Col } from "react-bootstrap";
import { LIST_PACKAGE } from '../../config/product';
import { formatMoney } from '../../libs/money';
import clsx from 'clsx';

const SelectProductPackage = (props) => {

    const { dataPackage, dataAdd, user, isLoadSubmit, loadingButtonStyle, isIntro } = props;
    let listLevel = [{ n: 'Kim Cương', lv: 1 }, { n: 'Hồng Ngọc', lv: 2 }, { n: 'Vàng', lv: 3 }];
    if (isIntro) {
        listLevel = listLevel.filter(it => it.lv <= user.distributor.level);
    }

    let totalPrice = 0;
    LIST_PACKAGE.forEach(it => {
        totalPrice += (dataPackage[it.id] || 0) * it.price;
    })

    const updateQuantity = (id, value) => {
        if (value < 0) value = 0;
        props.updateQuantity({
            ...dataPackage,
            [id]: value
        });
    }

    const onChangeValue = (key, value) => {
        props.onChangeValue(key, value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        props.submitDistributor();
    }

    const renderPackage = () => {
        return LIST_PACKAGE.map((it, idx) => {
            if (it.is_trial) {
                return null;
            }
            return (
                <Form.Row key={`order-condition-${idx}`}>
                    <Form.Group as={Col}>
                        <Form.Label className="starDanger">Gói</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder=""
                            value={it.name}
                            isReadOnly={true}
                            onChange={(value) => { }}
                        />
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label className="starDanger">Số lượng key</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder=""
                            value={dataPackage[it.id] || ''}
                            onChange={(value) => { updateQuantity(it.id, value.target.value) }}
                        />
                    </Form.Group>
                </Form.Row>
            )
        })
    }

    return (
        <Form onSubmit={handleSubmit}>

            <Form.Row>
                <Form.Group as={Col} md={6}>
                    <Form.Label className="starDanger">Cấp nhà phân phối</Form.Label>
                    <SelectForm
                        optionData={listLevel}
                        keyString="lv"
                        labelString="n"
                        value={dataAdd.level || ''}
                        onChangeValue={(value) => { onChangeValue('level', value) }}
                    />
                </Form.Group>
            </Form.Row>

            {renderPackage()}

            {!props.isIntro &&
                <>
                    <Form.Row>
                        <h5 className="card-title align-items-start flex-column">
                            <span className="card-label font-weight-bolder text-dark">
                                Số lượng key Free 1 Tháng tặng
                    </span>
                        </h5>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col} md={6}>
                            <Form.Control
                                type="number"
                                placeholder=""
                                value={dataPackage['1'] || ''}
                                onChange={(value) => { updateQuantity('1', value.target.value) }}
                            />
                        </Form.Group>
                    </Form.Row>
                </>}

                <Form.Row>
                    <h4 className="card-title align-items-start flex-column">
                        <span className="card-label font-weight-bolder text-dark">
                            Tổng số tiền key: {formatMoney(totalPrice)}
                        </span>
                    </h4>
                </Form.Row>

                <div className="kt-login__actions">
                    <Button variant="default" type="button" onClick={() => { props.updateStep(0) }}>
                        Quay lại
                </Button>
                    <Button variant="primary" style={{ marginLeft: '5px' }} type="submit" className={`btn-elevate kt-login__btn-secondary ${clsx(
                        {
                            "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoadSubmit
                        })}`} disabled={isLoadSubmit === true ? true : false}>
                        Tạo
                </Button>
                </div>
        </Form>
    )
}


const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(SelectProductPackage);