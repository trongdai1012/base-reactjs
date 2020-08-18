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

export default function CreateTag(props) {
  // Example 1
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataAdd, setData] = useState({unsaved:false,loadingPage:false});
  const inputNameRef = React.createRef();
  const inputSlugRef = React.createRef();
  const inputDescriptionRef = React.createRef();

  const onChangeValue = (key, value) => {
      if(key === 'name'){
        setData({
          ...dataAdd,
          [key]: value,
          slug:slugify(value)
        })
      }else if(key === 'slug'){
        setData({
          ...dataAdd,
          slug:slugify(value)
        })
      }else{
        setData({
          ...dataAdd,
          [key]: value
        })
      }
  }

  const handleSubmit = (e) => {
      e.preventDefault();

      if (!dataAdd.name) {
        inputNameRef.current.focus()
        return showErrorMessage('Please enter name');
      }else{
        if(!(dataAdd.name).trim().length){
          inputNameRef.current.focus();
          return showErrorMessage('Please enter name');
        }
        
      }
      if (!dataAdd.slug) {
        inputSlugRef.current.focus()
        return showErrorMessage('Please enter tag slug');
      }else{
        if(!(dataAdd.slug).trim().length){
          inputSlugRef.current.focus();
          return showErrorMessage('Please enter tag slug');
        }
        
      }

      onChangeValue('loadingPage',true)
      makeRequest('post', `api/admin/addTag?token=${token}`, dataAdd)
        .then(({ data }) => {
          onChangeValue('loadingPage',false)
            if (data.signal) {
                showSuccessMessageIcon('Create success')
                onChangeValue('unsaved',true)
                props.history.push('/videos/tags')
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
                                <Form.Control type="text" autoFocus maxLength={255} ref={inputNameRef} placeholder="Enter name" value={dataAdd.name || ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Slug</Form.Label>
                                <Form.Control type="text" maxLength={255} ref={inputSlugRef} placeholder="Enter slug" value={dataAdd.slug || ''} onChange={(e) => onChangeValue('slug', e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" maxLength={500} rows="3" ref={inputDescriptionRef} placeholder="Enter description" value={dataAdd.description || ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                            </Form.Group>

                            <div className="kt-login__actions">
                                <Link to="/videos/tags" style={{marginRight: '5px'}}>
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