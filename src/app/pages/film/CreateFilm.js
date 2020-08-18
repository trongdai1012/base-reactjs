/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Upload, message,Modal,Select,DatePicker } from 'antd';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { validateMaxLength,validateMinLength } from "../../libs/utils"
import { Tabs,Checkbox } from "antd";
import ListChooseVideo from './ListChooseVideo'
import TinyMCEditor from '../common/TinyMCEditor'
import ListChooseActor from '../videos/actors/ListChooseActor'
import { Prompt } from 'react-router'
import Loading from "../loading"
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
const { Option } = Select;
const { TabPane } = Tabs;
const DragUpload = Upload.Dragger;


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

export default function CreateFilm(props) {
    // Example 1
    const classes1 = useStyles1();
    const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
    const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);    
    const [ dataAdd, setData] = useState({episodes:[],related:[],thumbnails:[],user_id:userLogin.id,unsaved:false,loadingPage:true});
    const [ loading, setLoading] = useState(false);
    const [ activeKey, setActiveKey] = useState('1');
    const [ listCategory, setCategoryList] = useState([]);
    const [ listTag, setTagList] = useState([]);
    const inputTitleRef = React.createRef();
    const inputTimeRef = React.createRef();
	const inputDirectorRef = React.createRef();
	const inputProducerRef = React.createRef();
	const inputTotalEpisodeRef = React.createRef();
		
    const onChangeValue = (key, value) => {
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const onChangeDatetime = (value, dateString) => {    
        setData({
            ...dataAdd,
            release_date: dateString
        })
      }

    
    useEffect(() => {
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.name) {
            inputTitleRef.current.focus()
            return showErrorMessage('Please enter name of film');
        }else{
            if(!(dataAdd.name).trim().length){
                inputTitleRef.current.focus();
                return showErrorMessage('Please enter name of film');
            }
        }

        if (!dataAdd.category_id) {
            return showErrorMessage('Please enter category of film');
        }
        
        if (!dataAdd.director) {
            inputDirectorRef.current.focus();
            return showErrorMessage('Please enter director of film');
        }else{
            if(!(dataAdd.director).trim().length){
                inputDirectorRef.current.focus();
                return showErrorMessage('Please enter director of film');
            }
        }

        if (!dataAdd.producer) {
            inputProducerRef.current.focus();
            return showErrorMessage('Please enter producer of film');
        }else{
            if(!(dataAdd.producer).trim().length){
                inputProducerRef.current.focus();
                return showErrorMessage('Please enter producer of film');
            }
        }
        if (!dataAdd.status || dataAdd.status === '') {
            return showErrorMessage('Please enter status of film');
        }
        if (!dataAdd.total_episode) {
            inputTotalEpisodeRef.current.focus();
            return showErrorMessage('Please enter total episodes of film');
        }else{
            if(!(dataAdd.total_episode).trim().length){
                inputTotalEpisodeRef.current.focus();
                return showErrorMessage('Please enter total episodes of film');
            }
        }

        if (!dataAdd.release_date) {
            return showErrorMessage('Please choose release date of video');
        }

        if (!dataAdd.description) {
            return showErrorMessage('Please enter description of film');
        }else{
            if(!(dataAdd.description).trim().length){
                return showErrorMessage('Please enter description of film');
            }
        }

        if (!dataAdd.poster) {
            return showErrorMessage('Please upload a poster main of video');
        }
        if (!dataAdd.poster_view) {
            return showErrorMessage('Please upload a poster view of video');
        }
        
        onChangeValue('loadingPage',true)
        makeRequest('post', `api/admin/addFilm?token=${token}`, dataAdd)
            .then(({ data }) => {
                onChangeValue('loadingPage',false)
                if (data.signal) {
                    showSuccessMessageIcon('Create success')
                    onChangeValue('unsaved',true)
                    props.history.push('/films/list')
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
                onChangeValue('poster', info.file.response.data.url);
                setLoading(false);
            }
        }
    }; 

    const handleChangePosterView = info => {
        console.log('+++++++++++++++++++', { info })
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            if (info.file.response.signal) {
                onChangeValue('poster_view', info.file.response.data.url);
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
                let { thumbnails } = dataAdd
                let item = {
                    uid:Date.now(),
                    url:info.file.response.data.url
                }
                thumbnails.push(item)
                onChangeValue('thumbnails', thumbnails);
                setLoading(false);
            }
        }
    }; 

    const removeFileItem = info => {        
        let url = info.response.data.url;
        let { thumbnails } = dataAdd
        thumbnails.map((item, index) => {
            if (item.thumbnail === url) {
                thumbnails.splice(index, 1)
            }
            return true
        })
        setData({
            ...dataAdd,
            thumbnails
        })        
    }

    const uploadButton = (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div className="ant-upload-text">Upload</div>
        </div>
    );

    const clickTab = (key) => {
        setActiveKey(key);
    }
    const handleChooseActor = (arrayActorChossen) => {        
        setData({
					...dataAdd,
					arrayActorChossen
        })  
    }
    const handleChooseVideo = (episodes) => {        
        setData({
					...dataAdd,
					episodes
        })  
    }
    
    const handleChooseRelatedVideo = (related) => {        
        setData({
                ...dataAdd,
                related
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
                                    <Card.Title>Film Info</Card.Title>
                                    <Form>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridEmail">
                                                <Form.Label className="starDanger">Name</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputTitleRef} autoFocus value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                                <Form.Label className="starDanger">Category</Form.Label>
                                                <Form.Control as="select" value={dataAdd.category_id || ''} placeholder="Select Category" onChange={(e) => onChangeValue('category_id', e.target.value)} >
                                                    <option value="">Select Category</option>
                                                    {listCategory.map((it, idx) => {
                                                        return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                                                    })}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridDirector">
                                                <Form.Label className="starDanger">Director</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputDirectorRef}  value={dataAdd.director || ''} onChange={(e) => onChangeValue('director', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formGridProducer">
                                                <Form.Label className="starDanger">Producer</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputProducerRef}  value={dataAdd.producer || ''} onChange={(e) => onChangeValue('producer', e.target.value)} />
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
                                            <Form.Group as={Col} controlId="formGridEp">
                                                <Form.Label className="starDanger">Number of Episodes</Form.Label>
                                                <Form.Control type="number" ref={inputTotalEpisodeRef}  value={dataAdd.total_episode || ''} onChange={(e) => onChangeValue('total_episode', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridRelease">
                                                <Form.Label className="starDanger">Release Date</Form.Label> <br></br>
                                                <DatePicker onChange={onChangeDatetime} className="form-control" name="createDateStart"  value={dataAdd.release_date ? moment(dataAdd.release_date): ''} />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridDesc">
                                                <Form.Label className="starDanger">Description</Form.Label>
                                                <TinyMCEditor
                                                    name="description"
                                                    handleChange={onChangeValue}
                                                />
                                                {/* <Form.Control as="textarea" maxLength={500} ref={inputDescriptionRef} rows={5} value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)} /> */}
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group  controlId="exampleForm.thumbnail"  style={{marginLeft:6}}>
                                                <Form.Label className="starDanger">Poster main</Form.Label>
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
                                            <Form.Group  controlId="exampleForm.thumbnail" style={{marginLeft:6}}>
                                                <Form.Label className="starDanger">Poster view</Form.Label>
                                                <p style={{fontSize:'9pt'}}>Standard size: 16: 9 Full HD</p>
                                                <Upload
                                                    accept="image/*"
                                                    name="file"
                                                    listType="picture-card"
                                                    className="avatar-uploader"
                                                    showUploadList={false}
                                                    action={`${URL_API}api/admin/uploadThumnail`}
                                                    beforeUpload={beforeUpload}
                                                    onChange={handleChangePosterView}
                                                >
                                                    {dataAdd.poster_view ? <img src={dataAdd.poster_view} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                                </Upload>
                                            </Form.Group>
                                            <Form.Group controlId="exampleForm.thumbnail" style={{ width: '70%',marginLeft:6 }}>
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
                                            <Link to="/films/list" style={{marginRight: '5px'}}>
                                            <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                            </Link>
                                            <button type="button" className="btn btn-primary btn-elevate kt-login__btn-primary" onClick={(e) => handleSubmit(e)}>Add</button>
                                        </div>

                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
                </TabPane>
                <TabPane tab='Episodes' key="2">
                    <ListChooseVideo
                        handleChooseVideo={handleChooseVideo}
                        listData={[]}
                        videoFilm={true}
												textTile="List episode choosen"
												categories={listCategory}
												type='episode'
                />
                </TabPane>
                <TabPane tab='Relateted Video' key="3">
                     <ListChooseVideo
                        handleChooseVideo={handleChooseRelatedVideo}
                        listData={[]}
                        videoFilm={true}
												textTile="List related video choosen"
												categories={listCategory}
												type='related'
                    />
                </TabPane>
                <TabPane tab='Actors' key="4">
                    <ListChooseActor
                        handleChooseActor={handleChooseActor}
                        listData={[]}
                    />
                </TabPane>
            </Tabs>
        </>
    );
}