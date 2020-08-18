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

export default function EditCategory(props) {
  // Example 1
  const classes1 = useStyles1();
  const token = JSON.parse(JSON.parse(localStorage.getItem('persist:demo1-auth')).authToken)
  const [ dataState, setData] = useState({loadingPage:true});
  const inputNameRef = React.createRef();
  const inputDescriptionRef = React.createRef();

  const setLoadingPage = (value) => {
    setData({
        ...dataState,
        loadingPage:value
    })
  }
  const onChangeValue = (key, value) => {
    const newCategory = {...dataState.category,  [key]: value }
    setData({
        ...dataState,
        category:newCategory
    })
  }

  useEffect(() => {
    let { id } = props.match.params
    if(id){
      makeRequest('get', `api/admin/getCategory?token=${token}`,{id})
      .then(({ data }) => {
          if (data.signal) {
              let category  = data.data
              
              setData({
              ...dataState,
              category,
              loadingPage:false
            })            
          }
      })
      .catch(err => {
          console.log(err)
      })
    }    
    
  }, []);

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!(dataState.category.name).trim()) {
        inputNameRef.current.focus()
        return showErrorMessage('Please enter category name');
      }

      if (dataState.category.status === '') {
        return showErrorMessage('Please enter category status');
      }
      setLoadingPage(true)
      makeRequest('post', `api/admin/updateCategory?token=${token}`, dataState)
        .then(({ data }) => {
          setLoadingPage(false)
            if (data.signal) {
                showSuccessMessageIcon('Update success')
                props.history.push('/videos/categories')
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
                                  <Form.Control type="text" maxLength={255} autoFocus ref={inputNameRef} placeholder="Enter name" value={Object.keys(dataState).length ? dataState.category.name : ''} onChange={(e) => onChangeValue('name', e.target.value)}/>
                              </Form.Group>

                              <Form.Group controlId="formBasicStatus">
                                  <Form.Label className="starDanger">Status</Form.Label>
                                  <Form.Control as="select" value={Object.keys(dataState).length ? dataState.category.status : 'all'} onChange={(e) => onChangeValue('status', e.target.value)}>
                                    <option value='' disabled>Choose status</option>
                                    <option value='1'>Active</option>
                                    <option value='0'>Inactive</option>
                                  </Form.Control>
                              </Form.Group>

                              <Form.Group controlId="formBasicDescription">
                                  <Form.Label>Description</Form.Label>
                                  <Form.Control as="textarea" rows="3" maxLength={500} ref={inputDescriptionRef} placeholder="Enter description" value={Object.keys(dataState).length ? dataState.category.description : ''} onChange={(e) => onChangeValue('description', e.target.value)}/>
                              </Form.Group>

                              <div className="kt-login__actions">
                                  <Link to="/videos/categories" style={{marginRight: '5px'}}>
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