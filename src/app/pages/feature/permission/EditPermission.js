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

export default function EditPermission(props) {
  // Example 1
  const classes1 = useStyles1();
  const inputRef = React.createRef();
  const inputKeyRef = React.createRef();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataState, setData] = useState({loadingPage:true});
  const [ listGroup, setlistGroup] = useState([]);

  const onChangeValue = (key, value) => {
    let newPermission = {...dataState.permission,  [key]: value}
    if(key === 'name'){
      newPermission = {...dataState.permission,  [key]: value,key:slugify(value) }
    }else if(key === 'key'){
      newPermission = {...dataState.permission,key:slugify(value) }
    }
    setData({
      ...dataState,
      permission:newPermission
    })
  }

  const getListPermission = () =>{
    makeRequest('get', `api/admin/getAllPermissionGroup?token=${token}`)
        .then(({ data }) => {
            if (data.signal) {
                const list = data.data;
                setlistGroup(list)
            }
        })
        .catch(err => {
            console.log(err)
        })
  } 

  useEffect(() => {
    
    getListPermission()
    let { id } = props.match.params
    makeRequest('get', `api/admin/getPermission?token=${token}`,{id})
      .then(({ data }) => {        
          if (data.signal) {
              let permission  = data.data              
              setData({
              ...dataState,
              permission,
              loadingPage:false
            })            
          }
      })
      .catch(err => {
          console.log(err)
      })
    
}, [])

  const handleSubmit = (e) => {
      e.preventDefault();

      if (!(dataState.permission.name).trim()) {
        inputRef.current.focus();
        return showErrorMessage('Please enter name');
      }else{
        if (validateMaxLength(dataState.permission.name, 225)) {
          inputRef.current.focus();
          return showErrorMessage('The name may not be greater than 225 characters')
        }
      }

      if (!(dataState.permission.key).trim()) {        
        inputKeyRef.current.focus();
        return showErrorMessage('Please enter key for permission');
      }else{
        if (validateMaxLength(dataState.permission.key, 225)) {
          inputKeyRef.current.focus();
          return showErrorMessage('The key may not be greater than 225 characters')
        }
      }
      if (!dataState.permission.type) {
        return showErrorMessage('Please choose group for permission');
      }
      onChangeValue('loadingPage',true)
      makeRequest('post',  `api/admin/updatePermission?token=${token}`, dataState)
        .then(({ data }) => {
          onChangeValue('loadingPage',false)
            if (data.signal) {
                showSuccessMessageIcon('Update success')
                props.history.push('/feature/permission')
            } else {
              return showErrorMessage(data.message);
            }
        })
        .catch(err => {
            console.log('++++++++++++++++', err)
        })
  }
  if(dataState.loadingPage){
    return <Loading />
  }
  return (
    <>
        <div className="row">
            <div className="col-md-12">
                <div className="kt-section">
                    <Card >
                        <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formBasicName">
                                <Form.Label className="starDanger">Name</Form.Label>
                                <Form.Control type="text" ref={inputRef} maxLength={255} autoFocus placeholder="Enter name" value={dataState.permission.name || ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicKey">
                                <Form.Label className="starDanger">Key</Form.Label>
                                <Form.Control type="text" ref={inputKeyRef} maxLength={255} placeholder="Enter key"  value={dataState.permission.key || ''}  onChange={(e) => onChangeValue('key', e.target.value)} />
                            </Form.Group>
                            <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Group</Form.Label>
                                  <Form.Control as="select" value={dataState.permission.type || ''} placeholder="Select Group" onChange={(e) => onChangeValue('type', e.target.value)} >
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
                                    Update
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