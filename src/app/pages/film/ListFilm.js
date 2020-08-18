/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
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
import { Modal } from "antd";
import {Form } from "react-bootstrap";

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

export default function ListFilm() {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const permissions = { 
    getAll:'get-all-films',
    create:'create-film',
    getOne:'get-film',
    delete:'delete-film',
  }
  const classes1 = useStyles1();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);  
  const [ rows, setRow] = useState([]);
  const [ dataSearch, setData] = useState({keyword:'',status:'all'});
  const [ dataDelete, setDataDelete] = useState({visible: false});

  useEffect(() => {
    makeRequest('get', `api/admin/allFilm?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {
                setRow(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }
  const onChangeValue = (key, value) => {
    
    setData({
        ...dataSearch,
        [key]: value
    })
  }
  const showModal = (idDel) => {    
    setDataDelete({
      ...dataDelete,
      visible: true,
      idDel
    })
  }

  const clickModalCancel = () => {
    setDataDelete({
      ...dataDelete,
      visible: false,
      idDel: 0
    })
  }
  const clickModalOk = () => {
    let  idDel  = dataDelete.idDel
    makeRequest('post', `api/admin/deleteFilm?token=${token}`,{idDel})
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
  const unfilteredData = (e) =>{
    setData({
      ...dataSearch,
      keyword: '',
      status: 'all'
    })
    makeRequest('get', `api/admin/allFilm?token=${token}`,{
      keyword: '',
      status: 'all',
    })
    .then(({ data }) => {
        if (data.signal) {          
            setRow(data.data)
        }
    })
    .catch(err => {
        console.log(err)
    })
  }
  const handleSubmit = (e) => {
    e.preventDefault();        
    makeRequest('get', `api/admin/allFilm?token=${token}`,dataSearch)
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

  const renderStatusText = (category) => {
    if (category.status) return  (<span className="btn btn-label-primary btn-bold btn-sm btn-icon-h" style={{borderRadius:'.42rem'}}>Active</span>);
    return (<span className="btn btn-label-warning btn-bold btn-sm btn-icon-h" style={{borderRadius:'.42rem'}}>Inactive</span>);
  }

  return (
    <>
      <Notice >
        <p>All film</p>
      </Notice>

      {checkPermission(permissions.create) && <Link to="/films/add" className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10">Add New</Link>}

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
                    </Form>
                  </div>
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Poster</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>User create</TableCell>
                        <TableCell style={{textAlign:'center'}}>Total Episodes</TableCell>
                        <TableCell style={{width:150}}>Updated</TableCell>
                        <TableCell style={{width:150}}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                              {key + 1}
                            </TableCell>
                            <TableCell>
                              {row.code}
                            </TableCell>
                            <TableCell>
                                <img src={row.poster} width="100px"/>
                            </TableCell>
                            <TableCell>
                                {row.name}
                            </TableCell>
                            <TableCell>{row.category.name}</TableCell>
                            <TableCell>{renderStatusText(row)}</TableCell>
                            <TableCell>{row.user.display_name}</TableCell>
                            <TableCell style={{textAlign:'center'}}>
                              {checkPermission(permissions.getOne) ? <Link to={`/films/edit/${row.id}?activeKey=2`} >{row.total_episode}</Link> : row.total_episode}
                            </TableCell>
                            <TableCell>{formatTime(row.updatedAt)}</TableCell>
                          <TableCell>
                            {checkPermission(permissions.getOne) && <Link to={`/films/edit/${row.id}`} data-toggle="tooltip" data-placement="top" title="Edit film"><Icon className="fa fa-pen" style={{ color: '#ffa800',fontSize: 15 }} /></Link>}
                            {checkPermission(permissions.delete) && <span style={{cursor:'pointer'}} data-toggle="tooltip" data-placement="top" title="Delete film"><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)',fontSize: 15,marginLeft:15 }} /></span>}
                          </TableCell>
                        </TableRow>
                      )):(
                        <TableRow>
                          <TableCell colSpan={10} align="center">There is no data to display</TableCell>
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
                  title='Delete video'
                  visible={dataDelete.visible}
                  onOk={clickModalOk}
                  onCancel={clickModalCancel}
                  cancelText='Cancel'
                  okText='Ok'
                >
                <p>Do you want to delete this?</p>
              </Modal>
            </div>
        </div>
      </div>
    </>
  );
}