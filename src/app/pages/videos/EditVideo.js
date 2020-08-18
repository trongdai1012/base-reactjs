    /* eslint-disable no-restricted-imports */
    import React, { useState, useEffect } from "react";
    import clsx from "clsx";
    import PropTypes from "prop-types";
    import Notice from "../../partials/content/Notice";
    import makeRequest from '../../libs/request';
    import { Link } from 'react-router-dom';
    import moment from 'moment';
    import { Upload, message,Modal,Select,DatePicker,Progress,Radio } from 'antd';
    import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
    import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
    import { validateMaxLength,validateMinLength } from "../../libs/utils"
    import { Tabs,Checkbox } from "antd";
    import ListChooseActor from './actors/ListChooseActor'
    import Loading from "../loading"
    import axios from "axios";
    import TinyMCEditor from '../common/TinyMCEditor'
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
    import { URL_API } from '../../config/url';
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

    function beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
        }

        return isJpgOrPng;
    }
    function disabledDate(current) {
        return current && current < moment().subtract(1, 'day');
      }    
    export default function EditVideo(props) {
        // Example 1
    const classes1 = useStyles1();
    const [page, setPage] = React.useState(0);
    const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);   
    const [ dataState, setData] = useState({loadingPage:true});
    const [ loading, setLoading] = useState(false);
    const [ listCategory, setCategoryList] = useState([]);
    const [ listTag, setTagList] = useState([]);
    const [ activeKey, setActiveKey] = useState('1');
    const [ listActor, setActorList] = useState([]);
    const [ dataSearch, setDataSearch] = useState([]);    
    const inputTitleRef = React.createRef();
    const inputTimeRef = React.createRef();
    const inputDescriptionRef = React.createRef();    
    const [progress, setProgress] = useState(0);

    const onChangeValue = (key, value) => {
        const newVideo = {...dataState.video,  [key]: value }
        setData({
            ...dataState,
            video:newVideo
        })
    }

    const setLoadingPage = (value) => {
        setData({
            ...dataState,
            loadingPage:value
        })
    }
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
    const getAllActor = () => {
        makeRequest('get', `api/admin/allActor?token=${token}`,dataSearch)
        .then(({ data }) => {
            if (data.signal) {          
                setActorList(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
    }
    const getCategories = () => {
        makeRequest('get', `api/admin/allVideoCategory?token=${token}`)
            .then(({ data }) => {
                if (data.signal) {
                    const list = data.data;
                    setCategoryList(list)
                    onChangeValue('category_id', list[0] ? list[0].id : '');
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
    const onChangeDatetime = (value, dateString) => {
        const newVideo = {...dataState.video,  start_time: dateString }
        setData({
            ...dataState,
            video:newVideo
        })
    }
    useEffect(() => {
        let { id } = props.match.params
        getCategories()
        getAllTag()
        getAllActor()
        if(id){
            makeRequest('get', `api/admin/getVideo?token=${token}`,{id})
            .then(({ data }) => {
                if (data.signal) {
                    let video  = data.data                        
                    let tags = [];
                    let actors = []
                    if(video.tags){
                        let tagNoDel = video.tags.filter(tag => {
                            return tag.del === 0
                        })
                        video.tags = tagNoDel
                        tags = tagNoDel.map(({ id }) => id)
                    }                        
                    if(video.actors){
                        let actorNoDel = video.actors.filter(actor => {
                            return actor.del === 0
                        })
                        video.actors = actorNoDel
                        actors = actorNoDel.map(({ id }) => id)
                    }
                    let fileList  = video.list_thumbnail.map(item => {
                        return {
                            uid: item.id,
                            url: item.thumbnail
                        };
                        });                  
                    let isUtubeLink = true
                    let urlEmbed = ''
                    if(video.type == 'vod') isUtubeLink = false;
                    if(isUtubeLink){
                        urlEmbed = `https://www.youtube.com/embed/${video.url}?autoplay=1`
                    }
                    setData({
                        ...dataState,
                        video,
                        isUtubeLink,
                        urlVideo:video.url,
                        tags,
                        actors,
                        urlEmbed,
                        fileList,
                        list_thumbnail:[],
                        changeVideo:0,
                        loadingPage:false
                    })            
                }
            })
            .catch(err => {
                console.log(err)
            })
        }
    }, [])

    const handleChangeTag = (value) => {
        setData({
            ...dataState,
            tags: value
        })
    }
    
    const handleUploadSuccess = (data,file) => {
        let imageUrl = data.file
        const newVideo = {...dataState.video, 
            url: URL.createObjectURL(file),
        }
        setData({
            ...dataState,
            changeVideo:1,
            video:newVideo,
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
              axios.post(`${URL_API}api/admin/uploadVideo`, dataUpload,config)
                .then(({data}) => {
                    setLoading(false);
                    if (data.signal) {
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
        setLoadingPage(true)
        if (!dataState.video.url) {
            return showErrorMessage('Please upload a video');
        }

        if (!(dataState.video.title).trim()) {
            inputTitleRef.current.focus()
            return showErrorMessage('Please enter name of video');
        }else{
            if (validateMaxLength(dataState.video.title, 225)) {
                inputTitleRef.current.focus()
                return showErrorMessage('The name may not be greater than 225 characters')
            }
          }

        if (dataState.video.status === '') {
            return showErrorMessage('Please enter status of video');
        }

        if (!(dataState.video.description).trim()) {
            return showErrorMessage('Please enter description of video');
        }
        if (!dataState.video.thumbnail) {
            return showErrorMessage('Please upload a thumbnail of video');
        }

        makeRequest('post', `api/admin/updateVideo?token=${token}`, dataState)
            .then(({ data }) => {
                setLoadingPage(false)

                if (data.signal) {
                    showSuccessMessageIcon('Update success')
                    props.history.push('/videos/list')
                } else {
                    return showErrorMessage(data.message); 
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
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
        const newVideo = {...dataState.video,  url:  getIdUtube(value) }
        setData({
            ...dataState,
            video:newVideo,
            changeVideo:1,
            urlEmbed:newValue
        })
    }

    const changeUtubeLink = (value) =>{
        let newVideo = {...dataState.video,  url: '' }
        if(!value){
            newVideo = {...dataState.video,  url: dataState.urlVideo }
        }
        setData({
            ...dataState,
            isUtubeLink: value,
            video:newVideo,
            urlEmbed:''
        })
        
    }
                
    const clickTab = (key) => {
        setActiveKey(key);
    }
    const handleChooseActor = (actors) => {        
        setData({
            ...dataState,
            actors
        })  
    }
    const handleChangeListThumbnail = info => {
        console.log('+', { info })
        if (info.file.status === 'uploading') {
            setLoading(true);
            setData({
                    ...dataState,
                    fileList:info.fileList
                })
            return;
        }
        if (info.file.status === 'done') {
            if (info.file.response.signal) {
                let { list_thumbnail } = dataState
                let newItem = {
                    uid: Date.now(),
                    url:info.file.response.data.url
                }
                list_thumbnail.push(newItem)
                setData({
                    ...dataState,
                    list_thumbnail
                })
                setLoading(false);
            }
        }
    }; 

    const removeFileItem = info => {        
        let url = info.url;    
        let { fileList } = dataState        
        fileList.map((item, index) => {
            if (item.url === url) {
                fileList.splice(index, 1)
            }
            return true
        })
        setData({
            ...dataState,
            list_thumbnail:fileList,
            fileList
        })        
    }
    if(dataState.loadingPage){
        return <div style={{ display: 'flex', justifyContent: 'center' }}><Loading /></div>
    }
    return (
        <>
        {/* <Tabs onChange={clickTab} activeKey={activeKey} >
            <TabPane tab='Update information' key="1"> */}
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        {/* <span className="kt-section__sub">
                            Add New User
                        </span> */}
                        <Card >
                            <Card.Body>
                                <div style={{display:'flex'}}>
                                    <Card.Title>Type Upload</Card.Title>    
                                    {/* { !dataState.isUtubeLink ? (
                                        <button type="button" className="btn btn-primary btn-sm btn-elevate kt-login__btn-secondary" onClick={(e) => changeUtubeLink(true)} style={{marginBottom:15,marginLeft:15}}>Add youtube link</button> 
                                    ) : (
                                        <button type="button" className="btn btn-primary btn-sm btn-elevate kt-login__btn-secondary" onClick={ (e) => changeUtubeLink(false)} style={{marginBottom:15,marginLeft:15}}>Upload video</button> 
                                    )}                      */}
                                </div>
                                <Radio.Group onChange={(e) => changeUtubeLink(e.target.value)} value={dataState.isUtubeLink} style={{marginBottom:15}}>
                                    <Radio value={false} defaultChecked>Upload video with file</Radio>
                                    <Radio value={true}>Upload video by youtube link</Radio>
                                </Radio.Group>
                                { dataState.isUtubeLink ? (
                                    <Form.Group as={Col} controlId="formGridUtube">
                                        <Form.Label>Youtube Link</Form.Label>
                                        <Form.Control type="text" value={dataState.urlEmbed || ''} onChange={(e) => onChangeLinkUtube('urlEmbed', e.target.value)} />
                                    </Form.Group>
                                ) : (
                                    <div>
                                        <DragUpload {...getUploadDraggerProps(handleUploadSuccess)}>
                                        <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                        </p>
                                        { Object.keys(dataState).length ? ( <>{loading ? <LoadingOutlined /> : <PlusOutlined />}<p className="ant-upload-text">Click or drag file to this area to upload</p></> ): (<div>
                                        {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <p className="ant-upload-text">Click ds drag file to this area to upload</p>
                                        </div>)}
                                        {progress > 0 ? <Progress size="small" strokeColor={{'0%': '#108ee9','100%': '#87d068', }} percent={progress} /> : null}
                                        </DragUpload>
                                    </div>
                                )}

                                { Object.keys(dataState).length ? ( dataState.video.url && !dataState.isUtubeLink  ? (
                                    <Row>
                                        <Col md={{ span: 6, offset: 3 }}>
                                            <video src={dataState.video.url} controls width="100%" style={{marginTop: '10px'}}/>
                                        </Col>
                                    </Row>) : (
                                        dataState.isUtubeLink &&  dataState.urlEmbed ? (
                                            <Row>
                                                <Col md={{ span: 6, offset: 3 }}>
                                                <iframe autoPlay style={{marginTop: '10px',width:500,height:300}} src={dataState.urlEmbed}></iframe>
                                                </Col>
                                            </Row>
                                        ) : ''
                                    )
                                ): ''}

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
                                        <Form.Group as={Col} controlId="formGridEmail">
                                            <Form.Label className="starDanger">Name</Form.Label>
                                            <Form.Control type="text" maxLength={255} autoFocus ref={inputTitleRef} value={Object.keys(dataState).length ? dataState.video.title : ''} onChange={(e) => onChangeValue('title', e.target.value)} />
                                        </Form.Group>
                                        <Form.Group  as={Col} controlId="exampleForm.ControlSelect1">
                                            <Form.Label className="starDanger">Category</Form.Label>
                                            <Form.Control as="select" value={Object.keys(dataState).length ? dataState.video.category_id : ''} placeholder="Select Category" onChange={(e) => onChangeValue('category_id', e.target.value)} >
                                                {/* <option value="">Select Category</option> */}
                                                {listCategory.map((it, idx) => {
                                                    return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                                                })}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} controlId="formGridDesc">
                                            <Form.Label className="starDanger">Description</Form.Label>
                                            {/* <Form.Control as="textarea" ref={inputDescriptionRef} rows={6}  value={Object.keys(dataState).length ? dataState.video.description : ''} onChange={(e) => onChangeValue('description', e.target.value)} /> */}
                                            <TinyMCEditor
                                                name="description"
                                                handleChange={onChangeValue}
                                                content={Object.keys(dataState).length ? dataState.video.description : ''}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Col xs={4} md={3}>
                                            <Form.Group controlId="formBasicStatus">
                                                <Form.Label className="starDanger">Status</Form.Label>
                                                <Form.Control as="select" value={Object.keys(dataState).length ? dataState.video.status : '0'} onChange={(e) => onChangeValue('status', e.target.value)}>
                                                    <option value='' disabled>Choose status</option>
                                                    <option value='1'>Active</option>
                                                    <option value='2'>Privite</option>
                                                    <option value='0'>Inactive</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={4} md={3}>
                                            <Form.Group controlId="formGridDesc">
                                                <Form.Label className="starDanger">Start time</Form.Label>
                                                <br></br>
                                                <DatePicker showTime  onChange={onChangeDatetime} className="form-control" name="start_time" style={{width:'70%'}} placeholder="Start date" disabledDate={disabledDate} value={Object.keys(dataState).length  && dataState.video.start_time ? moment(dataState.video.start_time): ''} />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={4} md={6}>
                                            <Form.Group controlId="exampleForm.tag">
                                                <Form.Label>Tags</Form.Label>
                                                <Select as="select" style={{ width: '100%', height: 'calc(1.5em + 1.3rem + 2px)' }} value={dataState.tags || ''} onChange={handleChangeTag} tokenSeparators={[',']}>
                                                    {listTag.map((it, idx) => {
                                                        return <Option value={it.id} key={`tag-${it.id}`}>{it.name}</Option>
                                                    })}
                                                </Select>
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>

                                    <Form.Row>
                                        <Form.Group controlId="exampleForm.thumbnail" style={{marginLeft:6}}>
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
                                                { Object.keys(dataState).length ? (dataState.video.thumbnail ? <img src={dataState.video.thumbnail} alt="avatar" style={{ width: '100%' }} /> : uploadButton): uploadButton}
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
                                                fileList={Object.keys(dataState).length && dataState.fileList}
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
                                        <Link to="/videos/list" style={{marginRight: '5px'}}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                        </Link>
                                        <button type="button" className="btn btn-primary btn-elevate kt-login__btn-primary" onClick={(e) => handleSubmit(e)}>Update</button>
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
                    listData={Object.keys(dataState).length && dataState.video.actors}
                />
            </TabPane> 
        </Tabs> */}
        </>
    );
}