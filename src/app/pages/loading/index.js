import React from 'react';
import './loading.css'

function Loading() {
  return <div style={{ display: 'flex', justifyContent: 'center', minHeight:'calc(100vh - 65px - 105px)',alignItems:'center' }}><div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
}

export default Loading
