import React, { useState } from "react";
import { Formik } from "formik";
import { connect } from "react-redux";
import { TextField } from "@material-ui/core";
import { Link, Redirect } from "react-router-dom";
import { FormattedMessage, injectIntl } from "react-intl";
import * as auth from "../../store/ducks/auth.duck";
import { confirmForgotPassword } from "../../crud/auth.crud";
import { showErrorMessage, showSuccessMessageIcon } from '../../actions/notification';

function ConfirmForgotPassword(props) {

    const [isRequested, setRequested] = useState(false);
    const { intl } = props;
    const passRef = React.createRef();
    const rePassRef = React.createRef();

    if (isRequested) {
        return <Redirect to="/auth" />;
    }

    return (
        <div className="kt-grid__item kt-grid__item--fluid  kt-grid__item--order-tablet-and-mobile-1  kt-login__wrapper">
            <div className="kt-login__body">
                <div className="kt-login__form">
                    <div className="kt-login__title">
                        <h3>
                            <FormattedMessage id="AUTH.FORGOT.CONFIRM" />
                        </h3>
                    </div>

                    <Formik
                        initialValues={{ password: "", rePassword: "" }}

                        onSubmit={(values, { setStatus, setSubmitting }) => {
                            if (!values.password) {
                                setSubmitting(false);
                                passRef.current.focus();
                                return showErrorMessage("Mật khẩu không được bỏ trống");
                            }

                            if (!values.rePassword) {
                                setSubmitting(false);
                                rePassRef.current.focus();
                                return showErrorMessage("Xác nhận mật khẩu không được bỏ trống");
                            }

                            if (values.password !== values.rePassword) {
                                setSubmitting(false);
                                passRef.current.focus();
                                return showErrorMessage("Xác nhận mật khẩu không trùng khớp");
                            }

                            let email = props.match.params.email;
                            let strConfirm = props.match.params.strConfirm;

                            confirmForgotPassword(email, strConfirm, values.password)
                                .then(({ data }) => {
                                    if (data.signal) {
                                        if (data.data == 1) {
                                            showSuccessMessageIcon("Đổi mật khẩu thành công. Vui lòng sử dụng mật khẩu mới để đăng nhập hệ thống")
                                            setRequested(true);
                                        } else if (data.data == 2) {
                                            setRequested(true);
                                            return showErrorMessage("Yêu cầu thất bại do phiên xác thực đã hết hạn");
                                        } else if (data.data == 3) {
                                            setRequested(true);
                                            return showErrorMessage("Người dùng không tồn tại")
                                        } else {
                                            setRequested(true);
                                            return showErrorMessage("Yêu cầu thất bại")
                                        }
                                    } else {
                                        setRequested(false);
                                        return showErrorMessage(data.message);
                                    }
                                })
                                .catch(() => {
                                    setSubmitting(false);
                                    setStatus(
                                        intl.formatMessage(
                                            { id: "AUTH.VALIDATION.NOT_FOUND" },
                                            { name: values.password }
                                        )
                                    );
                                });
                        }}
                    >
                        {({
                            values,
                            status,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting
                        }) => (
                                <form onSubmit={handleSubmit} className="kt-form">
                                    {status && (
                                        <div role="alert" className="alert alert-danger">
                                            <div className="alert-text">{status}</div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <TextField
                                            type="password"
                                            label="Mật khẩu"
                                            margin="normal"
                                            fullWidth={true}
                                            name="password"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.password}
                                            autoFocus
                                            inputRef={passRef}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <TextField
                                            type="password"
                                            label="Xác nhận mật khẩu"
                                            margin="normal"
                                            fullWidth={true}
                                            name="rePassword"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.rePassword}
                                            inputRef={rePassRef}
                                        />
                                    </div>

                                    <div className="kt-login__actions">
                                        <Link to="/auth">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-elevate kt-login__btn-secondary"
                                            >
                                                Quay lại
                                                </button>
                                        </Link>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-elevate kt-login__btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            Gửi yêu cầu
                                            </button>
                                    </div>
                                </form>
                            )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default injectIntl(connect(null, auth.actions)(ConfirmForgotPassword));
