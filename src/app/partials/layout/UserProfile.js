/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { connect } from "react-redux";
import { toAbsoluteUrl } from "../../../_metronic";
import HeaderDropdownToggle from "../content/CustomDropdowns/HeaderDropdownToggle";

class UserProfile extends React.Component {
  render() {
    const { user, showHi, showAvatar } = this.props;
    const { distributor, collaborator_id } = user;
    let typeUser = 'Admin';
    let character = 'A';
    let urlOrder = '/order/list-single';
    if (distributor) {
      if (distributor.level == 1) {
        typeUser = 'DIAMOND'
        character = 'D'
      } else if (distributor.level == 2) {
        typeUser = 'RUBY'
        character = 'R'
      } else {
        typeUser = 'GOLD'
        character = 'G'
      }
    }

    if (collaborator_id) {
      typeUser = 'CTV';
      character = 'C';
      urlOrder = '/collaborator/order';
    }

    return (
      <Dropdown className="kt-header__topbar-item kt-header__topbar-item--user" drop="down" alignRight>
        <Dropdown.Toggle
          as={HeaderDropdownToggle}
          id="dropdown-toggle-user-profile"
        >
          <div className="kt-header__topbar-user">
            {showHi && (
              <span className="kt-header__topbar-welcome kt-hidden-mobile">
                Hi,
              </span>
            )}

            {showHi && (
              <span className="kt-header__topbar-username kt-hidden-mobile">
                {user.name}
              </span>
            )}

            {showAvatar && <img alt="Avatar" src={user.avatar && user.avatar || "/media/users/default.jpg"} style={{width: "34px", height: "34px"}} />}
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
          {/** ClassName should be 'dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl' */}
          <div
            className="kt-user-card kt-user-card--skin-dark kt-notification-item-padding-x"
            style={{
              backgroundImage: `url(${toAbsoluteUrl("/media/misc/bg-1.jpg")})`
            }}
          >
            <div className="kt-user-card__avatar">
              <img alt="Pic" className="kt-hidden" src={user.avatar} />
              <span className="kt-badge kt-badge--lg kt-badge--rounded kt-badge--bold kt-font-success">
                {character}
              </span>
            </div>
            <div className="kt-user-card__name">{typeUser}</div>
            <div className="kt-user-card__badge">
              {/* <span className="btn btn-success btn-sm btn-bold btn-font-md">
                23 messages
              </span> */}
            </div>
          </div>
          <div className="kt-notification">
            <Link className="kt-notification__item" to="/profile">
              <div className="kt-notification__item-icon">
                <i className="flaticon2-calendar-3 kt-font-success" />
              </div>
              <div className="kt-notification__item-details">
                <div className="kt-notification__item-title kt-font-bold">
                  Thông tin
                </div>
                <div className="kt-notification__item-time">
                  Thông tin tài khoản
                </div>
              </div>
            </Link>
            {/* <a className="kt-notification__item">
              <div className="kt-notification__item-icon">
                <i className="flaticon2-mail kt-font-warning" />
              </div>
              <div className="kt-notification__item-details">
                <div className="kt-notification__item-title kt-font-bold">
                  My Messages
                </div>
                <div className="kt-notification__item-time">
                  Inbox and tasks
                </div>
              </div>
            </a> */}
            {/* <a className="kt-notification__item">
              <div className="kt-notification__item-icon">
                <i className="flaticon2-rocket-1 kt-font-danger" />
              </div>
              <div className="kt-notification__item-details">
                <div className="kt-notification__item-title kt-font-bold">
                  My Activities
                </div>
                <div className="kt-notification__item-time">
                  Logs and notifications
                </div>
              </div>
            </a> */}
            <Link className="kt-notification__item" to={urlOrder}>
              <div className="kt-notification__item-icon">
                <i className="flaticon2-hourglass kt-font-brand" />
              </div>
              <div className="kt-notification__item-details">
                <div className="kt-notification__item-title kt-font-bold">
                  Đơn hàng
                </div>
                <div className="kt-notification__item-time">
                  Danh sách đơn hàng
                </div>
              </div>
            </Link>
            <div className="kt-notification__custom">
              <Link
                to="/logout"
                className="btn btn-label-brand btn-sm btn-bold"
              >
                Thoát
              </Link>
            </div>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const mapStateToProps = ({ auth: { user } }) => ({
  user
});

export default connect(mapStateToProps)(UserProfile);
