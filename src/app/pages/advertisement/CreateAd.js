/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { slugify,validateMaxLength,validateMinLength } from "../../libs/utils"
import { Upload, message,Modal,Select,DatePicker } from 'antd';
import Loading from "../loading"
import { Prompt } from 'react-router'
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
import { URL_API } from '../../config/url';
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

export default function CreateAd(props) {
  // Example 1
  const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const classes1 = useStyles1();
  const inputNameRef = React.createRef();
  const inputDescriptionRef = React.createRef();
  const inputLinkRef = React.createRef();
  const [ dataAdd, setData] = useState({user_id:userLogin.id,unsaved:false,loadingPage:false});  
  const [ loading, setLoading] = useState(false);
  const onChangeValue = (key, value) => {
    setData({
      ...dataAdd,
      [key]: value
    })
  }

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!dataAdd.title) {
        inputNameRef.current.focus();
        return showErrorMessage('Please enter title');
      }else{
        if(!(dataAdd.title).trim().length){
          inputNameRef.current.focus();
          return showErrorMessage('Please enter title');
        }
      }
      if(!dataAdd.link) {
        inputLinkRef.current.focus();
        return showErrorMessage('Please enter link of ad');
      }
      if(!dataAdd.status || dataAdd.status === 'all'){
        return showErrorMessage('Please enter status');
      }

      if(!dataAdd.poster){
        return showErrorMessage('Please upload poster of ad');      
      }
      onChangeValue('loadingPage',true)
      makeRequest('post', `api/admin/addAdvertisement?token=${token}`, dataAdd)
        .then(({ data }) => {
            onChangeValue('loadingPage',false)
            if (data.signal) {
                showSuccessMessageIcon('Create success')
                onChangeValue('unsaved',true)
                if(!props.createAtVideo){
                  props.history.push('/advertisements/list')
                }else{
                  props.setNewActor(data.data)
                  props.clickModalCancel()
                }
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
            onChangeValue('poster', info.file.response.data.url);
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
                    <Card >
                        <Card.Body>
                          <Form onSubmit={handleSubmit}>
                              <Form.Group controlId="formBasicName">
                                  <Form.Label className="starDanger">Title</Form.Label>
                                  <Form.Control type="text" maxLength={255} ref={inputNameRef} autoFocus placeholder="Enter title" value={dataAdd.title || ''} onChange={(e) => onChangeValue('title', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicName">
                                  <Form.Label className="starDanger">Link</Form.Label>
                                  <Form.Control type="text" maxLength={255} ref={inputLinkRef}  placeholder="Enter link" value={dataAdd.link || ''} onChange={(e) => onChangeValue('link', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Status</Form.Label>
                                <Form.Control as="select" value={dataAdd.status || ''} onChange={(e) => onChangeValue('status', e.target.value)}>
                                    <option value='' disabled>Choose status</option>
                                    <option value='1'>Active</option>
                                    <option value='0'>Inactive</option>
                                  </Form.Control>                              
                                </Form.Group>
                              <Form.Group controlId="formBasicDescription">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control as="textarea" maxLength={500} rows="3" ref={inputDescriptionRef} placeholder="Enter description" value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                              </Form.Group>
                              <Form.Group as={Col} controlId="exampleForm.thumbnail">
                                  <Form.Label className="starDanger">Poster</Form.Label>
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
                                    {dataAdd.poster ? <img src={dataAdd.poster} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                  </Upload>
                              </Form.Group>
                              <div className="kt-login__actions">
                                  {!props.createAtVideo &&
                                    <Link to="/advertisements/list" style={{marginRight: '5px'}}>
                                      <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                    </Link>
                                  }
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