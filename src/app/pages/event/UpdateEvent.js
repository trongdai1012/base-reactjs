/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { Upload, message } from 'antd';
import { InboxOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { slugify,validateMaxLength,validateMinLength } from "../../libs/utils"
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
    Checkbox,
    Toolbar,
    Typography,
    Tooltip,
    IconButton,
    TableSortLabel,
    TablePagination,
    Switch,
    FormControlLabel,
    TableFooter,
    DatePicker
} from "@material-ui/core";
import { Button, Form, Card, Col, Row } from "react-bootstrap";
import { URL_API } from '../../config/url';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import moment from 'moment';
import Loading from '../loading'

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

export default function UpdateEvent(props) {
    // Example 1
    const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
    const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
    const classes1 = useStyles1();
    const inputNameRef = React.createRef();
    const inputDescriptionRef = React.createRef();
    const [page3, setPage3] = React.useState(0);
    const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
    const [dataAdd, setData] = useState({loadingPage:true});
    const [loading, setLoading] = useState(false);
    const [listCategory, setCategoryList] = useState([]);

    const onChangeValue = (key, value) => {
        console.log("+++++++++++++++++", dataAdd)
        setData({
            ...dataAdd,
            [key]: value
        })
    };

    const setLoadingPage = (value) => {
        setData({
            ...dataAdd,
            loadingPage:value
        })
      }

    const getEventInfo = () => {
        let { id } = props.match.params;
        id = parseInt(id);
        if (id) {
            makeRequest("get", `api/admin/getEventDetail?token=${token}`, {
                id,userLogin
            })
                .then(result => {
                    if (result.data.signal) {
                        let { name, category_id, start_time, end_time, description, tags,thumbnail } = result.data.data;
                        start_time = new Date(start_time);
                        end_time = new Date(end_time);
                        setData({
                            id,
                             name,
                            description,
                            start_time: `${start_time.getFullYear()}-${start_time.getMonth() + 1 <10 ? "0"+start_time.getMonth() : start_time.getMonth()}-${start_time.getDate() < 10 ?"0"+ start_time.getDate() : start_time.getDate() }`,
                            end_time:  `${end_time.getFullYear()}-${end_time.getMonth() + 1 <10 ? "0"+ end_time.getMonth() : end_time.getMonth()}-${end_time.getDate() < 10 ?"0"+ end_time.getDate() : end_time.getDate() }`,
                            category_id,
                            tags,thumbnail,
                            loadingPage:false
                        })
                        // getAllVideoCategory();
                    } else {
                        console.log("Error in get event detail", result.data.message)
                    }
                }).catch(err => {
                    console.log("Error in get event detail", err)
                })
        } else {
            props.history.push('/event/list')
        }
    }

    const getAllVideoCategory = () => {
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
    useEffect(() => {
        getEventInfo();
    }, [])
    useEffect(() => {
        getAllVideoCategory();
    }, [])

    const handleUploadSuccess = (data) => {
        let imageUrl = data.url
        onChangeValue('url', imageUrl);
    };

    const getUploadDraggerProps = () => ({
        multiple: false,
        customRequest: (request) => {
            const { file, onSuccess } = request;
            const isJpgOrPng = file.type === 'video/mp4' || file.type === 'video/webm';
            if (!isJpgOrPng) {
                return alert('You can only upload video file!');
            }

            // let fileName = getRenamedFile(file)

            let dataUpload = new FormData();
            dataUpload.append('file', file);

            makeRequest('post', 'api/admin/uploadVideo', dataUpload, { 'Content-Type': 'multipart/form-data' })
                .then(({ data }) => {
                    if (data.signal) {
                        onSuccess(data.data);
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
        //   if (!dataAdd.url) {
        //       return alert('Please upload a event');
        //   }

        if (!(dataAdd.name).trim()) {
            inputNameRef.current.focus();
            return showErrorMessage('Please enter name of event');
        }

        if (!(dataAdd.description).trim()) {
            inputDescriptionRef.current.focus();
            return showErrorMessage('Please enter description of event');
        }

        if (!dataAdd.thumbnail) {
            return showErrorMessage('Please upload a thumbnail of event');
        }
        setLoadingPage(true)

        makeRequest('post', `api/admin/updateEvent?token=${token}`, dataAdd)
            .then(({ data }) => {
                setLoadingPage(false)
                if (data.signal) {
                    showSuccessMessageIcon('Update success')
                    props.history.push('/event/list')
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
    if(dataAdd.loadingPage){
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

                        <Card >
                            <Card.Body>
                                <Card.Title>Event Info</Card.Title>
                                <Form>
                                    <Form.Row>
                                        <Form.Group as={Col}>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="formGridEmail">
                                                    <Form.Label className="starDanger">Name</Form.Label>
                                                    <Form.Control autoFocus maxLength={255} ref={inputNameRef} type="text" value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)} />
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="formGridDesc">
                                                    <Form.Label className="starDanger">Description</Form.Label>
                                                    <Form.Control as="textarea" maxLength={500} ref={inputDescriptionRef} value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)} />
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="formGridEmail">
                                                    <Form.Label>Start_time</Form.Label>
                                                    <Form.Control type="date" value={dataAdd.start_time || ''} onChange={(e) => onChangeValue('start_time', e.target.value)} />
                                                </Form.Group>
                                                <Form.Group as={Col} controlId="formGridEmail">
                                                    <Form.Label>end_time</Form.Label>
                                                    <Form.Control type="date" value={dataAdd.end_time || ''} onChange={(e) => onChangeValue('end_time', e.target.value)} />
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="formGridEmail">
                                                    <Form.Label>tags</Form.Label>
                                                    <Form.Control type="text" value={dataAdd.tags || ''} onChange={(e) => onChangeValue('tags', e.target.value)} />
                                                </Form.Group>
                                            </Form.Row>

                                        </Form.Group>
                                        <Form.Group as={Col}>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="exampleForm.ControlSelect1">
                                                    <Form.Label className="starDanger">Category</Form.Label>
                                                    <Form.Control as="select" value={dataAdd.category_id} placeholder="Select Category" onChange={(e) => onChangeValue('category_id', e.target.value)} >
                                                        <option value="">Select Category</option>
                                                        {listCategory.map((it, idx) => {
                                                            return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                                                        })}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} controlId="exampleForm.thumbnail">
                                                    <Form.Label className="starDanger">Thumbnail</Form.Label>
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
                                            </Form.Row>
                                            <Form.Row style={{ justifyContent: 'flex-end' }}>
                                                <div className="kt-login__actions">
                                                    <Link to="/event/list" style={{ marginRight: '5px' }}>
                                                        <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                                    </Link>
                                                    <button type="button" className="btn btn-primary btn-elevate kt-login__btn-primary" onClick={(e) => handleSubmit(e)}>Update Event</button>
                                                </div>
                                            </Form.Row>
                                        </Form.Group>
                                    </Form.Row>

                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}