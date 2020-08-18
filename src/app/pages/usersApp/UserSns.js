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

export default function UserSns(props) {
  // Example 1
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const classes1 = useStyles1();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);  
  const [ rows, setRow] = useState([]);
  const [ dataSearch, setData] = useState([]);

  const onChangeValue = (key, value) => {
    
    setData({
        ...dataSearch,
        [key]: value
    })
  }

  useEffect(() => {
    let { id } = props.match.params
    let data = {
      id,dataSearch
    }
    if(id){
      makeRequest('get', `api/admin/getSNSOfUser?token=${token}`,data)
        .then(({ data }) => {
          console.log(data);
          
            if (data.signal) {
                setRow(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
      }
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
    let { id } = props.match.params
    let data = {
      id,dataSearch
    }
    makeRequest('get', 'api/admin/getDevicesUser',data)
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
    })
    let { id } = props.match.params
    let data = {
      id,dataSearch
    }
    makeRequest('get', 'api/admin/getDevicesUser',data)
    .then(({ data }) => {
        if (data.signal) {          
            setRow(data.data)
        }
    })
    .catch(err => {
        console.log(err)
    })
  }

  return (
    <>
      <Notice >
        <p>Sns of user</p>
      </Notice>


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
                        <TableCell>ID</TableCell>
                        <TableCell>Connect ID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>SNS type</TableCell>
                        <TableCell>Fullname</TableCell>
                        {/* <TableCell>OS version</TableCell>
                        <TableCell>Login time</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,key) => (
                        <TableRow key={row.id}>
                          <TableCell component="th" scope="row">
                            {key + 1}
                          </TableCell>
                          <TableCell>{row.connect_id}</TableCell>
                          <TableCell>{row.email || "-"}</TableCell>
                          <TableCell>{row.username}</TableCell>
                          <TableCell>{row.sns_type.charAt(0).toUpperCase() + row.sns_type.substring(1)}</TableCell>
                          <TableCell>{row.fullname || "-"}</TableCell>
                          {/* <TableCell>{row.os_version}</TableCell>
                          <TableCell>{formatTime(row.updatedAt)}</TableCell> */}
                        </TableRow>
                      )): (
                        <TableRow>
                          <TableCell colSpan={6} align="center">There is no data to display</TableCell>
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
            </div>
        </div>
      </div>
    </>
  );
}