/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../../partials/content/Notice";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import { slugify,validateMaxLength,validateMinLength } from "../../../libs/utils"
import { Prompt } from 'react-router'
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
import { Button, Form, Card } from "react-bootstrap";

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

export default function CreatePermission(props) {
  // Example 1
  const classes1 = useStyles1();
  const inputRef = React.createRef();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataAdd, setData] = useState({unsaved:false,loadingPage:true});
  const [ listGroup, setlistGroup] = useState([]);

  const onChangeValue = (keyState, value) => {
    setData({
      ...dataAdd,
      [keyState]: value
    })
  }

  useEffect(() => {
    makeRequest('get', `api/admin/getAllPermissionGroup?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {
                const list = data.data;
                setlistGroup(list)
                onChangeValue('loadingPage',false)
            }
        })
        .catch(err => {
            console.log(err)
        })
}, [])

  const handleSubmit = (e) => {
      e.preventDefault();

      if (!dataAdd.name) {
        inputRef.current.focus();
        return showErrorMessage('Please enter name');
      }else{
        if(!(dataAdd.name).trim().length){
          inputRef.current.focus();
          return showErrorMessage('Please enter name');
        }
        if (validateMaxLength(dataAdd.name, 225)) {
          return showErrorMessage('The name may not be greater than 225 characters')
        }
      }
      if (!dataAdd.type) {
        return showErrorMessage('Please choose group for permission');
      }
      onChangeValue('loadingPage',true)
      makeRequest('post', `api/admin/createPermission?token=${token}`, dataAdd)
        .then(({ data }) => {
          onChangeValue('loadingPage',false)
            if (data.signal) {
                showSuccessMessageIcon('Create success')
                onChangeValue('unsaved',true)
                props.history.push('/feature/permission')
            } else {
              return showErrorMessage(data.message);
            }
        })
        .catch(err => {
            console.log('++++++++++++++++', err)
        })
  }
  if(dataAdd.loadingPage){
    return <Loading />
  }
  return (
    <>
        <Prompt
            when={!dataAdd.unsaved}
            message='You have unsaved changes, are you sure you want to leave?'
        />
        <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formBasicName">
                                <Form.Label className="starDanger">Name</Form.Label>
                                <Form.Control type="text" maxLength={255} autoFocus ref={inputRef} placeholder="Enter name" value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Group</Form.Label>
                                  <Form.Control as="select" value={dataAdd.type || ''} placeholder="Select Group" onChange={(e) => onChangeValue('type', e.target.value)} >
                                      <option value="">Select Group</option>
                                      {listGroup.map((it, idx) => {
                                          return <option value={it.type} key={`group-${it.id}`}>{it.type}</option>
                                      })}
                                  </Form.Control>                            
                                </Form.Group>
                            <div className="kt-login__actions">
                                <Link to="/feature/permission" style={{marginRight: '5px'}}>
                                    <button type="button" className="btn btn-secondary btn-elevate kt-login__btn-secondary">Back</button>
                                </Link>
                                <Button variant="primary" type="submit">
                                    Add
                                </Button>
                            </div>
                        </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    </>
  );
}