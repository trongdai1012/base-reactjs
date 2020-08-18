/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { Upload, message,Modal } from 'antd';
import { InboxOutlined, LoadingOutlined, PlusOutlined,CloseOutlined,CheckOutlined   } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card,Col } from "react-bootstrap";
import CreateVideo from '../videos/CreateVideo'
import { formatTime } from '../../libs/time';
import { Switch } from 'antd';
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
  FormControlLabel,
  TableFooter
} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import "antd/dist/antd.css";

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

export default function ListChooseVideo(props) {
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);    
  const [ listVideo, setVideoList] = useState([]);
  const [ dataList, setListChoose] = useState({listVideoChoose:[],idList:[],idListInclude:[]});
  const [ dataSearch, setDataSearch] = useState({user:userLogin});
  const [ dataItemAdd, setDataItem] = useState({});
  const [ loading, setLoading] = useState(false);
  const [ isAddNew, setIsAddNew] = useState(false);

  const onChangeValueSearch = (key, value) => {
    setDataSearch({
        ...dataSearch,
        [key]: value
    })
  }

  const onChangeAddNew = () => {
    setIsAddNew(true)
  }
  
  useEffect(() => {    
    setDataItem({
      ...dataItemAdd,
      visible: false,
    })
    if(props.filmEdit){
      setDataSearch({
        ...dataSearch,
        film_id: props.film_id,
        type_ep:props.type
      })
    }
  }, [])

  useEffect(() => {
    if(props.listData.length){
      let idList = props.listData.map(({ id }) => id)
      let listVideoChoose = props.listData
      setListChoose({
        ...dataList,
        listVideoChoose,
        idList,
        idListInclude:idList
      })
    }

  },[ props.listData.length ])

  const handleSubmitSearch = (e) => {
    e.preventDefault();        
    makeRequest('get', `api/admin/allVideos?token=${token}`,dataSearch)
    .then(({ data }) => {
        if (data.signal) {     
          let listVideoChoose = data.data     
          setListChoose({
            ...dataList,
            listVideoChoose
          })
        }
    })
    .catch(err => {
        console.log(err)
    })
  }

  const unfilteredData = (e) =>{
    setDataSearch({
        ...dataSearch,
        keyword: '',
        status:'all',
        category_id:'all',
        type:'all'
    })
    makeRequest('get', `api/admin/allVideos?token=${token}`,{
      keyword: '',
      status:'all',
      category_id:'all',
      type:'all',
      film_id:props.film_id,
      type_ep:props.type,
      user:userLogin
    })
    .then(({ data }) => {
      if (data.signal) {          
        let listVideoChoose = data.data     
          setListChoose({
            ...dataList,
            listVideoChoose
          })
      }
    })
    .catch(err => {
        console.log(err)
    })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  }

  const handleChooseVideo = (row) => {
    let { listVideoChoose } =  dataList
    row = {...row, item_status: row.status }
    if(!listVideoChoose.length){
      listVideoChoose.push(row)
    }else{
      let find = listVideoChoose.filter(el => el.id === row.id);
      if(!find.length){
        listVideoChoose.push(row)
      }
    }
    let newListVideoChoose = listVideoChoose.map(item => ({item_status:item.item_status,id:item.id}))
    setListChoose({
      ...dataList,
      listVideoChoose,
      idList:newListVideoChoose,
      idListInclude:listVideoChoose.map(({ id }) => id)
    })
    props.handleChooseVideo(newListVideoChoose)
  }

  const handleRemoveVideo = (row) => {
    let { listVideoChoose } =  dataList
    listVideoChoose.map((item, index) => {
      if (item.id === row.id) {
        listVideoChoose.splice(index, 1)
      }
      return true
    })
    let newListVideoChoose = listVideoChoose.map(({ id }) => id)
    setListChoose({
      ...dataList,
      listVideoChoose,
      idList:newListVideoChoose,
      idListInclude:listVideoChoose.map(({ id }) => id)
    })
    props.handleChooseVideo(newListVideoChoose)
  }

  const clickModalCancel = () => {
    setIsAddNew(false)
    setDataItem({
      ...dataItemAdd,
      visible: false,
      removeText:false
    })
  }

  const showModal = () => {    
    setDataItem({
      ...dataItemAdd,
      visible: true,
      removeText:true
    })
  }

  const onChangeSwitch = (checked,row) => {
    let { listVideoChoose } = dataList
    let newList = listVideoChoose.map((item) => {
      if(row.id === item.id){
        return {...item,item_status:checked}
      }
      return item
    })
    let newListVideoChoose = newList.map(item => ({item_status:item.item_status,id:item.id}))
    setListChoose({
      ...dataList,
      listVideoChoose:newList,      
      idList:newListVideoChoose
    })
    props.handleChooseVideo(newListVideoChoose)

  }

  const renderSearch = () => {
    return (
      <>
        <div style={{marginTop:20,fontSize:20}}><label>Search</label></div>
          <div className='form-row'>
              <div className='form-group col-md-3'>
                <div className="form-group" style={{display:'flex'}}>
                    <input type="text" onChange={(e) => onChangeValueSearch('keyword', e.target.value)} className="form-control inline-block" placeholder="Keyword" name="keyword" value={dataSearch.keyword || ''}/>
                </div>
              </div>
              <div className='form-group col-md-3'>
                <div className="form-group" style={{display:'flex'}} >
                    <select className="form-control inline-block" onChange={(e) => onChangeValueSearch('status', e.target.value)} value={dataSearch.status || 'all'}>
                        <option value="all">Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>
              </div>
              <div className='form-group col-md-3'>
                <div className="form-group" style={{display:'flex'}} >
                    <select className="form-control inline-block" onChange={(e) => onChangeValueSearch('type', e.target.value)} value={dataSearch.status || 'all'}>
                        <option value="all">Type video</option>
                        <option value="vod">Vod</option>
                        <option value="youtube">Youtube</option>
                    </select>
                </div>
              </div>
              <div className='form-group col-md-3'>
                <div className="form-group" style={{display:'flex'}} >
                    <select className="form-control inline-block" onChange={(e) => onChangeValueSearch('category_id', e.target.value)} value={dataSearch.status || 'all'}>
                        <option value="all">Category</option>
                        {props.categories.map((it, idx) => {
                            return <option value={it.id} key={`cat-${it.id}`}>{it.name}</option>
                        })}
                    </select>
                </div>
              </div>
          </div>
          <div style={{textAlign:'right', marginTop:-20}}>
            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{marginLeft:10,marginTop:3}} type="button"><span>Unfiltered</span></button>
            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{marginLeft:10,marginTop:3}} type="submit"><span>Search</span></button>
            <button className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10"  onClick={onChangeAddNew} style={{marginLeft:10,marginTop:3}} type="button"><span>Add new</span></button>
          </div>
      </>
    )
  }

  const renderTableList = () =>{
    return (
      <>
        <div className='col-md-12'>
          <Form onSubmit={handleSubmitSearch}>
          {props.filmEdit ? renderSearch() : 
            <div style={{textAlign:'right',marginTop:20}}>
              <button className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10"  onClick={onChangeAddNew} style={{marginLeft:10,marginTop:3}} type="button"><span>Add new</span></button>
            </div>
          }
          </Form>
        </div>
        <Table className={classes1.table}>
            <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Image default</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type Video</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Update</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {Object.keys(dataList).length && dataList.listVideoChoose.length ? dataList.listVideoChoose.map((row,key) => (
                  <TableRow key={row.id}>
                      <TableCell component="th" scope="row">
                        {key + 1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.code}
                      </TableCell>
                      <TableCell>
                        <img src={row.thumbnail} width="100px"/>
                      </TableCell>
                      <TableCell>
                        {row.title}
                      </TableCell>
                      <TableCell>
                        {row.type}
                      </TableCell>
                      {props.videoFilm && <TableCell>
                        <Switch
                          onChange={(checked) => onChangeSwitch(checked,row)}
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          checked={typeof row.item_status === 'undefined' ? row.status : row.item_status}
                        />
                      </TableCell>}
                      <TableCell>
                      {formatTime(row.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Link to={`/videos/edit/${row.id}`} target="_blank" data-toggle="tooltip" data-placement="top" title="Edit video"><Icon className="fa fa-pen" style={{ color: '#ffa800',fontSize: 15,marginRight:5 }} /></Link>
                        <span style={{cursor:'pointer'}}><Icon className="fa fa-minus-circle"  onClick={(e) => handleRemoveVideo(row)}  style={{ color: 'rgb(220, 0, 78)',fontSize: 15 }} /></span>
                      </TableCell>
                  </TableRow>
              )) :(
                <TableRow>
                  <TableCell colSpan={8} align="center">There is no data to display</TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>
        <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={listVideo.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}    
        />
      </>
    )
  }
  return (
    <div className="row">
        <div className="col-md-12">
            <div className="kt-section">
              <div className="kt-section__content">
                  <Paper className={classes1.root}>
                  {isAddNew ? <CreateVideo
                      createAtVideo={true}
                      removeText={dataItemAdd.removeText}
                      setNewVideo={handleChooseVideo}
                      clickModalCancel={clickModalCancel}
                    /> : renderTableList()}
                  </Paper>
              </div>
            </div>
        </div>
    </div>
  )
}