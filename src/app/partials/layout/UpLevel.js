/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { ThunderboltOutlined } from '@ant-design/icons';
import { formatMoney } from '../../libs/money';

export default class UpLevel extends React.Component {

    constructor(props) {
        super(props);
    }

    renderCondition = (conditionUp) => {
        if (conditionUp >= 0 && conditionUp < 1000) {
            return conditionUp + ' đồng';
        } else if (conditionUp < 999999) {
            return formatMoney(conditionUp / 1000.0) + ' nghìn';
        } else if (conditionUp < 999999999) {
            return formatMoney(conditionUp / 1000000.0) + ' triệu';
        } else if (conditionUp < 999999999999) {
            return formatMoney(conditionUp / 1000000000.0) + ' tỷ';
        } else {
            return formatMoney(conditionUp / 1000000000000.0) + ' nghìn tỷ';
        }
    }

    renderPoints = (totalPoints) => {

        if (totalPoints >= 0 && totalPoints < 1000) {
            return totalPoints + '';
        } else if (totalPoints < 999999) {
            return formatMoney(totalPoints / 1000.0) + ' nghìn';
        } else if (totalPoints < 999999999) {
            return formatMoney(totalPoints / 1000000.0) + ' triệu';
        } else if (totalPoints < 999999999999) {
            return formatMoney(totalPoints / 1000000000.0) + ' tỷ';
        } else {
            return formatMoney(totalPoints / 1000000000000.0) + ' nghìn tỷ';
        }
    }

    render() {
        let { conditionUp, totalPoints, user } = this.props;
        let percentUp = 0;
        if(conditionUp < 0 || !conditionUp){

        }else{
            percentUp = user.distributor.level == 1 ? 100 : user.distributor.level == 2 ? (((totalPoints - 200000000) / 1000000000) * 100) :
            (((totalPoints - 50000000) / 150000000) * 100);
        }

        return (
            <div className="kt-header__topbar-item kt-header__topbar-item--user dropdown">
                <div className="kt-header__topbar-wrapper">
                    <div className="kt-header__topbar-user" title="Cấp nhà phân phối">
                        <div className="col-md-3">
                            <div style={{
                                borderRadius: '100%', borderWidth: '2px', borderStyle: 'solid', width: '30px',
                                height: '30px', textAlign: 'center', borderColor: 'orange'
                            }}>
                                <ThunderboltOutlined style={{ color: 'green', textAlign: 'center' }} />
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div className="row">
                                <div style={{ fontSize: 'smaller' }}>Tích lũy hiện tại {conditionUp ? this.renderPoints(totalPoints) : 0} VNĐ</div>
                            </div>
                            <div className="row">
                                <div className="up-level-contain">
                                    <div className="up-level-skills up-level-progresswidth" style={{ width: `${percentUp}%` }}></div>
                                </div>
                            </div>
                            <div className="row">
                                {user.distributor.level !== 1 ?
                                    <div style={{ fontSize: 'smaller' }}>Thêm {conditionUp ? this.renderCondition(conditionUp) : 0} VNĐ để lên cấp</div> : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
