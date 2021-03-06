import React from 'react';

const PackageLabel = (props) => {
    const { packageData } = props;
    let labelStr = 'primary';
    if (packageData.id == 1) {
        labelStr = 'primary';
    } else if (packageData.id == 2) {
        labelStr = 'success';
    } else if (packageData.id == 3) {
        labelStr = 'danger';
    } else if (packageData.id == 4) {
        labelStr = 'warning';
    }

    return (
        <p style={{marginBottom: '5px'}}>
            <span className={`btn btn-${labelStr} btn-bold btn-sm btn-icon-h`}>
                {packageData.name}
            </span>
        </p>
    )
}

export default PackageLabel;