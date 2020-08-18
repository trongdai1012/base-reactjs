/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes, { func } from "prop-types";
import Notice from "../../../partials/content/Notice";
import makeRequest from '../../../libs/request';
import { formatTime } from '../../../libs/time';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import checkPermission from '../../../libs/permission'
import Loading from '../../loading'
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
import DeleteIcon from "@material-ui/icons/Delete";
import Icon from "@material-ui/core/Icon";
import FilterListIcon from "@material-ui/icons/FilterList";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import {Form,Button,Col } from "react-bootstrap";
import { DatePicker,Modal } from "antd";
import { slugify,validateMaxLength } from "../../../libs/utils"


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

export default function ListPermisson() {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const permissions = { 
    getAll:'get-all-permission',
    create:'create-permission',
    getOne:'get-permission',
    delete:'delete-permission',
  }
  const classes1 = useStyles1();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);  
  const [ rows, setRow] = useState([]);
  const [ dataSearch, setData] = useState([]);
  const [ dataAdd, setDataAdd] = useState({loadingPage:false});
  const [ dataDelete, setDataDelete] = useState([]);

  const onChangeValue = (key, value) => {
    
    setData({
        ...dataSearch,
        [key]: value
    })
  }

  const onChangeDataAdd = (key, value) => {
    setDataAdd({
        ...dataAdd,
        [key]: value
    })
}
  
  useEffect(() => {
    setDataDelete({
      ...dataDelete,
      visible: false,
      visible_group:false
    })
    makeRequest('get', `api/admin/allPermissions?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {
                setRow(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
  }, []);

  const renderUserAcc = (user) => {
      if (user.email || user.mobile) return user.email || user.mobile;
      if (user.sns[0]) {
          return `${user.sns[0].sns_type}_${user.sns[0].connect_id}`
      }

      return '';
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();    
    makeRequest('get', `api/admin/allPermissions?token=${token}`,dataSearch)
    .then(({ data }) => {
        if (data.signal) { 
          setPage(0);           
          setRow(data.data)
        }
    })
    .catch(err => {
        console.log(err)
    })
  }

  const unfilteredData = (e) =>{
    setData({
      ...dataSearch,
      keyword: '',
      status: 'all'
    })
    makeRequest('get', `api/admin/allPermissions?token=${token}`)
    .then(({ data }) => {
        if (data.signal) {          
            setRow(data.data)
        }
    })
    .catch(err => {
        console.log(err)
    })
  }

  const clickModalCancel = () => {
    setDataDelete({
      ...dataDelete,
      visible: false,
      idDel: 0
    })
  }

  const clickModalCancelGroup = () => {
    setDataDelete({
      ...dataDelete,
      visible_group: false
    })
  }
  
  const showModal = (idDel) => {    
    setDataDelete({
      ...dataDelete,
      visible: true,
      idDel
    })
  }
  
  const showModalCreateGroup = () => {    
    setDataDelete({
      ...dataDelete,
      visible_group: true
    })
    onChangeDataAdd('type','')
  }

  const clickModalOk = () => {
    let  idDel  = dataDelete.idDel
    makeRequest('post', `api/admin/deletePermission?token=${token}`,{idDel})
      .then(({ data }) => {
        if (data.signal) {          
          showSuccessMessageIcon('Delete success')
          setDataDelete({
            ...dataDelete,
            visible: false,
            idDel: 0
          })
          unfilteredData()
        }else {
          return showErrorMessage('error',  data.message)
        }
      })

      .catch(err => {
        console.log('error', err);
      });
  }

  const clickModalOkGroup = () => {
    if (!dataAdd.type) {
      return showErrorMessage('Please enter group name');
    }else{
      if (validateMaxLength(dataAdd.type, 225)) {
        return showErrorMessage('The group name may not be greater than 225 characters')
      }
    }
    onChangeDataAdd('loadingPage',true)
    let typeSlug = slugify(dataAdd.type)
    let type = dataAdd.type
    makeRequest('post', `api/admin/createGroupPermission?token=${token}`,{type,typeSlug})
      .then(({ data }) => {
        onChangeDataAdd('loadingPage',false)
        if (data.signal) {          
          showSuccessMessageIcon('Create success')
          setDataDelete({
            ...dataDelete,
            visible_group: false,
          })
          onChangeDataAdd('type','')
          unfilteredData()
        }else {
          return showErrorMessage('error',  data.message)
        }
      })

      .catch(err => {
        console.log('error', err);
      });
  }
  if(dataAdd.loadingPage){
    return <Loading />
  }
  return (
    <>
      <Notice >
        <p>All permission in Netelly</p>
      </Notice>

      {checkPermission(permissions.create) && <button onClick={(e) => showModalCreateGroup()}  className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10">New Group</button>}
      {checkPermission(permissions.create) && <Link to="/feature/permission/add" className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10">Add New</Link>}
      
      <div className="row">
        <div className="col-md-12">
            <div className="kt-section">
              {/* <span className="kt-section__sub">
                A simple example with no frills.
              </span> */}
              {/* <div className="kt-separator kt-separator--dashed"></div> */}
              <div className="kt-section__content">
                <Paper className={classes1.root}>
                <div className='col-md-12'>
                {/* <Form onSubmit={handleSubmit}>
                  <div style={{marginTop:20,fontSize:20}}><label>Search</label></div>
                    <div className='form-row'>
                      <div className='form-group col-md-6'>
                        <div className="form-group" style={{display:'flex'}}>
                          <input type="text" onChange={(e) => onChangeValue('keyword', e.target.value)} className="form-control inline-block" placeholder="Keyword" name="keyword" value={dataSearch.keyword || ''} style={{width:'70%'}}/>
                        </div>
                      </div>
                      <div className='form-group col-md-6'>
                        <div className="form-group" style={{display:'flex'}} >
                            <select className="form-control inline-block" onChange={(e) => onChangeValue('status', e.target.value)} value={dataSearch.status || 'all'} style={{width:'70%'}}>
                              <option value="all">All</option>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                            </select>
                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{marginLeft:10,marginTop:3}} type="button"><span>Unfiltered</span></button>
                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{marginLeft:10,marginTop:3}} type="submit"><span>Search</span></button>
                        </div>
                      </div>
                    </div>
                  </Form> */}
                </div>
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Key</TableCell>
                        <TableCell>Group</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => (
                        <TableRow key={`permis-${row.id}`}>
                          <TableCell component="th" scope="row">
                            {key+1}
                          </TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.key}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>
                            {checkPermission(permissions.getOne) && <Link to={`/feature/permission/edit/${row.id}`}><Icon className="fa fa-pen" style={{ color: '#ffa800',fontSize: 15 }} /></Link>}
                            {checkPermission(permissions.delete) && <span style={{cursor:'pointer'}}><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)',fontSize: 15,marginLeft:15 }} /></span>}
                          </TableCell>
                        </TableRow>
                      )): (
                        <TableRow>
                          <TableCell colSpan={5} align="center">Không có dữ liệu để hiển thị</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}    
                  />
                </Paper>
              </div>
              <Modal
                  title='Delete permission'
                  visible={dataDelete.visible}
                  onOk={clickModalOk}
                  onCancel={clickModalCancel}
                  cancelText='Cancel'
                  okText='Ok'
                >
                <p>Do you want to delete this?</p>
              </Modal>
              <Modal
                  title='New Group Permisson'
                  visible={dataDelete.visible_group}
                  onOk={clickModalOkGroup}
                  onCancel={clickModalCancelGroup}
                  cancelText='Cancel'
                  okText='Submit'
                >
                <Form.Row>
                    <Form.Group as={Col} controlId="formGroupName">
                        <Form.Label className="starDanger">Group name</Form.Label>
                        <Form.Control type="text" autoFocus placeholder="Group name" value={dataAdd.type || ''} onChange={(e) => onChangeDataAdd('type', e.target.value)}/>
                    </Form.Group>
                </Form.Row>
              </Modal>
            </div>
        </div>
      </div>
    </>
  );
}