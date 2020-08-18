import React, { useState, useEffect } from "react";
import { Button } from 'antd';
import {
    Portlet,
    PortletBody,
} from "../../partials/content/Portlet";
import makeRequest from '../../libs/request';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { showSuccessMessageIcon } from "../../actions/notification";
import checkPermission from '../../libs/permission';
import { Redirect } from "react-router-dom";

export default function Gem(props) {
    const [gemImg, setImg] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileUpload, setFileUpload] = useState(null);
    const [isRefuse, setRefuse] = useState(false);
    const [isFirstLoad, setFirstLoad] = useState(false);

    const permissions = {
        getGemQR: 'get-gem-qr'
    }

    useEffect(() => {
        let check = checkPermission(permissions.getGemQR);
        if (check == 1) {
            makeRequest('get', `distributor/getGem`, {})
                .then(({ data }) => {
                    if (data.signal) {
                        const res = data.data;
                        setImg(res);
                    }
                })
                .catch(err => {
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

    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Định dạng file không hợp lệ');
        } else {
            let url = window.URL.createObjectURL(file);
            setImg(url);
            setFileUpload(file);
        }
        return false;
    }

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('file', fileUpload);

        setLoading(true);

        makeRequest('post', `distributor/uploadGem`, formData)
            .then(({ data }) => {
                setLoading(false);
                if (data.signal) {
                    showSuccessMessageIcon('Upload ảnh Gem QR thành công');
                    setImg(data.data);
                }
            }).then(() => {
                setFileUpload(null);
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            })
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className="ant-upload-text">Upload</div>
        </div>
    );

    return (
        <>
            <Portlet>
                <PortletBody fit={true}>
                    <div className="row row-col-separator-xl">
                        <div className="col-md-12 justify-content-center text-center" style={{ padding: '30px' }}>
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action=""
                                beforeUpload={beforeUpload}
                                className="ant-gem"
                            >
                                {gemImg ? <img src={gemImg} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                            </Upload>
                            <div>
                                <Button
                                    type="primary"
                                    onClick={handleUpload}
                                    disabled={!fileUpload ? true : false}
                                    loading={loading}
                                    style={{ marginTop: 16 }}
                                >
                                    {loading ? 'Đang tải lên' : 'Tải lên'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </PortletBody>
            </Portlet>
        </>
    );
}