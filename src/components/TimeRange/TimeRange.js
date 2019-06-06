import React from 'react';

const timeRange = (props) => (
    <button id={props.timeRangeID} onClick={props.controlClickTimeRange}>
        {props.timeRangeName}
    </button>
);

export default timeRange;
