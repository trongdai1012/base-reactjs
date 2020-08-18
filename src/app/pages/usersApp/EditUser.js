/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { Tabs,Upload, message } from "antd";
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { validateEmail,validateMobile,validateMaxLength,validateMinLength } from "../../libs/utils"
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { URL_API } from '../../config/url';
import Loading from "../loading"
import {
  makeStyles,
  lighten,
  withStyles,
  useTheme
} from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  TableSortLabel,
  TablePagination,
  Switch,
  FormControlLabel,
  TableFooter
} from "@material-ui/core";
import { Button, Form, Card,Col } from "react-bootstrap";
const { TabPane } = Tabs;
const useStyles1 = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto"
  },
  table: {
    minWidth: 650
  }
}));

export default function EditUser(props) {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const classes1 = useStyles1();
  const [ dataState, setData] = useState({loadingPage:true});
  const [ roles, setRoles] = useState([]);
  const [ loading, setLoading] = useState(false);  
  const inputEmailRef = React.createRef();
  const inputPhoneRef = React.createRef();
  const inputFullnameRef = React.createRef();
  const inputUsernameRef = React.createRef();
  const inputPasswordRef = React.createRef();
  const inputRePasswordRef = React.createRef();
  const inputDesscriptiondRef = React.createRef();

  const setLoadingPage = (value) => {
    setData({
        ...dataState,
        loadingPage:value
    })
  }
  const onChangeValue = (key, value) => {
      const newUser = {...dataState.user,  [key]: value }
      setData({
          ...dataState,
          user:newUser
      })
  }
  const clickTab = (key) => {
    setData({
      ...dataState,
      activeKey: key
    })
  }
  useEffect(() => {
    let { id } = props.match.params
    // getRoles()
    if(id){
      makeRequest('get', `api/admin/getUserById?token=${token}`,{id})
      .then(({ data }) => {
          if (data.signal) {
              let user  = data.data
              setData({
              ...dataState,
              user,
              activeKey:'1',
              loadingPage:false
            })            
          }
      })
      .catch(err => {
          console.log(err)
      })
    }    
    
  }, []);

  function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }

    return isJpgOrPng;
  }

  const handleChange = info => {
    console.log('+++++++++++++++++++', { info })
    if (info.file.status === 'uploading') {
        setLoading(true);
        return;
    }
    if (info.file.status === 'done') {
        // Get this url from response in real world.
        if (info.file.response.signal) {
            onChangeValue('avatar', info.file.response.data.url);
            setLoading(false);
        }
    }
  }; 

  const uploadButton = (
    <div>
    {loading ? <LoadingOutlined /> : <PlusOutlined />}
    <div className="ant-upload-text">Upload</div>
    </div>
  );

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!dataState.user.email && !dataState.user.mobile) {
        inputEmailRef.current.focus()
        return showErrorMessage('Please enter email or mobile');
      }
      if (dataState.user.email && !validateEmail(dataState.user.email)) {        
        inputEmailRef.current.focus()
        return showErrorMessage('Please enter a valid email address')
      }
      if (dataState.user.mobile) {
            if (validateMaxLength(dataState.user.mobile, 10)) {
              inputPhoneRef.current.focus()
              return showErrorMessage('The mobile number may not be greater than 10 characters')
            }
        }
      if (!(dataState.user.display_name).trim()) {
        inputFullnameRef.current.focus()
        return showErrorMessage('Please enter name');
      }
    
    setLoadingPage(true)
    makeRequest('post', `api/admin/updateUser?token=${token}`, dataState)
      .then(({ data }) => {
        setLoadingPage(false)
          if (data.signal) {
              showSuccessMessageIcon('Update success')
              props.history.push('/users-app')
          } else {
            return showErrorMessage(data.message);
          }
      })
      .catch(err => {
          console.log('++++++++++++++++', err)
      })
  }

  const hanldeUpdatePassword = (e) => {
    e.preventDefault();
    setLoadingPage(true)
    if (!dataState.password) {
      inputPasswordRef.current.focus()
      return showErrorMessage('Please enter password');
    }else{
      if (validateMaxLength(dataState.password, 225)) {
        inputPasswordRef.current.focus()
        return showErrorMessage('The password may not be greater than 10 characters')
      } else if (validateMinLength(dataState.password, 6)) {
        inputPasswordRef.current.focus()
          return showErrorMessage('The password must be at least 6 characters')
      }
    }
    if (!dataState.repassword) {
      inputRePasswordRef.current.focus()
      return showErrorMessage('Please enter re-password');
    }
    if(dataState.repassword !== dataState.password){
      inputRePasswordRef.current.focus()
      return showErrorMessage('Re-password not same as password');
    }

    makeRequest('post', 'api/admin/updatePasswordUser', dataState)
      .then(({ data }) => {
        setLoadingPage(false)
          if (data.signal) {
            showSuccessMessageIcon('Update success')
            setData({
              ...dataState,
              activeKey: '1',
              password:'',
              repassword:''
            })
          } else {
            return showErrorMessage(data.message);
          }
      })
      .catch(err => {
          console.log('++++++++++++++++', err)
      })
  }

  const renderEmail = () => {
    if(Object.keys(dataState).length){
      if(dataState.user.email && dataState.user.otpEmail && !dataState.user.otpEmail.active){
        return (
          <div className="input-group">
            <input type="email" autoFocus maxLength={255} ref={inputEmailRef} className="form-control" onChange={(e) => onChangeValue('email', e.target.value)} placeholder="Enter email" value={Object.keys(dataState).length ? dataState.user.email : ''}/>
            <div className="input-group-append">
              <button className="btn btn-danger" type="button"><i style={{color:'#fff'}} className="fa fa-exclamation-circle"></i>no verify</button>
            </div>
          </div> 
        )
      }else if(dataState.user.email && dataState.user.otpEmail && dataState.user.otpEmail.active){
        return (
          <div className="input-group">
            <input type="email" autoFocus maxLength={255} ref={inputEmailRef} className="form-control" onChange={(e) => onChangeValue('email', e.target.value)} placeholder="Enter email" value={Object.keys(dataState).length ? dataState.user.email : ''}/>
            <div className="input-group-append">
              <button className="btn btn-success" type="button"><i style={{color:'#fff'}} className="fa fa-check-circle"></i>verified</button>            
            </div>
          </div> 
        )
      }else {
        return <Form.Control autoFocus maxLength={255} type="email" ref={inputEmailRef} placeholder="Enter email" value={Object.keys(dataState).length ? dataState.user.email : ''} onChange={(e) => onChangeValue('email', e.target.value)}/>
      }
    }
  }

  const renderMobile = () => {
    if(Object.keys(dataState).length){
      if(dataState.user.mobile && dataState.user.otpMobile && !dataState.user.otpMobile.active){
        return (
          <div className="input-group">
            <input type="text" ref={inputPhoneRef} maxLength={10} className="form-control" onChange={(e) => onChangeValue('mobile', e.target.value)} placeholder="Enter mobile" value={Object.keys(dataState).length ? dataState.user.mobile : ''}/>
            <div className="input-group-append">
              <button className="btn btn-danger" type="button"><i style={{color:'#fff'}} className="fa fa-exclamation-circle"></i>no verify</button>
            </div>
          </div> 
        )
      }else if(dataState.user.mobile && dataState.user.otpMobile && dataState.user.otpMobile.active){
        return (
          <div className="input-group">
            <input type="text" ref={inputPhoneRef} maxLength={10}  className="form-control" onChange={(e) => onChangeValue('mobile', e.target.value)} placeholder="Enter mobile" value={Object.keys(dataState).length ? dataState.user.mobile : ''}/>
            <div className="input-group-append">
              <button className="btn btn-success" type="button"><i style={{color:'#fff'}} className="fa fa-check-circle"></i>verified</button>            
            </div>
          </div> 
        )
      }else {
        return  <Form.Control type="text" maxLength={10} ref={inputPhoneRef}  placeholder="Enter mobile" value={Object.keys(dataState).length ? dataState.user.mobile : ''} onChange={(e) => onChangeValue('mobile', e.target.value)}/>
      }
    }
  }
  if(dataState.loadingPage){
    return <Loading />
  }
  return (
    <>
        {/* <Notice >
            <p>All user in Netelly</p>
        </Notice> */}

        <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    {/* <span className="kt-section__sub">
                        Add New User
                    </span> */}
                        <Tabs onChange={clickTab} activeKey={dataState.activeKey} >
                          <TabPane tab='Update information' key="1">
                              <Card >
                                <Card.Body>
                                  <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                      <Form.Group as={Col} controlId="formBasicEmail">
                                          <Form.Label>Email address</Form.Label>
                                          {renderEmail()}
                                      </Form.Group>

                                      <Form.Group as={Col} controlId="formBasicMobile">
                                          <Form.Label>Mobile number</Form.Label>
                                          {renderMobile()}
                                      </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                      <Form.Group as={Col} controlId="formBasicUsername">
                                          <Form.Label>Nettely ID</Form.Label>
                                          <Form.Control type="text" ref={inputUsernameRef} maxLength={255}  placeholder="Enter Nettely ID" value={Object.keys(dataState).length ? dataState.user.username : ''} onChange={(e) => onChangeValue('username', e.target.value)}/>
                                      </Form.Group>
                                      <Form.Group as={Col} controlId="formBasicName">
                                          <Form.Label className="starDanger">Fullname</Form.Label>
                                          <Form.Control type="text"  maxLength={255} ref={inputFullnameRef}  placeholder="Enter name" value={Object.keys(dataState).length ? dataState.user.display_name : ''} onChange={(e) => onChangeValue('display_name', e.target.value)}/>
                                      </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formBasicDescription">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" maxLength={255} ref={inputDesscriptiondRef} rows="3" placeholder="Description" value={Object.keys(dataState).length ? dataState.user.description : ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Group as={Col} controlId="exampleForm.thumbnail">
                                      <Form.Label>Avatar</Form.Label>
                                        <p style={{fontSize:'9pt'}}>Standard size: 16: 9 Full HD</p>
                                      <Upload
																					accept="image/*"
                                          name="file"
                                          listType="picture-card"
                                          className="avatar-uploader"
                                          showUploadList={false}
                                          action={`${URL_API}api/admin/uploadThumnail`}
                                          beforeUpload={beforeUpload}
                                          onChange={handleChange}
                                      >
                                        { Object.keys(dataState).length ? (dataState.user.avatar ? <img src={dataState.user.avatar} alt="avatar" style={{ width: '100%' }} /> : uploadButton): uploadButton}
                                      </Upload>
                                  </Form.Group>
                                    <div className="kt-login__actions">
                                        <Link to="/users-app" style={{marginRight: '5px'}}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                        </Link>
                                        <Button variant="primary" type="submit">
                                            Update
                                        </Button>
                                    </div>
                                  </Form>
                                </Card.Body>
                            </Card>
                          </TabPane>
                          <TabPane tab='Update password' key="2">
                            <Card >
                              <Card.Body>
                                  <Form.Group controlId="formBasicPassword">
                                      <Form.Label className="starDanger">Password</Form.Label>
                                      <Form.Control type="password" maxLength={255} ref={inputPasswordRef} placeholder="Password" value={dataState.password || ''} onChange={(e) => onChangeValue('password', e.target.value)}/>
                                  </Form.Group>
                                  <Form.Group controlId="formBasicPassword">
                                      <Form.Label className="starDanger">Re Password</Form.Label>
                                      <Form.Control type="password" maxLength={255} ref={inputRePasswordRef} placeholder="Re-Password" value={dataState.repassword || ''} onChange={(e) => onChangeValue('repassword', e.target.value)}/>
                                  </Form.Group>
                                    <div className="kt-login__actions">
                                        <Button variant="primary" type="button" onClick={hanldeUpdatePassword}>
                                            Update
                                        </Button>
                                    </div>
                              </Card.Body>
                            </Card>
                          </TabPane>
                          <TabPane tab='SNS accounts' key="3">
                            <div className="row">
                              <div className="col-md-12">
                                <div className="kt-section">
                                  <div className="kt-section__content">
                                    <Paper>
                                      <div className="col-md-12">
                                        <Table>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>No</TableCell>
                                              <TableCell>Email</TableCell>
                                              <TableCell>Username</TableCell>
                                              <TableCell>SNS</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {Object.keys(dataState).length && dataState.user.sns.length ? dataState.user.sns.map((row,key) => (
                                              <TableRow key={`user-edit-${row.id}`}>
                                                <TableCell component="th" scope="row">
                                                  {(key + 1)}
                                                </TableCell>
                                                <TableCell>{row.email}</TableCell>
                                                <TableCell>{row.username}</TableCell>
                                                <TableCell>{row.sns_type[0].toUpperCase() + row.sns_type.slice(1)}</TableCell>
                                              </TableRow>
                                            )): (
                                              <TableRow>
                                                <TableCell colSpan={4} align="center">Không có dữ liệu để hiển thị</TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                          
                                        </Table>
                                      </div>
                                    </Paper>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabPane>
                        </Tabs>
                </div>
            </div>
        </div>
    </>
  );
}