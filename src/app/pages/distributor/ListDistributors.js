/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from "react";
import makeRequest from '../../libs/request';
import { formatTime } from '../../libs/time';
import { Link } from 'react-router-dom';
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
import { Modal, Pagination, Button } from "antd";
import { Form } from "react-bootstrap";
import InputForm from '../../partials/common/InputForm';
import SelectForm from '../../partials/common/SelectForm';
import { LEVEL_DISTRIBUTOR } from '../../config/product';
import { InfoCircleOutlined } from '@ant-design/icons';
import Loading from '../loading';
import ButtonLoading from '../../partials/common/ButtonLoading';
import { connect } from 'react-redux';
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

const ListDistributors = (props) => {
  const classes1 = useStyles1();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [rows, setRow] = useState([]);
  const [dataSearch, setData] = useState({});
  const [dataDelete, setDataDelete] = useState({ visible: false });
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [isLoadSearch, setLoadSearch] = useState(true);
  const { user } = props;
  const [isRefuse, setRefuse] = useState(false);
  const [isFirstLoad, setFirstLoad] = useState(false);

  const permissions = {
    getListDistri: 'get-distributor'
  }

  useEffect(() => {
    let check = checkPermission(permissions.getListDistri);
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
  };

  const disableLoadSearch = () => {
    setLoadSearch(false);
  };

  function itemRender(current, type, originalElement) {

    return originalElement;
  }

  const searchDistributor = (dataSearch = {}) => {
    setLoading(true);
    enableLoadSearch();
    makeRequest('get', `distributor/search`, dataSearch)
      .then(({ data }) => {
        if (data.signal) {
          const { rows, total } = data.data;
          setRow(rows);
          setTotal(total);
        }
        setLoading(false);
        disableLoadSearch();
      })
      .catch(err => {
        setLoading(false);
        disableLoadSearch();
        console.log(err);
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

  const clickModalCancel = () => {
    setDataDelete({
      ...dataDelete,
      visible: false,
      idDel: 0
    })
  }

  const clickModalOk = () => {
    let idDel = dataDelete.idDel;
  }

  const unfilteredData = (e) => {
    setData({
    });
    setPage(1);
    searchDistributor({ page: 1, limit: rowsPerPage });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    searchDistributor({ ...dataSearch, page: 1, limit: rowsPerPage });
  }

  const renderLevel = (level) => {
    if (level == 1) {
      return <span className="btn btn-label-primary btn-bold btn-sm btn-icon-h textindiv" style={{ borderRadius: '.42rem' }}>Kim cương</span>
    } else if (level == 2) {
      return <span className="btn btn-label-danger btn-bold btn-sm btn-icon-h textindiv" style={{ borderRadius: '.42rem' }}>Hồng Ngọc</span>
    } else {
      return <span className="btn btn-label-warning btn-bold btn-sm btn-icon-h textindiv" style={{ borderRadius: '.42rem' }}>Vàng</span>
    }
  }

  return (
    <>

      <Link to="/distributor/add" className="btn btn-primary btn-bold btn-sm btn-icon-h kt-margin-l-10">Tạo nhà phân phối</Link>

      <div className="row">
        <div className="col-md-12">
          <div className="kt-section">
            <div className="kt-section__content">
              <Paper className={classes1.root}>
                <div className='col-md-12'>
                  <Form onSubmit={handleSubmit}>
                    <div style={{ marginTop: 20, fontSize: 20 }}><label>Tìm kiếm</label></div>
                    <div className='form-row'>
                      <div className='form-group col-md-2'>
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
                      <div className='form-group col-md-2'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <InputForm
                            type="text"
                            placeholder="Email"
                            value={dataSearch.email || ''}
                            onChangeValue={(value) => { onChangeValue('email', value) }}
                          />
                        </div>
                      </div>
                      <div className='form-group col-md-2'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <InputForm
                            type="text"
                            placeholder="Số điện thoại"
                            value={dataSearch.mobile || ''}
                            onChangeValue={(value) => { onChangeValue('mobile', value) }}
                          />
                        </div>
                      </div>
                      <div className='form-group col-md-2'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <SelectForm
                            optionData={LEVEL_DISTRIBUTOR}
                            placeholder="Cấp nhà phân phối"
                            keyString="id"
                            labelString="n"
                            value={dataSearch.level || ''}
                            onChangeValue={(value) => { onChangeValue('level', value) }}
                          />
                        </div>
                      </div>
                      <div className='form-group col-md-3'>
                        <div className="form-group" style={{ display: 'flex' }} >
                          <button className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10" onClick={unfilteredData} style={{ marginLeft: 10, marginTop: 3 }} type="button"><span>Bỏ lọc</span></button>
                          {/* <button className={`btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10${clsx(
                            {
                              "kt-spinner kt-spinner--right kt-spinner--md kt-spinner--light": isLoadSearch
                            }
                          )}`} style={loadingButtonStyle} type="submit" disabled={isLoadSearch === true ? true : false}> <span>Tìm kiếm</span></button> */}
                          <ButtonLoading type="submit" disabled={isLoadSearch === true ? true : false}
                            className="btn btn-label-primary btn-bold btn-sm btn-icon-h kt-margin-l-10"
                            loading={isLoadSearch} style={{ marginLeft: 10, marginTop: 3 }}><span>Tìm kiếm</span></ButtonLoading>
                        </div>
                      </div>
                    </div>
                  </Form>
                </div>
                {isLoading ? <Loading /> :
                  <Table className={classes1.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên nhà phân phối</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>SĐT</TableCell>
                        {user && user.distributor_id === 0 &&
                          <TableCell>Tạo bởi</TableCell>
                        }
                        <TableCell>Cấp nhà phân phối</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell style={{ width: 150 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows && rows.length ? rows.map((row, key) => (
                        <TableRow key={`list-distri-${row.id}`}>
                          <TableCell>
                            {row.name}
                          </TableCell>
                          <TableCell>
                            {row.email}
                          </TableCell>
                          <TableCell>{row.mobile}</TableCell>
                          {user && user.distributor_id === 0 &&
                            <TableCell>{row.distri_parrent && row.distri_parrent.email || 'Admin'}</TableCell>
                          }
                          <TableCell>{renderLevel(row.level)}</TableCell>
                          <TableCell>{formatTime(row.createdAt)}</TableCell>
                          <TableCell>
                            <div className="mg-b5">
                              <Button type="primary" size="small" className="button-center-item " onClick={() => props.history.push(`/distributor/detail/${row.id}`)} icon={<InfoCircleOutlined />}>
                                Chi tiết
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center">Không có dữ liệu</TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>}
                {total > rowsPerPage && (
                  <div className="custom-svg customSelector">
                    <Pagination itemRender={itemRender} className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                  </div>
                )}

              </Paper>
            </div>
            <Modal
              title='Delete video'
              visible={dataDelete.visible}
              onOk={clickModalOk}
              onCancel={clickModalCancel}
              cancelText='Cancel'
              okText='Ok'
            >
              <p>Do you want to delete this?</p>
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

export default connect(mapStateToProps, null)(ListDistributors);