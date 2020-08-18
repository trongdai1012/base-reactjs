/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes, { func } from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import checkPermission from '../../libs/permission'
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
import {Form,Button } from "react-bootstrap";
import { DatePicker,Modal } from "antd";
const { RangePicker } = DatePicker;


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

export default function ListUser() {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const permissions = { 
    getAll:'get-all-user-app',
    create:'create-user-app',
    getOne:'get-user-app',
    delete:'delete-user-app',
  }
  const classes1 = useStyles1();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);  
  const [ rows, setRow] = useState([]);
  const [ dataSearch, setData] = useState([]);
  const [ dataDelete, setDataDelete] = useState([]);

  const onChangeValue = (key, value) => {
    
    setData({
        ...dataSearch,
        [key]: value
    })
  }

   
  const onChangeDatetime = (value, dateString) => {    
    setData({
        ...dataSearch,
        createDateStart: dateString
    })
  }
  
  const onChangeDatetimeEnd = (value, dateString) => {    
    setData({
        ...dataSearch,
        createDateEnd: dateString
    })
  }
  useEffect(() => {
    setDataDelete({
      ...dataDelete,
      visible: false,
    })
    setData({
      ...dataSearch,
      user_type:0
    })
    makeRequest('get', `api/admin/allUser?token=${token}`,{user_type:0})
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
    makeRequest('get', `api/admin/allUser?token=${token}`,dataSearch)
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
      createDateStart: '',
      createDateEnd: ''
    })
    makeRequest('get', `api/admin/allUser?token=${token}`,{user_type:0})
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
      idUserDel: 0
    })
  }
  
  const showModal = (idUserDel) => {    
    setDataDelete({
      ...dataDelete,
      visible: true,
      idUserDel
    })
  }

  const clickModalOk = () => {
    let  idUserDel  = dataDelete.idUserDel
    makeRequest('post', `api/admin/deleteUser?token=${token}`,{idUserDel})
      .then(({ data }) => {
        if (data.signal) {          
          showSuccessMessageIcon('Delete success')
          setDataDelete({
            ...dataDelete,
            visible: false,
            idUserDel: 0
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
  return (
    <>
      <Notice >
        <p>All user in Netelly</p>
      </Notice>

      {checkPermission(permissions.create) && <Link to="/users-app/add" className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10">Add New</Link>}

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
                <Form onSubmit={handleSubmit}>
                  <div style={{marginTop:20,fontSize:20}}><label>Search</label></div>
                    <div className='form-row'>
                      <div className='form-group col-md-6'>
                        <div className="form-group" style={{display:'flex'}}>
                          <input type="text" autoFocus onChange={(e) => onChangeValue('keyword', e.target.value)} className="form-control inline-block" placeholder="Keyword" name="keyword" value={dataSearch.keyword || ''} style={{width:'70%'}}/>
                        </div>
                      </div>
                      <div className='form-group col-md-6'>
                        <div className="form-group" style={{display:'flex'}} >
                            <DatePicker onChange={onChangeDatetime} name="createDateStart" style={{width:'70%'}} placeholder="Ngày bắt đầu"  value={dataSearch.createDateStart ? moment(dataSearch.createDateStart): ''} />
                            <DatePicker onChange={onChangeDatetimeEnd} name="createDateEnd" style={{width:'70%',marginLeft:5}} placeholder="Ngày kết thúc"  value={dataSearch.createDateEnd ? moment(dataSearch.createDateEnd): ''} />

                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{marginLeft:10,marginTop:3}} type="button"><span>Unfiltered</span></button>
                            <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" style={{marginLeft:10,marginTop:3}} type="submit"><span>Search</span></button>
                        </div>
                      </div>
                    </div>
                  </Form>
                </div>
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>Account</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell style={{width:250}}>Created</TableCell>
                        <TableCell style={{width:250}}>Action</TableCell> 
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => (
                        <TableRow key={`user-${row.id}`}>
                          <TableCell component="th" scope="row">
                            {(key + 1)}
                          </TableCell>
                          <TableCell>{renderUserAcc(row)}</TableCell>
                          <TableCell>{row.display_name}</TableCell>
                          <TableCell>{formatTime(row.createdAt)}</TableCell>
                          <TableCell>
                          {checkPermission(permissions.getOne) && <Link to={`/users-app/edit/${row.id}`} data-toggle="tooltip" data-placement="top" title="Edit user"><Icon className="fa fa-pen" style={{ color: '#ffa800',fontSize: 15 }} /></Link>}
                          {checkPermission(permissions.getOne) &&<Link to={`/users-app/devices/${row.id}`} data-toggle="tooltip" data-placement="top" title="Get user's devices"><Icon className="fa fa-tablet" style={{ fontSize: 15,marginLeft:15  }} /></Link>}
                          {checkPermission(permissions.getOne) &&<Link to={`/users-app/sns/${row.id}`} data-toggle="tooltip" data-placement="top" title="Get user's sns"><Icon className="fa fa-share-alt" style={{ fontSize: 15,marginLeft:15  }} /></Link>}
                          {checkPermission(permissions.getOne) &&<Link to={`/users-app/histories/${row.id}`} data-toggle="tooltip" data-placement="top" title="Histories"><Icon className="fa fa-history" style={{ fontSize: 15,marginLeft:15  }} /></Link>}
                          {checkPermission(permissions.delete) && <span style={{cursor:'pointer'}} data-toggle="tooltip" data-placement="top" title="Delete user"><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)',fontSize: 15,marginLeft:15 }} /></span>}
                          </TableCell>
                        </TableRow>
                      )): (
                        <TableRow>
                          <TableCell colSpan={5} align="center">There is no data to display</TableCell>
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
                  title='Delete user'
                  visible={dataDelete.visible}
                  onOk={clickModalOk}
                  onCancel={clickModalCancel}
                  cancelText='cancel'
                  okText='ok'
                >
                <p>Do you want to delete this?</p>
              </Modal>
            </div>
        </div>
      </div>
    </>
  );
}