/* eslint-disable no-restricted-imports */
import React, { useState, useEffect, useRef } from "react";
import makeRequest from '../../libs/request';
import { showSuccessMessageIcon, showErrorMessage } from '../../actions/notification';
import SelectForm from '../../partials/common/SelectForm';
import { Form, Card, Col } from "react-bootstrap";
import ButtonLoading from "../../partials/common/ButtonLoading";
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@material-ui/core";
import { Select, Spin, Pagination } from "antd";
import { formatTime } from "../../libs/time";
import checkPermission from '../../libs/permission';
const { Option } = Select;


const DonateCoupons = (props) => {

    const [dataAdd, setData] = useState({});
    const [isloading, setLoading] = useState(false);
    const [isRequested, setRequested] = useState(false);
    const inputQuantityRef = useRef();
    const [distributor_id, setDistributor] = useState('');
    const [dataOptions, setDataOptions] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [textSearch, setTextSearch] = useState('');
    const [listCampaign, setCampaign] = useState([]);
    const [dataCampaign, setDataCampaign] = useState({});
    const [listCoupons, setListCoupons] = useState({});
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [camSearchID, setCamSearchID] = useState(0);
    const [camPackID, setCamPackID] = useState(0);
    const [typeSelect, setTypeSelect] = useState('1');
    const [distriLevel, setDistriLevel] = useState('');
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        donateCoupons: 'donate-coupons'
    }

    useEffect(() => {
        let check = checkPermission(permissions.donateCoupons);
        if (check == 1) {
            fetchCampaign();
        } else if (check == 2) {
            setRefuse(true);
        } else {
            setFirstLoad(true);
        }
    }, []);

    if (isRefuse) return <Redirect to="/Error403" />

    if (isFirstLoad) return <Redirect to="/" />

    if (isRequested) {
        return <Redirect to="/gift-card/list-campaign" />;
    }

    const onChangeValue = (key, value) => {
        if (key === 'campaign_id') {
            fetchCampaignDetail(value);
            setCamSearchID(value);
            setPage(1);
            setListCoupons({});
            fetchCouponsByCampageID({ id: value, page: 1, limit: rowsPerPage });
        }
        if (key === 'quantity') {
            if (value < 0) value = 0;
        }
        setData({
            ...dataAdd,
            [key]: value
        })
    }

    const fetchCampaign = () => {
        makeRequest('get', `coupons/getall`)
            .then(({ data }) => {
                if (data.signal) {
                    let listCam = data.data.map(it => {
                        return {
                            label: `${it.name}`,
                            value: it.id
                        }
                    })

                    setCampaign(listCam);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    const fetchCampaignDetail = (id) => {
        makeRequest('get', `coupons/getcampaignById?id=${id}`)
            .then(({ data }) => {
                setDataCampaign(data.data);
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }

    const fetchCouponsByCampageID = (dataSearch = {}) => {

        makeRequest('get', `coupons/getCouponsDetailByCampaignID`, dataSearch)
            .then(({ data }) => {
                setListCoupons(data.data.data);
                setTotal(data.data.count);
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dataAdd.campaign_id) {
            return showErrorMessage('Vui lòng chọn chiến dịch');
        }

        if (typeSelect === '1' && !distributor_id) {
            return showErrorMessage('Vui lòng chọn nhà phân phối');
        }

        if (typeSelect === '2' && !distriLevel) {
            return showErrorMessage('Vui lòng chọn cấp nhà phân phối');
        }

        if (!camPackID) {
            return showErrorMessage('Vui lòng chọn gói áp dụng');
        }

        if (!dataAdd.quantity) {
            inputQuantityRef.current.focus();
            return showErrorMessage('Vui lòng nhập số lượng coupons');
        }

        if (dataAdd.quantity < 1) {
            inputQuantityRef.current.focus();
            return showErrorMessage('Số lượng coupons phải lớn hơn 0');
        }

        setLoading(true);
        dataAdd.distributor_id = distributor_id;
        dataAdd.distri_level = distriLevel;
        dataAdd.type = typeSelect;
        dataAdd.campaignPackage_id = camPackID;
        makeRequest('post', `coupons/addCoupons`, dataAdd)
            .then(({ data }) => {
                if (data.signal) {
                    resetForm();
                    showSuccessMessageIcon('Tạo coupons thành công');
                    setLoading(false);
                    setRequested(true);
                } else {
                    showErrorMessage(data.message);
                    setLoading(false);
                }
            })
            .catch(err => {
                setLoading(false);
                console.log('++++++++++++++++', err);
            })
    }

    const resetForm = () => {
        setData({});
    }

    const fetchDistributor = value => {
        setDataOptions([]);
        setFetching(true);
        makeRequest('get', `distributor/getChildDistributor`, { name: value, email: value, limit: 25 })
            .then(({ data }) => {
                if (data.signal) {
                    let arrDistributor = data.data.map(it => {
                        return {
                            label: `${it.name} - ${it.email}`,
                            value: it.id,
                            level: it.level
                        }
                    })

                    setDataOptions(arrDistributor);
                    setFetching(false);
                    setTextSearch(value);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    };

    const onChangeDistributor = (value) => {
        setDistributor(value);
    }

    const handleChangePage = (newPage) => {
        setPage(newPage);
        fetchCouponsByCampageID({ id: camSearchID, page: newPage, limit: rowsPerPage });
    };

    function handleChange(event) {
        setCamPackID(event);
    }

    const renderInfoDistributor = (presentee) => {
        if (!presentee) return "";
        return (
            <>
                <div className="text-primary clearfix">
                    <div className="pull-left">
                        {presentee.name}
                    </div>

                </div>
                <div className="text-muted">
                    <span className="icon-envelop2 position-left"></span><span className="text-size-small">{presentee.email}</span>
                </div>
                {(presentee.mobile) ? (
                    <div className="text-muted">
                        <span className="icon-mobile position-left"></span><span className="text-size-small">{presentee.mobile}</span>
                    </div>
                ) : ''}
            </>
        );
    }

    const onChangeCampaign = (value) => {
        if (value) {
            fetchCampaignDetail(value);
            setCamSearchID(value);
            setPage(1);
            setListCoupons({});
            fetchCouponsByCampageID({ id: value, page: 1, limit: rowsPerPage });
        }
        setData({
            ...dataAdd,
            campaign_id: value
        })
    }

    const fetCampainSearch = value => {
        setDataOptions([]);
        setFetching(true);
        makeRequest('get', `coupons/getall`, { name: value, limit: 25 })
            .then(({ data }) => {
                if (data.signal) {
                    let arrDistributor = data.data.map(it => {
                        return {
                            label: `${it.name}`,
                            value: it.id
                        }
                    })

                    setCampaign(arrDistributor);
                    setFetching(false);
                    setTextSearch(value);
                }
            })
            .catch(err => {
                console.log('++++++++++++++++', err)
            })
    };

    const onChangeTypeSelect = (value) => {
        setTypeSelect(value);
        setDistriLevel('');
    }

    const onChangeDistriLevel = (value) => {
        setDistriLevel(value);
        setDistributor('');
    }

    return (

        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="kt-section">
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label className="starDanger">Chọn chiến dịch</Form.Label>
                                            <Select
                                                showSearch
                                                value={dataAdd && dataAdd.campaign_id || ''}
                                                placeholder="Nhập chiến dịch"
                                                notFoundContent={fetching ? <Spin size="small" /> : textSearch ? 'Không có dữ liệu' : null}
                                                filterOption={false}
                                                onSearch={fetCampainSearch}
                                                onChange={onChangeCampaign}
                                                style={{ width: '100%' }}
                                            >
                                                {listCampaign.map(d => (
                                                    <Option key={`child-distri-${d.value}`} value={d.value}>{d.label}</Option>
                                                ))}
                                            </Select>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Thông tin chiến dịch:</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={2}>
                                            <Form.Label md={2} style={{ paddingLeft: '30px' }}>Ngày bắt đầu:</Form.Label>
                                        </Form.Group>
                                        <Form.Group as={Col} md={2}>
                                            <Form.Label md={4}>{formatTime(dataCampaign.startDate) || ''}</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={2}>
                                            <Form.Label md={2} style={{ paddingLeft: '30px' }}>Ngày kết thúc:</Form.Label>
                                        </Form.Group>
                                        <Form.Group as={Col} md={2}>
                                            <Form.Label md={4}>{formatTime(dataCampaign.endDate) || ''}</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label style={{ paddingLeft: '30px' }}>Giảm giá:</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        {dataCampaign && dataCampaign.campaignPackage && dataCampaign.campaignPackage.map(item => {
                                            return <Form.Group as={Col} md={12} key={`cam-package-${item.id}`}>
                                                <Form.Label style={{ paddingLeft: '60px' }}>Gói {item.packageData.name}: {item.number} {item.unit === 0 ? '%' : ' VNĐ'} </Form.Label>
                                            </Form.Group>
                                        })}
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Danh sách Coupons đã tạo:</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>NPP</TableCell>
                                                        <TableCell>Gói áp dụng</TableCell>
                                                        <TableCell>Giảm</TableCell>
                                                        <TableCell>Số lượng coupons</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {listCoupons.length ? listCoupons.map((row, key) => (
                                                        <TableRow key={`list-coupons-${key}`}>
                                                            <TableCell>
                                                                {renderInfoDistributor(row.distributor)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.campaignPackageData.packageData.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {`${row.campaignPackageData.number}${row.campaignPackageData.unit === 0 ? '%' : 'VNĐ'}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.total_coupons}
                                                            </TableCell>
                                                        </TableRow>
                                                    )) : (
                                                            <TableRow>
                                                                <TableCell colSpan={10} align="center">Không có dữ liệu</TableCell>
                                                            </TableRow>
                                                        )}
                                                </TableBody>
                                            </Table>
                                            {total > rowsPerPage && (
                                                <div className="custom-svg customSelector">
                                                    <Pagination className="pagination-crm" current={page} pageSize={rowsPerPage} total={total} onChange={(p, s) => handleChangePage(p)} />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label className="starDanger">Đối tượng nhận</Form.Label>
                                            <SelectForm
                                                optionData={[{ value: 1, label: 'Nhà phân phối được chọn' }, { value: 2, label: 'Cấp nhà phân phối' }]}
                                                keyString="value"
                                                labelString="label"
                                                placeholder=""
                                                value={typeSelect || 1}
                                                onChangeValue={(e) => onChangeTypeSelect(e)}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    {typeSelect === '1' ?
                                        <Form.Row>
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label className="starDanger">Chọn nhà phân phối</Form.Label>
                                                <Select
                                                    showSearch
                                                    value={distributor_id || ''}
                                                    placeholder="Nhập tên hoặc email nhà phân phối"
                                                    notFoundContent={fetching ? <Spin size="small" /> : textSearch ? 'Không có dữ liệu' : null}
                                                    filterOption={false}
                                                    onSearch={fetchDistributor}
                                                    onChange={onChangeDistributor}
                                                    style={{ width: '100%' }}
                                                >
                                                    {dataOptions.map(d => (
                                                        <Option key={`child-distri-${d.value}`} value={d.value}>{d.label}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Group>
                                        </Form.Row> : null}
                                    {typeSelect === '2' ?
                                        <Form.Row>
                                            <Form.Group as={Col} md={6}>
                                                <Form.Label className="starDanger">Cấp nhà phân phối</Form.Label>
                                                <SelectForm
                                                    optionData={[{ value: 1, label: 'Kim cương' }, { value: 2, label: 'Hồng ngọc' }, { value: 3, label: 'Vàng' }]}
                                                    keyString="value"
                                                    labelString="label"
                                                    placeholder=""
                                                    value={distriLevel || ''}
                                                    onChangeValue={(e) => onChangeDistriLevel(e)}
                                                />
                                            </Form.Group>
                                        </Form.Row> : null}
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Chọn gói áp dụng:</Form.Label>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <RadioGroup
                                            aria-label="cam-pack"
                                            name="cam-pack"
                                            value={camPackID}
                                            onChange={(e) => handleChange(e.target.value)}
                                        >
                                            {dataCampaign && dataCampaign.campaignPackage && dataCampaign.campaignPackage.map(option => (
                                                <FormControlLabel
                                                    value={option.id}
                                                    key={option.id}
                                                    control={<Radio />}
                                                    label={option.packageData.name}
                                                    checked={option.id == camPackID}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6}>
                                            <Form.Control
                                                type="number"
                                                placeholder="Nhập số lượng coupons"
                                                value={dataAdd.quantity || ''}
                                                ref={inputQuantityRef}
                                                onChange={(e) => onChangeValue('quantity', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Form.Row>
                                    <div className="kt-login__actions">
                                        <ButtonLoading type="submit" type="primary" className="btn btn-primary" loading={isloading}>Phân phối mã</ButtonLoading>
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

const mapStateToProps = ({ auth }) => ({
    user: auth.user
});

export default connect(mapStateToProps, null)(DonateCoupons);