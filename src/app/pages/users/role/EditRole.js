/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import { Breadcrumb } from 'antd';
import { Button, Form, Card, Col } from "react-bootstrap";
import { AUTH_TOKEN_KEY } from '../../../config/auth';
import clsx from 'clsx';
import checkPermission from '../../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

const EditRole = (props) => {
  // Example 1
  const [isLoading, setLoading] = useState(false);
  const inputRef = React.createRef();
  const inputDescriptionRef = React.createRef();
  const token = JSON.parse(JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY)).authToken)
  const [dataState, setData] = useState({});
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    marginTop: "3px"
  });
  const [isRefuse, setRefuse] = useState(false);
  const [isFirstLoad, setFirstLoad] = useState(false);

  const permissions = {
    updateRole: 'update-role'
  }

  useEffect(() => {
    let check = checkPermission(permissions.updateRole);
    if (check == 1) {
      let { id } = props.match.params
      if (id) {
        makeRequest('get', `api/admin/getRole?token=${token}`, { id })
          .then(({ data }) => {

            if (data.signal) {
              let role = data.data
              setData({
                ...dataState,
                role,
              });
              setLoading(false);
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

  const onChangeValue = (key, value) => {
    const newRole = { ...dataState.role, [key]: value }
    setData({
      ...dataState,
      role: newRole
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!(dataState.role.name).trim()) {
      inputRef.current.focus();
      return showErrorMessage('Vui lòng nhập tên');
    }

    if (dataState.role.status === '') {
      return showErrorMessage('Vui lòng chọn trạng thái');
    }

    enableLoading();

    makeRequest('post', `api/admin/updateRole?token=${token}`, dataState)
      .then(({ data }) => {
        if (data.signal) {
          showSuccessMessageIcon('Update success');
          props.history.push('/users-cms/roles');
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

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="kt-section">
            <Breadcrumb separator=">" style={{ marginBottom: 20 }} className="breadcrumb-custom1">
              <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item href="/users-cms/roles">List Role</Breadcrumb.Item>
              <Breadcrumb.Item>Edit Role</Breadcrumb.Item>
            </Breadcrumb>
            <Card >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <Form.Group as={Col} controlId="formBasicName">
                      <Form.Label className="starDanger">Name</Form.Label>
                      <Form.Control type="text" maxLength={255} autoFocus placeholder="Enter name" ref={inputRef} value={Object.keys(dataState).length ? dataState.role.name : ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formBasicStatus">
                      <Form.Label className="starDanger">Status</Form.Label>
                      <Form.Control as="select" value={Object.keys(dataState).length ? dataState.role.status : 'all'} onChange={(e) => onChangeValue('status', e.target.value)}>
                        <option value='' disabled>Choose status</option>
                        <option value='1'>Active</option>
                        <option value='0'>Inactive</option>
                      </Form.Control>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} controlId="formBasicDescription">
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" maxLength={500} ref={inputDescriptionRef} rows="3" placeholder="Enter description" value={Object.keys(dataState).length ? dataState.role.description : ''} onChange={(e) => onChangeValue('description', e.target.value)} />
                    </Form.Group>
                  </Form.Row>
                  <div className="kt-login__actions">
                    <Link to="/users-cms/roles" style={{ marginRight: '5px' }}>
                      <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Trở lại</button>
                    </Link>
                    <Button variant="primary" type="submit" style={loadingButtonStyle} className={`${clsx(
                      {
                        "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoading
                      }
                    )}`} disabled={isLoading === true ? true : false}>
                      Cập nhật
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = ({ auth }) => ({
  user: auth.user
});

export default connect(mapStateToProps, null)(EditRole);