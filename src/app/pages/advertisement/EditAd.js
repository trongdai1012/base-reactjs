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

export default function EditAd(props) {
  // Example 1
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataState, setData] = useState({loadingPage:true});
  const [ loading, setLoading] = useState(false);  
  const inputNameRef = React.createRef();
  const inputLinkRef = React.createRef();
  const inputDescriptionRef = React.createRef();

  const setLoadingPage = (value) => {
    setData({
        ...dataState,
        loadingPage:value
    })
  }
  const onChangeValue = (key, value) => {
    let newActor = {...dataState.item,  [key]: value}
    setData({
      ...dataState,
      item:newActor
    })
  }

  useEffect(() => {
    let { id } = props.match.params
    if(id){
      makeRequest('get', `api/admin/getAdvertisement?token=${token}`,{id})
      .then(({ data }) => {        
          if (data.signal) {
              let item  = data.data              
              setData({
              ...dataState,
              item,
              loadingPage:false
            })            
          }
      })
      .catch(err => {
          console.log(err)
      })
    }    
    
  }, []);

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!(dataState.item.title).trim()) {
        inputNameRef.current.focus()
        return showErrorMessage('Please enter title');
      }
      
      if(!dataState.item.link) {
        inputLinkRef.current.focus();
        return showErrorMessage('Please enter link of ad');
      }
      if(dataState.item.status === ''){
        return showErrorMessage('Please enter status');
      }

      if(!dataState.item.poster){
        return showErrorMessage('Please upload poster of ad');      
      }
      setLoadingPage(true)
      makeRequest('post', `api/admin/updateAdvertisement?token=${token}`, dataState)
        .then(({ data }) => {
          setLoadingPage(false)
            if (data.signal) {
                showSuccessMessageIcon('Update success')
                props.history.push('/advertisements/list')
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
  if(dataState.loadingPage){
    return <Loading />
  }
  return (
    <>
        <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                          <Form onSubmit={handleSubmit}>
                              <Form.Group controlId="formBasicName">
                                  <Form.Label className="starDanger">Title</Form.Label>
                                  <Form.Control type="text" maxLength={255} ref={inputNameRef} autoFocus placeholder="Enter name" value={Object.keys(dataState).length ? dataState.item.title : ''} onChange={(e) => onChangeValue('title', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicName">
                                  <Form.Label className="starDanger">Link</Form.Label>
                                  <Form.Control type="text" maxLength={255} ref={inputLinkRef}  placeholder="Enter link" value={Object.keys(dataState).length ? dataState.item.link : ''} onChange={(e) => onChangeValue('link', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Status</Form.Label>
                                <Form.Control as="select" value={Object.keys(dataState).length ? dataState.item.status : ''} onChange={(e) => onChangeValue('status', e.target.value)}>
                                    <option value='' disabled>Choose status</option>
                                    <option value='1'>Active</option>
                                    <option value='0'>Inactive</option>
                                  </Form.Control>                              
                                </Form.Group>
                              <Form.Group controlId="formBasicDescription">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control as="textarea" maxLength={500} ref={inputDescriptionRef} rows="3" placeholder="Enter description" value={Object.keys(dataState).length ? dataState.item.description : ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
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
                                    { Object.keys(dataState).length ? (dataState.item.poster ? <img src={dataState.item.poster} alt="avatar" style={{ width: '100%' }} /> : uploadButton): uploadButton}
                                  </Upload>
                              </Form.Group>
                              <div className="kt-login__actions">
                                  <Link to="/advertisements/list" style={{marginRight: '5px'}}>
                                      <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                  </Link>
                                  <Button variant="primary" type="submit">
                                      Update
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