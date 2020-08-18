import React from "react";
import { connect } from 'react-redux';
import DashboardAdmin from './DashboardAdmin';
import DashboardDistributor from './DashboardDistributor';
import { Redirect } from "react-router-dom";
import DashboardColla from '../collaborators/DasboardColla';

const Dashboard = (props) => {
  const { user } = props;
  if (user.type === 1) {
    return <DashboardAdmin />
  } else if (user.collaborator_id) {
    return <DashboardColla />
  } else {
    return <DashboardDistributor />
  }
}

const mapStateToProps = ({ auth }) => ({
  user: auth.user
});

export default connect(mapStateToProps, null)(Dashboard);
