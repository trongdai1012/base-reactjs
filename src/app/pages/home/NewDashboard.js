import React from "react";
import { Result, Button } from 'antd';
import {
  Portlet,
  PortletBody,
} from "../../partials/content/Portlet";

export default function Dashboard(props) {

  return (
    <>
      <Portlet>
        <PortletBody fit={true}>
          <div className="row row-no-padding row-col-separator-xl">
            <div className="col-md-12">
                <Result
                    title="Tính năng đang phát triển"
                    extra={
                    <Button type="primary" key="console" onClick={() => { props.history.push('/order') }}>
                        Xem đơn hàng
                    </Button>
                    }
                />
            </div>
          </div>
        </PortletBody>
      </Portlet>
    </>
  );
}
