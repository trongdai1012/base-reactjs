/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import Notice from "../../../partials/content/Notice";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import { slugify,validateMaxLength,validateMinLength } from "../../../libs/utils"
import Loading from "../../loading"
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

export default function EditTag(props) {
  // Example 1
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataState, setData] = useState({loadingPage:true});
  const inputNameRef = React.createRef();
  const inputSlugRef = React.createRef();
  const inputDescriptionRef = React.createRef();

  const onChangeValue = (key, value) => {
    let newTag = {...dataState.tag,  [key]: value}
    if(key === 'name'){
      newTag = {...dataState.tag,  [key]: value,slug:slugify(value) }
    }else if(key === 'slug'){
      newTag = {...dataState.tag,slug:slugify(value) }
    }
    setData({
      ...dataState,
      tag:newTag
    })
  }

  useEffect(() => {
    let { id } = props.match.params
    if(id){
      makeRequest('get', `api/admin/getTag?token=${token}`,{id})
      .then(({ data }) => {        
          if (data.signal) {
              let tag  = data.data              
              setData({
              ...dataState,
              tag,
              loadingPage:false
            })            
          }
      })
      .catch(err => {
          console.log(err)
      })
    }    
    
  }, []);

  const setLoadingPage = (value) => {
    setData({
        ...dataState,
        loadingPage:value
    })
  }
  const handleSubmit = (e) => {
      e.preventDefault();
      if (!(dataState.tag.name).trim()) {
        inputNameRef.current.focus()
        return showErrorMessage('Please enter name');
      }
      if (!(dataState.tag.slug).trim()) {
        inputSlugRef.current.focus()
        return showErrorMessage('Please enter tag slug');
      }
      
      setLoadingPage(true)
      makeRequest('post', `api/admin/updateTag?token=${token}`, dataState)
        .then(({ data }) => {
            setLoadingPage(false)
            if (data.signal) {
                showSuccessMessageIcon('Update success')
                props.history.push('/videos/tags')
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
                                  <Form.Control type="text" maxLength={255} autoFocus placeholder="Enter name" ref={inputNameRef} value={Object.keys(dataState).length ? dataState.tag.name : ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicSlug">
                                <Form.Label className="starDanger">Slug</Form.Label>
                                <Form.Control type="text" maxLength={255} placeholder="Enter slug" ref={inputSlugRef} value={Object.keys(dataState).length ? dataState.tag.slug : ''} onChange={(e) => onChangeValue('slug', e.target.value)}/>
                              </Form.Group>
                              <Form.Group controlId="formBasicDescription">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control as="textarea" maxLength={500} rows="3" ref={inputDescriptionRef} placeholder="Enter description" value={Object.keys(dataState).length ? dataState.tag.description : ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                              </Form.Group>

                              <div className="kt-login__actions">
                                  <Link to="/videos/tags" style={{marginRight: '5px'}}>
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