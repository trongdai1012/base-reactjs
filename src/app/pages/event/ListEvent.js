/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import checkPermission from '../../libs/permission'
import { Link } from 'react-router-dom';
import {
  makeStyles,
  // lighten,
  // withStyles,
  // useTheme
} from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  // Checkbox,
  // Toolbar,
  // Typography,
  // Tooltip,
  // IconButton,
  // TableSortLabel,
  TablePagination,
  // Switch,
  // FormControlLabel,
  // TableFooter
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import bootbox from 'bootbox';
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

export default function ListEvent() {
  // Example 1
  const userLogin = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).user)
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const permissions = { 
    getAll:'get-all-event',
    create:'create-event',
    getOne:'get-event',
    delete:'delete-event',
  }
  const classes1 = useStyles1();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRow] = useState([]);
  const [ dataSearch, setData] = useState({user:userLogin});
  useEffect(() => {
    makeRequest('get', `api/admin/allEvent?token=${token}`,dataSearch)
      .then(({ data }) => {
        if (data.signal) {
          setRow(data.data)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }, []);

  const handleDelete = (id) => {
    makeRequest("post", `api/admin/deleteEvent?token${token}`, { id }).then(result => {
  
      if (result.data.signal) {
        alert("Xóa sự kiện thành công");
        const rowsnew = rows.filter(it => it.id != id);
        setRow(rowsnew)
      } else {
        return result.message;
      }
    }).catch(err => {
  
      console.log(err)
    })
  };
  const onClick = (id) => {
    console.log("-----data", id)
    // e.preventDefault();

    if(window.confirm("Are you sure you want to delete this?")) {
      handleDelete(id);
  }
  // bootbox.confirm({
  //   size: "small",
  //   message: "Bạn có chắc chắn muốn xóa?",
  //   buttons: {
  //     confirm: {
  //       label: "Đồng ý",
  //       className: "btn-success"
  //     },
  //     cancel: {
  //       label: "Không",
  //       className: "btn-danger"
  //     }
  //   },
  //   callback: function(result) {
  //     if (result) {
  //       handleDelete();
  //     }
  //   }
  // });
};
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
}

return (
  <>
    <Notice >
      <p>All videos</p>
    </Notice>

    {checkPermission(permissions.create) && <Link to="/event/add" className="btn btn-label-warning btn-bold btn-sm btn-icon-h kt-margin-l-10">Add New</Link>}

    <div className="row">
      <div className="col-md-12">
        <div className="kt-section">
          {/* <span className="kt-section__sub">
                A simple example with no frills.
              </span> */}
          {/* <div className="kt-separator kt-separator--dashed"></div> */}
          <div className="kt-section__content event-list">
            <Paper className={classes1.root}>
              <Table className={classes1.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>thumbnail</TableCell>
                    <TableCell>name</TableCell>
                    <TableCell>category</TableCell>
                    <TableCell>start-date</TableCell>
                    <TableCell>end-date</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell style={{width:250}}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row">
                        {row.id}
                      </TableCell>
                      <TableCell className='image-event'>
                        <img src={row.thumbnail} width="100px" />
                      </TableCell>

                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category.name}</TableCell>
                      <TableCell>{formatTime(row.start_time)}</TableCell>
                      <TableCell>{formatTime(row.end_time)}</TableCell>
                      <TableCell>{formatTime(row.updatedAt)}</TableCell>
                      <TableCell>
                        {checkPermission(permissions.getOne) &&<Link to={`/event/updateEvent/${row.id}`} data-toggle="tooltip" data-placement="top" title="Edit event"><Icon className="fa fa-pen" style={{ color: '#ffa800',fontSize: 15 }} /></Link>}
                        {checkPermission(permissions.delete) && <span style={{cursor:'pointer'}} data-toggle="tooltip" data-placement="top" title="Delete event"><Icon className="fa fa-trash" onClick={(e) => onClick(row.id)} style={{ color: 'rgb(220, 0, 78)',fontSize: 15,marginLeft:15 }} /></span>}

                        {/* <Link to={`/event/updateEvent/${row.id}`} type='button' className='label label-primary' style={{ marginRight: 10 }}>
                         <span className="fas fa-pencil-alt position-left"></span>Sửa
                    </Link> */}
                        {/* <button type='submit' className='label label-danger bg-pink' onClick={(e) => onClick(row.id)} style={{ marginRight: 10, marginTop: 3 }}>
                        <i className="far fa-trash-alt"></i>
            Xóa
          </button> */}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={8} align="center">There is no data to display</TableCell>
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