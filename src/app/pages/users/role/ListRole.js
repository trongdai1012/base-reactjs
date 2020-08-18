/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../../libs/request';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../../actions/notification';
import {
  makeStyles
} from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import { Modal } from "antd";
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import Loading from '../../loading';
import checkPermission from '../../../libs/permission';
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";


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

const ListUser = (props) => {
  // Example 1
  const classes1 = useStyles1();
  const [isLoadRemove, setLoadRemove] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [rows, setRow] = useState([]);
  const [dataDelete, setDataDelete] = useState([]);
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    marginTop: "3px"
  });
  const [isRefuse, setRefuse] = useState(false);
  const [isFirstLoad, setFirstLoad] = useState(false);

  const permissions = {
    updateRole: 'update-role'
  }

  useEffect(() => {
    let check = checkPermission(permissions.updateRole);
    if (check == 1) {
      setDataDelete({
        ...dataDelete,
        visible: false,
      })
      makeRequest('get', `permission/listRole`)
        .then(({ data }) => {
          if (data.signal) {
            setRow(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.log(err)
        })
    } else if (check == 2) {
      setRefuse(true);
    } else {
      setFirstLoad(true);
    }
  }, []);

  if (isRefuse) return <Redirect to="/Error403" />

  if (isFirstLoad) return <Redirect to="/" />

  const enableLoading = () => {
    setLoadRemove(true);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const disableLoading = () => {
    setLoadRemove(false);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const clickModalCancel = () => {
    setDataDelete({
      ...dataDelete,
      visible: false,
      idDel: 0
    })
  }

  const showModal = (idDel) => {
    setDataDelete({
      ...dataDelete,
      visible: true,
      idDel
    })
  }

  const clickModalOk = () => {
    let idDel = dataDelete.idDel
    enableLoading();
    makeRequest('post', `permission/removeRole/${idDel}`, {})
      .then(({ data }) => {
        if (data.signal) {
          showSuccessMessageIcon('Xoá quyền thành công');
          setDataDelete({
            ...dataDelete,
            visible: false,
            idDel: 0
          })

          let dataRole = rows.filter(it => it.id != idDel);
          setRow(dataRole);
          disableLoading();
        } else {
          disableLoading();
          showErrorMessage(data.message)
        }
      })

      .catch(err => {
        console.log('error', err);
      });
  }

  return (
    <>
      <Link to="/permissions/roles/add" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Thêm quyền</Link>
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
                  {isLoading ? <Loading /> :
                    <Table className={classes1.table}>
                      <TableHead>
                        <TableRow>
                          <TableCell>STT</TableCell>
                          <TableCell>Tên quyền</TableCell>
                          <TableCell>Mô tả</TableCell>
                          <TableCell style={{ width: '20%' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.length ? rows.map((row, key) => (
                          <TableRow key={`role-${row.id}`}>
                            <TableCell component="th" scope="row">
                              {key + 1}
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            {/* <TableCell><Link to={`/permissions/roles/edit-permission/${row.id}`}>Sửa quyền</Link></TableCell> */}
                            <TableCell style={{ width: '20%' }}>
                              <Link to={`/permissions/roles/edit-permission/${row.id}`} title="Sửa quyền"><Icon className="fa fa-pen" style={{ color: '#ffa800', fontSize: 15 }} /></Link>
                              <span style={{ cursor: 'pointer' }} title="Xóa quyền"><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)', fontSize: 15, marginLeft: 15 }} /></span>
                            </TableCell>
                          </TableRow>
                        )) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">Không có dữ liệu</TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  }
                </div>
              </Paper>
            </div>
            <Modal
              title='Xoá quyền'
              visible={dataDelete.visible}
              onOk={clickModalOk}
              onCancel={clickModalCancel}
              footer={[
                <>
                  <Button type="primary" onClick={() => clickModalCancel()}>
                    Hủy bỏ
                </Button>
                  <Button type="primary" style={loadingButtonStyle} className={`btn-danger ${clsx({
                    "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoadRemove
                  })}`} onClick={() => clickModalOk()} disabled={isLoadRemove === true ? true : false}>
                    Xóa
                </Button>
                </>
              ]}
            >
              <p>Xác nhận xoá quyền?</p>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = ({ auth }) => ({
  user: auth.user
});

export default connect(mapStateToProps, null)(ListUser);