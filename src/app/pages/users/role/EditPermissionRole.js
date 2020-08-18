/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import Notice from "../../../partials/content/Notice";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import { Button, Form, Card } from "react-bootstrap";
import { Checkbox } from "antd";
import groupBy from 'lodash/groupBy';
import Loading from '../../loading';
import clsx from 'clsx';
import { connect } from "react-redux";
import checkPermission from '../../../libs/permission';
import { Redirect } from "react-router-dom";

const EditPermissionRole = (props) => {
  // Example 1
  const [dataState, setData] = useState({});
  const [dataPer, setPermissions] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [isLoadPerm, setLoadPerm] = useState(true);
  const [isLoadRole, setLoadRole] = useState(true);
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    marginTop: "3px"
  });
  const [isRefuse, setRefuse] = useState(false);
  const [isFirstLoad, setFirstLoad] = useState(false);

  const permissions = {
    updateManager: 'update-manager'
  }

  useEffect(() => {
    let check = checkPermission(permissions.updateManager);
    if (check == 1) {
      let { id } = props.match.params
      getAllPermission();
      if (id) {
        makeRequest('get', `permission/getRolePermisison/${id}`, {})
          .then(({ data }) => {
            if (data.signal) {
              let role = data.data
              let arrayPermissionChossen = (role.permission).map(a => a.permission_id)
              setData({
                ...dataState,
                role,
                arrayPermissionChossen
              });
              setLoadRole(false);
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    } else if (check == 2) {
      setRefuse(true);
    } else {
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

  const getAllPermission = () => {
    makeRequest('get', `permission/listPermission`)
      .then(({ data }) => {
        if (data.signal) {
          let permissionArray = Object.values(groupBy(data.data, 'type'));
          setPermissions({
            ...dataPer,
            permissionArray
          });
          setLoadPerm(false);
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    enableLoading();
    makeRequest('post', `permission/setRolePermission`, { role_id: dataState.role.id, permissions: dataState.arrayPermissionChossen })
      .then(({ data }) => {
        if (data.signal) {
          showSuccessMessageIcon('Cập nhật thành công');
          props.history.push('/permissions/roles');
          setLoading(false);
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

  const onChangeCheckbox = (value, checked) => {
    let { arrayPermissionChossen } = dataState;
    if (checked === true) {
      arrayPermissionChossen.push(value)
    } else {
      arrayPermissionChossen.map((item, index) => {
        if (item === value) {
          arrayPermissionChossen.splice(index, 1)
        }
      })
    }
    setData({
      ...dataState,
      arrayPermissionChossen
    })
  }
  const renderMain = () => {
    let result = [];
    if (Object.keys(dataPer).length) {
      dataPer.permissionArray.map((item) => {
        result.push(<div className="sm-role" style={{
          margin: 20,
          borderBottom: '1px solid #ccc',
          paddingBottom: 10,
          textTransform: 'capitalize',
          fontWeight: 'bolder',
          fontSize: 20,
        }} > {item[0].type} </div>)
        result.push(item.map((value) => {
          if (dataState.role.id == 1 || dataState.role.id == 2) {
            return (
              <div>
                <div className="form-group sm-col-6" style={{ marginLeft: 20 }} key={value.key}>
                  <Checkbox defaultChecked={true} disabled={true} > {value.name} </Checkbox>
                </div>
              </div>

            )
          } else {
            return (
              <div className="form-group sm-col-6" style={{ marginLeft: 20 }} key={value.key}>
                <Checkbox checked={dataState.arrayPermissionChossen.includes(value.id)} onChange={(e) => onChangeCheckbox(value.id, e.target.checked)} value={value.id} > {value.name} </Checkbox>
              </div>
            )
          }
        }))
      })
    }
    return result
  }

  if (isLoadRole || isLoadPerm) return <Loading />

  return dataState.role ? (
    <>
      <div className="row">
        <div className="col-md-12">
          <Notice>
            <p style={{ fontSize: '16px' }}>
              <span>Cập nhật phạm vi quyền cho quyền</span> <strong>{dataState.role.name}</strong>
            </p>
          </Notice>

          <div className="kt-section">
            <Card >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {renderMain()}
                  <div className="kt-login__actions">
                    <Link to="/permissions/roles" style={{ marginRight: '5px' }}>
                      <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Huỷ</button>
                    </Link>
                    <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                      {
                        "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                      }
                    )}`} disabled={isLoading === true ? true : false}>
                      Cập nhật quyền
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  ) : <></>;
}

const mapStateToProps = ({ auth }) => ({
  user: auth.user
});

export default connect(mapStateToProps, null)(EditPermissionRole);