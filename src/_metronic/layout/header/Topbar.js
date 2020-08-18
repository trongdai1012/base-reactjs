import React from "react";
import SearchDropdown from "../../../app/partials/layout/SearchDropdown";
import UserNotifications from "../../../app/partials/layout/UserNotifications";
import Notification from "../../../app/partials/layout/Notification";
import UpLevel from "../../../app/partials/layout/UpLevel";
import MyCart from "../../../app/partials/layout/MyCart";
import QuickActionsPanel from "../../../app/partials/layout/QuickActionsPanel";
import QuickPanelToggler from "./QuickPanelToggle";
import LanguageSelector from "../../../app/partials/layout/LanguageSelector";
import UserProfile from "../../../app/partials/layout/UserProfile";
import { toAbsoluteUrl } from "../../utils/utils";
import Level from './Level';
import { Modal } from "@material-ui/core";
import makeRequest from '../../../app/libs/request';
import { AUTH_TOKEN_KEY } from '../../../app/config/auth';

export default class Topbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      listNotify: [],
      showModal: false,
      totalUnRead: 0,
      conditionUp: 0,
      totalPoints: 0,
      user: {}
    };
  }

  componentDidMount = () => {
    this.getNotify();
    this.getConditionUpLevel();
    this.getTotalPoints();
    this.getUserInfo();
  }

  getNotify = async () => {
    makeRequest('get', 'notification/GetAllNotifyDetailDistri')
      .then(({ data }) => {
        if (data.signal) {
          this.setState({
            listNotify: data.data.rows,
            totalUnRead: data.data.total
          })
        }
      }).catch(err => {
        console.log(err);
      })
  }

  getConditionUpLevel = async () => {
    makeRequest('get', `distributor/getconditionuplevel`)
      .then(({ data }) => {
        this.setState({ conditionUp: data.data });
      })
      .catch(err => {
        console.log(err)
      })
  }

  getTotalPoints = async () => {
    makeRequest('get', `distributor/getTotalPoints`)
      .then(({ data }) => {
        this.setState({ totalPoints: data.data });
      })
      .catch(err => {
        console.log(err)
      })
  }

  getUserInfo = () => {
    makeRequest('get', `profile/userInfo`)
      .then(({ data }) => {
        this.setState({
          user: data.data
        });
      })
      .catch(err => {
        console.log(err)
      })
  }

  setStatus = (id) => {
    let objTemp = [...this.state.listNotify];
    objTemp.find(x => x.id == id).status = 1;
    this.setState({
      listNotify: objTemp
    })
  }

  render() {
    let { listNotify, totalUnRead, conditionUp, totalPoints, user } = this.state;

    return (
      <div className="kt-header__topbar">
        {user && user.distributor_id ?
          <UpLevel conditionUp={conditionUp} totalPoints={totalPoints} user={user} /> : null
        }

        <Notification
          bgImage={toAbsoluteUrl("/media/misc/bg-1.jpg")}
          pulse="true"
          pulseLight="false"
          skin="dark"
          iconType=""
          type="success"
          dot="false"
          listNotify={listNotify}
          totalUnRead={totalUnRead}
          setStatus={this.setStatus}
        />

        {/* <UserNotifications
          bgImage={toAbsoluteUrl("/media/misc/bg-1.jpg")}
          pulse="true"
          pulseLight="false"
          skin="dark"
          iconType=""
          type="success"
          useSVG="true"
          dot="false"
        /> */}

        {/* <QuickActionsPanel
          bgImage={toAbsoluteUrl("/media/misc/bg-2.jpg")}
          skin="dark"
          iconType=""
          useSVG="true"
          gridNavSkin="light"
        />

        <MyCart
          iconType=""
          useSVG="true"
          bgImage={toAbsoluteUrl("/media/misc/bg-1.jpg")}
        />

          <QuickPanelToggler />


          <LanguageSelector iconType="" /> */}

        <Level />

        {/* <Notification
          bgImage={toAbsoluteUrl("/media/misc/bg-1.jpg")}
          pulse="true"
          pulseLight="false"
          skin="dark"
          iconType=""
          type="success"
          dot="false"
          listNotify={listNotify}
          totalUnRead = {totalUnRead}
        /> */}

        <UserProfile showAvatar={true} showHi={true} showBadge={false} />
      </div>
    );
  }
}
