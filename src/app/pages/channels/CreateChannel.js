/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Prompt } from 'react-router'
import { Link } from 'react-router-dom';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { slugify,validateMaxLength,validateMinLength } from "../../libs/utils"
import ListChooseEvent from './ListChooseEvent'
import ListChooseVideo from '../videos/ListChooseVideo'
import TinyMCEditor from '../common/TinyMCEditor'
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
import { Upload, message,Modal,Select,DatePicker,Tabs } from 'antd';
import { Button, Form, Card,Col } from "react-bootstrap";
import Loading from '../loading'
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

export default function CreateChannel(props) {
  // Example 1
  const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const inputRef = React.createRef();
  const inputSlugRef = React.createRef();
  const classes1 = useStyles1();
  const [ dataAdd, setData] = useState({user_id:userLogin.id,unsaved:false,loadingPage:false});
  const [ loading, setLoading] = useState(false);
  const [ activeKey, setActiveKey] = useState('1');

  const onChangeValue = (key, value) => {
    if(key === 'name'){
      setData({
        ...dataAdd,
        [key]: value,
        slug:slugify(value)
      })
    }else if(key === 'slug'){
      setData({
        ...dataAdd,
        slug:slugify(value)
      })
    }else{
      setData({
        ...dataAdd,
        [key]: value
      })
    }
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
  const handleChangeCover = info => {
    console.log('+++++++++++++++++++', { info })
    if (info.file.status === 'uploading') {
        setLoading(true);
        return;
    }
    if (info.file.status === 'done') {
        // Get this url from response in real world.
        if (info.file.response.signal) {
            onChangeValue('cover', info.file.response.data.url);
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
    if (!dataAdd.name) {
      inputRef.current.focus();
      return showErrorMessage('Please enter name');
    }else{
      if(!(dataAdd.name).trim().length){
        inputRef.current.focus();
        return showErrorMessage('Please enter name');
      }
      
    }
    if(!dataAdd.slug){
      inputSlugRef.current.focus();
      return showErrorMessage('Please enter slug');
    }

    if (!dataAdd.status) {
      return showErrorMessage('Please enter channel status');
    }

    if (!dataAdd.avatar) {
      return showErrorMessage('Please upload a avatar for channel');
    }
    onChangeValue('loadingPage', true);

    makeRequest('post', `api/admin/addChannel?token=${token}`, dataAdd)
      .then(({ data }) => {
          onChangeValue('loadingPage', false);
          if (data.signal) {
            showSuccessMessageIcon('Create success')
            onChangeValue('unsaved',true)
            props.history.push('/channels/list')
          } else {
            return showErrorMessage(data.message);
          }
      })
      .catch(err => {
          console.log('++++++++++++++++', err)
      })
  }
  const clickTab = (key) => {
    setActiveKey(key);
  }

  const handleChooseVideo = (arrayVideoChossen) => {        
    setData({
        ...dataAdd,
        arrayVideoChossen
    })  
  }
  
  const handleChooseEvent = (arrayEventChossen) => {        
    setData({
        ...dataAdd,
        arrayEventChossen
    })  
  }
  if(dataAdd.loadingPage){
    return <Loading />
  }
  return (
    <>
    <Prompt
        when={!dataAdd.unsaved}
        message='You have unsaved changes, are you sure you want to leave?'
    />
    <Tabs onChange={clickTab} activeKey={activeKey} >
        <TabPane tab='Update information' key="1">
          <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Form.Row>
                            <Form.Group as={Col} controlId="formBasicName">
                                <Form.Label className="starDanger">Name</Form.Label>
                                <Form.Control type="text" maxLength={255} autoFocus ref={inputRef} placeholder="Enter name" value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formBasicSlug">
                                <Form.Label className="starDanger">Slug</Form.Label>
                                <Form.Control type="text" maxLength={255} ref={inputSlugRef} placeholder="Enter slug" value={dataAdd.slug || ''} onChange={(e) => onChangeValue('slug', e.target.value)}/>
                            </Form.Group>
                          </Form.Row>
                          <Form.Row>
                            <Form.Group as={Col} controlId="formBasicStatus">
                                <Form.Label className="starDanger">Status</Form.Label>
                                <Form.Control as="select" value={dataAdd.status || ''} onChange={(e) => onChangeValue('status', e.target.value)}>
                                  <option value='' disabled>Choose status</option>
                                  <option value='1'>Active</option>
                                  <option value='0'>Inactive</option>
                                </Form.Control>
                            </Form.Group>
                          </Form.Row>
                          <Form.Row>
                            <Form.Group as={Col} controlId="formBasicDescription">
                                <Form.Label>About</Form.Label>
                                <TinyMCEditor
                                  name="about"
                                  handleChange={onChangeValue}
                                />
                                {/* <Form.Control as="textarea" rows="3" placeholder="Enter about" value={dataAdd.about || ''} onChange={(e) => onChangeValue('about', e.target.value)}/> */}
                            </Form.Group>
                          </Form.Row>
                          <Form.Row>
                            <Form.Group as={Col} controlId="formBasicAvatar">
                                <Form.Label className="starDanger">Avatar</Form.Label>
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
                            <Form.Group as={Col} controlId="formBasicCover">
                                <Form.Label>Cover</Form.Label>
                                <p style={{fontSize:'9pt'}}>Standard size: 16: 9 Full HD</p>
                                <Upload
                                      accept="image/*"
                                      name="file"
                                      listType="picture-card"
                                      className="avatar-uploader"
                                      showUploadList={false}
                                      action={`${URL_API}api/admin/uploadThumnail`}
                                      beforeUpload={beforeUpload}
                                      onChange={handleChangeCover}
                                  >
                                    {dataAdd.cover ? <img src={dataAdd.cover} alt="cover" style={{ width: '100%' }} /> : uploadButton}
                                  </Upload>
                            </Form.Group>
                          </Form.Row>
                          <div className="kt-login__actions">
                              <Link to="/channels/list" style={{marginRight: '5px'}}>
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
        </TabPane>
        <TabPane tab='Add video' key="2">
          <ListChooseVideo
              handleChooseVideo={handleChooseVideo}
              listData={[]}
          />
        </TabPane>
        <TabPane tab='Add event' key="3">
          <ListChooseEvent
              handleChooseEvent={handleChooseEvent}
              listData={[]}
          />
        </TabPane>
    </Tabs>
    </>
  );
}