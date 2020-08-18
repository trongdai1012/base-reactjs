/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
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
function useQuery() {
	return new URLSearchParams(useLocation().search);
}
export default function EditFilm(props) {
    // Example 1
		const classes1 = useStyles1();
		let query = useQuery();
    const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
    const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)  
    const [ dataAdd, setData] = useState({film:{},thumbnails:[],user_id:userLogin.id,loadingPage:true});
    const [ loading, setLoading] = useState(false);
    const [ activeKey, setActiveKey] = useState('1');
    const [ listCategory, setCategoryList] = useState([]);
    const [ dataVideo, setVideo] = useState({episodes:[],related:[],episodes_id:[],related_id:[]})
    const inputTitleRef = React.createRef();
    const inputTimeRef = React.createRef();
		const inputDirectorRef = React.createRef();
		const inputProducerRef = React.createRef();
		const inputTotalEpisodeRef = React.createRef();
		
    const onChangeValue = (key, value) => {
			const newFilm = {...dataAdd.film,  [key]: value }
			setData({
					...dataAdd,
					film:newFilm
			})
    }
    const onChangeDatetime = (value, dateString) => {    
			setData({
					...dataAdd,
					release_date: dateString
			})
		}
		
    const getCategories = () => {
			makeRequest('get', `api/admin/allVideoCategory?token=${token}`)
					.then(({ data }) => {
						if (data.signal) {
							const list = data.data;
							setCategoryList(list)
						}
					})
					.catch(err => {
						console.log(err)
					})
	}
	const getVideoData = (id) => {
		makeRequest('get', `api/admin/getVideoOfFilm?token=${token}`,{id})
		.then(({ data }) => {						
			const episodes = data.data.episodes.map(item => ({...item.video,item_id: item.id,item_status:item.status}))
			const related = data.data.related.map(item => ({...item.video,item_id: item.id,item_status:item.status}))
			setVideo({
					...dataVideo,
					episodes:episodes,
					related:related,
					episodes_id:episodes.map(item => ({item_status:item.item_status,id:item.id})),
					related_id:related.map(item => ({item_status:item.item_status,id:item.id}))
				})
		})
	}

	const onChangeSwitch = (id) => {
		let { episodes,related } = dataVideo
		let newEp = episodes.map((item) => {
				if(id === item.item_id){
					return {...item,status:!item.item_id}
				}
				return item
		})
		let newRelated = related.map((item) => {
			if(id === item.item_id){
					return {...item,status:!item.item_id}
				}
				return item
		})
		
		setVideo({
			...dataVideo,
			episodes:newEp,
			related:newRelated,
		})
	}
	const handleChooseActor = (actors) => {        
		setData({
				...dataVideo,
				actors
		})  
	}
		useEffect(() => {
			let { id } = props.match.params
			setActiveKey(query.get("activeKey"));
			getCategories()
			getVideoData(id)
			if(id){
				makeRequest('get', `api/admin/getFilm?token=${token}`,{id})
				.then(({ data }) => {
					let film = data.data
					if (data.signal) {
						const newFilm = {...film, thumbnails: JSON.parse(film.thumbnails) }
						let fileList = JSON.parse(film.thumbnails)
						setData({
							...dataAdd,
							film:newFilm,
							loadingPage:false,
							fileList
						})
					}else{
						return showErrorMessage(data.message);
					}
				})
				.catch(err => {
						console.log(err)
				})
			}    
			
		}, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.film.name) {
            inputTitleRef.current.focus()
            return showErrorMessage('Please enter name of film');
        }else{
            if(!(dataAdd.film.name).trim().length){
                inputTitleRef.current.focus();
                return showErrorMessage('Please enter name of film');
            }
        }

        if (!dataAdd.film.category_id) {
            return showErrorMessage('Please enter category of film');
        }
				
				if (!dataAdd.film.director) {
						inputDirectorRef.current.focus();
						return showErrorMessage('Please enter director of film');
				}else{
						if(!(dataAdd.film.director).trim().length){
								inputDirectorRef.current.focus();
								return showErrorMessage('Please enter director of film');
						}
				}

				if (!dataAdd.film.producer) {
						inputProducerRef.current.focus();
						return showErrorMessage('Please enter producer of film');
				}else{
						if(!(dataAdd.film.producer).trim().length){
								inputProducerRef.current.focus();
								return showErrorMessage('Please enter producer of film');
						}
				}
				if (dataAdd.film.status === '') {
					return showErrorMessage('Please enter status of film');
				}
				if (!dataAdd.film.total_episode) {
						inputTotalEpisodeRef.current.focus();
						return showErrorMessage('Please enter total episodes of film');
				}

				if (!dataAdd.film.release_date) {
						return showErrorMessage('Please choose release date of video');
				}

        if (!dataAdd.film.description) {
            return showErrorMessage('Please enter description of film');
        }

        if (!dataAdd.film.poster) {
            return showErrorMessage('Please upload a poster main of film');
				}
				if (!dataAdd.film.poster_view) {
					return showErrorMessage('Please upload a poster view  of film');
				}
       
        onChangeValue('loadingPage',true)
        const data = {
            dataAdd,
            episodes: dataVideo.episodes_id,
            related : dataVideo.related_id
        }				
        makeRequest('post', `api/admin/updateFilm?token=${token}`, data)
            .then(({ data }) => {
                onChangeValue('loadingPage',false)
                if (data.signal) {
                    showSuccessMessageIcon('Create success')
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
			console.log('+', { info })
			if (info.file.status === 'uploading') {
					setLoading(true);
					setData({
						...dataAdd,
						fileList:info.fileList
					})
					return;
			}
			if (info.file.status === 'done') {
					if (info.file.response.signal) {
						let { thumbnails } = dataAdd
						let newItem = {
								uid: Date.now(),
								url:info.file.response.data.url
						}
						thumbnails.push(newItem)
						setData({
								...dataAdd,
								thumbnails
						})
						setLoading(false);
					}
			}
	}; 


    const removeFileItem = info => {    
        let url = ""    
        let { fileList } = dataAdd    
        if(info.url){
            url = info.url
        }else{
        url = info.response.data.url;
        }
        fileList.map((item, index) => {
            if (item.url === url) {
                fileList.splice(index, 1)
            }
            return true
        })
        setData({
            ...dataAdd,
            thumbnails:fileList,
            fileList
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

    const handleChooseVideo = (episodes_id) => {        
			setVideo({
				...dataVideo,
				episodes_id
			})  
		}
		
		const handleChooseRelatedVideo = (related_id) => {        
			setVideo({
				...dataVideo,
				related_id
			})  
		}

    if(dataAdd.loadingPage){
        return <Loading />
    }
    return (
        <>
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
                                                <Form.Control type="text" maxLength={255} ref={inputTitleRef} autoFocus value={dataAdd.film.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                                <Form.Label className="starDanger">Category</Form.Label>
                                                <Form.Control as="select" value={dataAdd.film.category_id || ''} placeholder="Select Category" onChange={(e) => onChangeValue('category_id', e.target.value)} >
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
                                                <Form.Control type="text" maxLength={255} ref={inputDirectorRef}  value={dataAdd.film.director || ''} onChange={(e) => onChangeValue('director', e.target.value)} />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formGridProducer">
                                                <Form.Label className="starDanger">Producer</Form.Label>
                                                <Form.Control type="text" maxLength={255} ref={inputProducerRef}  value={dataAdd.film.producer || ''} onChange={(e) => onChangeValue('producer', e.target.value)} />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
																						<Form.Group as={Col} controlId="formBasicStatus">
                                                <Form.Label className="starDanger">Status</Form.Label>
                                                <Form.Control as="select" value={dataAdd.film.status} onChange={(e) => onChangeValue('status', e.target.value)}>
                                                    <option value='' disabled>Choose status</option>
                                                    <option value={1}>Active</option>
                                                    <option value={0}>Inactive</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formGridEp">
                                                <Form.Label className="starDanger">Number of Episodes</Form.Label>
                                                <Form.Control type="number" ref={inputTotalEpisodeRef}  value={dataAdd.film.total_episode || ''} onChange={(e) => onChangeValue('total_episode', e.target.value)} />
                                            </Form.Group>

                                            <Form.Group as={Col} controlId="formGridRelease">
                                                <Form.Label className="starDanger">Release Date</Form.Label> <br></br>
                                                <DatePicker onChange={onChangeDatetime} className="form-control" name="createDateStart"  value={dataAdd.film.release_date ? moment(dataAdd.film.release_date): ''} />
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group as={Col} controlId="formGridDesc">
                                                <Form.Label className="starDanger">Description</Form.Label>
																								<TinyMCEditor
																										name="description"
																										content={dataAdd.film.description}
                                                    handleChange={onChangeValue}
                                                />
                                                {/* <Form.Control as="textarea" ref={inputDescriptionRef} maxLength={500} rows={5} value={dataAdd.film.description || ''} onChange={(e) => onChangeValue('description', e.target.value)} /> */}
                                            </Form.Group>
                                        </Form.Row>
                                        <Form.Row>
                                            <Form.Group  controlId="exampleForm.thumbnail" style={{marginLeft:6}}>
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
                                                    {dataAdd.film.poster? <img src={dataAdd.film.poster} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
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
                                                    {dataAdd.film.poster_view ? <img src={dataAdd.film.poster_view} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                                </Upload>
                                            </Form.Group>
																						<Form.Group  controlId="exampleForm.thumbnail" style={{ width: '70%',marginLeft:6 }}>
                                                <Form.Label>Thumbnails</Form.Label>
																								<p style={{fontSize:'9pt'}}>Standard size: 16: 9 Full HD</p>
                                                <Upload
																										accept="image/*"
                                                    name="file"
                                                    multiple={true}
                                                    listType="picture-card"
                                                    className="avatar-uploader"
                                                    fileList={Object.keys(dataAdd).length && dataAdd.fileList}
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
                                            <button type="button" className="btn btn-primary btn-elevate kt-login__btn-primary" onClick={(e) => handleSubmit(e)}>Update</button>
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
                        listData={dataVideo.episodes}
                        textTile="List episode choosen"
                        videoFilm={true}
                        filmEdit={true}
                        film_id={dataAdd.film.id}
                        onChangeSwitch={onChangeSwitch}
												categories={listCategory}
												type='episode'
                    />
                </TabPane>
                <TabPane tab='Relateted Video' key="3">
                    <ListChooseVideo
                        handleChooseVideo={handleChooseRelatedVideo}
                        listData={dataVideo.related}
                        textTile="List related video choosen"
                        videoFilm={true}
                        filmEdit={true}
                        film_id={dataAdd.film.id}
                        onChangeSwitch={onChangeSwitch}
												categories={listCategory}
												type='related'
                    />
                </TabPane>
								<TabPane tab='Actors' key="4">
                    <ListChooseActor
                        handleChooseActor={handleChooseActor}
                        listData={Object.keys(dataAdd).length && dataAdd.film.actors}
                    />
                </TabPane>
            </Tabs>
        </>
    );
}