/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
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
import { Modal, Pagination } from "antd";
import { Form, Button } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import { connect } from "react-redux";
import Loading from "../loading";
import clsx from "clsx";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

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
  const classes1 = useStyles1();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRow] = useState([]);
  const [dataSearch, setData] = useState({ name: '', email: '' });
  const [dataDelete, setDataDelete] = useState({ visible: false });
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [isLoadSearch, setLoadSearch] = useState(false);
  const [isLoadRemove, setLoadRemove] = useState(false);
  const [loadingButtonStyle, setLoadingButtonStyle] = useState({
    marginTop: "3px"
  });
  const [isRefuse, setRefuse] = useState(false);
  const [isFirstLoad, setFirstLoad] = useState(false);

  const permissions = {
    getManager: 'get-manager'
  }

  useEffect(() => {
    let check = checkPermission(permissions.getManager);
    if (check == 1) {
      searchDistributor({ page: 1, limit: rowsPerPage });
    } else if (check == 2) {
      setRefuse(true);
    } else {
      setFirstLoad(true);
    }
  }, []);

  if (isRefuse) return <Redirect to="/Error403" />

  if (isFirstLoad) return <Redirect to="/" />

  const enableLoadSearch = () => {
    setLoadSearch(true);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const disableLoadSearch = () => {
    setLoadSearch(false);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const enableLoadRemove = () => {
    setLoadRemove(true);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const disableLoadRemove = () => {
    setLoadRemove(false);
    setLoadingButtonStyle({ marginTop: "3px" });
  };

  const searchDistributor = (dataSearch = {}) => {
    setLoading(true);
    enableLoadSearch();
    makeRequest('get', `permission/getManager`, dataSearch)
      .then(({ data }) => {
        if (data.signal) {
          const res = data.data.rows;
          setRow(res.rows);
          setTotal(data.data.count);
        }
        setLoading(false);
        disableLoadSearch();
      })
      .catch(err => {
        disableLoadSearch();
        setLoading(false);
        console.log(err)
      })
  }

  const clickModalOk = () => {
    enableLoadRemove();
    makeRequest('post', `permission/removeManager`, { id: dataDelete.idDel })
      .then(({ data }) => {
        if (data.signal) {
          showSuccessMessageIcon("Xóa thành công");
          let dataUser = rows.filter(it => it.id != dataDelete.idDel)
          setRow(dataUser);
          clickModalCancel();
        }
        disableLoadRemove();
      })
      .catch(err => {
        disableLoadRemove();
        showErrorMessage("Xóa thất bại");
        console.log(err)
      })
  }

  const handleChangePage = (newPage) => {
    setPage(newPage);
    searchDistributor({ ...dataSearch, page: newPage, limit: rowsPerPage });
  };

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

  const unfilteredData = (e) => {
    setData({
      name: '',
      email: ''
    });

    setPage(1);

    searchDistributor({ name: '', email: '', page: 1, limit: rowsPerPage });
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    searchDistributor(dataSearch);
  }

  return (
    <>

      <Link to="/permissions/add" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Thêm quản trị viên</Link>

      <div className="row">
        <div className="col-md-12">
          <div className="kt-section">
            <div className="kt-section__content">
              <Paper className={classes1.root}>
                <div className='col-md-12'>
                  <Form onSubmit={handleSubmit}>
                    <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                    <div className='form-row'>
                      <div className='form-group col-md-3'>
                        <div className="form-group">
                          <InputForm
                            type="text"
                            placeholder="Tên"
                            value={dataSearch.name || ''}
                            onChangeValue={(value) => { onChangeValue('name', value) }}
                            focus={true}
                          />
                        </div>
                      </div>
                      <div className='form-group col-md-3'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <InputForm
                            type="text"
                            placeholder="Email"
                            value={dataSearch.email || ''}
                            onChangeValue={(value) => { onChangeValue('email', value) }}
                          />
                        </div>
                      </div>
                      <div className='form-group col-md-3'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                          <button className={`btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10 ${clsx(
                            {
                              "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoadSearch
                            }
                          )}`} style={loadingButtonStyle} type="submit" disabled={isLoadSearch === true ? true : false}><span>Tìm kiếm</span></button>
                        </div>
                      </div>
                    </div>
                  </Form>
                </div>
                {isLoading ? <Loading /> :
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>SĐT</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell style={{ width: 150 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows && rows.length ? rows.map((row, key) => (
                        <TableRow key={`user-${row.id}`}>
                          <TableCell>
                            {row.name}
                          </TableCell>
                          <TableCell>
                            {row.email}
                          </TableCell>
                          <TableCell>{row.mobile}</TableCell>
                          <TableCell>{formatTime(row.createdAt)}</TableCell>
                          <TableCell>
                            <Link to={`/permissions/edit/${row.id}`} data-toggle="tooltip" data-placement="top" title="Sửa quản trị viên"><Icon className="fa fa-pen" style={{ color: '#ffa800', fontSize: 15 }} /></Link>
                            <span style={{ cursor: 'pointer' }} data-toggle="tooltip" data-placement="top" title="Xóa quản trị viên"><Icon className="fa fa-trash" onClick={(e) => showModal(row.id)} style={{ color: 'rgb(220, 0, 78)', fontSize: 15, marginLeft: 15 }} /></span>
                          </TableCell>
                        </TableRow>
                      )) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center">Không có dữ liệu</TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                }

                {total > rowsPerPage && (
                  <div className="customSelector custom-svg">
                    <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                  </div>
                )}

              </Paper>
            </div>
            <Modal
              title='Xóa quản trị viên'
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
              <div>Xác nhận xóa quản trị viên?</div>
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