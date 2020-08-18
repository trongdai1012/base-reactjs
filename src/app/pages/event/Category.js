/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../partials/content/Notice";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
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
import FilterListIcon from "@material-ui/icons/FilterList";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

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

export default function ListCategory() {
  // Example 1
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [page3, setPage3] = React.useState(0);
  const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
  const [ rows, setRow] = useState([]);

  useEffect(() => {
    makeRequest('get', `api/admin/eventCategory?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {
                setRow(data.data)
            }
        })
        .catch(err => {
            console.log(err)
        })
  }, []);

  return (
    <>
      <Notice >
        <p>Event Category</p>
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
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Icon</TableCell>
                        <TableCell>Publish</TableCell>
                        <TableCell>Updated</TableCell>
                        {/* <TableCell>Action</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                              {row.code}
                            </TableCell>
                            <TableCell>
                                <img src={row.thumbnail}/>
                            </TableCell>
                            <TableCell>
                                {row.title}
                                </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{formatTime(row.updatedAt)}</TableCell>
                          {/* <TableCell>

                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}