/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { validateEmail,validateMobile,validateMaxLength,validateMinLength } from "../../libs/utils"
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Prompt } from 'react-router'
import { URL_API } from '../../config/url';
import { Upload, message } from 'antd';
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

export default function CreateUser(props) {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const classes1 = useStyles1();
  const [page3, setPage3] = React.useState(0);
  const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
  const [ dataAdd, setData] = useState({unsaved:false,user_type:0,email:'',mobile:'',loadingPage:false});
//   const [ roles, setRoles] = useState([]);
  const [ loading, setLoading] = useState(false);
  const inputEmailRef = React.createRef();
  const inputPhoneRef = React.createRef();
  const inputFullnameRef = React.createRef();
  const inputPasswordRef = React.createRef();
  const inputRePasswordRef = React.createRef();
  const inputDesscriptiondRef = React.createRef();

  const onChangeValue = (key, value) => {
      setData({
          ...dataAdd,
          [key]: value
      })
  }

  const setRePass = (key, value) => {
    setData({
        ...dataAdd,
        repassword: value
    })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.email && !dataAdd.mobile) {
            inputEmailRef.current.focus()
            return showErrorMessage('Please enter email or mobile');
        }

        if (dataAdd.email) {
            if(!validateEmail(dataAdd.email)){
                inputEmailRef.current.focus()
                return showErrorMessage('Please enter a valid email address')
            }
            
        }
        if (dataAdd.mobile) {
            if (validateMaxLength(dataAdd.mobile, 10)) {              
                inputPhoneRef.current.focus()
                return showErrorMessage('The mobile number may not be greater than 10 characters')
            }
        }

        if (!dataAdd.display_name) {              
            inputFullnameRef.current.focus()
            return showErrorMessage('Please enter fullname');
        }else{
            if(!(dataAdd.display_name).trim().length){
                inputFullnameRef.current.focus();
                return showErrorMessage('Please enter fullname');
            }
            
        }

        if (!dataAdd.password) {
            inputPasswordRef.current.focus()
            return showErrorMessage('Please enter password');
        }else{
            if (validateMinLength(dataAdd.password, 6)) {
                inputPasswordRef.current.focus()
                return showErrorMessage('The password must be at least 6 characters')
            }
        }

        if (!dataAdd.repassword) {
            inputRePasswordRef.current.focus()
            return showErrorMessage('Please enter re-password');
        }
        if(dataAdd.repassword !== dataAdd.password){
            inputRePasswordRef.current.focus()
            return showErrorMessage('Re-password not same as password');
        }

        onChangeValue('loadingPage',true)
        makeRequest('post', `api/admin/addUser?token=${token}`, dataAdd)
        .then(({ data }) => {
            onChangeValue('loadingPage',false)
            if (data.signal) {
                showSuccessMessageIcon('Create success')
                onChangeValue('unsaved',true)
                props.history.push('/users-app')
            } else {
                return showErrorMessage(data.message);
            }
        })
        .catch(err => {
            console.log('++++++++++++++++', err)
        })
    }
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
    if(dataAdd.loadingPage){
        return <Loading />  
    }
    return (
        <>
            <Prompt
                when={!dataAdd.unsaved}
                message='You have unsaved changes, are you sure you want to leave?'
            />
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        {/* <span className="kt-section__sub">
                            Add New User
                        </span> */}
                        <Card >
                            <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="text" maxLength={255} ref={inputEmailRef} autoFocus placeholder="Enter email" value={dataAdd.email || ''} onChange={(e) => onChangeValue('email', e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formBasicMobile">
                                        <Form.Label>Mobile number</Form.Label>
                                        <Form.Control type="number" maxLength={10} ref={inputPhoneRef} placeholder="Enter mobile" value={dataAdd.mobile || ''} onChange={(e) => onChangeValue('mobile', e.target.value)}/>
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formBasicName">
                                        <Form.Label className="starDanger">Fullname</Form.Label>
                                        <Form.Control type="text" maxLength={255} ref={inputFullnameRef} placeholder="Enter name" value={dataAdd.display_name || ''} onChange={(e) => onChangeValue('display_name', e.target.value)}/>
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formBasicPassword">
                                        <Form.Label className="starDanger">Password</Form.Label>
                                        <Form.Control type="password" maxLength={255} ref={inputPasswordRef} placeholder="Password" value={dataAdd.password || ''} onChange={(e) => onChangeValue('password', e.target.value)}/>
                                    </Form.Group>
                                    <Form.Group as={Col} controlId="formBasicRePassword">
                                        <Form.Label className="starDanger">Re-Password</Form.Label>
                                        <Form.Control type="password" maxLength={255} ref={inputRePasswordRef} placeholder="Re-Password" value={dataAdd.repassword || ''} onChange={(e) => setRePass('repassword ', e.target.value)}/>
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    <Form.Group as={Col} controlId="formBasicDescription">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control as="textarea" maxLength={500} rows="3" ref={inputDesscriptiondRef} placeholder="Description" value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
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
                                        {dataAdd.avatar ? <img src={dataAdd.avatar} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                    </Upload>                                
                                    </Form.Group>
                                </Form.Row>
                                <div className="kt-login__actions">
                                    <Link to="/users-app" style={{marginRight: '5px'}}>
                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                    </Link>
                                    <Button variant="primary" type="submit">
                                        Add
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