/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Upload, message,Modal,Select,DatePicker,Progress,Radio  } from 'antd';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateMaxLength,validateMinLength } from "../../libs/utils"
import { Tabs,Checkbox } from "antd";
import ListChooseActor from './actors/ListChooseActor'
import TinyMCEditor from '../common/TinyMCEditor'
import { Prompt } from 'react-router'
import Loading from "../loading"
import axios from "axios";
// import S3 from 'aws-s3';
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
import { Button, Form, Card, Col, Row } from "react-bootstrap";
import { URL_API,URL_API_ENCODEVIDEO } from '../../config/url';
import "antd/dist/antd.css";
const { Option } = Select;
const { TabPane } = Tabs;
const DragUpload = Upload.Dragger;

const getRenamedFileBeforeUploading = (file) => {
    const fileName = file.name;
    const ext = fileName.split('.')[fileName.split('.').length - 1];
    const fileNameWithoutExt = fileName.replace(`.${ext}`, '');
    const timeStamp = new Date().getTime();
    const newFileName = `${fileNameWithoutExt}-${timeStamp}.${ext}`;
    return new File([file], newFileName, { type: file.type });
};

const getRenamedFile = (file) => {
    const fileName = file.name;
    const ext = fileName.split('.')[fileName.split('.').length - 1];
    const fileNameWithoutExt = fileName.replace(`.${ext}`, '');
    const timeStamp = new Date().getTime();
    const newFileName = `${fileNameWithoutExt}-${timeStamp}.${ext}`;
    return newFileName;
};

// let s3Config = {
//     dirName: 'videos',
//     bucketName: 'netellyproject',
//     accessKeyId: 'AKIA2OHSBPT2662ZUSMQ',
//     secretAccessKey: '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',
//     region: 'ap-northeast-1',
//     s3Url: 'http://netellyproject.s3-ap-northeast-1.amazonaws.com/'
// };

// const S3Client = new S3(s3Config);

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
function disabledDate(current) {
    return current && current < moment().subtract(1, 'day');
  }
  
function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }

    return isJpgOrPng;
  }

export default function CreateVideo(props) {
    // Example 1
    const classes1 = useStyles1();
    const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
    const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);    
    const [ dataAdd, setData] = useState({arrayActorChossen:[],list_thumbnail:[],user_id:userLogin.id,unsaved:false,loadingPage:true,isUtubeLink:false});
    const [ loading, setLoading] = useState(false);
    const [ activeKey, setActiveKey] = useState('1');
    const [ listCategory, setCategoryList] = useState([]);
    const [ listTag, setTagList] = useState([]);
    const [ listActor, setActorList] = useState([]);
    const [ dataSearch, setDataSearch] = useState([]);
    const inputTitleRef = React.createRef();
    const inputTimeRef = React.createRef();
    const inputOrderRef = React.createRef();
    const [progress, setProgress] = useState(0);
    
    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const onChangeDatetime = (value, dateString) => {
        setData({
            ...dataAdd,
            start_time: dateString
        })
    }
    
    useEffect(() => {
        getAllTag()
        makeRequest('get', `api/admin/allVideoCategory?token=${token}`)
            .then(({ data }) => {
                if (data.signal) {
                    const list = data.data;
                    setCategoryList(list)
                    onChangeValue('loadingPage',false)
                    // onChangeValue('category_id', list[0] ? list[0].id : '');
                }
            })
            .catch(err => {
                console.log(err)
            })
    }, [])
    useEffect(() => {
        if(props.removeText === true){
            setData({arrayActorChossen:[],list_thumbnail:[],user_id:userLogin.id})
        }
    },[
      props.removeText
    ]);
    // useEffect(() => {
    //     onChangeValue('user_id', userLogin.id);

    // },[
    //     props.createAtVideo
    // ]);
        
    const getAllTag = () => {
        makeRequest('get', `api/admin/allTag?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {          
                setTagList(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    const handleUploadSuccess = (data,file) => {
        let imageUrl = data.file
        setData({
            ...dataAdd,
            url: URL.createObjectURL(file),
            file:imageUrl
        })
    };

    const getUploadDraggerProps = () => ({
        multiple: false,
        accept:'.mp4,.webm',
        customRequest: (request) => {
            const { file, onSuccess,onProgress } = request;
            const isJpgOrPng = file.type === 'video/mp4' || file.type === 'video/webm';
            if (!isJpgOrPng) {
                return alert('You can only upload video file!');
            }

            // let fileName = getRenamedFile(file)
            setLoading(true);
            let dataUpload = new FormData();
            dataUpload.append('file', file);
            const config = {
                headers: { "content-type": "multipart/form-data" },
                onUploadProgress: event => {
                  const percent = Math.floor((event.loaded / event.total) * 100);
                  setProgress(percent);
                  if (percent === 100) {
                    setTimeout(() => setProgress(0), 1000);
                  }
                  onProgress({ percent: (event.loaded / event.total) * 100 });
                }
              };
              axios.post(`${URL_API}api/admin/uploadVideo`, dataUpload, config)
                .then(({data}) => {
                    if (data.signal) {
                        setLoading(false);
                        onSuccess(data.data,file);
                    }
                })
                .catch((err) => {
                    console.log('============', err);
                });
        },
        onSuccess: handleUploadSuccess,
        fileList: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dataAdd.url) {
            return showErrorMessage('Please upload a video');
        }

        if (!dataAdd.title) {
            inputTitleRef.current.focus()
            return showErrorMessage('Please enter name of video');
        }else{
            if(!(dataAdd.title).trim().length){
                inputTitleRef.current.focus();
                return showErrorMessage('Please enter name of video');
            }
            if (validateMaxLength(dataAdd.title, 225)) {
                inputTitleRef.current.focus()
                return showErrorMessage('The name may not be greater than 225 characters')
            }
        }

        if (!dataAdd.category_id) {
            return showErrorMessage('Please enter category of video');
        }

        if (!dataAdd.status) {
            return showErrorMessage('Please enter status of video');
        }

        if (!dataAdd.description) {
            return showErrorMessage('Please enter description of video');
        }else{
            if(!(dataAdd.description).trim().length){
                return showErrorMessage('Please enter description of video');
            }
        }

        if (!dataAdd.thumbnail) {
            return showErrorMessage('Please upload a avatar picture of video');
        }

        if (!dataAdd.start_time) {
            inputTimeRef.current.focus();
            return showErrorMessage('Please enter start time of video');
        }        
        onChangeValue('loadingPage',true)
        makeRequest('post', `api/admin/addVideo?token=${token}`, dataAdd)
            .then(({ data }) => {
                onChangeValue('loadingPage',false)
                if (data.signal) {
                    showSuccessMessageIcon('Create success')
                    onChangeValue('unsaved',true)
                    if(!props.createAtVideo){
                        props.history.push('/videos/list')
                    }else{                        
                        props.setNewVideo(data.data)
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

    const exitCreate = () => {
        props.clickModalCancel()
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
                onChangeValue('thumbnail', info.file.response.data.url);
                setLoading(false);
            }
        }
    }; 
    
    const handleChangeListThumbnail = info => {
        console.log('+++++++++++++++++++', { info })
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            if (info.file.response.signal) {
                let { list_thumbnail } = dataAdd
                list_thumbnail.push(info.file.response.data.url)
                onChangeValue('list_thumbnail', list_thumbnail);
                setLoading(false);
            }
        }
    }; 

    const removeFileItem = info => {        
        let url = info.response.data.url;
        let { list_thumbnail } = dataAdd
        list_thumbnail.map((item, index) => {
            if (item === url) {
                list_thumbnail.splice(index, 1)
            }
            return true
        })
        setData({
            ...dataAdd,
            list_thumbnail
        })        
    }

    const uploadButton = (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div className="ant-upload-text">Upload</div>
        </div>
    );

    const getIdUtube = (url) =>{
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = url.match(regExp);

        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return "error";
        }

    }

    const onChangeLinkUtube = (key, value) => {
        let newValue =  `https://www.youtube.com/embed/${getIdUtube(value)}?autoplay=1`
        setData({
            ...dataAdd,
            'url': getIdUtube(value),
            urlEmbed:newValue
        })
    }

    const changeUtubeLink = (value) =>{
        setData({
            ...dataAdd,
            isUtubeLink: value,
            url:'',
            urlEmbed:''
        })
    }

    const handleChangeTag = (value) => {
        setData({
            ...dataAdd,
            tags: value
        })
    }
    const clickTab = (key) => {
        setActiveKey(key);
    }

    const handleChooseActor = (arrayActorChossen) => {        
        setData({
            ...dataAdd,
            arrayActorChossen
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
            {/* <Tabs onChange={clickTab} activeKey={activeKey} >
                <TabPane tab='Update information' key="1"> */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="kt-section">
                            <Card >
                                <Card.Body>
                                    <div style={{display:'flex'}}>
                                        <Card.Title style={{width:'20%'}}>Type Upload</Card.Title> 
                                        <div style={{width:'100%',textAlign:'right'}}>
                                            <button type="button" className="btn btn-primary btn-sm btn-icon-h kt-margin-l-1" style={{marginRight: '5px'}} onClick={(e) => handleSubmit(e)}>Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm btn-icon-h kt-margin-l-1" onClick={exitCreate}>Exit</button>                                      
                                        </div>
                                        {/* { !dataAdd.isUtubeLink ? (
                                            <button type="button" className="btn btn-primary btn-sm btn-elevate kt-login__btn-secondary" onClick={(e) => changeUtubeLink(true)} style={{marginBottom:15,marginLeft:15}}>Add youtube link</button> 
                                        ) : (
                                            <button type="button" className="btn btn-primary btn-sm btn-elevate kt-login__btn-secondary" onClick={ (e) => changeUtubeLink(false)} style={{marginBottom:15,marginLeft:15}}>Upload video</button> 
                                        )}                      
                                        */}
                                    </div>
                                    <Radio.Group onChange={(e) => changeUtubeLink(e.target.value)} value={dataAdd.isUtubeLink} style={{marginBottom:15}}>
                                        <Radio value={false} defaultChecked>Upload video with file</Radio>
                                        <Radio value={true}>Upload video by youtube link</Radio>
                                    </Radio.Group>
                                    { dataAdd.isUtubeLink ? (
                                        <Form.Group as={Col} controlId="formGridUtube">
                                            <Form.Label>Youtube Link</Form.Label>
                                            <Form.Control type="text" value={dataAdd.urlEmbed || ''} onChange={(e) => onChangeLinkUtube('urlEmbed', e.target.value)} />
                                        </Form.Group>
                                    ) : (
                                        <div>
                                            <DragUpload {...getUploadDraggerProps(handleUploadSuccess)}>
                                                <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                                </p>
                                                {dataAdd.url ? <p className="ant-upload-text">Click or drag file to this area to upload</p> : (<div>
                                                {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                                </div>)}
                                                {progress > 0 ? <Progress size="small" strokeColor={{'0%': '#108ee9','100%': '#87d068', }} percent={progress} /> : null}
                                            </DragUpload>
                                        </div>
                                    )}

                                    { dataAdd.url && !dataAdd.isUtubeLink  ? (
                                        <Row>
                                            <Col md={{ span: 6, offset: 3 }}>
                                                <video src={dataAdd.url} controls width="100%" style={{marginTop: '10px'}}/>
                                            </Col>
                                        </Row>
                                    ): (dataAdd.isUtubeLink &&  dataAdd.urlEmbed ? (
                                        <Row>
                                            <Col md={{ span: 6, offset: 3 }}>
                                            <iframe autoPlay style={{marginTop: '10px',width:500,height:300}} src={dataAdd.urlEmbed}></iframe>
                                            </Col>
                                        </Row>
                                    ) : '')}

                                </Card.Body>
                            </Card>
                            
                        </div>
                    </div>
                </div>

                <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        
                        <Card >
                            <Card.Body>
                                <Card.Title>Video Info</Card.Title>
                                <Form>
                                    <Form.Row>
                                        <Col xs={12} md={12}>
                                            <Form.Group controlId="formGridEmail">
                                                <Form.Label className="starDanger">Name</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputTitleRef} autoFocus value={dataAdd.title || ''} onChange={(e) => onChangeValue('title', e.target.value)} />
                                            </Form.Group>
                                            <Form.Row>                                               
                                                <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                                    <Form.Label className="starDanger">Category</Form.Label>
                                                    <Form.Control as="select" value={dataAdd.category_id || ''} placeholder="Select Category" onChange={(e) => onChangeValue('category_id', e.target.value)} >
                                                        <option value="">Select Category</option>
                                                        {listCategory.map((it, idx) => {
                                                            return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                                                        })}
                                                    </Form.Control>
                                                </Form.Group>
                                                <Form.Group as={Col} controlId="formGridOrder">
                                                    <Form.Label>Order</Form.Label>
                                                    <Form.Control type="text" maxLength={255} ref={inputOrderRef} value={dataAdd.order || ''} onChange={(e) => onChangeValue('order', e.target.value)} />
                                                </Form.Group>
                                            </Form.Row>
                                        </Col>
                                        
                                        <Col xs={12} md={12}>
                                            <Form.Group  controlId="formGridDesc">
                                                <Form.Label className="starDanger">Description</Form.Label>
                                                {/* <Form.Control as="textarea" ref={inputDescriptionRef} rows={6} value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)} /> */}
                                                <TinyMCEditor
                                                name="description"
                                                handleChange={onChangeValue}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>
                                        <Col xs={4} md={3}>
                                            <Form.Group controlId="formBasicStatus">
                                                <Form.Label className="starDanger">Status</Form.Label>
                                                <Form.Control as="select" value={dataAdd.status || ''} onChange={(e) => onChangeValue('status', e.target.value)}>
                                                <option value='' disabled>Choose status</option>
                                                <option value='1'>Active</option>
                                                {/* <option value='2'>Privite</option> */}
                                                <option value='0'>Inactive</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={4} md={3}>
                                            <Form.Group controlId="formGridDesc">
                                                <Form.Label className="starDanger">Start time</Form.Label>
                                                <br></br>
                                                <DatePicker showTime ref={inputTimeRef} className="form-control"  onChange={onChangeDatetime} name="start_time" placeholder="Start date" disabledDate={disabledDate} value={dataAdd.start_time ? moment(dataAdd.start_time): ''} />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={4} md={6}>
                                            <Form.Group controlId="exampleForm.tag">
                                                <Form.Label>Tags</Form.Label>
                                                <Select  style={{ width: '100%' }} onChange={handleChangeTag} tokenSeparators={[',']}>
                                                        {listTag.map((it, idx) => {
                                                            return <Option value={it.id} key={`tag-${it.id}`}>{it.name}</Option>
                                                        })}
                                                </Select>
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group controlId="exampleForm.thumbnail" style={{marginLeft:6}}>
                                            <Form.Label className="starDanger">Avatar picture</Form.Label>
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
                                                {dataAdd.thumbnail ? <img src={dataAdd.thumbnail} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                            </Upload>
                                        </Form.Group>
                                    
                                        <Form.Group controlId="exampleForm.thumbnail" style={{marginLeft:6,width:"80%"}}>
                                            <Form.Label>Thumbnails</Form.Label>
                                            <p style={{fontSize:'9pt'}}>Standard size: 16: 9 Full HD</p>
                                            <Upload
										        accept="image/*"
                                                name="file"
                                                multiple={true}
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={true}
                                                action={`${URL_API}api/admin/uploadThumnail`}
                                                beforeUpload={beforeUpload}
                                                onChange={handleChangeListThumbnail}
                                                onRemove={removeFileItem}
                                            >
                                                {uploadButton}
                                            </Upload>
                                        </Form.Group>
                                    </Form.Row>

                                    <div className="kt-login__actions">
                                        <button type="button" className="btn btn-primary btn-sm btn-icon-h kt-margin-l-1" style={{marginRight: '5px'}} onClick={(e) => handleSubmit(e)}>Save</button>
                                        <button type="button" className="btn btn-secondary btn-sm btn-icon-h kt-margin-l-1" onClick={exitCreate}>Exit</button>
                                    </div>

                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
                {/* </TabPane>
                <TabPane tab='Add Actor' key="2">
                    <ListChooseActor
                        handleChooseActor={handleChooseActor}
                        listData={[]}
                    />
                </TabPane>
            </Tabs> */}
        </>
    );
}