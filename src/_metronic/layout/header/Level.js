import React from "react";
import { connect } from "react-redux";
import { IMAGE_LEVEL } from '../../../app/config/distributor';

class Level extends React.Component {
  render() {
    const { user } = this.props;
    const { distributor } = user;
    let typeUser = 'Admin';
    if (distributor) {
      if (distributor.level === 1) {
        typeUser = 'DIAMOND'
      } else if (distributor.level === 2) {
        typeUser = 'RUBY'
      } else {
        typeUser = 'GOLD'
      }
    }

    if (!distributor) {
      return <></>
    }

    return (
      <div className="kt-header__topbar-item kt-header__topbar-item--user dropdown">
        <div className="kt-header__topbar-wrapper">
          <div className="kt-header__topbar-user">
            <img alt="Pic" className="mg-r5" src={`/images/${IMAGE_LEVEL[distributor.level]}`} />
            <span className="kt-header__topbar-username kt-hidden-mobile">{typeUser}</span>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ auth: { user } }) => ({
  user
});

export default connect(mapStateToProps)(Level);