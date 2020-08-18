/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { Nav, Tab, Dropdown } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import HeaderDropdownToggle from "../content/CustomDropdowns/HeaderDropdownToggle";
import { ReactComponent as CompilingIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Compiling.svg";
import { Link } from 'react-router-dom';
import makeRequest from '../../libs/request';

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
};

const TYPE_REDIRECT = {
  1: '/exchange-key',
  2: '/order/list-wholeSale',
  3: '/distributor/list',
  4: '/order/wholeBuySale',
  5: '/order/list-wholeSale',
  6: '/order/list-single',
  7: '/keyManage'
}

export default class Notification extends React.Component {

  constructor(props) {
    super(props);

  }

  state = { key: "Alerts" };

  getHeaderTopBarCssClassList = () => {
    let result = "kt-header__topbar-icon ";
    if (this.props.pulse) {
      result += "kt-pulse kt-pulse--brand ";
    }

    const { iconType } = this.props;
    if (iconType) {
      result += `kt-header__topbar-icon--${iconType}`;
    }

    return result;
  };

  getSvgCssClassList = () => {
    let result = "kt-svg-icon";
    const { iconType } = this.props;
    if (iconType) {
      result += `kt-svg-icon--${iconType}`;
    }

    return result;
  };

  getHetBackGroundCssClassList = () => {
    let result = "kt-head ";
    if (this.props.skin) {
      result += `kt-head--skin-${this.props.skin} `;
    }

    result += "kt-head--fit-x kt-head--fit-b";
    return result;
  };

  backGroundStyle = () => {
    if (!this.props.bgImage) {
      return "none";
    }

    return "url(" + this.props.bgImage + ")";
  };

  userNotificationsButtonCssClassList = () => {
    let result = "btn ";
    if (this.props.type) {
      result += `btn-${this.props.type} `;
    }

    result += "btn-sm btn-bold btn-font-md";
    return result;
  };

  ulTabsClassList = () => {
    let result = "nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x  ";
    if (this.props.type) {
      result += `nav-tabs-line-${this.props.type} `;
    }

    result += "kt-notification-item-padding-x";
    return result;
  };

  onClickGoToDetail = (key, id) => {
    this.updateIsRead(id);
    window.open(TYPE_REDIRECT[key], '_blank');
  }

  updateIsRead = (id) => {
    makeRequest('get', `notification/UpdateReadNotifyDetailDistri?notify_id=${id}`).then(({ data }) => {
      if (data.signal) {
        this.props.setStatus(id);
      }
    }).catch(err => {
      console.log('errr', err)
    })
  }

  renderListNotify = () => {
    let { listNotify } = this.props;

    if (listNotify && listNotify.length > 0) {
      return listNotify.map(item => {
        return <a className="kt-notification__item" key={`notify-${item.id}`} onClick={() => this.onClickGoToDetail(item.type, item.id, item.status)} style={{ borderRadius: '2px' }}>
          {/* {item.status ? <div className="kt-notification__item-icon">
            <i className="fa fa-circle" style={{ color: 'primary' }} />
          </div> : */}
          {/* <div className="kt-notification__item-icon"> */}
          {item.status == 0 ?
            <i className="fa fa-circle" style={{ color: 'blue', paddingRight: '8px' }} /> : <i style={{ width: '18px' }} />
          }
          {/* <i className="fa fa-circle" style={{ color: 'blue', paddingRight: '5px'}} /> */}
          {/* </div> */}
          <div className="kt-notification__item-details">
            <div className="kt-notification__item-title">
              {item.content}
              {/* {item.content.length > 32 ? item.content.slice(0, 32) + '...' : item.content} */}
              {/* <b>{item.title.length > 32 ? item.title.slice(0,32) + '...' : item.title}</b> */}
            </div>
            {/* <div className="kt-notification__item-time">
            {item.content.length > 32 ? item.content.slice(0,32) + '...' : item.content}
          </div> */}
          </div>
        </a>
      })
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { key } = this.state;
    const { useSVG, icon, pulse, totalUnRead } = this.props;
    return (
      <Dropdown className="kt-header__topbar-item" drop="down">
        <Dropdown.Toggle
          as={HeaderDropdownToggle}
          id="dropdown-toggle-user-notifications"
        >
          <span className={this.getHeaderTopBarCssClassList() + "flaticon-bell"}>
            {!useSVG && <i className={icon} />}

            {useSVG && (
              <span className={this.getSvgCssClassList()}>
                <CompilingIcon />
              </span>
            )}

            <span className="kt-pulse__ring" hidden={!pulse} />
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-lg">
          <form>
            {/** Head */}
            <div
              className={this.getHetBackGroundCssClassList()}
              style={{ backgroundImage: this.backGroundStyle(), paddingTop: '5px', borderRadius: '5px' }}
            >
              <h3 className="kt-head__title" style={{ paddingBottom: '5px' }}>
                Thông báo&nbsp;
                {/* <span className={this.userNotificationsButtonCssClassList()} style={{ backgroundColor: 'red' }}>
                  {totalUnRead} mới
                </span> */}
              </h3>

              <Tab.Container
                defaultActiveKey={key}
                className={this.ulTabsClassList()}
              >

                <Tab.Content>
                  <Tab.Pane eventKey="Alerts">
                    <PerfectScrollbar
                      options={perfectScrollbarOptions}
                      style={{ maxHeight: "100vh", position: "relative" }}
                    >
                      <div
                        className="kt-notification kt-margin-t-10 kt-margin-b-10"
                        style={{ maxHeight: "40vh", position: "relative" }}
                      >
                        <div
                          className="kt-notification kt-margin-t-10 kt-margin-b-10 kt-scroll"
                          data-scroll="true"
                          data-height="300"
                          data-mobile-height="200"
                        >
                          {this.renderListNotify()}
                        </div>
                      </div>
                    </PerfectScrollbar>
                  </Tab.Pane>
                </Tab.Content>
                <div style={{ textAlign: "right", paddingTop: '7px' }}><Link to="/notify/distributor" style={{ paddingRight: '5px', color: 'white', paddingTop: '5px', paddingBottom: '3px', borderRadius: '3px' }}>Xem tất cả</Link></div>
              </Tab.Container>
            </div>
          </form>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
