/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { Link } from 'react-router-dom';
import { Upload, message,Modal } from 'antd';
import { InboxOutlined, LoadingOutlined, PlusOutlined  } from '@ant-design/icons';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import { Button, Form, Card,Col } from "react-bootstrap";
import CreateEvent from '../event/CreateEvent'
import { formatTime } from '../../libs/time';
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
import Icon from "@material-ui/core/Icon";

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

export default function ListChooseEvent(props) {
  const classes1 = useStyles1();  
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);    
  const [ listEvent, setEventList] = useState([]);
  const [ dataList, setListChoose] = useState({listEventChoose:[],idList:[]});
  const [ dataSearch, setDataSearch] = useState({user:userLogin});
  const [ dataItemAdd, setDataItem] = useState({});
  const [ loading, setLoading] = useState(false);

  const onChangeValueSearch = (key, value) => {
    setDataSearch({
        ...dataSearch,
        [key]: value
    })
  }
  useEffect(() => {    
    setDataItem({
      ...dataItemAdd,
      visible: false,
    })
    makeRequest('get', 'api/admin/allEvent',dataSearch)
        .then(({ data }) => {
            if (data.signal) {          
                setEventList(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
  }, [])

  useEffect(() => {
    
    if(props.listData.length){
      let idList = props.listData.map(({ id }) => id)
      let listEventChoose = props.listData
      setListChoose({
        ...dataList,
        listEventChoose,
        idList
      })
    }
  },[ props.listData.length ])

  const handleSubmitSearch = (e) => {
    e.preventDefault();    
    makeRequest('get', `api/admin/allEvents?token=${token}`,dataSearch)
    .then(({ data }) => {
        if (data.signal) {
          setPage(0);            
          setEventList(data.data)
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
        status:'all'
    })
    makeRequest('get', `api/admin/allEvents?token=${token}`,{
      keyword: '',
      status: 'all',
      user:userLogin
    })
    .then(({ data }) => {
        if (data.signal) {          
            setEventList(data.data)
        }
    })
    .catch(err => {
        console.log(err)
    })
  }
  const renderStatusText = (row) => {
      if (row.status) return  (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{borderRadius:'.42rem'}}>Active</span>);
      return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{borderRadius:'.42rem'}}>Inactive</span>);
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  }

  const handleChooseEvent = (row) => {
    let { listEventChoose } =  dataList
    if(!listEventChoose.length){
      listEventChoose.push(row)
    }else{
      let find = listEventChoose.filter(el => el.id === row.id);
      if(!find.length){
        listEventChoose.push(row)
      }
    }
    
    let newListEventChoose = listEventChoose.map(({ id }) => id)
    setListChoose({
      ...dataList,
      listEventChoose,
      idList:newListEventChoose
    })
    props.handleChooseEvent(newListEventChoose)
  }
  const handleRemoveEvent = (row) => {
    let { listEventChoose } =  dataList
    listEventChoose.map((item, index) => {
      if (item.id === row.id) {
        listEventChoose.splice(index, 1)
      }
      return true
    })
    let newListEventChoose = listEventChoose.map(({ id }) => id)
    setListChoose({
      ...dataList,
      listEventChoose,
      idList:newListEventChoose
    })
    props.handleChooseEvent(newListEventChoose)
  }

  const clickModalCancel = () => {
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

  return (
    <div className="row">
        <div className="col-md-6">
            <div className="kt-section">
              <div className="kt-section__content">
                  <Paper className={classes1.root}>
                  <div className='col-md-12'>
                  <Form onSubmit={handleSubmitSearch}>
                      <div style={{marginTop:20,fontSize:20}}><label>List event</label></div>
                      {/* <div className='form-row'>
                          <div className='form-group col-md-6'>
                          <div className="form-group" style={{display:'flex'}}>
                              <input type="text" onChange={(e) => onChangeValueSearch('keyword', e.target.value)} className="form-control inline-block" placeholder="Keyword" name="keyword" value={dataSearch.keyword || ''} style={{width:'70%'}}/>
                          </div>
                          </div>
                          <div className='form-group col-md-6'>
                          <div className="form-group" style={{display:'flex'}} >
                              <select className="form-control inline-block" onChange={(e) => onChangeValueSearch('status', e.target.value)} value={dataSearch.status || 'all'} style={{width:'70%'}}>
                                  <option value="all">All</option>
                                  <option value="1">Active</option>
                                  <option value="0">Inactive</option>
                              </select>
                              <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{marginLeft:10,marginTop:3}} type="button"><span>Unfiltered</span></button>
                              <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{marginLeft:10,marginTop:3}} type="submit"><span>Search</span></button>
                          </div>
                          </div>
                      </div> */}
                      </Form>
                  </div>
                  <Table className={classes1.table}>
                      <TableHead>
                      <TableRow>
                          <TableCell>No</TableCell>
                          <TableCell>Thumbnail</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Start date</TableCell>
                          <TableCell>End date</TableCell>
                          <TableCell>Action</TableCell>
                      </TableRow>
                      </TableHead>
                      <TableBody>
                      {listEvent.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => (
                          <TableRow key={row.id}>
                              <TableCell component="th" scope="row">
                                {key + 1}
                              </TableCell>
                              <TableCell>
                                  <img src={row.thumbnail} width="100px"/>
                              </TableCell>
                              <TableCell>
                                  {row.name}
                              </TableCell>
                              <TableCell>{row.category.name}</TableCell>
                              <TableCell>{formatTime(row.start_time)}</TableCell>
                              <TableCell>{formatTime(row.end_time)}</TableCell>
                              <TableCell>
                                {
                                  dataList.idList.includes(row.id) ? 
                                    <span style={{cursor:'pointer'}}><Icon className="fa fa-check-circle" style={{ color: '#ffb822',fontSize: 20 }} /></span>
                                  : <span style={{cursor:'pointer'}}><Icon className="fa fa-plus-circle" onClick={(e) => handleChooseEvent(row)} style={{ color: '#5867dd',fontSize: 20 }} /></span>
                                }
                              </TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
                  <TablePagination
                      rowsPerPageOptions={[5, 10, 15]}
                      component="div"
                      count={listEvent.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={handleChangePage}
                      onChangeRowsPerPage={handleChangeRowsPerPage}    
                  />
                  </Paper>
              </div>
            </div>
        </div>
        <div className="col-md-6">
          <div className="kt-section">
            <div className="kt-section__content">
                <Paper className={classes1.root}>
                  <div style={{marginTop:20,fontSize:20,marginLeft:23}}>
                    <label>List event add to channel</label>
                    <button className="btn btn-label-warning btn-bold btn-sm btn-icon-h"  onClick={showModal}  style={{borderRadius:'0.4rem',float:'right',marginRight:10,cursor:'pointer'}}>Create</button>
                  </div>
                  <div className='col-md-12'>
                    <Table className={classes1.table}>
                        <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Thumbnail</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {Object.keys(dataList).length && dataList.listEventChoose.length ? dataList.listEventChoose.map((row,key) => (
                            <TableRow key={row.id}>
                                <TableCell component="th" scope="row">
                                  {key + 1}
                                </TableCell>
                                <TableCell>
                                    <img src={row.thumbnail} width="100px"/>
                                </TableCell>
                                <TableCell>
                                    {row.name}
                                </TableCell>
                                <TableCell>
                                  <span style={{cursor:'pointer'}}><Icon className="fa fa-minus-circle"  onClick={(e) => handleRemoveEvent(row)}  style={{ color: 'rgb(220, 0, 78)',fontSize: 20 }} /></span>
                                </TableCell>
                            </TableRow>
                        )) :(
                          <TableRow>
                            <TableCell colSpan={4} align="center">There is no data to display</TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                    </Table>
                  </div>
                  <Modal
                    title='Add new event'
                    visible={dataItemAdd.visible}
                    onCancel={clickModalCancel}
                    okButtonProps={{ style: { display: 'none' } }}
                    cancelText='Cancel'
                    width={1550}
                  >
                    <CreateEvent
                      createAtEvent={true}
                      removeText={dataItemAdd.removeText}
                      setNewEvent={handleChooseEvent}
                      clickModalCancel={clickModalCancel}
                    />
                </Modal>
                </Paper>
            </div>
          </div>
        </div>
    </div>
  )
}